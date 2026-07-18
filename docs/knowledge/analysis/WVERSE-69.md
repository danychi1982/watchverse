# WVERSE-69 — Filtri e organizzazione della libreria

## Analisi funzionale

La libreria deve consentire di visualizzare e organizzare i contenuti con filtri coerenti per tipo, stato e ordinamento. Il cambio filtro aggiorna solo l'elenco necessario, mantiene contesto e focus e mostra uno stato vuoto comprensibile quando non ci sono risultati.

## Analisi tecnica

La logica di filtro e ordinamento risiede nello stato di `app.js`; il catalogo e i dati personali provengono dalla cache/cloud secondo il modello di `ARCHITETTURA_DATI.md`. I filtri non devono modificare i dati persistiti. QA deve verificare combinazioni, refresh, responsive e risultati vuoti.
