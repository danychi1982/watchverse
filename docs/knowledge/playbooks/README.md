# Playbook operativi Watchverse

Questa cartella raccoglie procedure operative riutilizzabili per trasformare richieste, evidenze di test e segnalazioni in lavoro Jira coerente.

## Gerarchia della documentazione

- `../operations/JIRA_WORKFLOW.md` è la fonte normativa per workflow, stati, sprint, assegnatari, componenti, stime e regole già concordate.
- I documenti in questa cartella spiegano come applicare quelle regole durante una conversazione o una sessione di lavoro.
- In caso di conflitto prevale `../operations/JIRA_WORKFLOW.md` e, in seconda battuta, la decisione più recente registrata in `../decisions/DECISION_LOG.md`.

## Playbook disponibili

- [Classificazione e scomposizione delle issue](JIRA_ISSUE_CLASSIFICATION.md): scelta tra Epic, Story, Task, Bug e Sub-task; gestione di richieste composite e richieste dal modulo pubblico.
- [Intake, duplicati e triage](JIRA_INTAKE_TRIAGE.md): controllo preliminare del backlog, consolidamento delle segnalazioni e criterio per creare una o più issue canoniche.
- [Collaudo e passaggio di stato](JIRA_REVIEW_AND_E2E.md): preparazione della Review, test manuale/E2E, gestione del KO e aggiornamento Jira.

## Regola generale

Ogni nuova richiesta viene prima interpretata come obiettivo e risultato osservabile, poi confrontata con backlog, sprint e issue correlate. Il tipo Jira viene scelto dopo questa analisi, non copiato dal canale di ingresso.
