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
    const response = await fetch(`${base()}${path}`, { ...options, headers: headers(options.headers) });
    let data = null;
    try { data = await response.json(); } catch { /* empty response */ }
    if (!response.ok) throw new Error(data?.message || data?.hint || 'Sincronizzazione cloud non riuscita.');
    return data;
  }

  async function requestAll(path, pageSize = 1000) {
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const separator = path.includes('?') ? '&' : '?';
      const page = await request(`${path}${separator}limit=${pageSize}&offset=${offset}`);
      rows.push(...(Array.isArray(page) ? page : []));
      if (!Array.isArray(page) || page.length < pageSize) return rows;
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
    for (const profile of profiles) {
      if (!profileId(profile)) continue;
      await request(`/profiles?id=eq.${encodeURIComponent(profile.cloudId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({
          name: profile.name, avatar_type: profile.avatarType || 'emoji', avatar_value: profile.avatarValue || null,
          pin_hash: profile.pinHash || null, pin_salt: profile.pinSalt || null
        })
      });
    }
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
    const chunkSize = store === 'progress' ? 300 : 80;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await request(path, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows.slice(i, i + chunkSize)) });
    }
  }

  async function deleteRecord(profile, store, value) {
    if (!isEnabled() || !profileId(profile) || !value) return;
    if (store === 'series' || store === 'movies') {
      await request(`/library_records?profile_id=eq.${encodeURIComponent(profile.cloudId)}&kind=eq.${store === 'series' ? 'series' : 'movie'}&local_id=eq.${encodeURIComponent(value.id)}`, { method: 'DELETE' });
    } else if (store === 'progress') {
      await request(`/episode_progress?profile_id=eq.${encodeURIComponent(profile.cloudId)}&series_local_id=eq.${encodeURIComponent(value.seriesId || '')}&season=eq.${Number(value.season || 0)}&episode=eq.${Number(value.episode || 0)}`, { method: 'DELETE' });
    }
  }

  async function pullProfile(profile) {
    if (!isEnabled() || !profileId(profile)) return null;
    let cloudId = profile.cloudId;
    const id = () => encodeURIComponent(cloudId);
    let libraryResult = await Promise.allSettled([
      requestAll(`/library_records?select=local_id,kind,payload,updated_at&profile_id=eq.${id()}&deleted_at=is.null`)
    ]);
    if (libraryResult[0].status === 'fulfilled' && libraryResult[0].value.length === 0) {
      // Compatibilita per importazioni create prima del riallineamento degli UUID
      // cloud: il prefisso local_id identifica ancora senza ambiguita il profilo.
      const prefix = encodeURIComponent(`${profile.id}|%`);
      const legacyRows = await request(`/library_records?select=profile_id,local_id&local_id=like.${prefix}&deleted_at=is.null&limit=1`);
      if (legacyRows?.[0]?.profile_id && legacyRows[0].profile_id !== cloudId) {
        cloudId = legacyRows[0].profile_id;
        profile.cloudId = cloudId;
        libraryResult = await Promise.allSettled([
          requestAll(`/library_records?select=local_id,kind,payload,updated_at&profile_id=eq.${id()}&deleted_at=is.null`)
        ]);
      }
    }
    const [progressResult, settingsResult] = await Promise.allSettled([
      requestAll(`/episode_progress?select=local_id,series_local_id,season,episode,watched,watched_at,rating,payload,updated_at&profile_id=eq.${id()}&deleted_at=is.null`),
      request(`/profile_settings?select=payload,updated_at&profile_id=eq.${id()}`)
    ]);
    const libraryResultValue = libraryResult[0];
    if (libraryResultValue.status === 'rejected') throw libraryResultValue.reason;
    const library = libraryResultValue.value;
    const progress = progressResult.status === 'fulfilled' ? progressResult.value : [];
    const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : [];
    const records = { series: [], movies: [], progress: [] };
    for (const row of library || []) {
      const value = { ...(row.payload || {}), id: row.local_id, profileId: profile.id, updatedAt: row.updated_at };
      records[row.kind === 'series' ? 'series' : 'movies'].push(value);
    }
    for (const row of progress || []) records.progress.push({ ...(row.payload || {}), id: row.local_id, profileId: profile.id, seriesId: row.series_local_id, season: row.season, episode: row.episode, watched: row.watched, watchedAt: row.watched_at, rating: row.rating, updatedAt: row.updated_at });
    return {
      ...records,
      settings: settings?.[0]?.payload || null,
      warnings: {
        progress: progressResult.status === 'rejected' ? progressResult.reason?.message || 'Progresso episodi non disponibile.' : null,
        settings: settingsResult.status === 'rejected' ? settingsResult.reason?.message || 'Impostazioni cloud non disponibili.' : null
      }
    };
  }

  async function saveSettings(profile, settings) {
    if (!isEnabled() || !profileId(profile)) return;
    await request('/profile_settings?on_conflict=profile_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ profile_id: profile.cloudId, payload: structuredClone(settings), updated_at: new Date().toISOString() }) });
  }

  root.WatchverseCloudSync = { isEnabled, bootstrapProfiles, saveProfiles, pushRecord, pushRecords, deleteRecord, pullProfile, saveSettings };
})(window);
