# WVERSE-129 — Export e ripristino dei dati personali

## Analisi funzionale

Il flusso consente al profilo corrente di esportare i propri dati e di ripristinarli in seguito. L'export deve includere solo dati personali autorizzati, in un formato versionato e verificabile; il ripristino deve mostrare anteprima/validazione, chiedere conferma interna all'app e non deve coinvolgere l'altro profilo.

Il ripristino deve gestire file assente, formato non riconosciuto, dati parziali, duplicati e versione futura. In caso di errore la libreria esistente deve rimanere intatta oppure il rollback deve essere esplicito e verificabile.

## Analisi tecnica

- Riutilizzare la separazione tra `profiles`, `series`, `movies`, `progress` e `settings`; il payload deve mantenere `profileId` coerente con il profilo selezionato.
- `gdpr-import.js` definisce già parsing, piano di importazione, conversione voti TV Time e gestione dei dati sensibili: export/restore deve condividere normalizzazione e validazioni.
- Il formato deve avere `schemaVersion`, timestamp, profilo logico e sezioni dati; segreti, token e password non sono esportabili.
- Il restore deve operare in transazione logica: validare prima, applicare in batch, incrementare revisioni e sincronizzare cloud solo dopo esito locale coerente.
- Le azioni distruttive richiedono modale interna al design system, mai `window.confirm`.

## Stati, errori e dipendenze

Stati: pronto, preparazione export, download, file selezionato, validazione, conferma, applicazione, sincronizzazione, completato e errore con rollback. Dipendenze: import GDPR, IndexedDB/localStorage, `cloud-sync.js`, RLS e contratto dati corrente.

## Criteri tecnici

Verificare export del profilo corrente, esclusione del profilo alternativo, restore su profilo vuoto, duplicati, schema incompatibile, interruzione durante l'applicazione e persistenza dopo refresh. Il file deve essere leggibile senza includere credenziali.

