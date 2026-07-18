# Gestione backlog Watchverse in Jira

## Obiettivo

Jira e il registro operativo del lavoro Watchverse. Il backlog locale resta la fonte storica e tecnica per ricostruire le issue; dopo il censimento, Jira diventa la fonte operativa per stato, sprint, assegnatario, priorita e componenti.

Progetto Jira corrente: Watchverse, board Scrum collegata a `SCRUM`, URL fornito da Daniela.

## Regole di censimento

- Le attivita gia implementate e pubblicate vengono censite come `Done` nella release `R1`. La release verra chiusa da Daniela dopo il censimento e la verifica desiderata.
- Le funzionalita o correzioni implementate ma ancora da verificare manualmente vengono messe nello sprint corrente, in stato `Review`, assegnate a Daniela.
- Le attivita non implementate restano nel backlog; Daniela decidera lo sprint.
- Non si creano subtask dedicati ai test: il test funzionale fa parte del passaggio della issue in `Review`.
- Le issue tecniche che Codex deve ancora sviluppare vengono assegnate a Codex, se l'utente Jira sara disponibile come membro/assignee del progetto.
- Gli stati operativi concordati sono `To Do`, `In Progress`, `Review`, `Done`.

## Tipi e titoli

- `Bug`: comportamento errato o regressione rispetto a un comportamento atteso.
- `Task`: attivita tecnica, di configurazione, refactoring, hardening o analisi.
- `Story`: capacita o risultato funzionale; puo contenere piu elementi di sviluppo front-end/back-end nella stessa issue.
- Ogni titolo inizia con la sezione tra parentesi quadre, per esempio `[Serie] Accesso al dettaglio da card non funzionante`.

## Contenuto obbligatorio

Ogni issue deve indicare, quando applicabile: contesto, problema/obiettivo, comportamento attuale e atteso, dettagli funzionali e tecnici, criteri di accettazione, componenti, priorita, assegnatario, stato, sprint, release, dipendenze e rischi.

Quando Codex porta una issue in `Review`, aggiunge un commento breve con modifiche effettuate e passaggi per il test funzionale. Dopo il test di Daniela, la issue viene chiusa o riportata in `In Progress` con evidenza del problema.

## Proposta componenti

- `Front-end`: SPA, UI, CSS, routing, responsive, accessibilita, PWA e interazioni browser.
- `Back-end`: Supabase, schema dati, RLS, Edge Functions, proxy e sincronizzazione server-side.
- `Cloud Sync`: sincronizzazione bidirezionale, merge, revisioni, tombstone, cache e conflitti.
- `Metadata`: TMDB, JustWatch, TVmaze, trailer, streaming, cinema e diagnostica fonti.
- `Authentication`: login, sessione, PIN, password, recupero e profili.
- `Import/Export`: TV Time, GDPR, backup e restore.
- `Testing/CI`: test funzionali, contratti, browser E2E e GitHub Actions.
- `Performance`: bootstrap, caching, rendering differito, LCP/TTI e concorrenza richieste.
- `Design System`: temi, branding, componenti visuali, contrasto e icone.

Una issue puo avere piu componenti. La proposta va verificata nella configurazione Jira prima del censimento massivo.

## Assegnatari e integrazione Codex

Gli assegnatari previsti sono Daniela e Codex. Per rendere Codex assegnabile e autorizzato a leggere/scrivere bisogna aggiungere l'identita o app di Codex al progetto con permessi di Browse, Create, Edit, Transition, Comment, Assign e gestione sprint/release quando necessari, quindi provare una lettura e una modifica su una issue non distruttiva.

Non salvare token o credenziali nella repository e non usare account condivisi. Se l'integrazione Jira non e disponibile, Daniela deve prima abilitarla/autorizzarla nello spazio Atlassian; fino a quel momento Codex puo preparare il modello e guidare la configurazione, ma non dichiarare completato il censimento remoto.

## Procedura periodica

Quando Daniela indica uno sprint, Codex prende in carico le issue assegnate a Codex in quello sprint, lavora una issue alla volta, la porta in `In Progress`, implementa e verifica localmente, poi la porta in `Review` con commento di handoff. Le issue che richiedono verifica manuale restano in `Review` fino all'esito di Daniela.
