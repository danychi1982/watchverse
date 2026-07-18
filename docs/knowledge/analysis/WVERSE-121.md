# WVERSE-121 — Diagnostica dei titoli senza corrispondenza

## Analisi funzionale

La diagnostica deve rendere distinguibili i titoli con metadati essenziali incompleti, quelli che non trovano una corrispondenza nelle fonti pubbliche e quelli che hanno avuto un errore tecnico. L'utente deve vedere titolo, tipo, dati mancanti, categoria dell'errore e azione disponibile (`Apri scheda` o `Riprova`).

Il pannello deve mostrare conteggi coerenti con la copertura: un titolo è essenziale quando dispone almeno di locandina e descrizione; cast, episodi e dati supplementari possono restare incompleti senza falsare la percentuale. Il retry è sempre esplicito e non deve diventare un loop automatico.

## Analisi tecnica

- Riutilizzare `metadataItemDiagnostics`, `metadataGlobalStatus` e `metadataErrorInfo` in `app.js` come contratto unico per header, librerie e pannello.
- Persistono sul record condiviso `publicMetadata.parts`, `failedAt`, `error`, `errorCode`, `errorCategory`, `attempts` e `nextRetryAt`.
- Il retry deve ripulire lo stato di errore, aumentare il budget controllato e rimettere in coda il titolo; il risultato deve aggiornare catalogo e viste senza perdere dati importati.
- Distinguere assenza legittima di una fonte, titolo non identificato e errore di rete/provider; non usare un generico “non trovato” per tutti i casi.

## Stati, errori e dipendenze

Stati: completo, incompleto essenziale, incompleto supplementare, in coda, in elaborazione, errore tecnico e retry disponibile. Dipendenze: proxy TMDB/fonti pubbliche, coda metadati, persistenza catalogo condiviso e rendering differito.

## Criteri tecnici

Verificare percentuale e conteggi con catalogo vuoto, titolo senza locandina, titolo senza descrizione, errore transitorio, errore permanente e retry riuscito. Il retry manuale non deve bloccare navigazione né modificare titoli non coinvolti.

