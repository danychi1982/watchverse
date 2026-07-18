# WVERSE-48 — Primo accesso, password e recupero credenziali

## Analisi funzionale

### Obiettivo e flusso

L'utente accede con le credenziali dell'account familiare. Dopo un primo accesso valido può entrare nella selezione profilo; in caso di password dimenticata può richiedere il recupero tramite l'email configurata in Supabase. Le registrazioni pubbliche restano disabilitate.

### Input, stati ed errori

- Input: username visualizzato `daniela`, password, email di recupero, token/link Supabase.
- Stati: form iniziale, password inviata, autenticazione in corso, autenticato, recupero richiesto, recupero completato.
- Errori: campi vuoti, credenziali errate, rate limit, link scaduto/non valido, errore di rete o Supabase.
- Password e PIN partono nascosti e dispongono di mostra/nascondi dentro il campo.

### Criteri funzionali

- Login valido apre il flusso di selezione profilo.
- Credenziali errate producono un messaggio comprensibile senza perdere il form.
- Il recupero usa l'email configurata e non espone segreti.
- Il reset completato consente un nuovo accesso.

## Analisi tecnica

### Componenti e contratti

`auth.js` gestisce Supabase Auth, sessione, recupero password e stato del form; `app.js` reagisce all'esito e apre la selezione profilo. Il client non salva password in chiaro.

### Sicurezza e dipendenze

Dipendenze: Supabase Auth, URL di redirect configurato nel progetto Supabase, policy di sessione e flusso profili. Gli errori Auth devono essere normalizzati in messaggi UI senza rivelare informazioni sensibili.
