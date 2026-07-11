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
| Autenticazione familiare cloud | In corso | Alta | Login cloud verificato; restano recupero password e profili persistenti |
| Dati condivisi su cloud | In corso | Alta | Prima sincronizzazione attiva per profili, librerie, progressi e impostazioni |
| Fonti dati complete | In corso | Alta | TVmaze/Wikipedia/Wikidata presenti; proxy TMDB, trailer, streaming e cinema da completare |
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
- [ ] implementare sync bidirezionale con versioni e risoluzione conflitti;
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

- [ ] attivare proxy sicuro TMDB/JustWatch tramite backend;
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
- [ ] creare favicon, icona 192, icona 512 e maskable icon;
- [x] aggiornare manifest e asset;
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
