# WVERSE-138 — Cache offline e accesso dopo refresh

## Analisi funzionale

La cache offline deve permettere di riaprire l'app e consultare l'ultimo stato disponibile dopo refresh o temporanea assenza di rete. L'utente deve sapere se sta vedendo dati aggiornati, dati dalla cache o dati in sincronizzazione; le modifiche locali devono essere accodate e sincronizzate quando la rete torna disponibile.

La cache non è la fonte primaria: dati cloud più recenti devono prevalere secondo revisioni/timestamp e una sessione non autorizzata non deve esporre dati di un profilo differente.

## Analisi tecnica

- Mantenere separati stato di sessione, dati profilati e metadati di sincronizzazione; usare `profileId`, `revision`, `updatedAt` e tombstone.
- Al bootstrap caricare prima la proiezione locale minima, renderizzare una Home coerente e avviare hydration cloud in background.
- Invalidare `viewCache` e incrementare `dataRevision` dopo merge; le callback obsolete devono essere scartate con `navigationRequestId`.
- Gestire quota/storage non disponibile, dati corrotti, migration di schema e logout pulendo o isolando la cache del profilo.

## Stati, errori e dipendenze

Stati: cache assente, cache valida, cache stale, offline, hydration in corso, sincronizzato, conflitto e cache corrotta. Dipendenze: storage locale/IndexedDB, `cloud-sync.js`, bootstrap profilo, service worker e RLS.

## Criteri tecnici

Verificare refresh offline, riapertura con cache, ritorno online, cache di profilo diverso, dati corrotti, quota esaurita e risposta cloud più vecchia/nuova. Il primo paint non deve attendere metadati non visibili.

