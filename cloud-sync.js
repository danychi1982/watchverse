/* Minimal Supabase REST sync layer. The publishable key is safe for browser use; RLS protects rows. */
(function (root) {
  'use strict';

  const config = root.WATCHVERSE_CONFIG || {};
  const auth = () => root.WatchverseAuth;
  const configured = () => !!(config.supabaseUrl && config.supabaseAnonKey && auth()?.getSession()?.access_token);
  const base = () => `${String(config.supabaseUrl || '').replace(/\/$/, '')}/rest/v1`;
  const headers = (extra = {}) => {
    const session = auth()?.getSession();
    return { apikey: config.supabaseAnonKey, Authorization: `Bearer ${session?.access_token || ''}`, 'Content-Type': 'application/json', ...extra };
  };

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(`${base()}${path}`, { ...options, signal: controller.signal, headers: headers(options.headers) });
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('Timeout durante la sincronizzazione cloud.');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    let data = null;
    try { data = await response.json(); } catch { /* empty response */ }
    if (!response.ok) throw new Error(data?.message || data?.hint || 'Sincronizzazione cloud non riuscita.');
    return data;
  }

  async function requestAll(path, pageSize = 1000) {
    const rows = [];
    const parallelPages = 4;
    for (let offset = 0; ; offset += pageSize * parallelPages) {
      const pages = await Promise.all(Array.from({ length: parallelPages }, (_, index) => {
        const separator = path.includes('?') ? '&' : '?';
        return request(`${path}${separator}limit=${pageSize}&offset=${offset + index * pageSize}`);
      }));
      for (const page of pages) rows.push(...(Array.isArray(page) ? page : []));
      if (pages.some(page => !Array.isArray(page) || page.length < pageSize)) return rows;
    }
  }

  function accountId() { return auth()?.getSession()?.user?.id || null; }
  function isEnabled() { return configured() && !!accountId(); }
  function profileId(profile) { return profile?.cloudId || null; }

  async function bootstrapProfiles(localProfiles = []) {
    if (!isEnabled()) return localProfiles;
    const account = accountId();
    let rows = await request(`/profiles?select=id,account_id,local_id,name,role,avatar_type,avatar_value,pin_hash,pin_salt,created_at,updated_at&account_id=eq.${encodeURIComponent(account)}&order=created_at.asc`);
    const byLocalId = new Map(rows.map(row => [row.local_id, row]));
    const missing = localProfiles.filter(profile => !byLocalId.has(profile.id));
    if (missing.length) {
      const payload = missing.map(profile => ({
        account_id: account, local_id: profile.id, name: profile.name, role: profile.role || 'member',
        avatar_type: profile.avatarType || 'emoji', avatar_value: profile.avatarValue || null,
        pin_hash: profile.pinHash || null, pin_salt: profile.pinSalt || null
      }));
      await request('/profiles', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) });
      rows = await request(`/profiles?select=id,account_id,local_id,name,role,avatar_type,avatar_value,pin_hash,pin_salt,created_at,updated_at&account_id=eq.${encodeURIComponent(account)}&order=created_at.asc`);
    }
    const localById = new Map(localProfiles.map(profile => [profile.id, profile]));
    return rows.map(row => ({
      ...(localById.get(row.local_id) || {}), id: row.local_id, cloudId: row.id, accountId: row.account_id,
      name: row.name, initial: row.name?.[0]?.toUpperCase() || '?', role: row.role,
      avatarType: row.avatar_type, avatarValue: row.avatar_value, pinHash: row.pin_hash, pinSalt: row.pin_salt,
      createdAt: row.created_at, updatedAt: row.updated_at
    }));
  }

  async function saveProfiles(profiles = []) {
    if (!isEnabled()) return;
    // Risolviamo solo l'identita' cloud mancante, preservando i valori locali
    // appena modificati (in particolare pin_hash e pin_salt).
    if (profiles.some(profile => !profileId(profile))) {
      const resolved = await bootstrapProfiles(profiles);
      const localById = new Map(profiles.map(profile => [profile.id, profile]));
      for (const cloudProfile of resolved) {
        const localProfile = localById.get(cloudProfile.id);
        if (!localProfile || profileId(localProfile)) continue;
        localProfile.cloudId = cloudProfile.cloudId;
        localProfile.accountId = cloudProfile.accountId;
      }
    }
    for (const profile of profiles) {
      if (!profileId(profile)) continue;
      const updated = await request(`/profiles?id=eq.${encodeURIComponent(profile.cloudId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
          name: profile.name, avatar_type: profile.avatarType || 'emoji', avatar_value: profile.avatarValue || null,
          pin_hash: profile.pinHash || null, pin_salt: profile.pinSalt || null
        })
      });
      if (Array.isArray(updated) && updated.length === 0) {
        throw new Error('Il profilo cloud non e\u0027 stato aggiornato. Verifica il collegamento del profilo in Supabase.');
      }
    }
    return profiles;
  }

  function libraryPayload(value) {
    const copy = structuredClone(value); delete copy.cloudId; return copy;
  }

  function rowsForStore(profile, store, values = []) {
    if (!profileId(profile)) return [];
    if (store === 'series' || store === 'movies') {
      return values.filter(value => value?.profileId === profile.id).map(value => ({
          profile_id: profile.cloudId, kind: store === 'series' ? 'series' : 'movie', local_id: value.id,
          payload: libraryPayload(value), revision: Number(value.revision || 1), updated_at: value.updatedAt || new Date().toISOString()
      }));
    } else if (store === 'progress') {
      return values.filter(value => value?.profileId === profile.id).map(value => ({
          profile_id: profile.cloudId, local_id: value.id, series_local_id: value.seriesId || '', season: Number(value.season || 0),
          episode: Number(value.episode || 0), watched: value.watched !== false, watched_at: value.watchedAt || null,
          rating: value.rating || null, payload: libraryPayload(value), revision: Number(value.revision || 1), updated_at: value.updatedAt || new Date().toISOString()
      }));
    }
    return [];
  }

  async function pushRecord(profile, store, value) {
    return pushRecords(profile, store, [value]);
  }

  async function pushRecords(profile, store, values = []) {
    if (!isEnabled() || !profileId(profile)) return;
    const rows = rowsForStore(profile, store, values);
    if (!rows.length) return;
    const path = store === 'progress' ? '/episode_progress?on_conflict=profile_id,series_local_id,season,episode' : '/library_records?on_conflict=profile_id,kind,local_id';
    const key = row => store === 'progress'
      ? `${row.series_local_id}|${row.season}|${row.episode}`
      : `${row.kind}|${row.local_id}`;
    const remotePath = store === 'progress'
      ? `/episode_progress?select=local_id,series_local_id,season,episode,revision,updated_at,deleted_at&profile_id=eq.${encodeURIComponent(profile.cloudId)}`
      : `/library_records?select=local_id,kind,revision,updated_at,deleted_at&profile_id=eq.${encodeURIComponent(profile.cloudId)}`;
    const remote = await requestAll(remotePath);
    const remoteByKey = new Map(remote.map(row => [key(row), row]));
    const upload = [];
    for (const row of rows) {
      const current = remoteByKey.get(key(row));
      if (!current) {
        upload.push(row);
        continue;
      }
      const localTime = Date.parse(row.updated_at || '') || 0;
      const cloudTime = Date.parse(current.updated_at || '') || 0;
      const localRevision = Number(row.revision || 1);
      const cloudRevision = Number(current.revision || 1);
      const localWins = localTime > cloudTime || (localTime === cloudTime && localRevision > cloudRevision);
      if (localWins) upload.push(row);
      else if (localRevision !== cloudRevision || Boolean(row.deleted_at) !== Boolean(current.deleted_at)) {
        await recordConflict(profile, store, { id: row.local_id, revision: localRevision }, { id: row.local_id, revision: cloudRevision }, 'cloud_won');
      }
    }
    if (!upload.length) return { uploaded: 0, skipped: rows.length };
    const chunkSize = store === 'progress' ? 300 : 80;
    for (let i = 0; i < upload.length; i += chunkSize) {
      await request(path, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(upload.slice(i, i + chunkSize)) });
    }
    return { uploaded: upload.length, skipped: rows.length - upload.length };
  }

  async function recordConflict(profile, store, localValue, cloudValue, resolution) {
    if (!isEnabled() || !profileId(profile) || !localValue || !cloudValue) return;
    try {
      await request('/sync_conflicts', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          profile_id: profile.cloudId,
          store_name: store,
          local_id: localValue.id || cloudValue.id,
          local_revision: Number(localValue.revision || 1),
          cloud_revision: Number(cloudValue.revision || 1),
          resolution
        })
      });
    } catch (error) { console.warn('Watchverse sync conflict log:', error); }
  }

  async function deleteRecord(profile, store, value) {
    if (!isEnabled() || !profileId(profile) || !value) return;
    const deletedAt = new Date().toISOString();
    const revision = Number(value.revision || 0) + 1;
    if (store === 'series' || store === 'movies') {
      const kind = store === 'series' ? 'series' : 'movie';
      const existing = await request(`/library_records?select=revision,updated_at&profile_id=eq.${encodeURIComponent(profile.cloudId)}&kind=eq.${kind}&local_id=eq.${encodeURIComponent(value.id)}`);
      const remote = existing?.[0];
      if (remote && (Date.parse(remote.updated_at || '') || 0) > (Date.parse(value.updatedAt || '') || 0)) return { skipped: true };
      await request('/library_records?on_conflict=profile_id,kind,local_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ profile_id: profile.cloudId, kind, local_id: value.id, payload: libraryPayload(value), deleted_at: deletedAt, revision, updated_at: deletedAt }) });
    } else if (store === 'progress') {
      const seriesId = value.seriesId || '';
      const existing = await request(`/episode_progress?select=revision,updated_at&profile_id=eq.${encodeURIComponent(profile.cloudId)}&series_local_id=eq.${encodeURIComponent(seriesId)}&season=eq.${Number(value.season || 0)}&episode=eq.${Number(value.episode || 0)}`);
      const remote = existing?.[0];
      if (remote && (Date.parse(remote.updated_at || '') || 0) > (Date.parse(value.updatedAt || '') || 0)) return { skipped: true };
      await request('/episode_progress?on_conflict=profile_id,series_local_id,season,episode', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ profile_id: profile.cloudId, local_id: value.id, series_local_id: seriesId, season: Number(value.season || 0), episode: Number(value.episode || 0), watched: false, payload: libraryPayload(value), deleted_at: deletedAt, revision, updated_at: deletedAt }) });
    }
    return { skipped: false };
  }

  async function pullProfile(profile, options = {}) {
    if (!isEnabled() || !profileId(profile)) return null;
    const onlyProgress = options.onlyProgress === true;
    const skipProgress = options.skipProgress === true;
    let cloudId = profile.cloudId;
    const id = () => encodeURIComponent(cloudId);
    let libraryResult = await Promise.allSettled([
      onlyProgress ? Promise.resolve([]) : requestAll(`/library_records?select=local_id,kind,payload,revision,updated_at,deleted_at&profile_id=eq.${id()}`)
    ]);
    if (!onlyProgress && libraryResult[0].status === 'fulfilled' && libraryResult[0].value.length === 0) {
      // Compatibilita per importazioni create prima del riallineamento degli UUID
      // cloud: il prefisso local_id identifica ancora senza ambiguita il profilo.
      const prefix = encodeURIComponent(`${profile.id}|%`);
      const legacyRows = await request(`/library_records?select=profile_id,local_id&local_id=like.${prefix}&limit=1`);
      if (legacyRows?.[0]?.profile_id && legacyRows[0].profile_id !== cloudId) {
        cloudId = legacyRows[0].profile_id;
        profile.cloudId = cloudId;
        libraryResult = await Promise.allSettled([
          requestAll(`/library_records?select=local_id,kind,payload,revision,updated_at,deleted_at&profile_id=eq.${id()}`)
        ]);
      }
    }
    const [progressResult, settingsResult] = await Promise.allSettled([
      skipProgress ? Promise.resolve([]) : requestAll(`/episode_progress?select=local_id,series_local_id,season,episode,watched,watched_at,rating,payload,revision,updated_at,deleted_at&profile_id=eq.${id()}`),
      onlyProgress ? Promise.resolve([]) : request(`/profile_settings?select=payload,revision,updated_at&profile_id=eq.${id()}`)
    ]);
    const libraryResultValue = libraryResult[0];
    if (libraryResultValue.status === 'rejected') throw libraryResultValue.reason;
    const library = libraryResultValue.value;
    const progress = progressResult.status === 'fulfilled' ? progressResult.value : [];
    const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : [];
    const records = { series: [], movies: [], progress: [], deleted: { series: [], movies: [], progress: [] } };
    for (const row of library || []) {
      const store = row.kind === 'series' ? 'series' : 'movies';
      const value = { ...(row.payload || {}), id: row.local_id, profileId: profile.id, revision: Number(row.revision || 1), updatedAt: row.updated_at };
      (row.deleted_at ? records.deleted[store] : records[store]).push(value);
    }
    for (const row of progress || []) {
      const value = { ...(row.payload || {}), id: row.local_id, profileId: profile.id, seriesId: row.series_local_id, season: row.season, episode: row.episode, watched: row.watched, watchedAt: row.watched_at, rating: row.rating, revision: Number(row.revision || 1), updatedAt: row.updated_at };
      (row.deleted_at ? records.deleted.progress : records.progress).push(value);
    }
    return {
      ...records,
      settings: settings?.[0]?.payload || null,
      settingsMeta: settings?.[0] ? { revision: Number(settings[0].revision || 1), updatedAt: settings[0].updated_at } : null,
      warnings: {
        progress: skipProgress ? null : (progressResult.status === 'rejected' ? progressResult.reason?.message || 'Progresso episodi non disponibile.' : null),
        settings: settingsResult.status === 'rejected' ? settingsResult.reason?.message || 'Impostazioni cloud non disponibili.' : null
      }
    };
  }

  async function saveSettings(profile, settings) {
    if (!isEnabled() || !profileId(profile)) return;
    const localRevision = Number(settings.revision || 1);
    const localUpdatedAt = settings.updatedAt || new Date().toISOString();
    const remote = await request(`/profile_settings?select=revision,updated_at&profile_id=eq.${encodeURIComponent(profile.cloudId)}`);
    const current = remote?.[0];
    if (current) {
      const localTime = Date.parse(localUpdatedAt) || 0;
      const cloudTime = Date.parse(current.updated_at || '') || 0;
      if (cloudTime > localTime || (cloudTime === localTime && Number(current.revision || 1) >= localRevision)) {
        if (Number(current.revision || 1) !== localRevision) await recordConflict(profile, 'settings', { id: 'settings', revision: localRevision }, { id: 'settings', revision: Number(current.revision || 1) }, 'cloud_won');
        return { skipped: true };
      }
    }
    await request('/profile_settings?on_conflict=profile_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ profile_id: profile.cloudId, payload: structuredClone(settings), revision: localRevision, updated_at: localUpdatedAt }) });
    return { skipped: false };
  }

  root.WatchverseCloudSync = { isEnabled, bootstrapProfiles, saveProfiles, pushRecord, pushRecords, deleteRecord, pullProfile, saveSettings, recordConflict };
})(window);
