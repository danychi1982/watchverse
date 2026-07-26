# WVERSE-147 — Bootstrap e caricamento progressivo della Home

## Analisi funzionale

La Home deve mostrare rapidamente una shell coerente con il profilo corrente, senza flash della Home vuota o della composizione demo. Il bootstrap è diviso in due fasi: sessione/profilo e proiezione minima delle sezioni visibili; poi locandine non visibili, metadati, rail, progressi e calendario vengono caricati in background.

La navigazione resta sempre disponibile. Un errore del caricamento differito deve produrre un feedback locale senza cancellare i dati già mostrati; un refresh cloud deve aggiornare la Home visibile senza ripresentare la shell iniziale.

## Analisi tecnica

- Coordinare `restoreSession`, bootstrap profili, hydration cloud e primo rendering in `app.js`.
- Usare `initialCloudHydrationPending`, `dataRevision`, `viewCache` e gli identificativi di richiesta per impedire che una risposta obsoleta sostituisca una vista nuova.
- Dedicare priorità alla proiezione minima; limitare concorrenza e budget delle richieste di metadati e applicare rendering differito/idle scheduling per rail e sezioni costose.
- Misurare almeno tempo apertura profilo, LCP e TTI; il service worker può fornire asset statici ma non deve trasformare la cache in fonte primaria dei dati personali.

## Stati, errori e dipendenze

Stati: inizializzazione, profilo in caricamento, shell pronta, hydration in corso, Home completa, errore parziale e sessione scaduta. Dipendenze: autenticazione, profilo corrente, `cloud-sync.js`, metadati pubblici, `viewCache`, routing e service worker.

## Criteri tecnici

Verificare cache vuota, cache presente, rete lenta/assente, refresh durante hydration, navigazione prima del completamento, errore metadati e refresh cloud della Home già visibile. Il primo paint non deve attendere contenuti non visibili.

