# WVERSE-76 — Preferiti, watchlist e modifiche profilo

## Analisi funzionale

L'utente può aggiungere/rimuovere preferiti, modificare lo stato watchlist e aggiornare le proprie informazioni. Ogni azione deve dare feedback immediato, gestire rollback/errore e restare coerente dopo navigazione, refresh e cambio dispositivo.

## Analisi tecnica

Le preferenze e gli stati personali sono separati dal catalogo pubblico. `app.js` gestisce interazioni e viste; `cloud-sync.js` sincronizza le modifiche; Supabase/RLS applica isolamento e persistenza. La cache locale non deve diventare una fonte concorrente rispetto al cloud.
