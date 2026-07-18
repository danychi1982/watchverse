# WVERSE-72 — Progressi di serie ed episodi

## Analisi funzionale

L'utente può visualizzare e aggiornare il progresso di serie, stagioni ed episodi. L'aggiornamento deve riflettersi nelle card, nei dettagli e nelle sezioni Home pertinenti, mantenendo dati e valutazioni separati per profilo.

## Analisi tecnica

Il Front-End aggiorna stato e rendering; `cloud-sync.js` persiste progresso e ultima visione; Supabase/RLS limita le scritture al profilo corrente. Il catalogo condiviso fornisce episodi e metadati, mentre il progresso resta personale.
