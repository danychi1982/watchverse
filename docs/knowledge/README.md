# Knowledge base Watchverse

Questa cartella conserva il contesto necessario per riprendere il progetto in una nuova chat o con un nuovo collaboratore. Non sostituisce la documentazione tecnica dettagliata e non sostituisce il backlog.

## Da leggere in ordine

1. [Contesto di progetto](PROJECT_CONTEXT.md): obiettivo, architettura, ambiente, vincoli e regole operative.
2. [Registro delle decisioni](DECISION_LOG.md): decisioni importanti, motivazioni, conseguenze e stato.
3. [Backlog corrente](../specifications/BACKLOG_CLOUD.md): unica fonte per priorita, stato, owner, effort e residui.

## Principi di manutenzione

- Il contesto stabile va aggiornato qui, non copiato in ogni issue o chat.
- Ogni decisione architetturale o di prodotto rilevante entra nel registro con data, motivazione e conseguenze.
- Le attivita operative restano nel backlog; una voce non va duplicata in questo documento.
- Ogni avanzamento significativo su decisioni, architettura o backlog aggiorna nella stessa sessione anche questa knowledge base e/o il registro delle decisioni, quando necessario.
- I documenti devono distinguere fatti verificati, decisioni, ipotesi e attivita ancora da testare.
- Ogni nuova chat dovrebbe iniziare leggendo questo indice, il contesto, il registro decisioni e il backlog.

## Prompt di ripresa

```text
Leggi docs/knowledge/README.md, PROJECT_CONTEXT.md e DECISION_LOG.md.
Usa docs/specifications/BACKLOG_CLOUD.md come fonte unica delle attivita.
Rispetta i vincoli operativi indicati nel contesto: niente privilegi amministrativi,
niente azioni distruttive non confermate, test locale prima del deploy e commit solo
quando richiesto. Prima di modificare il codice riassumi il contesto rilevante e
aggiorna il backlog se la richiesta introduce una nuova decisione o attivita.
```

## Metodo documentale adottato

La struttura segue una separazione pratica tra guide operative, riferimento tecnico, spiegazioni delle scelte e registro delle decisioni in formato ADR leggero.

Riferimenti: [Diataxis](https://diataxis.fr/) e [Architectural Decision Records](https://adr.github.io/).
