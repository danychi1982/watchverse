# WVERSE-170 — Valutazione lazy load dei moduli con Vite

## Esito dell’analisi

Watchverse è oggi una SPA statica servita dalla root del repository: il caricamento è orchestrato da `app.js`, con moduli JavaScript globali (`auth.js`, `cloud-sync.js`, `public-metadata.js` e `gdpr-import.js`) inclusi nella pagina. Non esiste una pipeline Vite né una separazione già pronta in chunk di route.

## Decisione

Non introdurre una migrazione a Vite come correzione isolata. La migrazione cambierebbe bundling, gestione degli asset, configurazione di deploy e percorso di debug senza un beneficio verificabile per il caso d’uso corrente.

La priorità immediata è mantenere il caricamento differito già presente per le viste non iniziali e misurare il peso della pagina prima di una futura estrazione in moduli. Un’eventuale introduzione di Vite va pianificata come attività architetturale autonoma, con baseline di performance, strategia di compatibilità e piano di rollback.

## Evidenze

- `renderSearch`, `renderHome` e le viste secondarie usano caricamento differito/idle per non bloccare il primo render;
- `scripts/build.js` continua a produrre una distribuzione statica compatibile con l’ambiente attuale;
- i controlli di sintassi e la suite automatica restano eseguibili senza una toolchain aggiuntiva.

## Criterio di chiusura Jira

La valutazione è completata quando la decisione, i vincoli e i criteri per una futura migrazione sono documentati. Non è richiesto modificare il bundler nello Sprint 2.
