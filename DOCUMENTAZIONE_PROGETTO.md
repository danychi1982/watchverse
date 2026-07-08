# Watchverse - Documentazione di progetto

## Scopo

Watchverse e una web app statica per gestire una libreria personale e familiare di film e serie TV. Il progetto funziona in modalita browser locale e puo essere pubblicato su hosting statico HTTPS.

La versione locale puo usare `avvia_server.py` per esporre endpoint di supporto dedicati a trailer e programmazione cinema. La versione statica pubblicata online usa invece solo file frontend e integrazioni pubbliche compatibili con il browser.

## Struttura principale

- `index.html`: entry point dell'app.
- `app.js`: logica principale di interfaccia, libreria, metadati, temi e viste.
- `auth.js`: gestione account/profili locali e policy password.
- `gdpr-import.js`: importazione dello ZIP GDPR di TV Time.
- `public-metadata.js`: recupero e normalizzazione dei metadati pubblici.
- `styles.css`: stile globale, temi e responsive layout.
- `sw.js`: service worker per PWA/cache.
- `manifest.webmanifest`: manifest PWA.
- `assets/`: icone, screenshot, temi e librerie vendor necessarie al frontend.
- `tests/`: test automatici JavaScript/Python.
- `supabase/`: schema e funzione edge di supporto per evoluzione cloud.
- `avvia_server.py`: server locale statico con endpoint `/api/trailer` e `/api/cinema`.

## File generati ed esclusi

I seguenti file sono considerati export/build generati e non vengono versionati:

- `dist/`
- `build/`
- `out/`
- `watchverse_offline.html`
- `manuale_watchverse_singolo_file.html`

Questa scelta mantiene GitHub focalizzato sui sorgenti, sugli asset originali e sui test.

## Comandi di sviluppo

Richiede Node.js per test/build e Python 3 per il server locale.

```bash
npm run build
npm test
npm run serve
```

`npm run build` crea una cartella `dist/` pronta per hosting statico.

`npm test` esegue la suite gia presente in `tests/run-tests.sh`.

`npm run serve` avvia il server locale Python e apre l'app all'indirizzo indicato dal terminale.

## Build

La build copia in `dist/` soltanto i file necessari alla pubblicazione statica:

- HTML pubblicabili
- JavaScript frontend
- CSS
- manifest e service worker
- asset pubblici

Non copia test, documentazione sorgente, configurazioni cloud non necessarie, file monolitici generati o dati locali.

## Deploy

Il deploy Netlify usa:

- build command: `npm run build`
- publish directory: `dist`

Le regole di sicurezza HTTP e il fallback SPA sono definite in `netlify.toml`.

## Note su segreti e credenziali

Il repository non deve contenere credenziali private. Eventuali chiavi TMDB/Supabase devono essere configurate tramite ambiente o proxy sicuri, non dentro i sorgenti versionati.

