/* Watchverse MVP - app privata e offline-first */
(() => {
  'use strict';

  const APP_VERSION = window.WATCHVERSE_VERSION || '1.0.0';
  const APP_BUILD = window.WATCHVERSE_BUILD || '0';
  const AIVENGERS_ICON_SVG = '<svg class="aivengers-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7.2h8a4 4 0 0 1 4 4v5.3a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-5.3a4 4 0 0 1 4-4Z"/><path d="M12 3.5v3.7M9 14h.01M15 14h.01M9.2 17h5.6"/><circle cx="12" cy="3" r="1"/><path d="M19.2 4.1c.18 1.05.75 1.62 1.8 1.8-1.05.18-1.62.75-1.8 1.8-.18-1.05-.75-1.62-1.8-1.8 1.05-.18 1.62-.75 1.8-1.8Z"/></svg>';
  const DB_NAME = 'watchverse-db';
  const DB_VERSION = 4;
  const STORES = ['series', 'movies', 'progress', 'imports', 'people', 'catalog'];
  const SHARED_CATALOG_SCHEMA = 1;
  const TMDB_BASE = 'https://api.themoviedb.org/3';
  const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
  const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/original';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const slug = (s = '') => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'senza-titolo';
  const pad2 = n => String(n).padStart(2, '0');
  const localDateKey = value => {
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(d.getTime())) return '';
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };
  const parseDateKey = value => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0) : new Date(value);
  };
  const isoDate = d => localDateKey(d);
  const todayIso = () => localDateKey(new Date());
  const daysFromNow = n => {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return localDateKey(d);
  };
  const addDaysToDateKey = (value, days = 0) => {
    const d = parseDateKey(value); if (!Number.isFinite(d.getTime())) return '';
    d.setDate(d.getDate() + Number(days || 0)); return localDateKey(d);
  };
  const fmtDate = value => value ? new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? parseDateKey(value) : new Date(value)) : '—';
  const fmtDateTime = value => value ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
  const fmtItalyDateTime = value => value ? new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(value)) : '';
  const dateKeyInTimeZone = (value, timeZone = 'Europe/Rome') => {
    const parts = new Intl.DateTimeFormat('en', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
    const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  };
  const calendarHeading = dateKey => {
    const base = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(parseDateKey(dateKey));
    if (dateKey === todayIso()) return `Oggi, ${base}`;
    if (dateKey === daysFromNow(1)) return `Domani, ${base}`;
    return base;
  };
  const minutesToText = mins => {
    mins = Number(mins || 0); const days = Math.floor(mins / 1440); const hours = Math.floor((mins % 1440) / 60); const m = mins % 60;
    if (days) return `${days}g ${hours}h`; if (hours) return `${hours}h ${m}m`; return `${m}m`;
  };
  const safeJson = (value, fallback = null) => { try { return JSON.parse(value); } catch { return fallback; } };
  const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const debounce = (fn, ms = 250) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };
  const dateMs = value => { const n = value ? new Date(value).getTime() : 0; return Number.isFinite(n) ? n : 0; };
  const idle = fn => ('requestIdleCallback' in globalThis ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 40));
  const normalizeSearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  function mediaSearchText(item) { return normalizeSearch([item.title, item.originalTitle, ...(item.aliases || [])].filter(Boolean).join(' | ')); }
  function matchesMediaSearch(item, query) { const q = normalizeSearch(query); return !q || mediaSearchText(item).includes(q); }
  function mergeAliases(...groups) { const seen = new Set(); return groups.flat(Infinity).filter(Boolean).map(String).map(x => x.trim()).filter(x => { const k = normalizeSearch(x); if (!k || seen.has(k)) return false; seen.add(k); return true; }); }
  // TV Time usa cinque codici interni per il giudizio a 5 livelli.
  // La conversione mantiene il significato crescente: Brutto → Wow.
  const TVTIME_LEGACY_RATING_MAP = Object.freeze({ '1': 1, '27': 2, '28': 3, '29': 4, '3': 5 });
  function legacyVoteCodeToRating(code) { return TVTIME_LEGACY_RATING_MAP[String(code || '').trim()] || 0; }

  const DEFAULT_PROFILES = [
    { id: 'profile-daniela', name: 'Daniela', initial: 'D', role: 'owner', avatarType: 'emoji', avatarValue: '🎬', pinHash: null, pinSalt: null },
    { id: 'profile-elena', name: 'Elena', initial: 'E', role: 'member', avatarType: 'emoji', avatarValue: '📚', pinHash: null, pinSalt: null }
  ];

  const EMPTY_HOME_SERIES = [
    { seedId:'stranger-things', kind:'tv', publicProvider:'tvmaze', id:'stranger-things', title:'Stranger Things', year:2016 },
    { seedId:'breaking-bad', kind:'tv', publicProvider:'tvmaze', id:'breaking-bad', title:'Breaking Bad', year:2008 },
    { seedId:'game-of-thrones', kind:'tv', publicProvider:'tvmaze', id:'game-of-thrones', title:'Game of Thrones', year:2011 },
    { seedId:'the-last-of-us', kind:'tv', publicProvider:'tvmaze', id:'the-last-of-us', title:'The Last of Us', year:2023 },
    { seedId:'the-bear', kind:'tv', publicProvider:'tvmaze', id:'the-bear', title:'The Bear', year:2022 },
    { seedId:'the-boys', kind:'tv', publicProvider:'tvmaze', id:'the-boys', title:'The Boys', year:2019 },
    { seedId:'house-of-the-dragon', kind:'tv', publicProvider:'tvmaze', id:'house-of-the-dragon', title:'House of the Dragon', year:2022 },
    { seedId:'the-mandalorian', kind:'tv', publicProvider:'tvmaze', id:'the-mandalorian', title:'The Mandalorian', year:2019 },
    { seedId:'the-crown', kind:'tv', publicProvider:'tvmaze', id:'the-crown', title:'The Crown', year:2016 },
    { seedId:'friends', kind:'tv', publicProvider:'tvmaze', id:'friends', title:'Friends', year:1994 },
    { seedId:'the-office', kind:'tv', publicProvider:'tvmaze', id:'the-office', title:'The Office', year:2005 },
    { seedId:'greys-anatomy', kind:'tv', publicProvider:'tvmaze', id:'greys-anatomy', title:"Grey's Anatomy", year:2005 },
    { seedId:'the-walking-dead', kind:'tv', publicProvider:'tvmaze', id:'the-walking-dead', title:'The Walking Dead', year:2010 },
    { seedId:'dark', kind:'tv', publicProvider:'tvmaze', id:'dark', title:'Dark', year:2017 },
    { seedId:'squid-game', kind:'tv', publicProvider:'tvmaze', id:'squid-game', title:'Squid Game', year:2021 }
  ];

  const DEFAULT_CINEMAS = Object.freeze([
    { id:'the-space-surbo', name:'The Space Cinema Surbo', city:'Surbo', province:'LE', officialUrl:'https://www.thespacecinema.it/cinema/surbo/al-cinema', sourceType:'Sito ufficiale esercente' },
    { id:'the-space-casamassima', name:'The Space Cinema Casamassima', city:'Casamassima', province:'BA', officialUrl:'https://www.thespacecinema.it/cinema/casamassima/al-cinema', sourceType:'Sito ufficiale esercente' },
    { id:'cinema-massimo-lecce', name:'Multisala Massimo Lecce', city:'Lecce', province:'LE', officialUrl:'https://www.multisalamassimo.it/', sourceType:'Sito ufficiale cinema' }
  ]);

  const DEFAULT_TV_CHANNELS = Object.freeze(['Rai 1','Rai 2','Rai 3','Rai 4','Rai Movie','Canale 5','Italia 1','Rete 4','Iris','Cine34','La7','TV8','Sky Cinema Uno']);
  const DEFAULT_STREAMING_SERVICES = Object.freeze(['Netflix','Prime Video','Disney+','NOW','Max / HBO','Apple TV+','Paramount+','RaiPlay','Mediaset Infinity','Sky']);

  function defaultSourceConfig() {
    const configured = (window.WATCHVERSE_CONFIG || {}).defaultSources || {};
    return {
      streamingLookup: Object.assign({ enabled:false, provider:'JustWatch tramite TMDB', searchUrl:'' }, configured.streamingLookup || {}),
      tvSchedule: Object.assign({ enabled:true, provider:'TVmaze', country:'IT', daysAhead:7, refreshHours:12 }, configured.tvSchedule || {}),
      cinema: Object.assign({ enabled:true, mode:'official-sites', refreshHours:12 }, configured.cinema || {})
    };
  }
  function sourceStatusStorageKey() { return `watchverse.defaultSources.v1.${state.profileId || 'account'}`; }
  function emptyDefaultSourceStatus() {
    return {
      streaming: { checked:0, actual:0, last:null, mode:'actual-only' },
      tv: { checked:0, matches:0, last:null },
      cinema: { linkedCinemas:0, actual:0, last:null }
    };
  }
  function loadDefaultSourceStatus() {
    state.defaultSourceStatus = Object.assign(emptyDefaultSourceStatus(), safeJson(localStorage.getItem(sourceStatusStorageKey()), {}));
    state.defaultSourceStatus.streaming = Object.assign(emptyDefaultSourceStatus().streaming, state.defaultSourceStatus.streaming || {});
    state.defaultSourceStatus.tv = Object.assign(emptyDefaultSourceStatus().tv, state.defaultSourceStatus.tv || {});
    state.defaultSourceStatus.cinema = Object.assign(emptyDefaultSourceStatus().cinema, state.defaultSourceStatus.cinema || {});
  }
  function saveDefaultSourceStatus() {
    localStorage.setItem(sourceStatusStorageKey(), JSON.stringify(state.defaultSourceStatus || emptyDefaultSourceStatus()));
  }
  const PROFILE_SETTINGS_TABS = Object.freeze([
    { id:'identity', label:'Identità', icon:'◉' },
    { id:'stats', label:'Statistiche', icon:'▥' },
    { id:'appearance', label:'Aspetto', icon:'◐' },
    { id:'services', label:'Cinema e servizi', icon:'⌖' },
    { id:'notifications', label:'Notifiche', icon:'♢' },
    { id:'import', label:'Importa ed esporta', icon:'⇅' },
    { id:'data', label:'Dati e fonti', icon:'↻' },
    { id:'security', label:'Sicurezza', icon:'▣' }
  ]);

  const STREAMING_SERVICE_META = Object.freeze([
    { name:'Netflix', mark:'N', tone:'netflix', url:'https://www.netflix.com/search?q={query}' },
    { name:'Prime Video', mark:'prime', tone:'prime', url:'https://www.primevideo.com/search/ref=atv_nb_sr?phrase={query}' },
    { name:'Disney+', mark:'Disney+', tone:'disney', url:'https://www.disneyplus.com/it-it' },
    { name:'NOW', mark:'NOW', tone:'now', url:'https://www.nowtv.it/' },
    { name:'Max / HBO', mark:'max', tone:'max', url:'https://www.max.com/it/it' },
    { name:'Apple TV+', mark:'tv+', tone:'apple', url:'https://tv.apple.com/it/search?term={query}' },
    { name:'Paramount+', mark:'P+', tone:'paramount', url:'https://www.paramountplus.com/it/' },
    { name:'RaiPlay', mark:'Rai', tone:'rai', url:'https://www.raiplay.it/ricerca.html?q={query}' },
    { name:'Mediaset Infinity', mark:'∞', tone:'mediaset', url:'https://mediasetinfinity.mediaset.it/' },
    { name:'Sky', mark:'sky', tone:'sky', url:'https://www.sky.it/tv' }
  ]);

  const TV_CHANNEL_META = Object.freeze([
    { name:'Rai 1', mark:'Rai 1', tone:'rai-one' },
    { name:'Rai 2', mark:'Rai 2', tone:'rai-two' },
    { name:'Rai 3', mark:'Rai 3', tone:'rai-three' },
    { name:'Rai 4', mark:'Rai 4', tone:'rai-four' },
    { name:'Rai Movie', mark:'Rai Movie', tone:'rai-movie' },
    { name:'Canale 5', mark:'5', tone:'canale-five' },
    { name:'Italia 1', mark:'I1', tone:'italia-one' },
    { name:'Rete 4', mark:'R4', tone:'rete-four' },
    { name:'Iris', mark:'iris', tone:'iris' },
    { name:'Cine34', mark:'Cine34', tone:'cine-thirtyfour' },
    { name:'La7', mark:'LA7', tone:'la-seven' },
    { name:'TV8', mark:'TV8', tone:'tv-eight' },
    { name:'Sky Cinema Uno', mark:'sky cinema', tone:'sky-cinema' }
  ]);

  const OFFICIAL_TRAILER_OVERRIDES = Object.freeze({
    'supergirl|2026': { site:'YouTube', key:'tzlY8XD1CGg', name:'Supergirl — trailer ufficiale', official:true }
  });

  const CINEMA_DIRECTORY = Object.freeze([
    { ...DEFAULT_CINEMAS[0], latitude:40.3993, longitude:18.1359 },
    { ...DEFAULT_CINEMAS[1], latitude:40.9564, longitude:16.9228 },
    { ...DEFAULT_CINEMAS[2], latitude:40.3526, longitude:18.1716 },
    { id:'db-dessai-lecce', name:'Cinema DB d’Essai', city:'Lecce', province:'LE', officialUrl:'https://www.cinemadbdessai.it/', sourceType:'Sito ufficiale cinema', latitude:40.3550, longitude:18.1682 },
    { id:'multisala-garden-lecce', name:'Multisala Garden', city:'Lecce', province:'LE', officialUrl:'', sourceType:'Directory locale', latitude:40.3478, longitude:18.1775 },
    { id:'cinema-elio-calimera', name:'Cinema Elio', city:'Calimera', province:'LE', officialUrl:'', sourceType:'Directory locale', latitude:40.2493, longitude:18.2797 }
  ]);
  const CITY_COORDINATES = Object.freeze({
    lecce:{ latitude:40.3515, longitude:18.1750 }, surbo:{ latitude:40.3975, longitude:18.1350 }, casamassima:{ latitude:40.9564, longitude:16.9228 }, calimera:{ latitude:40.2493, longitude:18.2797 }
  });

  const storedProfiles = safeJson(localStorage.getItem('watchverse.profiles'), null);
  const state = {
    db: null,
    authenticated: false,
    profileSelected: false,
    profileId: localStorage.getItem('watchverse.currentProfile') || null,
    profiles: Array.isArray(storedProfiles) && storedProfiles.length ? storedProfiles : structuredClone(DEFAULT_PROFILES),
    series: [], movies: [], progress: [], people: [],
    settings: {}, indexes: { progressByEpisode: new Map(), latestWatchedBySeries: new Map(), seriesComputed: new Map() },
    homeTab: 'watch', seriesFilter: 'unwatched', movieFilter: 'watched', statsView: 'overview', statsPeriod: 'all',
    seriesSort: 'latestEpisode', movieSort: 'recent',
    seriesSearch: '', movieSearch: '', seriesVisible: 60, movieVisible: 60,
    detailTab: 'info', tvScheduleFilter: 'today', importPreview: null, gdprPreview: null, deferredInstall: null,
    notifications: [], tmdbResults: [], publicResults: [], catalogResults: [], isLoading: false, pendingAvatarProfileId: null, personFilmographyFilter: 'all', profileSettingsTab: 'identity',
    catalogEntries: [], catalogIndex: new Map(), catalogHydratedThisSession: 0, catalogNetworkAvoidedThisSession: 0,
    metadataQueue: [], metadataRunning: 0, metadataQueuedIds: new Set(), metadataAutoBudget: 36, metadataRenderPending: false, metadataRerenderTimer: null, metadataBackgroundStarted: false, metadataHeaderTimer: null, metadataCompletedThisSession: 0, metadataFailedThisSession: 0, metadataRecoveryScheduled: false, metadataRecoveryDone: false, wcagStatusFilter: 'all', wcagLevelFilter: 'all', accessibilityTab: 'declaration', searchRecommendationFilter: 'all', navigationLoaderToken: 0,
    sidebarCollapsed: localStorage.getItem('watchverse.sidebarCollapsed') === '1', cinemaSearchLocation: null, cinemaSearchQuery: '', cinemaLocationFeedback: null, aivengersInitialized: false, lastRenderedRoute: '', defaultSourceStatus: null, defaultSourceSyncRunning: false, viewActionBusy: false
  };


  let blockingLoaderToken = 0;
  let blockingLoaderShownAt = 0;
  let blockingLoaderHideTimer = null;
  function nextPaint() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }
  async function runViewAction(button, action, loaderCopy = null) {
    if (!button || state.viewActionBusy) return;
    state.viewActionBusy = true;
    let loaderToken = 0;
    const container = button.closest('.tabbar, .view-toggle, .toolbar') || button.parentElement;
    button.disabled = true;
    button.classList.add('view-action-busy');
    button.setAttribute('aria-busy', 'true');
    if (container) {
      container.classList.add('view-action-pending');
      container.setAttribute('aria-busy', 'true');
    }
    try {
      // Give the browser a frame to paint feedback before a heavy list render starts.
      await nextFrame();
      if (loaderCopy) {
        loaderToken = showBlockingLoader(loaderCopy[0], loaderCopy[1]);
        await nextPaint();
      }
      await action();
      await nextFrame();
    } finally {
      if (loaderToken) hideBlockingLoader(loaderToken);
      state.viewActionBusy = false;
      $$('.view-action-busy').forEach(control => {
        control.disabled = false;
        control.classList.remove('view-action-busy');
        control.removeAttribute('aria-busy');
      });
      $$('.view-action-pending').forEach(group => {
        group.classList.remove('view-action-pending');
        group.removeAttribute('aria-busy');
      });
    }
  }
  function showBlockingLoader(title = 'Caricamento Watchverse', detail = 'Sto preparando i tuoi contenuti.') {
    const loader = $('#blockingLoader');
    if (!loader) return 0;
    blockingLoaderToken += 1;
    const token = blockingLoaderToken;
    clearTimeout(blockingLoaderHideTimer);
    const titleNode = $('#blockingLoaderTitle');
    const detailNode = $('#blockingLoaderDetail');
    if (titleNode) titleNode.textContent = title;
    if (detailNode) detailNode.textContent = detail;
    blockingLoaderShownAt = performance.now();
    loader.classList.add('is-visible');
    loader.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-blocking-loading');
    $('#main')?.setAttribute('aria-busy', 'true');
    $('#authRoot')?.setAttribute('aria-busy', 'true');
    $('#app')?.setAttribute('inert', '');
    $('#authRoot')?.setAttribute('inert', '');
    return token;
  }
  function hideBlockingLoader(token, minimumVisibleMs = 320) {
    if (!token || token !== blockingLoaderToken) return;
    const loader = $('#blockingLoader');
    if (!loader) return;
    const elapsed = performance.now() - blockingLoaderShownAt;
    const finish = () => {
      if (token !== blockingLoaderToken) return;
      loader.classList.remove('is-visible');
      loader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-blocking-loading');
      $('#main')?.setAttribute('aria-busy', 'false');
      $('#authRoot')?.setAttribute('aria-busy', 'false');
      $('#app')?.removeAttribute('inert');
      $('#authRoot')?.removeAttribute('inert');
    };
    clearTimeout(blockingLoaderHideTimer);
    blockingLoaderHideTimer = setTimeout(finish, Math.max(0, minimumVisibleMs - elapsed));
  }
  function loaderCopyForRoute(routeInfo) {
    const name = currentProfile()?.name || 'il tuo profilo';
    const copy = {
      home: ['Sto preparando la tua Home', `Raccolgo i contenuti di ${name}.`],
      series: ['Caricamento serie', 'Organizzo episodi, progressi e prossime uscite.'],
      movies: ['Caricamento film', 'Preparo watchlist, valutazioni e disponibilità.'],
      movie: ['Apro il dettaglio del film', 'Recupero informazioni, cast e programmazione.'],
      search: ['Apro la ricerca', 'Preparo i suggerimenti.'],
      programming: ['Caricamento programmazione', 'Allineo cinema, streaming e palinsesti TV.'],
      settings: ['Caricamento profilo', `Apro le impostazioni di ${name}.`],
      stats: ['Caricamento statistiche', 'Calcolo i dati della tua libreria.'],
      import: ['Caricamento gestione dati', 'Preparo importazione, esportazione e backup.'],
      person: ['Caricamento scheda', 'Preparo filmografia e contenuti collegati.'],
      accessibility: ['Caricamento accessibilità', 'Preparo dichiarazione e informazioni di conformità.'],
      'accessibility-report': ['Caricamento report WCAG', 'Organizzo criteri, esiti e statistiche.']
    };
    return copy[routeInfo.page] || ['Caricamento Watchverse', 'Sto preparando la sezione richiesta.'];
  }
  function inlineCinemaLoaderHtml(title, detail = '') {
    return `<div class="inline-cinema-loader" role="status"><span class="mini-reel" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span></div>`;
  }

  function profileKey(key) { return `watchverse.${state.profileId || 'none'}.${key}`; }
  function currentProfile() { return state.profiles.find(p => p.id === state.profileId) || null; }
  function profileScoped(base, profileId = state.profileId) { return `${profileId}|${String(base).replace(/^.*?\|/, '')}`; }
  function avatarContent(profile) {
    const p = profile || currentProfile() || { name: '?', initial: '?' };
    if (p.avatarType === 'image' && p.avatarValue) return `<img src="${esc(p.avatarValue)}" alt="">`;
    return esc(p.avatarValue || p.initial || p.name?.[0] || '?');
  }
  function avatarHtml(profile, className = 'avatar') { return `<span class="${className}" aria-hidden="true">${avatarContent(profile)}</span>`; }
  const APPEARANCE_THEMES = [
    { id:'watchverse-black', name:'Watchverse black', symbol:'W', description:'Nero profondo, bianco nitido e rosso Deep Crimson cinematografico.', colors:['#070707','#151515','#8e1624'] },
    { id:'original', name:'Watchverse Original', symbol:'W', description:'Il tema scuro giallo e nero attuale.', colors:['#0a0a0b','#141416','#f4c400'] },
    { id:'cinematic', name:'Cinematic Adaptive', symbol:'▶', description:'Blu antracite e oro, con atmosfera cinematografica controllata.', colors:['#090d13','#192331','#e9bd55'] },
    { id:'classic', name:'Cinema Classico', symbol:'✦', description:'Nero caldo, crema e oro ispirati alle sale tradizionali.', colors:['#120b0b','#281919','#e0b461'] },
    { id:'neon', name:'Midnight Neon', symbol:'◇', description:'Blu notte e accenti ciano, moderno ma ad alto contrasto.', colors:['#080a14','#181d34','#73e8e5'] },
    { id:'last-of-us', name:'The Last of Us', symbol:'🍄', description:'Proposta 3: parete infetta, colonia di Cordyceps, finestra al tramonto, Firefly, zaino di Ellie e tatuaggio con falena.', colors:['#070908','#283126','#b98a52'] },
    { id:'buffy', name:'Buffy the Vampire Slayer', symbol:'B', description:'The Gentlemen: silenzio, completi scuri, luna, bocca cucita e atmosfera gotica.', colors:['#071018','#182430','#7f313b'] },
    { id:'editorial-light', name:'Editorial Light', symbol:'Aa', description:'Tema chiaro da rivista, pensato per ambienti luminosi.', colors:['#f5f1e8','#fffdf8','#6f4300'] },
    { id:'system', name:'Sistema', symbol:'◐', description:'Segue automaticamente il tema chiaro o scuro del dispositivo.', colors:['#0a0a0b','#f5f1e8','#f4c400'] }
  ];
  const INTERFACE_DENSITIES = [
    { id:'comfortable', name:'Comoda', description:'Spazi più ampi e card più ariose, ideale per touch.' },
    { id:'compact', name:'Compatta', description:'Riduce spazi e altezza delle card per mostrare più contenuti.' }
  ];
  function applyAppearanceSettings() {
    const theme = APPEARANCE_THEMES.some(x=>x.id===state.settings.appearanceTheme) ? state.settings.appearanceTheme : 'watchverse-black';
    const density = INTERFACE_DENSITIES.some(x=>x.id===state.settings.interfaceDensity) ? state.settings.interfaceDensity : 'comfortable';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const themeColor = {'watchverse-black':'#8e1624',original:'#f4c400',cinematic:'#e9bd55',classic:'#e0b461',neon:'#73e8e5','last-of-us':'#b98a52',buffy:'#d59a43','editorial-light':'#6f4300',system:'#f4c400'}[theme] || '#8e1624';
    if (themeMeta) themeMeta.setAttribute('content', themeColor);
    const version = $('#footerVersion'); if (version) version.textContent = APP_VERSION;
    const build = $('#footerBuild'); if (build) build.textContent = APP_BUILD;
    const year = $('#footerYear'); if (year) year.textContent = String(new Date().getFullYear());
    refreshThemeDecorations();
  }
  function loadSettings() {
    state.settings = Object.assign({
      seriesView: 'grid', movieView: 'grid', theme: 'dark', appearanceTheme: 'watchverse-black', interfaceDensity: 'comfortable', language: 'it-IT', region: 'IT',
      seriesFilter: 'unwatched', movieFilter: 'watched', seriesSort: 'latestEpisode', movieSort: 'recent',
      tmdbToken: '', publicMetadataEnabled: true, autoEnrichVisible: true,
      notifyNewEpisodes: true, notifyTomorrow: true, notifyNewSeasons: true,
      browserNotifications: false, demoSeeded: false, reducedMotion: false,
      programmingCity: 'Lecce', cinemaRadiusKm: 25, programmingLanguage: 'any', preferOriginalVersion: false,
      preferredFormats: ['2D'], preferredStreamingServices: [...DEFAULT_STREAMING_SERVICES], preferredTvChannels: [...DEFAULT_TV_CHANNELS], preferredCinemas: structuredClone(DEFAULT_CINEMAS),
      dataSourcesLastReviewedAt: null, libraryUiVersion: 0, themeDefaultsVersion: 0
    }, safeJson(localStorage.getItem(profileKey('settings')), {}));
    if (Number(state.settings.themeDefaultsVersion || 0) < 1) {
      if (!state.settings.appearanceTheme || state.settings.appearanceTheme === 'original') state.settings.appearanceTheme = 'watchverse-black';
      state.settings.themeDefaultsVersion = 1;
      localStorage.setItem(profileKey('settings'), JSON.stringify(state.settings));
    }
    if (!Array.isArray(state.settings.preferredCinemas) || !state.settings.preferredCinemas.length) state.settings.preferredCinemas = structuredClone(DEFAULT_CINEMAS);
    if (!Array.isArray(state.settings.preferredFormats)) state.settings.preferredFormats = ['2D'];
    if (!Array.isArray(state.settings.preferredStreamingServices)) state.settings.preferredStreamingServices = [...DEFAULT_STREAMING_SERVICES];
    if (!Array.isArray(state.settings.preferredTvChannels)) state.settings.preferredTvChannels = [...DEFAULT_TV_CHANNELS];
    if (!['any','it','original'].includes(state.settings.programmingLanguage)) state.settings.programmingLanguage = state.settings.preferOriginalVersion ? 'original' : (state.settings.programmingLanguage === 'it' ? 'it' : 'any');
    // Migrazione UI 2.0.5: filtri semplificati e ordinamenti predefiniti in stile TV Time.
    if (Number(state.settings.libraryUiVersion || 0) < 205) {
      if (['paused', 'dropped'].includes(state.settings.seriesFilter)) state.settings.seriesFilter = 'unwatched';
      state.settings.seriesFilter = state.settings.seriesFilter || 'unwatched';
      state.settings.movieFilter = state.settings.movieFilter || 'watched';
      state.settings.seriesSort = state.settings.seriesSort || 'latestEpisode';
      state.settings.movieSort = state.settings.movieSort || 'recent';
      state.settings.libraryUiVersion = 205;
      localStorage.setItem(profileKey('settings'), JSON.stringify(state.settings));
    }
    applyAppearanceSettings();
  }
  function saveSettings(syncCloud = true) {
    state.settings.revision = Number(state.settings.revision || 0) + 1;
    state.settings.updatedAt = new Date().toISOString();
    localStorage.setItem(profileKey('settings'), JSON.stringify(state.settings)); applyAppearanceSettings();
    if (syncCloud) void window.WatchverseCloudSync?.saveSettings(currentProfile(), state.settings).catch(error => console.warn('Watchverse cloud settings sync:', error));
  }
  function saveProfiles(syncCloud = true) {
    localStorage.setItem('watchverse.profiles', JSON.stringify(state.profiles));
    if (syncCloud) void window.WatchverseCloudSync?.saveProfiles(state.profiles).catch(error => console.warn('Watchverse cloud profile sync:', error));
  }

  const memoryStores = Object.fromEntries(STORES.map(name => [name, new Map()]));
  function openDB() {
    return new Promise((resolve) => {
      let settled = false;
      const finish = value => { if (!settled) { settled = true; resolve(value); } };
      const fallbackTimer = setTimeout(() => finish({ memory: true }), 1200);
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          for (const store of STORES) {
            if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => { clearTimeout(fallbackTimer); finish(req.result); };
        req.onerror = () => { clearTimeout(fallbackTimer); finish({ memory: true }); };
        req.onblocked = () => { clearTimeout(fallbackTimer); finish({ memory: true }); };
      } catch { clearTimeout(fallbackTimer); finish({ memory: true }); }
    });
  }
  function dbTx(store, mode = 'readonly') { return state.db.transaction(store, mode).objectStore(store); }
  function stampLocalValue(value) {
    const now = new Date().toISOString();
    const previous = dateMs(value?.updatedAt);
    const timestamp = previous >= Date.now() ? new Date(previous + 1).toISOString() : now;
    const stamped = { ...value, revision: Number(value?.revision || 0) + 1, updatedAt: timestamp };
    if (value && typeof value === 'object') Object.assign(value, stamped);
    return stamped;
  }
  function dbGetAll(store) {
    if (state.db?.memory) return Promise.resolve([...memoryStores[store].values()]);
    return new Promise((resolve, reject) => { const r = dbTx(store).getAll(); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
  }
  function dbPut(store, value) {
    const prepared = ['series','movies','progress','settings'].includes(store) ? stampLocalValue(value) : value;
    const finish = () => { void window.WatchverseCloudSync?.pushRecord(currentProfile(), store, prepared).catch(error => console.warn('Watchverse cloud record sync:', error)); return value; };
    if (state.db?.memory) { memoryStores[store].set(prepared.id, structuredClone(prepared)); return Promise.resolve(finish()); }
    return new Promise((resolve, reject) => { const r = dbTx(store, 'readwrite').put(prepared); r.onsuccess = () => resolve(finish()); r.onerror = () => reject(r.error); });
  }
  function dbBulkPut(store, values, syncCloud = true) {
    const prepared = syncCloud && ['series','movies','progress','settings'].includes(store) ? values.map(stampLocalValue) : values;
    const sync = syncCloud ? Promise.resolve(window.WatchverseCloudSync?.pushRecords(currentProfile(), store, prepared)) : Promise.resolve();
    const finish = () => prepared.length;
    if (state.db?.memory) { prepared.forEach(v => memoryStores[store].set(v.id, structuredClone(v))); return sync.then(finish); }
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction(store, 'readwrite'); const os = tx.objectStore(store); prepared.forEach(v => os.put(v));
      tx.oncomplete = () => sync.then(() => resolve(finish())).catch(reject); tx.onerror = () => reject(tx.error);
    });
  }
  async function dbBulkPutBatched(store, values, batchSize = 600, onProgress = null) {
    let done = 0;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize); await dbBulkPut(store, batch); done += batch.length;
      if (onProgress) onProgress(done, values.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return done;
  }
  function dbDelete(store, id) {
    const valuePromise = dbGetAll(store).then(values => values.find(value => value.id === id));
    const finish = value => { void window.WatchverseCloudSync?.deleteRecord(currentProfile(), store, value).catch(error => console.warn('Watchverse cloud delete sync:', error)); };
    if (state.db?.memory) { const value = memoryStores[store].get(id); memoryStores[store].delete(id); finish(value); return Promise.resolve(); }
    return valuePromise.then(value => new Promise((resolve, reject) => { const r = dbTx(store, 'readwrite').delete(id); r.onsuccess = () => { finish(value); resolve(); }; r.onerror = () => reject(r.error); }));
  }
  function dbDeleteLocal(store, id) {
    if (state.db?.memory) { memoryStores[store].delete(id); return Promise.resolve(); }
    return new Promise((resolve, reject) => { const r = dbTx(store, 'readwrite').delete(id); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); });
  }
  function dbClearProfile(store) {
    if (state.db?.memory) { for (const [id, value] of memoryStores[store]) if (value.profileId === state.profileId) memoryStores[store].delete(id); return Promise.resolve(); }
    return new Promise(async (resolve, reject) => {
      try {
        const all = await dbGetAll(store); const tx = state.db.transaction(store, 'readwrite'); const os = tx.objectStore(store);
        all.filter(x => x.profileId === state.profileId).forEach(x => os.delete(x.id));
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      } catch (e) { reject(e); }
    });
  }

  async function syncCloudProfile(profile, options = {}) {
    const sync = window.WatchverseCloudSync;
    if (!sync) {
      showToast('Sincronizzazione non disponibile', 'Il modulo cloud non è stato caricato. Ricarica la pagina.', '!', 8000, { kind: 'error' });
      return;
    }
    if (!sync.isEnabled()) {
      const session = window.WatchverseAuth?.getSession();
      showToast('Sincronizzazione cloud inattiva', session?.mode === 'cloud' ? 'La sessione Supabase non contiene un token valido.' : 'È attiva una sessione locale: esci e accedi di nuovo con daniela.', '!', 9000, { kind: 'error' });
      return;
    }
    let activeProfile = profile;
    if (!activeProfile?.cloudId) {
      const recoveredProfiles = await bootstrapCloudProfilesWithRetry();
      const recovered = recoveredProfiles?.find(item => item.id === profile?.id);
      if (recovered) {
        state.profiles = state.profiles.map(item => item.id === recovered.id ? recovered : item);
        saveProfiles(false);
        activeProfile = recovered;
      }
    }
    if (!activeProfile?.cloudId) {
      const userId = window.WatchverseAuth?.getSession()?.user?.id || 'non disponibile';
      showToast('Profilo cloud non collegato', `Daniela non è visibile per l’utente Supabase ${userId}. Confronta questo ID con account_id nella tabella profiles.`, '!', 12000, { kind: 'error' });
      return;
    }
    let cloud;
    try { cloud = await sync.pullProfile(activeProfile, options); } catch (error) {
      console.warn('Watchverse cloud profile pull:', error);
      showToast('Libreria cloud non caricata', 'Controlla la connessione e riprova. I dati online non sono stati cancellati.', '!', 7000, { kind: 'error' });
      return;
    }
    if (!cloud) return;
    if (cloud.warnings?.progress) {
      console.warn('Watchverse cloud episode progress pull:', cloud.warnings.progress);
      showToast('Catalogo cloud caricato', 'Il progresso degli episodi verrà riprovato al prossimo accesso.', '!', 7000, { kind: 'error' });
    }
    const stores = options.onlyProgress ? ['progress'] : (options.skipProgress ? ['series', 'movies'] : ['series', 'movies', 'progress']);
    for (const store of stores) {
      const local = (await dbGetAll(store)).filter(value => value.profileId === activeProfile.id);
      const localById = new Map(local.map(value => [value.id, value]));
      const winners = [];
      const pendingUpload = [];
      for (const value of cloud[store] || []) {
        const current = localById.get(value.id);
        if (!current || dateMs(value.updatedAt) >= dateMs(current.updatedAt)) winners.push(value);
        else { winners.push(current); pendingUpload.push(current); }
        if (current && Number(current.revision || 1) !== Number(value.revision || 1)) {
          await sync.recordConflict(activeProfile, store, current, value, dateMs(value.updatedAt) >= dateMs(current.updatedAt) ? 'cloud_won' : 'local_won');
        }
        localById.delete(value.id);
      }
      for (const tombstone of cloud.deleted?.[store] || []) {
        const current = localById.get(tombstone.id);
        if (current && dateMs(tombstone.updatedAt) >= dateMs(current.updatedAt)) await dbDeleteLocal(store, current.id);
        else if (current) pendingUpload.push(current);
        localById.delete(tombstone.id);
      }
      for (const value of localById.values()) {
        winners.push(value);
        pendingUpload.push(value);
      }
      if (pendingUpload.length) await sync.pushRecords(activeProfile, store, pendingUpload);
      if (winners.length) await dbBulkPut(store, winners, false);
    }
    const settingsKey = `watchverse.${activeProfile.id}.settings`;
    const localSettings = safeJson(localStorage.getItem(settingsKey), null);
    if (cloud.settings && Object.keys(cloud.settings).length) {
      const localRevision = Number(localSettings?.revision || 0);
      const cloudRevision = Number(cloud.settingsMeta?.revision || cloud.settings.revision || 1);
      if (localSettings && localRevision > cloudRevision) {
        await sync.recordConflict(activeProfile, 'settings', { id:'settings', revision:localRevision }, { id:'settings', revision:cloudRevision }, 'local_won');
        await sync.saveSettings(activeProfile, localSettings);
      } else {
        if (localSettings && localRevision !== cloudRevision) await sync.recordConflict(activeProfile, 'settings', { id:'settings', revision:localRevision }, { id:'settings', revision:cloudRevision }, 'cloud_won');
        localStorage.setItem(settingsKey, JSON.stringify(cloud.settings));
      }
    } else if (localSettings) await sync.saveSettings(activeProfile, localSettings);
  }

  // Catalogo condiviso: i dati provenienti dalle fonti pubbliche sono salvati una volta sola
  // e riutilizzati da tutti i profili. Stato di visione, voti, preferiti e note restano invece
  // nei record di libreria associati al singolo profilo.
  const SHARED_COMMON_FIELDS = Object.freeze([
    'mediaType','title','originalTitle','aliases','year','overview','overviewLanguage','genres','runtime',
    'poster','backdrop','posterGradient','backdropGradient','cast','tmdbId','tvdbId','imdbId','wikidataId',
    'network','networkCountry','officialSite','providerStatus','providerGroups','trailer','trailerCheckedAt',
    'publicMetadata','metadataUpdatedAt','providersUpdatedAt','providerCheckedAt','cinemaShowtimes','cinemaCheckedAt','releaseDate','firstAirDate','lastAirDate'
  ]);
  const SHARED_SERIES_FIELDS = Object.freeze(['seasons','episodeCount','seasonCount']);
  const SHARED_MOVIE_FIELDS = Object.freeze(['productionCountries']);

  function deepClone(value) {
    if (value === undefined) return undefined;
    try { return structuredClone(value); } catch { return safeJson(JSON.stringify(value), value); }
  }
  function valueHasContent(value) {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }
  function catalogKind(kind) { return kind === 'tv' || kind === 'series' ? 'series' : 'movie'; }
  function catalogIdentityKeys(kind, item = {}) {
    const type = catalogKind(kind); const keys = [];
    const add = value => { if (value && !keys.includes(value)) keys.push(value); };
    if (item.tmdbId) add(`${type}:tmdb:${item.tmdbId}`);
    if (type === 'series' && item.tvdbId) add(`${type}:tvdb:${item.tvdbId}`);
    if (item.imdbId) add(`${type}:imdb:${String(item.imdbId).toLowerCase()}`);
    if (item.wikidataId) add(`${type}:wikidata:${String(item.wikidataId).toLowerCase()}`);
    const provider = item.publicMetadata?.provider || item.publicProvider;
    const providerId = item.publicMetadata?.providerId || item.publicProviderId;
    if (provider && providerId) add(`${type}:public:${normalizeSearch(provider)}:${providerId}`);
    const year = Number(item.year) || '';
    for (const title of mergeAliases(item.title, item.originalTitle, item.aliases || [])) {
      const normalized = normalizeSearch(title); if (!normalized) continue;
      add(`${type}:title:${normalized}:${year || '*'}`);
    }
    return keys;
  }
  function sanitizeSharedSeasons(seasons = []) {
    return seasons.map(season => ({
      ...deepClone(season),
      episodes: (season.episodes || []).map(ep => {
        const copy = deepClone(ep); delete copy.id; delete copy.watched; delete copy.watchedAt; delete copy.rating; delete copy.notes; return copy;
      })
    }));
  }
  function extractSharedCatalogData(kind, item) {
    const type = catalogKind(kind); const data = {};
    for (const field of [...SHARED_COMMON_FIELDS, ...(type === 'series' ? SHARED_SERIES_FIELDS : SHARED_MOVIE_FIELDS)]) {
      if (!valueHasContent(item[field])) continue;
      data[field] = field === 'seasons' ? sanitizeSharedSeasons(item[field]) : deepClone(item[field]);
    }
    data.mediaType = type === 'series' ? 'tv' : 'movie';
    if (!data.posterGradient && item.title) data.posterGradient = gradient(item.title);
    if (!data.backdropGradient && item.title) data.backdropGradient = gradient(`${item.title} hero`);
    return data;
  }
  function sharedDataUpdatedAt(item = {}) {
    return item.publicMetadata?.updatedAt || item.metadataUpdatedAt || item.providersUpdatedAt || item.trailerCheckedAt || item.updatedAt || null;
  }
  function sharedCatalogIsReusable(kind, item = {}, includeCast = false) {
    const type = catalogKind(kind);
    const parts = item.publicMetadata?.parts || {};
    const hasCore = !!((item.overview && !isImportedPlaceholder(item.overview)) || item.poster || parts.coreComplete);
    const hasCast = !includeCast || !!((item.cast || []).length || parts.castComplete);
    const hasEpisodes = type !== 'series' || !!((item.seasons || []).length || parts.episodesAt);
    return hasCore && hasCast && hasEpisodes;
  }
  function rebuildCatalogIndex(entries = state.catalogEntries) {
    state.catalogEntries = Array.isArray(entries) ? entries : [];
    const index = new Map();
    for (const entry of state.catalogEntries) for (const key of entry.identityKeys || []) if (!index.has(key)) index.set(key, entry);
    state.catalogIndex = index;
  }
  function findSharedCatalogEntry(kind, item = {}) {
    for (const key of catalogIdentityKeys(kind, item)) {
      const entry = state.catalogIndex.get(key); if (entry) return entry;
    }
    return null;
  }
  function mergeSharedCatalogData(kind, item, entry) {
    if (!entry?.data) return false;
    const type = catalogKind(kind); let changed = false;
    for (const [field, raw] of Object.entries(entry.data)) {
      if (!valueHasContent(raw)) continue;
      if (field === 'seasons' && type === 'series') {
        const merged = mergeSeriesSeasons(item.seasons || [], raw || [], item.id);
        if (JSON.stringify(merged) !== JSON.stringify(item.seasons || [])) { item.seasons = merged; changed = true; }
        continue;
      }
      const next = deepClone(raw);
      if (JSON.stringify(item[field]) !== JSON.stringify(next)) { item[field] = next; changed = true; }
    }
    item.sharedCatalogId = entry.id;
    item.sharedCatalogUpdatedAt = entry.updatedAt;
    return changed;
  }
  function mergeSharedData(existing = {}, incoming = {}) {
    const merged = deepClone(existing) || {};
    for (const [key, value] of Object.entries(incoming || {})) if (valueHasContent(value)) merged[key] = deepClone(value);
    return merged;
  }
  async function saveSharedCatalog(kind, item, source = 'public') {
    const type = catalogKind(kind); const identityKeys = catalogIdentityKeys(type, item);
    if (!identityKeys.length || !sharedCatalogIsReusable(type, item, false)) return null;
    const existing = findSharedCatalogEntry(type, item);
    const now = new Date().toISOString();
    const entry = {
      id: existing?.id || `catalog|${identityKeys[0]}`,
      schemaVersion: SHARED_CATALOG_SCHEMA,
      kind: type,
      identityKeys: [...new Set([...(existing?.identityKeys || []), ...identityKeys])],
      data: mergeSharedData(existing?.data || {}, extractSharedCatalogData(type, item)),
      source: source || existing?.source || 'public',
      createdAt: existing?.createdAt || now,
      updatedAt: sharedDataUpdatedAt(item) || now
    };
    await dbPut('catalog', entry);
    const next = state.catalogEntries.filter(x => x.id !== entry.id); next.push(entry); rebuildCatalogIndex(next);
    return entry;
  }
  async function hydrateItemFromSharedCatalog(kind, item, options = {}) {
    const entry = findSharedCatalogEntry(kind, item); if (!entry) return false;
    const changed = mergeSharedCatalogData(kind, item, entry);
    if (changed) state.catalogHydratedThisSession++;
    if (options.persist && changed) await dbPut(catalogKind(kind) === 'series' ? 'series' : 'movies', item);
    return true;
  }
  async function migrateLegacyRecordsIntoSharedCatalog(series = [], movies = []) {
    const candidates = [
      ...series.map(item => ({ kind:'series', item })),
      ...movies.map(item => ({ kind:'movie', item }))
    ].filter(({kind,item}) => sharedCatalogIsReusable(kind, item, false));
    let writes = 0;
    for (const {kind,item} of candidates) {
      const existing = findSharedCatalogEntry(kind, item);
      const itemTime = dateMs(sharedDataUpdatedAt(item)); const cacheTime = dateMs(existing?.updatedAt);
      if (!existing || itemTime > cacheTime) { await saveSharedCatalog(kind, item, 'migration'); writes++; }
    }
    return writes;
  }
  function sharedCatalogSearch(query, limit = 12) {
    const q = normalizeSearch(query); if (!q) return [];
    return state.catalogEntries.filter(entry => {
      const data = entry.data || {};
      return normalizeSearch([data.title, data.originalTitle, ...(data.aliases || [])].filter(Boolean).join(' | ')).includes(q);
    }).sort((a,b) => String(a.data?.title || '').localeCompare(String(b.data?.title || ''), 'it')).slice(0, limit).map(entry => ({
      kind: entry.kind === 'series' ? 'tv' : 'movie', id: entry.id, catalogEntryId: entry.id, title: entry.data?.title || 'Titolo', originalTitle: entry.data?.originalTitle || null,
      year: entry.data?.year || '', overview: entry.data?.overview || '', poster: entry.data?.poster || null, cached: true
    }));
  }
  async function addFromSharedCatalogResult(result) {
    const entry = state.catalogEntries.find(x => x.id === result.catalogEntryId || x.id === result.id);
    if (!entry) throw new Error('Il titolo condiviso non è più disponibile.');
    const type = entry.kind; const data = entry.data || {}; const base = String(entry.id).replace(/^catalog\|/, '').replace(/[^a-z0-9:_-]+/gi, '-');
    const item = type === 'series' ? {
      id: profileScoped(`shared-${base}`), profileId:state.profileId, mediaType:'tv', title:data.title || result.title,
      status:'plan', favorite:false, rating:0, notes:'', seasons:[], providerGroups:{streaming:[],rent:[],buy:[]}
    } : {
      id: profileScoped(`shared-${base}`), profileId:state.profileId, mediaType:'movie', title:data.title || result.title,
      watched:false, state:'watchlist', favorite:false, rating:0, notes:'', providerGroups:{streaming:[],rent:[],buy:[]}
    };
    mergeSharedCatalogData(type, item, entry);
    const collection = type === 'series' ? state.series : state.movies;
    if (collection.some(existing => findSharedCatalogEntry(type, existing)?.id === entry.id || catalogIdentityKeys(type, existing).some(key => entry.identityKeys.includes(key)))) throw new Error('Il titolo è già presente nella libreria.');
    await dbPut(type === 'series' ? 'series' : 'movies', item);
    state.catalogNetworkAvoidedThisSession++;
    return item;
  }

  function gradient(seed = '') {
    const palettes = [
      ['#4d2f18', '#171719'], ['#17394e', '#0e1115'], ['#503047', '#131116'], ['#3f4c21', '#10120d'],
      ['#453568', '#14111b'], ['#5c241f', '#130e0e'], ['#1b5250', '#0e1515'], ['#5e4b19', '#151208']
    ];
    const idx = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length;
    return `linear-gradient(145deg, ${palettes[idx][0]}, ${palettes[idx][1]})`;
  }

  function episodeKey(seriesId, season, episode) { return `${seriesId}|${Number(season)}|${Number(episode)}`; }
  function allEpisodes(series) {
    return (series.seasons || []).flatMap(season => (season.episodes || []).map(ep => ({
      ...ep,
      season: Number(ep.season ?? season.number ?? 0),
      episode: Number(ep.episode ?? ep.number ?? 0),
      seasonName: season.name
    })));
  }
  function rebuildIndexes() {
    const progressByEpisode = new Map();
    const episodeByKey = new Map();
    for (const series of state.series) for (const episode of allEpisodes(series)) episodeByKey.set(episodeKey(series.id, episode.season, episode.episode), episode);
    const latestWatchedBySeries = new Map();
    const watchedMinutesBySeries = new Map();
    let watchedProgressCount = 0;
    let watchedEpisodeMinutes = 0;
    for (const p of state.progress) {
      progressByEpisode.set(episodeKey(p.seriesId, p.season, p.episode), p);
      if (p.watched) {
        watchedProgressCount++;
        const minutes = Number(p.runtime || 50);
        watchedEpisodeMinutes += minutes;
        watchedMinutesBySeries.set(p.seriesId, (watchedMinutesBySeries.get(p.seriesId) || 0) + minutes);
      }
      if (p.watched && p.watchedAt) {
        const current = latestWatchedBySeries.get(p.seriesId);
        if (!current || dateMs(p.watchedAt) > dateMs(current)) latestWatchedBySeries.set(p.seriesId, p.watchedAt);
      }
    }
    state.indexes = { progressByEpisode, episodeByKey, latestWatchedBySeries, watchedMinutesBySeries, watchedProgressCount, watchedEpisodeMinutes, seriesComputed: new Map() };
    scheduleMetadataHeaderUpdate();
  }
  function computedSeries(series) {
    const cached = state.indexes.seriesComputed.get(series.id);
    if (cached) return cached;
    const episodes = allEpisodes(series).filter(ep => ep.episode > 0).sort((a, b) => (a.season - b.season) || (a.episode - b.episode));
    let watched = 0;
    const unwatched = [];
    for (const ep of episodes) {
      const rec = state.indexes.progressByEpisode.get(episodeKey(series.id, ep.season, ep.episode));
      if (rec?.watched) watched++; else unwatched.push(ep);
    }
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const releasedUnwatched = unwatched.filter(ep => ep.airDate && dateMs(ep.airDate) <= todayEnd.getTime())
      .sort((a, b) => dateMs(b.airDate) - dateMs(a.airDate) || b.season - a.season || b.episode - a.episode);
    const datedEpisodes = episodes.filter(ep => ep.airDate).sort((a, b) => dateMs(b.airDate) - dateMs(a.airDate));
    const value = {
      episodes,
      watched,
      total: episodes.length,
      percent: episodes.length ? Math.round(watched / episodes.length * 100) : 0,
      next: unwatched[0] || null,
      latestReleasedUnwatched: releasedUnwatched[0] || null,
      latestEpisodeAirDate: datedEpisodes[0]?.airDate || null,
      latestWatchedAt: state.indexes.latestWatchedBySeries.get(series.id) || null
    };
    state.indexes.seriesComputed.set(series.id, value);
    return value;
  }
  function invalidateSeriesComputed(seriesId = null) {
    if (seriesId) state.indexes.seriesComputed.delete(seriesId); else state.indexes.seriesComputed.clear();
  }
  async function reloadData() {
    const [series, movies, progress, people, catalog] = await Promise.all([
      dbGetAll('series'), dbGetAll('movies'), dbGetAll('progress'), dbGetAll('people'), dbGetAll('catalog')
    ]);
    rebuildCatalogIndex(catalog);
    // Migrazione trasparente: i metadati già presenti nelle librerie delle versioni precedenti
    // alimentano il catalogo comune, senza spostare o cancellare i dati personali.
    await migrateLegacyRecordsIntoSharedCatalog(series, movies);
    state.series = series.filter(x => x.profileId === state.profileId);
    state.movies = movies.filter(x => x.profileId === state.profileId);
    for (const item of state.series) mergeSharedCatalogData('series', item, findSharedCatalogEntry('series', item));
    for (const item of state.movies) mergeSharedCatalogData('movie', item, findSharedCatalogEntry('movie', item));
    state.progress = progress.filter(x => x.profileId === state.profileId);
    state.people = people.filter(x => x.profileId === state.profileId);
    // Migrazione 2.0.8: converte i codici voto storici di TV Time in stelle.
    // Viene eseguita anche sulle librerie già importate con versioni precedenti.
    const ratingUpdates = [];
    for (const movie of state.movies) {
      const importedRating = legacyVoteCodeToRating(movie.legacyVoteCode);
      if (!Number(movie.rating) && importedRating) {
        movie.rating = importedRating;
        movie.ratingSource = movie.ratingSource || 'tvtime-legacy';
        ratingUpdates.push(movie);
      }
    }
    if (ratingUpdates.length) await dbBulkPut('movies', ratingUpdates);
    rebuildIndexes();
    buildNotifications();
  }

  function progressRecord(seriesId, season, episode) {
    return state.indexes.progressByEpisode.get(episodeKey(seriesId, season, episode));
  }
  function isEpisodeWatched(seriesId, season, episode) { return !!progressRecord(seriesId, season, episode)?.watched; }
  function seriesProgress(series) {
    const c = computedSeries(series); return { watched: c.watched, total: c.total, percent: c.percent };
  }
  function seriesIsCompleted(series) {
    const progress = seriesProgress(series);
    return series.status === 'completed' || (progress.total > 0 && progress.watched >= progress.total);
  }
  function nextEpisode(series) { return computedSeries(series).next; }
  function latestReleasedUnwatched(series) { return computedSeries(series).latestReleasedUnwatched; }
  function latestWatchedAt(seriesId) { return state.indexes.latestWatchedBySeries.get(seriesId) || null; }
  function seriesNeedsWatching(series) {
    if (seriesIsCompleted(series) || series.status === 'dropped') return false;
    const c = computedSeries(series);
    return ['watching', 'paused', 'plan', 'watchlist'].includes(series.status) || c.total === 0 || c.watched < c.total;
  }
  function seriesRecentEpisodeTimestamp(series) {
    const c = computedSeries(series);
    return dateMs(c.latestReleasedUnwatched?.airDate || c.latestEpisodeAirDate || series.metadataUpdatedAt || c.latestWatchedAt || series.followedAt);
  }
  function firstStreamingProvider(series) {
    return series.italyReleaseRule?.provider || series.providerGroups?.streaming?.[0] || '';
  }
  function episodeScheduleInfo(series, episode) {
    const originalDate = episode.airDate || (episode.airStamp ? localDateKey(new Date(episode.airStamp)) : '');
    const original = originalDate ? {
      dateKey: originalDate,
      stamp: episode.airStamp || null,
      network: series.network || '',
      time: episode.airStamp ? new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit', timeZone: series.networkCountry === 'US' ? 'America/New_York' : 'UTC', hour12:false }).format(new Date(episode.airStamp)) : '',
      text: episode.airStamp ? fmtItalyDateTime(episode.airStamp) : calendarHeading(originalDate)
    } : null;
    let italy = null;
    const rule = series.italyReleaseRule;
    if (rule?.enabled && originalDate) {
      italy = {
        dateKey: addDaysToDateKey(originalDate, Number(rule.delayDays || 0)),
        time: rule.time || '', provider: rule.provider || firstStreamingProvider(series),
        source: 'Correzione manuale del profilo', exact: true, confidence: 'manual'
      };
    } else if (episode.italyAirStamp || episode.italyAirDate) {
      const stamp = episode.italyAirStamp || null;
      const dateKey = episode.italyAirDate || (stamp ? dateKeyInTimeZone(stamp, 'Europe/Rome') : '');
      italy = {
        dateKey,
        time: stamp ? new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Rome', hour12:false }).format(new Date(stamp)) : (episode.italyAirTime || ''),
        provider: episode.italyProvider || firstStreamingProvider(series),
        source: episode.italyScheduleSource || 'Ricerca automatica online',
        exact: episode.italyScheduleExact === true,
        confidence: episode.italyScheduleConfidence || (episode.italyScheduleExact ? 'exact' : 'estimated')
      };
    }
    const dateKey = italy?.dateKey || original?.dateKey || '';
    const time = italy?.time || '';
    const sortStamp = dateKey ? new Date(`${dateKey}T${time || '12:00'}:00`).getTime() : 0;
    return { original, italy, dateKey, sortStamp, usesItalyDate: !!italy };
  }
  function italyReleaseRuleSummary(series) {
    const rule = series.italyReleaseRule;
    if (rule?.enabled) {
      const delay = Number(rule.delayDays || 0);
      const when = delay === 0 ? 'stesso giorno' : delay === 1 ? 'giorno successivo' : delay > 1 ? `${delay} giorni dopo` : `${Math.abs(delay)} giorni prima`;
      return `${rule.provider ? `${rule.provider} · ` : ''}${when}${rule.time ? ` alle ${rule.time}` : ''}. Correzione manuale con priorità sui dati automatici.`;
    }
    const next = computedSeries(series).episodes.map(ep => ({ ep, schedule: episodeScheduleInfo(series, ep) })).find(x => x.schedule.italy);
    if (next) {
      const quality = next.schedule.italy.exact ? 'data italiana rilevata da un palinsesto pubblico' : 'orario italiano stimato automaticamente dal momento di uscita originale';
      return `${next.schedule.italy.provider ? `${next.schedule.italy.provider} · ` : ''}${quality}. Puoi correggerla manualmente se necessario.`;
    }
    return 'Ricerca automatica online attiva. Se non viene trovata una programmazione italiana affidabile, resta disponibile la correzione manuale.';
  }
  function showItalyScheduleEditor(series) {
    const current = series.italyReleaseRule || {};
    const suggestedProvider = current.provider || firstStreamingProvider(series) || '';
    openModal('Programmazione Italia', `<p class="notice">Watchverse prova prima a ricavare automaticamente data, ora e piattaforma italiane dai palinsesti pubblici disponibili. La regola qui sotto è una correzione manuale: quando è attiva ha sempre la precedenza.</p>
      <div class="form-grid">
        <div class="form-field full"><label><input id="italyRuleEnabled" type="checkbox" ${current.enabled ? 'checked' : ''}> Usa una correzione manuale per questa serie</label></div>
        <div class="form-field full"><label for="italyRuleProvider">Piattaforma o canale in Italia</label><input id="italyRuleProvider" type="text" value="${esc(suggestedProvider)}" placeholder="Es. NOW, Sky Atlantic, Apple TV+"></div>
        <div class="form-field"><label for="italyRuleDelay">Giorni rispetto all’uscita originale</label><input id="italyRuleDelay" type="number" min="-7" max="30" value="${Number(current.delayDays || 0)}"><small>0 = stesso giorno, 1 = giorno successivo.</small></div>
        <div class="form-field"><label for="italyRuleTime">Ora italiana</label><input id="italyRuleTime" type="time" value="${esc(current.time || '')}"><small>Lascia vuoto se non è nota.</small></div>
      </div>`, `<button class="ghost" id="removeItalyRule">Rimuovi correzione</button><button class="primary" id="saveItalyRule">Salva</button>`);
    $('#saveItalyRule').addEventListener('click', async () => {
      series.italyReleaseRule = {
        enabled: $('#italyRuleEnabled').checked,
        provider: $('#italyRuleProvider').value.trim(),
        delayDays: Math.max(-7, Math.min(30, Number($('#italyRuleDelay').value || 0))),
        time: $('#italyRuleTime').value,
        updatedAt: new Date().toISOString()
      };
      await dbPut('series', series); closeModal(); await reloadData(); showToast('Programmazione Italia aggiornata', series.title, '✓'); renderSeriesDetail(series.id);
    });
    $('#removeItalyRule').addEventListener('click', async () => {
      series.italyReleaseRule = null;
      await dbPut('series', series); closeModal(); await reloadData(); showToast('Correzione manuale rimossa', series.title); renderSeriesDetail(series.id);
    });
  }

  function episodeObject(series, seasonNumber, episodeNumber) {
    return (series.seasons || []).flatMap(x => x.episodes || []).find(ep => Number(ep.season ?? seasonNumber) === Number(seasonNumber) && Number(ep.episode ?? ep.number) === Number(episodeNumber));
  }
  async function updateAutomaticItalySchedule(series, force = false) {
    const api = publicMetadataApi();
    if (!api?.lookupItalySchedule || !navigator.onLine || series.italyReleaseRule?.enabled) return false;
    const last = dateMs(series.italyScheduleCheckedAt);
    if (!force && last && Date.now() - last < 1000 * 60 * 60 * 12) return false;
    const start = addDaysToDateKey(todayIso(), -2), end = addDaysToDateKey(todayIso(), 45);
    const candidates = computedSeries(series).episodes.filter(ep => ep.airDate && ep.airDate >= start && ep.airDate <= end).slice(0, 12);
    let changed = false;
    for (const ep of candidates) {
      const target = episodeObject(series, ep.season, ep.episode);
      if (!target || (!force && target.italyScheduleCheckedAt && Date.now() - dateMs(target.italyScheduleCheckedAt) < 1000 * 60 * 60 * 24)) continue;
      try {
        const result = await api.lookupItalySchedule({
          seriesTitle: series.originalTitle || series.title,
          tvmazeShowId: series.publicMetadata?.provider === 'tvmaze' ? series.publicMetadata?.providerId : null,
          tvmazeEpisodeId: target.tvmazeId || null,
          season: ep.season, episode: ep.episode, originalDate: ep.airDate, airStamp: ep.airStamp,
          fallbackProvider: firstStreamingProvider(series) || series.network || ''
        });
        target.italyScheduleCheckedAt = new Date().toISOString();
        if (result) {
          target.italyAirDate = result.dateKey || null;
          target.italyAirTime = result.time || '';
          target.italyAirStamp = result.airStamp || null;
          target.italyProvider = result.provider || '';
          target.italyScheduleSource = result.source || 'Ricerca automatica online';
          target.italyScheduleExact = result.exact === true;
          target.italyScheduleConfidence = result.confidence || (result.exact ? 'exact' : 'estimated');
          if (result.exact) {
            const startsAt = result.airStamp || (result.dateKey ? `${result.dateKey}T${result.time || '00:00'}:00` : null);
            const broadcast = {
              id: `tvmaze-${target.tvmazeId || `${ep.season}-${ep.episode}`}-${result.dateKey || ''}`,
              channel: result.provider || series.network || 'Canale / servizio TV',
              startsAt,
              date: result.dateKey || null,
              episode: `S${pad2(ep.season)} E${pad2(ep.episode)}${target.title ? ` · ${target.title}` : ''}`,
              broadcastType: result.webChannel ? 'Streaming / web TV' : 'Prima visione o replica',
              language: 'Italia',
              guideUrl: result.guideUrl || '',
              source: result.source || 'TVmaze palinsesto Italia'
            };
            const broadcasts = Array.isArray(series.tvBroadcasts) ? series.tvBroadcasts.filter(row => row.id !== broadcast.id) : [];
            series.tvBroadcasts = [...broadcasts, broadcast].sort((a,b)=>dateMs(a.startsAt||a.date)-dateMs(b.startsAt||b.date)).slice(-80);
          }
          changed = true;
        }
      } catch { target.italyScheduleCheckedAt = new Date().toISOString(); }
    }
    series.italyScheduleCheckedAt = new Date().toISOString();
    if (changed || candidates.length) { await dbPut('series', series); invalidateSeriesComputed(series.id); buildNotifications(); }
    return changed;
  }

  function upcomingEpisodes(days = 30) {
    const startKey = todayIso();
    const endKey = daysFromNow(days);
    return state.series.flatMap(series => computedSeries(series).episodes.map(ep => {
      const schedule = episodeScheduleInfo(series, ep);
      return {
        ...ep,
        seriesId: series.id,
        seriesTitle: series.title,
        posterGradient: series.posterGradient,
        poster: series.poster,
        network: series.network || '',
        schedule
      };
    }))
      .filter(ep => ep.schedule.dateKey && ep.schedule.dateKey >= startKey && ep.schedule.dateKey <= endKey)
      .sort((a, b) => a.schedule.sortStamp - b.schedule.sortStamp || a.seriesTitle.localeCompare(b.seriesTitle, 'it') || a.season - b.season || a.episode - b.episode);
  }
  function scheduleLabel(prefix, provider, dateKey, time = '') {
    if (!dateKey) return `${prefix}: data non disponibile`;
    return `${prefix}: ${provider ? `${provider} · ` : ''}${calendarHeading(dateKey)}${time ? ` · ore ${time}` : ''}`;
  }
  function buildNotifications() {
    const tomorrow = daysFromNow(1); const today = todayIso();
    state.notifications = upcomingEpisodes(14).filter(e => e.schedule.dateKey === today || e.schedule.dateKey === tomorrow || e.schedule.original?.dateKey === today || e.schedule.original?.dateKey === tomorrow).map(e => {
      const refDate = e.schedule.italy?.dateKey || e.schedule.original?.dateKey || e.schedule.dateKey;
      const isToday = refDate === today;
      const originalTime = e.schedule.original?.stamp ? new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit', timeZone:'America/New_York', hour12:false }).format(new Date(e.schedule.original.stamp)) : '';
      const originalLine = scheduleLabel('USA', e.schedule.original?.network || e.network || 'Uscita originale', e.schedule.original?.dateKey, originalTime);
      const italyLine = e.schedule.italy
        ? scheduleLabel('Italia', e.schedule.italy.provider || 'Disponibilità italiana', e.schedule.italy.dateKey, e.schedule.italy.time)
        : 'Italia: programmazione non ancora rilevata';
      return {
        id: `notif-${e.seriesId}-${e.season}-${e.episode}`,
        title: `Nuovo episodio ${isToday ? 'oggi' : 'domani'}`,
        episodeLine: `${e.seriesTitle} · S${pad2(e.season)} E${pad2(e.episode)}${e.title ? ` · ${e.title}` : ''}`,
        originalLine, italyLine,
        body: `${originalLine}\n${italyLine}`,
        route: `#/series/${e.seriesId}`,
        poster: e.poster || null,
        posterGradient: e.posterGradient,
        seriesTitle: e.seriesTitle,
        schedule: e.schedule
      };
    });
    const dot = $('#notificationDot'); if (dot) dot.classList.toggle('hidden', state.notifications.length === 0);
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: '⌂', href: '#/home' },
    { id: 'series', label: 'Serie', icon: '▣', href: '#/series' },
    { id: 'movies', label: 'Film', icon: '🎬', href: '#/movies' },
    { id: 'search', label: 'Cerca', icon: '⌕', href: '#/search' },
    { id: 'programming', label: 'Programmazione', icon: '▤', href: '#/programming' }
  ];
  const mobileNavItems = [...navItems];
  const THEME_NAV_ICONS = {
    'last-of-us': {
      home:'<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 82c2-23 8-40 20-53M33 83c-2-29 5-52 21-68M48 83c3-30 14-51 31-65M61 84c5-22 15-36 29-44"/><path class="theme-fill" d="M10 45c10-12 23-14 36-4-12 7-24 8-36 4Zm23-18c11-13 25-13 38-1-13 6-26 6-38 1Zm18 18c12-14 28-14 41 0-15 7-29 7-41 0ZM2 62c11-11 24-10 36 2-13 5-25 4-36-2Zm42 10c12-12 26-10 39 3-14 5-27 4-39-3Z"/></g></svg>',
      series:'<svg viewBox="0 0 100 100" aria-hidden="true"><path class="theme-fill" d="M46 17 18 5 6 12l26 25L5 31 0 43l36 20 9 31h10l9-31 36-20-5-12-27 6 26-25-12-7-28 12-4-17z"/><path class="theme-fill" d="M45 46h10v48H45z"/></svg>',
      movies:'<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M31 30v-7c0-12 34-12 34 0v7M22 36c0-7 5-12 12-12h28c7 0 12 5 12 12v43H22V36Z"/><path d="M31 48h34v25H31zM38 48v-7h20v7M27 39h-8v31h7M69 39h8v31h-7M36 61h24M48 51v20M35 80v8M61 80v8"/></g></svg>',
      search:'<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 103C35 69 54 47 89 19M27 89 9 78M36 74 18 58M47 59 33 40M59 46 50 27M72 34 67 16M82 25 80 9"/><path d="M56 50 34 36 14 48l15 21 18 20 10-23zM60 50l23-14 21 12-16 21-19 20-9-23zM58 49v55M58 41 48 28M58 41l11-14M52 62h12M53 79h10"/></g></svg>',
      programming:'<svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m29 18 18 18-8 8-18-18zM44 37l34 34-13 13-34-34zM56 54l10-10 18 18-10 10"/><path class="theme-detail" d="M24 22 13 11M14 30 3 29M31 13 30 2"/></g></svg>'
    },
    buffy: {
      home:'<svg viewBox="0 0 24 24"><path d="M5 21h14M7 21V9h10v12M5 9h14M12 3v8M8.5 6.5h7"/><path class="theme-detail" d="M9 14h2M13 14h2M9 17h2M13 17h2"/></svg>',
      series:'<svg viewBox="0 0 24 24"><path d="M12 2v20M8 7h8M9 4h6M7 20h10"/><path class="theme-detail" d="m9 7 3 4 3-4"/></svg>',
      movies:'<svg viewBox="0 0 24 24"><path d="M6 21V8a6 6 0 0 1 12 0v13M4 21h16M8 12h8M8 16h8"/><path class="theme-detail" d="M12 4v4"/></svg>',
      search:'<svg viewBox="0 0 24 24"><path d="M12 3v18M7 8h10M8 5h8M5 21h14"/><path class="theme-detail" d="m8 12 4 4 4-4"/></svg>',
      programming:'<svg viewBox="0 0 24 24"><path d="M5 21h14M7 21V9h10v12M5 9h14M12 3v6M8.5 6h7"/><path class="theme-detail" d="M18 4v7M15 7.5h6"/></svg>'
    }
  };
  function themeNavIcon(id, fallback = '') {
    const theme = state.settings?.appearanceTheme || document.documentElement.dataset.theme || 'original';
    return THEME_NAV_ICONS[theme]?.[id] || `<span class="nav-glyph">${esc(fallback)}</span>`;
  }
  function refreshThemeDecorations() {
    $$('.nav-item[data-nav-id]').forEach(link => {
      const definition = navItems.find(item => item.id === link.dataset.navId);
      const icon = $('.nav-icon', link);
      if (definition && icon) icon.innerHTML = themeNavIcon(definition.id, definition.icon);
    });
    const loader = $('#blockingLoader');
    if (loader) loader.dataset.visualTheme = state.settings?.appearanceTheme || 'original';
  }
  function navHtml(items, active) {
    return items.map(n => `<a class="nav-item ${n.id === active ? 'active' : ''}" href="${n.href}" data-nav-id="${n.id}" data-tooltip="${esc(n.label)}" title="${esc(n.label)}" aria-label="${esc(n.label)}"><span class="nav-icon" aria-hidden="true">${themeNavIcon(n.id,n.icon)}</span><span>${n.label}</span></a>`).join('');
  }
  function applySidebarState() {
    const app = $('#app');
    if (!app) return;
    app.classList.toggle('sidebar-collapsed', !!state.sidebarCollapsed);
    document.documentElement.classList.toggle('sidebar-is-collapsed', !!state.sidebarCollapsed);
    const toggle = $('#sidebarToggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!state.sidebarCollapsed));
      toggle.setAttribute('aria-label', state.sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu');
      toggle.title = state.sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu';
      toggle.innerHTML = `<svg class="sidebar-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${state.sidebarCollapsed ? 'm10 7 5 5-5 5' : 'm14 7-5 5 5 5'}"/></svg><span class="sr-only sidebar-toggle-label">${state.sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu'}</span>`;
    }
  }
  function updateProfileEntryPoints() {
    const p = currentProfile();
    if (!p) return;
    const sidebarButton = $('#sidebarProfileButton');
    if (sidebarButton) {
      sidebarButton.innerHTML = `${avatarHtml(p)}<span class="sidebar-profile-copy"><strong>${esc(p.name)}</strong><small>Apri impostazioni</small></span>`;
      sidebarButton.setAttribute('aria-label', `Apri le impostazioni del profilo ${p.name}`);
      sidebarButton.setAttribute('data-tooltip', `Profilo: ${p.name}`);
      sidebarButton.title = `Profilo: ${p.name}`;
      sidebarButton.title = `Profilo ${p.name}`;
    }
    const mobileButton = $('#mobileProfileButton');
    if (mobileButton) {
      mobileButton.innerHTML = avatarHtml(p);
      mobileButton.setAttribute('aria-label', `Apri le impostazioni del profilo ${p.name}`);
      mobileButton.title = `Profilo ${p.name}`;
    }
  }
  function renderNav(active) {
    $('#desktopNav').innerHTML = navHtml(navItems, active);
    $('#mobileNav').innerHTML = navHtml(mobileNavItems, active);
    updateProfileEntryPoints();
    applySidebarState();
  }
  function setPage(title, eyebrow = 'La tua libreria', active = 'home') {
    $('#pageTitle').textContent = title; $('#pageEyebrow').textContent = eyebrow; document.title = `${title} · Watchverse`; renderNav(active); updateMetadataHeader();
  }
  function setMain(html) { const main = $('#main'); main.innerHTML = html; main.focus({ preventScroll: true }); }
  function updateBackToTopButton() {
    const button = $('#backToTopButton');
    if (!button) return;
    const appVisible = !$('#app')?.classList.contains('hidden') && state.profileSelected;
    const visible = appVisible && window.scrollY > 520;
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  }
  function scrollBackToTop() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top:0, behavior:reduced ? 'auto' : 'smooth' });
    setTimeout(() => $('#main')?.focus({ preventScroll:true }), reduced ? 0 : 420);
  }

  function aivengersMessageHtml(role, html) {
    return `<article class="aivengers-message ${role}"><span class="aivengers-message-avatar" aria-hidden="true">${role === 'assistant' ? AIVENGERS_ICON_SVG : avatarContent(currentProfile())}</span><div>${html}</div></article>`;
  }
  function applyAivengerBranding() {
    $('#aivengersButton')?.setAttribute('aria-label', 'Apri assistente AIvenger');
    $('#aivengersButton')?.setAttribute('title', 'Apri assistente AIvenger');
    $('#aivengersPanel')?.setAttribute('aria-label', 'Chat con AIvenger');
    $('#aivengersClose')?.setAttribute('aria-label', 'Chiudi AIvenger');
    $('.aivengers-title strong')?.replaceChildren(document.createTextNode('AIvenger'));
    $('.aivengers-title small')?.replaceChildren(document.createTextNode('Assistente di Watchverse'));
    $('#aivengersInput')?.setAttribute('aria-label', 'Scrivi una domanda ad AIvenger');
    $('#aivengersInput')?.setAttribute('placeholder', 'Chiedi qualcosa ad AIvenger');
    $('#aivengersButton .sr-only')?.replaceChildren(document.createTextNode('AIvenger'));
  }
  function appendAivengersMessage(role, html) {
    const messages = $('#aivengersMessages');
    if (!messages) return;
    messages.insertAdjacentHTML('beforeend', aivengersMessageHtml(role, html));
    messages.scrollTop = messages.scrollHeight;
  }
  function aivengersSuggestionsHtml() {
    const suggestions = [
      '📅 Episodi prossima settimana',
      '🎬 Nuovi episodi di oggi',
      '✨ Suggeriscimi un film',
      '↗ Apri la sezione Film'
    ];
    return suggestions.map(text => `<button type="button" data-aivengers-suggestion="${esc(text)}">${esc(text)}</button>`).join('');
  }
  function initializeAivengers() {
    if (state.aivengersInitialized) return;
    state.aivengersInitialized = true;
    applyAivengerBranding();
    const messages = $('#aivengersMessages');
    if (messages) messages.innerHTML = aivengersMessageHtml('assistant', '<p>Ciao, sono il tuo assistente <strong>AIvenger</strong>. Come posso aiutarti?</p>');
    const suggestions = $('#aivengersSuggestions');
    if (suggestions) suggestions.innerHTML = aivengersSuggestionsHtml();
    $$('[data-aivengers-suggestion]').forEach(button => button.addEventListener('click', () => {
      const input = $('#aivengersInput');
      if (input) input.value = button.dataset.aivengersSuggestion;
      submitAivengersQuestion(button.dataset.aivengersSuggestion);
    }));
  }
  function openAivengers() {
    initializeAivengers();
    const panel = $('#aivengersPanel');
    const button = $('#aivengersButton');
    panel?.classList.add('is-open');
    panel?.setAttribute('aria-hidden', 'false');
    button?.setAttribute('aria-expanded', 'true');
    setTimeout(() => $('#aivengersInput')?.focus(), 60);
  }
  function closeAivengers() {
    const panel = $('#aivengersPanel');
    const button = $('#aivengersButton');
    panel?.classList.remove('is-open');
    panel?.setAttribute('aria-hidden', 'true');
    button?.setAttribute('aria-expanded', 'false');
    button?.focus();
  }
  function aivengersUpcomingAnswer(days = 7, onlyToday = false) {
    const start = todayIso();
    const end = onlyToday ? start : daysFromNow(days);
    const items = upcomingEpisodes(Math.max(1, days)).filter(item => item.schedule.dateKey >= start && item.schedule.dateKey <= end).slice(0, 8);
    if (!items.length) return `<p>Non risultano episodi ${onlyToday ? 'in uscita oggi' : 'programmati nei prossimi sette giorni'} con i dati attualmente disponibili.</p><p class="aivengers-note">Posso aggiornare la risposta quando le fonti di programmazione sono configurate.</p>`;
    return `<p>${onlyToday ? 'Oggi risultano:' : 'Nei prossimi sette giorni risultano:'}</p><ul>${items.map(item => `<li><a href="#/series/${encodeURIComponent(item.seriesId)}"><strong>${esc(item.seriesTitle)}</strong> · S${pad2(item.season)} E${pad2(item.episode)}${item.title ? ` · ${esc(item.title)}` : ''}</a><br><small>${esc(item.schedule.italy?.provider || item.schedule.original?.network || item.network || 'Fonte non indicata')} · ${esc(fmtDate(item.schedule.dateKey))}</small></li>`).join('')}</ul>`;
  }
  function aivengersMovieSuggestion() {
    const liked = state.movies.filter(movie => movie.favorite || Number(movie.rating || 0) >= 4);
    const genreWeights = new Map();
    liked.forEach(movie => (movie.genres || []).forEach(genre => genreWeights.set(genre, (genreWeights.get(genre) || 0) + 1)));
    const candidates = state.movies.filter(movie => !movie.watched).map(movie => ({
      movie,
      score: (movie.favorite ? 3 : 0) + Number(movie.rating || 0) + (movie.genres || []).reduce((sum, genre) => sum + (genreWeights.get(genre) || 0), 0)
    })).sort((a, b) => b.score - a.score || dateMs(b.releaseDate || b.createdAt) - dateMs(a.releaseDate || a.createdAt));
    const selected = candidates[0]?.movie;
    if (!selected) return '<p>Non trovo ancora un film da vedere nella tua libreria. Aggiungi qualche titolo o importa la cronologia: userò preferiti, voti e generi per proporti qualcosa.</p>';
    const reasons = (selected.genres || []).filter(genre => genreWeights.has(genre)).slice(0, 3);
    return `<p>Ti suggerisco <a href="#/movie/${encodeURIComponent(selected.id)}"><strong>${esc(selected.title)}</strong></a>${selected.year ? ` (${esc(selected.year)})` : ''}.</p><p>${reasons.length ? `È vicino ai tuoi gusti per i generi ${esc(reasons.join(', '))}.` : 'È tra i titoli da vedere più pertinenti presenti nella tua libreria.'}</p><a class="aivengers-action" href="#/movie/${encodeURIComponent(selected.id)}">Apri il film →</a>`;
  }
  function aivengersFindLibraryTitle(items, query) {
    const normalized = normalizeSearch(query);
    return items.filter(item => {
      const title = normalizeSearch(item.title);
      return title && (normalized.includes(title) || title.includes(normalized));
    }).sort((a, b) => normalizeSearch(b.title).length - normalizeSearch(a.title).length)[0] || null;
  }
  function aivengersSeasonNumber(query) {
    const ordinals = { prima:1, primo:1, seconda:2, secondo:2, terza:3, terzo:3, quarta:4, quarto:4, quinta:5, quinto:5, sesta:6, sesto:6, settima:7, settimo:7, ottava:8, ottavo:8, nona:9, nono:9, decima:10, decimo:10 };
    const ordinal = query.match(/\b(prima|primo|seconda|secondo|terza|terzo|quarta|quarto|quinta|quinto|sesta|sesto|settima|settimo|ottava|ottavo|nona|nono|decima|decimo)\s+stagion/);
    if (ordinal) return ordinals[ordinal[1]];
    const numeric = query.match(/\bstagion(?:e|i)?\s*(?:numero\s*)?(\d+)\b/);
    return numeric ? Number(numeric[1]) : null;
  }
  async function aivengersMarkWatched(rawQuestion) {
    const query = normalizeSearch(rawQuestion);
    if (!query.includes('segna') || !query.includes('vist')) return null;
    const episodeMatch = query.match(/\bepisod(?:io|e)?\s*(\d+)\b/);
    if (episodeMatch) {
      const season = aivengersSeasonNumber(query);
      if (!season) return '<p>Indica anche la stagione, per esempio: <strong>segna come visto episodio 3 stagione 1 di From</strong>.</p>';
      const series = aivengersFindLibraryTitle(state.series, query);
      if (!series) return '<p>Non trovo questa serie nel profilo attivo. Aggiungila alla libreria e riprova.</p>';
      const episode = Number(episodeMatch[1]);
      const metadata = allEpisodes(series).find(item => Number(item.season) === season && Number(item.episode) === episode);
      const existing = progressRecord(series.id, season, episode);
      const record = existing || { id: `${state.profileId}|${String(series.id).split('|').pop()}:s${season}:e${episode}`, profileId: state.profileId, seriesId: series.id, season, episode, title: metadata?.title || `Episodio ${episode}`, runtime: metadata?.runtime || 50 };
      record.watched = true; record.watchedAt = new Date().toISOString();
      if (!existing) state.progress.push(record);
      await dbPut('progress', record); rebuildIndexes(); route();
      return `<p>Fatto: ho segnato come visto <a href="#/series/${encodeURIComponent(series.id)}"><strong>${esc(series.title)}</strong></a>, stagione ${season}, episodio ${episode}.</p>`;
    }
    const movie = aivengersFindLibraryTitle(state.movies, query);
    if (!movie) return '<p>Non trovo questo film nella libreria del profilo attivo. Aggiungilo e riprova.</p>';
    movie.watched = true; movie.state = 'watched'; movie.watchedAt = new Date().toISOString();
    await dbPut('movies', movie); route();
    return `<p>Fatto: ho segnato come visto <a href="#/movie/${encodeURIComponent(movie.id)}"><strong>${esc(movie.title)}</strong></a>.</p>`;
  }
  async function submitAivengersQuestion(rawQuestion) {
    const question = String(rawQuestion || '').trim();
    if (!question) return;
    appendAivengersMessage('user', `<p>${esc(question)}</p>`);
    const q = normalizeSearch(question);
    let answer = '';
    const watchedAnswer = await aivengersMarkWatched(question);
    if (watchedAnswer) answer = watchedAnswer;
    else if ((q.includes('prossima settimana') || q.includes('prossimi sette') || q.includes('prossimi 7')) && (q.includes('episod') || q.includes('serie'))) answer = aivengersUpcomingAnswer(7, false);
    else if ((q.includes('oggi') || q.includes('odierno')) && q.includes('episod')) answer = aivengersUpcomingAnswer(1, true);
    else if ((q.includes('sugger') || q.includes('consigl')) && q.includes('film')) answer = aivengersMovieSuggestion();
    else if ((q.includes('vai') || q.includes('apri')) && q.includes('film')) {
      answer = '<p>Ti porto nella sezione Film.</p>';
      setTimeout(() => { location.hash = '#/movies'; closeAivengers(); }, 450);
    } else if ((q.includes('vai') || q.includes('apri')) && q.includes('serie')) {
      answer = '<p>Ti porto nella sezione Serie.</p>';
      setTimeout(() => { location.hash = '#/series'; closeAivengers(); }, 450);
    } else if ((q.includes('vai') || q.includes('apri')) && q.includes('programmazione')) {
      answer = '<p>Ti porto nella Programmazione.</p>';
      setTimeout(() => { location.hash = '#/programming'; closeAivengers(); }, 450);
    } else if ((q.includes('vai') || q.includes('apri')) && q.includes('profil')) {
      answer = '<p>Apro le impostazioni del profilo attivo.</p>';
      setTimeout(() => { location.hash = '#/settings'; closeAivengers(); }, 450);
    } else {
      answer = '<p>Posso riassumere le uscite degli episodi, suggerire un film, segnare film ed episodi come visti e aprire le principali sezioni di Watchverse.</p><p class="aivengers-note">Prova una delle domande suggerite qui sotto.</p>';
    }
    appendAivengersMessage('assistant', answer);
    const input = $('#aivengersInput');
    if (input) input.value = '';
  }

  function metadataItemDiagnostics(item, kind) {
    const missing = [];
    if (!item.poster) missing.push('Locandina');
    if (isImportedPlaceholder(item.overview)) missing.push('Descrizione');
    const hasCast = Array.isArray(item.cast) && item.cast.length > 0;
    if (!hasCast) missing.push('Cast');
    if (kind === 'series') {
      const episodes = allEpisodes(item);
      const hasUsefulEpisodes = episodes.length > 0 && episodes.some(ep => ep.airDate || (ep.title && !/^Episodio \d+$/i.test(ep.title)));
      if (!hasUsefulEpisodes) missing.push('Episodi');
    }
    const error = item.publicMetadata?.error || null;
    const failedAt = item.publicMetadata?.failedAt || null;
    const essentialMissing = missing.filter(label => label === 'Locandina' || label === 'Descrizione');
    return {
      item,
      kind,
      missing,
      essentialMissing,
      error,
      failedAt,
      essentialComplete: essentialMissing.length === 0,
      extendedComplete: missing.length === 0 && !error
    };
  }

  function metadataDiagnostics(items = null) {
    const diagnostics = items || [
      ...state.series.map(item => metadataItemDiagnostics(item, 'series')),
      ...state.movies.map(item => metadataItemDiagnostics(item, 'movie'))
    ];
    const essentialIncomplete = diagnostics.filter(row => !row.essentialComplete);
    const supplementalIncomplete = diagnostics.filter(row => row.essentialComplete && row.missing.length > 0);
    const errors = diagnostics.filter(row => !!row.error || !!row.failedAt);
    return { diagnostics, essentialIncomplete, supplementalIncomplete, errors };
  }

  function metadataGlobalStatus() {
    const allRows = [
      ...state.series.map(item => metadataItemDiagnostics(item, 'series')),
      ...state.movies.map(item => metadataItemDiagnostics(item, 'movie'))
    ];
    const totalTitles = allRows.length;
    const coreReady = allRows.filter(row => row.essentialComplete).length;
    const castReady = allRows.filter(row => !row.missing.includes('Cast')).length;
    const seriesRows = allRows.filter(row => row.kind === 'series');
    const episodesReady = seriesRows.filter(row => !row.missing.includes('Episodi')).length;
    const missingPoster = allRows.filter(row => row.missing.includes('Locandina')).length;
    const missingOverview = allRows.filter(row => row.missing.includes('Descrizione')).length;
    const missingCast = allRows.filter(row => row.missing.includes('Cast')).length;
    const missingEpisodes = allRows.filter(row => row.missing.includes('Episodi')).length;
    const failed = allRows.filter(row => !!row.error || !!row.failedAt).length;
    const essentialIncomplete = allRows.filter(row => !row.essentialComplete).length;
    const supplementalIncomplete = allRows.filter(row => row.essentialComplete && row.missing.length > 0).length;
    const coveragePercent = totalTitles ? Math.max(0, Math.min(100, Math.round(coreReady / totalTitles * 100))) : 100;
    const extendedCoveragePercent = totalTitles ? Math.max(0, Math.min(100, Math.round(allRows.filter(row => row.extendedComplete).length / totalTitles * 100))) : 100;
    const active = state.metadataQueue.length + state.metadataRunning > 0;
    const batchCompleted = !active && (state.metadataBackgroundStarted || totalTitles === 0);
    const cyclePercent = batchCompleted ? 100 : (active ? Math.max(1, Math.min(99, Math.round((state.metadataCompletedThisSession + state.metadataFailedThisSession) / Math.max(1, state.metadataCompletedThisSession + state.metadataFailedThisSession + state.metadataQueue.length + state.metadataRunning) * 100))) : 0);
    return {
      totalTitles,
      coreReady,
      castReady,
      episodesReady,
      completedSteps: coreReady,
      percent: coveragePercent,
      coveragePercent,
      extendedCoveragePercent,
      cyclePercent,
      batchCompleted,
      incomplete: essentialIncomplete,
      essentialIncomplete,
      supplementalIncomplete,
      unresolvedSteps: essentialIncomplete,
      missingPoster,
      missingOverview,
      missingCast,
      missingEpisodes,
      failed,
      diagnostics: allRows,
      queued: state.metadataQueue.length,
      running: state.metadataRunning,
      active
    };
  }

  function scheduleMetadataHeaderUpdate() {
    clearTimeout(state.metadataHeaderTimer);
    state.metadataHeaderTimer = setTimeout(updateMetadataHeader, 180);
  }
  function updateMetadataHeader() {
    const button = $('#metadataStatusButton');
    if (!button) return;
    if (!state.profileSelected || libraryIsEmpty() || !state.settings.publicMetadataEnabled) {
      button.classList.add('hidden');
      return;
    }
    const status = metadataGlobalStatus();
    button.classList.remove('hidden');
    button.classList.toggle('is-working', status.active);
    button.classList.toggle('has-errors', status.failed > 0 && !status.active);
    const label = $('#metadataStatusLabel');
    const summary = $('#metadataStatusSummary');
    const fill = $('#metadataStatusBar');
    if (label) label.textContent = `Metadati ${status.coveragePercent}%`;
    if (summary) summary.textContent = status.active
      ? `${status.running} in corso · ${status.queued} in coda · copertura ${status.coveragePercent}%`
      : status.incomplete > 0
        ? `${status.incomplete} titoli incompleti${status.failed ? ` · ${status.failed} errori` : ''}`
        : 'Catalogo completo';
    if (fill) fill.style.width = `${status.coveragePercent}%`;
    button.setAttribute('aria-label', `${label?.textContent || 'Stato metadati'}. ${summary?.textContent || ''}`);
  }
  async function syncDefaultPublicSources(force = false) {
    if (state.defaultSourceSyncRunning || !state.profileSelected) return state.defaultSourceStatus;
    if (!state.defaultSourceStatus) loadDefaultSourceStatus();
    const config = defaultSourceConfig();
    const now = new Date().toISOString();
    const totalTitles = state.series.length + state.movies.length;
    const actualStreaming = [...state.series,...state.movies].filter(x=>Object.values(x.providerGroups||{}).some(rows=>Array.isArray(rows)&&rows.length)).length;
    const checkedStreaming=[...state.series,...state.movies].filter(x=>x.providerCheckedAt||x.providersUpdatedAt).length;
    state.defaultSourceStatus.streaming = {
      checked: checkedStreaming,
      actual: actualStreaming,
      last: checkedStreaming ? now : (state.defaultSourceStatus.streaming?.last||null),
      mode: 'actual-only'
    };
    const cinemas = preferredCinemas();
    state.defaultSourceStatus.cinema = {
      linkedCinemas: config.cinema.enabled ? cinemas.filter(x=>x.officialUrl).length : 0,
      actual: state.movies.reduce((sum,item)=>sum+(item.cinemaShowtimes||[]).length,0),
      last: now
    };
    const refreshMs = Math.max(1, Number(config.tvSchedule.refreshHours || 12)) * 60 * 60 * 1000;
    const previous = dateMs(state.defaultSourceStatus.tv?.last);
    if (config.tvSchedule.enabled && navigator.onLine && (force || !previous || Date.now() - previous >= refreshMs)) {
      state.defaultSourceSyncRunning = true;
      let checked = 0;
      try {
        const priority = state.series.slice().sort((a,b)=>{
          const aUpcoming = computedSeries(a).episodes.some(ep=>ep.airDate&&ep.airDate>=addDaysToDateKey(todayIso(),-2)&&ep.airDate<=daysFromNow(Number(config.tvSchedule.daysAhead||7)+7));
          const bUpcoming = computedSeries(b).episodes.some(ep=>ep.airDate&&ep.airDate>=addDaysToDateKey(todayIso(),-2)&&ep.airDate<=daysFromNow(Number(config.tvSchedule.daysAhead||7)+7));
          return Number(bUpcoming)-Number(aUpcoming);
        }).slice(0, force ? 24 : 10);
        for (const series of priority) {
          await updateAutomaticItalySchedule(series, force).catch(()=>false);
          checked += 1;
        }
        const matches = state.series.reduce((sum,item)=>sum+(item.tvBroadcasts||[]).filter(row=>dateMs(row.startsAt||row.date)>=Date.now()-86400000).length,0);
        state.defaultSourceStatus.tv = { checked, matches, last:now };
      } finally {
        state.defaultSourceSyncRunning = false;
      }
    } else if (config.tvSchedule.enabled && !state.defaultSourceStatus.tv?.last) {
      state.defaultSourceStatus.tv = { checked:0, matches:0, last:null };
    }
    saveDefaultSourceStatus();
    scheduleMetadataHeaderUpdate();
    return state.defaultSourceStatus;
  }

  function sourceConfigurationRows() {
    const cfg=window.WATCHVERSE_CONFIG||{};
    const defaults=defaultSourceConfig();
    const tmdbReady=!!(state.settings.tmdbToken||cfg.tmdbProxyUrl);
    const publicReady=!!publicMetadataApi();
    const status=state.defaultSourceStatus||emptyDefaultSourceStatus();
    const tvItems=[...state.series,...state.movies].filter(x=>(x.tvBroadcasts||[]).length).length;
    const cinemaItems=state.movies.filter(x=>(x.cinemaShowtimes||[]).length).length;
    const streamingItems=[...state.series,...state.movies].filter(x=>Object.values(x.providerGroups||{}).some(rows=>Array.isArray(rows)&&rows.length)).length;
    const publicSourcesReady=publicSourcesBaseUrl()!==null;
    const streamingSource = tmdbReady ? 'JustWatch tramite TMDB' : 'TMDB non configurato';
    return [
      {category:'Metadati catalogo',source:publicReady?'TVmaze · Wikipedia · Wikidata':'Da collegare',type:'API e siti pubblici',purpose:'Titoli, descrizioni, immagini, cast, stagioni ed episodi',updated:state.catalogEntries.map(x=>x.updatedAt).sort().at(-1)||null,frequency:'Graduale; serie attive ogni 3 giorni',status:publicReady?'updated':'to-configure',info:'https://www.tvmaze.com'},
      {category:'Immagini',source:publicReady?'TVmaze · Wikimedia Commons':'Da collegare',type:'API e repository pubblici',purpose:'Locandine, backdrop e foto del cast',updated:state.catalogEntries.map(x=>x.updatedAt).sort().at(-1)||null,frequency:'Con il catalogo',status:publicReady?'updated':'to-configure',info:'https://commons.wikimedia.org/'},
      {category:'Trailer',source:tmdbReady?'TMDB → YouTube':(publicSourcesReady?'Ricerca pubblica YouTube tramite server locale':'Fonte non collegata'),type:tmdbReady?'API partner':(publicSourcesReady?'Ricerca pubblica filtrata':'Da configurare'),purpose:'Mostrare un trailer pertinente; viene indicato come ufficiale solo quando la fonte lo identifica così',updated:[...state.series,...state.movies].map(x=>x.trailerCheckedAt).filter(Boolean).sort().at(-1)||null,frequency:'Su apertura, cache 30 giorni',status:(tmdbReady||publicSourcesReady)?'partial':'unavailable',info:tmdbReady?'https://www.themoviedb.org/':'https://www.youtube.com/'},
      {category:'Disponibilità streaming Italia',source:streamingSource,type:tmdbReady?'API partner':'Da configurare',purpose:'Mostrare esclusivamente streaming, noleggio e acquisto effettivamente restituiti per l’Italia; altrimenti nessuna disponibilità',updated:status.streaming.last||null,frequency:'Su apertura o aggiornamento del titolo; cache 24 ore',status:streamingItems?'partial':(tmdbReady?'configured':'unavailable'),info:'https://www.justwatch.com/it'},
      {category:'Palinsesti TV Italia',source:publicReady?`${defaults.tvSchedule.provider || 'TVmaze'} · paese IT`:'Da collegare',type:'API pubblica',purpose:'Controllo dei passaggi TV/web italiani per gli episodi della libreria',updated:status.tv.last||null,frequency:`Ogni ${Number(defaults.tvSchedule.refreshHours||12)} ore; controllo mirato sui titoli`,status:publicReady?'updated':'to-configure',info:'https://www.tvmaze.com'},
      {category:'Programmazione cinema Italia',source:status.cinema.linkedCinemas?`${status.cinema.linkedCinemas} siti ufficiali di sale preferite`:'Siti ufficiali delle sale predefinite',type:'Siti ufficiali degli esercenti',purpose:'Mostrare solo gli orari trovati per il titolo sui siti ufficiali; senza risultati viene mostrata informazione non disponibile',updated:status.cinema.last||null,frequency:'Su apertura del film; cache 6 ore',status:defaults.cinema.enabled?(publicSourcesReady?'configured':'partial'):'to-configure',info:preferredCinemas().find(x=>x.officialUrl)?.officialUrl||null}
    ];
  }
  function sourceStatusLabel(status){return ({updated:'Aggiornato',configured:'Configurato',partial:'Parziale','to-configure':'Da configurare',unavailable:'Non disponibile'}[status]||status);}
  function sourceStatusClass(status){return status==='updated'||status==='configured'?'success':status==='partial'?'warning':'pending';}
  function sourceRowsHtml(){
    return `<div class="source-table">${sourceConfigurationRows().map(row=>`<article class="source-row"><div><h4>${esc(row.category)}</h4><p>${esc(row.source)}</p></div><div class="source-purpose"><strong>${esc(row.type)}</strong><p>${esc(row.purpose)}</p></div><div class="source-meta"><span>Ultimo aggiornamento: <strong>${row.updated?fmtDateTime(row.updated):'—'}</strong></span><span>Frequenza: <strong>${esc(row.frequency)}</strong></span></div><div class="source-actions"><span class="status-badge ${sourceStatusClass(row.status)}">${esc(sourceStatusLabel(row.status))}</span>${row.info?`<a class="section-link" href="${esc(row.info)}" target="_blank" rel="noopener noreferrer">Informazioni sulla fonte ↗</a>`:''}</div></article>`).join('')}</div>`;
  }
  function syncSourceGroups(status) {
    const cfg=window.WATCHVERSE_CONFIG||{};
    const defaults=defaultSourceConfig();
    const tmdbReady=!!(state.settings.tmdbToken||cfg.tmdbProxyUrl);
    const sourceState=state.defaultSourceStatus||emptyDefaultSourceStatus();
    const total=Math.max(1,status.totalTitles);
    const streamingCount=[...state.series,...state.movies].filter(x=>Object.values(x.providerGroups||{}).some(rows=>Array.isArray(rows)&&rows.length)).length;
    const tvCount=[...state.series,...state.movies].filter(x=>(x.tvBroadcasts||[]).length||x.italyScheduleCheckedAt).length;
    const cinemaShowtimes=state.movies.reduce((sum,x)=>sum+(x.cinemaShowtimes||[]).length,0);
    const linkedCinemas=preferredCinemas().filter(x=>x.officialUrl).length;
    return [
      {name:'Catalogo e metadati',percent:status.coveragePercent,state:status.active?`Aggiornamento in corso · copertura ${status.coveragePercent}%`:(status.essentialIncomplete||status.failed)?`Copertura ${status.coveragePercent}% · ${status.essentialIncomplete} titoli da verificare${status.failed?` · ${status.failed} errori tecnici`:''}`:'Catalogo completo',updated:status.coreReady,updatedLabel:'Titoli con locandina e descrizione',errors:status.failed,last:state.catalogEntries.map(x=>x.updatedAt).sort().at(-1)||null,next:status.active?'In corso':status.essentialIncomplete?'Riprova automatica e correzione dal dettaglio elementi':'Controllo incrementale al prossimo avvio'},
      {name:'Disponibilità streaming in Italia',percent:Math.round(streamingCount/total*100),state:streamingCount?`Disponibilità effettiva trovata per ${streamingCount} titoli`:tmdbReady?'Nessuna disponibilità ancora trovata':'TMDB non configurato',updated:sourceState.streaming.checked||0,updatedLabel:'Titoli controllati',errors:0,last:sourceState.streaming.last||null,next:tmdbReady?'Su apertura o aggiornamento del titolo':'Configura TMDB per il controllo JustWatch'},
      {name:'Palinsesti TV italiani',percent:publicMetadataApi()?100:0,state:publicMetadataApi()?`Fonte pubblica preconfigurata${sourceState.tv.matches?` · ${sourceState.tv.matches} passaggi trovati`:''}`:'Da configurare',updated:sourceState.tv.checked||tvCount,updatedLabel:'Titoli controllati',errors:0,last:sourceState.tv.last||null,next:`Controllo automatico ogni ${Number(defaults.tvSchedule.refreshHours||12)} ore`},
      {name:'Programmazione cinema',percent:state.movies.length?Math.round(state.movies.filter(x=>x.cinemaCheckedAt).length/state.movies.length*100):0,state:linkedCinemas?`${linkedCinemas} siti ufficiali collegati${cinemaShowtimes?` · ${cinemaShowtimes} spettacoli trovati`:' · nessun orario ancora trovato'}`:'Da configurare',updated:state.movies.filter(x=>x.cinemaCheckedAt).length,updatedLabel:'Film controllati',errors:0,last:sourceState.cinema.last||null,next:'Su apertura del film; solo orari dai siti ufficiali'}
    ];
  }
  function syncGroupHtml(group){
    return `<article class="sync-source-group"><div class="sync-source-head"><div><strong>${esc(group.name)}</strong><span>${esc(group.state)}</span></div><b>${group.percent}%</b></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,group.percent))}%"></div></div><div class="sync-source-meta"><span>${esc(group.updatedLabel||'Elementi aggiornati')}: <strong>${Number(group.updated||0).toLocaleString('it-IT')}</strong></span><span>Errori: <strong>${Number(group.errors||0).toLocaleString('it-IT')}</strong></span><span>Ultimo tentativo: <strong>${group.last?fmtDateTime(group.last):'—'}</strong></span><span>Prossimo aggiornamento: <strong>${esc(group.next||'—')}</strong></span></div></article>`;
  }

  function metadataIssueRowHtml(row) {
    const route = row.kind === 'series' ? `#/series/${encodeURIComponent(row.item.id)}` : `#/movie/${encodeURIComponent(row.item.id)}`;
    const type = row.kind === 'series' ? 'Serie TV' : 'Film';
    const missing = row.missing.length ? row.missing.join(', ') : 'Nessun campo mancante';
    return `<article class="metadata-issue-row" data-kind="${row.kind}" data-id="${esc(row.item.id)}"><div class="metadata-issue-main"><span class="result-kicker">${type}${row.item.year?` · ${esc(row.item.year)}`:''}</span><h4>${esc(row.item.title||'Titolo senza nome')}</h4><p><strong>Da completare:</strong> ${esc(missing)}</p>${row.error?`<p class="metadata-error-copy"><strong>Errore tecnico:</strong> ${esc(row.error)}</p>`:''}</div><div class="metadata-issue-actions"><a class="ghost compact" data-metadata-open href="${route}">Apri scheda</a><button class="secondary compact" type="button" data-metadata-retry>Riprova</button></div></article>`;
  }

  function showMetadataIssues(filter = 'all') {
    const all = metadataGlobalStatus().diagnostics.filter(row => !row.essentialComplete || row.error || row.failedAt || row.missing.length);
    const rows = all.filter(row => filter === 'all' || row.kind === filter).sort((a,b)=>Number(!b.essentialComplete)-Number(!a.essentialComplete)||Number(!!b.error)-Number(!!a.error)||String(a.item.title).localeCompare(String(b.item.title),'it'));
    const coreIssues = rows.filter(row => !row.essentialComplete).length;
    const technicalErrors = rows.filter(row => row.error || row.failedAt).length;
    openModal('Dettaglio metadati', `<div class="metadata-issues"><div class="metadata-issues-summary"><div><strong>${coreIssues}</strong><span>Titoli senza locandina o descrizione</span></div><div><strong>${technicalErrors}</strong><span>Errori tecnici registrati</span></div><div><strong>${rows.length}</strong><span>Elementi mostrati</span></div></div><div class="metadata-issue-filters" role="tablist" aria-label="Filtra elementi"><button type="button" role="tab" class="${filter==='all'?'active':''}" data-metadata-filter="all">Tutti</button><button type="button" role="tab" class="${filter==='movie'?'active':''}" data-metadata-filter="movie">Film</button><button type="button" role="tab" class="${filter==='series'?'active':''}" data-metadata-filter="series">Serie TV</button></div><p class="notice">La percentuale metadati usa lo stesso criterio in header, librerie e pannello fonti: un titolo è coperto quando dispone almeno di locandina e descrizione. Cast ed episodi incompleti sono indicati nel dettaglio, ma non alterano questa percentuale.</p><div class="metadata-issue-list">${rows.length?rows.map(metadataIssueRowHtml).join(''):'<div class="empty-state compact"><h3>Nessun elemento da verificare</h3><p>La copertura dei metadati essenziali è completa.</p></div>'}</div></div>`, `<button class="secondary" id="retryAllMetadataIssues" type="button">Riprova tutti gli elementi mostrati</button><button class="primary" id="closeMetadataIssues" type="button">Chiudi</button>`);
    $$('[data-metadata-filter]').forEach(button=>button.addEventListener('click',()=>showMetadataIssues(button.dataset.metadataFilter)));
    $$('[data-metadata-open]').forEach(link=>link.addEventListener('click',()=>closeModal()));
    $$('[data-metadata-retry]').forEach(button=>button.addEventListener('click',()=>{
      const row=button.closest('.metadata-issue-row');
      const kind=row.dataset.kind; const collection=kind==='series'?state.series:state.movies; const item=collection.find(x=>x.id===row.dataset.id);
      if(!item)return;
      item.publicMetadata={...(item.publicMetadata||{}),failedAt:null,error:null,parts:{...(item.publicMetadata?.parts||{}),coreComplete:false}};
      state.metadataAutoBudget+=2;
      queuePublicMetadata(kind,[item],{force:true,unlimited:true,includeCast:true,silent:false});
      closeModal(); showToast('Nuovo tentativo avviato',item.title,'↻');
    }));
    $('#retryAllMetadataIssues')?.addEventListener('click',()=>{
      for(const row of rows){row.item.publicMetadata={...(row.item.publicMetadata||{}),failedAt:null,error:null,parts:{...(row.item.publicMetadata?.parts||{}),coreComplete:false}};}
      const series=rows.filter(row=>row.kind==='series').map(row=>row.item); const movies=rows.filter(row=>row.kind==='movie').map(row=>row.item);
      state.metadataAutoBudget+=rows.length;
      queuePublicMetadata('series',series,{force:true,unlimited:true,includeCast:true,silent:true});
      queuePublicMetadata('movie',movies,{force:true,unlimited:true,includeCast:true,silent:true});
      closeModal(); showToast('Verifica metadati avviata',`${rows.length} titoli sono stati rimessi in coda.`,'↻',4200);
    });
    $('#closeMetadataIssues')?.addEventListener('click',closeModal);
  }

  function showMetadataStatus() {
    const s = metadataGlobalStatus();
    const groups=syncSourceGroups(s);
    const cycleText = s.active ? `Ciclo in corso · ${s.cyclePercent}%` : (s.batchCompleted ? 'Ciclo terminato' : 'Ciclo non ancora avviato');
    openModal('Stato aggiornamento fonti', `<div class="metadata-status-detail"><div class="metadata-status-big"><strong>${s.coveragePercent}%</strong><span>Copertura effettiva dei metadati</span><small>${cycleText}</small></div><div class="progress-track metadata-progress large"><div class="progress-fill" style="width:${s.coveragePercent}%"></div></div><div class="metadata-recap-grid"><div><strong>${s.totalTitles.toLocaleString('it-IT')}</strong><span>Titoli del profilo</span></div><div><strong>${s.essentialIncomplete.toLocaleString('it-IT')}</strong><span>Titoli da verificare</span></div><div><strong>${s.failed.toLocaleString('it-IT')}</strong><span>Errori tecnici</span></div></div><div class="sync-source-groups">${groups.map(syncGroupHtml).join('')}</div>${s.active ? `<p class="metadata-live-line"><span class="inline-spinner" aria-hidden="true"></span>${s.running} elaborazioni attive e ${s.queued} titoli in coda. Puoi continuare a usare l’app.</p>` : ''}</div>`, `<button class="ghost" id="openSourceDetails">Vedi fonti</button><button class="ghost" id="openMetadataIssues">Dettaglio titoli</button><button class="secondary" id="retryMetadata">Riprova non riusciti</button><button class="primary" id="resumeMetadata">Aggiorna ora</button>`);
    $('#openSourceDetails')?.addEventListener('click',()=>{closeModal();state.profileSettingsTab='data';location.hash='#/settings';route();});
    $('#openMetadataIssues')?.addEventListener('click',()=>showMetadataIssues('all'));
    $('#retryMetadata')?.addEventListener('click',()=>{for(const item of [...state.series,...state.movies])if(item.publicMetadata?.failedAt||item.publicMetadata?.error)item.publicMetadata={...item.publicMetadata,failedAt:null,error:null,parts:{...(item.publicMetadata?.parts||{}),coreComplete:false}};state.metadataBackgroundStarted=false;state.metadataRecoveryScheduled=false;state.metadataRecoveryDone=false;state.metadataAutoBudget+=50;scheduleBackgroundMetadataSync(true);syncDefaultPublicSources(true);closeModal();showToast('Nuovo tentativo avviato','Le fonti non riuscite verranno ricontrollate.','↻');});
    $('#resumeMetadata')?.addEventListener('click', () => { state.metadataBackgroundStarted = false; state.metadataAutoBudget += 50; scheduleBackgroundMetadataSync(true); syncDefaultPublicSources(true); closeModal(); showToast('Aggiornamento in background', 'Catalogo, streaming, TV e cinema verranno controllati secondo le fonti configurate.', '↻', 4200); });
  }

  function showToast(title, message = '', icon = '✓', timeout = 3400, options = {}) {
    if (typeof timeout === 'object') { options = timeout; timeout = options.timeout ?? 3400; }
    const el = document.createElement('div'); el.className = `toast ${options.kind ? `toast-${options.kind}` : ''}`.trim();
    el.setAttribute('role', options.kind === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><div class="toast-copy"><strong>${esc(title)}</strong><p>${esc(message)}</p></div><button class="toast-close" type="button" aria-label="Chiudi notifica">×</button>`;
    const region = $('#toastRegion'); region.appendChild(el);
    const remove = () => { if (el.isConnected) el.remove(); };
    $('.toast-close', el).addEventListener('click', remove);
    if (Number(timeout) > 0) setTimeout(remove, Number(timeout));
    return el;
  }

  function openModal(title, body, actions = '', options = {}) {
    const dismissible = options.dismissible !== false;
    document.removeEventListener('keydown', modalKeydown);
    state.modalPreviousFocus = document.activeElement;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    $('#modalRoot').innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${esc(title)}" ${options.busy ? 'aria-busy="true"' : ''}>
      <section class="modal"><header class="modal-head"><h2>${esc(title)}</h2>${dismissible ? '<button class="modal-close" type="button" aria-label="Chiudi">×</button>' : '<span class="modal-working" aria-hidden="true">•••</span>'}</header>
      <div class="modal-body">${body}${actions ? `<div class="modal-actions">${actions}</div>` : ''}</div></section></div>`;
    if (dismissible) {
      $('.modal-close').addEventListener('click', closeModal);
      $('.modal-backdrop').addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) closeModal(); });
      document.addEventListener('keydown', modalKeydown);
    }
    $('.modal-close, .modal-actions button, .modal-actions a, .modal-body input, .modal-body select, .modal-body textarea, .modal-body [tabindex]:not([tabindex="-1"])')?.focus();
  }
  function modalKeydown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const modal = $('#modalRoot .modal'); if (!modal) return;
    const focusable = $$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', modal);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function closeModal() {
    document.removeEventListener('keydown', modalKeydown);
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    $('#modalRoot').innerHTML = '';
    if (state.modalPreviousFocus?.isConnected) state.modalPreviousFocus.focus({ preventScroll:true });
    state.modalPreviousFocus = null;
  }

  function posterInner(item) {
    const image = item.poster ? `<img class="poster-img" src="${esc(item.poster)}" alt="" loading="lazy" decoding="async">` : '';
    return `${image}<span class="poster-title">${esc(item.title)}</span>`;
  }
  function mediaCard(item, kind = 'series') {
    const isSeries = kind === 'series'; const prog = isSeries ? seriesProgress(item) : null; const completed = isSeries && seriesIsCompleted(item);
    const meta = isSeries ? `${item.year || '—'} · ${prog.watched}/${prog.total} episodi` : `${item.year || '—'} · ${item.runtime ? minutesToText(item.runtime) : 'Durata n.d.'}`;
    const href = isSeries ? `#/series/${encodeURIComponent(item.id)}` : `#/movie/${encodeURIComponent(item.id)}`;
    return `<article class="media-card" data-id="${esc(item.id)}" data-kind="${kind}">
      <a href="${href}" class="poster" style="background:${item.posterGradient || gradient(item.title)}">
        ${posterInner(item)}
        <span class="poster-badge">${isSeries ? esc(completed ? 'COMPLETATA' : statusLabel(item.status)) : (item.watched ? 'VISTO' : 'DA VEDERE')}</span>
      </a>
      <button class="favorite-button ${item.favorite ? 'active' : ''}" data-action="favorite" aria-label="${item.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}">♥</button>
      <div class="card-body">
        <p class="card-title">${esc(item.title)}</p>
        <div class="card-meta"><span>${esc(meta)}</span>${item.rating ? `<span>★ ${item.rating}</span>` : ''}</div>
        ${isSeries ? `<div class="progress-track" aria-label="Avanzamento ${prog.percent}%"><div class="progress-fill" style="width:${prog.percent}%"></div></div>` : ''}
        <div class="card-actions">
          ${isSeries ? `<button data-action="next">${nextEpisode(item) ? 'Prossimo' : 'Completata'}</button>` : `<button class="${item.watched ? 'watched' : ''}" data-action="watched">${item.watched ? '✓ Visto' : 'Segna visto'}</button>`}
          <a class="secondary" href="${href}" style="display:grid;place-items:center;padding:0 10px">Dettagli</a>
        </div>
        ${(!isSeries && !item.watched) || (isSeries && !['completed','dropped'].includes(item.status)) ? `<button class="card-remove ghost" data-action="remove" aria-label="Rimuovi ${esc(item.title)} dalla libreria">Rimuovi dalla libreria</button>` : ''}
      </div>
    </article>`;
  }
  function mediaRow(item, kind = 'series') {
    const isSeries = kind === 'series'; const prog = isSeries ? seriesProgress(item) : null;
    const href = isSeries ? `#/series/${encodeURIComponent(item.id)}` : `#/movie/${encodeURIComponent(item.id)}`;
    return `<article class="media-row" data-id="${esc(item.id)}" data-kind="${kind}">
      <a href="${href}" class="row-poster" style="background:${item.posterGradient || gradient(item.title)}">${item.poster ? `<img class="poster-img" src="${esc(item.poster)}" alt="" decoding="async">` : esc(item.title)}</a>
      <div class="row-main"><h3><a href="${href}">${esc(item.title)}</a></h3>${item.originalTitle && normalizeSearch(item.originalTitle)!==normalizeSearch(item.title)?`<small class="row-original-title">${esc(item.originalTitle)}</small>`:''}<p>${esc((item.overview || 'Nessuna descrizione disponibile.').slice(0, 180))}</p>
        <div class="row-meta"><span>${item.year || '—'}</span><span>${isSeries ? `${prog.watched}/${prog.total} episodi` : item.watched ? `Visto ${fmtDate(item.watchedAt)}` : 'Da vedere'}</span>${item.rating ? `<span>★ ${item.rating}</span>` : ''}${item.favorite ? '<span>♥ Preferito</span>' : ''}</div>
        ${isSeries ? `<div class="progress-track"><div class="progress-fill" style="width:${prog.percent}%"></div></div>` : ''}
      </div>
      <div class="row-actions"><button class="favorite-button ${item.favorite ? 'active' : ''}" data-action="favorite" style="position:static" aria-label="Preferito">♥</button>
        ${isSeries ? `<a class="secondary" href="${href}">Apri</a>` : `<button class="secondary" data-action="watched">${item.watched ? 'Segna non visto' : 'Segna visto'}</button>`}</div>
    </article>`;
  }
  function statusLabel(status) {
    return ({ watching: 'IN CORSO', plan: 'DA INIZIARE', watchlist: 'DA INIZIARE', completed: 'COMPLETATA', paused: 'IN PAUSA', dropped: 'ABBANDONATA' })[status] || 'LIBRERIA';
  }
  function starRating(value = 0, id = '', editable = true) {
    const rounded = Math.round(Number(value || 0));
    return `<div class="star-rating" data-rating-id="${esc(id)}">${[1,2,3,4,5].map(n => `<button type="button" class="${n <= rounded ? 'on' : ''}" data-value="${n}" ${editable ? '' : 'disabled'} aria-label="${n} stelle">★</button>`).join('')}<span class="rating-value">${value ? `${value}/5` : 'Nessun voto'}</span></div>`;
  }
  function preferredCinemas() {
    return Array.isArray(state.settings.preferredCinemas) && state.settings.preferredCinemas.length ? state.settings.preferredCinemas : structuredClone(DEFAULT_CINEMAS);
  }
  function providerDisplayName(provider) { return typeof provider === 'string' ? provider : (provider?.name || provider?.providerName || 'Servizio'); }
  function preferenceRank(name, preferences = []) {
    const normalized = normalizeSearch(name); const index = preferences.findIndex(x => { const p=normalizeSearch(x); return normalized===p || normalized.includes(p) || p.includes(normalized); });
    return index < 0 ? 999 : index;
  }
  function sortProvidersByPreference(providers = []) {
    const preferences = Array.isArray(state.settings.preferredStreamingServices) ? state.settings.preferredStreamingServices : [];
    return providers.slice().sort((a,b)=>preferenceRank(providerDisplayName(a),preferences)-preferenceRank(providerDisplayName(b),preferences)||providerDisplayName(a).localeCompare(providerDisplayName(b),'it'));
  }
  function streamingServiceMeta(name) {
    const normalized=normalizeSearch(name);
    return STREAMING_SERVICE_META.find(service=>{
      const candidate=normalizeSearch(service.name);
      return normalized===candidate||normalized.includes(candidate)||candidate.includes(normalized)
        ||(candidate==='max hbo'&&(normalized.includes('max')||normalized.includes('hbo')))
        ||(candidate==='prime video'&&normalized.includes('amazon'));
    })||{name,mark:String(name||'TV').slice(0,2).toUpperCase(),tone:'generic',url:''};
  }
  function providerLogoHtml(name) {
    const meta=streamingServiceMeta(name);
    return `<span class="provider-logo service-${esc(meta.tone)}" aria-hidden="true">${esc(meta.mark)}</span>`;
  }
  function tvChannelMeta(name) {
    const normalized=normalizeSearch(name);
    return TV_CHANNEL_META.find(channel=>{
      const candidate=normalizeSearch(channel.name);
      return normalized===candidate||normalized.includes(candidate)||candidate.includes(normalized);
    })||{name:name||'Canale TV',mark:String(name||'TV').slice(0,4).toUpperCase(),tone:'generic'};
  }
  function tvChannelLogoHtml(name, extraClass='') {
    const meta=tvChannelMeta(name);
    return `<span class="tv-channel-logo tv-${esc(meta.tone)} ${esc(extraClass)}" aria-hidden="true">${esc(meta.mark)}</span>`;
  }
  function tvOptionsHtml(item) {
    const tvPreferences=Array.isArray(state.settings.preferredTvChannels)?state.settings.preferredTvChannels:[];
    const rows=(item.tvBroadcasts||[]).filter(row=>dateMs(row.startsAt||row.date)>=Date.now()-1000*60*60*3)
      .sort((a,b)=>preferenceRank(a.channel||'',tvPreferences)-preferenceRank(b.channel||'',tvPreferences)||dateMs(a.startsAt||a.date)-dateMs(b.startsAt||b.date))
      .slice(0,8);
    if(!rows.length)return '';
    return `<div class="provider-group tv-provider-group"><h4>In TV</h4><div class="tv-provider-list">${rows.map(row=>`<article class="tv-provider-card">${tvChannelLogoHtml(row.channel||'Canale TV','channel-logo')}<span><strong>${esc(row.channel||'Canale TV')}</strong><small>${esc(showtimeDateLabel(row.startsAt||row.date))}${row.episode?` · ${esc(row.episode)}`:''}</small></span>${row.guideUrl?`<a href="${esc(row.guideUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Apri guida di ${esc(row.channel||'canale TV')}">↗</a>`:''}</article>`).join('')}</div></div>`;
  }
  function providersHtml(item) {
    const groups = item.providerGroups || {};
    const blocks = [
      ['streaming', 'Streaming'], ['rent', 'Noleggio'], ['buy', 'Acquisto'], ['free', 'Gratis con pubblicità']
    ].filter(([key]) => Array.isArray(groups[key]) && groups[key].length).map(([key, label]) => `<div class="provider-group"><h4>${label}</h4><div class="provider-list">${sortProvidersByPreference(groups[key]).map(provider => {
      const name=providerDisplayName(provider);
      const quality=typeof provider==='object'&&provider.quality?`<small>${esc(provider.quality)}</small>`:'';
      const url=typeof provider==='object'&&provider.url?provider.url:(groups.link||item.providerLink||'');
      const body=`${providerLogoHtml(name)}<span class="provider-copy"><strong>${esc(name)}</strong>${quality}</span>`;
      return url?`<a class="provider" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${body}<span aria-hidden="true">↗</span></a>`:`<span class="provider">${body}</span>`;
    }).join('')}</div></div>`).join('');
    const tv=tvOptionsHtml(item);
    if(blocks||tv)return `<div class="watch-options-stack">${blocks}${tv}${blocks?'<p class="provider-attribution">Disponibilità per l’Italia fornita da JustWatch tramite TMDB; verifica sempre sul servizio.</p>':''}</div>`;
    if(item.providerStatus==='loading')return inlineCinemaLoaderHtml('Verifica disponibilità', 'Controllo esclusivamente i servizi realmente associati al titolo.');
    return '<p class="information-unavailable">Informazione non disponibile</p>';
  }
  function showtimeDateLabel(value) {
    const d=new Date(value); if(!Number.isFinite(d.getTime()))return '';
    return new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(d);
  }
  function showtimeClock(value) {
    const d=new Date(value); if(!Number.isFinite(d.getTime()))return '';
    return new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(d);
  }
  function cinemaPreviewDayLabel(dateKey,index) {
    const d=parseDateKey(dateKey);
    if(index===0)return `Oggi · ${new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short'}).format(d)}`;
    if(index===1)return `Domani · ${new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short'}).format(d)}`;
    return new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short'}).format(d);
  }
  function cinemaProgrammingHtml(item) {
    const cinemas=preferredCinemas();
    const rawRows=(item.cinemaShowtimes||[]).filter(show=>show&&(show.time||show.startsAt)).sort((a,b)=>dateMs(a.startsAt)-dateMs(b.startsAt)||String(a.time||'').localeCompare(String(b.time||'')));
    if(item.cinemaStatus==='loading'&&!rawRows.length)return `<section class="content-card section cinema-programming"><div class="section-head"><div><h3>Programmazione cinema</h3></div></div>${inlineCinemaLoaderHtml('Controllo i siti ufficiali', 'Cerco il film nelle sale preferite.')}</section>`;
    if(!rawRows.length)return `<section class="content-card section cinema-programming"><div class="section-head"><div><h3>Programmazione cinema</h3></div></div><p class="information-unavailable">Informazione non disponibile</p></section>`;
    const grouped=new Map();
    for(const show of rawRows){
      const cinema=cinemas.find(x=>x.id===show.cinemaId||normalizeSearch(x.name)===normalizeSearch(show.cinemaName))||{id:show.cinemaId,name:show.cinemaName,officialUrl:show.bookingUrl};
      if(!grouped.has(cinema.id||cinema.name))grouped.set(cinema.id||cinema.name,{cinema,rows:[]});
      grouped.get(cinema.id||cinema.name).rows.push(show);
    }
    const cards=[...grouped.values()].filter(group=>group.rows.length).map(({cinema,rows})=>{
      const byDate=new Map();
      for(const show of rows){const key=show.dateKey||(show.startsAt?dateKeyInTimeZone(show.startsAt,'Europe/Rome'):'current');if(!byDate.has(key))byDate.set(key,[]);byDate.get(key).push(show);}
      const dayColumns=[...byDate.entries()].map(([key,shows])=>{
        const label=key==='current'?(shows[0].dateLabel||'Programmazione corrente'):new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short'}).format(parseDateKey(key));
        return `<section class="cinema-day-preview"><h4>${esc(label)}</h4><div class="cinema-time-grid">${shows.map(show=>{const time=show.time||showtimeClock(show.startsAt);const url=show.bookingUrl||cinema.officialUrl||'#';return `<a class="cinema-time-card" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(time)}</strong><span>${esc([show.auditorium,show.format,show.language].filter(Boolean).join(' · ')||'Orario dal sito ufficiale')}</span></a>`;}).join('')}</div></section>`;
      }).join('');
      return `<article class="cinema-preview-card"><header><div><strong>${esc(cinema.name||'Cinema')}</strong><small>${esc([cinema.city,cinema.province].filter(Boolean).join(' · '))}</small></div>${cinema.officialUrl?`<a href="${esc(cinema.officialUrl)}" target="_blank" rel="noopener noreferrer">Sito ufficiale ↗</a>`:''}</header><div class="cinema-days-grid cinema-days-actual">${dayColumns}</div></article>`;
    }).join('');
    return `<section class="content-card section cinema-programming"><div class="section-head"><div><h3>Programmazione cinema</h3><p>Solo orari trovati sui siti ufficiali delle sale preferite.</p></div></div><div class="cinema-preview-list">${cards}</div></section>`;
  }
  function broadcastInWindow(row, windowName) {
    const key=dateKeyInTimeZone(row.startsAt||row.date||new Date(),'Europe/Rome');
    if(windowName==='today')return key===todayIso();
    if(windowName==='tomorrow')return key===daysFromNow(1);
    return key>=todayIso()&&key<=daysFromNow(7);
  }
  function tvProgrammingHtml(item) {
    return tvOptionsHtml(item);
  }
  function bindProgrammingActions(item, kind) {
    $$('[data-tv-filter]').forEach(b=>b.addEventListener('click',()=>{state.tvScheduleFilter=b.dataset.tvFilter;kind==='series'?renderSeriesDetail(item.id):renderMovieDetail(item.id);}));
    $$('[data-open-cinema-settings]').forEach(b=>b.addEventListener('click',()=>{state.profileSettingsTab='services';location.hash='#/settings';setTimeout(()=>document.getElementById('cinemaPreferencesCard')?.scrollIntoView({behavior:'smooth',block:'start'}),180);}));
  }
  function mainCastMembers(cast = [], limit = 10) {
    const seen=new Set();
    return cast.filter(person=>{
      const name=String(person?.name||'').trim();
      const key=normalizeSearch(name);
      if(!name||seen.has(key))return false;
      seen.add(key);return true;
    }).slice(0,limit);
  }
  function castHtml(cast = [], limit = 10) {
    const main=mainCastMembers(cast,limit);
    return main.length ? main.map(p => `<a class="cast-card" href="#/person/${encodeURIComponent(p.tmdbId || p.tvmazeId || p.wikidataId || p.name)}?name=${encodeURIComponent(p.name)}&role=${encodeURIComponent(p.role || '')}&tvmazeId=${encodeURIComponent(p.tvmazeId || '')}&wikidataId=${encodeURIComponent(p.wikidataId || '')}"><div class="cast-photo">${p.photo ? `<img class="poster-img" src="${esc(p.photo)}" alt="" loading="lazy" decoding="async">` : esc(p.name.split(' ').map(x => x[0]).slice(0,2).join(''))}</div><div class="cast-copy"><strong>${esc(p.name)}</strong><small>${esc(p.role || 'Ruolo non indicato')}</small></div></a>`).join('') : '';
  }
  function fullCastExternalLink(item, kind) {
    const imdb=String(item.imdbId||'').trim();
    if(/^tt\d+$/i.test(imdb))return {url:`https://www.imdb.com/title/${encodeURIComponent(imdb)}/fullcredits/`,label:'Cast completo su IMDb'};
    if(item.tmdbId)return {url:`https://www.themoviedb.org/${kind==='series'?'tv':'movie'}/${encodeURIComponent(item.tmdbId)}/cast`,label:'Cast completo su TMDB'};
    if(kind==='series'&&item.publicMetadata?.provider==='tvmaze'&&item.publicMetadata?.sourceUrl)return {url:item.publicMetadata.sourceUrl,label:'Cast completo su TVmaze'};
    return {url:`https://www.imdb.com/find/?q=${encodeURIComponent(item.title||'')}&s=tt`,label:'Cerca il cast completo su IMDb'};
  }
  function castSectionHtml(item) {
    if ((item.cast || []).length) return castHtml(item.cast,10);
    const attempted = !!item.publicMetadata?.parts?.castComplete;
    if (attempted) return '<p class="notice">Non è stato trovato un cast nelle fonti pubbliche disponibili. Puoi riprovare con il pulsante di aggiornamento.</p>';
    return `<div class="metadata-loading" role="status"><span class="inline-spinner" aria-hidden="true"></span><div><strong>Ricerca del cast in corso</strong><p>La scheda si aggiornerà automaticamente.</p></div></div><div class="cast-strip cast-grid cast-skeleton-grid">${Array.from({length:10},()=>'<span class="cast-card skeleton-card" aria-hidden="true"></span>').join('')}</div>`;
  }
  function castPanelHtml(item, kind) {
    const total=mainCastMembers(item.cast||[],Number.MAX_SAFE_INTEGER).length;
    const shown=Math.min(total,10);
    const fullCast=fullCastExternalLink(item,kind);
    const description=total?`${shown} interpreti principali${total>shown?` su ${total} disponibili`:''}. I nomi e i personaggi sono mostrati per esteso.`:'Apri una scheda per vedere i titoli collegati.';
    return `<section class="content-card section cast-section"><div class="section-head"><div><h3>Cast</h3><p>${esc(description)}</p></div>${fullCast?`<a class="secondary compact external-cast-link" href="${esc(fullCast.url)}" target="_blank" rel="noopener noreferrer">${esc(fullCast.label)} ↗</a>`:''}</div>${total?`<div class="cast-strip cast-grid" role="list" aria-label="Interpreti principali">${castSectionHtml(item)}</div>`:castSectionHtml(item)}</section>`;
  }

  async function toggleFavorite(kind, id) {
    const list = kind === 'series' ? state.series : state.movies; const item = list.find(x => x.id === id); if (!item) return;
    item.favorite = !item.favorite; await dbPut(kind === 'series' ? 'series' : 'movies', item); showToast(item.favorite ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti', item.title, '♥'); route();
  }
  async function toggleMovieWatched(id) {
    const item = state.movies.find(x => x.id === id); if (!item) return;
    item.watched = !item.watched; item.state = item.watched ? 'watched' : 'watchlist'; item.watchedAt = item.watched ? new Date().toISOString() : null;
    await dbPut('movies', item); showToast(item.watched ? 'Film segnato come visto' : 'Film rimesso da vedere', item.title, '🎬'); route();
  }
  async function removeFromLibrary(kind, id) {
    const store = kind === 'series' ? 'series' : 'movies';
    const list = kind === 'series' ? state.series : state.movies;
    const item = list.find(x => x.id === id);
    if (!item || !window.confirm(`Rimuovere “${item.title}” dalla libreria?`)) return;
    await dbDelete(store, id);
    if (kind === 'series') {
      const related = state.progress.filter(x => x.seriesId === id);
      for (const record of related) await dbDelete('progress', record.id);
      state.series = state.series.filter(x => x.id !== id);
      state.progress = state.progress.filter(x => x.seriesId !== id);
    } else {
      state.movies = state.movies.filter(x => x.id !== id);
    }
    rebuildIndexes();
    showToast('Titolo rimosso dalla libreria', item.title, '×');
    route();
  }
  async function toggleEpisode(seriesId, season, episode, episodeTitle = '') {
    const existing = progressRecord(seriesId, season, episode);
    if (existing) {
      existing.watched = !existing.watched;
      existing.watchedAt = existing.watched ? new Date().toISOString() : null;
      await dbPut('progress', existing);
    } else {
      const rec = { id: `${state.profileId}|${String(seriesId).split('|').pop()}:s${season}:e${episode}`, profileId: state.profileId, seriesId, season, episode, title: episodeTitle, watched: true, watchedAt: new Date().toISOString() };
      state.progress.push(rec);
      await dbPut('progress', rec);
    }
    rebuildIndexes();
    route();
  }

  function bindCommonMediaActions(root = document) {
    $$('[data-action="favorite"]', root).forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation(); const card = btn.closest('[data-id]'); toggleFavorite(card.dataset.kind, card.dataset.id);
    }));
    $$('[data-action="watched"]', root).forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation(); const card = btn.closest('[data-id]'); if (card.dataset.kind === 'movie') toggleMovieWatched(card.dataset.id);
    }));
    $$('[data-action="remove"]', root).forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation(); const card = btn.closest('[data-id]'); removeFromLibrary(card.dataset.kind, card.dataset.id);
    }));
    $$('[data-action="next"]', root).forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault(); const card = btn.closest('[data-id]'); const s = state.series.find(x => x.id === card.dataset.id); const ep = s && nextEpisode(s);
      if (ep) toggleEpisode(s.id, ep.season, ep.episode, ep.title); else showToast('Serie completata', s?.title || '');
    }));
  }

  function parseRoute() {
    const raw = (location.hash || '#/home').replace(/^#\//, ''); const [path, queryString = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean); return { page: parts[0] || 'home', id: parts[1] ? decodeURIComponent(parts.slice(1).join('/')) : null, query: new URLSearchParams(queryString) };
  }
  async function route(options = {}) {
    const r = parseRoute();
    const routeKey = `${r.page}/${r.id || ''}`;
    const preserveScroll = options.preserveScroll === true;
    const preservedScrollY = preserveScroll ? window.scrollY : 0;
    const shouldShowLoader = options.loader !== false && state.profileSelected && state.lastRenderedRoute !== routeKey;
    let loaderToken = 0;
    if (shouldShowLoader) {
      const [title, detail] = loaderCopyForRoute(r);
      loaderToken = state.navigationLoaderToken || showBlockingLoader(title, detail);
      state.navigationLoaderToken = 0;
      await nextPaint();
    }
    try {
      if (!preserveScroll) window.scrollTo({ top: 0, behavior: 'instant' });
      updateBackToTopButton();
      if (r.page === 'home') renderHome();
      else if (r.page === 'series' && r.id) renderSeriesDetail(r.id);
      else if (r.page === 'series') renderSeriesLibrary();
      else if (r.page === 'movie' && r.id) renderMovieDetail(r.id);
      else if (r.page === 'movies') renderMovieLibrary();
      else if (r.page === 'search') renderSearch();
      else if (r.page === 'programming') renderProgramming();
      else if (r.page === 'stats') { state.profileSettingsTab = 'stats'; renderSettings(); }
      else if (r.page === 'import') { state.profileSettingsTab = 'import'; renderSettings(); }
      else if (r.page === 'person') renderPerson(r.id, r.query);
      else if (r.page === 'accessibility') { state.accessibilityTab='declaration'; renderAccessibility(); }
      else if (r.page === 'accessibility-report') renderAccessibilityReport();
      else if (r.page === 'design-system') renderDesignSystem();
      else renderSettings();
      state.lastRenderedRoute = routeKey;
      if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: preservedScrollY, behavior: 'instant' }));
    } finally {
      if (loaderToken) hideBlockingLoader(loaderToken);
    }
  }

  function libraryIsEmpty() {
    return state.series.length === 0 && state.movies.length === 0 && state.progress.length === 0;
  }

  function emptyPopularSeriesCard(row) {
    const meta = [row.year, 'Serie'].filter(Boolean).join(' · ');
    const initials = row.title.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
    return `<article class="empty-popular-card" data-empty-popular-id="${esc(row.seedId)}">
      <span class="empty-popular-poster" style="background:${row.posterGradient || gradient(row.title)}">${row.poster ? `<img class="poster-img" src="${esc(row.poster)}" alt="" loading="lazy" decoding="async">` : esc(initials)}</span>
      <span class="empty-popular-copy"><strong>${esc(row.title)}</strong><small>${esc(meta)}</small></span>
      <button class="secondary compact" type="button" data-add-empty-popular="${esc(row.seedId)}">＋ Aggiungi</button>
    </article>`;
  }

  function emptyPopularSeriesSection() {
    const railId = 'emptyPopularSeriesRail';
    return `<section class="empty-popular-section" aria-label="Serie popolari da aggiungere">
      <div class="section-head">
        <div><span class="kicker">Idee per iniziare</span><h2>Serie molto viste</h2><p>Aggiungi qualche titolo alla watchlist, poi potrai segnare episodi, preferiti e rating.</p></div>
        ${railControlsHtml(railId, 'serie molto viste')}
      </div>
      <div class="empty-popular-rail" id="${railId}" data-rail tabindex="0" role="list" aria-label="Serie molto viste">${EMPTY_HOME_SERIES.map(emptyPopularSeriesCard).join('')}</div>
    </section>`;
  }

  async function hydrateEmptyPopularSeries() {
    const api = publicMetadataApi();
    if (!api?.searchSeries || !navigator.onLine) return;
    await Promise.allSettled(EMPTY_HOME_SERIES.map(async seed => {
      if (seed.poster && /^\d+$/.test(String(seed.id))) return;
      const results = await api.searchSeries(seed.title);
      const match = results.find(x => normalizeSearch(x.title) === normalizeSearch(seed.title)) || results[0];
      if (!match) return;
      Object.assign(seed, {
        kind: 'tv',
        publicProvider: match.publicProvider || 'tvmaze',
        id: match.id || seed.id,
        title: match.title || seed.title,
        originalTitle: match.originalTitle || seed.title,
        aliases: mergeAliases(seed.aliases || [], match.aliases || [], seed.title, match.title),
        year: match.year || seed.year,
        overview: match.overview || seed.overview,
        poster: match.poster || seed.poster,
        tvdbId: match.tvdbId || seed.tvdbId
      });
      const card = $(`[data-empty-popular-id="${seed.seedId}"]`);
      if (card) card.outerHTML = emptyPopularSeriesCard(seed);
    }));
    bindEmptyPopularSeriesActions();
    bindHorizontalRails(document);
  }

  function bindEmptyPopularSeriesActions() {
    $$('[data-add-empty-popular]').forEach(button => {
      if (button.dataset.bound === '1') return;
      button.dataset.bound = '1';
      button.addEventListener('click', async () => {
        const row = EMPTY_HOME_SERIES.find(item => item.seedId === button.dataset.addEmptyPopular);
        if (!row) return;
        button.disabled = true;
        button.textContent = 'Aggiungo…';
        try {
          const item = await addFromPublicResult(row);
          showToast('Aggiunta alla libreria', row.title);
          await reloadData();
          location.hash = `#/series/${encodeURIComponent(item.id)}`;
        } catch (error) {
          showToast('Impossibile aggiungere', error.message, '!', 6000, { kind:'error' });
          button.disabled = false;
          button.textContent = '＋ Aggiungi';
        }
      });
    });
  }

  function renderEmptyLibraryHome() {
    const profile = currentProfile();
    setMain(`<section class="empty-library-hero">
      <div class="empty-library-copy">
        <span class="kicker">Benvenuta, ${esc(profile?.name || 'nel tuo profilo')}</span>
        <h2>Costruiamo la tua libreria</h2>
        <p>Il profilo è ancora vuoto. Puoi importare in pochi passaggi la cronologia da TV Time, un backup Watchverse oppure un file CSV o JSON. Prima del salvataggio vedrai sempre un riepilogo con serie, episodi, film, watchlist, preferiti e rating riconosciuti.</p>
        <div class="hero-actions">
          <button class="primary" id="emptyHomeImport">⇧ Importa la libreria</button>
          <button class="secondary" id="emptyHomeManual">＋ Aggiungi manualmente</button>
        </div>
      </div>
      <div class="empty-library-orbit" aria-hidden="true"><span>🎬</span><span>📺</span><span>⭐</span><span class="brand-mark empty-library-logo"></span></div>
    </section>
    ${emptyPopularSeriesSection()}
    <section class="empty-library-grid" aria-label="Modi per iniziare">
      <article class="empty-option-card featured">
        <span class="empty-option-icon">⇧</span>
        <h3>Importa una libreria esistente</h3>
        <p>Carica direttamente lo ZIP GDPR di TV Time, un backup Watchverse, oppure un CSV/JSON. Analisi preliminare, barra di avanzamento e report finale sono inclusi.</p>
        <div id="emptyHomeDrop" class="dropzone compact" tabindex="0" role="button" aria-label="Scegli o trascina qui il file da importare">
          <strong>Trascina qui il file</strong>
          <span>oppure premi per sceglierlo dal dispositivo</span>
          <small>ZIP · CSV · JSON</small>
        </div>
        <a class="section-link" href="#/import">Apri tutte le opzioni di importazione →</a>
      </article>
      <article class="empty-option-card">
        <span class="empty-option-icon">＋</span>
        <h3>Inizia manualmente</h3>
        <p>Cerca un film o una serie e aggiungilo alla watchlist. Potrai spuntare gli episodi, assegnare rating e segnare i preferiti.</p>
        <button class="secondary" id="emptyHomeSearch">Cerca il primo titolo</button>
      </article>
      <article class="empty-option-card">
        <span class="empty-option-icon">🔒</span>
        <h3>Dati separati per profilo</h3>
        <p>Quello che importi qui appartiene solo a ${esc(profile?.name || 'questo profilo')}. Gli altri profili dell’account mantengono una libreria indipendente.</p>
      </article>
    </section>`);

    const chooseFile = () => $('#importInput').click();
    $('#emptyHomeImport')?.addEventListener('click', chooseFile);
    $('#emptyHomeDrop')?.addEventListener('click', chooseFile);
    $('#emptyHomeDrop')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseFile(); }
    });
    $('#emptyHomeManual')?.addEventListener('click', showQuickAdd);
    $('#emptyHomeSearch')?.addEventListener('click', () => { location.hash = '#/search'; });
    bindEmptyPopularSeriesActions();
    hydrateEmptyPopularSeries();
    bindHorizontalRails(document);
    const dz = $('#emptyHomeDrop');
    ['dragenter','dragover'].forEach(type => dz?.addEventListener(type, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave','drop'].forEach(type => dz?.addEventListener(type, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz?.addEventListener('drop', async e => {
      const file = e.dataTransfer?.files?.[0];
      if (file) await handleImportFile(file);
    });
  }

  function scheduleLineHtml(ep) {
    const schedule = ep.schedule || episodeScheduleInfo(state.series.find(s => s.id === ep.seriesId) || {}, ep);
    const lines = [];
    if (schedule.original) {
      const originalTime = schedule.original.stamp ? new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit', timeZone:'America/New_York', hour12:false }).format(new Date(schedule.original.stamp)) : '';
      lines.push(`<span class="schedule-line"><strong>USA</strong> ${esc(schedule.original.network || 'Uscita originale')} · ${esc(calendarHeading(schedule.original.dateKey))}${originalTime ? ` · ore ${esc(originalTime)}` : ''}</span>`);
    }
    if (schedule.italy) {
      const quality = schedule.italy.confidence === 'estimated' ? ' · stima automatica' : schedule.italy.confidence === 'manual' ? ' · correzione manuale' : '';
      lines.push(`<span class="schedule-line schedule-italy"><strong>Italia</strong> ${esc(schedule.italy.provider || 'Disponibilità italiana')} · ${esc(calendarHeading(schedule.italy.dateKey))}${schedule.italy.time ? ` · ore ${esc(schedule.italy.time)}` : ''}${quality}</span>`);
    } else lines.push('<span class="schedule-line schedule-muted"><strong>Italia</strong> programmazione non ancora rilevata.</span>');
    return lines.join('');
  }
  function upcomingCardHtml(ep) {
    return `<article class="continue-card upcoming-card">
      <a href="#/series/${encodeURIComponent(ep.seriesId)}" class="continue-poster" style="background:${ep.posterGradient || gradient(ep.seriesTitle)}" aria-label="Apri ${esc(ep.seriesTitle)}">${ep.poster ? `<img src="${esc(ep.poster)}" alt="Locandina di ${esc(ep.seriesTitle)}" loading="lazy" decoding="async">` : `<span>${esc(ep.seriesTitle.slice(0,2))}</span>`}</a>
      <div class="continue-copy"><span class="result-kicker">${ep.schedule?.italy ? 'Disponibilità Italia' : 'Uscita originale'}</span><h3><a href="#/series/${encodeURIComponent(ep.seriesId)}">${esc(ep.seriesTitle)}</a></h3><div class="episode-line"><strong>S${pad2(ep.season)} E${pad2(ep.episode)}</strong><span>${esc(ep.title || 'Titolo episodio non disponibile')}</span></div><div class="schedule-lines">${scheduleLineHtml(ep)}</div><div class="row-meta"><span>${ep.runtime || 50} min</span>${ep.schedule?.italy && !ep.schedule.italy.exact ? '<span>Data Italia da regola personale</span>' : ''}</div></div>
      <div class="continue-actions"><a class="secondary" href="#/series/${encodeURIComponent(ep.seriesId)}">Apri serie</a></div>
    </article>`;
  }
  function groupedUpcomingHtml(upcoming) {
    if (!upcoming.length) return `<div class="empty-state"><div class="empty-icon">📅</div><h3>Nessuna uscita registrata</h3><p>Le nuove date appariranno qui appena disponibili.</p></div>`;
    const groups = new Map();
    for (const ep of upcoming) {
      const key = ep.schedule?.dateKey || ep.airDate;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(ep);
    }
    return [...groups.entries()].map(([dateKey, episodes]) => `<section class="calendar-day-group"><div class="calendar-day-heading"><span>${esc(calendarHeading(dateKey))}</span><small>${episodes.length} ${episodes.length === 1 ? 'episodio' : 'episodi'}</small></div><div class="continue-list">${episodes.map(upcomingCardHtml).join('')}</div></section>`).join('');
  }

  function renderProgramming() {
    setPage('Programmazione', 'TV, cinema e nuove uscite', 'programming');
    const upcoming = upcomingEpisodes(30);
    const now = Date.now() - 1000 * 60 * 60 * 4;
    const weekEnd = Date.now() + 1000 * 60 * 60 * 24 * 7;
    const broadcasts = [...state.series.map(item => ({ item, kind: 'series' })), ...state.movies.map(item => ({ item, kind: 'movie' }))]
      .flatMap(({ item, kind }) => (item.tvBroadcasts || []).map(row => ({ ...row, item, kind })))
      .filter(row => { const stamp = dateMs(row.startsAt || row.date); return stamp >= now && stamp <= weekEnd; })
      .sort((a, b) => dateMs(a.startsAt || a.date) - dateMs(b.startsAt || b.date));
    const showtimes = state.movies.flatMap(item => (item.cinemaShowtimes || []).map(row => ({ ...row, item })))
      .filter(row => dateMs(row.startsAt) >= now)
      .sort((a, b) => dateMs(a.startsAt) - dateMs(b.startsAt));
    const broadcastHtml = broadcasts.length ? broadcasts.map(row => `<article class="programming-event"><div><span class="result-kicker">${row.kind === 'movie' ? 'Film in TV' : 'Serie in TV'}</span><h3><a href="${row.kind === 'movie' ? '#/movie/' : '#/series/'}${encodeURIComponent(row.item.id)}">${esc(row.item.title)}</a></h3><p>${esc(row.channel || 'Canale TV')} · ${esc(showtimeDateLabel(row.startsAt || row.date))}</p><div class="programming-event-meta">${row.episode ? `<span>${esc(row.episode)}</span>` : ''}${row.broadcastType ? `<span>${esc(row.broadcastType)}</span>` : ''}${row.language ? `<span>${esc(row.language)}</span>` : ''}</div></div>${row.guideUrl ? `<a class="secondary compact" href="${esc(row.guideUrl)}" target="_blank" rel="noopener noreferrer">Guida ufficiale ↗</a>` : `<span class="programming-event-badge">${row.isDemo ? 'Dati demo' : 'Guida da collegare'}</span>`}</article>`).join('') : '<p class="notice warning">Nessun passaggio TV italiano rilevato nei prossimi sette giorni.</p>';
    const cinemaHtml = showtimes.length ? showtimes.map(row => { const cinema = preferredCinemas().find(x => x.id === row.cinemaId) || {}; return `<article class="programming-event"><div><span class="result-kicker">Al cinema</span><h3><a href="#/movie/${encodeURIComponent(row.item.id)}">${esc(row.item.title)}</a></h3><p>${esc(row.cinemaName || cinema.name || 'Cinema')} · ${esc(showtimeDateLabel(row.startsAt))}</p><div class="programming-event-meta"><span>${esc([row.format, row.language, row.auditorium].filter(Boolean).join(' · ') || 'Dettagli sul sito ufficiale')}</span></div></div><a class="secondary compact" href="${esc(row.bookingUrl || cinema.officialUrl || '#')}" target="_blank" rel="noopener noreferrer">Biglietti ↗</a></article>`; }).join('') : '<p class="notice warning">Nessuno spettacolo collegato. Le sale preferite restano disponibili nel profilo.</p>';
    setMain(`<section class="programming-overview" aria-label="Riepilogo programmazione"><article class="metric-card"><div class="metric-row"><span class="metric-icon">▤</span><span>Nuovi episodi</span></div><strong>${upcoming.length.toLocaleString('it-IT')}</strong></article><article class="metric-card"><div class="metric-row"><span class="metric-icon">TV</span><span>Passaggi TV, 7 giorni</span></div><strong>${broadcasts.length.toLocaleString('it-IT')}</strong></article><article class="metric-card"><div class="metric-row"><span class="metric-icon">🎟</span><span>Spettacoli cinema</span></div><strong>${showtimes.length.toLocaleString('it-IT')}</strong></article></section><section class="section"><div class="section-head"><div><h2>Nuovi episodi e uscite</h2><p>Date italiane quando disponibili, altrimenti uscita originale.</p></div></div><div class="calendar-groups">${groupedUpcomingHtml(upcoming)}</div></section><section class="section"><div class="section-head"><div><h2>In TV</h2><p>Palinsesti italiani rilevati nei prossimi sette giorni.</p></div></div><div class="programming-list">${broadcastHtml}</div></section><section class="section"><div class="section-head"><div><h2>Nei cinema preferiti</h2><p>Orari disponibili per le sale configurate nel profilo.</p></div><a class="section-link" href="#/settings">Gestisci cinema →</a></div><div class="programming-list">${cinemaHtml}</div></section>`);
  }

  function railControlsHtml(id, label) {
    return `<div class="rail-controls" aria-label="Navigazione ${esc(label)}"><button class="rail-button" type="button" data-rail-prev="${esc(id)}" aria-label="Scorri indietro ${esc(label)}">‹</button><button class="rail-button" type="button" data-rail-next="${esc(id)}" aria-label="Scorri avanti ${esc(label)}">›</button></div>`;
  }
  function bindHorizontalRails(root = document) {
    $$('[data-rail]', root).forEach(rail => {
      const id = rail.id;
      const escapedId = globalThis.CSS?.escape ? CSS.escape(id) : String(id).replaceAll('"', '\\"');
      const prev = $(`[data-rail-prev="${escapedId}"]`, root) || $$('[data-rail-prev]', root).find(button => button.dataset.railPrev === id);
      const next = $(`[data-rail-next="${escapedId}"]`, root) || $$('[data-rail-next]', root).find(button => button.dataset.railNext === id);
      let dragStartX = 0;
      let dragStartScroll = 0;
      let dragging = false;
      let dragPointerId = null;
      rail.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        dragStartX = event.clientX;
        dragStartScroll = rail.scrollLeft;
        dragging = false;
        dragPointerId = event.pointerId;
      });
      rail.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || dragPointerId !== event.pointerId) return;
        const delta = event.clientX - dragStartX;
        if (!dragging && Math.abs(delta) < 6) return;
        if (!dragging) rail.setPointerCapture?.(event.pointerId);
        dragging = true;
        rail.classList.add('is-dragging');
        rail.scrollLeft = dragStartScroll - delta;
        event.preventDefault();
      });
      const stopDrag = event => {
        if (event.pointerType !== 'mouse' || dragPointerId !== event.pointerId) return;
        if (rail.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture?.(event.pointerId);
        rail.classList.remove('is-dragging');
        if (dragging) {
          rail._watchverseSuppressClick = true;
          setTimeout(() => { rail._watchverseSuppressClick = false; }, 120);
        }
        dragging = false;
        dragPointerId = null;
      };
      rail.addEventListener('pointerup', stopDrag);
      rail.addEventListener('pointercancel', stopDrag);
      rail.addEventListener('click', event => {
        if (!rail._watchverseSuppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        rail._watchverseSuppressClick = false;
      }, true);
      if (!prev || !next) return;
      const update = () => {
        const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const scrollable = max > 6;
        prev.disabled = !scrollable || rail.scrollLeft <= 4;
        next.disabled = !scrollable || rail.scrollLeft >= max - 4;
        prev.closest('.rail-controls')?.classList.toggle('is-static', !scrollable);
      };
      const move = direction => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * .82), behavior: reduced ? 'auto' : 'smooth' });
      };
      prev.addEventListener('click', () => move(-1));
      next.addEventListener('click', () => move(1));
      rail.addEventListener('scroll', update, { passive:true });
      rail.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      });
      if ('ResizeObserver' in window) {
        rail._watchverseResizeObserver?.disconnect?.();
        rail._watchverseResizeObserver = new ResizeObserver(update);
        rail._watchverseResizeObserver.observe(rail);
      }
      requestAnimationFrame(update);
    });
  }

  function renderHome() {
    setPage('Home', 'Cosa guardare adesso', 'home');
    if (libraryIsEmpty()) { renderEmptyLibraryHome(); return; }

    const recentlyWatched = state.series
      .map(s => ({ s, ep: nextEpisode(s), watchedAt: latestWatchedAt(s.id) }))
      .filter(x => x.ep && x.watchedAt)
      .sort((a, b) => dateMs(b.watchedAt) - dateMs(a.watchedAt))
      .slice(0, 12);

    const recentIds = new Set(recentlyWatched.map(x => x.s.id));
    const latestReleased = state.series
      .map(s => ({ s, ep: latestReleasedUnwatched(s) }))
      .filter(x => x.ep && !recentIds.has(x.s.id))
      .sort((a, b) => dateMs(b.ep.airDate) - dateMs(a.ep.airDate) || seriesRecentEpisodeTimestamp(b.s) - seriesRecentEpisodeTimestamp(a.s))
      .slice(0, 12);

    const upcoming = upcomingEpisodes(state.homeTab === 'upcoming' ? 30 : 7);
    const watchFilms = sortMovieItems(state.movies.filter(m => !m.watched), 'recent').slice(0, 8);

    const episodeMediaCard = ({ s, ep, watchedAt = null }, kicker = 'Continua a guardare') => {
      const prog = seriesProgress(s);
      const href = `#/series/${encodeURIComponent(s.id)}`;
      const episodeCode = `S${pad2(ep.season)} E${pad2(ep.episode)}`;
      const timing = watchedAt ? `Ultima visione ${fmtDate(watchedAt)}` : (ep.airDate ? `Uscito ${fmtDate(ep.airDate)}` : 'Data non disponibile');
      return `<article class="media-card episode-media-card" data-id="${esc(s.id)}" data-kind="series">
        <a href="${href}" class="poster episode-card-poster" style="background:${s.posterGradient || gradient(s.title)}" aria-label="Apri ${esc(s.title)}, ${esc(episodeCode)}">
          ${posterInner(s)}
        </a>
        <div class="card-body">
          <p class="card-title"><a href="${href}" title="${esc(s.title)}">${esc(s.title)}</a></p>
          <div class="episode-title-row"><span class="episode-code">${esc(episodeCode)}</span><p class="episode-card-title">${esc(ep.title || 'Titolo episodio non disponibile')}</p></div>
          <div class="card-meta"><span>${ep.runtime || 50} min</span><span>${prog.percent}%</span></div>
          <div class="progress-track" aria-label="Avanzamento ${prog.percent}%"><div class="progress-fill" style="width:${prog.percent}%"></div></div>
          <p class="episode-card-timing">${esc(timing)}</p>
          <div class="card-actions">
            <button data-episode-action data-series="${esc(s.id)}" data-season="${ep.season}" data-episode="${ep.episode}" data-title="${esc(ep.title)}">✓ Visto</button>
            <a class="secondary" href="${href}" aria-label="Dettagli di ${esc(s.title)}">Dettagli</a>
          </div>
        </div>
      </article>`;
    };

    const railSection = ({ id, title, description, items, kicker, linkHref = '#/series', linkLabel = 'Tutte le serie →' }) => {
      if (!items.length) return `<section class="section"><div class="section-head"><div><h2>${esc(title)}</h2><p>${esc(description)}</p></div><a class="section-link" href="${linkHref}">${esc(linkLabel)}</a></div><div class="empty-state"><div class="empty-icon">▶</div><h3>Nessun elemento da mostrare</h3><p>La sezione si aggiornerà quando segnerai nuovi episodi o saranno disponibili nuove uscite.</p></div></section>`;
      return `<section class="section home-rail-section"><div class="section-head"><div><h2>${esc(title)}</h2><p>${esc(description)}</p></div><div class="section-head-actions"><a class="section-link" href="${linkHref}">${esc(linkLabel)}</a><div class="rail-controls" aria-label="Navigazione ${esc(title)}"><button class="rail-button" type="button" data-rail-prev="${id}" aria-label="Scorri indietro ${esc(title)}"><svg class="rail-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><button class="rail-button" type="button" data-rail-next="${id}" aria-label="Scorri avanti ${esc(title)}"><svg class="rail-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div></div></div><div class="home-media-rail" id="${id}" data-rail tabindex="0" role="region" aria-label="${esc(title)}">${items.map(x => episodeMediaCard(x, kicker)).join('')}</div></section>`;
    };

    const listContent = state.homeTab === 'watch' ? `
      ${railSection({ id:'homeContinueRail', title:'Continua a guardare', description:'Le serie riprendono dal primo episodio ancora da vedere, ordinate per attività recente.', items:recentlyWatched, kicker:'Continua a guardare' })}
      ${latestReleased.length ? railSection({ id:'homeReleasedRail', title:'Nuovi episodi da recuperare', description:'Gli episodi non visti usciti più di recente.', items:latestReleased, kicker:'Uscito di recente' }) : ''}
      <section class="section"><div class="section-head"><div><h2>Film da vedere</h2><p>${watchFilms.length} titoli pronti nella watchlist.</p></div><a class="section-link" href="#/movies">Apri film →</a></div><div class="media-grid">${watchFilms.map(m => mediaCard(m,'movie')).join('')}</div></section>` : `
      <section class="section"><div class="section-head"><div><h2>Calendario uscite</h2><p>Raggruppato per giorno. Quando è disponibile una data italiana viene usata come riferimento; altrimenti mostriamo l’uscita originale.</p></div><button class="secondary" id="notifyPermission">Attiva notifiche</button></div>
      <div class="calendar-groups">${groupedUpcomingHtml(upcoming)}</div></section>`;

    const profile = currentProfile();
    setMain(`<section class="home-welcome" aria-label="Messaggio di benvenuto"><div><span class="kicker">Profilo attivo · ${esc(profile?.name || 'spettatore')}</span><h2>Bentornata, ${esc(profile?.name || 'spettatore')} 👋</h2><p>Stai consultando la libreria personale di <strong>${esc(profile?.name || 'questo profilo')}</strong>. Riprendi da dove avevi lasciato oppure scegli qualcosa di nuovo.</p></div></section><div class="tabbar"><button class="tab-button ${state.homeTab === 'watch' ? 'active' : ''}" data-home-tab="watch">Da vedere</button><button class="tab-button ${state.homeTab === 'upcoming' ? 'active' : ''}" data-home-tab="upcoming">In arrivo</button></div>${listContent}`);

    $$('[data-home-tab]').forEach(b => b.addEventListener('click', () => runViewAction(
      b,
      () => { state.homeTab = b.dataset.homeTab; renderHome(); },
      ['Aggiorno la Home', b.dataset.homeTab === 'upcoming' ? 'Carico il calendario delle prossime uscite.' : 'Carico i contenuti da vedere.']
    )));
    $$('[data-episode-action]').forEach(b => b.addEventListener('click', () => toggleEpisode(b.dataset.series, Number(b.dataset.season), Number(b.dataset.episode), b.dataset.title)));
    if ($('#notifyPermission')) $('#notifyPermission').addEventListener('click', requestNotifications);
    bindHorizontalRails($('#main'));
    bindCommonMediaActions($('#main'));
    const visibleSeries = [...recentlyWatched, ...latestReleased].map(x => x.s);
    if (!state.metadataBackgroundStarted) {
      queuePublicMetadata('series', visibleSeries, { silent:true, includeCast:true });
      queuePublicMetadata('movie', watchFilms.slice(0, 6), { silent:true, includeCast:true });
    }
  }

  function filterTabs(type) {
    if (type === 'series') {
      const count = value => state.series.filter(series => value === 'unwatched' ? seriesNeedsWatching(series) : value === 'completed' ? seriesIsCompleted(series) : value === 'favorite' ? series.favorite : value === 'all' ? true : !seriesIsCompleted(series) && (series.status === value || (value === 'plan' && series.status === 'watchlist'))).length;
      // Keep the terminal order explicit: ['favorite','Preferite'],['all','Tutte'].
      return [['unwatched','Da vedere',count('unwatched')],['watching','In corso',count('watching')],['plan','Da iniziare',count('plan')],['completed','Completate',count('completed')],['favorite','Preferite',count('favorite')],['all','Tutte',count('all')]];
    }
    const count = value => state.movies.filter(movie => value === 'all' ? true : value === 'favorite' ? movie.favorite : value === 'watched' ? movie.watched : !movie.watched).length;
    // Keep the terminal order explicit: ['favorite','Preferiti'],['all','Tutti'].
    return [['watched','Visti',count('watched')],['watchlist','Da vedere',count('watchlist')],['favorite','Preferiti',count('favorite')],['all','Tutti',count('all')]];
  }
  function sortSeriesItems(items, mode = state.seriesSort) {
    const result = [...items];
    result.sort((a, b) => {
      if (mode === 'progress') return seriesProgress(b).percent - seriesProgress(a).percent || a.title.localeCompare(b.title, 'it');
      if (mode === 'recent') return dateMs(latestWatchedAt(b.id)) - dateMs(latestWatchedAt(a.id)) || a.title.localeCompare(b.title, 'it');
      if (mode === 'latestEpisode') return seriesRecentEpisodeTimestamp(b) - seriesRecentEpisodeTimestamp(a) || dateMs(latestWatchedAt(b.id)) - dateMs(latestWatchedAt(a.id)) || a.title.localeCompare(b.title, 'it');
      return a.title.localeCompare(b.title, 'it');
    });
    return result;
  }
  function sortMovieItems(items, mode = state.movieSort) {
    const result = [...items];
    result.sort((a, b) => {
      if (mode === 'rating') return Number(b.rating || 0) - Number(a.rating || 0) || dateMs(b.watchedAt) - dateMs(a.watchedAt) || a.title.localeCompare(b.title, 'it');
      if (mode === 'recent') return dateMs(b.watchedAt || b.addedAt) - dateMs(a.watchedAt || a.addedAt) || a.title.localeCompare(b.title, 'it');
      return a.title.localeCompare(b.title, 'it');
    });
    return result;
  }
  function metadataCoverage(items, kind = null) {
    const rows = (items || []).map(item => metadataItemDiagnostics(item, kind || (state.series.includes(item) ? 'series' : 'movie')));
    const complete = rows.filter(row => row.essentialComplete).length;
    const incomplete = rows.length - complete;
    const errors = rows.filter(row => row.error || row.failedAt).length;
    return { complete, incomplete, errors, total: rows.length, percent: rows.length ? Math.round(complete / rows.length * 100) : 100 };
  }
  function metadataLibraryBanner(kind, items) {
    const coverage = metadataCoverage(items, kind);
    const detail = coverage.incomplete
      ? `${coverage.complete}/${coverage.total} titoli completi · ${coverage.incomplete} da verificare${coverage.errors ? ` · ${coverage.errors} con errore` : ''}.`
      : `${coverage.complete}/${coverage.total} titoli completi.`;
    return `<section class="metadata-banner"><div><strong>Metadati pubblici · copertura ${coverage.percent}%</strong><p>${detail}</p><div class="progress-track metadata-progress"><div class="progress-fill" style="width:${coverage.percent}%"></div></div></div><div class="metadata-banner-actions"><button class="ghost" id="openMetadataDetails">Dettaglio elementi</button><button class="secondary" id="refreshVisibleMetadata">Aggiorna i titoli visibili</button></div></section>`;
  }

  function renderSeriesLibrary() {
    setPage('Serie', 'Libreria e avanzamento', 'series');
    const q = state.seriesSearch.trim();
    let items = state.series.filter(item => matchesMediaSearch(item, q));
    if (state.seriesFilter === 'unwatched') items = items.filter(seriesNeedsWatching);
    else if (state.seriesFilter === 'completed') items = items.filter(seriesIsCompleted);
    else if (state.seriesFilter === 'favorite') items = items.filter(s => s.favorite);
    else if (state.seriesFilter !== 'all') items = items.filter(s => !seriesIsCompleted(s) && ((s.status === state.seriesFilter) || (state.seriesFilter === 'plan' && s.status === 'watchlist')));
    items = sortSeriesItems(items, state.seriesSort);
    const view = state.settings.seriesView;
    const visible = items.slice(0, state.seriesVisible);
    setMain(`<div class="section-head"><div><h2>Le tue serie</h2><p>${state.series.length} serie · ${Number(state.indexes.watchedProgressCount||0).toLocaleString('it-IT')} episodi visti</p></div><button class="primary" id="addSeries">＋ Aggiungi serie</button></div>
      ${metadataLibraryBanner('series', state.series)}
      <div class="tabbar" role="tablist" aria-label="Filtri serie">${filterTabs('series').map(([v,l,count]) => `<button class="tab-button ${state.seriesFilter===v?'active':''}" data-filter="${v}" role="tab" aria-selected="${state.seriesFilter===v}">${l}<span class="filter-count">${count}</span></button>`).join('')}</div>
      <div class="toolbar"><div class="toolbar-left"><label class="search-box"><span>⌕</span><input id="seriesSearch" type="search" placeholder="Cerca nelle tue serie" value="${esc(state.seriesSearch)}" aria-label="Cerca serie"></label>
      <select id="seriesSort" aria-label="Ordina serie"><option value="latestEpisode" ${state.seriesSort==='latestEpisode'?'selected':''}>Ultimo episodio uscito</option><option value="recent" ${state.seriesSort==='recent'?'selected':''}>Ultima visione</option><option value="progress" ${state.seriesSort==='progress'?'selected':''}>Avanzamento</option><option value="title" ${state.seriesSort==='title'?'selected':''}>Titolo</option></select></div>
      <div class="toolbar-right"><div class="view-toggle" aria-label="Vista serie"><button data-view="grid" class="${view==='grid'?'active':''}" aria-label="Vista locandine" aria-pressed="${view==='grid'}">▦</button><button data-view="list" class="${view==='list'?'active':''}" aria-label="Vista elenco" aria-pressed="${view==='list'}">☷</button></div></div></div>
      ${items.length ? `<div class="${view==='grid'?'media-grid':'media-list'}">${visible.map(s => view==='grid'?mediaCard(s,'series'):mediaRow(s,'series')).join('')}</div>${visible.length < items.length ? `<div class="load-more"><button class="secondary" id="loadMoreSeries">Mostra altre ${Math.min(60, items.length-visible.length)} serie</button><span>${visible.length} di ${items.length}</span></div>` : ''}` : `<div class="empty-state"><div class="empty-icon">▣</div><h3>Nessuna serie trovata</h3><p>Cambia filtro o importa la tua cronologia.</p><a class="primary" href="#/import">Importa dati</a></div>`}`);

    $$('[data-filter]').forEach(b => b.addEventListener('click', () => runViewAction(b, () => { state.seriesFilter=b.dataset.filter; state.seriesVisible=60; state.settings.seriesFilter=state.seriesFilter; saveSettings(); renderSeriesLibrary(); })));
    $('#seriesSearch').addEventListener('input', debounce(e => { state.seriesSearch=e.target.value; state.seriesVisible=60; renderSeriesLibrary(); }, 180));
    $$('[data-view]').forEach(b => b.addEventListener('click', () => runViewAction(b, () => { state.settings.seriesView=b.dataset.view; saveSettings(); renderSeriesLibrary(); })));
    $('#seriesSort').addEventListener('change', e => { state.seriesSort=e.target.value; state.settings.seriesSort=state.seriesSort; state.seriesVisible=60; saveSettings(); renderSeriesLibrary(); });
    $('#loadMoreSeries')?.addEventListener('click',()=>{state.seriesVisible+=60;renderSeriesLibrary();});
    $('#addSeries').addEventListener('click', () => location.hash='#/search');
    $('#openMetadataDetails')?.addEventListener('click',()=>showMetadataIssues('series'));
    $('#refreshVisibleMetadata')?.addEventListener('click',()=>{
      state.metadataAutoBudget += 20;
      const targets = visible.filter(item => needsPublicMetadata(item, 'series', true)).slice(0, 12);
      if (!targets.length) showToast('Metadati già aggiornati', 'I titoli visibili hanno già una scheda recente.', '✓');
      else { targets.forEach(item => { item.publicMetadata = { ...(item.publicMetadata || {}), failedAt: null, parts: { ...(item.publicMetadata?.parts || {}), coreComplete: false, castComplete: false, episodesAt: null } }; }); queuePublicMetadata('series', targets, { force:true, includeCast:true, silent:false }); }
    });
    bindCommonMediaActions($('#main'));
    queuePublicMetadata('series', visible.slice(0, 14), { silent:true, includeCast:false }); scheduleBackgroundMetadataSync();
  }

  function renderMovieLibrary() {
    setPage('Film', 'Watchlist, visti e preferiti', 'movies');
    const q = state.movieSearch.trim();
    let items = state.movies.filter(item => matchesMediaSearch(item, q));
    if (state.movieFilter === 'favorite') items=items.filter(m=>m.favorite);
    else if(state.movieFilter==='watchlist') items=items.filter(m=>!m.watched);
    else if(state.movieFilter==='watched') items=items.filter(m=>m.watched);
    items = sortMovieItems(items, state.movieSort);
    const view=state.settings.movieView;
    const visible=items.slice(0,state.movieVisible);
    setMain(`<div class="section-head"><div><h2>I tuoi film</h2><p>${state.movies.filter(m=>m.watched).length} visti · ${state.movies.filter(m=>!m.watched).length} da vedere</p></div><button class="primary" id="addMovie">＋ Aggiungi film</button></div>
      ${metadataLibraryBanner('movies', state.movies)}
      <div class="tabbar" role="tablist" aria-label="Filtri film">${filterTabs('movies').map(([v,l,count])=>`<button class="tab-button ${state.movieFilter===v?'active':''}" data-filter="${v}" role="tab" aria-selected="${state.movieFilter===v}">${l}<span class="filter-count">${count}</span></button>`).join('')}</div>
      <div class="toolbar"><div class="toolbar-left"><label class="search-box"><span>⌕</span><input id="movieSearch" type="search" placeholder="Cerca nei tuoi film" value="${esc(state.movieSearch)}" aria-label="Cerca film"></label>
      <select id="movieSort" aria-label="Ordina film"><option value="recent" ${state.movieSort==='recent'?'selected':''}>Data visione</option><option value="rating" ${state.movieSort==='rating'?'selected':''}>Voto</option><option value="title" ${state.movieSort==='title'?'selected':''}>Titolo</option></select></div><div class="toolbar-right"><div class="view-toggle" aria-label="Vista film"><button data-view="grid" class="${view==='grid'?'active':''}" aria-label="Vista locandine" aria-pressed="${view==='grid'}">▦</button><button data-view="list" class="${view==='list'?'active':''}" aria-label="Vista elenco" aria-pressed="${view==='list'}">☷</button></div></div></div>
      ${items.length?`<div class="${view==='grid'?'media-grid':'media-list'}">${visible.map(m=>view==='grid'?mediaCard(m,'movie'):mediaRow(m,'movie')).join('')}</div>${visible.length<items.length?`<div class="load-more"><button class="secondary" id="loadMoreMovies">Mostra altri ${Math.min(60,items.length-visible.length)} film</button><span>${visible.length} di ${items.length}</span></div>`:''}`:`<div class="empty-state"><div class="empty-icon">🎬</div><h3>Nessun film trovato</h3><p>Aggiungi un titolo o cambia filtro.</p></div>`}`);
    $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>runViewAction(b,()=>{state.movieFilter=b.dataset.filter;state.movieVisible=60;state.settings.movieFilter=state.movieFilter;saveSettings();renderMovieLibrary();})));
    $('#movieSearch').addEventListener('input',debounce(e=>{state.movieSearch=e.target.value;state.movieVisible=60;renderMovieLibrary();},180));
    $$('[data-view]').forEach(b=>b.addEventListener('click',()=>runViewAction(b,()=>{state.settings.movieView=b.dataset.view;saveSettings();renderMovieLibrary();})));
    $('#movieSort').addEventListener('change',e=>{state.movieSort=e.target.value;state.settings.movieSort=state.movieSort;state.movieVisible=60;saveSettings();renderMovieLibrary();});
    $('#loadMoreMovies')?.addEventListener('click',()=>{state.movieVisible+=60;renderMovieLibrary();});
    $('#addMovie').addEventListener('click',()=>location.hash='#/search');
    $('#openMetadataDetails')?.addEventListener('click',()=>showMetadataIssues('movie'));
    $('#refreshVisibleMetadata')?.addEventListener('click',()=>{
      state.metadataAutoBudget += 20;
      const targets=visible.filter(item=>needsPublicMetadata(item,'movie',true)).slice(0,10);
      if(!targets.length)showToast('Metadati già aggiornati','I titoli visibili hanno già una scheda recente.','✓');
      else{targets.forEach(item=>{item.publicMetadata={...(item.publicMetadata||{}),failedAt:null};});queuePublicMetadata('movie',targets,{force:true,includeCast:true,silent:false});}
    });
    bindCommonMediaActions($('#main'));
    queuePublicMetadata('movie', visible.slice(0, 12), { silent:true, includeCast:false }); scheduleBackgroundMetadataSync();
  }

  function recommendationScore(seed, candidate, seedKind, candidateKind) {
    if (!seed || !candidate || seed.id === candidate.id) return -1;
    let score = seedKind === candidateKind ? 4 : 0;
    const seedGenres = new Set((seed.genres || []).map(normalizeSearch).filter(Boolean));
    const candidateGenres = (candidate.genres || []).map(normalizeSearch).filter(Boolean);
    score += candidateGenres.filter(g => seedGenres.has(g)).length * 5;
    const seedCast = new Set((seed.cast || []).map(x => normalizeSearch(x.name)).filter(Boolean));
    score += (candidate.cast || []).filter(x => seedCast.has(normalizeSearch(x.name))).length * 3;
    if (seed.year && candidate.year && Math.abs(Number(seed.year)-Number(candidate.year)) <= 5) score += 1;
    if (candidate.favorite) score += 1;
    if (Number(candidate.rating || 0) >= 4) score += 1;
    return score;
  }
  function similarSuggestions(item, kind, limit = 8) {
    const pool=[...state.series.map(x=>({item:x,kind:'series'})),...state.movies.map(x=>({item:x,kind:'movie'}))];
    return pool.map(row=>({...row,score:recommendationScore(item,row.item,kind,row.kind)})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title),'it')).slice(0,limit);
  }
  function profileRecommendations(limit = 10) {
    const liked=[...state.series.map(x=>({item:x,kind:'series'})),...state.movies.map(x=>({item:x,kind:'movie'}))].filter(row=>row.item.favorite||Number(row.item.rating||0)>=4);
    if(!liked.length)return [];
    const excluded=new Set(liked.map(row=>row.item.id));
    const candidates=[...state.series.map(x=>({item:x,kind:'series'})),...state.movies.map(x=>({item:x,kind:'movie'}))].filter(row=>!excluded.has(row.item.id)&&!(row.kind==='movie'&&row.item.watched&&Number(row.item.rating||0)<4));
    return candidates.map(row=>{let score=0;for(const seed of liked)score=Math.max(score,recommendationScore(seed.item,row.item,seed.kind,row.kind));return{...row,score};}).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title),'it')).slice(0,limit);
  }
  function suggestionReason(seed, candidate) {
    const shared=(candidate.genres||[]).filter(g=>(seed.genres||[]).some(x=>normalizeSearch(x)===normalizeSearch(g))).slice(0,2);
    return shared.length?`Generi in comune: ${shared.join(', ')}`:'Affinità con le tue preferenze';
  }
  function suggestionCardHtml(row, seed = null) {
    const item=row.item, href=row.kind==='series'?`#/series/${encodeURIComponent(item.id)}`:`#/movie/${encodeURIComponent(item.id)}`;
    const reason=seed?suggestionReason(seed,item):(item.genres||[]).slice(0,2).join(' · ')||'Suggerito dal tuo profilo';
    return `<a class="suggestion-card" href="${href}" aria-label="Apri ${esc(item.title)}"><span class="suggestion-poster" style="background:${item.posterGradient||gradient(item.title)}">${item.poster?`<img class="poster-img" src="${esc(item.poster)}" alt="" loading="lazy" decoding="async">`:esc(item.title.slice(0,2).toUpperCase())}</span><span class="suggestion-copy"><strong>${esc(item.title)}</strong><small>${esc([item.year,row.kind==='series'?'Serie':'Film'].filter(Boolean).join(' · '))}</small><em>${esc(reason)}</em></span></a>`;
  }
  function similarSectionHtml(item, kind) {
    const suggestions=similarSuggestions(item,kind,12);
    const railId=`similar-rail-${kind}-${slug(item.id||item.title)}`;
    return `<section class="content-card section similar-section"><div class="section-head"><div><h3>Potrebbero piacerti anche</h3><p>Suggerimenti basati su generi, interpreti e titoli del profilo.</p></div>${suggestions.length?railControlsHtml(railId,'Potrebbero piacerti anche'):''}</div>${suggestions.length?`<div class="suggestion-rail" id="${esc(railId)}" data-rail tabindex="0" role="list" aria-label="Potrebbero piacerti anche">${suggestions.map(row=>suggestionCardHtml(row,item)).join('')}</div>`:'<p class="notice">Aggiungi altri titoli e valutazioni per ottenere suggerimenti più precisi.</p>'}</section>`;
  }

  function detailHero(item, kind) {
    const banner = item.backdrop ? `<figure class="detail-banner media-frame media-frame-backdrop"><img class="detail-backdrop-image" src="${esc(item.backdrop)}" alt="" aria-hidden="true" width="1600" height="420" loading="eager" decoding="async"></figure>` : '';
    const chips = [item.year, ...(item.genres || []).slice(0,3), kind === 'series' ? statusLabel(item.status) : (item.runtime ? minutesToText(item.runtime) : '')].filter(Boolean);
    return `<section class="detail-hero ${banner?'has-detail-banner':'no-detail-banner'}">${banner}<div class="detail-content">
      <div class="detail-poster media-frame media-frame-poster" style="--poster-fallback:${item.posterGradient || gradient(item.title)}">${item.poster?`<img class="poster-img" src="${esc(item.poster)}" alt="Locandina di ${esc(item.title)}" width="500" height="750" loading="eager" decoding="async">`:`<span class="detail-poster-fallback">${esc(item.title)}</span>`}</div>
      <div class="detail-info"><div class="chip-row">${chips.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div><h2>${esc(item.title)}</h2>${item.originalTitle && normalizeSearch(item.originalTitle)!==normalizeSearch(item.title)?`<p class="original-title">Titolo originale: <strong>${esc(item.originalTitle)}</strong></p>`:''}<p>${esc(item.overview || 'Descrizione non ancora disponibile.')}</p>
      <div class="detail-actions"><button class="primary" id="detailMainAction">${kind==='series'?(nextEpisode(item)?'✓ Segna prossimo episodio':'Completata'):(item.watched?'✓ Visto':'Segna visto')}</button><button class="secondary" id="detailFavorite">${item.favorite?'♥ Preferito':'♡ Preferito'}</button><button class="ghost" id="detailEdit">Modifica</button></div></div>
    </div></section>`;
  }

  function renderSeriesDetail(id) {
    const s = state.series.find(x=>x.id===id); if(!s){setPage('Serie non trovata','Errore','series');setMain('<div class="empty-state"><h3>Serie non trovata</h3><a class="primary" href="#/series">Torna alla libreria</a></div>');return;}
    setPage(s.title,'Dettaglio serie','series'); const prog=seriesProgress(s); const ep=nextEpisode(s); const latest=latestReleasedUnwatched(s);
    const info = `<div class="two-column"><div>
      <section class="content-card section"><div class="content-card-heading"><h3>Trama</h3>${publicMetadataSourceHtml(s)}</div><p>${esc(s.overview||'Descrizione non disponibile.')}</p></section>
      <section class="content-card section"><h3>Dove guardarla in streaming/TV</h3><div class="provider-groups">${providersHtml(s)}</div></section>
      ${trailerSectionHtml(s,'series')}
      ${castPanelHtml(s,'series')}
      ${similarSectionHtml(s,'series')}
    </div><aside><section class="content-card"><h3>Il tuo stato</h3><div class="info-list"><div class="info-row"><span>Avanzamento</span><strong>${prog.watched}/${prog.total}</strong></div><div class="info-row"><span>Completamento</span><strong>${prog.percent}%</strong></div><div class="info-row"><span>Ultima visione</span><strong>${fmtDate(latestWatchedAt(s.id))}</strong></div>${latest?`<div class="info-row"><span>Ultimo episodio non visto</span><strong>S${pad2(latest.season)} E${pad2(latest.episode)} · ${fmtDate(latest.airDate)}</strong></div>`:''}</div><div style="margin-top:18px"><label style="font-weight:800">Il tuo voto</label>${starRating(s.rating,s.id)}</div><div style="margin-top:18px"><label for="seriesStatus" style="font-weight:800">Stato</label><select id="seriesStatus" style="width:100%;margin-top:7px"><option value="watching" ${s.status==='watching'?'selected':''}>In corso</option><option value="plan" ${['plan','watchlist'].includes(s.status)?'selected':''}>Da iniziare</option><option value="completed" ${s.status==='completed'?'selected':''}>Completata</option><option value="paused" ${s.status==='paused'?'selected':''}>In pausa</option><option value="dropped" ${s.status==='dropped'?'selected':''}>Abbandonata</option></select></div><button class="secondary" id="enrichSeriesPublic" style="width:100%;margin-top:14px">↻ Aggiorna locandina, episodi e cast</button>${(state.settings.tmdbToken||(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl)?'<button class="ghost" id="enrichSeriesTmdb" style="width:100%;margin-top:10px">Aggiorna dati TMDB/JustWatch</button>':''}</section><section class="content-card italy-schedule-card"><h3>Programmazione Italia</h3><p>${esc(italyReleaseRuleSummary(s))}</p><button class="ghost" id="editItalySchedule" style="width:100%">Modifica disponibilità italiana</button></section></aside></div>`;
    const episodes = `<section><div class="notice ${s.publicMetadata?.provider?'':'warning'}" style="margin-bottom:16px">${s.publicMetadata?.provider?'Calendario ed episodi collegati ai metadati pubblici.':'Gli episodi importati restano tracciabili. Watchverse sta cercando automaticamente titoli, date e nuovi episodi nelle fonti pubbliche.'}</div>
      ${ep?`<article class="content-card" style="margin-bottom:18px"><span class="kicker">Continua il monitoraggio</span><h3>S${pad2(ep.season)} E${pad2(ep.episode)} · ${esc(ep.title)}</h3><p>${esc(ep.overview||'')}</p>${ep.airDate?`<p class="season-meta">Uscita: ${fmtDate(ep.airDate)}</p>`:''}<button class="primary" id="continueEpisode">✓ Segna visto</button></article>`:''}
      ${(s.seasons||[]).slice().sort((a,b)=>a.number-b.number).map(season=>{const eps=(season.episodes||[]).slice().sort((a,b)=>a.episode-b.episode);const watched=eps.filter(e=>isEpisodeWatched(s.id,e.season,e.episode)).length;return `<section class="season"><button class="season-head" data-season-toggle="${season.number}" aria-expanded="true" aria-controls="season-body-${season.number}"><span><strong>${esc(season.name||`Stagione ${season.number}`)}</strong><br><span class="season-meta">${watched}/${eps.length} episodi visti</span></span><span>⌄</span></button><div class="episode-list" id="season-body-${season.number}" data-season-body="${season.number}">${eps.map(e=>`<article class="episode-row"><div class="episode-thumb">${e.image?`<img src="${esc(e.image)}" alt="" loading="lazy" decoding="async">`:`S${pad2(e.season)}E${pad2(e.episode)}`}</div><div><h4>${esc(e.title||`Episodio ${e.episode}`)}</h4><p>${e.airDate?fmtDate(e.airDate)+' · ':''}${e.runtime||50} min</p>${e.overview?`<small>${esc(e.overview.slice(0,180))}</small>`:''}</div><button class="watch-check ${isEpisodeWatched(s.id,e.season,e.episode)?'watched':''}" data-ep="${e.episode}" data-season="${e.season}" data-title="${esc(e.title||'')}" aria-label="${isEpisodeWatched(s.id,e.season,e.episode)?'Segna come non visto':'Segna come visto'}: S${pad2(e.season)} E${pad2(e.episode)} ${esc(e.title||'')}">✓</button></article>`).join('')}</div></section>`;}).join('')||'<div class="empty-state"><h3>Nessun episodio disponibile</h3><p>L’aggiornamento pubblico verrà tentato automaticamente quando sei online.</p></div>'}</section>`;
    setMain(`${detailHero(s,'series')}<div class="tabbar"><button class="tab-button ${state.detailTab==='info'?'active':''}" data-detail-tab="info">Info</button><button class="tab-button ${state.detailTab==='episodes'?'active':''}" data-detail-tab="episodes">Episodi</button></div>${state.detailTab==='info'?info:episodes}`);
    if(state.detailTab==='info'){bindProgrammingActions(s,'series');bindHorizontalRails($('#main'));}
    $$('[data-detail-tab]').forEach(b=>b.addEventListener('click',()=>{state.detailTab=b.dataset.detailTab;renderSeriesDetail(id);}));
    $('#detailFavorite').addEventListener('click',()=>toggleFavorite('series',id));
    $('#detailMainAction').addEventListener('click',()=>{const n=nextEpisode(s);if(n)toggleEpisode(s.id,n.season,n.episode,n.title);});
    $('#detailEdit').addEventListener('click',()=>openEditModal(s,'series'));
    if($('#seriesStatus'))$('#seriesStatus').addEventListener('change',async e=>{s.status=e.target.value;await dbPut('series',s);showToast('Stato aggiornato',statusLabel(s.status));});
    $$('.star-rating button').forEach(b=>b.addEventListener('click',async()=>{s.rating=Number(b.dataset.value);await dbPut('series',s);renderSeriesDetail(id);}));
    if($('#continueEpisode')&&ep)$('#continueEpisode').addEventListener('click',()=>toggleEpisode(s.id,ep.season,ep.episode,ep.title));
    $$('.watch-check').forEach(b=>b.addEventListener('click',()=>toggleEpisode(s.id,Number(b.dataset.season),Number(b.dataset.ep),b.dataset.title)));
    $$('[data-season-toggle]').forEach(b=>b.addEventListener('click',()=>{const body=$(`[data-season-body="${b.dataset.seasonToggle}"]`);body.classList.toggle('hidden');b.setAttribute('aria-expanded',String(!body.classList.contains('hidden')));}));
    $('#enrichSeriesPublic')?.addEventListener('click',()=>manualPublicMetadata('series',s));
    $('#enrichSeriesTmdb')?.addEventListener('click',()=>enrichSeriesFlow(s));
    $('#editItalySchedule')?.addEventListener('click',()=>showItalyScheduleEditor(s));
    queuePublicMetadata('series',[s],{silent:true,includeCast:true});
    idle(()=>maybeLoadProviders('series',s));
    idle(()=>maybeLoadTrailer('series',s));
  }

  function renderMovieDetail(id) {
    const m=state.movies.find(x=>x.id===id);if(!m){setPage('Film non trovato','Errore','movies');setMain('<div class="empty-state"><h3>Film non trovato</h3></div>');return;}
    setPage(m.title,'Dettaglio film','movies');
    setMain(`${detailHero(m,'movie')}<div class="two-column"><div>
      <section class="content-card section"><div class="content-card-heading"><h3>Trama</h3>${publicMetadataSourceHtml(m)}</div><p>${esc(m.overview||'Descrizione non disponibile.')}</p></section>
      ${cinemaProgrammingHtml(m)}
      <section class="content-card section"><h3>Dove guardarlo in streaming/TV</h3><div class="provider-groups">${providersHtml(m)}</div></section>
      ${trailerSectionHtml(m,'movie')}
      ${castPanelHtml(m,'movie')}
      ${similarSectionHtml(m,'movie')}
    </div><aside><section class="content-card"><h3>La tua visione</h3><div class="form-field"><label>Voto personale</label>${starRating(m.rating,m.id)}</div><div class="form-field" style="margin-top:16px"><label for="watchedDate">Data visione</label><input id="watchedDate" type="date" value="${m.watchedAt?isoDate(m.watchedAt):''}"></div><div class="form-field" style="margin-top:16px"><label for="movieNotes">Note</label><textarea id="movieNotes" placeholder="Cosa ne pensi?">${esc(m.notes||'')}</textarea></div><button class="primary" id="saveMovieMeta" style="width:100%;margin-top:14px">Salva</button><button class="secondary" id="enrichMoviePublic" style="width:100%;margin-top:10px">↻ Aggiorna locandina, trama e cast</button>${(state.settings.tmdbToken||(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl)?'<button class="ghost" id="enrichMovieTmdb" style="width:100%;margin-top:10px">Aggiorna dati TMDB/JustWatch</button>':''}</section></aside></div>`);
    bindProgrammingActions(m,'movie');
    bindHorizontalRails($('#main'));
    $('#detailFavorite').addEventListener('click',()=>toggleFavorite('movies',id));
    $('#detailMainAction').addEventListener('click',()=>toggleMovieWatched(id));
    $('#detailEdit').addEventListener('click',()=>openEditModal(m,'movie'));
    $$('.star-rating button').forEach(b=>b.addEventListener('click',async()=>{m.rating=Number(b.dataset.value);await dbPut('movies',m);renderMovieDetail(id);}));
    $('#saveMovieMeta').addEventListener('click',async()=>{m.notes=$('#movieNotes').value.trim();const d=$('#watchedDate').value;if(d){m.watched=true;m.state='watched';m.watchedAt=new Date(`${d}T12:00:00`).toISOString();}await dbPut('movies',m);showToast('Film aggiornato',m.title);route();});
    $('#enrichMoviePublic')?.addEventListener('click',()=>manualPublicMetadata('movie',m));
    $('#enrichMovieTmdb')?.addEventListener('click',()=>enrichMovieFlow(m));
    queuePublicMetadata('movie',[m],{silent:true,includeCast:true});
    idle(()=>maybeLoadProviders('movie',m));
    idle(()=>maybeLoadTrailer('movie',m));
    idle(()=>maybeLoadCinemaShowtimes(m));
  }

  function personCacheId(name, tvmazeId = null, wikidataId = null) {
    return profileScoped(`person-${wikidataId || tvmazeId || slug(name)}`);
  }
  function externalPersonLinks(person) {
    const labels = { wikipediaIt:'Wikipedia IT', wikipediaEn:'Wikipedia EN', wikidata:'Wikidata', tvmaze:'TVmaze', tmdb:'TMDB', imdb:'IMDb', website:'Sito ufficiale', instagram:'Instagram', twitter:'X' };
    return Object.entries(person.links || {}).filter(([,url]) => url).map(([key,url]) => `<a class="source-pill" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(labels[key] || key)} ↗</a>`).join('');
  }
  function personCreditHtml(credit, libraryMatches) {
    const match = libraryMatches.find(x => normalizeSearch(x.title) === normalizeSearch(credit.title) && (!credit.year || !x.year || Number(x.year) === Number(credit.year)));
    const route = match ? (match.mediaType === 'tv' ? `#/series/${encodeURIComponent(match.id)}` : `#/movie/${encodeURIComponent(match.id)}`) : credit.sourceUrl;
    const tag = credit.kind === 'tv' ? 'Serie' : 'Film';
    return `<article class="person-credit-card" data-credit-kind="${esc(credit.kind)}"><div class="person-credit-poster" style="background:${gradient(credit.title)}">${credit.poster?`<img src="${esc(credit.poster)}" alt="" loading="lazy" decoding="async">`:`<span>${esc(credit.title.slice(0,2))}</span>`}</div><div class="person-credit-copy"><span class="result-kicker">${tag}${match?' · Nella tua libreria':''}</span><h3>${esc(credit.title)}</h3><p>${credit.year||'Anno n.d.'}${credit.role?` · ${esc(credit.role)}`:''}</p></div>${route?`<a class="secondary compact" href="${esc(route)}" ${match?'':`target="_blank" rel="noopener noreferrer"`}>Apri</a>`:''}</article>`;
  }
  async function loadPersonDetails(name, role, tvmazeId, wikidataId) {
    const api = publicMetadataApi(); if (!api?.lookupPerson || !navigator.onLine) return null;
    const person = await api.lookupPerson({ name, tvmazeId, wikidataId });
    person.id = personCacheId(name, person.tvmazeId, person.wikidataId);
    person.profileId = state.profileId; person.roleInLibrary = role || person.roleInLibrary || '';
    await dbPut('people', person);
    const existingIndex = state.people.findIndex(x => x.id === person.id || normalizeSearch(x.name) === normalizeSearch(person.name));
    if (existingIndex >= 0) state.people[existingIndex] = person; else state.people.push(person);
    return person;
  }
  function renderPerson(id, query) {
    const name=query.get('name')||id||'Interprete'; const role=query.get('role')||'';
    const tvmazeId=query.get('tvmazeId')||(/^[0-9]+$/.test(String(id||''))?id:null); const wikidataId=query.get('wikidataId')||(/^Q\d+$/.test(String(id||''))?id:null);
    const creditsInLibrary=[...state.series,...state.movies].filter(x=>(x.cast||[]).some(c=>normalizeSearch(c.name)===normalizeSearch(name)));
    const cachedPerson=state.people.find(x=>normalizeSearch(x.name)===normalizeSearch(name) || (tvmazeId&&String(x.tvmazeId)===String(tvmazeId)) || (wikidataId&&x.wikidataId===wikidataId));
    const person=cachedPerson||{name,roleInLibrary:role,filmography:[],links:{}};
    setPage(person.name||name,'Cast e filmografia','search');
    const biography=person.biography||'Biografia non ancora disponibile.';
    const birth=[person.birthday?fmtDate(person.birthday):'',person.placeOfBirth].filter(Boolean).join(' · ');
    const filtered=(person.filmography||[]).filter(c=>state.personFilmographyFilter==='all'||c.kind===state.personFilmographyFilter);
    setMain(`<section class="person-hero"><div class="person-photo" style="background:${gradient(person.name||name)}">${person.photo?`<img src="${esc(person.photo)}" alt="Foto di ${esc(person.name||name)}" loading="eager" decoding="async">`:esc((person.name||name).split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div class="person-hero-copy"><span class="kicker">Cast</span><h2>${esc(person.name||name)}</h2>${birth?`<p class="person-birth">${esc(birth)}</p>`:''}<p>${esc(biography)}</p><div class="source-pills">${externalPersonLinks(person)}</div></div></section>
      <div class="two-column person-layout"><section class="content-card"><div class="section-head"><div><h3>Filmografia</h3><p>${person.filmography?.length||0} titoli trovati nelle fonti pubbliche.</p></div><div class="tabbar compact-tabs"><button class="tab-button ${state.personFilmographyFilter==='all'?'active':''}" data-person-filter="all">Tutto</button><button class="tab-button ${state.personFilmographyFilter==='movie'?'active':''}" data-person-filter="movie">Film</button><button class="tab-button ${state.personFilmographyFilter==='tv'?'active':''}" data-person-filter="tv">Serie</button></div></div><div class="person-credit-list">${filtered.map(c=>personCreditHtml(c,creditsInLibrary)).join('')||'<div class="metadata-loading" role="status"><span class="inline-spinner"></span><div><strong>Filmografia in aggiornamento</strong><p>TVmaze, Wikipedia e Wikidata vengono interrogati in background.</p></div></div>'}</div><h3 style="margin-top:26px">Nella tua libreria</h3><div class="media-grid">${creditsInLibrary.map(x=>x.mediaType==='tv'?mediaCard(x,'series'):mediaCard(x,'movie')).join('')||'<p class="notice">Nessun altro titolo collegato.</p>'}</div></section><aside><section class="content-card"><h3>Informazioni</h3><div class="info-list"><div class="info-row"><span>Nome</span><strong>${esc(person.name||name)}</strong></div><div class="info-row"><span>Nascita</span><strong>${esc(birth||'—')}</strong></div>${person.deathday?`<div class="info-row"><span>Decesso</span><strong>${esc(fmtDate(person.deathday))}</strong></div>`:''}<div class="info-row"><span>Ruolo nella tua libreria</span><strong>${esc(role||person.roleInLibrary||'—')}</strong></div><div class="info-row"><span>Fonte</span><strong>${esc(person.sourceLabel||'TVmaze / Wikipedia / Wikidata')}</strong></div></div><button class="secondary" id="refreshPerson" style="width:100%;margin-top:16px">↻ Aggiorna scheda</button></section></aside></div>`);
    bindCommonMediaActions($('#main'));
    $$('[data-person-filter]').forEach(b=>b.addEventListener('click',()=>{state.personFilmographyFilter=b.dataset.personFilter;renderPerson(id,query);}));
    const refresh=async(force=false)=>{try{if(force)showToast('Aggiornamento avviato',name,'↻');const updated=await loadPersonDetails(name,role,tvmazeId,wikidataId);if(updated)renderPerson(updated.wikidataId||updated.tvmazeId||id,new URLSearchParams({name:updated.name,role,tvmazeId:updated.tvmazeId||'',wikidataId:updated.wikidataId||''}));}catch(e){showToast('Scheda persona non aggiornata',e.message,'!',6000,{kind:'error'});}};
    $('#refreshPerson')?.addEventListener('click',()=>refresh(true));
    const stale=!cachedPerson||Date.now()-dateMs(cachedPerson.updatedAt)>1000*60*60*24*30;
    if(stale)idle(()=>refresh(false));
  }

  function openEditModal(item, kind) {
    openModal(`Modifica ${kind==='series'?'serie':'film'}`,`<div class="form-grid"><div class="form-field full"><label for="editTitle">Titolo italiano</label><input id="editTitle" type="text" value="${esc(item.title)}"></div><div class="form-field full"><label for="editOriginalTitle">Titolo originale</label><input id="editOriginalTitle" type="text" value="${esc(item.originalTitle||'')}"></div><div class="form-field"><label for="editYear">Anno</label><input id="editYear" type="number" value="${item.year||''}"></div><div class="form-field"><label for="editFavorite">Preferito</label><select id="editFavorite"><option value="false" ${!item.favorite?'selected':''}>No</option><option value="true" ${item.favorite?'selected':''}>Sì</option></select></div><div class="form-field full"><label for="editOverview">Descrizione</label><textarea id="editOverview">${esc(item.overview||'')}</textarea></div></div>`,`<button class="ghost" id="cancelEdit">Annulla</button><button class="primary" id="saveEdit">Salva</button>`);
    $('#cancelEdit').addEventListener('click',closeModal);$('#saveEdit').addEventListener('click',async()=>{item.title=$('#editTitle').value.trim()||item.title;item.originalTitle=$('#editOriginalTitle').value.trim()||null;item.aliases=mergeAliases(item.aliases||[],item.title,item.originalTitle);item.year=Number($('#editYear').value)||null;item.favorite=$('#editFavorite').value==='true';item.overview=$('#editOverview').value.trim();await dbPut(kind==='series'?'series':'movies',item);closeModal();await reloadData();route();});
  }

  function publicMetadataApi() { return globalThis.WatchversePublicMetadata || null; }
  function isImportedPlaceholder(value = '') {
    const text = String(value || '').toLowerCase();
    return !text || text.includes('importat') || text.includes('collega i metadati') || text.includes('descrizione non');
  }
  function metadataParts(item) { return item.publicMetadata?.parts || {}; }
  function metadataErrorInfo(error) {
    const message = String(error?.message || error || 'Errore sconosciuto');
    if (/429|rate.?limit|troppe richieste/i.test(message)) return { code:'rate-limit', label:'Limite richieste della fonte' };
    if (/timeout|abort|tempo/i.test(message)) return { code:'timeout', label:'Timeout della fonte' };
    if (/network|fetch|connession|offline|failed to/i.test(message)) return { code:'network', label:'Errore di rete' };
    if (/nessuna corrispondenza|non trovata|scheda pubblica/i.test(message)) return { code:'not-found', label:'Titolo non trovato' };
    if (/Fonte metadati non disponibile|5\d\d/i.test(message)) return { code:'source-error', label:'Fonte temporaneamente non disponibile' };
    return { code:'unknown', label:'Errore tecnico' };
  }
  function metadataRetryDelay(attempts = 1) {
    return Math.min(1000 * 60 * 60 * 24 * 7, 1000 * 60 * 60 * Math.pow(2, Math.max(0, Math.min(6, attempts - 1))));
  }
  function needsPublicMetadata(item, kind, includeCast = false) {
    if (!state.settings.publicMetadataEnabled || !publicMetadataApi()) return false;
    const meta = item.publicMetadata || {}; const parts = metadataParts(item);
    if (meta.nextRetryAt && dateMs(meta.nextRetryAt) > Date.now()) return false;
    if (meta.failedAt && !meta.nextRetryAt && Date.now() - dateMs(meta.failedAt) < 1000 * 60 * 60 * 24) return false;
    const hasCoreData = Boolean(item.poster) && !isImportedPlaceholder(item.overview);
    const hasCastData = Array.isArray(item.cast) && item.cast.length > 0;
    if (!parts.coreComplete || !hasCoreData) return true;
    if (includeCast && (!parts.castComplete || !hasCastData)) return true;
    if (kind === 'series') {
      const episodes = computedSeries(item).episodes;
      const episodesMissing = !episodes.length || !episodes.some(ep => ep.airDate);
      if (episodesMissing || !parts.episodesAt) return true;
      const running = !/ended|canceled/i.test(String(item.providerStatus || item.statusText || ''));
      const maxAge = running ? 1000 * 60 * 60 * 24 * 3 : 1000 * 60 * 60 * 24 * 60;
      if (Date.now() - dateMs(parts.episodesAt) > maxAge) return true;
    }
    return false;
  }
  function mergeSeriesSeasons(existing = [], incoming = [], seriesId = '') {
    const seasons = new Map();
    const ensure = source => {
      const number = Number(source.number ?? 0);
      if (!seasons.has(number)) seasons.set(number, { number, name: source.name || (number === 0 ? 'Speciali' : `Stagione ${number}`), overview: source.overview || '', airDate: source.airDate || null, poster: source.poster || null, episodes: [] });
      const target = seasons.get(number);
      if (source.name) target.name = source.name;
      if (source.overview) target.overview = source.overview;
      if (source.airDate) target.airDate = source.airDate;
      if (source.poster) target.poster = source.poster;
      return target;
    };
    for (const season of existing || []) {
      const target = ensure(season);
      target.episodes = (season.episodes || []).map(ep => ({ ...ep, season: Number(ep.season ?? season.number), episode: Number(ep.episode ?? ep.number) }));
    }
    for (const season of incoming || []) {
      const target = ensure(season);
      const byNumber = new Map((target.episodes || []).map(ep => [Number(ep.episode), ep]));
      for (const fresh of season.episodes || []) {
        const number = Number(fresh.episode ?? fresh.number);
        const old = byNumber.get(number);
        const merged = old ? {
          ...old, ...fresh,
          id: old.id || fresh.id || `${seriesId}:s${season.number}:e${number}`,
          season: Number(season.number), episode: number,
          title: fresh.title && !/^Episodio \d+$/i.test(fresh.title) ? fresh.title : (old.title || fresh.title),
          overview: fresh.overview || old.overview || '', runtime: fresh.runtime || old.runtime || 50,
          airDate: fresh.airDate || old.airDate || null, image: fresh.image || old.image || null
        } : { ...fresh, id: fresh.id || `${seriesId}:s${season.number}:e${number}`, season: Number(season.number), episode: number };
        byNumber.set(number, merged);
      }
      target.episodes = [...byNumber.values()].sort((a, b) => a.episode - b.episode);
    }
    return [...seasons.values()].sort((a, b) => a.number - b.number);
  }
  async function enrichWithPublicMetadata(kind, item, options = {}) {
    const api = publicMetadataApi();
    if (!api) throw new Error('Il modulo dei metadati pubblici non è disponibile.');
    const includeCast = options.includeCast === true;
    const force = options.force === true;
    if (!force) {
      const cached = findSharedCatalogEntry(kind, item);
      if (cached && sharedCatalogIsReusable(kind, cached.data || {}, includeCast)) {
        mergeSharedCatalogData(kind, item, cached);
        await dbPut(catalogKind(kind) === 'series' ? 'series' : 'movies', item);
        state.catalogNetworkAvoidedThisSession++;
        return item;
      }
    }
    const originalStoredTitle = item.title;
    const metadata = kind === 'series'
      ? await api.lookupSeries({ title: item.title, originalTitle: item.originalTitle, aliases: item.aliases, year: item.year, tvdbId: item.tvdbId }, { includeItalianOverview: true, includeCast })
      : await api.lookupMovie({ title: item.title, originalTitle: item.originalTitle, aliases: item.aliases, year: item.year, imdbId: item.imdbId }, { includeCast, castLimit: 18 });
    const now = new Date().toISOString();
    const previousMeta = item.publicMetadata || {}; const previousParts = previousMeta.parts || {};
    const localizedTitle = metadata.title || item.title;
    const originalTitle = metadata.originalTitle || item.originalTitle || (normalizeSearch(localizedTitle) !== normalizeSearch(originalStoredTitle) ? originalStoredTitle : null);
    const aliases = mergeAliases(item.aliases || [], originalStoredTitle, item.originalTitle, localizedTitle, originalTitle, metadata.aliases || []);
    const resolvedOverview = metadata.overview || item.overview;
    const resolvedPoster = metadata.poster || item.poster;
    const resolvedCast = includeCast ? (metadata.cast || []) : (item.cast || []);
    const coreComplete = Boolean(resolvedPoster) && !isImportedPlaceholder(resolvedOverview) && metadata.coreComplete !== false;
    const castComplete = !includeCast || resolvedCast.length > 0;
    const parts = {
      ...previousParts,
      coreAt: previousParts.coreAt || now,
      coreComplete,
      castAt: includeCast ? now : previousParts.castAt,
      castComplete: includeCast ? castComplete : !!previousParts.castComplete,
      episodesAt: kind === 'series' ? now : previousParts.episodesAt
    };
    if (kind === 'series') {
      const userFields = { id: item.id, profileId: item.profileId, status: item.status, favorite: item.favorite, rating: item.rating, notes: item.notes };
      Object.assign(item, {
        title: localizedTitle, originalTitle, aliases,
        year: item.year || metadata.year || null,
        overview: resolvedOverview,
        overviewLanguage: metadata.language || item.overviewLanguage || 'it',
        genres: metadata.genres?.length ? metadata.genres : (item.genres || []),
        runtime: metadata.runtime || item.runtime || null,
        poster: resolvedPoster || null,
        backdrop: metadata.backdrop || item.backdrop || metadata.poster || null,
        cast: resolvedCast,
        tvdbId: item.tvdbId || metadata.tvdbId || null,
        imdbId: item.imdbId || metadata.imdbId || null,
        network: metadata.network || item.network || null,
        officialSite: metadata.officialSite || item.officialSite || null,
        providerStatus: metadata.statusText || item.providerStatus || null,
        seasons: mergeSeriesSeasons(item.seasons || [], metadata.seasons || [], item.id),
        publicMetadata: { ...previousMeta, provider: metadata.provider, providerLabel: metadata.providerLabel, providerId: metadata.providerId, sourceUrl: metadata.sourceUrl, italianSourceUrl: metadata.italianSourceUrl, englishSourceUrl: metadata.englishSourceUrl, language: metadata.language, parts, failedAt: null, error: null, errorCode: null, errorCategory: null, attempts: 0, nextRetryAt: coreComplete && castComplete ? null : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), updatedAt: now }
      }, userFields);
      await dbPut('series', item);
      await saveSharedCatalog('series', item, 'public-metadata');
      invalidateSeriesComputed(item.id);
      idle(() => updateAutomaticItalySchedule(item).then(changed => { if (changed) scheduleMetadataRerender(item.id); }).catch(() => {}));
    } else {
      Object.assign(item, {
        title: localizedTitle, originalTitle, aliases,
        year: item.year || metadata.year || null,
        overview: resolvedOverview,
        overviewLanguage: metadata.language || item.overviewLanguage || 'it',
        genres: metadata.genres?.length ? metadata.genres : (item.genres || []),
        runtime: metadata.runtime || item.runtime || null,
        poster: resolvedPoster || null,
        backdrop: metadata.backdrop || item.backdrop || metadata.poster || null,
        cast: resolvedCast,
        wikidataId: metadata.wikidataId || item.wikidataId || null,
        imdbId: item.imdbId || metadata.imdbId || null,
        publicMetadata: { ...previousMeta, provider: metadata.provider, providerLabel: metadata.providerLabel, sourceUrl: metadata.sourceUrl, italianSourceUrl: metadata.italianSourceUrl, englishSourceUrl: metadata.englishSourceUrl, language: metadata.language, parts, failedAt: null, error: null, errorCode: null, errorCategory: null, attempts: 0, nextRetryAt: coreComplete && castComplete ? null : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), updatedAt: now }
      });
      await dbPut('movies', item);
      await saveSharedCatalog('movie', item, 'public-metadata');
    }
    return item;
  }
  function scheduleMetadataRerender(itemId = null) {
    if (state.metadataRenderPending) return;
    const current = parseRoute();
    const isCurrentDetail = itemId && current.id === itemId && ['series', 'movie'].includes(current.page);
    state.metadataRenderPending = true;
    state.metadataRerenderTimer = setTimeout(() => {
      state.metadataRenderPending = false;
      if (state.profileSelected && ['home', 'series', 'movies', 'movie'].includes(parseRoute().page)) route({ loader:false, preserveScroll:true });
    }, isCurrentDetail ? 260 : 5000);
  }
  function scheduleMetadataRecoveryPass() {
    if (state.metadataRecoveryScheduled || state.metadataRecoveryDone || !navigator.onLine || !state.settings.publicMetadataEnabled || !publicMetadataApi()) return;
    const failedSeries = state.series.filter(item => item.publicMetadata?.failedAt);
    const failedMovies = state.movies.filter(item => item.publicMetadata?.failedAt);
    if (!failedSeries.length && !failedMovies.length) return;
    state.metadataRecoveryScheduled = true;
    setTimeout(() => {
      state.metadataRecoveryScheduled = false;
      if (!navigator.onLine || state.metadataRunning || state.metadataQueue.length) return;
      state.metadataRecoveryDone = true;
      [...failedSeries, ...failedMovies].forEach(item => { item.publicMetadata = { ...(item.publicMetadata || {}), failedAt: null, error: null, nextRetryAt: null }; });
      queuePublicMetadata('series', failedSeries, { force: true, unlimited: true, silent: true, includeCast: true });
      queuePublicMetadata('movie', failedMovies, { force: true, unlimited: true, silent: true, includeCast: true });
      showToast('Recupero metadati', `Nuovo tentativo per ${failedSeries.length + failedMovies.length} titoli da verificare.`, '↻', 3600);
    }, 12000);
  }

  function pumpMetadataQueue() {
    scheduleMetadataHeaderUpdate();
    while (state.metadataRunning < 2 && state.metadataQueue.length) {
      const task = state.metadataQueue.shift();
      state.metadataRunning++;
      scheduleMetadataHeaderUpdate();
      enrichWithPublicMetadata(task.kind, task.item, { includeCast: task.includeCast, force: task.force })
        .then(() => {
          state.metadataCompletedThisSession++;
          if (!task.silent) showToast('Metadati aggiornati', task.item.title, '✓', 2600);
          scheduleMetadataRerender(task.item.id);
        })
        .catch(async error => {
          state.metadataFailedThisSession++;
          const now = new Date();
          const previous = task.item.publicMetadata || {};
          const attempts = Number(previous.attempts || 0) + 1;
          const errorInfo = metadataErrorInfo(error);
          const nextRetryAt = new Date(now.getTime() + metadataRetryDelay(attempts)).toISOString();
          task.item.publicMetadata = { ...previous, failedAt: now.toISOString(), error: error.message, errorCode: errorInfo.code, errorCategory: errorInfo.label, attempts, nextRetryAt };
          try { await dbPut(task.kind === 'series' ? 'series' : 'movies', task.item); } catch {}
          try { await saveSharedCatalog(task.kind, task.item, 'public-metadata-error'); } catch {}
          if (!task.silent) showToast('Metadati non trovati', `${task.item.title}: ${error.message}`, '!', 6000, { kind: 'error' });
        })
        .finally(() => {
          state.metadataRunning--;
          state.metadataQueuedIds.delete(`${task.kind}:${task.item.id}`);
          scheduleMetadataHeaderUpdate();
          if (state.metadataRunning === 0 && state.metadataQueue.length === 0) scheduleMetadataRecoveryPass();
          setTimeout(pumpMetadataQueue, 180);
        });
    }
  }

  function queuePublicMetadata(kind, items, options = {}) {
    if (!state.settings.publicMetadataEnabled || (!state.settings.autoEnrichVisible && !options.force && !options.unlimited)) return;
    for (const item of items || []) {
      const key = `${kind}:${item.id}`;
      const queued = state.metadataQueue.find(task => `${task.kind}:${task.item.id}` === key);
      if (queued) { if (options.includeCast) queued.includeCast = true; if (options.force) queued.force = true; continue; }
      if (state.metadataQueuedIds.has(key)) continue;
      if (!options.force && !needsPublicMetadata(item, kind, options.includeCast)) continue;
      if (!options.force && !options.unlimited && state.metadataAutoBudget <= 0) break;
      if (!options.force && !options.unlimited) state.metadataAutoBudget--;
      state.metadataQueuedIds.add(key);
      state.metadataQueue.push({ kind, item, includeCast: !!options.includeCast, silent: options.silent !== false, force: options.force === true });
    }
    scheduleMetadataHeaderUpdate();
    idle(pumpMetadataQueue);
  }
  function scheduleBackgroundMetadataSync(force = false) {
    if ((!force && state.metadataBackgroundStarted) || !navigator.onLine || !state.settings.publicMetadataEnabled || libraryIsEmpty()) return;
    if (force) {
      for (const item of [...state.series, ...state.movies]) {
        if (item.publicMetadata?.failedAt) item.publicMetadata = { ...item.publicMetadata, failedAt: null, error: null, nextRetryAt: null };
      }
    }
    state.metadataBackgroundStarted = true;
    idle(() => {
      const seriesTargets = sortSeriesItems(state.series, 'recent').filter(item => needsPublicMetadata(item, 'series', true));
      const movieTargets = sortMovieItems(state.movies, 'recent').filter(item => needsPublicMetadata(item, 'movie', true));
      // Prima i titoli usati più di recente; poi il resto. Core, cast ed episodi vengono acquisiti insieme e salvati una sola volta.
      const targets = [];
      const max = Math.max(1, Number(state.metadataAutoBudget || 36));
      for (let index = 0; targets.length < max && (index < seriesTargets.length || index < movieTargets.length); index += 1) {
        if (seriesTargets[index]) targets.push({ kind:'series', item:seriesTargets[index] });
        if (movieTargets[index] && targets.length < max) targets.push({ kind:'movie', item:movieTargets[index] });
      }
      for (const target of targets) queuePublicMetadata(target.kind, [target.item], { silent:true, includeCast:true });
      scheduleMetadataHeaderUpdate();
      if (!state.metadataQueue.length && state.metadataRunning === 0) scheduleMetadataRecoveryPass();
    });
  }
  function publicMetadataSourceHtml(item) {
    const meta = item.publicMetadata;
    if (!meta?.providerLabel) return '<span class="metadata-source pending">Metadati pubblici in aggiornamento</span>';
    const link = meta.sourceUrl ? ` href="${esc(meta.sourceUrl)}" target="_blank" rel="noopener noreferrer"` : '';
    return `<a class="metadata-source"${link}>Fonte: ${esc(meta.providerLabel)}${meta.language==='en'?' · testo inglese':''}</a>`;
  }
  async function manualPublicMetadata(kind, item) {
    if (!navigator.onLine) { showToast('Connessione assente', 'I metadati pubblici richiedono internet.', '!', 5000, { kind: 'error' }); return; }
    showToast('Aggiornamento avviato', item.title, '↻', 2500);
    item.publicMetadata = { ...(item.publicMetadata || {}), failedAt: null, nextRetryAt: null };
    queuePublicMetadata(kind, [item], { force: true, includeCast: true, silent: false });
  }

  async function tmdbFetch(path, params = {}) {
    const cfg = window.WATCHVERSE_CONFIG || {};
    let res;
    if (cfg.tmdbProxyUrl) {
      const session = await WatchverseAuth.restoreSession();
      res = await fetch(cfg.tmdbProxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ path, params })
      });
    } else {
      const token = state.settings.tmdbToken?.trim();
      if (!token) throw new Error('Configura il proxy TMDB online oppure un token locale nelle impostazioni.');
      const url = new URL(`${TMDB_BASE}${path}`); Object.entries(params).forEach(([k,v]) => v !== undefined && v !== null && url.searchParams.set(k, v));
      res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, accept: 'application/json' } });
    }
    if (!res.ok) { let detail=''; try { detail=(await res.json())?.error||''; } catch {} throw new Error(detail || `TMDB ha risposto ${res.status}`); }
    return res.json();
  }
  function tmdbPoster(path) { return path ? `${TMDB_IMG}${path}` : null; }
  function tmdbBackdrop(path) { return path ? `${TMDB_BACKDROP}${path}` : null; }

  async function searchTMDB(query) {
    if (!query.trim()) return [];
    const [movies,tv,people] = await Promise.all([
      tmdbFetch('/search/movie',{query,language:'it-IT',region:'IT',include_adult:'false'}),
      tmdbFetch('/search/tv',{query,language:'it-IT',include_adult:'false'}),
      tmdbFetch('/search/person',{query,language:'it-IT',include_adult:'false'})
    ]);
    return [
      ...(movies.results||[]).slice(0,8).map(x=>({kind:'movie',id:x.id,title:x.title,year:(x.release_date||'').slice(0,4),overview:x.overview,poster:tmdbPoster(x.poster_path)})),
      ...(tv.results||[]).slice(0,8).map(x=>({kind:'tv',id:x.id,title:x.name,year:(x.first_air_date||'').slice(0,4),overview:x.overview,poster:tmdbPoster(x.poster_path)})),
      ...(people.results||[]).slice(0,6).map(x=>({kind:'person',id:x.id,title:x.name,year:'Persona',overview:(x.known_for||[]).map(k=>k.title||k.name).filter(Boolean).join(', '),poster:tmdbPoster(x.profile_path)}))
    ];
  }

  function renderSearch() {
    setPage('Cerca','Film, serie e persone','search');
    const local = [...state.series.map(x=>({...x,kind:'tv'})),...state.movies.map(x=>({...x,kind:'movie'}))];
    const tmdbReady=!!(state.settings.tmdbToken||(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl);
    const allRecommended=profileRecommendations(18);
    const recommendationFilter=['all','movie','series'].includes(state.searchRecommendationFilter)?state.searchRecommendationFilter:'all';
    state.searchRecommendationFilter=recommendationFilter;
    const recommended=allRecommended.filter(row=>recommendationFilter==='all'||row.kind===recommendationFilter);
    const recommendationCounts={all:allRecommended.length,movie:allRecommended.filter(row=>row.kind==='movie').length,series:allRecommended.filter(row=>row.kind==='series').length};
    const recommendationRailId='search-recommendations-rail';
    const recommendationBlock=`<section class="search-recommendations"><div class="section-head search-recommendation-head"><div><span class="kicker">Per ${esc(currentProfile()?.name||'te')}</span><h2>Proposte basate sui tuoi gusti</h2><p>Partiamo da preferiti e valutazioni positive. Puoi distinguere rapidamente film e serie TV.</p></div><div class="search-recommendation-actions"><div class="recommendation-filter" role="tablist" aria-label="Filtra le proposte"><button type="button" role="tab" aria-selected="${recommendationFilter==='all'}" class="${recommendationFilter==='all'?'active':''}" data-recommendation-filter="all">Tutti <span>${recommendationCounts.all}</span></button><button type="button" role="tab" aria-selected="${recommendationFilter==='movie'}" class="${recommendationFilter==='movie'?'active':''}" data-recommendation-filter="movie">Film <span>${recommendationCounts.movie}</span></button><button type="button" role="tab" aria-selected="${recommendationFilter==='series'}" class="${recommendationFilter==='series'?'active':''}" data-recommendation-filter="series">Serie TV <span>${recommendationCounts.series}</span></button></div>${recommended.length?railControlsHtml(recommendationRailId,'proposte basate sui tuoi gusti'):''}</div></div>${recommended.length?`<div class="suggestion-rail" id="${recommendationRailId}" data-rail tabindex="0" role="list" aria-label="Proposte basate sui tuoi gusti">${recommended.map(row=>suggestionCardHtml(row)).join('')}</div>`:`<div class="notice">${allRecommended.length?'Non ci sono ancora proposte per questo tipo di contenuto.':'Segna qualche titolo come preferito o assegna almeno 4 stelle per attivare le proposte personalizzate.'}</div>`}</section>`;
    setMain(`${recommendationBlock}<section class="content-card"><div class="section-head"><div><h2>Trova qualcosa da vedere</h2><p>Cerca film, serie TV e interpreti.</p></div></div>
      <div class="search-box" style="max-width:720px"><span>⌕</span><input id="globalSearch" type="search" placeholder="Titolo, serie o interprete" autofocus></div>
      <div id="searchNotice" class="notice" style="margin-top:14px">I risultati includono i titoli della tua libreria e le proposte disponibili online.</div>
      <div id="searchResults" class="search-results"><div class="empty-state"><div class="empty-icon">⌕</div><h3>Inizia a digitare</h3><p>I risultati appariranno qui.</p></div></div></section>`);
    $$('[data-recommendation-filter]').forEach(button=>button.addEventListener('click',()=>{state.searchRecommendationFilter=button.dataset.recommendationFilter;renderSearch();}));
    bindHorizontalRails($('#main'));
    const input=$('#globalSearch'), result=$('#searchResults');
    const run=debounce(async()=>{
      const q=input.value.trim();if(!q){result.innerHTML='<div class="empty-state"><div class="empty-icon">⌕</div><h3>Inizia a digitare</h3></div>';return;}
      const localMatches=local.filter(x=>matchesMediaSearch(x,q)).slice(0,10);
      const localCatalogIds=new Set(local.map(item=>findSharedCatalogEntry(item.kind,item)?.id).filter(Boolean));
      const sharedMatches=sharedCatalogSearch(q,12).filter(row=>!localCatalogIds.has(row.catalogEntryId));
      state.catalogResults=sharedMatches;
      const localHtml=`${localMatches.length?'<h3>Già nella libreria del profilo</h3>':''}${localMatches.map(x=>searchResultHtml({kind:x.kind,id:x.id,title:x.title,originalTitle:x.originalTitle,year:x.year,overview:x.overview,poster:x.poster},true)).join('')}`;
      const sharedHtml=sharedMatches.length?`<h3 style="margin-top:20px">Già scaricati sul dispositivo</h3>${sharedMatches.map(x=>searchResultHtml(x,false,'catalog')).join('')}`:'';
      result.innerHTML=`${localHtml}${sharedHtml}${inlineCinemaLoaderHtml('Ricerca in corso', 'Sto cercando serie, film e persone.')}`;
      bindSearchActions();
      const api=publicMetadataApi();
      try{
        const tasks=[api?.searchSeries(q)||Promise.resolve([]),api?.searchMovies(q)||Promise.resolve([])];
        if(tmdbReady)tasks.push(searchTMDB(q));
        const values=await Promise.allSettled(tasks);
        const publicRows=[...(values[0].status==='fulfilled'?values[0].value:[]),...(values[1].status==='fulfilled'?values[1].value:[])];
        const tmdbRows=tmdbReady&&values[2]?.status==='fulfilled'?values[2].value:[];
        state.publicResults=publicRows;state.tmdbResults=tmdbRows;
        result.innerHTML=`${localHtml}${sharedHtml}<h3 style="margin-top:20px">Risultati pubblici</h3>${publicRows.map(x=>searchResultHtml(x,false)).join('')||'<p class="notice">Nessun ulteriore risultato pubblico.</p>'}${tmdbRows.length?`<h3 style="margin-top:20px">Risultati TMDB</h3>${tmdbRows.map(x=>searchResultHtml(x,false,'tmdb')).join('')}`:''}`;
        bindSearchActions();
      }catch(e){result.innerHTML+=`<p class="notice danger">${esc(e.message)}</p>`;}
    },420);input.addEventListener('input',run);
  }

  function searchResultHtml(x,local=false,source='public'){
    const typeLabel=x.kind==='tv'?'Serie TV':x.kind==='movie'?'Film':'Persona';
    const fallback=x.kind==='person'?'👤':x.kind==='tv'?'TV':'FILM';
    const sourceLabel=local?' · Nella tua libreria':source==='catalog'?' · Già scaricato':'';
    const actionLabel=x.kind==='person'?'Apri':source==='catalog'?'＋ Aggiungi senza download':'＋ Aggiungi';
    return `<article class="search-result" data-result-kind="${esc(x.kind)}" data-result-id="${esc(x.id)}" data-result-source="${local?'local':source}" data-local="${local}"><div class="thumb" style="background:${gradient(x.title)}">${x.poster?`<img src="${esc(x.poster)}" alt="${x.kind==='person'?'Foto':'Locandina'} di ${esc(x.title)}" loading="lazy" decoding="async">`:`<span>${fallback}</span>`}</div><div class="search-result-copy"><span class="result-kicker">${typeLabel}${x.year?` · ${esc(x.year)}`:''}${sourceLabel}</span><h3>${esc(x.title)}</h3>${x.originalTitle&&normalizeSearch(x.originalTitle)!==normalizeSearch(x.title)?`<small class="row-original-title">Titolo originale: ${esc(x.originalTitle)}</small>`:''}<p>${x.overview?esc(x.overview):'Descrizione non ancora disponibile.'}</p></div><div class="search-result-action">${local?`<a class="secondary" href="${x.kind==='tv'?'#/series/':'#/movie/'}${encodeURIComponent(x.id)}">Apri ${x.kind==='tv'?'serie':'film'}</a>`:`<button class="primary" data-add-result>${actionLabel}</button>`}</div></article>`;
  }
  async function addFromPublicResult(x){
    const kind=x.kind==='tv'?'series':'movie';
    const id=kind==='series'?profileScoped(`public-tv-${x.publicProvider||'tvmaze'}-${x.id||slug(x.title)}`):profileScoped(`public-movie-${x.publicProvider||'wiki'}-${x.id||slug(x.title)}`);
    const store=kind==='series'?'series':'movies';
    if((kind==='series'?state.series:state.movies).some(item=>item.id===id||mergeAliases(item.title,item.originalTitle,item.aliases).some(t=>mergeAliases(x.title,x.originalTitle,x.aliases).some(u=>normalizeTitleForMatch(t)===normalizeTitleForMatch(u))))){throw new Error('Il titolo è già presente nella libreria.');}
    const item=kind==='series'?{id,profileId:state.profileId,mediaType:'tv',title:x.title,originalTitle:x.originalTitle||null,aliases:mergeAliases(x.aliases||[],x.title,x.originalTitle),year:Number(x.year)||null,tvdbId:x.tvdbId||null,publicMetadata:{provider:x.publicProvider||'tvmaze',providerId:x.id,parts:{}},overview:x.overview||'Metadati in aggiornamento.',genres:[],status:'plan',favorite:false,rating:0,poster:x.poster||null,posterGradient:gradient(x.title),backdropGradient:gradient(x.title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[],seasons:[]}:{id,profileId:state.profileId,mediaType:'movie',title:x.title,originalTitle:x.originalTitle||null,aliases:mergeAliases(x.aliases||[],x.title,x.originalTitle),year:Number(x.year)||null,publicMetadata:{provider:x.publicProvider||'wikipedia',providerId:x.id,parts:{}},overview:x.overview||'Metadati in aggiornamento.',genres:[],runtime:null,watched:false,state:'watchlist',favorite:false,rating:0,poster:x.poster||null,posterGradient:gradient(x.title),backdropGradient:gradient(x.title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[],notes:''};
    await dbPut(store,item);(kind==='series'?state.series:state.movies).push(item);rebuildIndexes();
    await enrichWithPublicMetadata(kind,item,{includeCast:true});
    return item;
  }
  function normalizeTitleForMatch(value){return publicMetadataApi()?.normalize?.(value)||slug(value);}
  function bindSearchActions(){
    $$('[data-add-result]').forEach(b=>b.addEventListener('click',async()=>{
      const row=b.closest('[data-result-id]');const source=row.dataset.resultSource;
      let x;
      if(source==='tmdb')x=state.tmdbResults.find(r=>String(r.id)===row.dataset.resultId&&r.kind===row.dataset.resultKind);
      else if(source==='catalog')x=state.catalogResults.find(r=>String(r.id)===row.dataset.resultId&&r.kind===row.dataset.resultKind);
      else x=state.publicResults.find(r=>String(r.id)===row.dataset.resultId&&r.kind===row.dataset.resultKind);
      if(!x)return;
      if(x.kind==='person'){location.hash=`#/person/${x.id}?name=${encodeURIComponent(x.title)}`;return;}
      b.disabled=true;b.textContent='Caricamento…';
      try{
        const item=source==='catalog'?await addFromSharedCatalogResult(x):source==='tmdb'?await addFromTMDB(x.kind,x.id):await addFromPublicResult(x);
        showToast('Aggiunto alla libreria',x.title);await reloadData();
        location.hash=(x.kind==='tv'?`#/series/${encodeURIComponent(item.id)}`:`#/movie/${encodeURIComponent(item.id)}`);
      }catch(e){showToast('Impossibile aggiungere',e.message,'!',6000,{kind:'error'});b.disabled=false;b.textContent='＋ Aggiungi';}
    }));
  }


  function selectTmdbTrailer(rows = []) {
    const candidates = (rows || []).filter(v => v.site === 'YouTube' && v.key);
    const score = v => {
      let n = 0;
      if (/trailer/i.test(v.type || '')) n += 50;
      if (v.official) n += 25;
      if (/it/i.test(v.iso_639_1 || '')) n += 15;
      if (/teaser/i.test(v.type || '')) n += 8;
      if (/clip|featurette/i.test(v.type || '')) n -= 10;
      return n;
    };
    const best = candidates.sort((a,b) => score(b) - score(a) || String(b.published_at || '').localeCompare(String(a.published_at || '')))[0];
    return best ? { site:'YouTube', key:best.key, name:best.name || 'Trailer ufficiale', type:best.type || 'Trailer', official:!!best.official, language:best.iso_639_1 || '', source:'TMDB', updatedAt:new Date().toISOString() } : null;
  }
  async function fetchTmdbTrailer(kind, id) {
    const tmdbKind = kind === 'series' ? 'tv' : 'movie';
    const data = await tmdbFetch(`/${tmdbKind}/${id}/videos`, { language:'it-IT', include_video_language:'it,en,null' });
    return selectTmdbTrailer(data.results || []);
  }
  function officialTrailerForItem(item) {
    const override=OFFICIAL_TRAILER_OVERRIDES[`${normalizeSearch(item.title)}|${item.year||''}`];
    if(override)return override;
    if(item.trailerOfficialUrl){
      const match=String(item.trailerOfficialUrl).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/);
      return match?{site:'YouTube',key:match[1],name:'Trailer ufficiale',official:true,url:item.trailerOfficialUrl}:{site:'Web',name:'Trailer ufficiale',official:true,url:item.trailerOfficialUrl};
    }
    if(item.trailer?.url)return {...item.trailer,url:item.trailer.url};
    if(item.trailer?.site==='YouTube'&&item.trailer?.key)return item.trailer;
    return null;
  }
  function trailerSectionHtml(item, kind) {
    const trailer=officialTrailerForItem(item);
    const youtubeKey=trailer?.site==='YouTube'&&trailer?.key?trailer.key:null;
    const href=trailer?.url||(youtubeKey?`https://www.youtube.com/watch?v=${encodeURIComponent(youtubeKey)}`:'');
    const visual=youtubeKey?`https://i.ytimg.com/vi/${encodeURIComponent(youtubeKey)}/hqdefault.jpg`:(item.backdrop||item.poster||'');
    if(!href&&item.trailerLookupStatus==='loading')return `<section class="content-card section trailer-card"><div class="section-head"><div><h3>Guarda il trailer</h3></div></div>${inlineCinemaLoaderHtml('Ricerca trailer ufficiale', 'Controllo TMDB e i risultati pubblici ufficiali.')}</section>`;
    if(!href)return `<section class="content-card section trailer-card"><div class="section-head"><div><h3>Guarda il trailer</h3><p>Informazione non disponibile</p></div></div></section>`;
    const title=trailer?.name||'Guarda il trailer';
    const trailerLabel=trailer?.official?'Trailer ufficiale':'Trailer trovato';
    return `<section class="content-card section trailer-card"><div class="section-head"><div><h3>Guarda il trailer</h3></div><span class="source-state state-ready">${trailerLabel}</span></div><a class="trailer-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(title)}${youtubeKey?' su YouTube':''}"><div class="trailer-thumb" style="background:${item.backdropGradient||gradient(item.title+' trailer')}">${visual?`<img src="${esc(visual)}" alt="Anteprima trailer di ${esc(item.title)}" loading="lazy" decoding="async">`:''}<span class="trailer-play" aria-hidden="true">▶</span></div><div class="trailer-copy"><strong>${esc(title)}</strong><span>${youtubeKey?'YouTube':'Apri trailer'} ↗</span></div></a></section>`;
  }

  function publicSourcesBaseUrl() {
    const configured=String((window.WATCHVERSE_CONFIG||{}).publicSourcesProxyUrl||'').replace(/\/$/,'');
    if(configured)return configured;
    const localHost=['localhost','127.0.0.1','::1'].includes(location.hostname);
    return (localHost&&(location.protocol==='http:'||location.protocol==='https:')) ? '' : null;
  }
  async function publicSourceFetch(path, params={}) {
    const base=publicSourcesBaseUrl();
    if(base===null)throw new Error('Le fonti locali richiedono avvia_server.py.');
    const configured=String((window.WATCHVERSE_CONFIG||{}).publicSourcesProxyUrl||'').replace(/\/$/,'');
    let response;
    if(configured){
      const session=await WatchverseAuth.restoreSession();
      response=await fetch(configured,{method:'POST',headers:{'Content-Type':'application/json',accept:'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},body:JSON.stringify({path,params})});
    }else{
      const url=new URL(`${base}${path}`,location.href);
      Object.entries(params).forEach(([key,value])=>{if(value!==undefined&&value!==null&&value!=='')url.searchParams.set(key,String(value));});
      response=await fetch(url,{headers:{accept:'application/json'}});
    }
    if(!response.ok)throw new Error(`Fonte pubblica non disponibile (${response.status})`);
    return response.json();
  }
  function tmdbIsReady(){return !!(state.settings.tmdbToken||(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl);}
  async function resolveTmdbId(kind,item){
    if(item.tmdbId)return Number(item.tmdbId);
    if(!tmdbIsReady())return null;
    const tmdbKind=kind==='series'?'tv':'movie';
    const params={query:item.title,language:'it-IT',include_adult:'false'};
    if(item.year)params[kind==='series'?'first_air_date_year':'year']=item.year;
    const data=await tmdbFetch(`/search/${tmdbKind}`,params);
    const rows=data.results||[];
    const exact=rows.find(row=>normalizeSearch(row.name||row.title)===normalizeSearch(item.title)&&(!item.year||String(row.first_air_date||row.release_date||'').startsWith(String(item.year))));
    const best=exact||rows[0];
    if(!best)return null;
    item.tmdbId=Number(best.id);
    return item.tmdbId;
  }
  async function maybeLoadProviders(kind,item){
    const groups=item.providerGroups||{};
    const hasProviders=['streaming','rent','buy','free'].some(key=>Array.isArray(groups[key])&&groups[key].length);
    const recent=dateMs(item.providersUpdatedAt||item.providerCheckedAt)>Date.now()-1000*60*60*24;
    if((hasProviders&&recent)||item.providerStatus==='loading'||(!tmdbIsReady()&&item.providerStatus==='unavailable'))return;
    if(!tmdbIsReady()){item.providerStatus='unavailable';return;}
    item.providerStatus='loading';
    const active=parseRoute();if((kind==='series'&&active.page==='series'&&active.id===item.id)||(kind==='movie'&&active.page==='movie'&&active.id===item.id))route({ loader:false, preserveScroll:true });
    try{
      const id=await resolveTmdbId(kind,item);
      if(!id)throw new Error('Titolo non associato a TMDB');
      const providers=await fetchProviders(kind==='series'?'tv':'movie',id);
      item.providerGroups=providers;
      item.providerStatus=['streaming','rent','buy','free'].some(key=>(providers[key]||[]).length)?'available':'unavailable';
      item.providersUpdatedAt=new Date().toISOString();item.providerCheckedAt=item.providersUpdatedAt;
      await dbPut(kind==='series'?'series':'movies',item);await saveSharedCatalog(kind,item,'tmdb-providers');
      const current=parseRoute();if((kind==='series'&&current.page==='series'&&current.id===item.id)||(kind==='movie'&&current.page==='movie'&&current.id===item.id))route({ loader:false, preserveScroll:true });
    }catch{item.providerStatus='unavailable';item.providerCheckedAt=new Date().toISOString();try{await dbPut(kind==='series'?'series':'movies',item);}catch{}}
  }
  async function maybeLoadTrailer(kind, item) {
    if(officialTrailerForItem(item)||item.trailerLookupStatus==='loading')return;
    const last=dateMs(item.trailerCheckedAt);if(last&&Date.now()-last<1000*60*60*24*30)return;
    item.trailerLookupStatus='loading';
    const active=parseRoute();if((kind==='series'&&active.page==='series'&&active.id===item.id)||(kind==='movie'&&active.page==='movie'&&active.id===item.id))route({ loader:false, preserveScroll:true });
    let trailer=null;
    try{
      if(tmdbIsReady()){
        const id=await resolveTmdbId(kind,item);
        if(id)trailer=await fetchTmdbTrailer(kind,id);
      }
      if(!trailer){
        const data=await publicSourceFetch('/api/trailer',{title:item.title,year:item.year||'',kind});
        trailer=data.trailer||null;
      }
      if(trailer)item.trailer=trailer;
      item.trailerCheckedAt=new Date().toISOString();item.trailerLookupStatus=trailer?'available':'unavailable';
      await dbPut(kind==='series'?'series':'movies',item);await saveSharedCatalog(kind,item,trailer?.source||'public-trailer');
      const current=parseRoute();if((kind==='series'&&current.page==='series'&&current.id===item.id)||(kind==='movie'&&current.page==='movie'&&current.id===item.id))route({ loader:false, preserveScroll:true });
    }catch{item.trailerCheckedAt=new Date().toISOString();item.trailerLookupStatus='unavailable';try{await dbPut(kind==='series'?'series':'movies',item);}catch{}}
  }
  async function maybeLoadCinemaShowtimes(item){
    if(item.cinemaStatus==='loading')return;
    const recent=dateMs(item.cinemaCheckedAt)>Date.now()-1000*60*60*6;
    if(recent)return;
    const cinemas=preferredCinemas().filter(cinema=>cinema.id&&cinema.officialUrl);
    if(!cinemas.length){item.cinemaStatus='unavailable';return;}
    item.cinemaStatus='loading';
    const current=parseRoute();if(current.page==='movie'&&current.id===item.id)renderMovieDetail(item.id);
    try{
      const data=await publicSourceFetch('/api/cinema',{title:item.title,cinemas:cinemas.map(cinema=>cinema.id).join(',')});
      const rows=[];
      for(const result of data.cinemas||[])for(const show of result.showtimes||[])rows.push({...show,cinemaId:result.cinemaId,cinemaName:result.cinemaName,bookingUrl:show.bookingUrl||result.sourceUrl||result.officialUrl,sourceUrl:result.sourceUrl||result.officialUrl});
      item.cinemaShowtimes=rows;item.cinemaCheckedAt=data.checkedAt||new Date().toISOString();item.cinemaStatus=rows.length?'available':'unavailable';
      await dbPut('movies',item);await saveSharedCatalog('movie',item,'official-cinema-sites');
      const routeInfo=parseRoute();if(routeInfo.page==='movie'&&routeInfo.id===item.id)route({ loader:false, preserveScroll:true });
    }catch{item.cinemaShowtimes=[];item.cinemaCheckedAt=new Date().toISOString();item.cinemaStatus='unavailable';try{await dbPut('movies',item);}catch{}const routeInfo=parseRoute();if(routeInfo.page==='movie'&&routeInfo.id===item.id)route({ loader:false, preserveScroll:true });}
  }

  async function fetchProviders(kind,id){try{const data=await tmdbFetch(`/${kind}/${id}/watch/providers`);const it=data.results?.IT||{};const rows=a=>(a||[]).map(x=>({name:x.provider_name,providerId:x.provider_id,priority:x.display_priority}));return{streaming:rows(it.flatrate),rent:rows(it.rent),buy:rows(it.buy),free:rows([...(it.free||[]),...(it.ads||[])]),link:it.link};}catch{return{streaming:[],rent:[],buy:[],free:[]};}}
  async function addFromTMDB(kind,id){
    const type=kind==='movie'?'movie':'series';
    const store=type==='movie'?'movies':'series';
    const item=type==='movie'
      ? {id:profileScoped(`tmdb-movie-${id}`),profileId:state.profileId,mediaType:'movie',tmdbId:Number(id),title:'Film',rating:0,watched:false,favorite:false,state:'watchlist',providerGroups:{streaming:[],rent:[],buy:[]},cast:[],notes:''}
      : {id:profileScoped(`tmdb-tv-${id}`),profileId:state.profileId,mediaType:'tv',tmdbId:Number(id),title:'Serie TV',status:'plan',favorite:false,rating:0,providerGroups:{streaming:[],rent:[],buy:[]},cast:[],seasons:[]};
    const collection=type==='movie'?state.movies:state.series;
    if(collection.some(existing=>Number(existing.tmdbId)===Number(id)))throw new Error('Il titolo è già presente nella libreria.');
    const cached=findSharedCatalogEntry(type,item);
    if(cached&&sharedCatalogIsReusable(type,cached.data||{},true)){
      mergeSharedCatalogData(type,item,cached);
      await dbPut(store,item);
      state.catalogNetworkAvoidedThisSession++;
      return item;
    }
    if(type==='movie'){
      const [d,credits,providers,trailer]=await Promise.all([tmdbFetch(`/movie/${id}`,{language:'it-IT'}),tmdbFetch(`/movie/${id}/credits`,{language:'it-IT'}),fetchProviders('movie',id),fetchTmdbTrailer('movie',id).catch(()=>null)]);
      Object.assign(item,{imdbId:d.imdb_id,title:d.title,originalTitle:d.original_title,year:(d.release_date||'').slice(0,4),releaseDate:d.release_date||null,overview:d.overview,genres:(d.genres||[]).map(g=>g.name),runtime:d.runtime,poster:tmdbPoster(d.poster_path),backdrop:tmdbBackdrop(d.backdrop_path),posterGradient:gradient(d.title),backdropGradient:gradient(d.title+' hero'),providerGroups:providers,cast:(credits.cast||[]).slice(0,18).map(c=>({name:c.name,role:c.character,tmdbId:c.id,photo:tmdbPoster(c.profile_path)})),trailer,trailerCheckedAt:new Date().toISOString(),metadataUpdatedAt:new Date().toISOString()});
    }else{
      const [d,credits,providers,trailer]=await Promise.all([tmdbFetch(`/tv/${id}`,{language:'it-IT'}),tmdbFetch(`/tv/${id}/credits`,{language:'it-IT'}),fetchProviders('tv',id),fetchTmdbTrailer('series',id).catch(()=>null)]);
      Object.assign(item,{title:d.name,originalTitle:d.original_name,year:(d.first_air_date||'').slice(0,4),firstAirDate:d.first_air_date||null,lastAirDate:d.last_air_date||null,overview:d.overview,genres:(d.genres||[]).map(g=>g.name),poster:tmdbPoster(d.poster_path),backdrop:tmdbBackdrop(d.backdrop_path),posterGradient:gradient(d.name),backdropGradient:gradient(d.name+' hero'),providerGroups:providers,cast:(credits.cast||[]).slice(0,18).map(c=>({name:c.name,role:c.character,tmdbId:c.id,photo:tmdbPoster(c.profile_path)})),trailer,trailerCheckedAt:new Date().toISOString(),metadataUpdatedAt:new Date().toISOString(),seasons:(d.seasons||[]).filter(s=>s.season_number>0).map(s=>({number:s.season_number,name:s.name,overview:s.overview,poster:tmdbPoster(s.poster_path),airDate:s.air_date,episodeCount:s.episode_count,episodes:[]}))});
    }
    await dbPut(store,item);
    await saveSharedCatalog(type,item,'tmdb');
    return item;
  }

  async function enrichMovieFlow(m){if(!state.settings.tmdbToken&&!(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl){showToast('TMDB non configurato','I metadati pubblici restano comunque disponibili.','!');return;}openModal('Collega il film a TMDB','<p>Sto cercando il titolo nei metadati italiani…</p>');try{const d=await tmdbFetch('/search/movie',{query:m.title,language:'it-IT',region:'IT',year:m.year||''});const res=(d.results||[]).slice(0,5);$('#modalRoot .modal-body').innerHTML=`<p>Scegli la corrispondenza corretta.</p><div class="search-results">${res.map(x=>`<article class="search-result"><div class="thumb">${x.poster_path?`<img class="poster-img" src="${tmdbPoster(x.poster_path)}" alt="">`:''}</div><div><h3>${esc(x.title)}</h3><p>${esc((x.release_date||'').slice(0,4))} · ${esc(x.overview||'')}</p></div><button class="primary" data-match="${x.id}">Scegli</button></article>`).join('')}</div>`;$$('[data-match]').forEach(b=>b.addEventListener('click',async()=>{const added=await addFromTMDB('movie',Number(b.dataset.match));const old=m;Object.assign(old,added,{id:m.id,profileId:state.profileId,watched:m.watched,favorite:m.favorite,rating:m.rating,watchedAt:m.watchedAt,notes:m.notes,state:m.state});await dbPut('movies',old);await dbDelete('movies',added.id);closeModal();await reloadData();renderMovieDetail(m.id);}));}catch(e){$('#modalRoot .modal-body').innerHTML=`<p class="notice danger">${esc(e.message)}</p>`;}}
  async function enrichSeriesFlow(s){if(!state.settings.tmdbToken&&!(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl){showToast('TMDB non configurato','I metadati pubblici restano comunque disponibili.','!');return;}openModal('Collega la serie a TMDB','<p>Sto cercando la serie nei metadati italiani…</p>');try{const d=await tmdbFetch('/search/tv',{query:s.title,language:'it-IT',first_air_date_year:s.year||''});const res=(d.results||[]).slice(0,5);$('#modalRoot .modal-body').innerHTML=`<p>Scegli la corrispondenza corretta. Gli episodi già visti non verranno persi.</p><div class="search-results">${res.map(x=>`<article class="search-result"><div class="thumb">${x.poster_path?`<img class="poster-img" src="${tmdbPoster(x.poster_path)}" alt="">`:''}</div><div><h3>${esc(x.name)}</h3><p>${esc((x.first_air_date||'').slice(0,4))} · ${esc(x.overview||'')}</p></div><button class="primary" data-match="${x.id}">Scegli</button></article>`).join('')}</div>`;$$('[data-match]').forEach(b=>b.addEventListener('click',async()=>{const added=await addFromTMDB('tv',Number(b.dataset.match));const old=s;const importedSeasons=s.seasons||[];Object.assign(old,added,{id:s.id,profileId:state.profileId,status:s.status,favorite:s.favorite,rating:s.rating,seasons:mergeSeriesSeasons(importedSeasons,added.seasons,s.id)});await dbPut('series',old);await dbDelete('series',added.id);closeModal();await reloadData();renderSeriesDetail(s.id);}));}catch(e){$('#modalRoot .modal-body').innerHTML=`<p class="notice danger">${esc(e.message)}</p>`;}}

  function statsPeriodStart(period) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (period === 'year') return new Date(now.getFullYear(), 0, 1);
    if (period === '12m') { const d = new Date(now.getFullYear(), now.getMonth() - 11, 1); return d; }
    return null;
  }
  function isInStatsPeriod(value, period) {
    const start = statsPeriodStart(period);
    if (!start) return true;
    const ms = dateMs(value);
    return ms > 0 && ms >= start.getTime();
  }
  function monthKey(value) { const d = value ? new Date(value) : null; return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 7) : null; }
  function monthLabel(key) {
    const [year, month] = String(key).split('-').map(Number);
    if (!year || !month) return key;
    return new Intl.DateTimeFormat('it-IT', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1)).replace('.', '');
  }
  function averageRating(items) {
    const ratings = items.map(x => Number(x.rating || 0)).filter(x => x > 0);
    return ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  }
  function ratingDistribution(items) {
    const values = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of items) {
      const rating = Number(item.rating || 0);
      if (!rating) continue;
      const bucket = Math.max(1, Math.min(5, Math.round(rating)));
      values[bucket]++;
    }
    return values;
  }
  function genreDistribution(items) {
    const result = {};
    for (const item of items) for (const genre of item.genres || []) result[genre] = (result[genre] || 0) + 1;
    return result;
  }
  function monthlyDistribution(values) {
    const result = {};
    for (const value of values) { const key = monthKey(value); if (key) result[key] = (result[key] || 0) + 1; }
    return result;
  }
  function calculateStats(period = 'all') {
    const watchedEpisodes = state.progress.filter(p => p.watched && isInStatsPeriod(p.watchedAt, period));
    const watchedMovies = state.movies.filter(m => m.watched && isInStatsPeriod(m.watchedAt, period));
    const watchedSeriesIds = new Set(watchedEpisodes.map(p => p.seriesId));
    const watchedSeries = state.series.filter(s => watchedSeriesIds.has(s.id));
    const episodeMinutes = watchedEpisodes.reduce((sum, p) => sum + Number(p.runtime || state.indexes.episodeByKey?.get(episodeKey(p.seriesId, p.season, p.episode))?.runtime || 50), 0);
    const movieMinutes = watchedMovies.reduce((sum, m) => sum + Number(m.runtime || 100), 0);
    const movieFavorites = state.movies.filter(m => m.favorite).length;
    const seriesFavorites = state.series.filter(s => s.favorite).length;
    const completedSeries = state.series.filter(s => s.status === 'completed' || seriesProgress(s).percent === 100).length;
    const movieWatchlist = state.movies.filter(m => !m.watched || m.state === 'watchlist').length;
    const ratedMovies = watchedMovies.filter(m => Number(m.rating) > 0);
    const ratedSeries = watchedSeries.filter(s => Number(s.rating) > 0);
    const topSeries = watchedSeries.map(s => ({
      title: s.title,
      minutes: watchedEpisodes.filter(p => p.seriesId === s.id).reduce((sum, p) => sum + Number(p.runtime || state.indexes.episodeByKey?.get(episodeKey(p.seriesId, p.season, p.episode))?.runtime || 50), 0)
    })).sort((a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title, 'it')).slice(0, 7);
    const topRatedMovies = ratedMovies.slice().sort((a, b) => Number(b.rating) - Number(a.rating) || dateMs(b.watchedAt) - dateMs(a.watchedAt) || a.title.localeCompare(b.title, 'it')).slice(0, 7);
    return {
      period, watchedEpisodes, watchedMovies, watchedSeries, watchedSeriesIds,
      episodeMinutes, movieMinutes, movieFavorites, seriesFavorites, completedSeries, movieWatchlist,
      ratedMovies, ratedSeries, movieAverage: averageRating(ratedMovies), seriesAverage: averageRating(ratedSeries),
      movieMonthly: monthlyDistribution(watchedMovies.map(x => x.watchedAt)),
      seriesMonthly: monthlyDistribution(watchedEpisodes.map(x => x.watchedAt)),
      movieGenres: genreDistribution(watchedMovies), seriesGenres: genreDistribution(watchedSeries),
      movieRatings: ratingDistribution(ratedMovies), seriesRatings: ratingDistribution(ratedSeries),
      topSeries, topRatedMovies
    };
  }
  function monthlyChartHtml(monthly, emptyText) {
    const months = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
    if (!months.length) return `<div class="chart-empty"><strong>Nessun dato</strong><p>${esc(emptyText)}</p></div>`;
    const max = Math.max(1, ...months.map(([, value]) => value));
    return `<div class="bar-chart">${months.map(([key, value]) => `<div class="bar-col" title="${esc(monthLabel(key))}: ${value}"><div class="bar" style="height:${Math.max(4, value / max * 100)}%"></div><small>${esc(monthLabel(key))}</small></div>`).join('')}</div>`;
  }
  function genreBarsHtml(genres, emptyText) {
    const entries = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 7);
    if (!entries.length) return `<div class="chart-empty"><strong>Generi non disponibili</strong><p>${esc(emptyText)}</p></div>`;
    const max = Math.max(1, ...entries.map(([, value]) => value));
    return `<div class="horizontal-bars">${entries.map(([genre, value]) => `<div class="hbar-row"><span>${esc(genre)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${value / max * 100}%"></div></div><strong>${value}</strong></div>`).join('')}</div>`;
  }
  function ratingBarsHtml(ratings, emptyText) {
    const total = Object.values(ratings).reduce((a, b) => a + b, 0);
    if (!total) return `<div class="chart-empty"><strong>Nessun voto disponibile</strong><p>${esc(emptyText)}</p></div>`;
    const max = Math.max(1, ...Object.values(ratings));
    return `<div class="horizontal-bars rating-bars">${Object.entries(ratings).reverse().map(([rating, value]) => `<div class="hbar-row"><span aria-label="${rating} stelle">${'★'.repeat(Number(rating))}</span><div class="hbar-track"><div class="hbar-fill" style="width:${value / max * 100}%"></div></div><strong>${value}</strong></div>`).join('')}</div>`;
  }
  function topSeriesHtml(items) {
    if (!items.length) return '<div class="chart-empty"><strong>Nessuna serie avviata</strong><p>Segna almeno un episodio come visto.</p></div>';
    const max = Math.max(1, items[0]?.minutes || 1);
    return `<div class="horizontal-bars">${items.map(item => `<div class="hbar-row"><span>${esc(item.title)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${item.minutes / max * 100}%"></div></div><strong>${minutesToText(item.minutes)}</strong></div>`).join('')}</div>`;
  }
  function topMoviesHtml(items) {
    if (!items.length) return '<div class="chart-empty"><strong>Nessun film votato</strong><p>Assegna un voto dalla scheda di dettaglio del film.</p></div>';
    return `<div class="horizontal-bars">${items.map(item => `<div class="hbar-row"><span>${esc(item.title)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${Number(item.rating) / 5 * 100}%"></div></div><strong>★ ${Number(item.rating).toLocaleString('it-IT', { maximumFractionDigits: 1 })}</strong></div>`).join('')}</div>`;
  }
  function statCard(label, value, note = '') { return `<article class="stat-card"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ''}</article>`; }
  function renderStatsOverview(st) {
    return `<div class="stats-grid">${statCard('Film visti', st.watchedMovies.length.toLocaleString('it-IT'))}${statCard('Episodi visti', st.watchedEpisodes.length.toLocaleString('it-IT'))}${statCard('Tempo film', minutesToText(st.movieMinutes))}${statCard('Tempo serie', minutesToText(st.episodeMinutes))}${statCard('Film preferiti', st.movieFavorites.toLocaleString('it-IT'))}${statCard('Serie preferite', st.seriesFavorites.toLocaleString('it-IT'))}</div>
      <div class="chart-grid"><section class="chart-card"><div class="chart-title"><span class="chart-kicker">FILM</span><h3>Film visti per mese</h3></div>${monthlyChartHtml(st.movieMonthly, 'Le date di visione dei film non sono ancora disponibili.')}</section><section class="chart-card"><div class="chart-title"><span class="chart-kicker">SERIE TV</span><h3>Episodi visti per mese</h3></div>${monthlyChartHtml(st.seriesMonthly, 'Le date di visione degli episodi non sono ancora disponibili.')}</section><section class="chart-card"><div class="chart-title"><span class="chart-kicker">FILM</span><h3>Distribuzione dei voti</h3></div>${ratingBarsHtml(st.movieRatings, 'I voti importati da TV Time vengono convertiti nella scala da 1 a 5 stelle.')}</section><section class="chart-card"><div class="chart-title"><span class="chart-kicker">SERIE TV</span><h3>Serie per tempo visto</h3></div>${topSeriesHtml(st.topSeries)}</section></div>`;
  }
  function renderMovieStats(st) {
    return `<div class="stats-grid">${statCard('Film visti', st.watchedMovies.length.toLocaleString('it-IT'))}${statCard('Tempo film', minutesToText(st.movieMinutes))}${statCard('Film da vedere', st.movieWatchlist.toLocaleString('it-IT'))}${statCard('Film preferiti', st.movieFavorites.toLocaleString('it-IT'))}${statCard('Film con voto', st.ratedMovies.length.toLocaleString('it-IT'))}${statCard('Voto medio', st.movieAverage ? `★ ${st.movieAverage.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : '—')}</div>
      <div class="chart-grid"><section class="chart-card"><h3>Film visti per mese</h3>${monthlyChartHtml(st.movieMonthly, 'Non ci sono ancora date di visione per il periodo selezionato.')}</section><section class="chart-card"><h3>Generi dei film visti</h3>${genreBarsHtml(st.movieGenres, 'I generi compariranno man mano che vengono completati i metadati.')}</section><section class="chart-card"><h3>Distribuzione dei voti dei film</h3>${ratingBarsHtml(st.movieRatings, 'I voti storici di TV Time sono inclusi e convertiti in stelle.')}</section><section class="chart-card"><h3>Film con voto più alto</h3>${topMoviesHtml(st.topRatedMovies)}</section></div>`;
  }
  function renderSeriesStats(st) {
    return `<div class="stats-grid">${statCard('Episodi visti', st.watchedEpisodes.length.toLocaleString('it-IT'))}${statCard('Tempo serie', minutesToText(st.episodeMinutes))}${statCard('Serie iniziate', st.watchedSeries.length.toLocaleString('it-IT'))}${statCard('Serie completate', st.completedSeries.toLocaleString('it-IT'))}${statCard('Serie preferite', st.seriesFavorites.toLocaleString('it-IT'))}${statCard('Voto medio serie', st.seriesAverage ? `★ ${st.seriesAverage.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : '—')}</div>
      <div class="chart-grid"><section class="chart-card"><h3>Episodi visti per mese</h3>${monthlyChartHtml(st.seriesMonthly, 'Non ci sono ancora date di visione degli episodi per il periodo selezionato.')}</section><section class="chart-card"><h3>Generi delle serie viste</h3>${genreBarsHtml(st.seriesGenres, 'I generi compariranno man mano che vengono completati i metadati.')}</section><section class="chart-card"><h3>Distribuzione dei voti delle serie</h3>${ratingBarsHtml(st.seriesRatings, 'Puoi assegnare un voto dalla scheda di dettaglio della serie.')}</section><section class="chart-card"><h3>Serie per tempo visto</h3>${topSeriesHtml(st.topSeries)}</section></div>`;
  }
  function renderStats(){
    setPage('Statistiche', 'Il tempo passato nelle tue storie', 'settings');
    const st = calculateStats(state.statsPeriod);
    const periodLabel = state.statsPeriod === 'year' ? 'Anno corrente' : state.statsPeriod === '12m' ? 'Ultimi 12 mesi' : 'Tutto il periodo';
    const body = state.statsView === 'movies' ? renderMovieStats(st) : state.statsView === 'series' ? renderSeriesStats(st) : renderStatsOverview(st);
    setMain(`<div class="section-head stats-head"><div><h2>La tua visione</h2><p>Film e serie hanno statistiche separate. I dati sono calcolati localmente.</p></div><select id="statsPeriod" aria-label="Periodo statistiche"><option value="all" ${state.statsPeriod === 'all' ? 'selected' : ''}>Tutto il periodo</option><option value="year" ${state.statsPeriod === 'year' ? 'selected' : ''}>Anno corrente</option><option value="12m" ${state.statsPeriod === '12m' ? 'selected' : ''}>Ultimi 12 mesi</option></select></div>
      <div class="tabbar stats-tabs" role="tablist" aria-label="Tipo di statistiche"><button class="tab-button ${state.statsView === 'overview' ? 'active' : ''}" data-stats-view="overview">Riepilogo</button><button class="tab-button ${state.statsView === 'movies' ? 'active' : ''}" data-stats-view="movies">Film</button><button class="tab-button ${state.statsView === 'series' ? 'active' : ''}" data-stats-view="series">Serie TV</button></div>
      <p class="stats-period-note">Periodo selezionato: <strong>${esc(periodLabel)}</strong>. Preferiti, watchlist e serie completate descrivono lo stato attuale della libreria.</p>${body}`);
    $('#statsPeriod')?.addEventListener('change', e => { state.statsPeriod = e.target.value; renderStats(); });
    $$('[data-stats-view]').forEach(button => button.addEventListener('click', () => { state.statsView = button.dataset.statsView; renderStats(); }));
  }

  function parseCSV(text) {
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;}else field+=c;}
      else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}
    }
    if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);} if(!rows.length)return[];
    const headers=rows.shift().map(h=>h.trim());return rows.filter(r=>r.some(v=>String(v).trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
  }
  function csvCell(v){const s=v==null?'':String(v);return/[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
  function toCSV(rows,headers){return [headers.join(','),...rows.map(r=>headers.map(h=>csvCell(r[h])).join(','))].join('\r\n');}

  function previewRows(rows,sourceName='file'){
    const movieRows=rows.filter(r=>String(r.media_type||r.type||'').toLowerCase().includes('movie'));
    const episodeRows=rows.filter(r=>String(r.media_type||'').toLowerCase().includes('episode')||r.season||r.episode);
    const other=Math.max(0,rows.length-movieRows.length-episodeRows.length);
    state.importPreview={rows,sourceName,movieRows:movieRows.length,episodeRows:episodeRows.length,other};refreshImportExportView();
  }

  async function importRows(rows, sourceName='import') {
    const report={importedMovies:0,importedEpisodes:0,newSeries:0,duplicates:0,errors:0,logs:[]};
    const seriesByKey=new Map(state.series.map(s=>[slug(s.title),s]));
    const movieByKey=new Map(state.movies.map(m=>[m.imdbId?`imdb:${m.imdbId}`:m.tmdbId?`tmdb:${m.tmdbId}`:`title:${slug(m.title)}:${m.year||''}`,m]));
    const progressByKey=new Map(state.progress.map(p=>[`${p.seriesId}|${p.season}|${p.episode}`,p]));
    const changedSeries=new Map(),changedMovies=new Map(),changedProgress=new Map();
    for(let idx=0;idx<rows.length;idx++){
      const r=rows[idx]||{};const media=String(r.media_type||r.mediaType||r.kind||'').toLowerCase();const title=String(r.title||r.name||'').trim();
      if(!title){report.errors++;if(report.logs.length<150)report.logs.push({level:'Errore',text:`Riga ${idx+2}: titolo mancante`});continue;}
      try{
        const isEpisode=media.includes('episode')||((r.season!==''&&r.season!=null)&&(r.episode!==''&&r.episode!=null));
        const isMovie=media.includes('movie')||(!isEpisode&&String(r.type||'').toLowerCase().includes('movie'));
        if(isMovie){
          const year=Number(r.year)||null,imdb=String(r.imdb_id||r.imdbId||'').trim()||null,tmdb=Number(r.tmdb_id||r.tmdbId)||null;
          const key=imdb?`imdb:${imdb}`:tmdb?`tmdb:${tmdb}`:`title:${slug(title)}:${year||''}`;let m=movieByKey.get(key);
          if(m){report.duplicates++;}else{m={id:profileScoped(`movie-import-${slug(title)}-${year||'na'}-${imdb||tmdb||uid('m')}`),profileId:state.profileId,mediaType:'movie',title,year,imdbId:imdb,tmdbId:tmdb,overview:'Importato dalla cronologia. Arricchisci con TMDB per ottenere descrizione, cast e piattaforme.',genres:[],runtime:null,posterGradient:gradient(title),backdropGradient:gradient(title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[],favorite:String(r.favorite).toLowerCase()==='true',rating:Number(r.rating)||0,watched:true,state:'watched',watchedAt:r.watched_at||r.watchedAt||new Date().toISOString(),notes:r.review||r.notes||''};movieByKey.set(key,m);report.importedMovies++;}
          m.watched=true;m.state='watched';m.watchedAt=r.watched_at||r.watchedAt||m.watchedAt||new Date().toISOString();if(Number(r.rating))m.rating=Number(r.rating);if(r.review)m.notes=r.review;if(String(r.favorite).toLowerCase()==='true')m.favorite=true;changedMovies.set(m.id,m);
        }else if(isEpisode){
          const skey=slug(title);let s=seriesByKey.get(skey);const seasonNo=Number(r.season)||0,episodeNo=Number(r.episode)||0;if(!seasonNo||!episodeNo){report.errors++;continue;}
          if(!s){s={id:profileScoped(`series-import-${skey}`),profileId:state.profileId,mediaType:'tv',title,year:Number(r.year)||null,tmdbId:Number(r.tmdb_id)||null,tvdbId:Number(r.tvdb_id)||null,overview:'Serie importata dalla cronologia. Gli episodi visti sono già conservati; collega TMDB per descrizioni, cast e calendario.',genres:[],status:'watching',favorite:false,rating:0,posterGradient:gradient(title),backdropGradient:gradient(title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[],seasons:[]};seriesByKey.set(skey,s);report.newSeries++;}
          let season=(s.seasons||[]).find(x=>Number(x.number)===seasonNo);if(!season){season={number:seasonNo,name:`Stagione ${seasonNo}`,episodes:[]};s.seasons=s.seasons||[];s.seasons.push(season);}
          let ep=(season.episodes||[]).find(x=>Number(x.episode)===episodeNo);if(!ep){ep={id:`${s.id}:s${seasonNo}:e${episodeNo}`,season:seasonNo,episode:episodeNo,title:r.episode_title||`Episodio ${episodeNo}`,overview:'',runtime:Number(r.runtime)||50,airDate:r.air_date||null,tmdbId:Number(r.episode_tmdb_id)||null};season.episodes=season.episodes||[];season.episodes.push(ep);}
          const pkey=`${s.id}|${seasonNo}|${episodeNo}`;let p=progressByKey.get(pkey);if(p&&p.watched){report.duplicates++;}else{p=p||{id:`${state.profileId}|${s.id}:s${seasonNo}:e${episodeNo}`,profileId:state.profileId,seriesId:s.id,season:seasonNo,episode:episodeNo,title:ep.title,runtime:ep.runtime};p.watched=true;p.watchedAt=r.watched_at||r.watchedAt||new Date().toISOString();if(Number(r.rating))p.rating=Number(r.rating);progressByKey.set(pkey,p);changedProgress.set(p.id,p);report.importedEpisodes++;}
          changedSeries.set(s.id,s);
        }else{report.errors++;if(report.logs.length<150)report.logs.push({level:'Ignorata',text:`${title}: tipo non riconosciuto`});}
      }catch(e){report.errors++;if(report.logs.length<150)report.logs.push({level:'Errore',text:`${title}: ${e.message}`});}
    }
    if(changedSeries.size)await dbBulkPut('series',[...changedSeries.values()]);if(changedMovies.size)await dbBulkPut('movies',[...changedMovies.values()]);if(changedProgress.size)await dbBulkPut('progress',[...changedProgress.values()]);
    await dbPut('imports',{id:`${state.profileId}|${Date.now()}`,profileId:state.profileId,sourceName,date:new Date().toISOString(),report});await reloadData();return report;
  }

  async function inflateZipBytes(data){
    // Pako è incluso nel pacchetto proprio per i browser/Chromebook che non
    // supportano DecompressionStream('deflate-raw') in modo affidabile.
    if(globalThis.pako?.inflateRaw){
      try{return new Uint8Array(globalThis.pako.inflateRaw(data));}catch(e){throw new Error(`Impossibile decomprimere un file dello ZIP: ${e.message}`);}
    }
    if(typeof DecompressionStream!=='undefined'){
      try{const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return new Uint8Array(await new Response(stream).arrayBuffer());}
      catch(e){throw new Error('Il browser non riesce a decomprimere questo ZIP. Usa la nuova versione completa di Watchverse, che include il motore ZIP compatibile.');}
    }
    throw new Error('Il browser non supporta la decompressione ZIP. Usa la nuova versione completa di Watchverse.');
  }
  async function readZipEntries(file,onProgress=null){
    const buf=await file.arrayBuffer(),view=new DataView(buf);let eocd=-1;for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-65557);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw new Error('Archivio ZIP non valido o non supportato.');const entries=view.getUint16(eocd+10,true),centralOffset=view.getUint32(eocd+16,true);let p=centralOffset;const out=[];
    for(let n=0;n<entries;n++){
      if(view.getUint32(p,true)!==0x02014b50)throw new Error('Struttura ZIP non riconosciuta.');const flags=view.getUint16(p+8,true),method=view.getUint16(p+10,true),compressed=view.getUint32(p+20,true),uncompressed=view.getUint32(p+24,true),nameLen=view.getUint16(p+28,true),extraLen=view.getUint16(p+30,true),commentLen=view.getUint16(p+32,true),localOffset=view.getUint32(p+42,true);const name=new TextDecoder((flags&0x800)?'utf-8':'utf-8').decode(new Uint8Array(buf,p+46,nameLen));
      if(flags&0x1)throw new Error('Lo ZIP è protetto da password e non può essere importato.');
      if(view.getUint32(localOffset,true)!==0x04034b50)throw new Error('Header ZIP locale non valido.');const localNameLen=view.getUint16(localOffset+26,true),localExtra=view.getUint16(localOffset+28,true),dataStart=localOffset+30+localNameLen+localExtra;const data=new Uint8Array(buf,dataStart,compressed);let bytes;
      if(method===0)bytes=new Uint8Array(data);else if(method===8)bytes=await inflateZipBytes(data);else{p+=46+nameLen+extraLen+commentLen;if(onProgress)onProgress(n+1,entries,name,true);continue;}
      out.push({name,size:uncompressed,bytes,text:()=>new TextDecoder().decode(bytes)});p+=46+nameLen+extraLen+commentLen;
      if(onProgress)onProgress(n+1,entries,name,false);
      if(n%4===0)await new Promise(resolve=>setTimeout(resolve,0));
    }return out;
  }

  const crcTable=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&0xff]^(c>>>8);return(c^0xffffffff)>>>0;}
  function u16(n){return new Uint8Array([n&255,(n>>>8)&255]);}function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);}
  function concatBytes(parts){const len=parts.reduce((a,p)=>a+p.length,0),out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}return out;}
  function makeZip(files){
    const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;
    for(const f of files){const name=enc.encode(f.name),data=typeof f.content==='string'?enc.encode(f.content):new Uint8Array(f.content),crc=crc32(data);const local=concatBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);locals.push(local);const central=concatBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);centrals.push(central);offset+=local.length;}
    const centralBlob=concatBytes(centrals),end=concatBytes([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralBlob.length),u32(offset),u16(0)]);return new Blob([...locals,centralBlob,end],{type:'application/zip'});
  }
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}

  function exportRows(){
    const movieRows=state.movies.map(m=>({media_type:'movie',title:m.title,year:m.year||'',season:'',episode:'',watched_at:m.watchedAt||'',rating:m.rating||'',review:m.notes||'',imdb_id:m.imdbId||'',tmdb_id:m.tmdbId||'',tvdb_id:m.tvdbId||'',favorite:!!m.favorite,state:m.state|| (m.watched?'watched':'watchlist')}));
    const episodeRows=state.progress.filter(p=>p.watched).map(p=>{const s=state.series.find(x=>x.id===p.seriesId);const ep=s?.seasons?.find(x=>Number(x.number)===Number(p.season))?.episodes?.find(x=>Number(x.episode)===Number(p.episode));return{media_type:'episode',title:s?.title||p.seriesId,year:s?.year||'',season:p.season,episode:p.episode,watched_at:p.watchedAt||'',rating:p.rating||'',review:'',imdb_id:ep?.imdbId||'',tmdb_id:ep?.tmdbId||'',tvdb_id:ep?.tvdbId||'',favorite:!!s?.favorite,state:s?.status||'watching'};});return[...movieRows,...episodeRows];
  }
  function traktReady(){
    const movies=state.movies.filter(m=>m.watched&&(m.tmdbId||m.imdbId)).map(m=>({watched_at:m.watchedAt||new Date().toISOString(),ids:{...(m.tmdbId?{tmdb:m.tmdbId}:{}),...(m.imdbId?{imdb:m.imdbId}:{})}}));
    const episodes=[],unmatched_episodes=[];for(const p of state.progress.filter(p=>p.watched)){const s=state.series.find(x=>x.id===p.seriesId);const ep=s?.seasons?.find(x=>Number(x.number)===Number(p.season))?.episodes?.find(x=>Number(x.episode)===Number(p.episode));if(ep?.tmdbId||ep?.tvdbId||ep?.imdbId)episodes.push({watched_at:p.watchedAt||new Date().toISOString(),ids:{...(ep.tmdbId?{tmdb:ep.tmdbId}:{}),...(ep.tvdbId?{tvdb:ep.tvdbId}:{}),...(ep.imdbId?{imdb:ep.imdbId}:{})}});else unmatched_episodes.push({show:s?.title||p.seriesId,season:p.season,episode:p.episode,watched_at:p.watchedAt});}
    return{generated_at:new Date().toISOString(),movies,episodes,unmatched_episodes,note:'Le righe senza ID sono conservate in unmatched_episodes e richiedono una riconciliazione prima di una sincronizzazione API.'};
  }
  function fullBackup(){return{app:'Watchverse',version:APP_VERSION,exportedAt:new Date().toISOString(),profile:currentProfile(),settings:{...state.settings,tmdbToken:''},series:state.series,movies:state.movies,progress:state.progress};}

  function formatBytes(bytes){
    const n=Number(bytes||0);if(n<1024)return`${n} B`;if(n<1024*1024)return`${(n/1024).toFixed(1)} KB`;return`${(n/1024/1024).toFixed(1)} MB`;
  }
  function importCountCard(label,value,detail=''){
    return `<article class="mini-card import-count-card"><span>${esc(label)}</span><strong>${Number(value||0).toLocaleString('it-IT')}</strong>${detail?`<small>${esc(detail)}</small>`:''}</article>`;
  }
  function gdprSummaryHtml(g){
    const c=g.counts||{};
    return `<div class="import-summary import-summary-detailed">
      ${importCountCard('Serie in libreria',c.series,'incluse serie seguite')}
      ${importCountCard('Serie da iniziare',c.watchlistSeries,'senza episodi visti')}
      ${importCountCard('Episodi visti',c.episodes,'cronologia episodi')}
      ${importCountCard('Film in libreria',c.movies,'visti e da vedere')}
      ${importCountCard('Film visti',c.watchedMovies,'cronologia film')}
      ${importCountCard('Film da vedere',c.watchlistMovies,'watchlist')}
      ${importCountCard('Serie preferite',c.favoriteSeries,'preferiti')}
      ${importCountCard('Film preferiti',c.favoriteMovies,'preferiti')}
      ${importCountCard('Voti storici',c.legacyMovieVotes,'convertiti nella scala 1–5 stelle')}
    </div>`;
  }
  function operationProgressHtml(status='Preparazione…'){
    return `<div class="operation-progress" aria-live="polite">
      <div class="operation-status-row"><strong id="operationStatus">${esc(status)}</strong><span id="operationPercent">0%</span></div>
      <div class="import-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="operationBar" style="width:0%"></span></div>
      <p id="operationDetail" class="operation-detail">Attendi senza chiudere questa scheda.</p>
    </div>`;
  }
  function setOperationProgress(pct,status,detail=''){
    const value=Math.max(0,Math.min(100,Math.round(Number(pct)||0))),bar=$('#operationBar'),percent=$('#operationPercent'),label=$('#operationStatus'),detailEl=$('#operationDetail'),track=bar?.parentElement;
    if(bar)bar.style.width=`${value}%`;if(percent)percent.textContent=`${value}%`;if(label)label.textContent=status||'Elaborazione…';if(detailEl&&detail)detailEl.textContent=detail;if(track)track.setAttribute('aria-valuenow',String(value));
  }
  function showImportFailure(error,stage='Importazione'){
    const message=error?.message||String(error||'Errore sconosciuto.');
    openModal(`${stage} non riuscita`,`<div class="import-error-panel"><div class="import-error-icon" aria-hidden="true">!</div><div><h3>L’operazione non è stata completata</h3><p>${esc(message)}</p><p class="notice">Il file originale non è stato modificato. Se l’errore è avvenuto durante il salvataggio, potrebbero esserci dati parziali: ripeti l’importazione lasciando selezionato “Sostituisci i dati attuali”.</p></div></div>`,`<button class="ghost" id="importErrorClose">Torna alla sezione</button><button class="primary" id="importErrorRetry">Scegli un altro file</button>`);
    $('#importErrorClose')?.addEventListener('click',()=>{closeModal();if(state.profileSelected)renderImportExport();});
    $('#importErrorRetry')?.addEventListener('click',()=>{closeModal();if(state.profileSelected)renderImportExport();setTimeout(()=>$('#importInput').click(),0);});
    showToast(`${stage} non riuscita`,message,'!',0,{kind:'error'});
  }

  function importExportMarkup(){
    const p=state.importPreview,g=state.gdprPreview,profile=currentProfile(),resume=readGdprResume(g);
    const total=g?.counts?.importableTotal||0;
    return `<section class="content-card section"><div class="section-head"><div><h2>Importa dati</h2><p>CSV, JSON o ZIP. I file sensibili dello ZIP GDPR vengono esclusi automaticamente.</p></div></div>
      <div class="dropzone" id="dropzone"><div style="font-size:42px">⇧</div><h3>Trascina qui un file</h3><p>Puoi caricare direttamente lo ZIP GDPR di TV Time senza estrarlo.</p><button class="primary" id="chooseImport">Scegli file</button></div>
      ${g?`<div class="gdpr-banner" id="gdprPreviewCard"><div class="gdpr-preview-head"><div><span class="success-kicker">✓ ANALISI COMPLETATA</span><h3>Esportazione TV Time GDPR riconosciuta</h3><p><strong>${esc(g.sourceFileName||'Archivio GDPR')}</strong>${g.sourceFileSize?` · ${formatBytes(g.sourceFileSize)}`:''}<br>Destinazione: <strong>${esc(profile.name)}</strong>.</p></div><div class="import-total"><span>Elementi pronti</span><strong>${Number(total).toLocaleString('it-IT')}</strong></div></div>
        ${gdprSummaryHtml(g)}
        ${resume?.status==='running'?'<p class="notice success-notice">È stata rilevata un’importazione interrotta dello stesso file. Il prossimo avvio manterrà i dati già salvati e importerà solo gli elementi mancanti.</p>':''}
        <label class="auth-check import-replace-option"><input id="replaceProfileData" type="checkbox" checked> <span><strong>Sostituisci i dati attuali del profilo</strong><small>Consigliato per il primo import: elimina i dati già presenti e le vecchie importazioni del solo profilo ${esc(profile.name)}.</small></span></label>
        <details class="import-details"><summary>Dettagli tecnici e privacy</summary><p>${g.recognizedFiles.length} file utili riconosciuti; ${g.unrecognized.length} file tecnici ignorati.</p><p><strong>File privati esclusi automaticamente (${g.ignoredSensitive.length}):</strong></p><ul class="privacy-file-list">${g.ignoredSensitive.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details>
        <p class="notice warning">I codici di voto storici di TV Time vengono conservati come dato originale, ma non trasformati automaticamente in stelle perché lo ZIP non ne documenta la scala.</p>
        <div class="modal-actions import-preview-actions"><button class="ghost" id="cancelGdpr">Annulla</button><button class="primary" id="confirmGdprImport">Importa ${Number(total).toLocaleString('it-IT')} elementi in ${esc(profile.name)}</button></div></div>`:''}
      ${p?`<div class="gdpr-banner" id="genericPreviewCard"><span class="success-kicker">✓ ANALISI COMPLETATA</span><h3>File pronto per l’importazione</h3><div class="import-summary"><article class="mini-card"><span>Righe</span><strong>${p.rows.length.toLocaleString('it-IT')}</strong></article><article class="mini-card"><span>Film</span><strong>${p.movieRows.toLocaleString('it-IT')}</strong></article><article class="mini-card"><span>Episodi</span><strong>${p.episodeRows.toLocaleString('it-IT')}</strong></article><article class="mini-card"><span>Altro</span><strong>${p.other}</strong></article></div><div class="notice">File: <strong>${esc(p.sourceName)}</strong>. Verranno mantenute date di visione, rating, recensioni e identificativi disponibili.</div><div class="modal-actions"><button class="ghost" id="cancelPreview">Annulla</button><button class="primary" id="confirmImport">Importa ora</button></div></div>`:''}</section>
      <section class="content-card section"><div class="section-head"><div><h2>Esporta e backup</h2><p>Formati leggibili e trasferibili, senza paywall.</p></div></div>
      <div class="settings-grid"><article class="settings-card"><h3>Backup completo ZIP</h3><p>JSON completo + CSV della cronologia del profilo ${esc(profile.name)}.</p><button class="primary" data-export="backup">Esporta ZIP</button></article><article class="settings-card"><h3>CSV interoperabile</h3><p>Film, serie, episodi, date, rating e ID.</p><button class="secondary" data-export="csv">Esporta CSV</button></article><article class="settings-card"><h3>JSON pronto per Trakt</h3><p>Film ed episodi con ID; gli episodi non associati restano separati.</p><button class="secondary" data-export="trakt">Esporta JSON</button></article><article class="settings-card"><h3>Solo preferiti</h3><p>Film e serie preferiti del profilo attivo.</p><button class="secondary" data-export="favorites">Esporta preferiti</button></article></div></section>
      <section class="content-card"><h2>Ripristina backup Watchverse</h2><p class="notice warning">Il ripristino aggiunge o aggiorna i dati del profilo corrente. Fai prima un backup.</p><button class="secondary" id="restoreBackup">Scegli backup JSON o ZIP</button></section>`;
  }
  function refreshImportExportView(){
    state.profileSettingsTab='import';
    renderSettings();
  }
  function bindImportExportEvents(){
    const p=state.importPreview,g=state.gdprPreview;
    const resume=readGdprResume(g);if(resume?.status==='running'&&$('#replaceProfileData')){$('#replaceProfileData').checked=false;$('#replaceProfileData').disabled=true;}
    const dz=$('#dropzone');$('#chooseImport').addEventListener('click',()=>$('#importInput').click());
    ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag');}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag');}));dz.addEventListener('drop',e=>handleImportFile(e.dataTransfer.files[0]));
    if($('#cancelGdpr'))$('#cancelGdpr').addEventListener('click',()=>{state.gdprPreview=null;refreshImportExportView();});
    if($('#confirmGdprImport'))$('#confirmGdprImport').addEventListener('click',e=>{e.currentTarget.disabled=true;importGdprPlan(g,$('#replaceProfileData').checked);});
    if($('#cancelPreview'))$('#cancelPreview').addEventListener('click',()=>{state.importPreview=null;refreshImportExportView();});
    if($('#confirmImport'))$('#confirmImport').addEventListener('click',async()=>{const b=$('#confirmImport');b.disabled=true;b.textContent='Importazione…';try{const report=await importRows(p.rows,p.sourceName);state.importPreview=null;showImportReport(report);}catch(e){showImportFailure(e);}});
    $$('[data-export]').forEach(b=>b.addEventListener('click',()=>runExport(b.dataset.export)));$('#restoreBackup').addEventListener('click',()=>$('#backupInput').click());
  }
  function renderImportExport(){ state.profileSettingsTab='import'; renderSettings(); }

  async function handleImportFile(file){
    if(!file)return;
    try{
      const name=file.name.toLowerCase();
      if(name.endsWith('.csv')){state.gdprPreview=null;previewRows(parseCSV(await file.text()),file.name);showToast('Analisi completata',`${file.name} è pronto per l’importazione.`,'✓',7000);return;}
      if(name.endsWith('.json')){const data=JSON.parse(await file.text());if(['Watchverse','Vistoria'].includes(data.app)&&data.series)await restoreBackupData(data);else{state.gdprPreview=null;previewRows(Array.isArray(data)?data:(data.rows||data.history||[]),file.name);showToast('Analisi completata',`${file.name} è pronto per l’importazione.`,'✓',7000);}return;}
      if(!name.endsWith('.zip'))throw new Error('Formato non supportato. Seleziona un file ZIP, CSV o JSON.');
      openModal('Analisi archivio ZIP',operationProgressHtml('Lettura del file…'),'',{dismissible:false,busy:true});
      setOperationProgress(2,'Lettura del file…',`${file.name} · ${formatBytes(file.size)}`);
      const entries=await readZipEntries(file,(done,total,entryName,skipped)=>{
        const pct=5+(done/Math.max(1,total))*45;
        setOperationProgress(pct,`Estrazione dei file: ${done} di ${total}`,skipped?`Formato ignorato: ${entryName}`:`Analisi: ${entryName}`);
      });
      setOperationProgress(52,'Classificazione dei file…',`${entries.length} file leggibili trovati.`);
      await new Promise(resolve=>setTimeout(resolve,30));
      const names=entries.map(e=>String(e.name).split('/').pop().toLowerCase());
      const isTvTimeGdpr=names.includes('tracking-prod-records-v2.csv')&&names.includes('tracking-prod-records.csv');
      if(isTvTimeGdpr){
        const builder=WatchverseGDPR.buildPlanAsync||((items,onProgress)=>Promise.resolve(WatchverseGDPR.buildPlan(items)));
        const plan=await builder(entries,(pct,text)=>setOperationProgress(52+pct*.46,text,'Serie, episodi, film, watchlist, preferiti e voti.'));
        plan.sourceFileName=file.name;plan.sourceFileSize=file.size;plan.analyzedAt=new Date().toISOString();
        setOperationProgress(100,'Analisi completata.',`${Number(plan.counts.importableTotal||0).toLocaleString('it-IT')} elementi pronti per l’importazione.`);
        await new Promise(resolve=>setTimeout(resolve,250));
        closeModal();state.importPreview=null;state.gdprPreview=plan;refreshImportExportView();
        requestAnimationFrame(()=>$('#gdprPreviewCard')?.scrollIntoView({behavior:'smooth',block:'start'}));
        showToast('Archivio GDPR analizzato',`${plan.counts.series.toLocaleString('it-IT')} serie, ${plan.counts.episodes.toLocaleString('it-IT')} episodi e ${plan.counts.movies.toLocaleString('it-IT')} film pronti.`,'✓',9000,{kind:'success'});return;
      }
      const backupEntry=entries.find(e=>e.name.endsWith('backup.json'));
      if(backupEntry){setOperationProgress(100,'Backup riconosciuto.','Ripristino in corso…');await restoreBackupData(JSON.parse(backupEntry.text()));closeModal();return;}
      const recognized=entries.filter(e=>/\.(csv|json)$/i.test(e.name));closeModal();if(!recognized.length)throw new Error('Lo ZIP non contiene file CSV o JSON riconoscibili.');
      openModal('File trovati nello ZIP',`<p>Scegli quale file analizzare.</p><div class="search-results">${recognized.map((e,i)=>`<article class="search-result"><div class="thumb" style="display:grid;place-items:center">${e.name.endsWith('.json')?'{}':'CSV'}</div><div><h3>${esc(e.name)}</h3><p>${e.size.toLocaleString('it-IT')} byte</p></div><button class="primary" data-zip-entry="${i}">Analizza</button></article>`).join('')}</div>`);
      $$('[data-zip-entry]').forEach(b=>b.addEventListener('click',()=>{const e=recognized[Number(b.dataset.zipEntry)],text=e.text();closeModal();try{if(e.name.toLowerCase().endsWith('.csv'))previewRows(parseCSV(text),`${file.name} / ${e.name}`);else{const d=JSON.parse(text);if(['Watchverse','Vistoria'].includes(d.app)&&d.series)restoreBackupData(d);else previewRows(Array.isArray(d)?d:(d.rows||d.history||[]),`${file.name} / ${e.name}`);}}catch(err){showImportFailure(err,'Analisi file');}}));
    }catch(e){showImportFailure(e,'Analisi archivio');}
  }
  function gdprResumeKey(plan){return `watchverse.gdpr.resume.${state.profileId}.${String(plan?.sourceFileName||'').toLowerCase()}.${Number(plan?.sourceFileSize||0)}`;}
  function readGdprResume(plan){try{return JSON.parse(localStorage.getItem(gdprResumeKey(plan))||'null');}catch{return null;}}
  function writeGdprResume(plan,patch={}){try{const key=gdprResumeKey(plan);const current=readGdprResume(plan)||{};localStorage.setItem(key,JSON.stringify({...current,...patch,key,status:'running',updatedAt:new Date().toISOString()}));}catch{}}
  function clearGdprResume(plan){try{localStorage.removeItem(gdprResumeKey(plan));}catch{}}
  async function importGdprPlan(plan,replace=true){
    if(!plan)return;const profileId=state.profileId;const resume=readGdprResume(plan);const resuming=resume?.status==='running'&&resume.key===gdprResumeKey(plan);if(resuming)replace=false;
    openModal('Importazione TV Time',operationProgressHtml('Preparazione della libreria…')+`<div class="import-live-summary"><span>Profilo</span><strong>${esc(currentProfile()?.name||'')}</strong><span>Elementi previsti</span><strong>${Number(plan.counts?.importableTotal||0).toLocaleString('it-IT')}</strong></div>`,'',{dismissible:false,busy:true});
    try{
      setOperationProgress(2,'Preparazione della libreria…','Controllo dei dati e creazione degli identificativi.');await new Promise(resolve=>setTimeout(resolve,20));
      if(replace){setOperationProgress(5,'Pulizia dei dati precedenti…','Vengono rimossi solo i dati del profilo corrente.');for(const store of ['series','movies','progress','imports'])await dbClearProfile(store);}
      writeGdprResume(plan,{phase:'prepare',resuming});
      const existingSeries=replace?[]:(await dbGetAll('series')).filter(item=>item.profileId===profileId),existingMovies=replace?[]:(await dbGetAll('movies')).filter(item=>item.profileId===profileId),existingProgress=replace?[]:(await dbGetAll('progress')).filter(item=>item.profileId===profileId);
      const existingSeriesIds=new Set(existingSeries.map(item=>item.id)),existingMovieIds=new Set(existingMovies.map(item=>item.id)),existingProgressKeys=new Set(existingProgress.map(item=>`${item.seriesId}|${item.season}|${item.episode}`));
      const sourceToId=new Map();
      const allSeries=plan.series.map(src=>{const base=src.tvdbId?`series-tvtime-tvdb-${src.tvdbId}`:`series-tvtime-${slug(src.title)}`;const id=profileScoped(base,profileId);sourceToId.set(src.sourceKey,id);const normalizedStatus=src.status==='watchlist'?'plan':src.status;return{...src,status:normalizedStatus,id,profileId,posterGradient:gradient(src.title),backdropGradient:gradient(src.title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[],seasons:(src.seasons||[]).map(season=>({...season,episodes:(season.episodes||[]).map(ep=>({...ep,id:`${id}:s${season.number}:e${ep.episode}`}))}))};});
      const series=allSeries.filter(item=>!existingSeriesIds.has(item.id));
      const allMovies=plan.movies.map(src=>({...src,id:profileScoped(`movie-tvtime-${src.sourceUuid||slug(src.title)}`,profileId),profileId,posterGradient:gradient(src.title),backdropGradient:gradient(src.title+' hero'),providerGroups:{streaming:[],rent:[],buy:[]},cast:[]}));
      const movies=allMovies.filter(item=>!existingMovieIds.has(item.id));
      const allProgress=plan.progress.map(src=>{const seriesId=sourceToId.get(src.sourceSeriesKey);return{id:`${profileId}|${String(seriesId).split('|').pop()}:s${src.season}:e${src.episode}`,profileId,seriesId,season:src.season,episode:src.episode,title:src.title,runtime:src.runtime,watched:true,watchedAt:src.watchedAt,tvdbId:src.tvdbId,rewatchCount:src.rewatchCount,source:src.source};}).filter(x=>x.seriesId);
      const progress=allProgress.filter(item=>!existingProgressKeys.has(`${item.seriesId}|${item.season}|${item.episode}`));
      writeGdprResume(plan,{phase:'series',seriesDone:0,moviesDone:0,progressDone:0});
      setOperationProgress(10,`Salvataggio di ${series.length.toLocaleString('it-IT')} serie…`,'Inizio importazione serie.');await dbBulkPutBatched('series',series,100,(d,t)=>{writeGdprResume(plan,{phase:'series',seriesDone:d,seriesTotal:t});setOperationProgress(10+d/Math.max(1,t)*20,`Serie: ${d.toLocaleString('it-IT')} di ${t.toLocaleString('it-IT')}`,`${Math.round(d/Math.max(1,t)*100)}% delle serie salvato.`);});
      setOperationProgress(31,`Salvataggio di ${movies.length.toLocaleString('it-IT')} film…`,'Inizio importazione film e watchlist.');await dbBulkPutBatched('movies',movies,250,(d,t)=>{writeGdprResume(plan,{phase:'movies',moviesDone:d,moviesTotal:t});setOperationProgress(31+d/Math.max(1,t)*20,`Film: ${d.toLocaleString('it-IT')} di ${t.toLocaleString('it-IT')}`,`${Math.round(d/Math.max(1,t)*100)}% dei film salvato.`);});
      setOperationProgress(52,`Salvataggio di ${progress.length.toLocaleString('it-IT')} episodi…`,'Questa è la fase più lunga.');await dbBulkPutBatched('progress',progress,500,(d,t)=>{writeGdprResume(plan,{phase:'progress',progressDone:d,progressTotal:t});setOperationProgress(52+d/Math.max(1,t)*43,`Episodi: ${d.toLocaleString('it-IT')} di ${t.toLocaleString('it-IT')}`,`${Math.round(d/Math.max(1,t)*100)}% della cronologia episodi salvato.`);});
      setOperationProgress(96,'Creazione del report finale…','Controllo dei conteggi importati.');
      const report={importedMovies:movies.length,importedEpisodes:progress.length,newSeries:series.length,duplicates:0,errors:0,counts:plan.counts,logs:[{level:'Privacy',text:`Esclusi automaticamente ${plan.ignoredSensitive.length} file sensibili.`},{level:'Watchlist',text:`Importati ${plan.counts.watchlistMovies} film da vedere e ${plan.counts.watchlistSeries||0} serie da iniziare.`},{level:'Preferiti',text:`Importati ${plan.counts.favoriteSeries} serie e ${plan.counts.favoriteMovies} film preferiti.`},{level:'Voti',text:`Convertiti ${plan.counts.legacyMovieVotes} voti TV Time nella scala da 1 a 5 stelle.`}]};
      await dbPut('imports',{id:`${profileId}|gdpr-${Date.now()}`,profileId,sourceName:plan.sourceFileName||'TV Time GDPR ZIP',date:new Date().toISOString(),report,counts:plan.counts});
      state.settings.demoSeeded=false;state.settings.seriesFilter='unwatched';state.settings.movieFilter='watched';state.settings.seriesSort='latestEpisode';state.settings.movieSort='recent';saveSettings();
      state.seriesFilter='unwatched';state.movieFilter='watched';state.seriesSort='latestEpisode';state.movieSort='recent';state.metadataAutoBudget=36;
      state.gdprPreview=null;await reloadData();state.metadataBackgroundStarted=false;idle(scheduleBackgroundMetadataSync);setOperationProgress(100,'Importazione completata.','La libreria è pronta.');clearGdprResume(plan);await new Promise(resolve=>setTimeout(resolve,250));
      queuePublicMetadata('series',sortSeriesItems(state.series,'latestEpisode').slice(0,8),{silent:true});queuePublicMetadata('movie',sortMovieItems(state.movies.filter(m=>m.watched),'recent').slice(0,8),{silent:true});
      showImportReport(report);showToast('Importazione completata',`${series.length.toLocaleString('it-IT')} serie, ${movies.length.toLocaleString('it-IT')} film e ${progress.length.toLocaleString('it-IT')} episodi salvati.`,'✓',0,{kind:'success'});
    }catch(e){showImportFailure(e,'Importazione');}
  }

  function showImportReport(r){
    const c=r.counts||{};
    openModal('Importazione completata',`<div class="import-success-panel"><div class="import-success-icon" aria-hidden="true">✓</div><div><h3>La libreria è stata aggiornata</h3><p>Tutti i dati riconosciuti sono stati salvati nel profilo corrente.</p></div></div><div class="import-summary import-summary-detailed">${importCountCard('Serie importate',r.newSeries)}${importCountCard('Episodi visti',r.importedEpisodes)}${importCountCard('Film importati',r.importedMovies)}${importCountCard('Film da vedere',c.watchlistMovies||0)}${importCountCard('Preferiti',Number(c.favoriteSeries||0)+Number(c.favoriteMovies||0))}${importCountCard('Errori',r.errors||0)}</div>${r.errors?`<p class="notice warning">${r.errors} elementi richiedono attenzione.</p>`:'<p class="notice success-notice">Importazione terminata senza errori.</p>'}${r.logs?.length?`<div class="log-list">${r.logs.map(l=>`<div class="log-row"><span class="log-level">${esc(l.level)}</span><span>${esc(l.text)}</span></div>`).join('')}</div>`:''}`,`<button class="ghost" id="reportStay">Resta qui</button><button class="primary" id="reportClose">Apri libreria</button>`);
    $('#reportStay')?.addEventListener('click',()=>{closeModal();refreshImportExportView();});
    $('#reportClose')?.addEventListener('click',()=>{closeModal();location.hash='#/series';});
  }
  function runExport(type){const stamp=todayIso();if(type==='csv'){const headers=['media_type','title','year','season','episode','watched_at','rating','review','imdb_id','tmdb_id','tvdb_id','favorite','state'];downloadBlob(new Blob([toCSV(exportRows(),headers)],{type:'text/csv;charset=utf-8'}),`watchverse-cronologia-${stamp}.csv`);}else if(type==='trakt')downloadBlob(new Blob([JSON.stringify(traktReady(),null,2)],{type:'application/json'}),`watchverse-trakt-${stamp}.json`);else if(type==='favorites'){const d={series:state.series.filter(x=>x.favorite),movies:state.movies.filter(x=>x.favorite)};downloadBlob(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),`watchverse-preferiti-${stamp}.json`);}else{const backup=JSON.stringify(fullBackup(),null,2),headers=['media_type','title','year','season','episode','watched_at','rating','review','imdb_id','tmdb_id','tvdb_id','favorite','state'],csv=toCSV(exportRows(),headers),readme=`Backup Watchverse ${APP_VERSION}\nCreato: ${new Date().toLocaleString('it-IT')}\nContiene backup.json e cronologia.csv.`;downloadBlob(makeZip([{name:'backup.json',content:backup},{name:'cronologia.csv',content:csv},{name:'LEGGIMI.txt',content:readme}]),`watchverse-backup-${stamp}.zip`);}showToast('Esportazione pronta','Il file è stato salvato nei download.','⇩');}
  async function restoreBackupData(data){
    if(!data||!Array.isArray(data.series)||!Array.isArray(data.movies))throw new Error('Backup Watchverse non valido.');
    // Al primo ripristino elimina solo i dati dimostrativi, mai una libreria reale.
    if(state.settings.demoSeeded){
      for(const store of ['series','movies','progress','imports'])await dbClearSpecificProfile(store,state.profileId);
      state.settings.demoSeeded=false;saveSettings();
    }
    const idMap=new Map();
    const series=data.series.map(x=>{const base=String(x.id||uid('series')).split('|').pop();const id=profileScoped(base);idMap.set(x.id,id);return{...x,id,profileId:state.profileId,seasons:(x.seasons||[]).map(season=>({...season,episodes:(season.episodes||[]).map(ep=>({...ep,id:`${id}:s${season.number}:e${ep.episode}`}))}))};});
    const movies=data.movies.map(x=>({...x,id:profileScoped(String(x.id||uid('movie')).split('|').pop()),profileId:state.profileId}));
    const progress=(data.progress||[]).map(x=>{const seriesId=idMap.get(x.seriesId)||profileScoped(String(x.seriesId||'series').split('|').pop());return{...x,profileId:state.profileId,seriesId,id:`${state.profileId}|${String(seriesId).split('|').pop()}:s${x.season}:e${x.episode}`};});
    await dbBulkPutBatched('series',series);await dbBulkPutBatched('movies',movies);await dbBulkPutBatched('progress',progress);await reloadData();state.metadataBackgroundStarted=false;idle(scheduleBackgroundMetadataSync);showToast('Backup ripristinato',`${series.length} serie e ${movies.length} film.`);location.hash='#/home';
  }


  function randomSaltB64(size=16){const b=crypto.getRandomValues(new Uint8Array(size));return btoa(String.fromCharCode(...b));}
  async function hashPin(pin,saltB64){
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(pin)),'PBKDF2',false,['deriveBits']);
    const salt=Uint8Array.from(atob(saltB64),c=>c.charCodeAt(0));
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:60000,hash:'SHA-256'},key,256);
    return btoa(String.fromCharCode(...new Uint8Array(bits)));
  }
  async function verifyProfilePin(profile,pin){if(!profile?.pinHash||!profile?.pinSalt)return true;return await hashPin(pin,profile.pinSalt)===profile.pinHash;}
  async function setProfilePin(profile,pin){profile.pinSalt=randomSaltB64();profile.pinHash=await hashPin(pin,profile.pinSalt);profile.updatedAt=new Date().toISOString();saveProfiles();}
  function themeOptionsHtml(){
    const selected=state.settings.appearanceTheme||'original';
    return APPEARANCE_THEMES.map(theme=>`<button type="button" class="appearance-option appearance-${esc(theme.id)}" role="radio" aria-checked="${theme.id===selected}" data-theme-value="${theme.id}"><span class="theme-option-heading"><span class="theme-option-symbol" aria-hidden="true">${esc(theme.symbol||'◐')}</span><strong>${esc(theme.name)}</strong></span><small>${esc(theme.description)}</small><span class="theme-swatches" aria-hidden="true">${theme.colors.map(c=>`<span style="background:${c}"></span>`).join('')}</span></button>`).join('');
  }
  function densityOptionsHtml(){
    const selected=state.settings.interfaceDensity||'comfortable';
    return INTERFACE_DENSITIES.map(d=>`<button type="button" class="density-option" role="radio" aria-checked="${d.id===selected}" data-density-value="${d.id}"><strong>${esc(d.name)}</strong><small>${esc(d.description)}</small><span class="density-preview" aria-hidden="true"><span></span><span></span><span></span></span></button>`).join('');
  }

  function renderStatsPanelHtml() {
    const st = calculateStats(state.statsPeriod);
    const periodLabel = state.statsPeriod === 'year' ? 'Anno corrente' : state.statsPeriod === '12m' ? 'Ultimi 12 mesi' : 'Tutto il periodo';
    const body = state.statsView === 'movies' ? renderMovieStats(st) : state.statsView === 'series' ? renderSeriesStats(st) : renderStatsOverview(st);
    return `<section class="profile-statistics-panel"><div class="section-head stats-head"><div><h2>Le statistiche di ${esc(currentProfile()?.name || 'questo profilo')}</h2><p>I dati sono calcolati localmente e restano separati dagli altri profili.</p></div><select id="statsPeriod" aria-label="Periodo statistiche"><option value="all" ${state.statsPeriod === 'all' ? 'selected' : ''}>Tutto il periodo</option><option value="year" ${state.statsPeriod === 'year' ? 'selected' : ''}>Anno corrente</option><option value="12m" ${state.statsPeriod === '12m' ? 'selected' : ''}>Ultimi 12 mesi</option></select></div>
      <div class="tabbar stats-tabs" role="tablist" aria-label="Tipo di statistiche"><button class="tab-button ${state.statsView === 'overview' ? 'active' : ''}" data-stats-view="overview">Riepilogo</button><button class="tab-button ${state.statsView === 'movies' ? 'active' : ''}" data-stats-view="movies">Film</button><button class="tab-button ${state.statsView === 'series' ? 'active' : ''}" data-stats-view="series">Serie TV</button></div>
      <p class="stats-period-note">Periodo selezionato: <strong>${esc(periodLabel)}</strong>. Preferiti, watchlist e serie completate descrivono lo stato attuale della libreria.</p>${body}</section>`;
  }
  function bindStatsPanel() {
    $('#statsPeriod')?.addEventListener('change', event => { state.statsPeriod = event.target.value; renderSettings(); });
    $$('[data-stats-view]').forEach(button => button.addEventListener('click', () => { state.statsView = button.dataset.statsView; renderSettings(); }));
  }
  function distanceKm(a, b) {
    if (!a || !b) return null;
    const rad = value => Number(value) * Math.PI / 180;
    const earth = 6371;
    const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude);
    const lat1 = rad(a.latitude), lat2 = rad(b.latitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function cinemaSearchOrigin(city = state.settings.programmingCity) {
    return state.cinemaSearchLocation || CITY_COORDINATES[normalizeSearch(city)] || null;
  }
  function nearestKnownCinemaCity(coords) {
    if (!coords) return null;
    const candidates = Object.entries(CITY_COORDINATES)
      .map(([key, point]) => ({ key, distance: distanceKm(coords, point) }))
      .filter(item => Number.isFinite(item.distance))
      .sort((a, b) => a.distance - b.distance);
    const nearest = candidates[0];
    if (!nearest || nearest.distance > 35) return null;
    const labels = { lecce:'Lecce', surbo:'Surbo', casamassima:'Casamassima', calimera:'Calimera' };
    return { name: labels[nearest.key] || nearest.key, distance: nearest.distance };
  }
  function cinemaLocationStatusMarkup(kind = 'neutral', message = '') {
    const icon = kind === 'success' ? '✓' : kind === 'loading' ? '…' : kind === 'warning' ? '!' : 'i';
    return `<span class="location-status-icon" aria-hidden="true">${icon}</span><span>${esc(message)}</span>`;
  }
  function updateCinemaLocationStatus(kind, message) {
    state.cinemaLocationFeedback = { kind, message };
    const status = $('#cinemaLocationStatus');
    if (!status) return;
    status.className = `location-status is-${kind}`;
    status.innerHTML = cinemaLocationStatusMarkup(kind, message);
  }
  function cinemaLocationInitialStatus() {
    if (state.cinemaLocationFeedback) return state.cinemaLocationFeedback;
    if (state.cinemaSearchLocation) return { kind:'success', message:'Posizione acquisita per questa sessione. La ricerca usa le coordinate del dispositivo.' };
    return { kind:'neutral', message:'Puoi inserire la città manualmente oppure usare l’icona della posizione nel campo.' };
  }
  async function browserGeolocationPermissionState() {
    if (!navigator.permissions?.query) return 'unknown';
    try { return (await navigator.permissions.query({ name:'geolocation' })).state || 'unknown'; }
    catch { return 'unknown'; }
  }
  function allKnownCinemas() {
    return [...new Map([...CINEMA_DIRECTORY, ...preferredCinemas()].map(cinema => [cinema.id || slug(cinema.name), cinema])).values()];
  }
  function cinemaSearchResults(city, radius, query = state.cinemaSearchQuery) {
    const origin = cinemaSearchOrigin(city);
    const q = normalizeSearch(query);
    return allKnownCinemas().map(cinema => ({ ...cinema, distance: distanceKm(origin, cinema) }))
      .filter(cinema => {
        const searchable = normalizeSearch(`${cinema.name} ${cinema.city} ${cinema.province}`);
        if (q && !searchable.includes(q)) return false;
        if (origin && Number.isFinite(cinema.distance)) return cinema.distance <= Number(radius || 25);
        return !city || searchable.includes(normalizeSearch(city));
      })
      .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999) || a.name.localeCompare(b.name, 'it'));
  }
  function cinemaResultsHtml(city = state.settings.programmingCity, radius = state.settings.cinemaRadiusKm, query = state.cinemaSearchQuery) {
    const selected = new Set(preferredCinemas().map(cinema => cinema.id || slug(cinema.name)));
    const results = cinemaSearchResults(city, radius, query).filter(cinema => !selected.has(cinema.id || slug(cinema.name)));
    if (!results.length) return `<div class="cinema-empty-result"><strong>Nessuna nuova sala trovata</strong><p>Le sale nel raggio potrebbero essere già tra le preferite. Prova ad aumentare il raggio, cambiare città oppure aggiungere manualmente una sala.</p></div>`;
    return `<div class="cinema-result-list">${results.map(cinema => `<label class="cinema-result-card"><input type="checkbox" data-cinema-choice="${esc(cinema.id || slug(cinema.name))}"><span class="cinema-result-icon" aria-hidden="true">🎟</span><span class="cinema-result-copy"><strong>${esc(cinema.name)}</strong><small>${esc(cinema.city)}${cinema.province ? ` · ${esc(cinema.province)}` : ''}${Number.isFinite(cinema.distance) ? ` · ${cinema.distance.toLocaleString('it-IT', { maximumFractionDigits:1 })} km` : ''}</small></span><span class="cinema-result-state">Aggiungi</span></label>`).join('')}</div>`;
  }
  function savedCinemasHtml() {
    const cinemas = preferredCinemas();
    if (!cinemas.length) return '<p class="cinema-empty-result">Non hai ancora salvato sale preferite.</p>';
    return `<div class="saved-cinema-list">${cinemas.map(cinema => `<label class="saved-cinema-card"><input type="checkbox" data-saved-cinema-choice="${esc(cinema.id || slug(cinema.name))}" checked><span><strong>${esc(cinema.name)}</strong><small>${esc(cinema.city || '')}${cinema.province ? ` · ${esc(cinema.province)}` : ''}</small></span>${cinema.officialUrl ? `<a href="${esc(cinema.officialUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Apri il sito ufficiale di ${esc(cinema.name)}">Sito ufficiale ↗</a>` : ''}</label>`).join('')}</div>`;
  }
  function serviceChoiceCardsHtml() {
    const selected = new Set((state.settings.preferredStreamingServices || []).map(normalizeSearch));
    return `<div class="service-choice-grid">${STREAMING_SERVICE_META.map(service => `<label class="service-choice-card"><input type="checkbox" data-streaming-choice="${esc(service.name)}" ${selected.has(normalizeSearch(service.name)) ? 'checked' : ''}><span class="service-logo service-${esc(service.tone)}" aria-hidden="true">${esc(service.mark)}</span><span class="service-choice-copy"><strong>${esc(service.name)}</strong></span><span class="service-check" aria-hidden="true">✓</span></label>`).join('')}</div>`;
  }
  function tvChannelChoiceCardsHtml() {
    const selected = new Set((state.settings.preferredTvChannels || []).map(normalizeSearch));
    return `<div class="tv-channel-choice-grid">${TV_CHANNEL_META.map(channel => `<label class="tv-channel-choice"><input type="checkbox" data-tv-choice="${esc(channel.name)}" ${selected.has(normalizeSearch(channel.name)) ? 'checked' : ''}><span class="tv-channel-logo tv-${esc(channel.tone)}" aria-hidden="true">${esc(channel.mark)}</span><strong>${esc(channel.name)}</strong><span class="service-check" aria-hidden="true">✓</span></label>`).join('')}</div>`;
  }

  function profileTabsHtml(active) {
    return `<div class="profile-tabs" role="tablist" aria-label="Sezioni del profilo">${PROFILE_SETTINGS_TABS.map((tab,index)=>`<button type="button" role="tab" id="profile-tab-${tab.id}" aria-controls="profile-tab-panel" aria-selected="${active===tab.id}" tabindex="${active===tab.id?'0':'-1'}" class="profile-tab ${active===tab.id?'active':''}" data-profile-tab="${tab.id}"><span class="profile-tab-icon" aria-hidden="true">${esc(tab.icon || '•')}</span><span>${esc(tab.label)}</span></button>`).join('')}</div>`;
  }
  function checkboxChoiceHtml(values, selected, dataAttribute, compact = false) {
    const chosen=new Set((selected||[]).map(normalizeSearch));
    return `<div class="preference-choice-grid ${compact?'compact':''}">${values.map(value=>`<label class="preference-choice"><input type="checkbox" ${dataAttribute}="${esc(value)}" ${chosen.has(normalizeSearch(value))?'checked':''}><span>${esc(value)}</span></label>`).join('')}</div>`;
  }
  function activeProfilePanelHtml(tab,p,account,emojis) {
    if(tab==='identity')return `<div class="profile-panel-grid identity-grid"><section class="content-card profile-identity-card"><h2>Identità del profilo</h2>${avatarHtml(p,'avatar-xl')}<div class="form-field"><label for="profileName">Nome visualizzato</label><input id="profileName" type="text" autocomplete="nickname" value="${esc(p.name)}" maxlength="30"></div><div class="avatar-picker" aria-label="Avatar predefiniti">${emojis.map(e=>`<button type="button" class="avatar-option ${p.avatarType==='emoji'&&p.avatarValue===e?'active':''}" data-avatar-emoji="${e}" aria-label="Usa avatar ${e}">${e}</button>`).join('')}</div><div class="profile-identity-actions"><button class="secondary" id="uploadAvatar">Carica una foto</button><button class="primary" id="saveProfileIdentity">Salva profilo</button></div></section><section class="settings-card profile-summary-card"><h3>Riepilogo personale</h3><p>Questi dati appartengono esclusivamente al profilo ${esc(p.name)}.</p><div class="info-list"><div class="info-row"><span>Serie</span><strong>${state.series.length.toLocaleString('it-IT')}</strong></div><div class="info-row"><span>Film</span><strong>${state.movies.length.toLocaleString('it-IT')}</strong></div><div class="info-row"><span>Protezione</span><strong>${p.pinHash?'PIN attivo':'Nessun PIN'}</strong></div></div><p class="notice">Per i grafici e il dettaglio delle attività usa il tab <strong>Statistiche</strong>.</p></section></div>`;
    if(tab==='stats')return renderStatsPanelHtml();
    if(tab==='appearance')return `<div class="settings-grid profile-spaced-grid"><section class="settings-card"><h3>Aspetto</h3><p>Tema e densità sono salvati solo per il profilo ${esc(p.name)}. Le palette sono predefinite per mantenere contrasto e leggibilità.</p><h4>Temi</h4><div class="appearance-options" role="radiogroup" aria-label="Tema grafico">${themeOptionsHtml()}</div><h4>Densità dell’interfaccia</h4><p>Modifica spazi, altezza delle card e quantità di contenuto visibile; la dimensione base del testo non cambia.</p><div class="density-options" role="radiogroup" aria-label="Densità dell’interfaccia">${densityOptionsHtml()}</div></section><section class="settings-card"><h3>Vista delle librerie</h3><p>Scegli se mostrare film e serie come locandine o come elenco.</p><div class="form-grid"><div class="form-field"><label for="seriesViewSetting">Vista Serie</label><select id="seriesViewSetting"><option value="grid" ${state.settings.seriesView==='grid'?'selected':''}>Locandine</option><option value="list" ${state.settings.seriesView==='list'?'selected':''}>Elenco</option></select></div><div class="form-field"><label for="movieViewSetting">Vista Film</label><select id="movieViewSetting"><option value="grid" ${state.settings.movieView==='grid'?'selected':''}>Locandine</option><option value="list" ${state.settings.movieView==='list'?'selected':''}>Elenco</option></select></div></div></section></div>`;
    if(tab==='services')return `<div class="settings-grid profile-spaced-grid profile-services-grid"><section class="settings-card cinema-preferences-card" id="cinemaPreferencesCard"><div class="section-head"><div><h3>Cinema preferiti</h3><p>Cerca le sale partendo da una città oppure usa la posizione del dispositivo per compilare automaticamente il punto di partenza.</p></div></div><form id="cinemaSearchForm" class="cinema-search-form"><div class="cinema-search-fields"><div class="form-field city-location-field"><label for="programmingCity">Città di riferimento</label><div class="location-input-group"><input id="programmingCity" value="${esc(state.settings.programmingCity||'Lecce')}" autocomplete="address-level2"><button class="location-field-button" id="useCinemaLocation" type="button" aria-label="Usa la posizione per compilare la città" aria-describedby="cinemaLocationStatus" title="Usa la mia posizione"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg></button></div><small>La posizione viene usata solo in questa sessione e non viene salvata.</small></div><div class="form-field radius-field"><label for="cinemaRadiusKm">Raggio massimo</label><select id="cinemaRadiusKm">${[10,25,50,75,100,200].map(km=>`<option value="${km}" ${Number(state.settings.cinemaRadiusKm)===km?'selected':''}>${km} km</option>`).join('')}</select></div></div>${(()=>{const feedback=cinemaLocationInitialStatus();return `<div id="cinemaLocationStatus" class="location-status is-${feedback.kind}" role="status" aria-live="polite">${cinemaLocationStatusMarkup(feedback.kind,feedback.message)}</div>`;})()}<div class="form-field cinema-name-filter"><label for="cinemaNameFilter">Nome della sala <span class="optional-label">facoltativo</span></label><input id="cinemaNameFilter" value="${esc(state.cinemaSearchQuery)}" placeholder="Es. The Space, Massimo…"></div><div class="cinema-search-submit-row"><button class="primary cinema-search-submit" id="searchCinemas" type="submit"><span aria-hidden="true">⌕</span> Cerca sale</button><small>La ricerca usa città, raggio ed eventuale filtro per nome.</small></div></form><div class="cinema-results-section"><h4>Sale trovate nel raggio</h4><div id="cinemaSearchResults">${cinemaResultsHtml(state.settings.programmingCity,state.settings.cinemaRadiusKm)}</div></div><div class="cinema-saved-section"><h4>Le tue sale preferite</h4><div id="savedCinemasList">${savedCinemasHtml()}</div></div><details class="manual-cinema-entry"><summary>Aggiungi una sala non presente</summary><div class="form-grid"><div class="form-field"><label for="manualCinemaName">Nome sala</label><input id="manualCinemaName" placeholder="Nome del cinema"></div><div class="form-field"><label for="manualCinemaCity">Città</label><input id="manualCinemaCity" value="${esc(state.settings.programmingCity||'Lecce')}"></div><div class="form-field full"><label for="manualCinemaUrl">Sito ufficiale (facoltativo)</label><input id="manualCinemaUrl" type="url" placeholder="https://"></div></div></details><div class="profile-card-actions"><button class="primary" id="saveCinemaPreferences" type="button">Salva cinema preferiti</button></div><p class="notice cinema-directory-note">La directory inclusa è locale e dimostrativa. Quando sarà collegata una fonte cinema ufficiale, la ricerca potrà mostrare ulteriori sale e programmazioni aggiornate.</p></section>
      <section class="settings-card service-preferences-card"><h3>Servizi preferiti</h3><p>Watchverse continua a cercare su tutte le fonti disponibili. Le selezioni cambiano soltanto l’ordine con cui vengono mostrati i risultati.</p><h4>Streaming — priorità principale</h4>${serviceChoiceCardsHtml()}<details class="secondary-preferences"><summary>Canali TV — priorità secondaria</summary><p>I passaggi TV restano visibili anche se il canale non è selezionato.</p>${tvChannelChoiceCardsHtml()}</details><div class="form-field service-language-field"><label for="programmingLanguage">Lingua o versione preferita dei contenuti</label><select id="programmingLanguage"><option value="any" ${state.settings.programmingLanguage==='any'?'selected':''}>Nessuna priorità</option><option value="it" ${state.settings.programmingLanguage==='it'?'selected':''}>Preferisci italiano / doppiato</option><option value="original" ${state.settings.programmingLanguage==='original'?'selected':''}>Preferisci versione originale</option></select><small>Influenza solo l’ordine di spettacoli e offerte quando la fonte indica la lingua. L’interfaccia di Watchverse resta in italiano.</small></div><div class="profile-card-actions"><button class="primary" id="saveServicePreferences" type="button">Salva servizi</button></div></section></div>`;
    if(tab==='notifications')return `<div class="settings-grid profile-spaced-grid"><section class="settings-card"><h3>Notifiche</h3><p>Avvisi locali per le uscite rilevate dall’app.</p>${switchSetting('notifyNewEpisodes','Nuovi episodi','Avvisa quando viene rilevato un episodio nuovo')}${switchSetting('notifyTomorrow','Promemoria domani','Avvisa per le uscite del giorno successivo')}${switchSetting('browserNotifications','Notifiche browser','Richiede il permesso del browser')}<button class="secondary" id="requestNotif">Verifica permesso</button></section></div>`;
    if(tab==='import')return `<div id="embeddedImportExport" class="embedded-import-export"></div>`;
    if(tab==='data')return `<div class="settings-grid profile-spaced-grid data-source-layout"><section class="settings-card wide-card shared-catalog-card"><div class="section-head"><div><h3>Catalogo condiviso sul dispositivo</h3><p>I dati pubblici di film e serie sono disponibili a tutti i profili.</p></div><span class="catalog-count-badge">${state.catalogEntries.length.toLocaleString('it-IT')} titoli</span></div><div class="shared-data-split"><div><strong>Dati comuni</strong><p>Descrizioni, locandine, cast, stagioni, episodi, identificativi e trailer ufficiali.</p></div><div><strong>Dati del profilo</strong><p>Stato di visione, episodi visti, voto, preferiti, note e configurazioni personali.</p></div></div></section>
      <section class="settings-card"><h3>Metadati pubblici</h3><p>Attivi senza registrazione: TVmaze per serie, episodi e cast; Wikipedia/Wikidata per film, descrizioni e immagini.</p>${switchSetting('publicMetadataEnabled','Fonti pubbliche','Recupera automaticamente locandine, descrizioni, episodi e cast')}${switchSetting('autoEnrichVisible','Aggiornamento graduale','Aggiorna in background solo i titoli che stai visualizzando')}<button class="secondary" id="refreshLibraryMetadata">Aggiorna i prossimi titoli</button><p class="notice">Prima di interrogare Internet, Watchverse controlla sempre il catalogo condiviso.</p><hr class="settings-divider"><h4>TMDB opzionale</h4><p>TMDB completa provider streaming italiani tramite JustWatch, biografie e filmografie.</p>${(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl?`<p class="notice">Proxy TMDB sicuro configurato sul server. Il token non viene esposto nel browser.</p><button class="secondary" id="saveTmdb">Verifica connessione</button><p id="tmdbStatus" class="notice">Configurazione cloud attiva.</p>`:`<div class="form-field"><label for="tmdbToken">TMDB Read Access Token locale</label><input id="tmdbToken" type="password" value="${esc(state.settings.tmdbToken||'')}" placeholder="eyJhbGciOi…"><small>Facoltativo. In una pubblicazione online è preferibile il proxy server incluso nel pacchetto.</small></div><button class="secondary" id="saveTmdb">Salva e verifica</button><p id="tmdbStatus" class="notice ${state.settings.tmdbToken?'':'warning'}">${state.settings.tmdbToken?'Token locale configurato.':'TMDB non configurato: TVmaze, Wikipedia e Wikidata restano attivi; alcuni provider e crediti possono essere incompleti.'}</p>`}</section><section class="settings-card"><h3>Fonti e aggiornamenti dati</h3><p>TVmaze è preconfigurato per i metadati. I provider italiani vengono mostrati solo tramite JustWatch/TMDB; trailer e orari cinema possono essere controllati da avvia_server.py sulle fonti pubbliche e sui siti ufficiali configurati.</p>${sourceRowsHtml()}<div class="notice">Le disponibilità e gli orari possono cambiare. Per acquisti e prenotazioni fa fede il sito ufficiale del servizio, del canale o del cinema.</div></section></div>`;
    return `<div class="settings-grid profile-spaced-grid"><section class="settings-card"><h3>Sicurezza del profilo</h3><p>Il PIN è facoltativo e, per impostazione iniziale, non è attivo.</p><div class="security-status"><div><strong>${p.pinHash?'PIN configurato':'Nessun PIN configurato'}</strong><small>${p.pinHash?'Verrà richiesto quando si apre il profilo.':'Il profilo si apre direttamente dalla schermata iniziale.'}</small></div><button class="secondary" id="managePin">${p.pinHash?'Gestisci PIN':'Crea PIN'}</button></div></section><section class="settings-card"><h3>Profili familiari</h3><p>Gestisci i profili familiari. Le librerie sono separate.</p><button class="secondary" id="manageProfiles">Gestisci profili</button></section><section class="settings-card"><h3>Account familiare</h3><p><strong>${esc(account?.username||'utente')}</strong><br>${esc(account?.email||'')}</p><span class="account-chip ${WatchverseAuth.cloudConfigured()?'':'local'}">● ${WatchverseAuth.cloudConfigured()?'Cloud configurato':'Modalità locale'}</span><div class="hero-actions"><button class="secondary" id="changePassword">Cambia password</button><button class="ghost" id="logoutAccount">Esci</button></div></section><section class="settings-card"><h3>Dati del profilo</h3><p>Puoi eliminare la libreria del profilo corrente. L’operazione non modifica gli altri profili.</p><button class="danger-button" id="clearProfile">Svuota profilo</button></section></div>`;
  }

  const WCAG_STATUS_META = Object.freeze({
    'passed': { label:'Passato', symbol:'✓' },
    'failed': { label:'Fallito', symbol:'!' },
    'not-verified': { label:'Non verificato', symbol:'?' },
    'not-applicable': { label:'Non applicabile', symbol:'—' }
  });
  function wcagReportData(){ return window.WATCHVERSE_WCAG_REPORT || { criteria:[], principles:[], guidelines:[], methods:[], limitations:[] }; }
  function wcagCounts(criteria){
    const counts={passed:0,failed:0,'not-verified':0,'not-applicable':0};
    for(const criterion of criteria) if(Object.hasOwn(counts,criterion.status)) counts[criterion.status]++;
    return counts;
  }
  function wcagStatusChip(status){
    const meta=WCAG_STATUS_META[status]||{label:status,symbol:'•'};
    return `<span class="status-chip status-${esc(status)}"><span aria-hidden="true">${meta.symbol}</span>${esc(meta.label)}</span>`;
  }
  function wcagSummaryCards(criteria){
    const counts=wcagCounts(criteria);
    return `<div class="accessibility-summary-grid" aria-label="Riepilogo degli esiti">
      ${Object.entries(WCAG_STATUS_META).map(([status,meta])=>`<article class="accessibility-stat status-${status}"><strong>${counts[status]}</strong><span>${esc(meta.label)}</span></article>`).join('')}
    </div>`;
  }
  function accessibilityDeclarationHtml(report){
    const targetCriteria=report.criteria.filter(c=>c.level==='A'||c.level==='AA');
    const targetCounts=wcagCounts(targetCriteria);
    const blockingFailures=targetCriteria.filter(c=>c.status==='failed');
    const allFailures=report.criteria.filter(c=>c.status==='failed');
    const conformity=blockingFailures.length?'Parzialmente conforme al livello AA':'Conforme al livello AA';
    return `<section class="accessibility-hero">
      <span class="kicker">WCAG 2.2 · verifica del ${esc(new Date(report.evaluationDate+'T12:00:00').toLocaleDateString('it-IT'))}</span>
      <h2>Dichiarazione di accessibilità</h2>
      <p>Questa dichiarazione tecnica descrive lo stato di accessibilità di Watchverse ${esc(report.version)} nell’ambito indicato. La valutazione è basata sui criteri di successo WCAG 2.2 e non costituisce una certificazione rilasciata da un organismo terzo.</p>
      <span class="conformance-badge">${blockingFailures.length?'⚠':'✓'} ${esc(conformity)}</span>
    </section>
    <section class="content-card section" aria-labelledby="accessibility-status-title">
      <h2 id="accessibility-status-title">Stato di conformità</h2>
      <p>Il livello di riferimento è <strong>AA</strong>. Dei ${targetCriteria.length} criteri di livello A e AA, ${targetCounts.passed} risultano passati, ${targetCounts['not-applicable']} non applicabili e ${targetCounts.failed} falliti. ${targetCounts['not-verified']?`${targetCounts['not-verified']} criteri non sono stati verificati.`:'Non risultano criteri A o AA lasciati nello stato “non verificato”.'}</p>
      ${wcagSummaryCards(targetCriteria)}
      <p class="notice warning"><strong>Interpretazione:</strong> i criteri AAA sono inclusi nell’Assessment AI per trasparenza, ma i loro eventuali fallimenti non determinano la conformità al livello AA.</p>
    </section>
    <section class="content-card section" aria-labelledby="non-accessible-title">
      <h2 id="non-accessible-title">Contenuti e funzioni non pienamente accessibili</h2>
      ${blockingFailures.length?`<p>I seguenti problemi impediscono al momento di dichiarare la piena conformità al livello AA:</p><div class="accessibility-failure-list">${blockingFailures.map(c=>`<article class="accessibility-failure"><strong>${esc(c.id)} ${esc(c.title)} · livello ${esc(c.level)}</strong><span>${esc(c.note)}</span></article>`).join('')}</div>`:'<p>Non sono stati rilevati fallimenti tra i criteri di livello A e AA inclusi nell’ambito della verifica.</p>'}
      ${allFailures.length>blockingFailures.length?`<details class="inline-details"><summary>Mostra anche i fallimenti di livello AAA</summary><div class="accessibility-failure-list">${allFailures.filter(c=>c.level==='AAA').map(c=>`<article class="accessibility-failure"><strong>${esc(c.id)} ${esc(c.title)} · livello ${esc(c.level)}</strong><span>${esc(c.note)}</span></article>`).join('')}</div></details>`:''}
    </section>
    <section class="content-card section" aria-labelledby="assessment-method-title">
      <h2 id="assessment-method-title">Ambito e metodo di valutazione</h2>
      <p><strong>Ambito:</strong> ${esc(report.scope)}</p>
      <h3>Controlli eseguiti</h3><ul class="accessibility-list">${report.methods.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <h3>Limiti della verifica</h3><ul class="accessibility-list">${report.limitations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <div class="hero-actions"><a class="secondary button-link" href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">Riferimento ufficiale WCAG 2.2 ↗</a></div>
    </section>`;
  }

  function accessibilityAssessmentHtml(report){
    const statusFilter=state.wcagStatusFilter||'all';
    const levelFilter=state.wcagLevelFilter||'all';
    const filtered=report.criteria.filter(c=>(statusFilter==='all'||c.status===statusFilter)&&(levelFilter==='all'||c.level===levelFilter));
    const target=report.criteria.filter(c=>c.level==='A'||c.level==='AA');
    const targetCounts=wcagCounts(target);
    const aaa=report.criteria.filter(c=>c.level==='AAA');
    const aaaCounts=wcagCounts(aaa);
    const counts=targetCounts, total=target.length||1;
    const passedDeg=counts.passed/total*360;
    const failedDeg=passedDeg+counts.failed/total*360;
    const unverifiedDeg=failedDeg+counts['not-verified']/total*360;
    const pie=`conic-gradient(#56b94d 0deg ${passedDeg}deg,#e34d5e ${passedDeg}deg ${failedDeg}deg,#d59b2b ${failedDeg}deg ${unverifiedDeg}deg,#7b8492 ${unverifiedDeg}deg 360deg)`;
    return `<section class="assessment-ai-intro content-card section" aria-labelledby="assessment-ai-title"><span class="assessment-ai-icon" aria-hidden="true">✦</span><div><span class="kicker">Assessment AI · WCAG 2.2</span><h2 id="assessment-ai-title">Mappatura completa dei criteri</h2><p>Questo assessment è stato prodotto con supporto AI ed è basato sui criteri di successo delle <strong>WCAG 2.2</strong>. Mostra gli esiti tecnici rilevati, gli elementi non verificati e i limiti dichiarati; non sostituisce una certificazione indipendente né i test con persone e tecnologie assistive.</p><small>Versione ${esc(report.version)} · verifica del ${esc(new Date(report.evaluationDate+'T12:00:00').toLocaleDateString('it-IT'))} · obiettivo livello ${esc(report.targetLevel)}</small></div></section>
      <div class="wcag-overview">
        <section class="wcag-chart-card" aria-labelledby="wcag-chart-title"><h3 id="wcag-chart-title">Ripartizione degli esiti A e AA</h3><div class="wcag-pie-wrap"><div class="wcag-pie" style="background:${pie}" role="img" aria-label="${counts.passed} passati, ${counts.failed} falliti, ${counts['not-verified']} non verificati, ${counts['not-applicable']} non applicabili"><div class="wcag-pie-label"><strong>${target.length}</strong><span>criteri A e AA</span></div></div></div><div class="wcag-legend">${Object.entries(WCAG_STATUS_META).map(([status,meta])=>`<div><i class="status-${status}" aria-hidden="true"></i><span>${esc(meta.label)}: <strong>${counts[status]}</strong></span></div>`).join('')}</div></section>
        <section class="wcag-text-summary"><h3>Statistiche testuali</h3><p>Su ${target.length} criteri complessivi di livello A e AA: <strong>${counts.passed} passati</strong> (${Math.round(counts.passed/total*100)}%), <strong>${counts.failed} falliti</strong> (${Math.round(counts.failed/total*100)}%), <strong>${counts["not-verified"]} non verificati</strong> (${Math.round(counts["not-verified"]/total*100)}%) e <strong>${counts["not-applicable"]} non applicabili</strong> (${Math.round(counts["not-applicable"]/total*100)}%).</p><p>Volendo estendere il calcolo al livello AAA, si aggiungono ${aaa.length} criteri: ${aaaCounts.passed} passati, ${aaaCounts.failed} falliti, ${aaaCounts["not-verified"]} non verificati e ${aaaCounts["not-applicable"]} non applicabili.</p><p>Un criterio "non verificato" richiede un collaudo manuale o assistivo ulteriore. "Non applicabile" indica che la funzione descritta dal criterio non è presente nell'ambito valutato.</p></section>
      </div>
      <section class="report-toolbar content-card" aria-label="Filtri e azioni dell’Assessment AI">
        <div class="form-field"><label for="wcagStatusFilter">Esito</label><select id="wcagStatusFilter"><option value="all">Tutti gli esiti</option>${Object.entries(WCAG_STATUS_META).map(([status,meta])=>`<option value="${status}" ${statusFilter===status?'selected':''}>${esc(meta.label)}</option>`).join('')}</select></div>
        <div class="form-field"><label for="wcagLevelFilter">Livello</label><select id="wcagLevelFilter"><option value="all">Tutti i livelli</option>${['A','AA','AAA'].map(level=>`<option value="${level}" ${levelFilter===level?'selected':''}>${level}</option>`).join('')}</select></div>
        <button class="secondary" id="printWcagReport" type="button">Stampa / salva PDF</button><button class="secondary" id="downloadWcagReport" type="button">Scarica JSON</button><span class="report-result-count" role="status">${filtered.length} criteri visualizzati</span>
      </section>
      <div id="wcagCriteriaList">${report.principles.map(principle=>{
        const principleCriteria=filtered.filter(c=>c.guideline.startsWith(principle.id+'.'));
        if(!principleCriteria.length)return '';
        return `<section class="wcag-principle"><h2>Principio ${esc(principle.id)} · ${esc(principle.name)}</h2><p>${esc(principle.description)}</p>${report.guidelines.filter(g=>g.id.startsWith(principle.id+'.')).map(g=>{
          const criteria=principleCriteria.filter(c=>c.guideline===g.id);if(!criteria.length)return '';
          return `<details class="wcag-guideline" open><summary><span>${esc(g.id)} ${esc(g.name)}</span><small>${criteria.length} criteri</small></summary><div class="wcag-criteria">${criteria.map(c=>`<article class="wcag-row"><h4>${esc(c.id)} ${esc(c.title)}</h4><span class="wcag-level">${esc(c.level)}</span>${wcagStatusChip(c.status)}<p class="wcag-note">${esc(c.note)}</p></article>`).join('')}</div></details>`;
        }).join('')}</section>`;
      }).join('')}</div>`;
  }

  function bindAccessibilityTabs(report){
    $$('[data-accessibility-tab]').forEach((button,index,buttons)=>{
      button.addEventListener('click',()=>{state.accessibilityTab=button.dataset.accessibilityTab;renderAccessibility();});
      button.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();
        let next=index;
        if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;
        if(event.key==='ArrowRight')next=(index+1)%buttons.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=buttons.length-1;
        buttons[next].focus();
      });
    });
    if(state.accessibilityTab!=='assessment')return;
    $('#wcagStatusFilter')?.addEventListener('change',e=>{state.wcagStatusFilter=e.target.value;renderAccessibility();});
    $('#wcagLevelFilter')?.addEventListener('change',e=>{state.wcagLevelFilter=e.target.value;renderAccessibility();});
    $('#printWcagReport')?.addEventListener('click',()=>window.print());
    $('#downloadWcagReport')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify(report,null,2)],{type:'application/json;charset=utf-8'}),`watchverse-wcag-2.2-${report.version}.json`));
  }

  function renderAccessibility(){
    const report=wcagReportData();
    const active=state.accessibilityTab==='assessment'?'assessment':'declaration';
    state.accessibilityTab=active;
    setPage('Accessibilità',active==='assessment'?'Assessment AI basato sulle WCAG 2.2':'Dichiarazione di accessibilità','');
    setMain(`<div class="accessibility-page-shell"><div class="accessibility-tabs" role="tablist" aria-label="Sezioni accessibilità"><button id="accessibility-tab-declaration" class="accessibility-tab ${active==='declaration'?'active':''}" type="button" role="tab" aria-selected="${active==='declaration'}" aria-controls="accessibility-panel" tabindex="${active==='declaration'?'0':'-1'}" data-accessibility-tab="declaration"><span aria-hidden="true">▤</span>Dichiarazione</button><button id="accessibility-tab-assessment" class="accessibility-tab ${active==='assessment'?'active':''}" type="button" role="tab" aria-selected="${active==='assessment'}" aria-controls="accessibility-panel" tabindex="${active==='assessment'?'0':'-1'}" data-accessibility-tab="assessment"><span aria-hidden="true">✦</span>Assessment AI</button></div><section id="accessibility-panel" class="accessibility-tab-panel" role="tabpanel" aria-labelledby="accessibility-tab-${active}" tabindex="0">${active==='declaration'?accessibilityDeclarationHtml(report):accessibilityAssessmentHtml(report)}</section></div>`);
    bindAccessibilityTabs(report);
  }

  function renderAccessibilityReport(){
    state.accessibilityTab='assessment';
    renderAccessibility();
  }

  function renderDesignSystem(){
    setPage('Design system','Specifiche visuali e componenti','');
    setMain(`<div class="design-system-page">
      <div class="design-system-toolbar"><button class="ghost" id="designSystemBack" type="button">← Torna indietro</button><span>Watchverse ${APP_VERSION} · Build ${APP_BUILD}</span></div>
      <header class="design-system-intro"><span class="eyebrow">Watchverse design system</span><h2>Fondamenti e componenti</h2><p>Specifiche operative del linguaggio visivo Watchverse Black. Questa pagina documenta i token e le regole usate dall'interfaccia, con esempi direttamente verificabili.</p></header>
      <section class="design-system-section"><div><span class="eyebrow">01 · Brand</span><h3>Marchio e voce</h3><p>Il wordmark e il marchio drago usano gli asset approvati. Titoli, controlli e testi dell'interfaccia usano la tipografia UI standard.</p></div><div class="design-system-brand-sample"><img src="assets/brand/watchverse-dragon-wordmark.svg" alt="Watchverse. Scegli cosa guardare. Ricorda cosa hai visto."></div></section>
      <section class="design-system-section"><div><span class="eyebrow">02 · Colore</span><h3>Token semantici</h3><p>Il rosso Deep Crimson e' il colore primario. I token semantici vengono usati anche per focus, errori, successo e stati di sincronizzazione.</p></div><div class="design-system-token-table"><div><i style="--token:#070707"></i><span>Background</span><code>#070707</code></div><div><i style="--token:#111112"></i><span>Surface</span><code>#111112</code></div><div><i style="--token:#242427"></i><span>Surface 3</span><code>#242427</code></div><div><i style="--token:#8e1624"></i><span>Accent / Deep Crimson</span><code>#8e1624</code></div><div><i style="--token:#c02a38"></i><span>Accent strong</span><code>#c02a38</code></div><div><i style="--token:#fafafa"></i><span>Text</span><code>#fafafa</code></div></div></section>
      <section class="design-system-section"><div><span class="eyebrow">03 · Tipografia</span><h3>Scala e gerarchia</h3><p>La gerarchia segue il contenuto: un solo H1 per pagina, titoli di sezione più contenuti, corpo leggibile e metadati compatti.</p></div><div class="design-system-type-sample"><div><strong class="ds-display">Titolo display</strong><code>800 · responsive</code></div><div><strong class="ds-page-title">Titolo pagina H1</strong><code>800 · 2.5rem</code></div><div><strong class="ds-section-title">Titolo sezione</strong><code>800 · 1.5rem</code></div><div><span class="ds-body">Testo del contenuto</span><code>400-600 · 1rem</code></div><div><span class="ds-meta">Metadata e badge</span><code>700-850 · .75rem</code></div></div></section>
      <section class="design-system-section"><div><span class="eyebrow">04 · Layout</span><h3>Struttura della pagina</h3><p>Desktop: sidebar, topbar e contenuto principale. Mobile: navigazione adattata, una colonna e controlli con target minimo di 44px.</p></div><div class="design-system-layout-sample"><span>Sidebar</span><span>Topbar · contesto · brand · azioni</span><span>Main content · griglia fluida</span><span>Footer · versione · link</span></div></section>
      <section class="design-system-section"><div><span class="eyebrow">05 · Componenti</span><h3>Azioni, stati e feedback</h3><p>I controlli mantengono dimensioni, stati hover e focus coerenti. I link d'azione sono sottolineati e cambiano colore al passaggio del mouse.</p></div><div class="design-system-component-sample"><div class="ds-actions"><button class="primary">Azione primaria</button><button class="secondary">Azione secondaria</button><a class="auth-link" href="#/design-system">Link di servizio</a></div><div class="ds-status"><span class="metadata-status-symbol">↻</span><strong>Sincronizzazione in corso</strong><span class="progress-track"><span class="progress-fill" style="width:72%"></span></span></div><div class="ds-card"><div class="ds-card-poster">WATCH</div><div><strong>Serie in corso</strong><p>Prossimo episodio <span class="episode-code">S02 E05</span></p></div></div></div></section>
      <section class="design-system-section design-system-guidance"><div><span class="eyebrow">06 · Accessibilita'</span><h3>Regole di qualita'</h3><p>Contrasto minimo verificato su testo e controlli, focus visibile, informazione non affidata al solo colore, stati annunciabili e layout senza sovrapposizioni.</p></div><ul><li>Target interattivi minimi: 44 × 44px.</li><li>Focus sempre visibile con bordo ad alto contrasto.</li><li>Testi lunghi: wrapping o troncamento controllato, mai sovrapposizione.</li><li>Hover e focus disponibili per link, pulsanti e controlli iconografici.</li></ul></section>
    </div>`);
    $('#designSystemBack')?.addEventListener('click',()=>{ if (history.length > 1) history.back(); else location.hash='#/home'; });
  }

  function renderSettings(){
    setPage('Profilo','Impostazioni e privacy','settings');
    const p=currentProfile(),account=WatchverseAuth.readAccount();
    const emojis=['🎬','🍿','📺','📚','⭐','🦸‍♀️','🕵️‍♀️','👻','🎮','🌙','🦋','🐈'];
    const active=PROFILE_SETTINGS_TABS.some(x=>x.id===state.profileSettingsTab)?state.profileSettingsTab:'identity';
    state.profileSettingsTab=active;
    setMain(`<div class="profile-page-shell"><section class="profile-card">${avatarHtml(p)}<div><h2>${esc(p.name)}</h2><p>${state.series.length.toLocaleString('it-IT')} serie · ${state.movies.length.toLocaleString('it-IT')} film · ${p.pinHash?'PIN attivo':'nessun PIN'}</p></div><button class="secondary" id="switchProfile">Cambia profilo</button></section>${profileTabsHtml(active)}<section id="profile-tab-panel" class="profile-tab-panel" role="tabpanel" aria-labelledby="profile-tab-${active}" tabindex="0">${activeProfilePanelHtml(active,p,account,emojis)}</section></div>`);
    if(active==='import'){
      const host=$('#embeddedImportExport');
      if(host){host.innerHTML=importExportMarkup();bindImportExportEvents();}
    }
    if(active==='stats')bindStatsPanel();
    $$('[data-profile-tab]').forEach(button=>button.addEventListener('click',()=>{state.profileSettingsTab=button.dataset.profileTab;renderSettings();setTimeout(()=>$('#profile-tab-panel')?.focus({preventScroll:true}),0);}));
    $$('[data-profile-tab]').forEach((button,index,buttons)=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();let next=index;if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;if(event.key==='ArrowRight')next=(index+1)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;buttons[next].focus();}));
    $('#switchProfile')?.addEventListener('click',showProfileGate);
    $('#manageProfiles')?.addEventListener('click',showProfileManager);
    $('#managePin')?.addEventListener('click',()=>showPinManager(p));
    $('#saveProfileIdentity')?.addEventListener('click',()=>{const name=$('#profileName').value.trim();if(!name){showToast('Nome mancante','','!');return;}p.name=name;p.initial=name[0].toUpperCase();p.updatedAt=new Date().toISOString();saveProfiles();updateProfileEntryPoints();showToast('Profilo aggiornato',name);renderSettings();});
    $$('[data-avatar-emoji]').forEach(button=>button.addEventListener('click',()=>{p.avatarType='emoji';p.avatarValue=button.dataset.avatarEmoji;saveProfiles();updateProfileEntryPoints();renderSettings();}));
    $('#uploadAvatar')?.addEventListener('click',()=>{state.pendingAvatarProfileId=p.id;$('#avatarInput').click();});
    $$('[data-theme-value]').forEach(button=>button.addEventListener('click',()=>{state.settings.appearanceTheme=button.dataset.themeValue;saveSettings();$$('[data-theme-value]').forEach(item=>item.setAttribute('aria-checked',String(item===button)));showToast('Tema aggiornato',button.querySelector('strong')?.textContent||'','✓');}));
    $$('[data-density-value]').forEach(button=>button.addEventListener('click',()=>{state.settings.interfaceDensity=button.dataset.densityValue;saveSettings();$$('[data-density-value]').forEach(item=>item.setAttribute('aria-checked',String(item===button)));showToast('Densità aggiornata',button.querySelector('strong')?.textContent||'','✓');}));
    $('#seriesViewSetting')?.addEventListener('change',event=>{state.settings.seriesView=event.target.value;saveSettings();});
    $('#movieViewSetting')?.addEventListener('change',event=>{state.settings.movieView=event.target.value;saveSettings();});

    const refreshCinemaResults=()=>{
      const city=$('#programmingCity')?.value.trim()||'Lecce';
      const radius=Number($('#cinemaRadiusKm')?.value)||25;
      state.cinemaSearchQuery=$('#cinemaNameFilter')?.value.trim()||'';
      const host=$('#cinemaSearchResults');
      if(host)host.innerHTML=cinemaResultsHtml(city,radius,state.cinemaSearchQuery);
    };
    $('#cinemaSearchForm')?.addEventListener('submit',event=>{event.preventDefault();refreshCinemaResults();showToast('Ricerca completata','Le sale sono state filtrate per città, raggio e nome.','⌕',2600);});
    $('#useCinemaLocation')?.addEventListener('click',async()=>{
      if(!('geolocation' in navigator)){
        updateCinemaLocationStatus('warning','La geolocalizzazione non è supportata da questo browser. Inserisci la città manualmente.');
        showToast('Posizione non disponibile','Il browser non supporta la geolocalizzazione.','!');return;
      }
      const localSecureHost=['localhost','127.0.0.1','::1'].includes(location.hostname);
      if(!window.isSecureContext && !localSecureHost){
        const message=location.protocol==='file:'
          ? 'La posizione non è disponibile aprendo direttamente il file. Avvia Watchverse con avvia_server.py e aprilo da localhost, oppure usa una pubblicazione HTTPS.'
          : 'Per proteggere la posizione, il browser la consente solo su HTTPS o localhost.';
        updateCinemaLocationStatus('warning',message);
        showToast('Posizione non disponibile','Apri l’app tramite HTTPS o localhost.','!');return;
      }
      const permissionBefore=await browserGeolocationPermissionState();
      if(permissionBefore==='denied'){
        updateCinemaLocationStatus('warning','Il browser ha bloccato l’accesso alla posizione. Riattivalo dalle autorizzazioni del sito oppure inserisci la città manualmente.');
        showToast('Posizione bloccata','Modifica il permesso nelle impostazioni del sito.','!');return;
      }
      updateCinemaLocationStatus('loading',permissionBefore==='prompt'?'In attesa del consenso alla posizione…':'Sto rilevando la posizione del dispositivo…');
      navigator.geolocation.getCurrentPosition(position=>{
        const latitude=Number(position.coords.latitude),longitude=Number(position.coords.longitude);
        if(!Number.isFinite(latitude)||!Number.isFinite(longitude)){
          updateCinemaLocationStatus('warning','Il browser ha restituito coordinate non valide. Inserisci la città manualmente.');return;
        }
        state.cinemaSearchLocation={latitude,longitude,accuracy:Number(position.coords.accuracy)||null};
        const nearest=nearestKnownCinemaCity(state.cinemaSearchLocation);
        const cityInput=$('#programmingCity');
        if(nearest&&cityInput)cityInput.value=nearest.name;
        const accuracy=state.cinemaSearchLocation.accuracy?` Precisione stimata: ${Math.round(state.cinemaSearchLocation.accuracy)} m.`:'';
        const reference=nearest?` Città di riferimento compilata: ${nearest.name}.`:'';
        updateCinemaLocationStatus('success',`Posizione acquisita per questa sessione.${reference}${accuracy}`);
        refreshCinemaResults();
        showToast('Posizione acquisita',nearest?`Ricerca cinema centrata su ${nearest.name}.`:'La ricerca usa ora la posizione corrente.','⌖');
      },async error=>{
        const permissionAfter=await browserGeolocationPermissionState();
        let message='Non è stato possibile determinare la posizione. Puoi continuare inserendo la città manualmente.';
        if(error?.code===1||permissionAfter==='denied')message='Il consenso alla posizione non è attivo. Riabilitalo dalle autorizzazioni del sito oppure inserisci la città manualmente.';
        else if(error?.code===2&&permissionAfter==='granted')message='Il consenso è attivo, ma il dispositivo non riesce a determinare la posizione. Attiva GPS o Wi‑Fi e riprova.';
        else if(error?.code===2)message='La posizione è temporaneamente non disponibile. Controlla GPS o Wi‑Fi e riprova.';
        else if(error?.code===3)message='Il rilevamento della posizione ha impiegato troppo tempo. Riprova oppure inserisci la città manualmente.';
        updateCinemaLocationStatus('warning',message);
        showToast('Posizione non acquisita',message,'!');
      },{enableHighAccuracy:true,timeout:20000,maximumAge:0});
    });
    $('#saveCinemaPreferences')?.addEventListener('click',()=>{
      const city=$('#programmingCity').value.trim()||'Lecce';
      const radius=Number($('#cinemaRadiusKm').value)||25;
      const selectedIds=new Set([
        ...$$('[data-cinema-choice]:checked').map(input=>input.dataset.cinemaChoice),
        ...$$('[data-saved-cinema-choice]:checked').map(input=>input.dataset.savedCinemaChoice)
      ]);
      const known=allKnownCinemas();
      const selected=known.filter(cinema=>selectedIds.has(cinema.id||slug(cinema.name)));
      const manualName=$('#manualCinemaName')?.value.trim();
      if(manualName){
        let officialUrl=$('#manualCinemaUrl')?.value.trim()||'';
        if(officialUrl&&!/^https?:\/\//i.test(officialUrl))officialUrl=`https://${officialUrl}`;
        selected.push({id:`custom-${slug(manualName)}-${Date.now().toString(36)}`,name:manualName,city:$('#manualCinemaCity')?.value.trim()||city,province:'',officialUrl,sourceType:'Inserita manualmente'});
      }
      state.settings.programmingCity=city;
      state.settings.cinemaRadiusKm=radius;
      state.settings.preferredCinemas=[...new Map(selected.map(cinema=>[cinema.id||slug(cinema.name),cinema])).values()];
      saveSettings();showToast('Cinema aggiornati',`${state.settings.preferredCinemas.length} sale preferite`,'✓');renderSettings();
    });
    $('#saveServicePreferences')?.addEventListener('click',()=>{state.settings.preferredStreamingServices=$$('[data-streaming-choice]:checked').map(input=>input.dataset.streamingChoice);state.settings.preferredTvChannels=$$('[data-tv-choice]:checked').map(input=>input.dataset.tvChoice);state.settings.programmingLanguage=$('#programmingLanguage').value;state.settings.preferOriginalVersion=state.settings.programmingLanguage==='original';saveSettings();showToast('Servizi aggiornati','Le preferenze cambiano solo la priorità dei risultati.','✓');});
    $('#saveTmdb')?.addEventListener('click',async()=>{const input=$('#tmdbToken');if(input){state.settings.tmdbToken=input.value.trim();saveSettings();}const status=$('#tmdbStatus');if(!(window.WATCHVERSE_CONFIG||{}).tmdbProxyUrl&&!state.settings.tmdbToken){status.className='notice warning';status.textContent='Token rimosso: resta attiva la modalità locale.';return;}status.textContent='Verifica in corso…';try{const data=await tmdbFetch('/configuration');status.className='notice';status.textContent=`Connessione riuscita. Immagini: ${data.images?.secure_base_url||'configurate'}`;}catch(error){status.className='notice danger';status.textContent=`Connessione non verificata: ${error.message}`;}});
    $$('[data-setting-switch]').forEach(input=>input.addEventListener('change',()=>{state.settings[input.dataset.settingSwitch]=input.checked;saveSettings();if(input.dataset.settingSwitch==='browserNotifications'&&input.checked)requestNotifications();}));
    $('#refreshLibraryMetadata')?.addEventListener('click',()=>{state.metadataAutoBudget+=24;const seriesTargets=sortSeriesItems(state.series,'latestEpisode').filter(item=>needsPublicMetadata(item,'series',false)).slice(0,8);const movieTargets=sortMovieItems(state.movies,'recent').filter(item=>needsPublicMetadata(item,'movie',false)).slice(0,8);if(!seriesTargets.length&&!movieTargets.length){showToast('Libreria già aggiornata','Non ci sono titoli prioritari da aggiornare.','✓');return;}queuePublicMetadata('series',seriesTargets,{force:true,silent:false});queuePublicMetadata('movie',movieTargets,{force:true,silent:false});showToast('Aggiornamento avviato',`${seriesTargets.length+movieTargets.length} titoli in coda.`,'↻',3500);});
    $('#requestNotif')?.addEventListener('click',requestNotifications);
    $('#changePassword')?.addEventListener('click',showChangePassword);
    $('#logoutAccount')?.addEventListener('click',()=>{WatchverseAuth.signOut();state.authenticated=false;state.profileSelected=false;state.profileId=null;localStorage.removeItem('watchverse.currentProfile');showLoginScreen();});
    $('#clearProfile')?.addEventListener('click',async()=>{if(confirm('Eliminare tutti i dati del profilo corrente? Prima è consigliato un backup.')){for(const store of ['series','movies','progress','imports'])await dbClearProfile(store);state.settings.demoSeeded=false;saveSettings();await reloadData();showToast('Profilo svuotato','');renderSettings();}});
  }

  function switchSetting(key,title,desc){return `<div class="switch-row"><div><strong>${esc(title)}</strong><br><small style="color:var(--muted)">${esc(desc)}</small></div><label class="switch"><input type="checkbox" data-setting-switch="${key}" ${state.settings[key]?'checked':''}><span class="slider"></span></label></div>`;}
  function handleAvatarUpload(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>1_500_000){showToast('Immagine troppo grande','Scegli un file sotto 1,5 MB.','!');return;}const p=state.profiles.find(x=>x.id===state.pendingAvatarProfileId);if(!p)return;const reader=new FileReader();reader.onload=()=>{p.avatarType='image';p.avatarValue=reader.result;p.updatedAt=new Date().toISOString();saveProfiles();updateProfileEntryPoints();showToast('Avatar aggiornato',p.name);if(state.profileSelected&&p.id===state.profileId)renderSettings();};reader.readAsDataURL(file);}
  function showPinManager(profile){
    if(!profile.pinHash){openModal('Crea PIN',`<p>Il PIN è facoltativo. Verrà richiesto solo quando si apre il profilo ${esc(profile.name)}.</p><div class="form-grid"><div class="form-field"><label for="newPin">Nuovo PIN</label><input id="newPin" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 cifre"></div><div class="form-field"><label for="newPin2">Ripeti PIN</label><input id="newPin2" type="password" inputmode="numeric" maxlength="6"></div></div>`,`<button class="ghost" id="cancelPin">Annulla</button><button class="primary" id="savePin">Crea PIN</button>`);$('#cancelPin').addEventListener('click',closeModal);$('#savePin').addEventListener('click',async()=>{const pin=$('#newPin').value;if(!/^\d{4,6}$/.test(pin)){showToast('PIN non valido','Usa 4–6 cifre.','!');return;}if(pin!==$('#newPin2').value){showToast('I PIN non coincidono','','!');return;}await setProfilePin(profile,pin);closeModal();showToast('PIN creato',profile.name);renderSettings();});return;}
    openModal('Gestisci PIN',`<div class="profile-actions-list"><div class="profile-action-row"><div><strong>Modifica PIN</strong><p>Richiede il PIN attuale.</p></div><button class="secondary" id="changePinAction">Modifica</button></div><div class="profile-action-row"><div><strong>Elimina PIN</strong><p>Richiede la password dell’account.</p></div><button class="danger-button" id="removePinAction">Elimina</button></div><div class="profile-action-row"><div><strong>PIN dimenticato</strong><p>Reimpostalo verificando l’account familiare.</p></div><button class="ghost" id="recoverPinAction">Recupera</button></div></div>`);$('#changePinAction').addEventListener('click',()=>showChangePin(profile));$('#removePinAction').addEventListener('click',()=>showRemovePin(profile));$('#recoverPinAction').addEventListener('click',()=>showPinRecovery(profile,false));
  }
  function showChangePin(profile){openModal('Modifica PIN',`<div class="form-grid"><div class="form-field full"><label for="currentPin">PIN attuale</label><input id="currentPin" type="password" inputmode="numeric" maxlength="6"></div><div class="form-field"><label for="changedPin">Nuovo PIN</label><input id="changedPin" type="password" inputmode="numeric" maxlength="6"></div><div class="form-field"><label for="changedPin2">Ripeti PIN</label><input id="changedPin2" type="password" inputmode="numeric" maxlength="6"></div></div>`,`<button class="primary" id="confirmChangePin">Salva</button>`);$('#confirmChangePin').addEventListener('click',async()=>{if(!(await verifyProfilePin(profile,$('#currentPin').value))){showToast('PIN attuale errato','','!');return;}const pin=$('#changedPin').value;if(!/^\d{4,6}$/.test(pin)||pin!==$('#changedPin2').value){showToast('Nuovo PIN non valido','Controlla le due copie.','!');return;}await setProfilePin(profile,pin);closeModal();showToast('PIN modificato',profile.name);renderSettings();});}
  function showRemovePin(profile){openModal('Elimina PIN',`<p>Inserisci la password dell’account familiare per rimuovere il PIN di ${esc(profile.name)}.</p><div class="form-field"><label for="removePinPassword">Password account</label><input id="removePinPassword" type="password" autocomplete="current-password"></div>`,`<button class="danger-button" id="confirmRemovePin">Elimina PIN</button>`);$('#confirmRemovePin').addEventListener('click',async()=>{if(!(await WatchverseAuth.verifyPassword($('#removePinPassword').value))){showToast('Password non corretta','','!');return;}profile.pinHash=null;profile.pinSalt=null;saveProfiles();closeModal();showToast('PIN eliminato',profile.name);renderSettings();});}
  function showPinRecovery(profile,fromGate=false){openModal('Recupera PIN',`<p>Per proteggere il profilo, verifica la password dell’account principale.</p><div class="form-field"><label for="recoverPinPassword">Password account</label><input id="recoverPinPassword" type="password" autocomplete="current-password"></div><div class="form-grid" style="margin-top:12px"><div class="form-field"><label for="recoveredPin">Nuovo PIN, facoltativo</label><input id="recoveredPin" type="password" inputmode="numeric" maxlength="6" placeholder="Lascia vuoto per eliminarlo"></div><div class="form-field"><label for="recoveredPin2">Ripeti nuovo PIN</label><input id="recoveredPin2" type="password" inputmode="numeric" maxlength="6"></div></div>`,`<button class="primary" id="confirmPinRecovery">Conferma</button>`);$('#confirmPinRecovery').addEventListener('click',async()=>{if(!(await WatchverseAuth.verifyPassword($('#recoverPinPassword').value))){showToast('Password non corretta','','!');return;}const pin=$('#recoveredPin').value;if(pin&&(!/^\d{4,6}$/.test(pin)||pin!==$('#recoveredPin2').value)){showToast('Nuovo PIN non valido','Controlla le due copie.','!');return;}if(pin)await setProfilePin(profile,pin);else{profile.pinHash=null;profile.pinSalt=null;saveProfiles();}closeModal();showToast(pin?'PIN reimpostato':'PIN eliminato',profile.name);if(fromGate)showProfileGate();else renderSettings();});}
  function showChangePassword(){openModal('Cambia password',`<div class="form-grid"><div class="form-field full"><label for="currentAccountPassword">Password attuale</label><input id="currentAccountPassword" type="password" autocomplete="current-password"></div><div class="form-field"><label for="newAccountPassword">Nuova password</label><input id="newAccountPassword" type="password" minlength="6" autocomplete="new-password"></div><div class="form-field"><label for="newAccountPassword2">Ripeti password</label><input id="newAccountPassword2" type="password" minlength="6" autocomplete="new-password"></div></div>`,`<button class="primary" id="confirmPasswordChange">Cambia password</button>`);$('#confirmPasswordChange').addEventListener('click',async()=>{if($('#newAccountPassword').value!==$('#newAccountPassword2').value){showToast('Le password non coincidono','','!');return;}try{await WatchverseAuth.changePassword($('#currentAccountPassword').value,$('#newAccountPassword').value);closeModal();showToast('Password aggiornata','');}catch(e){showToast('Modifica non riuscita',e.message,'!');}});}
  function showProfileSwitcher(){showProfileGate();}
  function showProfileManager(){openModal('Gestisci profili',`<p class="notice">Ogni profilo ha libreria, preferiti, rating, statistiche e PIN indipendenti.</p><div class="search-results">${state.profiles.map(p=>`<article class="search-result">${avatarHtml(p)}<div><h3>${esc(p.name)}</h3><p>${p.role==='owner'?'Profilo proprietario · ':''}${p.pinHash?'PIN attivo':'Nessun PIN'}</p></div><div class="hero-actions"><button class="secondary" data-open-profile="${p.id}" ${p.id===state.profileId?'disabled':''}>Apri</button>${p.role!=='owner'?`<button class="danger-button" data-delete-profile="${p.id}">Elimina</button>`:''}</div></article>`).join('')}</div>`,`<button class="secondary" id="createProfile">＋ Nuovo profilo</button>`);$('#createProfile').addEventListener('click',showCreateProfile);$$('[data-open-profile]').forEach(b=>b.addEventListener('click',()=>{closeModal();showProfileGate();}));$$('[data-delete-profile]').forEach(b=>b.addEventListener('click',()=>confirmDeleteProfile(b.dataset.deleteProfile)));}
  function showCreateProfile(){const emojis=['🍿','📺','⭐','🎮','📚','🌙'];openModal('Nuovo profilo',`<p>Il nuovo profilo nasce senza PIN. Potrai aggiungerlo dalle sue impostazioni.</p><div class="form-field"><label for="newProfileName">Nome</label><input id="newProfileName" type="text" maxlength="30" placeholder="Nome profilo"></div><div class="avatar-picker">${emojis.map((e,i)=>`<button type="button" class="avatar-option ${i===0?'active':''}" data-new-avatar="${e}" aria-label="Usa avatar ${e}">${e}</button>`).join('')}</div>`,`<button class="ghost" id="cancelNewProfile">Annulla</button><button class="primary" id="saveNewProfile">Crea</button>`);let selected=emojis[0];$$('[data-new-avatar]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.newAvatar;$$('[data-new-avatar]').forEach(x=>x.classList.toggle('active',x===b));}));$('#cancelNewProfile').addEventListener('click',closeModal);$('#saveNewProfile').addEventListener('click',()=>{const name=$('#newProfileName').value.trim();if(!name){showToast('Inserisci un nome','','!');return;}const p={id:uid('profile'),name,initial:name[0].toUpperCase(),role:'member',avatarType:'emoji',avatarValue:selected,pinHash:null,pinSalt:null,createdAt:new Date().toISOString()};state.profiles.push(p);saveProfiles();closeModal();showToast('Profilo creato',name);renderSettings();});}
  function confirmDeleteProfile(id){const p=state.profiles.find(x=>x.id===id);if(!p)return;openModal(`Elimina ${p.name}`,`<p class="notice danger">Verranno eliminati film, serie, rating e cronologia del profilo. L’operazione non è annullabile.</p><div class="form-field"><label for="deleteProfilePassword">Password account</label><input id="deleteProfilePassword" type="password"></div>`,`<button class="danger-button" id="confirmProfileDeletion">Elimina definitivamente</button>`);$('#confirmProfileDeletion').addEventListener('click',async()=>{if(!(await WatchverseAuth.verifyPassword($('#deleteProfilePassword').value))){showToast('Password non corretta','','!');return;}for(const store of ['series','movies','progress','imports'])await dbClearSpecificProfile(store,id);state.profiles=state.profiles.filter(x=>x.id!==id);saveProfiles();closeModal();showToast('Profilo eliminato',p.name);renderSettings();});}
  async function dbClearSpecificProfile(store,profileId){if(state.db?.memory){for(const [id,value] of memoryStores[store])if(value.profileId===profileId)memoryStores[store].delete(id);return;}const all=await dbGetAll(store);return new Promise((resolve,reject)=>{const tx=state.db.transaction(store,'readwrite'),os=tx.objectStore(store);all.filter(x=>x.profileId===profileId).forEach(x=>os.delete(x.id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
  async function attemptProfileSwitch(id){closeModal();showProfileGate();}

  async function requestNotifications(){
    if(!('Notification'in window)){showToast('Notifiche non supportate','Il browser non espone questa funzione.','!');return;}
    const permission=await Notification.requestPermission();state.settings.browserNotifications=permission==='granted';saveSettings();showToast(permission==='granted'?'Notifiche attivate':'Notifiche non attivate',permission==='granted'?'Riceverai avvisi quando Watchverse rileva nuove uscite.':'Puoi cambiare il permesso nelle impostazioni del browser.',permission==='granted'?'🔔':'!');if(permission==='granted')notifyUpcoming();
  }
    async function notifyUpcoming(){if(Notification.permission!=='granted'||!state.settings.notifyNewEpisodes)return;const n=state.notifications[0];if(!n)return;const icon=n.poster||'assets/brand/watchverse-dragon-w.svg';try{const reg=await navigator.serviceWorker?.ready;if(reg)await reg.showNotification(n.title,{body:`${n.episodeLine || ''}\n${n.body || ''}`,icon,badge:'assets/brand/watchverse-dragon-w.svg',tag:n.id,data:{url:n.route}});else new Notification(n.title,{body:`${n.episodeLine || ''}\n${n.body || ''}`,icon});}catch{new Notification(n.title,{body:n.body});}}
  function showNotifications(){openModal('Notifiche',state.notifications.length?`<div class="notification-list">${state.notifications.map(n=>`<a class="notification-item" href="${n.route}"><div class="notification-poster" style="background:${n.posterGradient||gradient(n.seriesTitle||n.title)}">${n.poster?`<img src="${esc(n.poster)}" alt="Locandina di ${esc(n.seriesTitle||'serie')}" loading="lazy" decoding="async">`:`<span>${esc((n.seriesTitle||'TV').slice(0,2))}</span>`}</div><div class="notification-copy"><span class="result-kicker">Calendario serie</span><h3>${esc(n.title)}</h3><p class="notification-episode">${esc(n.episodeLine||n.seriesTitle||'')}</p><p class="notification-schedule-line">${esc(n.originalLine||'')}</p><p class="notification-schedule-line italy">${esc(n.italyLine||'')}</p></div><span class="notification-arrow">→</span></a>`).join('')}</div>`:'<div class="empty-state"><div class="empty-icon">🔕</div><h3>Nessun nuovo avviso</h3><p>Il calendario è aggiornato.</p></div>');}
  async function installApp(){if(state.deferredInstall){state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$('#installButton')?.classList.add('hidden');}else showToast('Installazione PWA','Apri il menu del browser e scegli “Installa app” o “Aggiungi a schermata Home”.','⇩');}
  function showQuickAdd(){openModal('Aggiungi rapidamente',`<div class="settings-grid"><a class="settings-card" data-quick-nav href="#/search"><h3>⌕ Cerca online</h3><p>Film, serie e persone con metadati italiani.</p></a><a class="settings-card" data-quick-nav href="#/import"><h3>⇧ Importa file</h3><p>CSV, JSON o ZIP della tua vecchia libreria.</p></a></div>`);$$('[data-quick-nav]').forEach(link=>link.addEventListener('click',()=>closeModal()));}

  function hideAppShell() {
    const app = $('#app');
    app.classList.add('hidden'); app.setAttribute('aria-hidden', 'true'); $('#aivengersButton')?.classList.add('hidden'); closeAivengers(); updateBackToTopButton();
  }
  function showAppShell() {
    const app = $('#app');
    app.classList.remove('hidden'); app.setAttribute('aria-hidden', 'false');
    $('#authRoot').innerHTML = ''; $('#aivengersButton')?.classList.remove('hidden'); applyAppearanceSettings(); applySidebarState(); updateProfileEntryPoints(); updateBackToTopButton();
  }
  function authBrand(subtitle) {
    return `<div class="auth-brand"><img class="auth-wordmark" src="assets/brand/watchverse-dragon-wordmark.svg" alt="Watchverse. Scegli cosa guardare. Ricorda cosa hai visto."><p class="auth-subtitle">${esc(subtitle)}</p></div>`;
  }
  function showSetupScreen() {
    hideAppShell();
    const d = WatchverseAuth.defaults;
    $('#authRoot').innerHTML = `<section class="auth-shell"><div class="auth-card">${authBrand('Configura il tuo account familiare')}
      <h2>Primo accesso</h2><p>L’account contiene profili familiari separati. Scegli una password nuova e sicura: non viene salvata in chiaro.</p>
      <form id="setupForm" class="auth-form">
        <div class="form-field"><label for="setupUsername">Nome utente</label><input id="setupUsername" autocomplete="username" value="${esc(d.username)}" required></div>
        <div class="form-field"><label for="setupEmail">Email di recupero</label><input id="setupEmail" type="email" autocomplete="email" value="${esc(d.email)}" required></div>
        <div class="form-field"><label for="setupPassword">Nuova password</label><input id="setupPassword" type="password" autocomplete="new-password" minlength="6" required><small>Almeno 6 caratteri. Non sono richiesti maiuscole, numeri o simboli.</small></div>
        <div class="form-field"><label for="setupPassword2">Ripeti la password</label><input id="setupPassword2" type="password" autocomplete="new-password" minlength="6" required></div>
        <button class="primary" type="submit">Crea account</button><div id="authMessage" class="auth-message" role="alert"></div>
      </form><p class="auth-footnote">In questa versione i dati restano nel browser. Il pacchetto include la configurazione per attivare in seguito autenticazione e recupero email tramite Supabase.</p>
    </div></section>`;
    $('#setupForm').addEventListener('submit', async e => {
      e.preventDefault(); const msg=$('#authMessage'); msg.textContent='';
      const password=$('#setupPassword').value, confirm=$('#setupPassword2').value;
      if(password!==confirm){msg.textContent='Le due password non coincidono.';return;}
      try{
        await WatchverseAuth.setup({username:$('#setupUsername').value,email:$('#setupEmail').value,password});
        await WatchverseAuth.signIn($('#setupUsername').value,password,true); state.authenticated=true; showProfileGate();
      }catch(err){msg.textContent=err.message;}
    });
  }
  function showLoginScreen(message='') {
    hideAppShell(); const account=WatchverseAuth.readAccount(); if(!account){showSetupScreen();return;}
    $('#authRoot').innerHTML = `<section class="auth-shell"><div class="auth-card">${authBrand('La tua libreria privata')}
      <h2>Accedi</h2><p>Un solo account familiare, con librerie separate per ogni profilo.</p>
      <form id="loginForm" class="auth-form">
        <div class="form-field"><label for="loginUser">Nome utente</label><input id="loginUser" autocomplete="off" data-lpignore="true" data-1p-ignore="true" placeholder="Inserisci il nome utente" value="" required></div>
        <div class="form-field"><label for="loginPassword">Password</label><div class="password-field"><input id="loginPassword" type="password" autocomplete="off" data-lpignore="true" data-1p-ignore="true" required autofocus><button id="toggleLoginPassword" class="password-toggle" type="button" aria-label="Mostra password" title="Mostra password" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg><span class="sr-only">Mostra password</span></button></div></div>
        <div class="auth-row"><label class="auth-check"><input id="rememberLogin" type="checkbox" checked> Ricordami su questo dispositivo</label><button id="forgotPassword" class="auth-link" type="button">Password dimenticata?</button></div>
        <button class="primary" type="submit">Accedi</button><div id="authMessage" class="auth-message" role="alert">${esc(message)}</div>
      </form>
    </div></section>`;
    $('#forgotPassword').addEventListener('click',showForgotPasswordScreen);
    $('#toggleLoginPassword').addEventListener('click',()=>{const input=$('#loginPassword');const button=$('#toggleLoginPassword');const visible=input.type==='text';input.type=visible?'password':'text';const nextLabel=visible?'Mostra password':'Nascondi password';button.setAttribute('aria-label',nextLabel);button.title=nextLabel;button.setAttribute('aria-pressed',String(!visible));button.innerHTML=visible?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg><span class="sr-only">Mostra password</span>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.1 3.5M6.2 6.9C3.9 8.3 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 3.7-.7M10 10a2.8 2.8 0 0 0 4 4"/></svg><span class="sr-only">Nascondi password</span>';input.focus();});
    requestAnimationFrame(()=>{const input=$('#loginUser');if(input)input.value='';});
    $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('#authMessage');msg.textContent='';try{await WatchverseAuth.signIn($('#loginUser').value,$('#loginPassword').value,$('#rememberLogin').checked);state.authenticated=true;showProfileGate();}catch(err){msg.textContent=err.message;}});
  }
  function showForgotPasswordScreen() {
    hideAppShell(); const cloud=WatchverseAuth.cloudConfigured();
    $('#authRoot').innerHTML = `<section class="auth-shell"><div class="auth-card">${authBrand('Recupero accesso')}
      <h2>Reimposta password</h2>${cloud?'<p>Riceverai un link monouso all’indirizzo email dell’account.</p>':'<p class="notice warning">Il recupero via email reale richiede la configurazione cloud. Finché l’app è locale puoi reimpostare la password solo da questo browser, confermando l’email registrata.</p>'}
      <form id="resetForm" class="auth-form">
        <div class="form-field"><label for="resetEmail">Email di recupero</label><input id="resetEmail" type="email" autocomplete="email" value="" required></div>
        ${cloud?'':`<div class="form-field"><label for="resetPassword">Nuova password</label><input id="resetPassword" type="password" minlength="6" required></div><div class="form-field"><label for="resetPassword2">Ripeti la password</label><input id="resetPassword2" type="password" minlength="6" required></div>`}
        <button class="primary" type="submit">${cloud?'Invia email di recupero':'Reimposta in locale'}</button><button id="backLogin" class="ghost" type="button">Torna al login</button><div id="authMessage" class="auth-message" role="alert"></div>
      </form></div></section>`;
    $('#backLogin').addEventListener('click',()=>showLoginScreen());
    $('#resetForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('#authMessage');msg.textContent='';try{if(cloud){await WatchverseAuth.sendRecoveryEmail($('#resetEmail').value);msg.style.color='var(--success)';msg.textContent='Email inviata. Controlla anche la cartella Spam.';}else{if($('#resetPassword').value!==$('#resetPassword2').value)throw new Error('Le due password non coincidono.');await WatchverseAuth.localReset($('#resetEmail').value,$('#resetPassword').value);showLoginScreen('Password reimpostata. Ora puoi accedere.');}}catch(err){msg.textContent=err.message;}});
  }
  function showProfileGate() {
    state.profileSelected=false; hideAppShell();
    $('#authRoot').innerHTML = `<section class="profile-gate"><div class="profile-gate-inner"><img class="profile-brand-mark" src="assets/brand/watchverse-dragon-w.svg" alt="Watchverse"><h1>Chi sta guardando?</h1><p>Scegli il profilo. Le librerie, i voti e le statistiche restano separati.</p>
      <div class="profile-choice-grid">${state.profiles.map(p=>`<button class="profile-choice" data-profile-choice="${esc(p.id)}">${avatarHtml(p,'avatar-large')}<strong>${esc(p.name)}</strong><small>${p.pinHash?'Protetto da PIN':'Nessun PIN'}</small></button>`).join('')}</div>
      <div class="profile-gate-actions"><button id="logoutFromGate" class="ghost">Esci dall’account</button></div></div></section>`;
    $$('[data-profile-choice]').forEach(b=>b.addEventListener('click',()=>requestProfileAccess(b.dataset.profileChoice)));
    $('#logoutFromGate').addEventListener('click',()=>{WatchverseAuth.signOut();state.authenticated=false;state.profileId=null;localStorage.removeItem('watchverse.currentProfile');showLoginScreen();});
  }
  async function requestProfileAccess(id) {
    const p=state.profiles.find(x=>x.id===id); if(!p)return;
    if(!p.pinHash){await activateProfile(id);return;}
    $('#authRoot').innerHTML = `<section class="profile-gate"><div class="auth-card" style="text-align:center">${avatarHtml(p,'avatar-large')}<h2 style="margin-top:16px">PIN di ${esc(p.name)}</h2><p>Inserisci il PIN del profilo.</p><form id="gatePinForm" class="auth-form"><label class="sr-only" for="gatePin">PIN del profilo ${esc(p.name)}</label><input id="gatePin" type="password" inputmode="numeric" maxlength="6" autocomplete="off" autofocus><button class="primary">Apri profilo</button><button id="gatePinForgot" class="auth-link" type="button">PIN dimenticato?</button><button id="gatePinBack" class="ghost" type="button">Indietro</button><div id="authMessage" class="auth-message" role="alert"></div></form></div></section>`;
    $('#gatePinBack').addEventListener('click',showProfileGate);
    $('#gatePinForgot').addEventListener('click',()=>showPinRecovery(p,true));
    $('#gatePinForm').addEventListener('submit',async e=>{e.preventDefault();const ok=await verifyProfilePin(p,$('#gatePin').value);if(ok)await activateProfile(id);else $('#authMessage').textContent='PIN errato.';});
  }
  async function activateProfile(id) {
    const profile = state.profiles.find(item => item.id === id);
    const loaderToken = showBlockingLoader(`Apro il profilo di ${profile?.name || 'Watchverse'}`, 'Carico libreria, preferenze e catalogo condiviso.');
    await nextPaint();
    try {
      state.profileId=id;state.profileSelected=true;localStorage.setItem('watchverse.currentProfile',id);
      loadSettings();loadDefaultSourceStatus();
      void window.WatchverseCloudSync?.saveSettings(profile, state.settings).catch(error => console.warn('Watchverse cloud settings sync:', error));
      state.seriesFilter=state.settings.seriesFilter||'unwatched';state.movieFilter=state.settings.movieFilter||'watched';
      state.seriesSort=state.settings.seriesSort||'latestEpisode';state.movieSort=state.settings.movieSort||'recent';
      state.seriesVisible=60;state.movieVisible=60;state.metadataAutoBudget=36;state.metadataQueue=[];state.metadataQueuedIds.clear();state.metadataBackgroundStarted=false;state.metadataCompletedThisSession=0;state.metadataFailedThisSession=0;state.metadataRecoveryScheduled=false;state.metadataRecoveryDone=false;
      // Dalla 2.0.3 i profili partono vuoti. Rimuove automaticamente eventuali demo create da versioni precedenti.
      if(state.settings.demoSeeded){
        for(const store of ['series','movies','progress','imports']) await dbClearProfile(store);
        state.settings.demoSeeded=false;saveSettings();
      }
      // Online il cloud viene riallineato prima di leggere la cache IndexedDB;
      // offline la cache resta il fallback per permettere comunque l'accesso.
      if (window.WatchverseCloudSync?.isEnabled()) await syncCloudProfile(profile);
      await reloadData();
      showAppShell();
      renderNav('home');
      state.lastRenderedRoute = '';
      location.hash='#/home';
      await route({ loader:false });
      if (window.WatchverseCloudSync?.isEnabled()) showToast('Sincronizzazione in corso', 'La libreria si aggiorna in background.', '↻', 7000, { kind:'sync' });
      idle(async () => {
        let backgroundProfile = state.profiles.find(item => item.id === id);
        if (!backgroundProfile || state.profileId !== id) return;
        await syncCloudProfile(backgroundProfile, { onlyProgress: true });
        if (state.profileId === id) {
          await reloadData();
          await route({ loader:false, preserveScroll:true });
        }
      });
      idle(scheduleBackgroundMetadataSync);
      idle(()=>syncDefaultPublicSources(false));
    } finally {
      hideBlockingLoader(loaderToken, 480);
    }
  }
  function bindShellEvents() {
    if(state.shellBound)return;
    state.shellBound=true;
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a.nav-item[href^="#/"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const targetPage = link.getAttribute('href').replace(/^#\//, '').split(/[/?]/)[0] || 'home';
      if (targetPage === parseRoute().page || state.navigationLoaderToken) return;
      const [title, detail] = loaderCopyForRoute({ page: targetPage });
      state.navigationLoaderToken = showBlockingLoader(title, detail);
    });
    window.addEventListener('hashchange',()=>{if(state.profileSelected)route();});
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.deferredInstall=event;$('#installButton')?.classList.remove('hidden');});
    $('#skipToContent')?.addEventListener('click',()=>$('#main')?.focus({preventScroll:false}));
    $('#installButton')?.addEventListener('click',installApp);
    $('#metadataStatusButton')?.addEventListener('click',showMetadataStatus);
    $('#notificationButton')?.addEventListener('click',showNotifications);
    $('#quickAddButton')?.addEventListener('click',showQuickAdd);
    $('#sidebarProfileButton')?.addEventListener('click',()=>{state.profileSettingsTab='identity';location.hash='#/settings';});
    $('#mobileProfileButton')?.addEventListener('click',()=>{state.profileSettingsTab='identity';location.hash='#/settings';});
    $('#brandSwitchProfile')?.addEventListener('click',showProfileGate);
    $('#sidebarToggle')?.addEventListener('click',()=>{state.sidebarCollapsed=!state.sidebarCollapsed;localStorage.setItem('watchverse.sidebarCollapsed',state.sidebarCollapsed?'1':'0');applySidebarState();});
    $('#backToTopButton')?.addEventListener('click',scrollBackToTop);
    window.addEventListener('scroll',updateBackToTopButton,{passive:true});
    $('#aivengersButton')?.addEventListener('click',()=>$('#aivengersPanel')?.classList.contains('is-open')?closeAivengers():openAivengers());
    $('#aivengersClose')?.addEventListener('click',closeAivengers);
    $('#aivengersForm')?.addEventListener('submit',event=>{event.preventDefault();submitAivengersQuestion($('#aivengersInput')?.value);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#aivengersPanel')?.classList.contains('is-open'))closeAivengers();});
    $('#importInput')?.addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';await handleImportFile(file);});
    $('#backupInput')?.addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.name.toLowerCase().endsWith('.zip')){const entries=await readZipEntries(file);const entry=entries.find(item=>item.name.endsWith('backup.json'));if(!entry)throw new Error('backup.json non trovato nello ZIP.');await restoreBackupData(JSON.parse(entry.text()));}else await restoreBackupData(JSON.parse(await file.text()));}catch(error){showToast('Ripristino non riuscito',error.message,'!');}});
    $('#avatarInput')?.addEventListener('change',handleAvatarUpload);
  }

  async function bootstrapCloudProfilesWithRetry(maxAttempts = 4) {
    const sync = window.WatchverseCloudSync;
    if (!sync?.isEnabled()) return null;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const profiles = await sync.bootstrapProfiles(state.profiles);
        if (Array.isArray(profiles) && profiles.length && profiles.every(profile => profile.cloudId)) return profiles;
      } catch (error) {
        console.warn(`Watchverse cloud profile bootstrap attempt ${attempt + 1}:`, error);
      }
      if (attempt < maxAttempts - 1) await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
    return null;
  }


  async function init(){
    try{
      applyAppearanceSettings();
      state.db=await openDB();
      // Completa i campi dei profili creati con versioni precedenti.
      state.profiles=state.profiles.map((p,i)=>Object.assign({role:i===0?'owner':'member',avatarType:'emoji',avatarValue:i===0?'🎬':'📚',pinHash:null,pinSalt:null},p));
      if(!state.profiles.some(p=>p.name==='Elena') && !storedProfiles) state.profiles=structuredClone(DEFAULT_PROFILES);
      saveProfiles();bindShellEvents();
      if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
      if(!WatchverseAuth.readAccount()){showSetupScreen();return;}
      if(!(await WatchverseAuth.restoreSession())){showLoginScreen();return;}
      void bootstrapCloudProfilesWithRetry(1).then(cloudProfiles => {
        if (Array.isArray(cloudProfiles) && cloudProfiles.length) { state.profiles = cloudProfiles; saveProfiles(false); if (!state.profileSelected) showProfileGate(); }
      }).catch(error => console.warn('Watchverse cloud profile bootstrap:', error));
      state.authenticated=true;showProfileGate();
    }catch(e){console.error(e);document.body.innerHTML=`<main style="padding:40px;font-family:system-ui;color:white;background:#111;min-height:100vh"><h1>Watchverse non è riuscita ad avviarsi</h1><p>${esc(e.message)}</p><button id="retryApp" type="button">Riprova</button></main>`;$('#retryApp')?.addEventListener('click',()=>location.reload());}
  }

  init();
})();
