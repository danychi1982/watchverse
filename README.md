# Watchverse

Watchverse è una web app privata per organizzare film, serie TV, episodi, progressi e profili familiari separati.

## In breve

- Frontend statico pubblicabile su GitHub Pages.
- Account familiare e profili Daniela/Elena tramite Supabase.
- Catalogo pubblico condiviso e dati personali separati per profilo.
- PWA responsive con importazione TV Time e backup Watchverse.

## Avvio locale

```bash
npm install
npm run serve
```

Per generare l’artefatto pubblicabile:

```bash
npm run build
```

## Struttura del codice

I file runtime frontend (`app.js`, `auth.js`, `cloud-sync.js`, `config.js`, `gdpr-import.js`, `public-metadata.js`, `accessibility-report.js` e `styles.css`) restano nella root perché `index.html` li carica direttamente e la build statica li pubblica senza bundler. In questo progetto è una scelta deliberata di semplicità, non una dimenticanza: introdurre una cartella `src/` richiederebbe un bundler o una fase di riscrittura dei percorsi senza un beneficio attuale.

- `scripts/`, `tests/`, `supabase/` e `docs/` contengono materiali di sviluppo e documentazione locale; non vengono inclusi nell'artefatto GitHub Pages.
- `assets/`: asset grafici e vendor necessari al runtime, selezionati dalla build.

## Contribuire

Le modifiche alla branch `main` sono protette dalle regole GitHub del repository. Il deploy GitHub Pages viene eseguito automaticamente dalla GitHub Action dopo un push accettato su `main`.
