# Backlog Watchverse

> **Documento storico e di contesto.** Il backlog operativo aggiornato è gestito in Jira nel progetto `WVERSE`. Stati, sprint, release, assegnatari, componenti e stime riportati nelle sezioni storiche potrebbero non essere aggiornati.

> Stato corrente: la sezione **Stato corrente dopo le attivita autonome** in fondo al documento prevale sulle righe storiche.

Questo file raccoglie le attivita completate, in corso e ancora aperte. Non rappresenta un piano temporale vincolante: priorita, stato, owner ed effort aiutano a decidere il prossimo intervento. Una voce si considera completata solo dopo:

- implementazione completata;
- test automatici eseguiti;
- build verificata;
- pubblicazione su GitHub Pages o ambiente concordato;
- conferma funzionale di Daniela.

## Mappatura verso Jira

Le voci di questo documento sono state consolidate nel progetto Jira `WVERSE`. Jira è la fonte operativa per il lavoro corrente; questo file conserva il razionale, lo storico degli interventi e le osservazioni tecniche che hanno portato alla scomposizione delle issue.

| Area storica | Issue Jira di riferimento |
| --- | --- |
| Autenticazione e profili | `WVERSE-1` Epic; Story `WVERSE-9`, `WVERSE-14`–`WVERSE-17` |
| Home, libreria, progressi e preferiti | `WVERSE-2` Epic; Story `WVERSE-18`–`WVERSE-25` |
| Ricerca e raccomandazioni | `WVERSE-3` Epic; Story `WVERSE-26`–`WVERSE-29` |
| Metadati e fonti pubbliche | `WVERSE-4` Epic; Story `WVERSE-30`–`WVERSE-33` |
| Import, export e backup | `WVERSE-5` Epic; Story `WVERSE-34`–`WVERSE-35` |
| Sincronizzazione cloud e offline | `WVERSE-6` Epic; Story `WVERSE-36`–`WVERSE-38` |
| Performance e PWA | `WVERSE-7` Epic; Story `WVERSE-39`–`WVERSE-41` |
| Identità visiva e design system | `WVERSE-8` Epic; Story `WVERSE-42` |
| Task operativi | `WVERSE-164`–`WVERSE-170` |
| Bug censiti | `WVERSE-171`–`WVERSE-178` |

I dettagli di analisi funzionale e tecnica sono versionati in `docs/knowledge/analysis/` e referenziati dai subtask Jira di Analisi e Progettazione. Le nuove modifiche operative devono essere registrate prima in Jira; questo documento va aggiornato solo per decisioni, contesto tecnico o storico significativo.

## Registro completo degli interventi

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
| --- | --- | --- | --- | --- | --- |
| Autenticazione Supabase e account unico | Alta | Parzialmente completato | Daniela | Basso | Validare su piu dispositivi il nuovo PIN cloud e il link di recupero dopo aver configurato l'URL di redirect in Supabase. |
| Messaggi di errore autenticazione | Alta | Completato | Codex | Basso | Nessuna attivita tecnica residua; verificare il testo nella prossima pubblicazione. |
| Visibilita password e PIN | Alta | Completato | Codex | Medio | Nessuna attivita tecnica residua. |
| Allineamento icone mostra/nascondi | Alta | Parzialmente completato | Codex | Basso | Uniformare tutti i campi password e PIN affinche l’icona resti dentro il bordo del campo, come nella login. |
| Logout globale dopo cambio password | Alta | Completato | Codex | Medio | Nessuna attivita tecnica residua. |
| Profili Daniela ed Elena | Alta | Completato | Codex | Basso | Nessuna attività tecnica residua. |
| Catalogo e prima sincronizzazione cloud | Alta | Completato | Codex | Medio | Nessuna attività tecnica residua. |
| Sincronizzazione cloud bidirezionale | Alta | Parzialmente completato | Daniela | Alto | Validare due dispositivi contemporanei e un conflitto reale. |
| IndexedDB come cache offline | Alta | Parzialmente completato | Daniela | Alto | Validare offline/online e confermare che la libreria resti disponibile mentre la rete è assente. |
| Proxy TMDB/JustWatch | Alta | Completato | Condiviso | Alto | Nessuna attività tecnica residua. |
| Trailer e disponibilita streaming | Alta | Parzialmente completato | Daniela | Medio | Verificare copertura reale su un campione di film/serie e stati senza risultato. |
| Programmazione cinema italiana | Alta | Parzialmente completato | Daniela | Alto | Verificare sui cinema configurati i casi con orari mancanti, come Supergirl. |
| Retry metadati e scelta dell'utente | Alta | Parzialmente completato | Daniela | Medio | Verificare il nuovo flusso manuale `Riprova` / `Ignora per ora`. |
| Audit responsive mobile | Alta | Parzialmente completato | Daniela | Alto | Validare Home, librerie, dettagli, profilo, import e ricerca su Samsung Galaxy S26+. |
| Login mobile senza scroll | Alta | Da fare | Condiviso | Medio | Rimuovere la frase non necessaria, riequilibrare gli spazi e verificare la schermata senza scroll su Samsung Galaxy S26+. |
| Gestione tastiera virtuale nei form | Alta | Da fare | Condiviso | Alto | Adeguare viewport, focus e scroll automatico affinche la tastiera non copra mai il campo attivo. |
| Test E2E mobile | Alta | Parzialmente completato | Daniela | Medio | Avviare Chrome in modalità CDP ed eseguire la suite sui flussi critici. |
| Runner E2E senza blocco `spawn EPERM` | Alta | Da fare | Codex | Medio | Risolvere il fixture browser che non apre il gate profili su GitHub Actions; fino ad allora i browser E2E restano sospesi. |
| Stabilizzazione test E2E su `main` | Alta | Da fare | Codex | Medio | Correggere il test browser fallito e riattivare il lancio solo dopo una esecuzione completa verde. |
| Contrasto barra di navigazione mobile | Alta | Da fare | Codex | Basso | Rendere distinguibili sfondo, icona e testo dello stato selezionato su Samsung Galaxy S26+. |
| Audit contrasto interfaccia e importazione | Alta | Da fare | Codex | Medio | Correggere il contrasto di “Elementi pronti” e del relativo valore nel riepilogo importazione, quindi verificare sistematicamente testi, badge, link, focus e indicatori su tutto il sito. |
| Conferma sostituzione dati in importazione | Alta | Parzialmente completato | Daniela | Medio | Verificare sulla versione pubblicata il dialog interno, il focus, il blocco dello scroll e i due esiti `Annulla` / `Continua`. |
| Responsive schede su Samsung Galaxy S26+ | Alta | Parzialmente completato | Codex | Alto | Eliminare ridondanza banner/locandina su mobile, contenere overflow e ridimensionare il cast; resta la verifica E2E sul dispositivo target. |
| VAPT e hardening del deploy | Alta | Parzialmente completato | Daniela | Alto | Eseguire una scansione VAPT/headers sul sito pubblicato e verificare i risultati. |
| Filtri e organizzazione libreria | Media | Completato | Codex | Medio | Nessuna attività tecnica residua. |
| Indicatori di caricamento | Media | Parzialmente completato | Daniela | Medio | Validare su rete lenta i loader nelle sezioni e nei cambi filtro. |
| Schede dettaglio ispirate a Showly | Media | Parzialmente completato | Daniela | Alto | Validare su mobile hero, cast, episodi, provider, trailer e contenuti correlati. |
| Progresso serie ed episodi residui | Media | Parzialmente completato | Daniela | Medio | Verificare la resa delle card e dei dettagli con serie reali. |
| Calendario, watchlist e ricerca globale | Media | Completato | Codex | Alto | Nessuna attività tecnica residua. |
| Pacchetto favicon/PWA | Bassa | Parzialmente completato | Daniela | Basso | Verificare icone e installazione PWA su Android e GitHub Pages. |
| Trasparenza del logo nella login | Media | Da fare | Codex | Basso | Rendere trasparente lo sfondo dell'asset o integrarlo correttamente con lo sfondo del box della login. |
| Redirect dopo rimozione dalla libreria | Media | Da fare | Codex | Basso | Dopo la rimozione dal dettaglio, reindirizzare alla lista Film/Serie oppure alla Home invece di lasciare la rotta del titolo eliminato. |
| Refix test ricerca persone | Media | Da fare | Codex | Basso | Correggere il test funzionale e il contratto della ricerca per impedire l'inserimento delle persone nel catalogo. |
| Proposte basate sui gusti senza titoli duplicati | Media | Da fare | Codex | Medio | Escludere sempre film e serie già presenti nella libreria dalle proposte personalizzate. |
| Ricerca House of Cards più pertinente | Media | Da fare | Codex | Medio | Limitare i risultati ai titoli film/serie pertinenti, filtrare le persone e ridurre i falsi positivi restituiti dai provider. |
| Sincronizzazione cloud preferiti e modifiche profilo | Alta | Da fare | Codex | Medio | Correggere il salvataggio cloud dei preferiti e verificare persistenza dopo pulizia cache e su più dispositivi. |
| Ricerca Serie e tastiera mobile | Alta | Da fare | Codex | Medio | Verificare a tappeto tutti i campi di ricerca automatica e mantenere la tastiera durante la digitazione. |
| Refresh senza perdere la pagina corrente | Media | Da fare | Codex | Medio | Dopo F5 o pull-to-refresh mantenere rotta, sezione, filtri e tab correnti invece di tornare alla scelta profilo. |
| Accesso offline dopo refresh | Alta | Da fare | Codex | Medio | Consentire il rientro nel profilo e la lettura della cache dopo F5 offline, senza bloccare la scelta profilo. |
| Ricerca con perdita di focus desktop/mobile | Alta | Implementato | Daniela | Medio | Verificare in locale che il focus desktop e la tastiera mobile restino attivi durante la ricerca automatica. |
| Stato aggiornamento metadati sempre esplicito | Media | Da fare | Codex | Basso | Mostrare chiaramente nella parte alta del dialog se il ciclo è in corso o completato, senza reintrodurre la percentuale interna dei lotti. |
| Design system e identita visiva | Bassa | Completato | Codex | Medio | Nessuna attività tecnica residua. |
| Build, versioning e deploy | Media | Completato | Codex | Basso | Nessuna attività tecnica residua. |

| Prestazioni accesso e caricamento | Alta | Da fare | Codex | Alto | Ridisegnare il bootstrap in due fasi: autenticazione, profilo e proiezione minima delle rail Home per il primo rendering; locandine non visibili, metadati e resto della libreria in background. Aggiungere cache stale-while-revalidate, deduplicazione/annullamento delle richieste, limite di concorrenza e misure LCP/TTI/tempo di apertura profilo. |
| Lazy load dei moduli con Vite | Media | Da fare | Codex | Medio | Valutare code splitting e import dinamici per route e moduli non essenziali, misurare il bootstrap e verificare che il caricamento progressivo non introduca regressioni. |
| Ordinamento Film da vedere | Alta | Parzialmente completato | Daniela | Basso | Validare su mobile che il filtro usi `Data aggiunta` in ordine decrescente e che gli altri filtri mantengano il loro ordinamento. |
| Ricerca Film senza perdita di focus | Alta | Parzialmente completato | Daniela | Medio | Validare su Samsung Galaxy S26+ che la tastiera resti aperta durante la digitazione e che la ricerca parta dopo la pausa o almeno due caratteri. |
| Rimozione sicura dalla libreria | Alta | Da fare | Codex | Medio | Aggiungere la rimozione nella sola scheda di dettaglio per film e serie, con azione visivamente separata, conferma esplicita e aggiornamento cloud/cache dopo la cancellazione. |
| Proposte Cerca senza duplicati | Media | Da fare | Codex | Medio | Escludere dalle proposte film e serie già presenti nella libreria del profilo, mantenendo suggerimenti affini basati su generi, preferenze e valutazioni. |
| Risultati Cerca in lista unica | Media | Da fare | Codex | Medio | Unificare risultati locali e pubblici in un solo elenco, deduplicare i titoli e mostrare `Apri` per quelli già in libreria e `Aggiungi` per quelli nuovi. |
| Ricerca limitata a film e serie | Media | Da fare | Codex | Medio | Escludere le persone dai risultati catalogabili, correggere l’interpretazione degli anni e aggiungere il filtro `Tutti` / `Film` / `Serie TV`. |

## Aggiornamento stato tecnico — 12 luglio 2026

Le seguenti voci hanno ricevuto un intervento tecnico in questa release. Restano parziali finché Daniela non le conferma sui dispositivi e nel progetto Supabase.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
| --- | --- | --- | --- | --- | --- |
| Sincronizzazione cloud e sostituzione import | Alta | Parzialmente completato | Daniela | Alto | Ripetere l'import con sostituzione e verificare che i dati cloud siano visibili dopo pulizia cache e su un secondo dispositivo. |
| Conferma sostituzione dati in importazione | Alta | Parzialmente completato | Daniela | Medio | Verificare che il dialog applicativo sia coerente con il design system e che Annulla non avvii l'import. |
| Contrasto riepilogo importazione e barra mobile | Alta | Parzialmente completato | Daniela | Basso | Verificare visivamente testo, valore, icona e focus su Samsung Galaxy S26+. |
| Rimozione sicura dalla libreria | Alta | Parzialmente completato | Daniela | Medio | Verificare il pulsante solo nella scheda dettaglio, la conferma distruttiva e la rimozione sincronizzata su un secondo dispositivo. |
| Runner E2E senza blocco `spawn EPERM` | Alta | Da fare | Codex | Medio | Browser E2E sospesi nel workflow; risolvere il gate profili su GitHub Actions prima di riattivarli. |
| Prestazioni accesso e caricamento | Alta | Da fare | Codex | Alto | Misurare il bootstrap e spostare ulteriori caricamenti non indispensabili in background senza regressioni cloud. |
| Responsive schede su Samsung Galaxy S26+ | Alta | Parzialmente completato | Daniela | Alto | Validare dettagli, cast, banner e overflow sul dispositivo target. |
| Risultati Cerca solo film/serie | Media | Parzialmente completato | Daniela | Medio | Verificare che TMDB non mostri più persone e che i filtri/risultati unificati siano coerenti. |

## Stato corrente dopo le attivita autonome — 12 luglio 2026

Questa tabella prevale sulle righe storiche precedenti. Le attivita tecniche senza dipendenze esterne sono state chiuse; restano qui solo verifiche manuali, decisioni di Daniela o problemi che richiedono il dispositivo/ambiente reale.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Autenticazione, PIN e recupero password | Alta | Parzialmente completato | Daniela | Basso | Confermare recupero password dopo il rate limit Supabase e PIN su entrambi i dispositivi. |
| Sincronizzazione cloud bidirezionale e conflitti | Alta | Parzialmente completato | Daniela | Alto | Eseguire il test con due dispositivi contemporanei e un conflitto reale. |
| IndexedDB come sola cache offline | Alta | Parzialmente completato | Daniela | Alto | Verificare offline/online e disponibilita della libreria dopo refresh offline. |
| Proxy TMDB/JustWatch, trailer, streaming e cinema | Alta | Parzialmente completato | Daniela | Alto | Verificare un campione reale e segnalare i titoli ancora incompleti. |
| Audit mobile responsive | Alta | Parzialmente completato | Daniela | Alto | Testare Home, librerie, dettagli, profilo, import e ricerca su Samsung Galaxy S26+. |
| Gestione tastiera nei campi di ricerca | Alta | Parzialmente completato | Daniela | Medio | Verificare su mobile Serie e Film; il codice preserva il campo, ma serve conferma reale. |
| Accesso offline dopo refresh | Alta | KO da verificare | Daniela | Medio | Ripetere F5 offline con cache e sessione disponibili; documentare se il blocco resta. |
| Stabilizzazione test E2E GitHub Actions | Alta | Bloccato | Daniela | Medio | Riattivare il workflow solo con fixture di test non sensibili; i browser E2E restano sospesi. |
| Prestazioni accesso e caricamento | Alta | Da verificare | Daniela | Alto | Misurare login e apertura profilo su desktop/mobile. |
| Copertura metadati bloccata su molti titoli | Alta | KO da approfondire | Codex | Medio | Analizzare diagnostica per fonte/titolo: il retry lascia 677 titoli da verificare e ha prodotto un errore. |
| Contrasto e audit responsive finale | Alta | Parzialmente completato | Daniela | Medio | Verificare testi, focus, barra mobile e riepilogo importazione sui dispositivi reali. |
| Rimozione non persistente dopo refresh | Alta | KO da approfondire | Codex | Medio | Verificare tombstone, merge cloud/cache e titolo ricomparso dopo Ctrl+F5. |
| Aggiornamento vista dopo modifiche da altro dispositivo | Media | KO da verificare | Daniela | Medio | Confermare il refresh della sezione senza logout/login dopo modifica cloud esterna. |
| Ricerca pubblica pertinente | Media | Parzialmente completato | Daniela | Medio | Verificare House of Cards; il catalogo condiviso ora richiede corrispondenza del titolo. |
| Proposte personalizzate senza duplicati | Media | Parzialmente completato | Daniela | Medio | Verificare che non compaiano titoli gia nella libreria e valutare i suggerimenti esterni. |
| Feedback di caricamento globale | Media | Parzialmente completato | Daniela | Medio | Verificare cambi sezione, filtri, retry metadati e click ripetuti su rete lenta/mobile. |
| Stato aggiornamento metadati esplicito | Media | Parzialmente completato | Daniela | Basso | Confermare visivamente aggiornamento in corso e ciclo completato. |
| Conferma import sostitutivo applicativa | Media | Parzialmente completato | Daniela | Medio | Verificare dialog interno, Annulla, Continua e blocco dello scroll. |
| Mostra/nascondi password e PIN | Media | Parzialmente completato | Daniela | Basso | Controllare tutti i modali e la posizione interna dell'icona. |
| Favicon e PWA | Bassa | Parzialmente completato | Daniela | Basso | Verificare favicon, manifest e installazione PWA su Android e GitHub Pages. |

Nota di consolidamento: la fix per la persistenza delle rimozioni ora scrive un tombstone cloud con revisione e timestamp aggiornati; resta solo la verifica manuale. La copertura metadati resta invece un'analisi sui dati reali: il retry non riduce i titoli da verificare e va campionato dal pannello fonti.

### Evidenza collaudo desktop — WVERSE-190 (19 luglio 2026)

La ricerca al primo inserimento è stata verificata su desktop con una query completa (`House of Cards`): il testo resta nel campo durante il caricamento e i risultati rimangono pertinenti. Esito: superato.

## Stato sintetico

| Area | Stato | Priorita | Note |
| --- | --- | --- | --- |
| Autenticazione familiare cloud | In corso | Alta | Login cloud verificato; restano recupero password e profili persistenti |
| Dati condivisi su cloud | In corso | Alta | Prima sincronizzazione attiva per profili, librerie, progressi e impostazioni |
| Fonti dati complete | In corso | Alta | Proxy TMDB/JustWatch e trailer attivi; copertura cinema e titoli problematici da completare |
| Filtri e organizzazione libreria | In corso | Media | Prima uniformazione applicata; restano filtri avanzati e viste |
| Mobile web e app Android | In corso | Alta | Responsive/PWA migliorati; resta audit su smartphone e decisione wrapper |

## Aggiornamento tecnico successivo — 12 luglio 2026

Queste righe integrano lo stato del registro precedente e prevalgono sulle voci omonime quando indicano un intervento più recente.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
| --- | --- | --- | --- | --- | --- |
| Allineamento icone mostra/nascondi | Alta | Parzialmente completato | Daniela | Basso | Verificare su tutti i dialog password e PIN che l'icona sia interna al campo e che cambi correttamente tra mostra e nascondi. |
| Contrasto barra di navigazione mobile | Alta | Parzialmente completato | Daniela | Basso | Verificare su Samsung Galaxy S26+ testo, icona, sfondo e focus dello stato selezionato. |
| Audit contrasto interfaccia e importazione | Alta | Parzialmente completato | Daniela | Medio | Verificare visivamente testi, badge, link, focus e indicatori, incluso il riepilogo importazione. |
| Rimozione sicura dalla libreria | Alta | Parzialmente completato | Daniela | Medio | Verificare su film e serie il pulsante solo nel dettaglio, il dialog applicativo e la rimozione sincronizzata. |
| Risultati Cerca in lista unica | Media | Parzialmente completato | Daniela | Medio | Verificare lista unificata, deduplicazione e azioni Apri/Aggiungi su risultati locali, catalogo e fonti pubbliche. |
| Ricerca limitata a film e serie | Media | Parzialmente completato | Daniela | Medio | Verificare esclusione delle persone e coerenza dei filtri Tutti/Film/Serie TV. |
| Proposte Cerca senza duplicati | Media | Da fare | Codex | Medio | Escludere dalle proposte i titoli già presenti, mantenendo suggerimenti affini basati sui gusti. |
| Trasparenza del logo nella login | Media | Da fare | Codex | Basso | Rendere trasparente lo sfondo dell'asset o integrarlo correttamente con il box della login. |
| Identita visiva e favicon | In corso | Bassa | Tema Watchverse black e prime proposte di marchio aggiunti |
| Backup, export e sicurezza | In corso | Alta | Export/restore e security review presenti; restano test VAPT e hardening deploy |
| Monitoraggio errori e qualita deploy | In corso | Media | Diagnostica metadati, build numerate e test mirati presenti |

## 1. Autenticazione e login

Obiettivo:

- non ripartire dal primo accesso a ogni nuova build;
- avere una utenza familiare stabile;
- mantenere due profili iniziali: Daniela ed Elena;
- permettere a Daniela di impostare la password al primo accesso;
- permettere modifica e recupero password usando la mail come elemento di sicurezza;
- permettere a Elena di accedere con utenza/password comunicate da Daniela;
- consentire accesso a entrambi i profili dopo il login;
- mantenere il PIN profilo come protezione facoltativa.

Decisioni confermate:

- backend cloud gratuito: Supabase;
- account unico intestato a Daniela;
- email di recupero: `daniela.chiumarulo@gmail.com`;
- registrazioni pubbliche disattivate;
- profili iniziali fissi: Daniela ed Elena;
- Elena usa le stesse credenziali dell'account e può aprire entrambi i profili, modificando normalmente il proprio;
- la password resta gestita da Supabase e non viene salvata nel repository o nel browser come testo leggibile.

Attivita:

- [x] creare il progetto Supabase gratuito e configurare URL/chiave pubblica;
- [x] creare l'utente proprietario Daniela senza signup pubblico;
- [x] definire il flusso di primo accesso e cambio password;
- [x] collegare recupero password via email Supabase;
- [x] rendere persistente la presenza dell'account cloud tra build e dispositivi;
- [x] creare o migrare automaticamente i profili Daniela ed Elena;
- [ ] verificare che il PIN profilo resti opzionale e separato dalla password account.

Nota operativa: per completare il collegamento cloud servono il progetto Supabase e la sua URL pubblica con chiave anon/publishable. La chiave `service_role` e qualsiasi token privato resteranno fuori dal repository.

Criteri di chiusura:

- una nuova build non mostra il setup iniziale se l'account cloud esiste;
- login funzionante da almeno due browser/dispositivi;
- cambio password funzionante;
- recupero password via email verificato;
- accesso ai profili Daniela ed Elena funzionante.

## 2. Sincronizzazione cloud dei dati

Obiettivo:

- eliminare la dipendenza dal solo salvataggio locale del browser;
- sincronizzare librerie, progressi, rating, preferenze e aspetto dei profili;
- condividere tra dispositivi anche i dati di catalogo comuni;
- mostrare a Daniela le modifiche fatte da Elena e viceversa, nel rispetto dei profili separati.

Attivita:

- [x] completare schema Supabase per dati account, profili, librerie, progressi e preferenze;
- [x] aggiungere catalogo cloud condiviso per schede film/serie, cast, biografie, stagioni, episodi e fonti;
- [x] implementare migrazione dal locale al cloud per il primo accesso;
- [x] implementare sync bidirezionale con versioni e risoluzione conflitti;
- [x] aggiungere stato visibile di sincronizzazione e gestione errori;
- [ ] ridurre IndexedDB a cache/offline, non a fonte primaria;
- [ ] aggiungere test per accesso multi-dispositivo e multi-profilo.

Criteri di chiusura:

- import libreria da PC visibile su mobile dopo login;
- modifica fatta da Elena visibile a Daniela e viceversa;
- refresh pagina e nuova build non perdono dati;
- app usabile anche con rete instabile, con sync appena torna online.

## 3. Fonti dati e popolamento schede

Obiettivo:

- popolare realmente trailer;
- popolare disponibilita streaming;
- popolare programmazione cinema quando disponibile;
- evitare campi vuoti o fuorvianti nelle schede.

Attivita:

- [x] attivare proxy sicuro TMDB/JustWatch tramite backend;
- [x] predisporre fonte trailer senza esporre token nel client;
- [ ] definire fonte sostenibile per orari cinema italiani;
- [x] distinguere chiaramente dato certo, dato stimato e dato non disponibile;
- [x] aggiungere refresh manuale per una scheda;
- [ ] eliminare il retry automatico al login per titoli incompleti o con errori persistenti;
- [ ] mostrare un avviso contestuale con numero di titoli coinvolti, dettaglio errori e azioni “Riprova” / “Ignora per ora”;
- [ ] aggiungere test automatici per casi con e senza dati.

Criteri di chiusura:

- almeno 5 film e 5 serie reali mostrano trailer o stato corretto;
- disponibilita streaming visibile solo quando la fonte la conferma;
- cinema non mostra dati finti;
- nessun token privato viene salvato nel repository.

## 4. Filtri e organizzazione libreria

Obiettivo:

- riorganizzare filtri e viste prendendo ispirazione da Showly dove risulta piu chiara;
- rendere piu semplice trovare cosa vedere, cosa e in corso, cosa e completato e cosa manca.

Attivita:

- [x] raccogliere screenshot o descrizione dei filtri Showly da replicare;
- [x] mappare gli stati attuali Watchverse contro stati Showly;
- [x] applicare una prima gerarchia coerente per tab, contatori, toolbar e card;
- [x] ridisegnare filtri per serie, film, watchlist, completati, in corso, sospesi;
- [ ] aggiungere ordinamenti utili: ultimo visto, ultimo aggiornamento, rating, piattaforma, genere;
- [ ] testare filtri su libreria piccola e libreria importata grande.

### Backlog Showly da valutare

Le seguenti migliorie sono state aggiunte come backlog funzionale, da affrontare una per volta dopo la verifica della nuova UI:

- [x] vista libreria con tab di stato persistenti e contatori sempre visibili;
- [ ] filtri combinabili per stato, genere, piattaforma, anno e rating;
- [ ] ordinamento configurabile e memorizzato per ogni sezione;
- [x] vista griglia/lista con scelta persistente e densita regolabile;
- [x] schede compatte con poster, stato, progresso episodio e azioni rapide;
- [ ] rivedere l'indicatore percentuale nelle card serie: mostrare gli episodi residui, chiarire il rapporto tra episodio corrente e avanzamento globale e spostare il dato in una posizione riferita alla serie, ispirandosi a Showly;
- [ ] pagina dettaglio piu strutturata: hero, riepilogo, cast, episodi, dove vederlo e titoli correlati;
- [x] sezioni orizzontali con scorrimento da tastiera, touch e pulsanti freccia accessibili;
- [ ] calendario/programmazione con filtri per giorno, piattaforma e tipo di contenuto;
- [ ] watchlist separata dalla libreria vista, con stato “da iniziare” esplicito;
- [ ] ricerca globale con risultati raggruppati per film, serie, persone e piattaforme;
- [x] azioni rapide da card: visto, preferito, watchlist e apertura dettaglio;
- [ ] gestione piu chiara degli episodi: stagione, progresso, ultimo episodio e prossimo episodio;
- [ ] stati vuoti contestuali con suggerimenti realmente azionabili;
- [x] accessibilita completa di tab, filtri, rail e dialoghi, inclusa navigazione da tastiera;
- [ ] test e2e dedicati a filtri, ordinamenti, cambio vista e rail orizzontali su desktop/mobile.

Criteri di chiusura:

- Daniela conferma che la navigazione e piu chiara;
- filtri funzionano su desktop e mobile;
- test automatici coprono combinazioni principali.

## 5. Mobile web e app Android

Obiettivo:

- migliorare drasticamente la versione mobile web;
- preparare una app Android almeno per smartphone;
- mantenere una sola base funzionale dove possibile.

Attivita:

- [ ] audit responsive delle schermate principali;
- [ ] sistemare login, home, librerie, dettaglio titolo, profilo, import e ricerca su mobile;
- [ ] migliorare tap target, spaziature, header, menu e rail orizzontali;
- [x] verificare installabilita PWA;
- [ ] valutare wrapper Android: Trusted Web Activity, Capacitor o altra soluzione;
- [ ] aggiungere test e2e mobile viewport.

Criteri di chiusura:

- flussi principali usabili su smartphone Android;
- PWA installabile con icone corrette;
- test mobile viewport passati;
- decisione tecnica documentata per app Android.

## 6. Favicon e identita visiva

Obiettivo:

- sostituire favicon e icone attuali con una soluzione piu riconoscibile e curata.

Attivita:

- [x] definire direzione visiva del marchio Watchverse;
- [x] collegare favicon, wordmark e marchio compatto approvati in tutti i contesti web/PWA;
- [x] aggiornare manifest e asset;
- [ ] verificare resa su browser, home screen e GitHub Pages con il dispositivo Android reale.

Criteri di chiusura:

- favicon visibile e approvata;
- icona PWA corretta su mobile;
- nessun asset temporaneo o generato male nel repository.

## 7. Attivita aggiuntive consigliate

### Backup, export e sicurezza

Motivo:

Prima di spostare i dati in cloud serve un paracadute chiaro, soprattutto per import massivi.

Attivita:

- [x] export completo account/profili;
- [x] restore controllato;
- [ ] migrazione locale -> cloud reversibile o almeno verificabile;
- [x] checklist dati sensibili nel repository prima di ogni deploy pubblico.

### Qualita deploy e osservabilita

Motivo:

Dopo il cloud, gli errori non saranno piu solo locali e vanno resi diagnosticabili.

Attivita:

- [x] stato build/deploy documentato;
- [x] pagina o pannello diagnostico con versione, backend configurato e stato sync;
- [x] logging errori non sensibile;
- [ ] test e2e obbligatori prima del commit per flussi critici.

### Retry metadati e decisione utente

Motivo:

Un titolo incompleto o un errore persistente non deve riavviare tentativi di rete silenziosi a ogni accesso al profilo. L'utente deve poter scegliere quando consumare nuove richieste e quando ignorare temporaneamente il problema.

Attivita:

- [ ] mostrare l'avviso solo quando esistono elementi incompleti o errori persistenti;
- [ ] separare “dati mancanti” da “errore tecnico” nel messaggio;
- [ ] offrire il comando manuale “Riprova” dal pannello fonti e dal dettaglio elementi;
- [ ] offrire “Ignora per ora” con stato persistente fino a una nuova richiesta esplicita;
- [ ] non avviare richieste automatiche al login quando l'utente non ha scelto di riprovare;
- [ ] coprire il comportamento con test E2E su primo accesso, accessi successivi e retry manuale.

### Feedback di caricamento e aggiornamenti asincroni

Motivo:

Alcune azioni asincrone aggiornano la vista dopo alcuni secondi senza rendere immediatamente evidente che il comando sia stato ricevuto. Per esempio, passando da “Da vedere” a “In arrivo” nella Home, la lista precedente resta visibile e l'utente può fare altri click, creando l'impressione che il comando non abbia funzionato.

Attivita:

- [ ] verificare il bug nella Home per tab, filtri, ordinamenti e cambi vista;
- [ ] eseguire un audit globale di tutte le azioni asincrone del sito;
- [ ] mostrare uno stato di caricamento locale sul controllo attivato;
- [ ] disabilitare temporaneamente i controlli duplicabili durante l'aggiornamento;
- [ ] mantenere layout e dimensioni stabili durante il caricamento;
- [ ] mostrare feedback di successo, errore o risultato vuoto al termine;
- [ ] evitare loader globali bloccanti quando è sufficiente un aggiornamento locale;
- [ ] aggiungere test E2E per click ripetuti, cambio rapido di filtro e rete lenta;
- [ ] verificare il comportamento su desktop e mobile.

### Processo di rilascio concordato

- [ ] non eseguire build, deploy o push automaticamente dopo ogni modifica;
- [ ] prima di ogni rilascio fornire l'elenco delle attività completate localmente;
- [ ] evidenziare esplicitamente le modifiche completate ma non ancora pubblicate;
- [ ] elencare le attività ancora da fare e i test eseguiti;
- [ ] procedere al rilascio solo dopo conferma esplicita di Daniela.

## Ordine consigliato

1. Autenticazione cloud e primo accesso.
2. Schema dati cloud e sincronizzazione profili.
3. Migrazione dei dati locali esistenti.
4. Fonti dati protette tramite proxy/backend.
5. Mobile responsive.
6. Filtri e riorganizzazione libreria.
7. App Android.
8. Favicon e identita visiva.

La favicon puo essere anticipata se vogliamo una vittoria rapida, ma non sblocca le parti piu importanti.

## Priorita operative delle attivita aperte

### Alta

- completare la sincronizzazione bidirezionale cloud con versioni, conflitti e test multi-dispositivo;
- rendere IndexedDB una cache/offline e non la fonte primaria dei dati;
- completare proxy TMDB/JustWatch e fonti protette per trailer, streaming e cinema;
- eliminare il retry automatico al login e introdurre la scelta esplicita dell'utente tra `Riprova` e `Ignora per ora`;
- completare audit mobile di login, home, librerie, dettagli, profilo, import e ricerca;
- eseguire test E2E sui flussi critici prima del rilascio;
- completare security review, VAPT applicativo mirato e hardening del deploy pubblico.

### Media

- completare l'audit globale degli indicatori di caricamento, inclusi errore, successo, stato vuoto e rete lenta;
- aggiungere test E2E per click ripetuti, filtri, ordinamenti, cambi vista e comportamento desktop/mobile;
- aggiungere filtri combinabili e ordinamenti avanzati;
- ristrutturare le pagine di dettaglio ispirandosi a Showly;
- migliorare calendario, watchlist separata, ricerca globale e gestione degli episodi;
- scegliere e documentare la soluzione tecnica per l'app Android;
- completare test responsive e verifica PWA su dispositivi reali.

### Bassa

- completare il pacchetto favicon/PWA con icone 192, 512 e maskable;
- verificare la resa finale del nuovo logo su browser, login, profili, header e home screen;
- rifinire stati vuoti e dettagli estetici dopo la validazione funzionale delle priorita alte e medie.

## Stato aggiornato dopo il ciclo di fix — 12 luglio 2026

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Refresh senza perdere pagina e filtro | Media | Parzialmente completato | Daniela | Medio | Verificare online e offline su Home, Serie e Film; i profili protetti da PIN devono continuare a richiedere il PIN. |
| Ricerca con perdita di focus desktop/mobile | Alta | Implementato | Daniela | Medio | Verificare in locale tutti i campi con ricerca automatica. |
| Accesso offline dopo refresh | Alta | Parzialmente completato | Daniela | Medio | Confermare manualmente F5 offline con sessione e cache già disponibili. |
| Sincronizzazione cloud di preferiti e modifiche profilo | Alta | Da fare | Codex | Medio | Verificare e correggere la persistenza cloud dei preferiti dopo pulizia cache e su più dispositivi. |
| Sincronizzazione bidirezionale con conflitti | Alta | Parzialmente completato | Daniela | Medio | Eseguire i test multi-dispositivo e confermare i casi di conflitto. |
| IndexedDB come sola cache offline | Alta | Da fare | Codex | Medio | Completare la separazione tra dati cloud primari e cache locale. |
| Proxy TMDB/JustWatch, trailer, streaming e cinema | Alta | Parzialmente completato | Daniela | Medio | Verificare i titoli incompleti e correggere le fonti/proxy che restituiscono errori o dati mancanti. |
| Retry metadati deciso dall'utente | Alta | Da fare | Codex | Medio | Evitare il retry automatico al login e offrire Riprova/Ignora per ora con stato persistente. |
| Stabilizzazione test E2E GitHub Actions | Alta | Bloccato | Codex | Medio | Correggere il gate di autenticazione del test; il workflow resta sospeso per evitare notifiche di run falliti. |
| Audit mobile responsive | Alta | Da fare | Codex | Alto | Completare verifica su Samsung Galaxy S26+ e sistemare dettagli, cast, header e navigazione mobile. |
| Risultati ricerca pertinenti e senza persone | Media | Parzialmente completato | Daniela | Medio | Validare House of Cards e ricerche di persone; ridurre ulteriormente i falsi positivi. |
| Proposte basate sui gusti senza duplicati | Media | Da fare | Codex | Medio | Escludere sempre film e serie già presenti nella libreria. |
| Feedback di caricamento globale | Media | Parzialmente completato | Daniela | Medio | Audit manuale di tutte le azioni asincrone e verifica su rete lenta/mobile. |
| Stato aggiornamento metadati esplicito | Media | Parzialmente completato | Daniela | Basso | Confermare visivamente “Aggiornamento in corso” e “Ciclo completato” nel pannello. |
| Rimozione dal dettaglio con redirect | Media | Da fare | Codex | Basso | Reindirizzare alla lista Film/Serie o alla Home dopo la rimozione definitiva. |
| Conferma import sostitutivo aderente al design system | Media | Parzialmente completato | Daniela | Medio | Confermare manualmente il dialog applicativo su desktop e mobile. |
| Ricerca risultati in lista unica | Media | Parzialmente completato | Daniela | Medio | Validare la presenza di una sola riga per titolo e i comandi Apri/Aggiungi. |
| Contrasto colori e controllo globale | Media | Parzialmente completato | Daniela | Basso | Eseguire un controllo a tappeto dopo l'ultimo ciclo di import e sui temi disponibili. |
| Mostra/nascondi per tutti i campi password e PIN | Media | Da fare | Codex | Basso | Ricontrollare che l'icona sia sempre interna al campo e coerente con lo stato. |
| Redirect dopo rimozione dalla libreria | Media | Da fare | Codex | Basso | Evitare la pagina “Film/Serie non trovato” dopo la rimozione. |
| Trasparenza logo in login | Bassa | Da fare | Codex | Basso | Eliminare la differenza di sfondo dell'asset senza alterare gli SVG approvati. |
| Favicon/PWA aggiornata | Bassa | Da fare | Codex | Basso | Generare e verificare favicon 192/512, maskable e cache PWA. |

### Delta implementato nello stesso ciclo

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Refresh con ripristino della rotta | Media | Implementato | Daniela | Medio | Test manuale online/offline. |
| Fallback cache dopo refresh offline | Alta | Implementato | Daniela | Medio | Test manuale con sessione autenticata e cache disponibile. |
| Ricerca Serie senza perdita di focus | Alta | Implementato | Daniela | Medio | Test manuale desktop e Samsung; estendere lo stesso controllo agli altri campi di ricerca automatica. |
| Proposte personalizzate senza duplicati della libreria | Media | Implementato | Daniela | Medio | Test manuale della sezione Cerca. |
| Redirect dopo rimozione dal dettaglio | Media | Implementato | Daniela | Basso | Test manuale per Film e Serie. |
| Filtro risultati pubblici senza persone o falsi positivi evidenti | Media | Parzialmente completato | Daniela | Medio | Validare le query reali e rifinire la soglia di pertinenza. |

### Stato consolidato dopo l'ultimo rilascio

Le righe storiche precedenti restano come tracciabilita. Per la gestione corrente fanno fede questi stati:

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Sincronizzazione cloud di preferiti e modifiche profilo | Alta | Da fare | Codex | Medio | Analizzare il caso in cui un preferito non persiste dopo pulizia cache e correggere il merge cloud/local. |
| Ricerca automatica senza perdita di focus | Alta | Implementato | Daniela | Medio | Verificare in locale tutti gli altri campi di ricerca automatica. |
| IndexedDB come sola cache offline | Alta | Da fare | Codex | Medio | Completare la separazione tra dati cloud primari e cache locale. |
| Retry metadati deciso dall'utente | Alta | Da fare | Codex | Medio | Eliminare il retry automatico al login e introdurre Riprova/Ignora per ora. |
| Stabilizzazione test E2E GitHub Actions | Alta | Bloccato | Codex | Medio | Risolvere il gate di autenticazione; workflow sospeso per evitare run falliti. |
| Audit mobile responsive | Alta | Da fare | Codex | Alto | Verifica completa su Samsung Galaxy S26+. |
| Proposte personalizzate senza duplicati | Media | Parzialmente completato | Daniela | Medio | Il filtro applicativo e' presente; validare risultati reali e aggiungere una fonte di proposte esterna alla libreria. |
| Ricerca pubblica pertinente | Media | Parzialmente completato | Daniela | Medio | Validare House of Cards e ricerche di persone; rifinire i falsi positivi. |
| Feedback di caricamento globale | Media | Parzialmente completato | Daniela | Medio | Audit manuale su tutte le azioni asincrone e su rete lenta/mobile. |
| Stato aggiornamento metadati esplicito | Media | Parzialmente completato | Daniela | Basso | Confermare visivamente stato in corso e completato. |
| Conferma import sostitutivo applicativa | Media | Parzialmente completato | Daniela | Medio | Validare desktop e mobile. |
| Contrasto globale | Media | Parzialmente completato | Daniela | Basso | Eseguire controllo a tappeto su temi e dispositivi. |
| Mostra/nascondi PIN e password | Media | Implementato | Daniela | Basso | Solo verifica manuale dei modali gia' coperti dal componente comune. |
| Redirect dopo rimozione | Media | Implementato | Daniela | Basso | Test manuale per Film e Serie. |
| Trasparenza logo login | Bassa | Da fare | Codex | Basso | Uniformare lo sfondo dell'asset SVG con il contenitore. |
| Favicon/PWA aggiornata | Bassa | Da fare | Codex | Basso | Verificare favicon, icone PWA e cache del service worker. |

### Delta successivo

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Retry metadati deciso dall'utente | Alta | Parzialmente completato | Daniela | Medio | Il retry automatico viene bloccato quando esistono errori persistenti; verificare il toast e il comando manuale. |
| Favicon/PWA aggiornata | Bassa | Parzialmente completato | Daniela | Basso | Asset e query versionati; verificare cache PWA e icona installata sul dispositivo. |

### Esito test manuale successivo

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Accesso offline dopo F5 | Alta | KO da verificare | Codex | Medio | Dopo refresh offline desktop l'app torna ancora alla scelta profili. Ripristinare direttamente sessione, profilo, rotta e cache; verificare poi anche mobile. |

| Ricerca Serie senza perdita di focus | Alta | Parzialmente completato | Daniela | Medio | Test desktop OK; resta da verificare il comportamento su mobile. |

| Aggiornamento metadati senza risultati | Alta | KO da verificare | Codex | Medio | Analizzare perché retry e accessi a Home/Film riavviano o animano il ciclo senza aumentare la copertura. Conservare diagnostica per fonte e titolo. |
| Interazioni pannello metadati non recepite | Media | KO da verificare | Codex | Basso | Rendere affidabili apertura, chiusura e pulsanti del pannello anche durante aggiornamenti o rerender asincroni. |

| Refresh cloud al cambio sezione | Media | KO da verificare | Codex | Medio | Dopo una modifica su un altro dispositivo, aggiornare o invalidare la vista quando l'utente torna nella sezione senza richiedere logout/login o pulizia cache. |

| Ricerca mobile con tastiera che si chiude | Alta | KO da verificare | Codex | Medio | Correggere il rerender della ricerca Serie che chiude/riapre la tastiera a ogni carattere; applicare la stessa soluzione alla ricerca Film e agli altri campi analoghi. |

| Rimozione non persistente dopo refresh | Alta | KO da verificare | Codex | Medio | Dopo la rimozione, il titolo ricompare con Ctrl+F5. Verificare tombstone, sincronizzazione cloud e merge locale/cloud. |
| Copertura metadati bloccata su molti titoli | Alta | KO da approfondire | Codex | Medio | Analizzare perché il retry non riduce i titoli da verificare e può aumentare gli errori; distinguere assenza legittima di fonte da errore tecnico. |
| Ricerca di titoli rimossi dal profilo | Media | KO da verificare | Codex | Medio | Distinguere il catalogo condiviso dal catalogo del profilo: un titolo rimosso non deve essere presentato come già disponibile senza indicare chiaramente che è stato rimosso dal profilo. |

## Stato operativo dopo il ciclo autonomo del 17 luglio 2026

Questa e la tabella corrente per la ripresa dei test. Le voci implementate ma non ancora confermate manualmente restano parzialmente completate.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Refresh cloud al cambio sezione | Media | Parzialmente completato | Daniela | Medio | Verificare che una modifica fatta dall'altro dispositivo diventi visibile rientrando in Home, Serie, Film o Cerca senza logout. |
| Sincronizzazione cloud di preferiti e modifiche profilo | Alta | Parzialmente completato | Daniela | Medio | Confermare preferiti e modifiche su desktop/mobile dopo cambio sezione e dopo pulizia cache. |
| Rimozione non persistente dopo refresh | Alta | Parzialmente completato | Daniela | Medio | Verificare che un titolo rimosso non ricompaia dopo Ctrl+F5 e che il catalogo condiviso non lo proponga come gia nel profilo. |
| Ricerca automatica senza perdita di focus | Alta | Implementato | Daniela | Medio | Verificare in locale ricerca Serie e Film su desktop e Samsung; durante la digitazione il focus e la tastiera devono restare attivi. |
| Proposte personalizzate senza duplicati | Media | Parzialmente completato | Daniela | Medio | Verificare che le proposte non contengano titoli gia presenti nel profilo e che il comando Aggiungi funzioni. |
| Ricerca pubblica pertinente | Media | Parzialmente completato | Daniela | Medio | Verificare House of Cards e altre query: solo film/serie pertinenti, nessuna persona e nessun falso positivo evidente. |
| Retry metadati deciso dall'utente | Alta | Parzialmente completato | Daniela | Medio | Confermare che non parta al login e che Riprova non riusciti sia l'unico avvio manuale; approfondire i titoli ancora incompleti. |
| Stato aggiornamento metadati esplicito | Media | Parzialmente completato | Daniela | Basso | Verificare che il pannello mostri chiaramente Aggiornamento in corso e Ciclo completato senza percentuale duplicata. |
| Interazioni pannello metadati | Media | Parzialmente completato | Daniela | Basso | Verificare apertura, chiusura e pulsanti anche durante un aggiornamento in corso. |
| Conferma import sostitutivo applicativa | Media | Parzialmente completato | Daniela | Medio | Confermare desktop e mobile del dialog interno all'app, senza alert del browser. |
| Contrasto globale | Media | Parzialmente completato | Daniela | Basso | Eseguire controllo a tappeto sui temi e sui flussi di importazione, metadati e ricerca. |
| Mostra/nascondi PIN e password | Media | Implementato | Daniela | Basso | Nessuna modifica tecnica residua; resta solo la verifica manuale finale dei modali. |
| Redirect dopo rimozione dal dettaglio | Media | Implementato | Daniela | Basso | Nessuna modifica tecnica residua; confermare il comportamento su Film e Serie. |
| IndexedDB come sola cache offline | Alta | Da fare | Codex | Medio | Completare la separazione tra dati cloud primari e cache locale, inclusa la gestione offline senza bloccare l'accesso. |
| Proxy TMDB/JustWatch e fonti pubbliche | Alta | Parzialmente completato | Daniela | Medio | Verificare i titoli incompleti e correggere le fonti/proxy per locandine, cast, trailer, streaming e cinema. |
| Audit mobile responsive | Alta | Da fare | Codex | Alto | Ristrutturare e verificare Home, librerie e dettagli su Samsung Galaxy S26+. |
| Favicon/PWA aggiornata | Bassa | Parzialmente completato | Daniela | Basso | Verificare favicon, icone installate e cache PWA dopo aggiornamento. |
| Stabilizzazione test browser E2E | Alta | Sospeso | Codex | Medio | Risolvere il gate di autenticazione con fixture/credenziali dedicate; il workflow browser resta sospeso e non va rilanciato. |
| Lazy load dei moduli con Vite | Media | Da fare | Codex | Medio | Introdurre caricamento differito dei moduli pesanti e misurare il miglioramento delle performance. |

## Snapshot pubblicazione 17 luglio 2026

Le modifiche autonome incluse nella prossima pubblicazione sono:

- aggiornamento cloud leggero al rientro in Home, Serie, Film e Cerca, senza bloccare il rendering iniziale;
- persistenza delle rimozioni cloud tramite revisione e tombstone;
- ricerca nelle librerie con aggiornamento parziale del solo elenco, preservando focus e tastiera;
- proposte personali filtrate contro i titoli gia presenti nel profilo;
- ricerca pubblica limitata a film e serie e filtrata per corrispondenza pertinente del titolo;
- suite statica/contrattuale aggiornata ai comportamenti correnti;
- workflow browser E2E sospeso e avviabile solo manualmente, per evitare run falliti finche non saranno disponibili fixture di autenticazione dedicate.

Il test manuale resta necessario per confermare il comportamento su dispositivi e dati reali. Le attivita tecniche ancora aperte sono quelle elencate nella tabella piu recente qui sopra.

## Delta tecnico - feedback e navigazione - 18 luglio 2026

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Feedback immediato sulle azioni e navigazione non bloccante | Alta | Parzialmente completato | Daniela | Medio | Verificare sul sito pubblicato con rete lenta: login, apertura profilo, apertura dettaglio, preferito e azioni sulle card devono mostrare subito uno stato visibile e non perdere il click. |
| Apertura profilo e caricamento iniziale | Alta | Parzialmente completato | Daniela | Alto | Misurare il tempo percepito su desktop e Samsung Galaxy S26+ e segnalare eventuali attese ancora superiori a pochi secondi. |
| Refresh cloud differito durante l'interazione | Media | Implementato | Daniela | Basso | Confermare che un aggiornamento in background non ridisegni la pagina mentre l'utente sta cliccando o digitando. |
| Loader fino al primo rendering della libreria | Alta | Implementato | Daniela | Basso | Verificare in locale che, con cache vuota e catalogo cloud disponibile, la Home non mostri il contenuto vuoto/default prima della libreria personale. |
| Preferiti nelle rail Home | Media | Implementato | Daniela | Basso | Verificare in locale il controllo preferito nelle card di “Continua a guardare” e “Nuovi episodi da recuperare”. |
| Feedback preferito nel dettaglio | Alta | Implementato | Daniela | Basso | Verificare in locale feedback immediato, toast e rollback in caso di errore nella scheda serie/film. |
| Etichetta ridondante nelle card Film da vedere | Bassa | Implementato | Daniela | Basso | Verificare in locale che il badge “Da vedere” non compaia nelle card della rail Home. |

## Delta tecnico - interazione e bootstrap in due fasi - 18 luglio 2026

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Navigazione recepisce il click durante transizioni | Alta | Implementato | Daniela | Medio | Verificare in locale click rapidi su Home, Serie, Film e Cerca durante o subito dopo il loader. |
| Bootstrap profilo con Home coerente e idratazione cloud differita | Alta | Implementato | Daniela | Alto | Verificare con cache vuota e rete lenta che non compaia la Home vuota/default e che la prima vista diventi interattiva rapidamente. |

## Delta tecnico - rendering differito sezioni lente - 18 luglio 2026

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Rendering iniziale di Ricerca e Programmazione | Alta | Implementato | Daniela | Medio | Verificare in locale che la shell compaia subito, che i click di navigazione restino recepiti e che il contenuto venga poi popolato senza blocchi percepiti. |

## Delta tecnico - schede dettaglio e interazioni non bloccanti - 18 luglio 2026

Le correzioni seguenti sono state implementate, testate con la suite automatica, pubblicate su GitHub Pages e attendono conferma manuale desktop.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Loader visibile apertura dettaglio | Alta | Implementato | Codex | Basso | Confermare che il feedback compaia subito aprendo schede da Home, Serie, Film e Cerca. |
| Rendering iniziale scheda dettaglio | Alta | Implementato | Codex | Alto | Confermare che titolo, azioni e navigazione siano disponibili rapidamente senza attese di metadati o suggerimenti. |
| Suggerimenti dettaglio fuori dal rendering iniziale | Alta | Implementato | Codex | Medio | Verificare che la sezione “Potrebbero piacerti anche” arrivi in background senza bloccare click o toast. |
| Rerender provider, trailer e cinema non invasivo | Alta | Implementato | Codex | Medio | Verificare che gli aggiornamenti asincroni non ridisegnino la scheda durante l’interazione. |
| Preferiti con guardia contro click concorrenti | Alta | Implementato | Codex | Medio | Verificare cambio immediato, toast, persistenza e disponibilità delle altre azioni durante il salvataggio. |
| Focus e accessibilità del loader | Media | Implementato | Codex | Basso | Controllare che la console non mostri più il warning `aria-hidden` durante l’apertura dettaglio. |
| Lookup TVmaze con fallback titolo prima dell’ID esterno | Media | Implementato | Codex | Basso | Verificare che il lookup normale non produca il 404 `lookup/shows?thetvdb=...`; distinguere eventuali errori delle estensioni browser. |

## Esiti test manuali desktop - 18 luglio 2026

| Nome intervento | Stato | Esito |
|---|---|---|
| Ricerca automatica senza perdita di focus | Verificato desktop | Superato: Serie e Film mantengono focus e aggiornano i risultati. |
| Preferito dal dettaglio e interazioni concorrenti | Verificato desktop | Superato dopo le correzioni: toast e pulsante restano reattivi. |
| Scheda dettaglio e navigazione durante aggiornamenti background | Verificato desktop | Superato: navigazione e azioni restano disponibili senza blocchi percepiti. |
| Refresh senza perdere profilo, rotta, filtro e ordinamento | Verificato desktop | Superato su Serie, Film e dettaglio. |
| Accesso offline dopo refresh | Verificato desktop | Superato: con rete disattivata il profilo, la rotta e la libreria restano disponibili dalla cache. |
| Home con evidenziazione e shell immediate | Implementato | La voce Home e la shell vengono mostrate al primo paint; rail, progressi e calendario vengono calcolati dopo. Resta la verifica manuale del tempo percepito. |
| Home senza lampeggio durante refresh background | Implementato | I rientri in Home causati da metadati o sincronizzazione aggiornano direttamente l’elenco senza ripresentare “Preparo la Home”. Resta la verifica manuale dopo alcuni secondi. |
| Home stabile tra sezioni e schede dettaglio | Verificato desktop | Superato: la Home resta stabile tornando da Serie, Film, Cerca e dalle schede dettaglio delle serie. |
| Pannello aggiornamento metadati | Verificato desktop | Superato: stato, copertura, fonti, dettaglio e comandi del pannello sono leggibili e reattivi. |

## Nuova analisi - titoli da verificare

Aggiornamento 18 luglio 2026: il retry mirato di `Accidentally Famous: The Story of 883` ha lasciato il titolo senza corrispondenza pubblica; il pannello ha mostrato 792 titoli da verificare su 2559 e 4 errori tecnici. Il dato conferma la necessita della diagnostica per titolo prima di ulteriori retry massivi.

| Nome intervento | Priorita | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Analisi copertura metadati bloccata | Alta | KO da approfondire | Codex | Medio | Il retry mirato ha lasciato 792 titoli da verificare su 2559 e ha portato gli errori tecnici a 4; distinguere dati legittimamente incompleti, fonte non pertinente, identificazione errata e errore tecnico. |
| Diagnostica rapida titoli da verificare | Alta | Da fare | Codex | Medio | Aggiungere un report leggibile e salvabile dal pannello con profilo, tipo, titolo, anno, ID/fonti, parti mancanti, categoria errore, tentativi, ultimo tentativo e prossimo retry, così da consentire analisi mirate senza ricostruire ogni volta l’elenco. |
| Import sostitutivo: Continua e sostituisci | Alta | Implementato, da verificare | Codex | Basso | Il callback è stato corretto; ripetere l’importazione e verificare salvataggio completo, report finale e persistenza dopo refresh. |
| Import sostitutivo completato | Verificato desktop | Superato: Continua e sostituisci avvia l’importazione, mostra l’avanzamento e conserva i dati dopo refresh. |
| Retry mirato titolo da verificare | Verificato desktop | Esito parziale: il retry è avviato e la scheda resta reattiva, ma `Accidentally Famous: The Story of 883` resta senza corrispondenza pubblica; la copertura è passata a 69%, con 792 titoli da verificare e 4 errori tecnici. |

## Evidenza test Sprint 1 — aggiornamento metadati — 19 luglio 2026

Durante il collaudo di `WVERSE-186`, il pannello ha mostrato una copertura ferma al 10% con 2310 titoli da verificare e 5 errori tecnici. Dopo `Aggiorna ora` gli errori sono scesi a 4, ma il pannello ha continuato a mostrare **Aggiornamento in corso** con **0 elaborazioni attive** e **0 titoli in coda**, senza ulteriore avanzamento della percentuale.

| Nome intervento | Priorità | Stato | Owner | Effort | Cosa resta da fare |
|---|---|---|---|---|---|
| Revisione ciclo aggiornamento metadati | Alta | KO da approfondire | Codex | Alto | Rivedere il ciclo per distinguere chiaramente aggiornamento attivo, coda esaurita in attesa di retry, titoli parziali, assenza legittima di fonte ed errori tecnici; garantire avanzamento osservabile o uno stato finale esplicito e ridurre la quota persistente di titoli incompleti. |

Il collaudo di `WVERSE-185` resta **KO**: la rail “Continua a guardare” mostra serie ancora al primo episodio come se avessero la stessa ultima visione (`19 lug 2026`). L’ordinamento sta quindi usando un’attività artificiale o un fallback aggiornato anche per titoli non iniziati, invece della reale visione/progresso dell’utente.

Il collaudo di `WVERSE-171` resta **KO**: nella ricerca il testo viene cancellato dopo la prima digitazione, quando arriva il primo aggiornamento asincrono dei risultati. Il campo deve conservare valore, focus e tastiera durante il rerender.

Il collaudo di `WVERSE-173` è **parziale**: il dettaglio mostra correttamente titolo, tipo/anno, parti mancanti, errore e azioni, ma non rende visibili per titolo tentativi, ultimo tentativo, prossimo retry e una diagnosi distinta di fonte/identificazione.

Il collaudo di `WVERSE-174` è **superato sul caso provato**: il retry ha mostrato prima il toast di aggiornamento e poi quello di metadati aggiornati; riaprendo il dettaglio, il titolo non era più presente tra quelli da verificare.

Il retest di `WVERSE-188` è **KO**: anche con il wrapping la label `Da iniziare` resta troppo ingombrante e viene spezzata sulla locandina. Decisione di correzione: rimuovere globalmente gli indicatori di stato dalle card, perché i filtri e le sezioni già raggruppano i titoli per stato. La rimozione va verificata su Serie, Film, Home, rail, viste griglia/elenco e stati vuoti.

Il collaudo desktop di `WVERSE-178` è **superato**: la sostituzione usa una conferma interna, mostra la pulizia e l’avanzamento, completa l’importazione senza errori e presenta il riepilogo dei dati salvati nel profilo corrente.

Il collaudo desktop delle interazioni del pannello metadati è **superato**: durante l’aggiornamento i comandi `Vedi fonti`, `Dettaglio titoli`, `Riprova non riusciti`, `Aggiorna ora` e la chiusura hanno risposto correttamente.

Il collaudo desktop di mostra/nascondi password e PIN è **superato** in login, recupero/cambio password e gestione PIN: i campi partono nascosti, il valore resta conservato e il controllo resta interno al campo.
