# Piano di lavoro Watchverse

Questo file traccia sia le attivita completate sia quelle ancora aperte. Una voce si considera completata solo dopo:

- implementazione completata;
- test automatici eseguiti;
- build verificata;
- pubblicazione su GitHub Pages o ambiente concordato;
- conferma funzionale di Daniela.

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
| Runner E2E senza blocco `spawn EPERM` | Alta | Parzialmente completato | Codex | Medio | Il runner prova CDP locale e la suite gira automaticamente in GitHub Actions con Chromium isolato; resta verificare il primo workflow e mantenere la suite verde. |
| Stabilizzazione test E2E su `main` | Alta | Da fare | Codex | Medio | Analizzare i workflow `run failed`, correggere test flaky o non compatibili con GitHub Actions, separare i test bloccati dall’ambiente locale e impedire notifiche di fallimento non azionabili. |
| Contrasto barra di navigazione mobile | Alta | Da fare | Codex | Basso | Rendere distinguibili sfondo, icona e testo dello stato selezionato su Samsung Galaxy S26+. |
| Audit contrasto interfaccia e importazione | Alta | Da fare | Codex | Medio | Correggere il contrasto di “Elementi pronti” e del relativo valore nel riepilogo importazione, quindi verificare sistematicamente testi, badge, link, focus e indicatori su tutto il sito. |
| Conferma sostituzione dati in importazione | Alta | Da fare | Codex | Basso | Mostrare sempre una conferma esplicita prima dell’importazione quando è selezionata la sostituzione del profilo, indicando che il catalogo attuale verrà eliminato. |
| Responsive schede su Samsung Galaxy S26+ | Alta | Parzialmente completato | Codex | Alto | Eliminare ridondanza banner/locandina su mobile, contenere overflow e ridimensionare il cast; resta la verifica E2E sul dispositivo target. |
| VAPT e hardening del deploy | Alta | Parzialmente completato | Daniela | Alto | Eseguire una scansione VAPT/headers sul sito pubblicato e verificare i risultati. |
| Filtri e organizzazione libreria | Media | Completato | Codex | Medio | Nessuna attività tecnica residua. |
| Indicatori di caricamento | Media | Parzialmente completato | Daniela | Medio | Validare su rete lenta i loader nelle sezioni e nei cambi filtro. |
| Schede dettaglio ispirate a Showly | Media | Parzialmente completato | Daniela | Alto | Validare su mobile hero, cast, episodi, provider, trailer e contenuti correlati. |
| Progresso serie ed episodi residui | Media | Parzialmente completato | Daniela | Medio | Verificare la resa delle card e dei dettagli con serie reali. |
| Calendario, watchlist e ricerca globale | Media | Completato | Codex | Alto | Nessuna attività tecnica residua. |
| Pacchetto favicon/PWA | Bassa | Parzialmente completato | Daniela | Basso | Verificare icone e installazione PWA su Android e GitHub Pages. |
| Trasparenza del logo nella login | Media | Da fare | Codex | Basso | Rendere trasparente lo sfondo dell'asset o integrarlo correttamente con lo sfondo del box della login. |
| Design system e identita visiva | Bassa | Completato | Codex | Medio | Nessuna attività tecnica residua. |
| Build, versioning e deploy | Media | Completato | Codex | Basso | Nessuna attività tecnica residua. |

| Prestazioni accesso e caricamento | Alta | Da fare | Codex | Alto | Ridurre il tempo percepito di login e apertura profilo, misurare il bootstrap cloud e spostare i caricamenti non indispensabili in background senza bloccare l’utente. |
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
| Conferma sostituzione dati in importazione | Alta | Parzialmente completato | Daniela | Basso | Confermare il popup quando la checkbox è selezionata e verificare che Annulla non avvii l'import. |
| Contrasto riepilogo importazione e barra mobile | Alta | Parzialmente completato | Daniela | Basso | Verificare visivamente testo, valore, icona e focus su Samsung Galaxy S26+. |
| Rimozione sicura dalla libreria | Alta | Parzialmente completato | Daniela | Medio | Verificare il pulsante solo nella scheda dettaglio, la conferma distruttiva e la rimozione sincronizzata su un secondo dispositivo. |
| Runner E2E senza blocco `spawn EPERM` | Alta | Parzialmente completato | Codex | Medio | La suite locale salta solo i browser E2E quando Windows blocca Chrome; verificare il workflow CI dopo il push. |
| Prestazioni accesso e caricamento | Alta | Da fare | Codex | Alto | Misurare il bootstrap e spostare ulteriori caricamenti non indispensabili in background senza regressioni cloud. |
| Responsive schede su Samsung Galaxy S26+ | Alta | Parzialmente completato | Daniela | Alto | Validare dettagli, cast, banner e overflow sul dispositivo target. |
| Risultati Cerca solo film/serie | Media | Parzialmente completato | Daniela | Medio | Verificare che TMDB non mostri più persone e che i filtri/risultati unificati siano coerenti. |

## Stato sintetico

| Area | Stato | Priorita | Note |
| --- | --- | --- | --- |
| Autenticazione familiare cloud | In corso | Alta | Login cloud verificato; restano recupero password e profili persistenti |
| Dati condivisi su cloud | In corso | Alta | Prima sincronizzazione attiva per profili, librerie, progressi e impostazioni |
| Fonti dati complete | In corso | Alta | Proxy TMDB/JustWatch e trailer attivi; copertura cinema e titoli problematici da completare |
| Filtri e organizzazione libreria | In corso | Media | Prima uniformazione applicata; restano filtri avanzati e viste |
| Mobile web e app Android | In corso | Alta | Responsive/PWA migliorati; resta audit su smartphone e decisione wrapper |
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
