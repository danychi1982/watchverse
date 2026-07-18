# WVERSE-143 — Aggiornamento delle viste dopo modifiche da altro dispositivo

## Analisi funzionale

Quando lo stesso profilo viene modificato da un altro dispositivo, le viste locali devono aggiornarsi senza richiedere una nuova sessione. L'utente deve ricevere un feedback non invasivo e vedere aggiornati libreria, progressi, preferiti, impostazioni e sezioni derivate interessate.

Una vista già modificata localmente non deve essere sostituita da una risposta vecchia. Le modifiche devono risultare dopo refresh e le sezioni non coinvolte non devono lampeggiare o perdere lo scroll senza motivo.

## Analisi tecnica

- Usare `dataRevision` come invalidatore delle proiezioni e `viewCache` per evitare ricalcoli inutili; aggiornare direttamente la vista visibile quando possibile.
- Coordinare pull cloud, merge e rendering con un token di richiesta; le risposte obsolete non devono applicare stato.
- Distinguere aggiornamento silenzioso, conflitto e errore di rete; il loader di navigazione non deve bloccare i click.
- Le viste Home, Libreria, Ricerca, Programmazione e Dettaglio devono definire quali dati invalidano la loro proiezione.

## Stati, errori e dipendenze

Stati: nessun aggiornamento, pull in corso, dati aggiornati, conflitto, aggiornamento parziale ed errore recuperabile. Dipendenze: WVERSE-133/138, `cloud-sync.js`, `dataRevision`, `viewCache`, routing e rendering SPA.

## Criteri tecnici

Verificare modifica remota di una serie, progress, preferito e impostazione; controllo durante navigazione, richieste concorrenti, rete assente e conflitto locale/cloud. Dopo ogni scenario il profilo e le viste devono restare coerenti.

