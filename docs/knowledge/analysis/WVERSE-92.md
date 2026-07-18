# WVERSE-92 — Ricerca globale di film e serie

## Analisi funzionale

La ricerca deve interrogare prima il catalogo locale e poi le fonti pubbliche quando mancano dati sufficienti. I risultati catalogabili sono limitati a film e serie; la digitazione deve mantenere focus e tastiera, soprattutto su mobile.

## Analisi tecnica

La ricerca usa catalogo condiviso, identificativi delle fonti e normalizzazione titolo/anno. `app.js` gestisce debounce, rendering parziale, focus e rotta; i proxy pubblici evitano segreti nel browser. Le callback obsolete non devono sostituire la pagina richiesta dall'utente.
