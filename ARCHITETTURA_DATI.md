# Architettura dati di Watchverse 2.0.27

## Obiettivo

Watchverse separa i dati pubblici comuni relativi a un titolo dai dati personali dei singoli profili. In questo modo descrizione, locandina, cast, stagioni ed episodi già recuperati per un film o una serie possono essere riutilizzati da Profilo 1, Profilo 2 e dagli altri profili senza ripetere lo stesso download.

## 1. Catalogo condiviso sul dispositivo

L'archivio IndexedDB `catalog` contiene i dati indipendenti dal profilo:

- titolo localizzato, titolo originale, alias e anno;
- identificativi delle fonti, come TMDB, TVDB, IMDb, Wikidata o provider pubblico;
- descrizione, generi, durata e stato della produzione;
- locandine, backdrop e immagini;
- cast e informazioni editoriali;
- stagioni ed episodi delle serie;
- trailer ufficiale e collegamenti pubblici;
- data, fonte e livello di completezza dell'ultimo aggiornamento.

Quando una fonte pubblica restituisce nuovi dati, Watchverse salva o aggiorna una sola voce nel catalogo comune. La ricerca controlla questo archivio prima di eseguire richieste di rete.

## 2. Dati separati per profilo

Ogni profilo conserva soltanto le informazioni personali o le proprie copie di compatibilità:

- titoli presenti nella libreria;
- episodi e film segnati come visti;
- data dell'ultima visione e avanzamento;
- valutazioni, preferiti, note e stato della watchlist;
- promemoria e notifiche;
- cinema, servizi streaming e canali preferiti;
- tema, densità e altre impostazioni del profilo.

Questi dati non vengono condivisi tra i profili. Profilo 2 può quindi aggiungere lo stesso titolo già presente nella libreria di Profilo 1, ricevendo i metadati comuni dal catalogo locale ma iniziando con avanzamento e valutazioni propri.

## 3. Identificazione e deduplicazione

Per riconoscere lo stesso contenuto Watchverse usa, in ordine di affidabilità:

1. identificativi stabili delle fonti pubbliche;
2. identificativi TMDB, TVDB, IMDb o Wikidata;
3. identificativo del provider originario;
4. combinazione normalizzata di tipo, titolo e anno.

Le chiavi disponibili vengono associate alla stessa voce di catalogo. Se in seguito arriva un identificativo più affidabile, la voce viene arricchita senza duplicare il contenuto.

## 4. Flusso cache-first

Quando un profilo cerca o aggiunge un titolo:

1. Watchverse cerca una corrispondenza nel catalogo condiviso;
2. se i dati sono sufficienti, li usa immediatamente e non contatta la fonte pubblica;
3. se i dati mancano o sono scaduti, interroga la fonte una sola volta;
4. salva il risultato nel catalogo condiviso;
5. collega o aggiorna il record personale del profilo senza copiare le attività degli altri profili.

La sezione **Profilo → Dati e fonti** mostra quanti titoli sono disponibili nel catalogo comune e quanti download sono stati evitati nella sessione.

## 5. Aggiornamenti e freschezza

I dati editoriali stabili vengono riutilizzati a lungo. Le informazioni più variabili, come nuovi episodi, disponibilità streaming, palinsesti TV e programmazione cinema, conservano invece data di aggiornamento e stato della fonte. Una richiesta forzata può ignorare la cache quando serve un controllo più recente.

Le disponibilità e gli orari restano indicativi: per acquisti, visioni e prenotazioni fa fede il sito ufficiale del servizio, del canale o del cinema.

## 6. Eliminazione di un profilo

L'eliminazione di un profilo rimuove i suoi dati personali, ma non cancella automaticamente il catalogo condiviso. Questo evita di riscaricare dati ancora utili agli altri profili. Un'eventuale funzione futura di pulizia potrà rimuovere soltanto le voci non più referenziate e sufficientemente vecchie.

## 7. Evoluzione cloud

La stessa separazione è predisposta per un backend futuro:

- tabella globale `catalog_titles` e tabelle collegate per cast, stagioni, episodi e fonti;
- tabelle `profile_library`, `profile_progress`, `profile_ratings` e `profile_preferences` legate al singolo profilo;
- job centralizzati di aggiornamento e deduplicazione;
- controllo della freschezza per categoria di fonte.

Questa struttura consente di scaricare una sola volta i dati pubblici anche quando più dispositivi o profili usano lo stesso titolo.


## Fonti pubbliche e disponibilità effettive (2.0.27)

Watchverse usa TVmaze per metadati e palinsesti compatibili. La disponibilità streaming italiana viene mostrata soltanto quando JustWatch tramite TMDB restituisce provider effettivi; una pagina di ricerca generica non viene più conteggiata né visualizzata come disponibilità.

Il server locale `avvia_server.py` espone due endpoint a fonti predefinite: `/api/trailer` filtra risultati pubblici YouTube e `/api/cinema` legge esclusivamente i siti ufficiali delle sale configurate. Gli orari vengono salvati solo quando associati al titolo; in caso contrario la scheda mostra “Informazione non disponibile”. Le risposte variabili hanno cache breve e data di controllo.

TMDB non viene configurato con un token condiviso nel client: può essere attivato con token personale in locale o con proxy sicuro. Per una pubblicazione online, `publicSourcesProxyUrl` può indicare un servizio compatibile con gli stessi endpoint senza esporre segreti nel browser.
