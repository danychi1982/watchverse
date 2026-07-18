# WVERSE-10 — Selezione del profilo personale dopo il login

## Analisi funzionale

### Obiettivo e flusso

Dopo un'autenticazione valida, l'utente deve scegliere il profilo Watchverse da usare. Sono previsti i profili Daniela ed Elena. La selezione apre la Home del profilo scelto e deve restare applicata durante navigazione, refresh compatibile e operazioni personali.

### Input, stati ed errori

- Input: sessione Supabase valida, profilo scelto, eventuale profilo ricordato in sessione/cache.
- Stati: autenticazione completata, scelta profilo, caricamento dati, profilo pronto, profilo non disponibile.
- Errori: sessione scaduta, profilo mancante/non valido, errore di lettura cloud, dati personali non autorizzati.
- In caso di errore non deve essere mostrata una Home vuota o appartenente a un altro profilo.

### Criteri funzionali

- Ogni profilo disponibile è selezionabile.
- Il profilo corrente è visibile nelle viste previste.
- Il cambio profilo aggiorna dati, preferenze e progressi.
- Un profilo non può leggere o modificare i dati personali dell'altro.

## Analisi tecnica

### Componenti e contratti

- `auth.js`: sessione, autenticazione e profilo corrente.
- `app.js`: routing, selezione e rendering della Home.
- `cloud-sync.js`: lettura dei dati personali filtrati per profilo.
- Supabase Auth identifica l'account; il profilo applicativo identifica Daniela o Elena.

### Persistenza e sicurezza

Il catalogo pubblico può essere condiviso, mentre libreria, progressi, preferenze e watchlist devono essere associati al profilo corrente. Le policy RLS devono impedire letture e scritture incrociate.

### Dipendenze

Autenticazione Supabase, modello profili, RLS, bootstrap Home e sincronizzazione cloud.
