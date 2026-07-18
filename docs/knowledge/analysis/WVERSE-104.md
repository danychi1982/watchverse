# WVERSE-104 — Filtri per film, serie e risultati pertinenti

## Analisi funzionale

La ricerca offre i filtri `Tutti`, `Film` e `Serie TV` e limita i risultati a corrispondenze pertinenti del titolo. Persone, falsi positivi e risultati non catalogabili non devono apparire come titoli. Il cambio filtro non deve perdere focus o tastiera.

## Analisi tecnica

Il filtro viene applicato dopo la normalizzazione dei risultati del provider e prima del rendering. Il contratto deve distinguere tipo, titolo, anno e rilevanza; i test coprono query brevi, anni, omonimie, risultati locali e pubblici.
