# WVERSE-52 — Logout globale dopo cambio password

## Analisi funzionale

### Obiettivo e flusso

Dopo il cambio password, le sessioni attive devono essere invalidate secondo il comportamento di Supabase. L'utente viene riportato al login e deve autenticarsi nuovamente prima di selezionare un profilo.

### Input, stati ed errori

- Input: sessione autenticata, password corrente se richiesta, nuova password e conferma.
- Stati: form modifica, validazione, aggiornamento in corso, successo con logout, errore.
- Errori: password non valida, conferma diversa, sessione scaduta, rate limit o errore cloud.

### Criteri funzionali

- Il cambio riuscito non lascia l'utente nella sessione precedente.
- Le viste personali non sono accessibili prima del nuovo login.
- Un errore mantiene il contesto del form e non esegue logout prematuro.

## Analisi tecnica

`auth.js` esegue aggiornamento credenziali e sign-out; `app.js` resetta profilo, route e stato personale. Il flusso dipende dalla revoca/session management di Supabase e non deve duplicare credenziali nel client.
