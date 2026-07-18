# WVERSE-43 — Preferenze e impostazioni personali

## Analisi funzionale

La Story riguarda le impostazioni del profilo corrente, separate tra Daniela ed Elena. Il flusso parte dalla sezione Impostazioni e carica i valori del profilo attivo; ogni modifica viene applicata localmente, resa visibile immediatamente e persistita senza cambiare profilo.

Le impostazioni rilevanti nell'architettura attuale sono tema e densità dell'interfaccia, preferenze di programmazione, lingua dei contenuti, formati, servizi streaming, canali TV, cinema preferiti, filtri e ordinamenti della libreria. I valori mancanti devono ricevere i default applicativi senza sovrascrivere preferenze già valide.

## Analisi tecnica

- `app.js` inizializza `state.settings`, applica i default e usa una chiave localStorage profilata (`watchverse.<profileId>.settings`).
- `cloud-sync.js` legge e scrive `profile_settings` con `profile_id`, `payload`, `revision` e `updated_at`; la RLS deve limitare il record al profilo corrente.
- Il salvataggio incrementa `revision` e aggiorna `updatedAt`; il payload non deve contenere password, token o PIN in chiaro.
- Dopo bootstrap cloud, i dati devono essere normalizzati prima del rendering; una risposta cloud assente o non autorizzata deve produrre un messaggio gestibile e mantenere il fallback locale.
- Il cambio profilo deve ricaricare il payload dell'altro profilo e invalidare le viste dipendenti dalle preferenze.

## Stati, errori e dipendenze

Stati: caricamento iniziale, valori disponibili, modifica locale non ancora sincronizzata, sincronizzazione riuscita, errore di sincronizzazione e fallback locale. Errori principali: profilo non selezionato, record non disponibile, payload non valido, conflitto di revisione e sessione scaduta.

Dipendenze: WVERSE-9 per profilo/sessione, tabella `profile_settings`, policy RLS, `cloud-sync.js`, rendering Impostazioni e invalidazione delle viste Home/Libreria/Programmazione.

## Decisioni e criteri tecnici

Il contratto canonico è il payload JSON di `profile_settings`; nuovi campi devono avere default retrocompatibili. Una modifica è completata quando persiste dopo refresh, resta isolata per profilo, non blocca la navigazione e gli errori non cancellano l'ultimo valore valido.

