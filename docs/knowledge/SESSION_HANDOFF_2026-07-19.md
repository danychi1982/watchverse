# Watchverse — passaggio consegne

## Stato della sessione

La sessione di test e lavorazione del 19 luglio 2026 è sospesa in attesa del completamento del ciclo di aggiornamento fonti dopo un reimport dello ZIP pulito.

Ultimo stato osservato nel pannello:

- 8% di copertura metadata;
- 2.559 titoli del profilo;
- 2.363 titoli da verificare;
- 4 errori tecnici;
- aggiornamento in corso;
- 3 elaborazioni attive e 0 titoli in coda.

`0 titoli in coda` è compatibile con l'elaborazione finale di titoli già prelevati: il ciclo non è concluso finché le elaborazioni attive non terminano. Al prossimo collegamento verificare se compare il completamento, annotando durata complessiva, copertura finale, titoli rimasti ed errori.

## Fix pubblicate e in revisione

- `WVERSE-200`: card Serie uniformate alla versione Home, pulsante `Visto` e toast esplicito con serie ed episodio segnato come visto.
- `WVERSE-201`: misurazione persistente della durata del ciclo fonti, visualizzata a completamento nel pannello; parallelismo metadata portato a 4 e lotti a 72 titoli.
- `WVERSE-202`: correzione del wrapping delle proposte nella Ricerca mobile.
- `WVERSE-203`: mantenimento in viewport del filtro selezionato dopo lo scroll orizzontale mobile.
- Regressione post-cache su `WVERSE-201`: corretto il fallback di `safeJson(null)` che bloccava l'attivazione del profilo prima della Home.

Le issue sopra sono in **Revisione** e richiedono il collaudo manuale quando pertinente. `WVERSE-171`, `WVERSE-193` e `WVERSE-194` sono state completate dopo retest.

## Miglioramento futuro

La durata oggi è mostrata come informazione separata nel pannello. È stato tracciato su `WVERSE-201` il miglioramento per un prossimo rilascio:

`Ciclo completato (durata aggiornamento 2h 10m 4s)`

## Modulo Jira per segnalazioni grezze

È stato creato il modulo pubblico Jira **Todo da analizzare** nel progetto WVERSE:

- tipo di elemento generato: `Task`;
- campi: `Titolo breve` obbligatorio, `Descrizione` obbligatoria, allegato facoltativo;
- nessun assegnatario, Sprint, priorità o stima iniziale;
- modulo configurato come pubblico;
- Jira richiede automaticamente l'e-mail del segnalatore;
- richiedente tecnico predefinito: Daniela;
- Jira aggiunge automaticamente `form` e `form-34`;
- `WVERSE-204` è il Task di prova, in **Da completare**, non assegnato, con label aggiunta manualmente `intake`.

### Workflow di triage

Per una segnalazione che porta a una sola attività:

1. mantenere nella descrizione la sezione `Segnalazione originale`;
2. aggiungere la sezione `Analisi`;
3. registrare l'esito in un commento di triage;
4. aggiornare lo stesso elemento con tipologia, summary, Epic, versione, Sprint, stima e assegnatario.

Per una segnalazione da scomporre:

1. lasciare intatto l'elemento `form`;
2. creare Bug/Task/Story finali collegati;
3. elencare le issue generate in un commento sulla sorgente;
4. portare la sorgente a uno stato come `Analizzata` o `Convertita`.

Non sovrascrivere integralmente la descrizione originale. Le issue con label `form` sono segnalazioni grezze da processare secondo questo workflow.

## Repository e pubblicazione

Ultimo commit pubblicato su `main`: `289fdf0 Document intake triage workflow`.

Commit precedenti rilevanti:

- `081dc6c`: miglioramento futuro sulla label della durata;
- `0b89941`: fix ingresso profilo dopo cache svuotata;
- `e507e36`: fix Sprint 1 per revisione.

Test eseguiti prima della pubblicazione delle fix: `npm test`, `npm run build` e `git diff --check` superati. Gli E2E Chrome restano soggetti al noto errore locale `spawn EPERM`.
