# WVERSE-133 — Sincronizzazione cloud bidirezionale e conflitti

## Analisi funzionale

La sincronizzazione deve propagare modifiche locali verso Supabase e modifiche cloud verso il profilo locale, mantenendo dati coerenti per serie, film, progressi e impostazioni. In caso di modifiche concorrenti l'app deve rilevare il conflitto, applicare la strategia prevista e rendere l'esito osservabile senza perdita silenziosa.

La sincronizzazione non deve bloccare la navigazione. Un refresh manuale deve produrre feedback di avvio, avanzamento, completamento o errore; le operazioni ripetute devono essere idempotenti.

## Analisi tecnica

- `cloud-sync.js` usa `revision`, `updated_at` e `deleted_at` sui record; le chiavi uniche sono profilo/tipo/id per libreria e profilo/serie/stagione/episodio per progressi.
- Le operazioni push usano upsert; il pull deve normalizzare i payload e mantenere tombstone abbastanza a lungo da propagare una rimozione.
- Il confronto deve considerare revisione e timestamp; quando il cloud vince va registrato un record in `sync_conflicts` con store, identificativo, revisioni e risoluzione.
- Il profilo è sempre il confine di sicurezza: le policy RLS (`owns_profile`) impediscono letture o scritture incrociate.
- La coda deve deduplicare richieste, limitare concorrenza e non sovrascrivere una modifica più recente con una risposta obsoleta.

## Stati, errori e dipendenze

Stati: idle, push in corso, pull in corso, merge, conflitto rilevato, completato parziale, completato e errore recuperabile. Dipendenze: migrazione `20260712_bidirectional_sync.sql`, schema Supabase, IndexedDB/local state, profilo autenticato e refresh delle viste.

## Criteri tecnici

Verificare upsert ripetuto, modifica locale/cloud concorrente, delete/tombstone, conflitto di settings e progress, sessione scaduta, rete assente e RLS. Ogni esito deve lasciare revisioni e viste coerenti dopo un nuovo refresh.

