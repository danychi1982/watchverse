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

## Documentazione

La documentazione tecnica è organizzata in `docs/specifications/`.

- [Documentazione di progetto](docs/specifications/DOCUMENTAZIONE_PROGETTO.md)
- [Design system](docs/specifications/DESIGN_SYSTEM.md)
- [Architettura dati](docs/specifications/ARCHITETTURA_DATI.md)
- [Backlog cloud](docs/specifications/BACKLOG_CLOUD.md)
- [Knowledge base di progetto](docs/knowledge/README.md)
- [Dichiarazione di accessibilità](docs/specifications/DICHIARAZIONE_ACCESSIBILITA.md)
- [Proposte logo](docs/specifications/LOGHI_PROPOSTE.md)
- [Preview visuale del design system](docs/design-system-preview.html)
- [Manuale operativo](docs/guides/manuale_watchverse.html)
- [Guida introduttiva](docs/guides/README_PRIMA_DI_INIZIARE.txt)
- [Changelog](docs/CHANGELOG_WATCHVERSE_2.0.txt)
- [Report WCAG completo](docs/reference/REPORT_WCAG_2.2.json)
- [Attribuzioni e licenze](docs/legal/ATTRIBUZIONI.txt)

## Struttura del codice

I file runtime frontend (`app.js`, `auth.js`, `cloud-sync.js`, `config.js`, `gdpr-import.js`, `public-metadata.js`, `accessibility-report.js` e `styles.css`) restano nella root perché `index.html` li carica direttamente e la build statica li pubblica senza bundler. In questo progetto è una scelta deliberata di semplicità, non una dimenticanza: introdurre una cartella `src/` richiederebbe un bundler o una fase di riscrittura dei percorsi senza un beneficio attuale.

- `scripts/`: build, server locale e orchestrazione test.
- `tests/`: test unitari, statici ed end-to-end.
- `assets/`: asset grafici e vendor pubblici.
- `supabase/`: schema e funzioni backend.
- `docs/`: guide, reference, specifiche, preview e materiali legali.

## Contribuire

Le modifiche alla branch `main` sono protette dalle regole GitHub del repository. Il deploy GitHub Pages viene eseguito automaticamente dalla GitHub Action dopo un push accettato su `main`.
