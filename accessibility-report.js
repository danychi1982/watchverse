(function(root){
  root.WATCHVERSE_WCAG_REPORT = {
  "standard": "WCAG 2.2",
  "targetLevel": "AA",
  "version": "1.0.0",
  "evaluationDate": "2026-07-05",
  "scope": "Watchverse 2.0.27, applicazione web locale/PWA: autenticazione, selezione profilo, home, librerie, ricerca, programmazione, dettagli, profilo a tab, statistiche, importazione, assistente AIvengers, navigazione comprimibile, accessibilità e modali principali.",
  "methods": [
    "Revisione del codice HTML, CSS e JavaScript",
    "Test automatici di sintassi, regressione e struttura DOM/CSS sui componenti principali",
    "Revisione della navigazione da tastiera, dell’ordine del focus e degli attributi ARIA nel codice",
    "Calcolo automatico del contrasto delle palette e revisione dei breakpoint responsive",
    "Mappatura manuale dei criteri WCAG 2.2",
    "Revisione strutturale dei nuovi componenti: menu comprimibile, footer fisso, profilo a tab, ricerca cinema e chat AIvengers",
    "Verifica delle varianti tematiche The Last of Us e Buffy: contrasto delle palette, leggibilità di header/sidebar, icone e loader con movimento ridotto."
  ],
  "limitations": [
    "Non è stato eseguito un collaudo end-to-end completo su browser e dispositivi reali né con più screen reader; i criteri che richiedono queste prove restano non verificati o sono indicati con una limitazione.",
    "I contenuti e i siti esterni aperti da Watchverse non rientrano nell’ambito.",
    "I dati importati dagli utenti e i metadati di terze parti possono introdurre lingue o testi non prevedibili."
  ],
  "principles": [
    {
      "id": "1",
      "name": "Percepibile",
      "description": "Le informazioni e i componenti dell’interfaccia devono essere presentabili in modi percepibili."
    },
    {
      "id": "2",
      "name": "Utilizzabile",
      "description": "I componenti e la navigazione devono poter essere utilizzati."
    },
    {
      "id": "3",
      "name": "Comprensibile",
      "description": "Le informazioni e il funzionamento devono essere comprensibili."
    },
    {
      "id": "4",
      "name": "Robusto",
      "description": "Il contenuto deve essere interpretabile in modo affidabile dalle tecnologie assistive."
    }
  ],
  "guidelines": [
    {
      "id": "1.1",
      "name": "Alternative testuali"
    },
    {
      "id": "1.2",
      "name": "Contenuti multimediali temporizzati"
    },
    {
      "id": "1.3",
      "name": "Adattabile"
    },
    {
      "id": "1.4",
      "name": "Distinguibile"
    },
    {
      "id": "2.1",
      "name": "Accessibile da tastiera"
    },
    {
      "id": "2.2",
      "name": "Tempo sufficiente"
    },
    {
      "id": "2.3",
      "name": "Convulsioni e reazioni fisiche"
    },
    {
      "id": "2.4",
      "name": "Navigabile"
    },
    {
      "id": "2.5",
      "name": "Modalità di input"
    },
    {
      "id": "3.1",
      "name": "Leggibile"
    },
    {
      "id": "3.2",
      "name": "Prevedibile"
    },
    {
      "id": "3.3",
      "name": "Assistenza nell’inserimento"
    },
    {
      "id": "4.1",
      "name": "Compatibile"
    }
  ],
  "criteria": [
    {
      "guideline": "1.1",
      "id": "1.1.1",
      "title": "Contenuti non testuali",
      "level": "A",
      "status": "passed",
      "note": "Immagini informative hanno alternative; immagini ridondanti o decorative sono escluse correttamente dalle tecnologie assistive."
    },
    {
      "guideline": "1.2",
      "id": "1.2.1",
      "title": "Solo audio e solo video (preregistrati)",
      "level": "A",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.2",
      "title": "Sottotitoli (preregistrati)",
      "level": "A",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.3",
      "title": "Audiodescrizione o alternativa multimediale (preregistrata)",
      "level": "A",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.4",
      "title": "Sottotitoli (in diretta)",
      "level": "AA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.5",
      "title": "Audiodescrizione (preregistrata)",
      "level": "AA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.6",
      "title": "Lingua dei segni (preregistrata)",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.7",
      "title": "Audiodescrizione estesa (preregistrata)",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.8",
      "title": "Alternativa multimediale (preregistrata)",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.2",
      "id": "1.2.9",
      "title": "Solo audio (in diretta)",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Watchverse non incorpora contenuti audio o video; apre eventuali trailer su servizi esterni, fuori dall’ambito della verifica."
    },
    {
      "guideline": "1.3",
      "id": "1.3.1",
      "title": "Informazioni e relazioni",
      "level": "A",
      "status": "passed",
      "note": "Titoli, sezioni, elenchi, etichette e landmark sono rappresentati semanticamente."
    },
    {
      "guideline": "1.3",
      "id": "1.3.2",
      "title": "Sequenza significativa",
      "level": "A",
      "status": "passed",
      "note": "L’ordine del DOM conserva la sequenza di lettura nei layout desktop e mobili."
    },
    {
      "guideline": "1.3",
      "id": "1.3.3",
      "title": "Caratteristiche sensoriali",
      "level": "A",
      "status": "passed",
      "note": "Le istruzioni non dipendono esclusivamente da posizione, forma, colore o suono."
    },
    {
      "guideline": "1.3",
      "id": "1.3.4",
      "title": "Orientamento",
      "level": "AA",
      "status": "passed",
      "note": "L’app non blocca l’orientamento del dispositivo."
    },
    {
      "guideline": "1.3",
      "id": "1.3.5",
      "title": "Identificare lo scopo degli input",
      "level": "AA",
      "status": "passed",
      "note": "I campi anagrafici e di autenticazione usano etichette e autocomplete appropriati."
    },
    {
      "guideline": "1.3",
      "id": "1.3.6",
      "title": "Identificare lo scopo",
      "level": "AAA",
      "status": "not-verified",
      "note": "È stata verificata la semantica HTML principale; non è stato completato un test esteso con personalizzazione assistiva dei simboli."
    },
    {
      "guideline": "1.4",
      "id": "1.4.1",
      "title": "Uso del colore",
      "level": "A",
      "status": "passed",
      "note": "Stati, errori e selezioni sono accompagnati da testo, icone o forma, non dal solo colore."
    },
    {
      "guideline": "1.4",
      "id": "1.4.2",
      "title": "Controllo dell’audio",
      "level": "A",
      "status": "not-applicable",
      "note": "L’app non avvia audio automaticamente."
    },
    {
      "guideline": "1.4",
      "id": "1.4.3",
      "title": "Contrasto minimo",
      "level": "AA",
      "status": "passed",
      "note": "Le palette dei temi predefiniti sono state controllate sui colori testuali e dei controlli principali per il livello AA."
    },
    {
      "guideline": "1.4",
      "id": "1.4.4",
      "title": "Ridimensionamento del testo",
      "level": "AA",
      "status": "passed",
      "note": "Il contenuto resta utilizzabile con zoom del testo e del browser fino al 200% nei campioni verificati."
    },
    {
      "guideline": "1.4",
      "id": "1.4.5",
      "title": "Immagini di testo",
      "level": "AA",
      "status": "passed",
      "note": "L’interfaccia usa testo HTML; locandine e marchi sono contenuti editoriali o identificativi."
    },
    {
      "guideline": "1.4",
      "id": "1.4.6",
      "title": "Contrasto avanzato",
      "level": "AAA",
      "status": "not-verified",
      "note": "Il contrasto AA è stato verificato; non tutte le combinazioni secondarie sono state certificate rispetto alla soglia AAA."
    },
    {
      "guideline": "1.4",
      "id": "1.4.7",
      "title": "Audio di sottofondo basso o assente",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Non sono presenti contenuti audio prodotti da Watchverse."
    },
    {
      "guideline": "1.4",
      "id": "1.4.8",
      "title": "Presentazione visiva",
      "level": "AAA",
      "status": "failed",
      "note": "Non è disponibile un controllo completo di larghezza riga, interlinea e colori scelti dall’utente; sono disponibili solo temi e densità predefiniti."
    },
    {
      "guideline": "1.4",
      "id": "1.4.9",
      "title": "Immagini di testo senza eccezioni",
      "level": "AAA",
      "status": "passed",
      "note": "I comandi e i contenuti dell’interfaccia non sono resi come immagini di testo."
    },
    {
      "guideline": "1.4",
      "id": "1.4.10",
      "title": "Ridisposizione",
      "level": "AA",
      "status": "passed",
      "note": "I layout verificati si ridispongono senza perdita di contenuto a 320 CSS px e con zoom equivalente."
    },
    {
      "guideline": "1.4",
      "id": "1.4.11",
      "title": "Contrasto non testuale",
      "level": "AA",
      "status": "passed",
      "note": "Bordi, focus, controlli e stati interattivi principali mantengono una distinzione sufficiente nei temi forniti."
    },
    {
      "guideline": "1.4",
      "id": "1.4.12",
      "title": "Spaziatura del testo",
      "level": "AA",
      "status": "passed",
      "note": "Le prove con spaziatura WCAG non causano sovrapposizioni o perdita di informazioni nei campioni verificati."
    },
    {
      "guideline": "1.4",
      "id": "1.4.13",
      "title": "Contenuto al passaggio o al focus",
      "level": "AA",
      "status": "passed",
      "note": "Non sono presenti pannelli essenziali attivati solo da hover; i contenuti interattivi rimangono raggiungibili da tastiera."
    },
    {
      "guideline": "2.1",
      "id": "2.1.1",
      "title": "Tastiera",
      "level": "A",
      "status": "passed",
      "note": "Navigazione, modali, selettori tema, rail orizzontali e azioni principali sono utilizzabili da tastiera."
    },
    {
      "guideline": "2.1",
      "id": "2.1.2",
      "title": "Nessun blocco della tastiera",
      "level": "A",
      "status": "passed",
      "note": "Non sono stati rilevati focus trap non richiudibili nei flussi verificati."
    },
    {
      "guideline": "2.1",
      "id": "2.1.3",
      "title": "Tastiera senza eccezioni",
      "level": "AAA",
      "status": "passed",
      "note": "Non sono presenti funzioni che richiedano input analogico o gesti non riproducibili da tastiera."
    },
    {
      "guideline": "2.1",
      "id": "2.1.4",
      "title": "Scorciatoie con tasti carattere",
      "level": "A",
      "status": "not-applicable",
      "note": "Watchverse non definisce scorciatoie basate su singoli caratteri."
    },
    {
      "guideline": "2.2",
      "id": "2.2.1",
      "title": "Regolazione dei limiti di tempo",
      "level": "A",
      "status": "not-applicable",
      "note": "Non sono imposti limiti di tempo durante l’uso ordinario."
    },
    {
      "guideline": "2.2",
      "id": "2.2.2",
      "title": "Pausa, arresto, nascondi",
      "level": "A",
      "status": "passed",
      "note": "Le animazioni non veicolano informazioni essenziali e rispettano prefers-reduced-motion."
    },
    {
      "guideline": "2.2",
      "id": "2.2.3",
      "title": "Nessun limite di tempo",
      "level": "AAA",
      "status": "passed",
      "note": "I processi locali non scadono durante la compilazione; la sessione lunga non comporta perdita dei dati salvati."
    },
    {
      "guideline": "2.2",
      "id": "2.2.4",
      "title": "Interruzioni",
      "level": "AAA",
      "status": "passed",
      "note": "Le notifiche sono configurabili per profilo e non interrompono obbligatoriamente il flusso."
    },
    {
      "guideline": "2.2",
      "id": "2.2.5",
      "title": "Nuova autenticazione",
      "level": "AAA",
      "status": "passed",
      "note": "Dopo una nuova autenticazione i dati locali salvati restano disponibili."
    },
    {
      "guideline": "2.2",
      "id": "2.2.6",
      "title": "Timeout",
      "level": "AAA",
      "status": "passed",
      "note": "Non sono presenti avvisi di timeout applicativi perché non sono usati timeout brevi."
    },
    {
      "guideline": "2.3",
      "id": "2.3.1",
      "title": "Tre lampeggi o sotto soglia",
      "level": "A",
      "status": "passed",
      "note": "Non sono presenti lampeggi rapidi o contenuti stroboscopici."
    },
    {
      "guideline": "2.3",
      "id": "2.3.2",
      "title": "Tre lampeggi",
      "level": "AAA",
      "status": "passed",
      "note": "Non sono presenti lampeggi rapidi."
    },
    {
      "guideline": "2.3",
      "id": "2.3.3",
      "title": "Animazione da interazione",
      "level": "AAA",
      "status": "passed",
      "note": "Le animazioni sono ridotte con prefers-reduced-motion e non sono indispensabili all’uso."
    },
    {
      "guideline": "2.4",
      "id": "2.4.1",
      "title": "Salto di blocchi",
      "level": "A",
      "status": "passed",
      "note": "È disponibile un collegamento “Vai al contenuto”, sono usati landmark di navigazione e contenuto e le pagine lunghe offrono un comando “Torna su”."
    },
    {
      "guideline": "2.4",
      "id": "2.4.2",
      "title": "Titolo della pagina",
      "level": "A",
      "status": "passed",
      "note": "Il titolo del documento viene aggiornato per ogni schermata."
    },
    {
      "guideline": "2.4",
      "id": "2.4.3",
      "title": "Ordine del focus",
      "level": "A",
      "status": "passed",
      "note": "L’ordine del focus segue l’ordine visivo e logico nei flussi campionati."
    },
    {
      "guideline": "2.4",
      "id": "2.4.4",
      "title": "Scopo del collegamento nel contesto",
      "level": "A",
      "status": "passed",
      "note": "Lo scopo dei collegamenti è comprensibile dal testo e dal contesto immediato."
    },
    {
      "guideline": "2.4",
      "id": "2.4.5",
      "title": "Modalità multiple",
      "level": "AA",
      "status": "passed",
      "note": "Le aree principali sono raggiungibili dalla navigazione persistente; i titoli sono reperibili anche dalla ricerca."
    },
    {
      "guideline": "2.4",
      "id": "2.4.6",
      "title": "Intestazioni ed etichette",
      "level": "AA",
      "status": "passed",
      "note": "Intestazioni, filtri e campi descrivono il contenuto o l’azione prevista."
    },
    {
      "guideline": "2.4",
      "id": "2.4.7",
      "title": "Focus visibile",
      "level": "AA",
      "status": "passed",
      "note": "Il focus tastiera usa un contorno ad alto contrasto in tutti i temi."
    },
    {
      "guideline": "2.4",
      "id": "2.4.8",
      "title": "Posizione",
      "level": "AAA",
      "status": "failed",
      "note": "Le pagine di dettaglio non includono ancora breadcrumb completi; la sezione attiva e il titolo indicano solo una posizione parziale."
    },
    {
      "guideline": "2.4",
      "id": "2.4.9",
      "title": "Scopo del collegamento dal solo testo",
      "level": "AAA",
      "status": "failed",
      "note": "Alcuni collegamenti brevi, come “Apri” o “Dettagli”, non sono univoci se estratti dal contesto."
    },
    {
      "guideline": "2.4",
      "id": "2.4.10",
      "title": "Intestazioni di sezione",
      "level": "AAA",
      "status": "passed",
      "note": "Le sezioni principali usano intestazioni descrittive."
    },
    {
      "guideline": "2.4",
      "id": "2.4.11",
      "title": "Focus non oscurato (minimo)",
      "level": "AA",
      "status": "passed",
      "note": "Scroll padding e margini di focus evitano che gli elementi focalizzati siano interamente coperti dalle barre persistenti."
    },
    {
      "guideline": "2.4",
      "id": "2.4.12",
      "title": "Focus non oscurato (avanzato)",
      "level": "AAA",
      "status": "not-verified",
      "note": "È stata verificata la non copertura completa; non ogni combinazione di zoom, viewport e tastiera virtuale è stata provata."
    },
    {
      "guideline": "2.4",
      "id": "2.4.13",
      "title": "Aspetto del focus",
      "level": "AAA",
      "status": "passed",
      "note": "Il contorno di focus è spesso 3 px, esterno al controllo e con contrasto elevato."
    },
    {
      "guideline": "2.5",
      "id": "2.5.1",
      "title": "Gesti del puntatore",
      "level": "A",
      "status": "not-applicable",
      "note": "Non sono richiesti gesti multipunto o dipendenti dal percorso."
    },
    {
      "guideline": "2.5",
      "id": "2.5.2",
      "title": "Annullamento del puntatore",
      "level": "A",
      "status": "passed",
      "note": "Le azioni avvengono al click/rilascio e le operazioni distruttive prevedono conferma."
    },
    {
      "guideline": "2.5",
      "id": "2.5.3",
      "title": "Etichetta nel nome",
      "level": "A",
      "status": "passed",
      "note": "Il nome accessibile dei controlli contiene l’etichetta visibile."
    },
    {
      "guideline": "2.5",
      "id": "2.5.4",
      "title": "Azionamento tramite movimento",
      "level": "A",
      "status": "not-applicable",
      "note": "Non sono usati sensori di movimento o inclinazione."
    },
    {
      "guideline": "2.5",
      "id": "2.5.5",
      "title": "Dimensione del bersaglio avanzata",
      "level": "AAA",
      "status": "failed",
      "note": "Alcuni collegamenti testuali e controlli compatti non raggiungono 44×44 CSS px."
    },
    {
      "guideline": "2.5",
      "id": "2.5.6",
      "title": "Meccanismi di input simultanei",
      "level": "AAA",
      "status": "passed",
      "note": "L’app non limita mouse, touch, tastiera o tecnologie assistive in base al metodo usato."
    },
    {
      "guideline": "2.5",
      "id": "2.5.7",
      "title": "Movimenti di trascinamento",
      "level": "AA",
      "status": "passed",
      "note": "L’importazione tramite trascinamento ha anche alternative click e tastiera."
    },
    {
      "guideline": "2.5",
      "id": "2.5.8",
      "title": "Dimensione minima del bersaglio",
      "level": "AA",
      "status": "passed",
      "note": "I controlli interattivi campionati rispettano almeno 24×24 CSS px o hanno spaziatura equivalente."
    },
    {
      "guideline": "3.1",
      "id": "3.1.1",
      "title": "Lingua della pagina",
      "level": "A",
      "status": "passed",
      "note": "Il documento dichiara la lingua italiana."
    },
    {
      "guideline": "3.1",
      "id": "3.1.2",
      "title": "Lingua delle parti",
      "level": "AA",
      "status": "failed",
      "note": "Titoli originali, nomi di episodi e metadati esterni possono cambiare lingua senza un attributo lang affidabile."
    },
    {
      "guideline": "3.1",
      "id": "3.1.3",
      "title": "Parole inusuali",
      "level": "AAA",
      "status": "not-verified",
      "note": "Non è stato completato un glossario per tutti i termini tecnici e cinematografici."
    },
    {
      "guideline": "3.1",
      "id": "3.1.4",
      "title": "Abbreviazioni",
      "level": "AAA",
      "status": "failed",
      "note": "Abbreviazioni come TMDB, PWA, PIN e GDPR non sono espanse a ogni prima occorrenza o tramite elemento abbr."
    },
    {
      "guideline": "3.1",
      "id": "3.1.5",
      "title": "Livello di lettura",
      "level": "AAA",
      "status": "not-verified",
      "note": "I testi sono scritti in linguaggio corrente, ma non è stata eseguita una valutazione formale del livello di lettura."
    },
    {
      "guideline": "3.1",
      "id": "3.1.6",
      "title": "Pronuncia",
      "level": "AAA",
      "status": "not-applicable",
      "note": "Non sono presenti parole la cui pronuncia sia necessaria per comprenderne il significato nel contesto operativo."
    },
    {
      "guideline": "3.2",
      "id": "3.2.1",
      "title": "Al focus",
      "level": "A",
      "status": "passed",
      "note": "Il solo focus non provoca cambi di pagina o azioni."
    },
    {
      "guideline": "3.2",
      "id": "3.2.2",
      "title": "All’inserimento",
      "level": "A",
      "status": "passed",
      "note": "I cambi di contesto avvengono su azione esplicita; tema e densità mostrano un’anteprima immediata senza spostare la pagina."
    },
    {
      "guideline": "3.2",
      "id": "3.2.3",
      "title": "Navigazione coerente",
      "level": "AA",
      "status": "passed",
      "note": "La navigazione principale conserva ordine e denominazioni tra le schermate."
    },
    {
      "guideline": "3.2",
      "id": "3.2.4",
      "title": "Identificazione coerente",
      "level": "AA",
      "status": "passed",
      "note": "Azioni con lo stesso scopo usano nomi e rappresentazioni coerenti."
    },
    {
      "guideline": "3.2",
      "id": "3.2.5",
      "title": "Cambiamento su richiesta",
      "level": "AAA",
      "status": "passed",
      "note": "I cambi di pagina e le aperture esterne dipendono da un comando esplicito."
    },
    {
      "guideline": "3.2",
      "id": "3.2.6",
      "title": "Aiuto coerente",
      "level": "A",
      "status": "not-applicable",
      "note": "Non è ancora presente un meccanismo di assistenza ripetuto su più pagine; il link Accessibilità è informativo, non un canale di supporto."
    },
    {
      "guideline": "3.3",
      "id": "3.3.1",
      "title": "Identificazione degli errori",
      "level": "A",
      "status": "passed",
      "note": "Gli errori di autenticazione, importazione e validazione sono comunicati con testo."
    },
    {
      "guideline": "3.3",
      "id": "3.3.2",
      "title": "Etichette o istruzioni",
      "level": "A",
      "status": "passed",
      "note": "I campi hanno etichette associate e istruzioni dove necessarie."
    },
    {
      "guideline": "3.3",
      "id": "3.3.3",
      "title": "Suggerimenti per gli errori",
      "level": "AA",
      "status": "failed",
      "note": "Alcuni errori provenienti da fonti esterne o importazioni indicano il problema ma non sempre propongono una correzione specifica."
    },
    {
      "guideline": "3.3",
      "id": "3.3.4",
      "title": "Prevenzione degli errori legali, finanziari o sui dati",
      "level": "AA",
      "status": "passed",
      "note": "Le eliminazioni di dati richiedono conferma e, per i profili, verifica della password; non sono presenti operazioni finanziarie o legali."
    },
    {
      "guideline": "3.3",
      "id": "3.3.5",
      "title": "Aiuto",
      "level": "AAA",
      "status": "not-verified",
      "note": "Manuale e messaggi contestuali sono disponibili, ma non è stata verificata una copertura di aiuto per ogni input complesso."
    },
    {
      "guideline": "3.3",
      "id": "3.3.6",
      "title": "Prevenzione degli errori per tutti gli invii",
      "level": "AAA",
      "status": "passed",
      "note": "Le azioni irreversibili sono confermate; le altre modifiche sono reversibili o modificabili."
    },
    {
      "guideline": "3.3",
      "id": "3.3.7",
      "title": "Inserimento ridondante",
      "level": "A",
      "status": "passed",
      "note": "I dati già disponibili nel profilo sono riutilizzati; le ripetizioni di password servono a prevenire errori essenziali."
    },
    {
      "guideline": "3.3",
      "id": "3.3.8",
      "title": "Autenticazione accessibile (minimo)",
      "level": "AA",
      "status": "passed",
      "note": "Sono consentiti password manager e incolla; non sono richiesti test cognitivi o trascrizioni."
    },
    {
      "guideline": "3.3",
      "id": "3.3.9",
      "title": "Autenticazione accessibile (avanzato)",
      "level": "AAA",
      "status": "passed",
      "note": "L’autenticazione non richiede riconoscimento di oggetti o trascrizione; le credenziali possono essere compilate automaticamente."
    },
    {
      "guideline": "4.1",
      "id": "4.1.2",
      "title": "Nome, ruolo, valore",
      "level": "A",
      "status": "passed",
      "note": "I controlli personalizzati campionati espongono nome, stato e ruolo; i pannelli espandibili aggiornano aria-expanded."
    },
    {
      "guideline": "4.1",
      "id": "4.1.3",
      "title": "Messaggi di stato",
      "level": "AA",
      "status": "failed",
      "note": "Toast ed errori principali sono annunciati, ma alcuni aggiornamenti in background dei metadati e delle liste non sono ancora comunicati in modo uniforme alle tecnologie assistive."
    }
  ]
};
})(typeof window!=='undefined'?window:globalThis);
