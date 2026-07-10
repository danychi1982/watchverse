# Piano di lavoro Watchverse

Questo file traccia le attivita ancora aperte. Una voce si considera chiusa solo dopo:

- implementazione completata;
- test automatici eseguiti;
- build verificata;
- pubblicazione su GitHub Pages o ambiente concordato;
- conferma funzionale di Daniela.

## Stato sintetico

| Area | Stato | Priorita | Note |
| --- | --- | --- | --- |
| Autenticazione familiare cloud | In definizione | Alta | Account unico Daniela, profili Daniela ed Elena, signup pubblico disattivato |
| Dati condivisi su cloud | Da fare | Alta | Serve per usare PC, mobile e profili condivisi |
| Fonti dati complete | Da fare | Alta | Trailer, streaming, cinema e dati variabili |
| Filtri e organizzazione libreria | Da analizzare | Media | Da confrontare con Showly |
| Mobile web e app Android | Da fare | Alta | Prima responsive/PWA, poi wrapper/app Android |
| Identita visiva e favicon | Da fare | Bassa | Rapida, ma non bloccante |
| Backup, export e sicurezza | Da aggiungere | Alta | Necessario prima di migrare dati in cloud |
| Monitoraggio errori e qualita deploy | Da aggiungere | Media | Utile dopo il passaggio cloud |

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

- [ ] creare il progetto Supabase gratuito e configurare URL/chiave pubblica;
- [ ] creare l'utente proprietario Daniela senza signup pubblico;
- [ ] definire il flusso di primo accesso e cambio password;
- [ ] collegare recupero password via email Supabase;
- [ ] rendere persistente la presenza dell'account cloud tra build e dispositivi;
- [ ] creare o migrare automaticamente i profili Daniela ed Elena;
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

- [ ] completare schema Supabase per dati account, profili, librerie, progressi e preferenze;
- [ ] aggiungere catalogo cloud condiviso per schede film/serie, cast, biografie, stagioni, episodi e fonti;
- [ ] implementare migrazione dal locale al cloud per il primo accesso;
- [ ] implementare sync bidirezionale con versioni e risoluzione conflitti;
- [ ] aggiungere stato visibile di sincronizzazione e gestione errori;
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

- [ ] attivare proxy sicuro TMDB/JustWatch tramite backend;
- [ ] configurare fonte trailer senza esporre token nel client;
- [ ] definire fonte sostenibile per orari cinema italiani;
- [ ] distinguere chiaramente dato certo, dato stimato e dato non disponibile;
- [ ] aggiungere refresh manuale per una scheda;
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

- [ ] raccogliere screenshot o descrizione dei filtri Showly da replicare;
- [ ] mappare gli stati attuali Watchverse contro stati Showly;
- [ ] ridisegnare filtri per serie, film, watchlist, completati, in corso, sospesi;
- [ ] aggiungere ordinamenti utili: ultimo visto, ultimo aggiornamento, rating, piattaforma, genere;
- [ ] testare filtri su libreria piccola e libreria importata grande.

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
- [ ] verificare installabilita PWA;
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

- [ ] definire direzione visiva del marchio Watchverse;
- [ ] creare favicon, icona 192, icona 512 e maskable icon;
- [ ] aggiornare manifest e asset;
- [ ] verificare resa su browser, home screen e GitHub Pages.

Criteri di chiusura:

- favicon visibile e approvata;
- icona PWA corretta su mobile;
- nessun asset temporaneo o generato male nel repository.

## 7. Attivita aggiuntive consigliate

### Backup, export e sicurezza

Motivo:

Prima di spostare i dati in cloud serve un paracadute chiaro, soprattutto per import massivi.

Attivita:

- [ ] export completo account/profili;
- [ ] restore controllato;
- [ ] migrazione locale -> cloud reversibile o almeno verificabile;
- [ ] checklist dati sensibili nel repository prima di ogni deploy pubblico.

### Qualita deploy e osservabilita

Motivo:

Dopo il cloud, gli errori non saranno piu solo locali e vanno resi diagnosticabili.

Attivita:

- [ ] stato build/deploy documentato;
- [ ] pagina o pannello diagnostico con versione, backend configurato e stato sync;
- [ ] logging errori non sensibile;
- [ ] test e2e obbligatori prima del commit per flussi critici.

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
