# WVERSE-96 — Risultati unificati e deduplicati

## Analisi funzionale

I risultati locali e pubblici devono essere presentati in un unico elenco, senza duplicati. Per un titolo già in libreria deve essere disponibile l'apertura del dettaglio; per un titolo nuovo l'azione deve consentire l'aggiunta al profilo.

## Analisi tecnica

La deduplicazione usa identificativi stabili delle fonti e, come fallback, tipo, titolo e anno normalizzati. Il catalogo comune viene riutilizzato mentre l'azione di aggiunta crea o aggiorna solo il record personale del profilo.
