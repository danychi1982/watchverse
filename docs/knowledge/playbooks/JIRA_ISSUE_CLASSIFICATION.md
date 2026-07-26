# Playbook — classificazione e scomposizione delle issue Jira

## Scopo

Classificare autonomamente una richiesta Watchverse nel work type più appropriato e capire quando una singola richiesta deve diventare più issue distinte.

Il modello segue la gerarchia Jira company-managed: **Epic** (livello parent), **Story/Task/Bug** (livello standard) e **Sub-task** (livello figlio). Atlassian descrive Epic come contenitore di lavoro ampio, Story come unità di lavoro orientata a un obiettivo utente, Task come lavoro da svolgere, Bug come problema che compromette il prodotto e Sub-task come scomposizione tecnica di un elemento standard.

## Definizioni operative Watchverse

| Tipo | Usarlo quando | Non usarlo quando | Criterio rapido |
|---|---|---|---|
| **Epic** | Si costruisce o migliora una capability ampia, composta da più risultati indipendenti e potenzialmente distribuita su più sprint. | Si descrive una singola modifica o un singolo difetto. | “Quale area/capability stiamo evolvendo?” |
| **Story** | Esiste un risultato funzionale o un obiettivo utente verificabile, anche se richiede più strati tecnici. | La richiesta è solo refactoring, configurazione, analisi interna o correzione di un comportamento già atteso. | “Cosa deve poter fare meglio l’utente?” |
| **Task** | Serve lavoro tecnico/operativo: analisi, configurazione, refactoring, hardening, documentazione, CI/CD o manutenzione senza una nuova capability utente. | È una deviazione osservata dal comportamento atteso: in quel caso è Bug. | “Quale lavoro va eseguito, senza introdurre un nuovo risultato utente?” |
| **Bug** | Il prodotto si comporta diversamente da quanto atteso, da quanto già implementato o dai criteri concordati; esistono evidenza e riproducibilità sufficienti. | Si sta chiedendo una nuova funzione o un miglioramento non ancora esistente. | “Qualcosa che dovrebbe funzionare non funziona?” |
| **Sub-task** | È una parte tecnica delimitata, necessaria a una Story principale, con deliverable e criterio tecnico propri. Per convenzione Watchverse è figlio di una Story. | Ha valore utente autonomo, richiede una propria priorità/sprint o deve essere testato come risultato funzionale separato. | “È un pezzo implementativo della Story, non un risultato indipendente?” |

Jira consente tecnicamente di creare Sub-task sotto elementi standard come Story, Task e Bug; la convenzione Watchverse restringe l’uso ai **Sub-task di Story** per mantenere la verifica funzionale sulla Story principale e non duplicare il collaudo.

## Albero decisionale

1. La richiesta descrive una capability ampia che raggruppa più risultati? → **Epic**.
2. È una deviazione, regressione o malfunzionamento rispetto a un comportamento atteso? → **Bug**.
3. È un nuovo risultato funzionale espresso dal punto di vista dell’utente? → **Story**.
4. È lavoro tecnico/operativo senza nuovo risultato utente? → **Task**.
5. È solo una parte implementativa necessaria a una Story già individuata? → **Sub-task**.
6. Se contiene più risposte “sì” indipendenti, scomporre la richiesta in più issue e collegarle.

## Scomposizione di una richiesta composita

Una richiesta diventa più issue quando contiene almeno una di queste condizioni:

- risultati utente diversi, ciascuno accettabile o rifiutabile separatamente;
- aree funzionali indipendenti, per esempio metadati, sincronizzazione e responsive;
- tipi diversi, per esempio una nuova funzione insieme a un Bug osservato;
- criteri di accettazione, priorità o dipendenze diversi;
- rischio o ciclo di rilascio diverso;
- una parte può essere completata senza attendere le altre.

Non si divide invece solo perché l’implementazione coinvolge front-end, back-end e test: questi sono componenti o Sub-task della stessa Story, se il risultato utente è unico.

### Regola pratica

Una issue deve avere **un risultato principale, un set coerente di criteri di accettazione e un esito di test unico**. Se il test può produrre “passa A ma fallisce B” e i due risultati non sono inseparabili, creare issue separate.

## Richieste dal modulo pubblico

Le richieste entrate dal modulo pubblico sono inizialmente `Task` con label `form`, perché sono segnalazioni grezze da analizzare. La label identifica il canale di ingresso, non il tipo finale.

Durante il triage:

- una sola attività coerente → aggiornare la stessa issue e riclassificarla se necessario;
- un nuovo comportamento utente → Story;
- un comportamento errato/regressione → Bug;
- lavoro tecnico senza risultato utente → Task;
- più risultati indipendenti → creare più issue canoniche, mantenendo la richiesta `form` come sorgente e collegando le issue generate;
- parti tecniche della stessa Story → Sub-task, non issue autonome;
- capability ampia che raccoglie più Story → collegare a una Epic esistente o crearne una nuova.

## Criteri minimi prima della creazione

Prima di creare o riclassificare:

1. cercare duplicati in tutto il backlog e in tutti gli sprint;
2. confrontare sintomo/obiettivo, sezione, componente, tipo, issue correlate e descrizione;
3. verificare Epic, Story e Bug già esistenti;
4. scegliere il minimo insieme di issue che rappresenta risultati realmente indipendenti;
5. compilare contesto, comportamento attuale/atteso, ambito, criteri di accettazione, evidenze e dipendenze;
6. assegnare componente, priorità, stima e label secondo `JIRA_WORKFLOW.md`.

## Esempi Watchverse

- “Il popup alterna due stati e mostra un retry scaduto” → **Bug**.
- “Aggiungere un unico pulsante Aggiorna che aggiorna tutti i metadati mancanti” → **Story** se è una capacità utente completa.
- “Spostare i pulsanti del popup nella testata” → **Task** se è una miglioria UX isolata; **Bug** solo se viola un layout già definito o un criterio concordato.
- “Aggiungere un test E2E Playwright e stabilizzare il runner CDP” → **Task** tecnico, eventualmente con Sub-task tecnici.
- “Metadati: aggiornamento completo” con sub-attività UI, coda, persistenza e test → **Story** principale con Sub-task tecnici.

## Fonti

- [Atlassian — What are work types?](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/)
- [Atlassian — What is an epic?](https://support.atlassian.com/jira-software-cloud/docs/what-is-an-epic/)
- [Atlassian — Create a work item and a subtask](https://support.atlassian.com/jira-software-cloud/docs/create-a-work-item-and-a-subtask/)
