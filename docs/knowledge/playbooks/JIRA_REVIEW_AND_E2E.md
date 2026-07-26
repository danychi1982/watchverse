# Playbook — Review, collaudo manuale ed E2E

## Scopo

Definire quando un’issue è pronta per il test, come eseguire il collaudo e come mantenere Jira coerente con l’esito reale.

## Prima della Review

- implementazione completata;
- suite automatica e build verdi;
- criteri di accettazione verificabili;
- E2E browser reale eseguito sugli step funzionali previsti dai criteri di accettazione, non limitato alla sola apertura della pagina;
- ogni esito funzionale atteso deve avere un’asserzione E2E quando è riproducibile nel browser;
- commento Jira con modifica, controlli eseguiti e passi manuali;
- per i test browser, browser E2E CDP disponibile tramite `avvia-chrome-e2e.bat`;
- nessuna issue dipendente ancora necessaria per il comportamento principale.

## Regola E2E

Prima di confermare una fix con comportamento browser, Codex deve chiedere l’avvio di `C:\-- Personale\watchverse\avvia-chrome-e2e.bat`. Daniela lascia il browser dedicato aperto; Codex esegue gli E2E e registra l’esito. Dopo riavvio, nuova sessione o chiusura del browser, il file va rilanciato.

Gli E2E non sostituiscono il test funzionale specifico quando il criterio richiede un’osservazione manuale, ma costituiscono un gate tecnico obbligatorio prima del passaggio da `In corso` a `Review`. Un E2E parziale o non deterministico non è sufficiente: l’issue resta `In corso` finché il runner non verifica il flusso previsto e i risultati attesi.

## Stati concordati

| Evento | Stato |
|---|---|
| Lavoro non iniziato | Da completare |
| Fix in lavorazione | In corso |
| Fix implementata e pronta al test | Revisione |
| Test superato e criteri soddisfatti | Completata |
| Test KO | Da completare |

Quando una issue in Revisione è KO, aggiungere l’esito e riportarla a Da completare. Alla ripresa della fix passa a In corso; torna in Revisione solo dopo nuova implementazione, controlli automatici ed E2E quando applicabile.

## Sub-task

I Sub-task documentano il lavoro tecnico e possono essere chiusi direttamente quando il deliverable tecnico è completato. Il test funzionale resta sulla Story, Task o Bug principale e non va duplicato su ogni Sub-task.

## Riferimento normativo

Per workflow, commenti, sprint e regole di collaudo vale [JIRA_WORKFLOW.md](../operations/JIRA_WORKFLOW.md).
