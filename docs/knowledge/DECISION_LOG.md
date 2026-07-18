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

## Regole per nuove decisioni

Una nuova voce deve:

1. avere un ID stabile e una data;
2. descrivere una sola scelta significativa;
3. spiegare perche e stata scelta e quali compromessi introduce;
4. indicare se sostituisce una decisione precedente;
5. collegarsi al backlog quando richiede implementazione o test.

Il backlog resta la fonte operativa per stato, owner, effort e lavoro residuo.
