# Attivazione cloud di Watchverse

Questa cartella contiene lo schema e il proxy TMDB necessari per la futura modalità online. La versione distribuita funziona già in locale; la sincronizzazione dei record con queste tabelle sarà collegata nella fase successiva.

## 1. Crea il progetto

1. Crea un progetto Supabase.
2. In **SQL Editor**, esegui `schema.sql`.
3. In **Authentication → Users**, crea manualmente l'utente proprietario con l'email `daniela.chiumarulo@gmail.com` e una password nuova e robusta.
4. In **Authentication → URL Configuration**, imposta l'indirizzo HTTPS definitivo di Watchverse come `Site URL` e tra i redirect consentiti.
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
```

Non inserire mai nel browser la `service_role` o il token TMDB.

## 4. Stato di questa versione

- Login Supabase, refresh sessione, cambio password e recupero email sono già predisposti in `auth.js` quando i valori di configurazione sono presenti.
- Lo schema RLS separa i dati dell'account da quelli di altri utenti.
- La sincronizzazione automatica IndexedDB ↔ tabelle Supabase è la fase tecnica successiva; fino ad allora usa Backup ZIP tra dispositivi.
