# Attivazione cloud di Watchverse

Questa cartella contiene lo schema e il proxy TMDB necessari per la futura modalità online. La versione distribuita funziona già in locale; la sincronizzazione dei record con queste tabelle sarà collegata nella fase successiva.

## 1. Crea il progetto

1. Crea un progetto Supabase.
2. In **SQL Editor**, esegui `schema.sql`.
3. In **Authentication → Users**, crea manualmente l'utente proprietario con l'email scelta per l'account e una password nuova e robusta.
4. In **Authentication → URL Configuration**, imposta `https://danychi1982.github.io/watchverse/` come `Site URL` e aggiungilo anche tra i redirect consentiti. Il percorso `/watchverse/` è obbligatorio per GitHub Pages: senza di esso il link di recupero può finire sulla root e mostrare 404.
5. Disattiva le registrazioni pubbliche se l'app deve restare familiare.

## 2. Configura il proxy TMDB

Dalla CLI Supabase:

```bash
supabase functions deploy tmdb-proxy
supabase secrets set TMDB_READ_TOKEN="IL_TOKEN_TMDB"
```

La funzione richiede un utente Supabase autenticato e consente soltanto gli endpoint TMDB necessari all'app.

## 3. Compila `config.js`

Inserisci soltanto valori pubblici:

```js
supabaseUrl: 'https://PROJECT_REF.supabase.co',
supabaseAnonKey: 'CHIAVE_PUBLISHABLE_O_ANON',
tmdbProxyUrl: 'https://PROJECT_REF.supabase.co/functions/v1/tmdb-proxy'
publicSourcesProxyUrl: 'https://PROJECT_REF.supabase.co/functions/v1/public-sources-proxy'
```

Non inserire mai nel browser la `service_role` o il token TMDB.

## 4. Stato di questa versione

- Login Supabase, refresh sessione, cambio password e recupero email sono già predisposti in `auth.js` quando i valori di configurazione sono presenti.
- Lo schema RLS separa i dati dell'account da quelli di altri utenti.
- Il cloud Ã¨ la fonte primaria online; IndexedDB resta cache locale e fallback offline.
- Le scritture usano revisioni e timestamp. In caso di modifiche concorrenti vince la versione piÃ¹ recente e il confronto viene registrato in `sync_conflicts`.
- Per un progetto Supabase già esistente, eseguire anche `migrations/20260712_bidirectional_sync.sql` nel SQL Editor: aggiunge i campi di versione/tombstone e gli indici necessari agli upsert.
- Il proxy pubblico espone `/api/cinema` e `/api/trailer`; il trailer pubblico è un fallback e viene mostrato come trovato, non come ufficiale, quando non proviene da TMDB.
- Le cancellazioni usano tombstone (`deleted_at`) per evitare la ricomparsa di record rimossi offline.
- La funzione TMDB copre dettagli, ricerca, cast, episodi, video e disponibilitÃ  italiane tramite TMDB/JustWatch. Deve essere deployata con il secret `TMDB_READ_TOKEN`.
- Trailer e streaming usano il proxy TMDB quando configurato. Gli orari cinema restano limitati ai siti ufficiali configurati: su GitHub Pages serve ancora un endpoint server-side dedicato per superare i limiti CORS.
- Il nuovo endpoint `public-sources-proxy` fornisce il controllo cinema server-side per le sale in whitelist. Va deployato insieme a `tmdb-proxy`.
- La sincronizzazione automatica IndexedDB ↔ tabelle Supabase è la fase tecnica successiva; fino ad allora usa Backup ZIP tra dispositivi.
