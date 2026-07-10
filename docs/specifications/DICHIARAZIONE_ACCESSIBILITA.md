# Dichiarazione tecnica di accessibilità — Watchverse 2.0.27

**Standard di riferimento:** WCAG 2.2, livello obiettivo AA  
**Data della valutazione:** 2026-07-05  
**Stato:** Parzialmente conforme al livello AA.

La valutazione riguarda Watchverse 2.0.27, applicazione web locale/PWA: autenticazione, selezione profilo, home, librerie, ricerca, programmazione, dettagli, statistiche, importazione, profilo, accessibilità e modali principali. Non è una certificazione di terza parte.

## Statistiche A e AA

- Criteri considerati: 55
- Passati: 41
- Falliti: 3
- Non verificati: 0
- Non applicabili: 11

## Criteri A/AA falliti

- **3.1.2 Lingua delle parti (AA)** — Titoli originali, nomi di episodi e metadati esterni possono cambiare lingua senza un attributo lang affidabile.
- **3.3.3 Suggerimenti per gli errori (AA)** — Alcuni errori provenienti da fonti esterne o importazioni indicano il problema ma non sempre propongono una correzione specifica.
- **4.1.3 Messaggi di stato (AA)** — Toast ed errori principali sono annunciati, ma alcuni aggiornamenti in background dei metadati e delle liste non sono ancora comunicati in modo uniforme alle tecnologie assistive.

## Limiti

- Non è stato eseguito un collaudo end-to-end completo su browser e dispositivi reali né con più screen reader; i criteri che richiedono queste prove restano non verificati o sono indicati con una limitazione.
- I contenuti e i siti esterni aperti da Watchverse non rientrano nell’ambito.
- I dati importati dagli utenti e i metadati di terze parti possono introdurre lingue o testi non prevedibili.

Il report completo, con tutti gli 86 criteri raggruppati per principio e linea guida, è disponibile nell'app dal footer e nel file `docs/reference/REPORT_WCAG_2.2.json`.
