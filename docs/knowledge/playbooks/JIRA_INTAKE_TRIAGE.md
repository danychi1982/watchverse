# Playbook — intake, duplicati e triage Jira

## Scopo

Trasformare una richiesta informale, uno screenshot, un esito di test o una segnalazione del modulo pubblico in lavoro Jira tracciabile senza perdere il contesto e senza creare duplicati.

## Sequenza obbligatoria

1. **Raccogliere il nucleo della richiesta**: sintomo o obiettivo, pagina/flusso, profilo, dispositivo, data, evidenza e risultato atteso.
2. **Cercare in Jira**: backlog, sprint attivi e futuri, issue chiuse e richieste `form` correlate.
3. **Classificare** usando `JIRA_ISSUE_CLASSIFICATION.md`.
4. **Decidere il consolidamento**: commento/aggiornamento su issue esistente, nuova issue singola o scomposizione in più issue.
5. **Collegare le fonti**: una richiesta `form` resta rintracciabile e viene collegata alle issue canoniche.
6. **Registrare la decisione**: tipo scelto, motivazione, issue correlate, sprint e stato iniziale.

## Regola anti-duplicati

Non creare una issue solo perché la formulazione è diversa. È un possibile duplicato quando coincidono sintomo, pagina, obiettivo, area funzionale o criterio di accettazione. In quel caso aggiornare l’issue esistente con la nuova evidenza; creare una nuova issue solo se il risultato o il ciclo di verifica è realmente distinto.

## Esiti del triage

- **Consolidata**: la segnalazione viene aggiunta a un’issue esistente.
- **Riclassificata**: la stessa issue cambia tipo perché il triage ha chiarito la natura del lavoro.
- **Scomposta**: vengono create più issue canoniche, ciascuna con un risultato e criteri autonomi.
- **Collegata**: la richiesta resta come sorgente e viene collegata a una issue già esistente senza duplicare il lavoro.
- **Da chiarire**: manca un’informazione che cambia materialmente tipo, ambito o soluzione; chiedere una decisione prima di creare.

## Richieste composite

Usare una Story principale con Sub-task solo quando esiste un unico risultato utente. Usare issue standard separate quando i risultati sono indipendenti, quando hanno priorità diverse o quando uno è un Bug e l’altro una nuova capability.

## Evidenza minima

Per Bug e KO di Review: passi di riproduzione, comportamento attuale, atteso, ambiente/viewport, timestamp se rilevante, screenshot o riferimento, impatto e frequenza.

Per Story/Task: obiettivo, valore, ambito incluso/escluso, dipendenze, criteri di accettazione osservabili e definizione di pronto.

## Riferimenti interni

- [JIRA_WORKFLOW.md](../JIRA_WORKFLOW.md)
- [JIRA_ISSUE_CLASSIFICATION.md](JIRA_ISSUE_CLASSIFICATION.md)
- [Backlog cloud](../../specifications/BACKLOG_CLOUD.md)
