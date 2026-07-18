# Contesto di progetto Watchverse

## Identita

Watchverse e una web app privata per organizzare film, serie TV, episodi, progressi, preferiti e watchlist per un account familiare con due profili separati:

- **Daniela**: proprietaria dell'account, puo impostare e cambiare la password e gestire il profilo.
- **Elena**: usa lo stesso account, puo accedere a entrambi i profili ma modifica normalmente il proprio.

La pubblicazione corrente e una PWA statica su GitHub Pages:

- sito: `https://danychi1982.github.io/watchverse/`;
- repository: `danychi1982/watchverse`;
- branch di rilascio: `main`;
- deploy: GitHub Actions verso GitHub Pages;
- backend: progetto Supabase gratuito, con Auth, database, RLS e Edge Functions.

## Architettura corrente

### Frontend

Il frontend e una SPA statica in JavaScript e CSS, caricata da `index.html`. I file runtime sono nella root per compatibilita con il caricamento diretto e con la build statica:

- `app.js`: stato, routing, rendering e interazioni;
- `auth.js`: autenticazione, sessione, recupero password e PIN;
- `cloud-sync.js`: lettura/scrittura cloud e sincronizzazione;
- `public-metadata.js`: metadati, fonti pubbliche e aggiornamenti;
- `gdpr-import.js`: importazione TV Time/backup;
- `styles.css`: temi e layout responsive;
- `sw.js`: service worker/PWA;
- `scripts/`: build, server locale e orchestrazione test;
- `tests/`: test funzionali, contratti e browser E2E.

Il suggerimento di introdurre lazy loading dei moduli con Vite e registrato nel backlog; non e ancora una decisione di migrazione.

### Dati e autenticazione

- Supabase e la fonte primaria per autenticazione, profili, librerie, progressi, preferenze e catalogo condiviso.
- IndexedDB e destinato a essere solo cache offline; la separazione completa e ancora da verificare/completare.
- Le password non sono nel repository e non vengono salvate come testo leggibile nel client.
- Le registrazioni pubbliche sono disabilitate.
- L'username visualizzato e `daniela`, mentre il recupero usa l'email configurata in Supabase.
- Le policy RLS sono fondamentali: ogni profilo deve poter leggere/scrivere solo i propri dati; il catalogo condiviso ha regole separate.

### Fonti pubbliche

Sono presenti proxy Supabase per TMDB e fonti pubbliche. I segreti restano nelle Edge Functions e non nel browser. Sono presenti integrazioni per trailer, streaming e alcuni dati cinema; la copertura dei titoli incompleti e ancora da verificare.

## Decisioni di prodotto e UX

- Approccio **mobile first**; riferimento manuale principale: Samsung Galaxy S26+.
- Il primo rendering deve mostrare rapidamente la home personale senza flash della home vuota o della composizione demo.
- Il caricamento deve essere progressivo: autenticazione, profilo e dati minimi prima; immagini/metadati non visibili e resto della libreria in background.
- Ogni interazione lenta deve avere uno stato di caricamento coerente e deve evitare click concorrenti o UI apparentemente bloccata.
- I retry dei metadati non partono automaticamente: l'utente decide quando riprovare.
- Un retry manuale puo lasciare invariato o aumentare l'elenco dei titoli da verificare e gli errori tecnici; serve una diagnostica per distinguere assenza legittima di fonte, identificazione errata e errore tecnico.
- Le azioni distruttive richiedono conferma interna all'app, aderente al design system; non usare `window.confirm`.
- Dopo rimozione di un titolo, il risultato atteso e redirect a lista film/serie o home e persistenza anche dopo refresh.
- I campi password e PIN partono nascosti e hanno mostra/nascondi dentro il campo.
- Il tema predefinito e **Watchverse Black**, con rosso deep crimson/oxblood come colore primario e controllo sistematico del contrasto.
- Slogan approvato: **Scegli cosa guardare. Ricorda cosa hai visto.**
- Gli asset di brand approvati sono quelli forniti dall'utente in `assets/brand/watchverse-dragon-wordmark.svg` e `assets/brand/watchverse-dragon-w.svg`. Non sostituirli con una ricostruzione approssimativa.

## Importazione e valutazioni

- L'import TV Time usa `gdpr-data.zip`.
- L'opzione di sostituzione cancella i dati del solo profilo corrente prima dell'importazione e deve sempre mostrare una conferma interna.
- I voti storici TV Time su scala 1-5 vengono convertiti nella scala Watchverse 1-10, arrotondando a stelle intere.
- `addedAt` e la persistenza dell'ordinamento per data di aggiunta sono ancora oggetto di verifica nel backlog.

## Performance e caricamento

Il problema attuale piu importante e il tempo di accesso al profilo e alla home. La direzione approvata e un bootstrap in due fasi:

1. sessione, profilo e proiezione minima delle sezioni visibili;
2. locandine non visibili, metadati e resto della libreria in background.

La soluzione dovra misurare almeno LCP, TTI e tempo di apertura profilo, usare cache stale-while-revalidate, deduplicare/annullare richieste obsolete e limitare la concorrenza. Questa e una voce attiva del backlog, non una funzionalita da considerare completata.

Il bootstrap del profilo ora segue due fasi: con cache vuota mostra una Home coerente in stato di preparazione, poi idrata la libreria cloud in background. Il loader di navigazione e informativo e non deve bloccare i click; una navigazione successiva invalida quella precedente.

Ricerca e Programmazione usano un rendering differito: mostrano subito una shell di caricamento e calcolano proposte, palinsesti e orari dopo il primo paint tramite idle scheduling. Se la rotta cambia prima del calcolo, la richiesta obsoleta viene scartata.

La navigazione ha priorita sul caricamento differito: i link interni aggiornano subito la rotta con `history.pushState` e incrementano `navigationRequestId`, quindi una callback obsoleta di Cerca o Programmazione non puo piu sostituire la pagina scelta dall'utente. Le viste costose usano `viewCache`, invalidata quando cambia `dataRevision`; il refresh cloud automatico e limitato alle sezioni personali principali e ha un intervallo minimo di 60 secondi. Cerca e Programmazione non devono avviare sincronizzazioni cloud automatiche a ogni apertura.

La Home mostra subito la voce di navigazione attiva e una shell al primo ingresso; il calcolo di rail, progressi e calendario viene differito dopo il primo paint. I refresh automatici di metadati o cloud aggiornano direttamente la Home gia visibile senza ripresentare la shell di preparazione, evitando lampeggi durante la permanenza nella sezione.

## Test e limiti operativi

- I test non distruttivi possono essere eseguiti autonomamente.
- Non richiedere privilegi amministrativi e non usare comandi distruttivi.
- L'ambiente locale ha avuto problemi `spawn EPERM` con Chrome. Il browser E2E GitHub Actions e sospeso finche non esistono fixture/credenziali di test dedicate e il gate profili non e stabile.
- I test manuali cloud, multi-dispositivo, Supabase e Samsung Galaxy S26+ restano a carico di Daniela.
- Prima del deploy: verificare codice, test disponibili e build. Il deploy va fatto solo quando richiesto esplicitamente.
- Quando richiesto un commit, includere tutto il pending coerente con la richiesta e controllare `git status` dopo il commit.

## Gestione operativa Jira

Il progetto Watchverse usa il progetto Jira company-managed `WVERSE` e la board `WVERSE board` per il backlog operativo. Le regole di censimento, i tipi di issue, gli stati, la release R1, i componenti e il flusso Codex/Daniela sono definiti in [JIRA_WORKFLOW.md](JIRA_WORKFLOW.md). I componenti rappresentano discipline/ciclo di vita; le capability funzionali sono Epic. Le issue gia completate vanno in R1/Done; quelle implementate ma da testare manualmente vanno nello sprint corrente/Review; il lavoro non ancora sviluppato resta nel backlog. Il test manuale non ha subtask dedicati; l'automazione QA puo invece essere tracciata in un subtask. Le issue gestite da Codex usano la label `codex-managed` e restano assegnate a Daniela.

## Come aggiornare il contesto

Aggiornare questo file solo per fatti stabili o regole operative. Per una scelta nuova aggiungere una voce a `DECISION_LOG.md`; per un'attivita aggiungere o aggiornare `BACKLOG_CLOUD.md`. Evitare di usare questo file come cronologia delle sessioni.
