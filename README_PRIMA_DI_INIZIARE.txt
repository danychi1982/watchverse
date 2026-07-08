WATCHVERSE — Versione 2.0.27

NOVITÀ 2.0.27

TEMA THE LAST OF US — PROPOSTA 3 CORRETTA
- Lo sfondo riprende la composizione approvata: parete scura infestata, grande colonia di Cordyceps al centro e finestra invasa dalla vegetazione illuminata dal tramonto.
- Nell’header restano visibili insieme il logo verticale di The Last of Us, il nome Watchverse e gli slogan “Tutto ciò che hai visto. Tutto ciò che vedrai.”
- Le icone di navigazione sono quelle concordate: Cordyceps, Firefly, zaino di Ellie, tatuaggio falena/felce e torcia.
- I loader mantengono la corona di Cordyceps con Firefly centrale e il tatuaggio di Ellie per l’indicatore compatto.
- Aumentato il contrasto di testi, link, frecce e pannelli quando si sovrappongono alle aree chiare dello sfondo.
- Il cast mostra fino a 10 interpreti principali in una griglia desktop di 5 elementi per 2 righe, con card più compatte e collegamento al cast completo.

NOVITÀ EREDITATE DALLA 2.0.24
TEMA THE LAST OF US AGGIORNATO
- Eliminato il marchio testuale TLOU: il simbolo nell’header è ora un orologio rotto originale.
- Sfondo molto più visibile con checkpoint QZ, strada e città abbandonate, percorso su mappa, torcia, lucciole e cordyceps.
- Nuove icone survival: rifugio barricato, zaino, videocassetta, torcia e mappa.
- Loader dedicati con fascio di torcia e orologio; Buffy resta invariato.

DETTAGLI, TEMI E FONTI EFFETTIVE
- Controllo completo delle strutture condivise da tutte le schede film e serie: backdrop, locandine, foto del cast, miniature episodi, trailer, ricerca e suggerimenti restano confinati nei rispettivi riquadri.
- Buffy the Vampire Slayer è stato ridisegnato con sfondo originale cimitero/luna/paletto, palette nero-cremisi-pergamena, icone SVG soprannaturali e loader a luna di sangue.
- “Dove guardare in streaming/TV” mostra soltanto provider realmente restituiti per l’Italia da JustWatch tramite TMDB. Senza dati compare “Informazione non disponibile”.
- I trailer vengono cercati prima tramite TMDB e, usando avvia_server.py, anche con una ricerca YouTube filtrata. La dicitura “Trailer ufficiale” appare solo quando la fonte lo identifica come tale.
- La programmazione cinema interroga esclusivamente i siti ufficiali delle sale preferite e mostra solo orari trovati per il film. Le tabelle vuote sono state eliminate.
- Il pannello “Dati e fonti” misura titoli effettivamente controllati e risultati realmente trovati: una semplice pagina di ricerca non vale più come copertura.
- Tutte le palette principali restano verificate per il contrasto AA e le animazioni rispettano “movimento ridotto”.

AVVIO E FONTI LOCALI
- Per usare anche la ricerca automatica di trailer e programmazione cinema, avvia avvia_server.py e apri l’indirizzo indicato.
- watchverse_offline.html continua a funzionare come file singolo per libreria, importazione e metadati pubblici compatibili con il browser, ma non può eseguire gli endpoint locali /api/trailer e /api/cinema.
- Lo streaming effettivo richiede una configurazione personale TMDB o un proxy TMDB sicuro; nessuna credenziale privata è inclusa nel pacchetto.
- TVmaze resta la fonte pubblica preconfigurata per episodi e palinsesti compatibili.
- Le sale predefinite sono The Space Surbo, The Space Casamassima e Multisala Massimo Lecce; possono essere modificate nel profilo.

AIVENGERS E METADATI
- La chat resta ancorata al launcher come un fumetto e si adatta a menu esteso, compresso e mobile.
- Header, librerie e pannello fonti distinguono il completamento del ciclo dalla copertura effettiva dei metadati.
- Il dettaglio metadati elenca titoli incompleti, campi mancanti ed errori tecnici con azioni Apri scheda e Riprova.

WATCHVERSE 2.0.11 — VERSIONE PULITA E CONDIVISIBILE

NOVITÀ 2.0.11
- Notifiche interne con la locandina della serie al posto dell’icona generica.
- Calendario uscite raggruppato per giorno con intestazioni come “Oggi, domenica 5 luglio”, “Domani…” e giorno della settimana per le date successive.
- Visualizzazione distinta dell’uscita originale e della disponibilità italiana, quando nota.
- Regola facoltativa per serie per indicare piattaforma italiana, differenza di giorni e orario senza inventare dati non presenti nelle fonti pubbliche.
- Nel dettaglio film e serie la locandina resta confinata nel proprio riquadro; l’unica immagine ampia è il banner superiore. Il resto della pagina mantiene uno sfondo uniforme.

Questa versione non contiene dati demo né librerie personali.

AVVIO RAPIDO
1. Per una prova immediata apri watchverse_offline.html con Chrome.
2. Crea l’account familiare locale e scegli uno dei profili disponibili.
3. Se la libreria è vuota, importa lo ZIP GDPR di TV Time dalla Home.
4. Resta connessa a Internet: Watchverse aggiorna la libreria in background. Premi l’indicatore “Metadati” nell’header per vedere avanzamento e dati mancanti.

METADATI
- Serie: TVmaze + Wikipedia italiana/inglese.
- Film: Wikipedia italiana/inglese + Wikidata/Wikimedia Commons.
- Titolo e descrizione italiani sono prioritari; l’inglese è usato come fallback.
- Nel dettaglio compare anche il titolo originale.
- La ricerca considera titolo italiano, titolo originale e alias.
- Alcuni titoli meno noti possono non avere una corrispondenza nelle fonti pubbliche; il pulsante manuale e il pannello di avanzamento permettono di riprovare.

DATE ITALIANE
Le fonti pubbliche gratuite usate da Watchverse non forniscono sempre l’orario italiano di pubblicazione. Quando una data italiana esplicita non è disponibile, Watchverse mostra chiaramente l’uscita originale e non applica ritardi presunti. Nel dettaglio della serie puoi impostare una regola personale, per esempio “NOW · giorno successivo · ore 03:00”.

ARCHITETTURA DATI
I metadati comuni sono salvati una sola volta nell’archivio locale “catalog” e riutilizzati da tutti i profili. I dati personali restano separati. La descrizione completa è in ARCHITETTURA_DATI.md.

PUBBLICAZIONE
Per pubblicare online carica l’intera cartella su un hosting HTTPS come Netlify. La sincronizzazione cloud tramite Supabase richiede la configurazione descritta in ROADMAP_CLOUD.md.
