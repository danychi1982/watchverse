/* Watchverse GDPR importer - TV Time export parser */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WatchverseGDPR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SENSITIVE_FILES = [
    'access_token.csv', 'refresh_token.csv', 'device_token.csv', 'ip_address.csv',
    'auth-prod-login.csv', 'user.csv', 'user_device.csv', 'device_data.csv',
    'webhook_data.csv', 'ad_identifier.csv', '_appsflyer_ids.csv', 'installed_app.csv'
  ];

  const RECOGNIZED_FILES = [
    'tracking-prod-records-v2.csv', 'tracking-prod-records.csv', 'followed_tv_show.csv',
    'user_tv_show_data.csv', 'lists-prod-lists.csv', 'ratings-live-votes.csv',
    'stats-prod-cache.csv', 'user_statistics.csv'
  ];

  const TVTIME_LEGACY_RATING_MAP = Object.freeze({ '1': 1, '27': 2, '28': 3, '29': 4, '3': 5 });
  function legacyVoteCodeToRating(code) { return TVTIME_LEGACY_RATING_MAP[String(code || '').trim()] || 0; }

  const slug = (s = '') => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'senza-titolo';

  function parseCSV(text) {
    text = String(text || '').replace(/^\uFEFF/, '');
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else {
        if (c === '"') quoted = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map(h => h.trim());
    return rows.filter(r => r.some(v => String(v).trim())).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
  }

  function truthy(v) { return ['1', 'true', 'yes', 'y'].includes(String(v ?? '').trim().toLowerCase()); }
  function number(v, fallback = null) { const n = Number(v); return Number.isFinite(n) && String(v).trim() !== '' ? n : fallback; }
  function yearFromDate(v) { const m = String(v || '').match(/^(\d{4})/); return m && m[1] !== '0001' ? Number(m[1]) : null; }
  function secToMinutes(v) { const n = number(v, null); return n == null ? null : Math.max(1, Math.round(n / 60)); }
  function toIso(v) {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    if (/^\d+(?:\.\d+)?$/.test(s)) {
      let n = Number(s);
      if (n > 1e14) n /= 1e6;       // microseconds
      else if (n > 1e11) n /= 1e3; // milliseconds
      const d = new Date(n * 1000);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    const d = new Date(s.replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? '' : 'Z'));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  function basename(path) { return String(path || '').split('/').pop(); }
  function parseFiles(entries) {
    const out = {};
    for (const entry of entries || []) {
      const name = basename(entry.name).toLowerCase();
      if (!name.endsWith('.csv')) continue;
      const text = typeof entry.text === 'function' ? entry.text() : String(entry.text || entry.content || '');
      out[name] = parseCSV(text);
    }
    return out;
  }

  function extractMaps(value) {
    const text = String(value || '');
    const result = [];
    const re = /map\[([^\]]+)\]/g;
    let m;
    while ((m = re.exec(text))) {
      const body = m[1];
      const obj = {};
      const tokenRe = /(\w[\w-]*):([^\s\]]+)/g;
      let t;
      while ((t = tokenRe.exec(body))) obj[t[1]] = t[2] === '<nil>' ? '' : t[2];
      result.push(obj);
    }
    return result;
  }

  function buildPlan(entries) {
    const available = (entries || []).map(entry => basename(entry.name).toLowerCase()).filter(name => name.endsWith('.csv'));
    const recognized = available.filter(name => RECOGNIZED_FILES.includes(name));
    if (!recognized.length) throw new Error('Lo ZIP non contiene i file TV Time GDPR riconosciuti.');
    // Per velocizzare l’anteprima vengono letti solo i CSV necessari alla libreria.
    // I file sensibili e quelli tecnici restano elencati, ma non vengono mai analizzati.
    const relevantEntries = (entries || []).filter(entry => recognized.includes(basename(entry.name).toLowerCase()));
    const files = parseFiles(relevantEntries);

    const favoriteSeriesIds = new Set();
    const favoriteMovieUuids = new Set();
    for (const row of files['lists-prod-lists.csv'] || []) {
      const key = String(row.s_key || '').toLowerCase();
      if (key === 'favorite-series') {
        for (const obj of extractMaps(row.objects)) if (obj.id) favoriteSeriesIds.add(String(obj.id));
      } else if (key === 'favorite-movies') {
        for (const obj of extractMaps(row.objects)) if (obj.uuid) favoriteMovieUuids.add(String(obj.uuid));
      }
    }

    const userSeries = new Map();
    for (const row of files['user_tv_show_data.csv'] || []) {
      const id = String(row.tv_show_id || '');
      if (!id) continue;
      userSeries.set(id, {
        title: row.tv_show_name || '',
        followed: truthy(row.is_followed),
        favorite: truthy(row.is_favorited),
        watchedCount: number(row.nb_episodes_seen, 0)
      });
      if (truthy(row.is_favorited)) favoriteSeriesIds.add(id);
    }

    const followedSeries = new Map();
    for (const row of files['followed_tv_show.csv'] || []) {
      const id = String(row.tv_show_id || '');
      if (!id) continue;
      followedSeries.set(id, {
        title: row.tv_show_name || '',
        followed: truthy(row.active),
        archived: truthy(row.archived),
        followedAt: toIso(row.created_at || row.updated_at)
      });
    }

    const seriesMap = new Map();
    const ensureSeries = (tvdbId, title) => {
      const key = tvdbId ? `tvdb:${tvdbId}` : `title:${slug(title)}`;
      if (!seriesMap.has(key)) {
        const us = tvdbId ? userSeries.get(String(tvdbId)) : null;
        const fs = tvdbId ? followedSeries.get(String(tvdbId)) : null;
        seriesMap.set(key, {
          sourceKey: key,
          mediaType: 'tv',
          title: title || us?.title || fs?.title || 'Serie senza titolo',
          year: null,
          tvdbId: number(tvdbId, null),
          overview: 'Importata dall’esportazione GDPR di TV Time. Collega i metadati per ottenere descrizione, cast e calendario.',
          genres: [],
          status: (us?.watchedCount || 0) > 0 ? 'watching' : 'watchlist',
          favorite: !!(tvdbId && favoriteSeriesIds.has(String(tvdbId))) || !!us?.favorite,
          rating: 0,
          source: 'tvtime-gdpr',
          sourceFollowed: us?.followed ?? fs?.followed ?? true,
          sourceArchived: fs?.archived ?? false,
          followedAt: fs?.followedAt || null,
          sourceWatchedCount: us?.watchedCount || 0,
          seasons: []
        });
      }
      return seriesMap.get(key);
    };

    const v2 = files['tracking-prod-records-v2.csv'] || [];
    let sourceStats = null;
    for (const row of v2) {
      if (row.key === 'tracking-stats') {
        sourceStats = {
          episodes: number(row.ep_watch_count, 0),
          movies: number(row.movie_watch_count, 0),
          series: number(row.series_follow_count, 0),
          seriesRuntimeSeconds: number(row.total_series_runtime, 0),
          movieRuntimeSeconds: number(row.total_movies_runtime, 0)
        };
        continue;
      }
      if (row.uuid && row.series_name) {
        const s = ensureSeries(row.s_id, row.series_name);
        s.sourceUuid = row.uuid;
        s.sourceWatchedCount = number(row.ep_watch_count, s.sourceWatchedCount || 0);
        s.status = s.sourceWatchedCount > 0 ? 'watching' : (truthy(row.is_for_later) ? 'watchlist' : 'watchlist');
        s.sourceFollowed = truthy(row.is_followed);
        s.sourceArchived = truthy(row.is_archived);
        s.followedAt = toIso(row.followed_at) || s.followedAt;
      }
    }

    // Ensure followed-only series are not lost.
    for (const [id, data] of userSeries) ensureSeries(id, data.title);
    for (const [id, data] of followedSeries) ensureSeries(id, data.title);

    const progress = [];
    const progressSeen = new Map();
    for (const row of v2) {
      if (!row.episode_id || !row.series_name) continue;
      const season = number(row.season_number !== '' ? row.season_number : row.s_no, null);
      const episode = number(row.episode_number || row.ep_no, 0);
      if (season == null || !episode) continue;
      const s = ensureSeries(row.s_id, row.series_name);
      let seasonObj = s.seasons.find(x => Number(x.number) === season);
      if (!seasonObj) { seasonObj = { number: season, name: season === 0 ? 'Speciali' : `Stagione ${season}`, episodes: [] }; s.seasons.push(seasonObj); }
      let ep = seasonObj.episodes.find(x => Number(x.episode) === episode);
      const runtime = secToMinutes(row.runtime) || 50;
      if (!ep) {
        ep = {
          id: `tvtime-episode-${row.episode_id}`,
          season,
          episode,
          title: `Episodio ${episode}`,
          overview: '',
          runtime,
          airDate: null,
          tvdbId: number(row.episode_id, null),
          source: 'tvtime-gdpr'
        };
        seasonObj.episodes.push(ep);
      }
      const pkey = `${s.sourceKey}|${season}|${episode}`;
      const watchedAt = toIso(row.created_at || row.updated_at || String(row.gsi || '').replace('watch-episode-', ''));
      const candidate = {
        sourceSeriesKey: s.sourceKey,
        season,
        episode,
        title: ep.title,
        runtime,
        watched: true,
        watchedAt,
        tvdbId: ep.tvdbId,
        rewatchCount: number(row.rewatch_count, 0),
        source: 'tvtime-gdpr'
      };
      const existing = progressSeen.get(pkey);
      if (!existing || (candidate.watchedAt && (!existing.watchedAt || candidate.watchedAt > existing.watchedAt))) progressSeen.set(pkey, candidate);
    }
    progress.push(...progressSeen.values());

    // Older record table is authoritative for movies and supplements old episode history.
    const moviesMap = new Map();
    const oldRows = files['tracking-prod-records.csv'] || [];
    for (const row of oldRows) {
      if (row.entity_type !== 'movie' || !row.uuid) continue;
      const id = String(row.uuid);
      let m = moviesMap.get(id);
      if (!m) {
        m = {
          sourceKey: `uuid:${id}`,
          sourceUuid: id,
          mediaType: 'movie',
          title: row.movie_name || 'Film senza titolo',
          year: yearFromDate(row.release_date),
          overview: 'Importato dall’esportazione GDPR di TV Time. Collega i metadati per ottenere descrizione, cast e piattaforme.',
          genres: [], runtime: secToMinutes(row.runtime),
          watched: false, state: 'watchlist', watchedAt: null,
          favorite: favoriteMovieUuids.has(id), rating: 0, notes: '',
          source: 'tvtime-gdpr', sourceFollowed: false, sourceToWatch: false
        };
        moviesMap.set(id, m);
      }
      if (row.movie_name) m.title = row.movie_name;
      if (!m.year) m.year = yearFromDate(row.release_date);
      if (!m.runtime) m.runtime = secToMinutes(row.runtime);
      if (row.type === 'follow') { m.sourceFollowed = true; m.addedAt = toIso(row.created_at); }
      if (row.type === 'towatch') { m.sourceToWatch = true; m.state = 'watchlist'; }
      if (row.type === 'watch') {
        m.watched = true; m.state = 'watched';
        const candidateWatchedAt = toIso(row.watch_date) || toIso(row.created_at || row.updated_at);
        if (candidateWatchedAt && (!m.watchedAt || candidateWatchedAt > m.watchedAt)) m.watchedAt = candidateWatchedAt;
        m.rewatchCount = Math.max(number(row.rewatch_count, 0), number(m.rewatchCount, 0));
      }
    }

    const legacyVotes = new Map();
    for (const row of files['ratings-live-votes.csv'] || []) {
      if (!row.uuid) continue;
      const match = String(row.vote_key || '').match(/-(\d+)$/);
      legacyVotes.set(String(row.uuid), match ? match[1] : '');
    }
    for (const [id, code] of legacyVotes) {
      const m = moviesMap.get(id);
      if (m) { m.legacyVoteCode = code; m.rating = legacyVoteCodeToRating(code); m.ratingSource = 'tvtime-legacy'; }
    }

    for (const s of seriesMap.values()) {
      s.seasons.sort((a, b) => a.number - b.number);
      for (const season of s.seasons) season.episodes.sort((a, b) => a.episode - b.episode);
    }

    const ignoredSensitive = available.filter(n => SENSITIVE_FILES.includes(n));
    const unrecognized = available.filter(n => !recognized.includes(n) && !ignoredSensitive.includes(n));
    return {
      source: 'TV Time GDPR ZIP',
      filesFound: available,
      recognizedFiles: recognized,
      ignoredSensitive,
      unrecognized,
      series: [...seriesMap.values()],
      movies: [...moviesMap.values()],
      progress,
      sourceStats,
      counts: {
        series: seriesMap.size,
        movies: moviesMap.size,
        watchedMovies: [...moviesMap.values()].filter(x => x.watched).length,
        watchlistMovies: [...moviesMap.values()].filter(x => !x.watched || x.sourceToWatch).length,
        episodes: progress.length,
        favoriteSeries: [...seriesMap.values()].filter(x => x.favorite).length,
        favoriteMovies: [...moviesMap.values()].filter(x => x.favorite).length,
        legacyMovieVotes: [...moviesMap.values()].filter(x => x.legacyVoteCode).length,
        followedSeries: [...seriesMap.values()].filter(x => x.sourceFollowed !== false).length,
        watchlistSeries: [...seriesMap.values()].filter(x => x.status === 'watchlist').length,
        importableTotal: seriesMap.size + moviesMap.size + progress.length
      }
    };
  }

  async function buildPlanAsync(entries, onProgress) {
    const notify = (pct, text) => { if (typeof onProgress === 'function') onProgress(pct, text); };
    notify(4, 'Inventario dei file contenuti nello ZIP…');
    await new Promise(resolve => setTimeout(resolve, 0));
    const available = (entries || []).map(entry => basename(entry.name).toLowerCase());
    const recognizedCount = available.filter(name => RECOGNIZED_FILES.includes(name)).length;
    notify(24, `Riconosciuti ${recognizedCount} file utili alla libreria…`);
    await new Promise(resolve => setTimeout(resolve, 0));
    notify(48, 'Analisi di serie, film, watchlist e preferiti…');
    await new Promise(resolve => setTimeout(resolve, 0));
    const plan = buildPlan(entries);
    notify(88, 'Calcolo del riepilogo e controllo privacy…');
    await new Promise(resolve => setTimeout(resolve, 0));
    notify(100, 'Analisi completata.');
    return plan;
  }

  return { parseCSV, parseFiles, buildPlan, buildPlanAsync, extractMaps, SENSITIVE_FILES, RECOGNIZED_FILES, toIso, legacyVoteCodeToRating };
});
