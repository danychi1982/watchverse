# Watchverse Design System

Versione: 1.0.0 · Build 14

## Preview visuale

La pagina [Design System Preview](docs/design-system-preview.html) mostra i token e i componenti in forma grafica: logo, palette, pulsanti, link con hover/focus, card con badge, barra di avanzamento e stati di sincronizzazione/errori/successo. Può essere aperta direttamente dal repository o dalla copia pubblicata insieme al sito.

Questo documento descrive le regole visive e interattive condivise da Watchverse. I componenti devono usare i token semantici del tema attivo; i valori colore hardcoded sono ammessi solo per immagini, poster, loghi di emittenti o fondali tematici chiaramente circoscritti.

## Principi

- **Chiaro prima di tutto**: gerarchie, stati e azioni devono essere riconoscibili senza dipendere soltanto dal colore.
- **Una grammatica comune**: stesso ruolo, stesso token e stesso comportamento in tutte le pagine.
- **Contrasto verificabile**: testo normale almeno WCAG AA 4.5:1; testo grande almeno 3:1; componenti e focus almeno 3:1 quando richiesto.
- **Responsive per contenuto**: nessun testo o controllo deve essere tagliato a desktop o mobile.
- **Accessibile da tastiera**: ogni azione interattiva ha focus visibile, nome accessibile e ordine di navigazione coerente.

## Tema predefinito

Il tema predefinito è **Watchverse Black**.

| Token | Valore | Uso |
| --- | --- | --- |
| `--bg` | `#070707` | Sfondo applicazione |
| `--surface` | `#111112` | Pannelli e card |
| `--surface-2` | `#18181a` | Hover e superfici secondarie |
| `--surface-3` | `#242427` | Controlli, badge e campi |
| `--text` | `#fafafa` | Testo principale |
| `--muted` | `#a9a9af` | Testo secondario |
| `--line` | `#343438` | Bordi e separatori |
| `--accent` | `#8e1624` | Rosso primario: pulsanti, selezioni, progressi |
| `--accent-2` | `#c02a38` | Rosso d’azione leggibile: link, hover, indicatori |
| `--on-accent` | `#ffffff` | Testo su superfici rosse |
| `--danger` | `#8e1624` | Stato errore e attenzione distruttiva |
| `--danger-strong` | `#c02a38` | Bordo o enfasi dello stato errore |
| `--danger-text` | `#f5d7d7` | Testo esplicativo dell’errore |
| `--success` | `#77d66c` | Operazioni completate |
| `--info` | `#80bfff` | Informazioni non critiche |
| `--warning-text` | `#ffd27a` | Avvisi informativi |

Il rosso primario non va usato come testo piccolo su fondo scuro quando il contrasto non è sufficiente: in quel caso si usa `--accent-2`, mantenendo la stessa famiglia cromatica e il ruolo di azione.

## Colore semantico

- **Azione primaria**: `--accent` con `--on-accent`.
- **Link e azioni testuali**: `--accent-2`, sottolineati; al passaggio del mouse o al focus diventano `--text`.
- **Errore**: `--danger` per superfici e indicatori, `--danger-strong` per bordi, `--danger-text` per testo descrittivo.
- **Successo**: `--success`, sempre accompagnato da testo o icona comprensibile.
- **Focus**: outline dedicato, non rimosso e non affidato solo a un cambio di colore.

Il rosa non fa parte del design system Watchverse Black. Le precedenti tonalità rosa dei badge di errore, del pallino notifiche e dell’icona metadati sono state sostituite dai token rossi semantici.

## Componenti

### Pulsanti

- Altezza minima consigliata: 44px.
- Raggio standard: 12px; pillole solo per stati o filtri.
- Primario: fondo `--accent`, testo `--on-accent`.
- Secondario: fondo `--surface-3`, bordo `--line`, testo `--text`.
- Icone sempre accompagnate da `aria-label` o testo visibile quando il significato non è ovvio.

### Link

I link importanti sono sottolineati e usano `--accent-2`. Hover e focus usano `--text` e mantengono la sottolineatura. Non si usa il colore come unica informazione per distinguere un link dal testo circostante.

### Focus

Il focus visibile usa un outline di almeno 3px con offset. I controlli circolari, i link, i tab e i campi devono mantenere un focus distinguibile anche su superfici scure.

### Stati di sincronizzazione

- In corso: icona e barra con `--accent`.
- Completato: `--success` più messaggio testuale.
- Con errori: `--danger` e testo esplicativo; non usare rosa o indicatori cromatici isolati.

### Card e carousel

- Le informazioni operative, come codice stagione/episodio e progresso, restano nel corpo della card e non vengono sovrapposte a zone variabili della locandina.
- I carousel hanno pulsanti precedente/successivo centrati, stato disabled e supporto a trascinamento mouse e gesture touch.

## Tipografia e spaziatura

- Famiglia principale: `Inter`, system UI fallback.
- Titoli: peso alto, dimensione coerente con il contesto; niente testo hero dentro card compatte.
- Corpo: altezza di riga leggibile e colore `--text` o `--muted` secondo gerarchia.
- Spaziatura basata su multipli regolari di 4px, con scale locali per card, toolbar e sezioni.

## Icone e logo

- Le icone funzionali devono essere semplici, riconoscibili e coerenti nel tratto.
- Logo generico: `assets/brand/watchverse-dragon-w.svg`.
- Tema Buffy: `assets/brand/watchverse-bat-w.svg`.
- Favicon e icone PWA devono puntare al logo compatto attivo, non a vecchi PNG.

## Verifica prima del rilascio

1. Eseguire `npm run build`.
2. Eseguire i test di contrasto, accessibilità e UI.
3. Controllare desktop e mobile, inclusi hover, focus, errori, loading e stati vuoti.
4. Verificare che nessun colore rosa o valore fuori dai token semantici sia stato introdotto in componenti comuni.
5. Incrementare `BUILD.txt`, fare commit e verificare il deploy GitHub Pages.
