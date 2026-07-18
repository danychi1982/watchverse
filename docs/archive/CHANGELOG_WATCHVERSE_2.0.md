WATCHVERSE 2.0.27 — PROPOSTA 3 FEDELE E CAST 5×2

- Sostituito lo sfondo The Last of Us con una composizione aderente alla proposta approvata: parete infetta, grande colonia di Cordyceps e finestra al tramonto invasa dall’edera.
- Ripristinati nell’header il nome Watchverse e i due slogan accanto al logo verticale di The Last of Us.
- Uniformate le icone del tema a Cordyceps, Firefly, zaino di Ellie, tatuaggio falena/felce e torcia.
- Mantenuti i loader approvati con corona di Cordyceps, Firefly centrale e tatuaggio per l’indicatore compatto.
- Rafforzato il contrasto di intestazioni, link “Tutte le serie”, frecce, metadati e pannelli sulle zone luminose del wallpaper.
- Il cast mostra fino a 10 interpreti principali; su desktop ampio la disposizione è 5×2 e le card sono più compatte.

WATCHVERSE 2.0.26 — THE LAST OF US: PARETE INFETTA

- Sostituito il precedente scenario QZ con una parete infestata dal Cordyceps e una finestra invasa dall’edera illuminata dal tramonto.
- Inserito nell’header il logo verticale ufficiale della serie, su risorsa grafica trasparente e ad alto contrasto.
- Ridisegnate tutte le icone del tema: colonia Cordyceps, Firefly, zaino di Ellie, tatuaggio falena/felce e mappa.
- Sostituiti i loader con una corona animata di Cordyceps, Firefly pulsante e indicatore compatto ispirato al tatuaggio di Ellie.
- Aumentata la trasparenza controllata dei pannelli per rendere lo sfondo riconoscibile senza compromettere la lettura.
- Buffy, cast principale e caroselli con frecce restano invariati.

WATCHVERSE 2.0.25 — CAST LEGGIBILE E CAROSELLI CON FRECCE

- Nei dettagli di film e serie vengono mostrati soltanto gli 8 interpreti principali, in una griglia responsive su più righe.
- Nomi degli attori e personaggi non sono più troncati e si adattano alla larghezza della scheda.
- Aggiunto un collegamento al cast completo su IMDb, TMDB o sulla fonte pubblica disponibile.
- “Potrebbero piacerti anche” e le proposte personalizzate della ricerca adottano i controlli ‹ › già usati nella Home.
- Nascoste le scrollbar dei caroselli di contenuti, mantenendo navigazione touch, trackpad, tastiera e scrolling assistito.
- Verificato lo stesso pattern su Home, Ricerca e pagine di dettaglio film/serie.

WATCHVERSE 2.0.24 — NUOVO TEMA THE LAST OF US

- Rifatto il solo tema The Last of Us dopo il controllo visivo: eliminato il marchio testuale “TLOU” e sostituito con un orologio rotto originale.
- Nuovo sfondo più leggibile con checkpoint QZ, strada abbandonata, sopraelevata spezzata, automobile, percorso cartografico, torcia, lucciole e cordyceps.
- Nuove icone survival per Home, Serie, Film, Cerca e Programmazione: rifugio barricato, zaino, videocassetta, torcia e mappa con percorso.
- Nuovi loader a fascio di torcia e orologio rotto, con animazioni disattivabili tramite “movimento ridotto”.
- Buffy e tutte le funzioni introdotte nella 2.0.23 restano invariate.

WATCHVERSE 2.0.23 — DETTAGLI, FONTI REALI E TEMI RICONOSCIBILI

- Ridisegnati integralmente i temi The Last of Us e Buffy con sfondi originali dedicati, palette, icone SVG e loader coerenti con cordyceps/sopravvivenza e cimitero/paletto/horror anni Novanta.
- Blindato il contenimento di backdrop, locandine, foto cast, miniature episodi, trailer, ricerca e suggerimenti: nessuna immagine può uscire dalla propria cornice o coprire i contenuti.
- La sezione streaming/TV mostra solo provider effettivamente restituiti per l’Italia da JustWatch tramite TMDB; in assenza di dati mostra “Informazione non disponibile”.
- I trailer vengono cercati prima su TMDB e poi, in locale, tramite una ricerca YouTube filtrata; l’etichetta “ufficiale” compare soltanto quando la fonte lo indica.
- La programmazione cinema interroga i siti ufficiali delle sale preferite e mostra esclusivamente orari realmente trovati; eliminate le tabelle vuote con orari fittizi.
- Aggiunti endpoint locali /api/trailer e /api/cinema in avvia_server.py, cache temporanea e configurazione proxy opzionale per installazioni online.
- Resi coerenti anche i pannelli “Dati e fonti”: percentuali e stati non considerano più una semplice pagina di ricerca come disponibilità verificata.

WATCHVERSE 2.0.21 — AIvengers A FUMETTO

- Il pannello AIvengers si apre ora a ridosso dell’icona di avvio.
- Una coda grafica collega chiaramente il pannello al launcher, come un fumetto.
- Posizione e punto di ancoraggio si adattano al menu espanso, compresso e alla navigazione mobile.
- Restano invariati contenuti, dimensioni compatte e controlli dell’assistente.

WATCHVERSE 2.0.21 — DETTAGLI, ACCESSIBILITÀ E PERSONALIZZAZIONE

- Corretto il contenimento delle immagini nel dettaglio, nella ricerca e nelle card condivise: banner e locandine non possono più coprire i contenuti.
- Ridisegnata la programmazione cinema con anteprima di oggi e dei due giorni successivi per le sole sale preferite.
- Rinominata la sezione in “Dove guardarlo in streaming/TV”, con loghi dei servizi e dei canali e senza testi tecnici destinati allo sviluppo.
- Il pulsante trailer apre direttamente il trailer ufficiale YouTube quando configurato; aggiunto il collegamento ufficiale per Supergirl (2026).
- La pagina Accessibilità contiene ora i tab Dichiarazione e Assessment AI, basato sui criteri WCAG 2.2.
- Aggiunti tooltip alle icone della navigazione quando il menu laterale è compresso.
- Compattate le preferenze streaming e aggiunti loghi ai canali TV nell’accordion del profilo.
- Aggiunti i temi predefiniti “The Last of Us” e “Buffy the Vampire Slayer”, con palette ad alto contrasto, controlli e dettagli iconografici dedicati.
- Nella ricerca le proposte personalizzate possono essere filtrate tra Tutti, Film e Serie TV.

WATCHVERSE 2.0.19 — POSIZIONE AIVENGERS E STATO METADATI

- Corretto il launcher di AIvengers che poteva risultare tagliato sul bordo sinistro.
- La larghezza corrente della sidebar viene ora condivisa anche con i controlli flottanti esterni all'app shell.
- Aggiunto un margine di sicurezza per mantenere l'icona interamente visibile sia con menu espanso sia con menu compresso.
- Il progresso del catalogo arriva al 100% quando il ciclo di sincronizzazione è terminato.
- La copertura effettiva e i titoli non reperiti o falliti restano visibili separatamente, senza bloccare artificialmente l'indicatore al 99%.
- Previsto un nuovo tentativo automatico nella sessione per i titoli non riusciti, oltre al comando manuale già disponibile.

WATCHVERSE 2.0.18 — FONTI PUBBLICHE PRECONFIGURATE

- Il pulsante AIvengers è ora centrato orizzontalmente nella sidebar, più in basso e leggermente più grande.
- Ricerca pubblica JustWatch Italia disponibile come fallback per ogni titolo, senza dichiarare disponibilità non verificata.
- Palinsesti TV italiani preconfigurati su TVmaze con controllo mirato e cache; i passaggi esatti vengono salvati nella sezione In TV.
- Siti ufficiali dei cinema preferiti configurati come fonte predefinita per programmazione e biglietteria.
- Il popup distingue ora fonte pronta, titoli controllati, dati effettivamente trovati e collegamenti ufficiali.
- TMDB resta opzionale: nessun token privato viene incorporato nel pacchetto.

WATCHVERSE 2.0.18 — CINEMA, SPAZIATURA E AIVENGERS

- Menu laterale comprimibile con stato persistente.
- Header con identità Watchverse centrata e profilo attivo sempre riconoscibile.
- Voce Profilo rimossa dalla navigazione: accesso tramite avatar/nome.
- Footer fisso con copyright Profilo 1 e versione 2.0.18.
- Torna su compatto e non sovrapposto al footer.
- Profilo a tab ridisegnati, con Statistiche e Importa/Esporta integrati.
- Ricerca cinema per città, raggio o geolocalizzazione consensuale; aggiunta manuale sale.
- Nuova presentazione grafica dei servizi streaming.
- Dati e fonti semplificati; rimosso il box Installazione.
- Assistente AIvengers con risposte locali e navigazione rapida.
- Contrasto dei toast stabilizzato su tutti i temi.
- Comando di compressione della sidebar ridotto a un controllo circolare sul bordo.
- AIvengers usa una nuova icona a scintille e una chat più compatta e responsive.
- Marchio Watchverse nell’header ampliato senza aumentare eccessivamente l’altezza della barra.
- Locandine e suggerimenti della sezione Cerca confinati nelle card, con ridimensionamento e ritaglio sicuri.
- Loader cinematografico bloccante per apertura profilo e cambio sezione, con messaggi contestuali e rispetto di “movimento ridotto”.
- Indicatore inline durante la ricerca nelle fonti pubbliche.

WATCHVERSE 2.0.14 — TEMI, DENSITÀ E ACCESSIBILITÀ

- Aggiunti sei temi predefiniti per profilo: Watchverse Original, Cinematic Adaptive, Cinema Classico, Midnight Neon, Editorial Light e Sistema.
- Watchverse Original resta il tema predefinito.
- Aggiunte densità Comoda e Compatta senza alterare la dimensione base del testo.
- Aggiunto footer con copyright, versione corrente e collegamenti informativi.
- Aggiunta pagina Dichiarazione di accessibilità con stato di conformità e problemi noti.
- Aggiunto report WCAG 2.2 completo con 86 criteri, raggruppamento per principi e linee guida, filtri, statistiche testuali e grafico.
- Aggiunte funzioni di stampa/salvataggio PDF e download JSON del report.
- Ridisegnate le sezioni Home “Continua a guardare” e “Nuovi episodi da recuperare” come rail di card compatte, con fino a 12 elementi e controlli orizzontali accessibili.
- Su tablet e smartphone le card si scorrono con touch o con i pulsanti avanti/indietro, mantenendo i collegamenti al catalogo completo.
- Aggiunto il pulsante flottante “Torna su” in tutte le pagine lunghe, adattato alla barra mobile e alle preferenze di movimento ridotto.
- Riorganizzata la pagina Profilo in sei tab per ridurre il carico informativo.
- Spostati città e raggio nella ricerca rapida dei cinema; streaming e canali TV influenzano soltanto la priorità dei risultati.
- Chiarito che la lingua preferita riguarda audio/versione del contenuto e non la lingua dell’interfaccia.
- Aggiunto un catalogo locale condiviso tra profili: descrizioni, immagini, cast, stagioni ed episodi vengono scaricati una sola volta e riutilizzati.
- Separati i dati statici del titolo dai dati personali del profilo, come visioni, valutazioni, preferiti, note e configurazioni.
- La ricerca mostra i titoli già disponibili sul dispositivo e permette di aggiungerli senza un nuovo download.
- Esteso il pannello fonti con catalogo, streaming Italia, palinsesti TV e programmazione cinema, senza simulare fonti non configurate.
- Il trailer apre soltanto un URL ufficiale diretto; non viene più proposta una ricerca generica su YouTube.

WATCHVERSE 2.0.13 — HOME, NAVIGAZIONE E PROFILO

- Aggiunto in Home un messaggio di benvenuto con il nome del profilo attivo.
- La voce Profilo è stata rimossa dal menu principale desktop e resta nel riquadro inferiore della sidebar.
- Il riquadro inferiore mostra sempre “Profilo”, mantenendo avatar e nome nel testo accessibile.
- Aggiunto il collegamento rapido “Cambia profilo” sotto nome e slogan di Watchverse.
- Ripristinata la voce principale Programmazione con pagina unificata per episodi, palinsesti TV e cinema.
- Su mobile Profilo resta disponibile come ultima voce della barra inferiore.
- Uniformata la spaziatura della pagina Profilo tra riepilogo e pannelli delle impostazioni.

Watchverse 2.0.11
- Aggiunta sezione “Guarda il trailer” nelle schede di film e serie.
- Quando TMDB è configurato viene scelto automaticamente il trailer YouTube ufficiale, con preferenza per l’italiano.
- Senza un URL ufficiale configurato viene indicato chiaramente che il trailer ufficiale non è disponibile; non viene aperta una ricerca generica.

Watchverse 2.0.11
- Programmazione Italia automatica tramite palinsesti pubblici TVmaze, con stima fuso orario e correzione manuale prioritaria.
- Notifiche su tre righe: episodio, programmazione USA e programmazione Italia.
- Schede persona complete con foto, biografia, dati anagrafici, link esterni e filmografia filtrabile.
- Rimosso definitivamente lo sfondo esteso dai dettagli: il banner resta confinato in alto.
- Spiegazione chiara del token TMDB e del proxy server.

- Corretto il flusso del consenso alla posizione con controllo del contesto sicuro, stato dei permessi e messaggi di errore specifici.
- Ridisegnata la ricerca cinema: icona posizione nel campo città, submit primario e warning accessibili.
- Applicata una scala di spaziatura coerente tra card, form, sezioni e pulsanti di salvataggio.
- AIvengers ha ora un pannello leggermente più largo della sidebar, contenuti ridistribuiti su griglia e nessuno scorrimento orizzontale.

WATCHVERSE 2.0.11 — CALENDARIO, NOTIFICHE E DETTAGLI
- Calendario raggruppato per giorno con Oggi/Domani e giorno della settimana.
- Locandina della serie nelle notifiche interne e push.
- Uscita originale e disponibilità italiana mostrate separatamente.
- Regola italiana facoltativa per piattaforma, ritardo e orario.
- Corretto il posizionamento della locandina nei dettagli: non viene più usata come sfondo invasivo.
- Banner superiore conservato; contenuti su sfondo uniforme.

WATCHVERSE 2.0.8 — STATISTICHE FILM/SERIE E VOTI TV TIME

- Statistiche divise in Riepilogo, Film e Serie TV.
- Filtro periodo realmente funzionante.
- Distribuzioni dei voti separate.
- Conversione dei cinque codici voto storici TV Time nella scala 1–5 stelle.
- Migrazione automatica delle librerie già importate con versioni precedenti.
- KPI e grafici specifici per film e serie.

WATCHVERSE 2.0.8 — HOME COMPATTA E STATO METADATI

- Rimossi i grandi banner da Home e ricerca; introdotte schede compatte con mini-locandina e testo leggibile.
- “Continua a guardare” contiene le ultime 5 serie con attività, ordinate per data dell’ultimo episodio segnato.
- Separati i nuovi episodi da recuperare e la watchlist film.
- Aggiunto nell’header un indicatore globale di avanzamento dei metadati, con dettaglio di locandine, descrizioni, cast, episodi e tentativi falliti.
- Aggiornamento automatico di core, cast ed episodi con cache persistente.
- Concorrenza ridotta a due richieste e rendering in background diradato per migliorare le prestazioni.

WATCHVERSE 2.0.6 — HOME E RICERCA PIÙ LEGGIBILI

- Sostituiti i grandi banner dei prossimi episodi con schede compatte.
- Ogni scheda mostra chiaramente titolo serie, stagione/episodio, titolo episodio, durata e avanzamento.
- I risultati di ricerca usano mini-locandine verticali, tipo contenuto, anno, titolo e descrizione.
- Corretto il posizionamento delle immagini che poteva farle espandere sull’intera riga.
- Layout responsive ottimizzato per desktop, Chromebook e Android.

WATCHVERSE 2.0.5 — TITOLI ITALIANI, METADATI AUTOMATICI E FILTRI SEMPLIFICATI

Novità principali
- “Tutte/Tutti” è ora l’ultimo filtro nelle librerie Film e Serie.
- Rimossi i filtri Serie “In pausa” e “Abbandonate”. Gli stati già salvati restano integri.
- I titoli vengono localizzati in italiano quando una corrispondenza affidabile è disponibile.
- Nel dettaglio viene mostrato anche il titolo originale.
- La ricerca interna considera titolo italiano, titolo originale e alias.
- Metadati film: Wikipedia italiana con fallback Wikipedia inglese e Wikidata.
- Metadati serie: TVmaze per episodi/cast, Wikipedia italiana con fallback inglese per titolo e descrizione.
- Il cast viene caricato automaticamente in background quando si apre il dettaglio; il pulsante manuale resta disponibile.
- Descrizioni, locandine e cast già acquisiti vengono salvati e non riscaricati a ogni login.
- Gli episodi delle serie ancora in corso vengono aggiornati periodicamente; per le serie concluse la frequenza è molto più bassa.
- Aggiornamento progressivo dell’intera libreria in background, senza bloccare la navigazione.
- Coda metadati concorrente limitata, richieste deduplicate, rerender raggruppati e caricamento differito delle immagini.

Fonti pubbliche
- TVmaze: serie, episodi, cast e immagini.
- Wikipedia IT/EN, Wikidata e Wikimedia Commons: titoli localizzati, descrizioni, locandine e cast dei film.
- TMDB/JustWatch resta facoltativo per i cataloghi streaming italiani.
