# Gestione backlog Watchverse in Jira

## Obiettivo

Jira e il registro operativo del lavoro Watchverse. Il backlog locale resta la fonte storica e tecnica per ricostruire le issue; dopo il censimento, Jira diventa la fonte operativa per stato, sprint, assegnatario, priorita e componenti.

Progetto Jira corrente: Watchverse, progetto company-managed con chiave `WVERSE`, board Scrum `WVERSE board`.

## Regole di censimento

- Le attivita gia implementate e pubblicate vengono censite come `Done` nella release `R1`. La release verra chiusa da Daniela dopo il censimento e la verifica desiderata.
- Le funzionalita o correzioni implementate ma ancora da verificare manualmente vengono messe nello sprint corrente, in stato `Review`, assegnate a Daniela.
- Le attivita non implementate restano nel backlog; Daniela decidera lo sprint.
- Non si creano subtask dedicati al test manuale: il test funzionale riguarda la Story, Task o Bug principale.
- I subtask sono elementi tecnici intermedi e non vengono sottoposti a Review funzionale: quando il lavoro tecnico e concluso possono passare direttamente a `Done`.
- La Story principale passa in `Review` solo quando tutti i subtask necessari sono in `Done` e il comportamento complessivo e pronto per la verifica manuale.
- Le issue che Codex prende in carico vengono assegnate a Daniela, perche il connettore Atlassian opera con la sua identita Jira. Si aggiunge la label `codex-managed` per distinguere le issue gestite da Codex.
- Gli stati operativi concordati sono `To Do`, `In Progress`, `Review`, `Done`.

## Tipi e titoli

- `Bug`: comportamento errato o regressione rispetto a un comportamento atteso.
- `Task`: attivita tecnica, di configurazione, refactoring, hardening o analisi.
- `Story`: capacita o risultato funzionale; puo contenere piu elementi di sviluppo front-end/back-end nella stessa issue.
- Ogni titolo inizia con la sezione tra parentesi quadre, per esempio `[Serie] Accesso al dettaglio da card non funzionante`.

## Contenuto obbligatorio

Ogni issue deve indicare, quando applicabile: contesto, problema/obiettivo, comportamento attuale e atteso, dettagli funzionali e tecnici, criteri di accettazione, componenti, priorita, assegnatario, stato, sprint, release, dipendenze e rischi.

Ogni `Story` deve contenere anche la formulazione standard:

`Come [ruolo], voglio [obiettivo/capacita], cosi da [valore o beneficio].`

## Label operative

- `codex-managed`: issue presa in carico o gestita operativamente da Codex tramite l'account Jira di Daniela.
- La label non sostituisce l'assegnatario: l'assegnatario resta Daniela e la label rende filtrabile il lavoro gestito da Codex.
- La label va applicata alla issue principale e, quando utile per la tracciabilita, ai relativi subtask.
- Non usare la label per indicare semplicemente che Codex ha letto o commentato una issue: va applicata solo quando Codex ne gestisce l'implementazione o il ciclo operativo.

Per rendere una issue realmente comprensibile e implementabile, la descrizione deve inoltre distinguere: ambito incluso e non incluso, flusso principale, casi limite e stati di errore, vincoli tecnici/non funzionali, dipendenze, dati o configurazioni necessarie, criteri di accettazione osservabili ed eventuali evidenze gia disponibili. Per le issue gia completate si aggiunge una sezione di implementazione effettiva e una nota su cio che resta da verificare manualmente.

Quando Codex porta una issue in `Review`, aggiunge un commento breve con modifiche effettuate e passaggi per il test funzionale. Dopo il test di Daniela, la issue viene chiusa o riportata in `In Progress` con evidenza del problema.

## Commenti di transizione sulla Story

Per Story, Task e Bug i commenti di handoff e collaudo vengono aggiunti sulla issue principale, non sui subtask:

- commento `Passaggio in Review`: sintesi delle attività realizzate, test automatici rilevanti e istruzioni per il test funzionale manuale;
- commento `Esito verifica manuale`: flussi verificati, esito, problemi rilevati e motivazione del passaggio in `Done` oppure del ritorno in `In Progress`.

I subtask documentano il lavoro tecnico specifico; non sostituiscono il riepilogo di transizione della Story.

Il ciclo di vita dei subtask e indipendente dalla Review funzionale: un subtask completato passa direttamente a `Done`. La Review e il test manuale si applicano alla issue principale, dopo la chiusura di tutti i subtask necessari.

## Componenti definitivi

- `Analisi e Progettazione`: raccolta requisiti, analisi funzionale, architettura, modellazione dati e progettazione tecnica.
- `UX/UI`: flussi utente, wireframe, interazioni, layout, responsive design e usabilita.
- `Front-end`: SPA JavaScript, HTML, CSS, routing, rendering, interazioni browser e PWA lato client.
- `Back-end`: Supabase, database, API, RLS, Edge Functions, proxy e logica server-side.
- `Cloud/Infrastructure`: hosting, GitHub Pages, Supabase project, ambienti, configurazioni, sicurezza e infrastruttura di deploy.
- `QA/Testing`: test funzionali, regressione, accessibilita, responsive, test manuali ed E2E.
- `DevOps/CI/CD`: build, versioning, GitHub Actions, pipeline, release automation e qualita del deploy.

I componenti rappresentano disciplina, responsabilita o fase del ciclo di vita. Una issue puo avere piu componenti quando coinvolge piu discipline, ma va indicato solo il minimo insieme utile.

## Epic di prodotto

Le capability funzionali vengono organizzate come Epic, non come componenti:

- `Autenticazione e profili`: login, sessione, password, PIN, recupero credenziali e profili Daniela/Elena.
- `Libreria, progressi e preferiti`: film, serie, episodi, watchlist, preferiti, valutazioni, progressi e organizzazione della libreria.
- `Ricerca e raccomandazioni`: ricerca locale/pubblica, filtri, risultati pertinenti, suggerimenti e proposte personalizzate.
- `Metadati e fonti pubbliche`: TMDB, JustWatch, TVmaze, locandine, cast, trailer, streaming, cinema e diagnostica.
- `Import, export e backup`: import TV Time/GDPR, conversione voti, export, restore e backup.
- `Sincronizzazione cloud e offline`: sincronizzazione dispositivi, cache IndexedDB, merge, revisioni, tombstone, conflitti e offline.
- `Performance e PWA`: bootstrap, caricamento progressivo, caching, rendering differito, responsive, service worker e installazione PWA.
- `Identita visiva e design system`: temi, branding, logo, colori, tipografia, icone, contrasto e accessibilita visuale.

La distinzione adottata e: componente = come/da quale disciplina si realizza il lavoro; Epic = quale capability di prodotto si sta costruendo o migliorando.

## Assegnatari e integrazione Codex

Gli assegnatari Jira previsti sono Daniela e, se in futuro verrà creato un account Atlassian dedicato, l'eventuale account tecnico. Nell'assetto corrente Codex opera tramite l'identità Jira di Daniela: non esiste quindi un assignee Jira separato "Codex". Le issue gestite da Codex devono usare l'assegnatario Daniela e la label `codex-managed`.

Non salvare token o credenziali nella repository e non usare account condivisi. Se l'integrazione Jira non e disponibile, Daniela deve prima abilitarla/autorizzarla nello spazio Atlassian; fino a quel momento Codex puo preparare il modello e guidare la configurazione, ma non dichiarare completato il censimento remoto.

## Procedura periodica

Quando Daniela indica uno sprint, Codex prende in carico le issue assegnate a Daniela e marcate `codex-managed` in quello sprint. Lavora una Story alla volta e porta i relativi subtask in `In Progress`, implementa e verifica localmente, poi chiude i subtask direttamente in `Done`. Quando tutti i subtask necessari sono conclusi, porta la Story principale in `Review` con commento di handoff. La Story resta in `Review` fino all'esito del test manuale di Daniela.

## Stato del censimento Jira

La configurazione e la baseline iniziale sono state registrate nel progetto `WVERSE`:

- Epic di prodotto: `WVERSE-1` - `WVERSE-8`, con descrizione strutturata e campo `Complessità` valorizzato;
- Story campione: `WVERSE-9`, con quattro subtask tecnici `WVERSE-10` - `WVERSE-13`;
- la Story campione e i subtask sono in `Done`, nella release `R1`, con i commenti di passaggio in Review ed esito della verifica manuale sulla Story principale;
- il campo Jira `Complessità` e una selezione singola con valori `Bassa`, `Media`, `Alta`;
- le issue gestite da Codex usano la label `codex-managed` e restano assegnate a Daniela.

Il censimento automatico della baseline e del backlog è stato poi esteso:

- `WVERSE-14` - `WVERSE-42`: 29 Story funzionali, collegate alle Epic di prodotto, con priorità, componenti, complessità, assegnatario e label `codex-managed`;
- `WVERSE-43` - `WVERSE-163`: 121 subtask tecnici, denominati con il componente tra parentesi e collegati alla Story principale;
- `WVERSE-164` - `WVERSE-170`: Task operativi di QA, DevOps, sicurezza, deploy e performance;
- `WVERSE-171` - `WVERSE-178`: Bug relativi a ricerca, metadati, sincronizzazione, libreria e importazione;
- le Story già implementate sono state portate in `Done` e associate a `R1`, insieme ai relativi subtask;
- le Story implementate ma da verificare manualmente sono in `Review`, con commento di handoff e istruzioni di test sulla Story principale; i subtask corrispondenti sono direttamente in `Done`;
- le Story e le issue ancora da realizzare sono rimaste in `To Do`/backlog, senza assegnazione artificiale a uno sprint.

Il censimento è una baseline operativa: eventuali sovrapposizioni storiche nel backlog locale devono essere ricondotte alle issue canoniche già create, evitando duplicati.

## Regola di granularità dei subtask

I subtask non sono segnaposto generici per componente. Summary e descrizione devono essere contestualizzati alla Story principale e indicare l'implementazione concreta da realizzare, i contratti o gli stati coinvolti e il criterio tecnico di completamento. Una stessa disciplina può avere più subtask quando il lavoro contiene attività indipendenti, per esempio separando UI, integrazione dati, gestione asincrona, persistenza, sicurezza o test automatici. Prima di creare un nuovo subtask va verificato che non duplichi quelli esistenti; quando una Story è complessa si preferisce una scomposizione tecnica più precisa mantenendo la Story come unità di verifica funzionale.

Per i subtask di Analisi e Progettazione il deliverable non è una frase riepilogativa nel commento Jira. L'analisi funzionale e tecnica viene documentata in un file Markdown versionato sotto `docs/knowledge/analysis/`, con sezioni su flussi, input, stati, errori, contratti, persistenza, sicurezza, dipendenze e criteri tecnici. Il commento Jira contiene il link al file e una sintesi; per i subtask futuri il documento viene prodotto prima del passaggio a `Done`.

## Stime Jira

- Story, Task e Bug ricevono sia gli Story Points sia `Original Estimate`.
- Gli Story Points usano la scala Fibonacci e rappresentano la dimensione relativa della issue: `3` bassa, `5` media, `8` alta.
- La stima operativa usa `Original Estimate` in ore: per Story `16h` bassa, `24h` media, `32h` alta; per Task e Bug `8h` bassa, `16h` media, `24h` alta.
- Mappatura operativa per le Story: `Bassa = 3 SP / 16h`, `Media = 5 SP / 24h`, `Alta = 8 SP / 32h`. Gli SP esprimono dimensione relativa; le ore esprimono capacità operativa attesa e non sono una conversione matematica.
- I subtask non ricevono Story Points: ricevono solo `Original Estimate` in ore, in base al componente. La convenzione corrente è `4h` per Analisi e Progettazione, UX/UI e QA/Testing; `8h` per Front-end, Back-end, Cloud/Infrastructure e DevOps/CI/CD.
- La convenzione di calendario è `1 giorno/uomo = 8 ore`.
- Story Points e ore sono indicatori complementari e non devono essere convertiti automaticamente l'uno nell'altro.
- Le Epic sono contenitori di capability e non vengono stimate direttamente: la stima è distribuita sulle Story, Task, Bug e sui subtask figli.
- Il campo Story Points utilizzato dalla schermata delle Story è `customfield_10038`; `customfield_10016` è il distinto campo Jira `Story point estimate` e non deve essere usato per questa convenzione. Se il valore è presente in `customfield_10038` ma la schermata mostra `Nessuno`, va verificata la configurazione del layout/schermata del campo.

## Sprint 2 — presa in carico e passaggio in Review

Una Story/Task/Bug viene portata in `Review` quando l’implementazione o la verifica tecnica è completata, la suite automatica è verde e il commento Jira contiene la sintesi delle modifiche, l’evidenza dei controlli e i passi di test funzionale manuale per Daniela.

I subtask tecnici restano intermedi: quando il loro output è completato vengono portati direttamente in `Done`; il collaudo funzionale non viene duplicato sui subtask e resta sulla Story principale.

Gli output di analisi e le decisioni tecniche riproducibili sono conservati in `docs/knowledge/analysis/` con nome `WVERSE-<numero>.md`. I test di regressione condivisi dello Sprint 2 sono raccolti in `tests/test-sprint2-regressions.js` e inclusi nella suite `npm test`.

## Esiti dei test Sprint 1

Il test manuale di `WVERSE-18` è stato completato con esito funzionale positivo: il profilo Daniela viene caricato e la Home è utilizzabile. La Story è stata portata in `Done`.

Durante il test sono stati aperti due bug nello Sprint 1:

- `WVERSE-185`: ordine della sezione “Continua a guardare” non coerente con l’attività recente;
- `WVERSE-186`: stato “Ciclo completato” incoerente con copertura metadati all’1%.

Entrambi i bug sono assegnati a Daniela, collegati alle rispettive Epic, con priorità High, complessità Media e componenti tecnici valorizzati. Lo screenshot del collaudo è allegato a `WVERSE-18` e referenziato nei due bug.

## Aggiornamento collaudo e presa in carico — 19 luglio 2026

La ripresa dei test ha distinto gli esiti funzionali desktop dai test che richiedono un secondo dispositivo:

| Issue | Esito corrente | Azione |
| --- | --- | --- |
| `WVERSE-171` | Fix implementato: query, focus e cursore vengono ripristinati dopo rendering asincrono/cloud | Pronto per retest mobile; portato in Revisione |
| `WVERSE-172` | Superato desktop: risultati pertinenti, senza persone e duplicati | Da portare a Completata |
| `WVERSE-173` | Fix implementato: retry singolo/massivo azzera anche il retry pianificato e rimette correttamente gli elementi in coda | Pronto per retest desktop; portato in Revisione |
| `WVERSE-174` | Superato: comandi del pannello recepiti | Da portare a Completata |
| `WVERSE-175` | Superato: rimozione persistente dopo refresh | Da portare a Completata |
| `WVERSE-176` | Non eseguito: richiede modifica da altro dispositivo | Resta in Revisione |
| `WVERSE-177` | Superato: redirect alla libreria corretta | Da portare a Completata |
| `WVERSE-178` | Superato desktop: conferma, avanzamento e riepilogo import | Da portare a Completata |
| `WVERSE-185` | Superato desktop: “Continua a guardare” mostra solo serie iniziate e ordinate per visione recente | Da portare a Completata |
| `WVERSE-186` | Fix implementato: stato ciclo, attesa retry e diagnostica aggiornati | Pronto per retest desktop; portato in Revisione |
| `WVERSE-188` | Superato desktop: indicatori di stato rimossi; completate con check statico e Dettagli a larghezza piena | Da portare a Completata; 3 SP / 2 giorni uomo |
| `WVERSE-189` | Superato: cambio profilo ripristina la Home | Da portare a Completata |
| `WVERSE-190` | Superato desktop: la prima query resta visibile e produce risultati pertinenti | Da portare a Completata |
| `WVERSE-192` | Superato desktop: colonna laterale del dettaglio mantiene il distacco tra i box | Da portare a Completata |
| `WVERSE-193` | Fix implementato: chevron senza cerchio, centrato, giù da chiuso e su da aperto | Pronto per retest desktop; portato in Revisione |
| `WVERSE-194` | Non eseguito: richiede viewport mobile | Resta in Revisione |
| `WVERSE-195` | Superato desktop: controllo a campione senza testi tecnici residui nell’interfaccia | Da portare a Completata |
| `WVERSE-197` | Superato desktop: rimozione immediata verificata su serie e film, anche dopo refresh | Da portare a Completata |
| `WVERSE-198` | Superato desktop: il toast “Rimozione in corso” scompare al completamento | Da portare a Completata |

La suite automatica e la build statica sono verdi. Gli E2E browser locali restano sospesi per `spawn EPERM`; i test multidispositivo e mobile non sono stati considerati completati.

## Nuova attività Sprint 1 — WVERSE-199

Creata la Task `WVERSE-199` per sostituire la label “Prossimo” con “Visto” nelle card delle serie, mantenendo invariata la logica di registrazione dell’episodio. La Task è assegnata a Daniela, nello Sprint 1, con stima **3 Story Points / 16h / 2 giorni uomo**.

Aggiornamento Jira: `WVERSE-199` è associata all’Epic `WVERSE-2` (**Libreria, progressi e preferiti**) e alla versione di correzione `R2`.

Retest `WVERSE-193`: KO su desktop. Lo chevron cambia posizione percepita tra aperto e chiuso; la issue è stata riportata in **In corso** con richiesta di geometria a dimensione fissa e ancoraggio stabile.

Aggiornamento lavorazione: `WVERSE-193` è stata corretta con una geometria CSS a contenitore fisso ed è tornata in **Revisione** per retest. `WVERSE-199` è stata implementata con label **Visto** e portata in **Revisione**.

## Analisi delle Story in backlog

Nel ciclo di analisi sono stati prodotti deliverable funzionali e tecnici versionati in `docs/knowledge/analysis/`. Per le Story che erano ancora in `Da completare`:

- `WVERSE-43`: preferenze e impostazioni personali;
- `WVERSE-100`: raccomandazioni senza titoli già presenti;
- `WVERSE-121`: diagnostica dei titoli senza corrispondenza;
- `WVERSE-129`: export e ripristino dei dati personali;
- `WVERSE-133`: sincronizzazione cloud bidirezionale e conflitti;
- `WVERSE-143`: aggiornamento delle viste dopo modifiche da altro dispositivo;

Sono stati inoltre completati e ricondotti alla gerarchia corretta due deliverable già associati a Story in `Review`: `WVERSE-138` alla Story `WVERSE-37` e `WVERSE-147` alla Story `WVERSE-39`.

I deliverable descrivono flussi, contratti dati, stati, errori, dipendenze e criteri tecnici. I relativi subtask di analisi sono stati portati direttamente in `Done`; le Story principali sono passate in `In Progress`. Dopo l'analisi di WVERSE-38 la complessità è stata rivalutata da Media ad Alta, con Story Points da 5 a 8 e stima da 24h a 32h.
