# Registro delle decisioni Watchverse

Formato leggero ispirato agli Architecture Decision Records: una decisione, il contesto, la scelta, le conseguenze e lo stato. Le decisioni superate non vengono cancellate; vengono marcate come sostituite e collegate alla decisione successiva.

| ID | Data | Decisione | Motivo e conseguenze | Stato |
| --- | --- | --- | --- | --- |
| ADR-001 | 2026-06 | Usare Supabase come backend cloud | Offre Auth, database, RLS e funzioni server-side con piano gratuito; richiede configurazione RLS e test manuali del progetto. | Attiva |
| ADR-002 | 2026-06 | Un account familiare con profili Daniela ed Elena | Mantiene separati progressi e preferenze senza creare registrazioni pubbliche o account distinti. | Attiva |
| ADR-003 | 2026-06 | Usare `daniela` come username pubblico | Evita di mostrare l'email personale nella login; il recupero password resta legato all'email in Supabase. | Attiva |
| ADR-004 | 2026-06 | Cloud come fonte primaria, IndexedDB come cache offline | La libreria deve essere condivisa tra dispositivi; la cache locale non deve diventare una seconda fonte autorevole. | Parzialmente implementata |
| ADR-005 | 2026-06 | RLS per isolamento dei profili | I dati personali devono essere accessibili solo al profilo corretto, mentre il catalogo condiviso puo essere riutilizzato. | Attiva, da verificare |
| ADR-006 | 2026-06 | Proxy server-side per TMDB e fonti protette | I token privati non devono essere inclusi nel client pubblico o nel repository. | Attiva |
| ADR-007 | 2026-06 | Retry metadati esplicito e deciso dall'utente | Evita richieste ripetute a ogni accesso e rende visibili errori e titoli da verificare senza bloccare la navigazione. | Parzialmente implementata |
| ADR-008 | 2026-06 | Watchverse Black come tema predefinito | Tema scuro con deep crimson/oxblood, contrasto verificato e Buffy come tema dedicato. | Attiva |
| ADR-009 | 2026-06 | Asset brand forniti dall'utente come riferimento definitivo | Le proposte generate in chat non devono essere ricostruite approssimativamente; il file SVG approvato e la fonte del logo. | Attiva |
| ADR-010 | 2026-06 | Mobile first | Layout, dettagli, tastiera, overflow e dimensioni devono essere progettati prima per schermi piccoli e verificati su Samsung Galaxy S26+. | Attiva |
| ADR-011 | 2026-06 | Import TV Time con voti convertiti 1-5 -> 1-10 | La scala Watchverse usa solo stelle intere; la conversione arrotonda per eccesso e conserva il dato originale quando disponibile. | Attiva |
| ADR-012 | 2026-07 | Conferme distruttive gestite dall'app | Sostituzione import e rimozione catalogo devono usare dialog coerenti col design system, bloccare lo scroll sottostante e descrivere l'effetto. | Parzialmente implementata |
| ADR-013 | 2026-07 | Build e deploy separati dal test locale | Le modifiche vengono provate localmente prima della pubblicazione; non si fa deploy senza richiesta esplicita dell'utente. | Attiva |
| ADR-014 | 2026-07 | Browser E2E sospesi senza fixture dedicate | Evita run falliti e notifiche rumorose; la riattivazione richiede fixture/credenziali non sensibili e un gate profili deterministico. | Sospesa |
| ADR-015 | 2026-07-18 | Loader informativo e bootstrap profilo in due fasi | Il primo rendering non deve attendere il pull cloud completo. Il loader di navigazione informa senza intercettare i click, mentre l'idratazione cloud aggiorna la Home in background e l'ultima rotta richiesta sostituisce quelle obsolete. | Attiva, in verifica |
| ADR-016 | 2026-07-18 | Rendering differito per Ricerca e Programmazione | Le sezioni con raccomandazioni, palinsesti e orari mostrano prima una shell interattiva e posticipano il calcolo pesante al primo spazio libero dopo il paint. Se l'utente cambia rotta, il lavoro obsoleto viene annullato. | Attiva, da verificare |
| ADR-017 | 2026-07-18 | Navigazione prioritaria rispetto alla preparazione delle viste | Cerca e Programmazione possono preparare contenuti in background, ma la navigazione verso Home, Serie o Film deve essere immediata. `history.pushState` e un contatore di navigazione rendono obsolete le callback precedenti; la cache di vista evita di ricalcolare le proposte quando i dati non sono cambiati. | Attiva, da verificare |
| ADR-018 | 2026-07-18 | Home con primo paint immediato e refresh background senza shell | La Home aggiorna subito navigazione e shell, differisce il calcolo delle rail e, nei refresh automatici, mantiene l’elenco già visibile. Evita ritardi percepiti e lampeggi quando arrivano metadati o dati cloud. | Attiva, verificata desktop |

| ADR-019 | 2026-07-18 | Diagnostica prima di nuovi retry massivi dei metadati | Un retry mirato puo lasciare invariato o aumentare l'elenco dei titoli da verificare e gli errori tecnici. Prima di ottimizzare altri retry va reso leggibile e salvabile il dettaglio per titolo, fonte, identificazione e tentativi. | Attiva, da implementare |
| ADR-020 | 2026-07-18 | Jira come registro operativo del backlog | Il backlog Watchverse viene censito nel progetto company-managed `WVERSE` con release R1 per il lavoro completato, sprint corrente/Review per il lavoro implementato da verificare manualmente e backlog per il lavoro non ancora sviluppato. Story, Task e Bug hanno criteri distinti; i test restano parte del passaggio in Review e non diventano subtask. | Attiva |
| ADR-021 | 2026-07-18 | Componenti Jira per disciplina, Epic per capability | I componenti rappresentano le aree del ciclo di vita (Analisi e Progettazione, UX/UI, Front-end, Back-end, Cloud/Infrastructure, QA/Testing, DevOps/CI/CD). Le aree funzionali (autenticazione, metadati, import/export, sincronizzazione, performance e simili) sono Epic, per evitare di mescolare responsabilita tecnica e ambito di prodotto nello stesso campo. | Attiva |
| ADR-022 | 2026-07-18 | Story Jira con user story e contesto implementabile | Ogni Story deve esplicitare ruolo, obiettivo e valore nella forma `Come [ruolo], voglio [obiettivo], cosi da [beneficio]`. La descrizione deve includere anche ambito, flussi, casi limite/errori, vincoli, dipendenze, criteri di accettazione ed evidenze; per il lavoro gia completato deve distinguere implementazione effettiva e verifiche manuali residue. | Attiva |
| ADR-023 | 2026-07-18 | Handoff e collaudo documentati sulla issue principale | Il passaggio in Review e l'esito del test manuale vengono registrati con due commenti distinti sulla Story, Task o Bug principale. I subtask contengono il dettaglio tecnico, ma non sostituiscono il riepilogo di sviluppo, istruzioni di test ed esito finale. | Attiva |

## Regole per nuove decisioni

Una nuova voce deve:

1. avere un ID stabile e una data;
2. descrivere una sola scelta significativa;
3. spiegare perche e stata scelta e quali compromessi introduce;
4. indicare se sostituisce una decisione precedente;
5. collegarsi al backlog quando richiede implementazione o test.

Il backlog resta la fonte operativa per stato, owner, effort e lavoro residuo.
