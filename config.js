/*
 * Configurazione Watchverse.
 * In modalità locale lascia vuoti i valori Supabase e tmdbProxyUrl.
 * Per la pubblicazione online sicura, compila i valori seguendo supabase/README.md.
 */
window.WATCHVERSE_CONFIG = Object.freeze({
  appName: 'Watchverse',
  accountUsername: 'daniela',
  recoveryEmail: 'daniela.chiumarulo@gmail.com',

  // Autenticazione cloud opzionale. La chiave anon/publishable può stare nel client;
  // la sicurezza dei dati dipende dalle policy RLS incluse nel pacchetto.
  supabaseUrl: 'https://aqphrgmnngxogqijdvpk.supabase.co',
  supabaseAnonKey: 'sb_publishable_TINmyB0UDRxG-ZpkRig8ng_MUmMOohP',
  allowCloudSignup: false,

  // URL della Supabase Edge Function tmdb-proxy, ad esempio:
  // https://<project-ref>.supabase.co/functions/v1/tmdb-proxy
  tmdbProxyUrl: '',

  // URL opzionale di un server compatibile con /api/trailer e /api/cinema.
  // In locale avvia_server.py espone automaticamente questi endpoint.
  publicSourcesProxyUrl: '',

  // Fonti pubbliche preconfigurate. Nelle schede vengono mostrati solo dati effettivi.
  defaultSources: Object.freeze({
    streamingLookup: Object.freeze({
      enabled: false,
      provider: 'JustWatch tramite TMDB',
      searchUrl: ''
    }),
    tvSchedule: Object.freeze({
      enabled: true,
      provider: 'TVmaze',
      country: 'IT',
      daysAhead: 7,
      refreshHours: 12
    }),
    cinema: Object.freeze({
      enabled: true,
      mode: 'official-sites',
      refreshHours: 12
    })
  })
});
