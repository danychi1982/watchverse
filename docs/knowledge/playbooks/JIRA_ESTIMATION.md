# Playbook — stima e censimento completo delle issue Jira

## Scopo

Assicurare che ogni issue Watchverse sia stimata prima di essere considerata
censita, pianificata o portata in Review.

Una issue senza stima non è un censimento completo: mancano sia la dimensione
relativa sia l'impegno operativo atteso.

## Regola obbligatoria

Per ogni Story, Task e Bug valorizzare entrambi i campi:

- **Story Points** (`customfield_10038`);
- **Original Estimate** (`timetracking.originalEstimate`).

Le Epic non ricevono una stima diretta. I Sub-task non ricevono Story Points e
ricevono solo Original Estimate.

## Mappatura Watchverse

| Complessità | Story Points | Story Original Estimate | Task/Bug Original Estimate |
|---|---:|---:|---:|
| Bassa | 3 | 16h | 8h |
| Media | 5 | 24h | 16h |
| Alta | 8 | 32h | 24h |

Per i Sub-task usare solo Original Estimate:

- 4h per Analisi e Progettazione, UX/UI e QA/Testing;
- 8h per Front-end, Back-end, Cloud/Infrastructure e DevOps/CI/CD.

La convenzione di calendario è 1 giorno/uomo = 8 ore. Story Points e ore sono
indicatori complementari: non vanno convertiti matematicamente tra loro.

## Come stimare

1. Leggere obiettivo, ambito, dipendenze, casi limite e criteri di accettazione.
2. Valutare la complessità complessiva, non solo la modifica principale:
   integrazioni, persistenza, asincronia, responsive, accessibilità, rischio e
   verifiche necessarie concorrono alla stima.
3. Scegliere Bassa, Media o Alta e applicare la riga corrispondente.
4. Se l’issue contiene risultati indipendenti, scomporla prima di stimare.
5. Verificare che entrambi i campi siano presenti in Jira dopo il salvataggio.

### Verifica tecnica del salvataggio

Non considerare sufficiente una risposta di successo dell'integrazione: riaprire
l'issue e controllare i valori nella sezione **Dettagli**. Se `Story Points` o
`Original Estimate` non sono esposti dalla schermata di modifica/API Jira,
registrare il blocco e non dichiarare completato il censimento delle stime.
L'abilitazione dei campi sulla schermata deve essere corretta prima di un nuovo
tentativo di aggiornamento massivo.

## Gate operativo

Prima di assegnare sprint, passare a In Progress o Review, controllare:

- tipo issue coerente;
- complessità dichiarata o motivata;
- Story Points presenti dove applicabili;
- Original Estimate presente dove applicabile;
- stima coerente con il tipo di issue;
- eventuale sovrastima documentata tramite scomposizione o nota.

Durante un retest o una nuova evidenza la stima va rivalutata se cambiano
ambito, criteri di accettazione o dipendenze. Una modifica della stima deve
essere commentata sulla issue quando cambia la complessità.

## Riferimenti

- [JIRA_WORKFLOW.md](../operations/JIRA_WORKFLOW.md) — fonte normativa;
- [JIRA_INTAKE_TRIAGE.md](JIRA_INTAKE_TRIAGE.md) — controllo durante il triage;
- [JIRA_REVIEW_AND_E2E.md](JIRA_REVIEW_AND_E2E.md) — gate prima della Review.
