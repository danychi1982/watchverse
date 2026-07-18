# WVERSE-56 — Gestione PIN, visibilità password e messaggi

## Analisi funzionale

La gestione del PIN e dei campi password deve offrire mostra/nascondi, validazione e messaggi coerenti nei form di login, profilo e recupero. I campi partono nascosti; il toggle non deve perdere il valore né il focus.

Input, stati ed errori comprendono valore vuoto/non valido, conferma non coincidente, salvataggio in corso, successo, errore cloud e rate limit. I messaggi devono essere comprensibili e non divulgare password o PIN.

## Analisi tecnica

`auth.js` gestisce validazione e persistenza; `app.js`/componenti UI gestiscono toggle, focus e messaggi; `styles.css` mantiene l'icona dentro il campo e coerente col design system. Il PIN non deve essere scritto nei log e la persistenza deve rispettare il profilo corrente.
