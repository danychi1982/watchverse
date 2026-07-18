# WVERSE-100 — Raccomandazioni senza titoli già presenti

## Analisi funzionale

La Story espone suggerimenti utili che non siano già presenti nella libreria del profilo corrente. Il flusso raccoglie candidati da fonti locali o pubbliche, elimina i titoli già presenti per chiave normalizzata e mostra una rail con stato di caricamento, risultati, assenza di risultati ed errore. Un suggerimento deve poter aprire il dettaglio o la fonte prevista senza diventare automaticamente un record della libreria.

Il filtro di esclusione considera titolo, tipo e identificativi pubblici quando disponibili; non deve eliminare due titoli distinti solo perché condividono una stringa breve. Il refresh della libreria o una modifica di profilo deve ricalcolare i suggerimenti.

## Analisi tecnica

- Usare le collezioni del profilo corrente e le funzioni di normalizzazione già presenti in `app.js` per costruire l'insieme delle chiavi escluse.
- Integrare il risultato con i flussi di ricerca/metadati di `public-metadata.js`, senza avviare una sincronizzazione cloud completa a ogni apertura della Home.
- La cache `viewCache.searchRecommendations` è valida solo per l'attuale `dataRevision`; una modifica cloud o locale deve invalidarla.
- Limitare numero, duplicati, richieste concorrenti e dati necessari al primo paint; il caricamento differito non deve sovrascrivere una rotta successiva.

## Stati, errori e dipendenze

Stati: shell, caricamento differito, risultati, nessun candidato, errore fonte e risultato parziale. Errori di rete o provider devono lasciare visibile la Home e mostrare un feedback non bloccante.

Dipendenze: dati `series`/`movies` del profilo, ricerca pubblica, metadati e navigazione con `navigationRequestId`. La raccomandazione non deve includere titoli del profilo errato né dati personali di altri profili.

## Criteri tecnici

La verifica deve dimostrare esclusione dei titoli presenti, deduplicazione stabile, comportamento a catalogo vuoto, errore provider e invalidazione dopo modifica della libreria. I risultati devono rimanere coerenti dopo refresh.

