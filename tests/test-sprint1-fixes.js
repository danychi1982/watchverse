'use strict';

const fs = require('node:fs');
const assert = require('node:assert');

const app = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

assert(app.includes('readPendingLibraryRemovals'), 'Manca il presidio delle rimozioni in corso');
assert(app.includes("showToast('Rimozione in corso'"), 'Manca il feedback immediato della rimozione');
assert(app.includes('.map(s => ({ s, ep: nextEpisode(s), watchedAt: latestWatchedAt(s.id) }))'), 'Continua a guardare usa attività non riconducibile a una visione reale');
assert(!app.includes('latestWatchedAt(s.id) || s.watchedAt || s.updatedAt || s.addedAt'), 'Continua a guardare usa ancora fallback di attività non validi');
assert(app.includes('const remainingWork = totalTitles > 0'), 'Il ciclo metadati non verifica il lavoro residuo');
assert(app.includes('ciclo ancora in corso'), 'Lo stato metadati non comunica un ciclo parziale');
assert(!app.includes('I nomi e i personaggi sono mostrati per esteso.'), 'Istruzione interna ancora visibile nel Cast');
assert(css.includes('WVERSE-194: il cast deve restare consultabile'), 'Fix responsive Cast mancante');
assert(app.includes('const seeds=[...state.series.map'), 'Le raccomandazioni non usano i titoli del profilo come seed');
assert(app.includes("searchQuery: ''"), 'La ricerca non conserva la query tra i rendering');
assert(app.includes("const waitingForRetry = !active && remainingWork && failed > 0"), 'Il pannello metadati non distingue la pausa in attesa di retry');
assert(app.includes('options.pendingToast?.remove?.()'), 'Il toast di rimozione in corso non viene chiuso al termine');
assert(app.includes('class="season-chevron"'), 'Lo stato dello chevron delle stagioni non è rappresentato');
assert(app.includes('metadata-diagnostics'), 'La diagnostica per titolo non mostra i dettagli del retry');
assert(!app.includes('class="poster-badge"'), 'Le card mostrano ancora badge di stato ridondanti');
assert(!css.includes('.poster-badge'), 'Il CSS del badge di stato è ancora mantenuto dopo la rimozione globale');
assert(app.includes('completion-indicator'), 'Le serie completate non hanno un indicatore statico');
assert(app.includes('card-actions-single'), 'Le card completate non prevedono Dettagli a larghezza piena');
assert(css.includes('.two-column > aside { display:grid; gap:18px'), 'La colonna dettaglio non garantisce il distacco tra i box');
assert(css.includes('.season-head[aria-expanded="false"] .season-chevron { transform:none; }'), 'Lo chevron chiuso non punta verso il basso');
assert(css.includes('transform:rotate(180deg)'), 'Lo chevron aperto non punta verso l’alto');
assert(app.includes('nextRetryAt:null'), 'Il retry metadati non azzera la pianificazione precedente');
assert(app.includes('input.setSelectionRange(input.value.length, input.value.length)'), 'La ricerca non ripristina il cursore dopo il rendering');
assert(app.includes("Episodio segnato come visto"), 'Manca il feedback esplicito dopo aver segnato un episodio come visto');
assert(app.includes('keepActiveTabVisible'), 'La tab selezionata non viene mantenuta visibile dopo il rendering');
assert(css.includes('.search-recommendation-head { display:block; }'), 'La testata delle proposte non ha il layout mobile dedicato');
assert(app.includes('metadataCycleDurationMs'), 'La durata del ciclo fonti non viene persistita');
assert(app.includes('metadataConcurrency: 4'), 'Il ciclo fonti non usa il parallelismo ottimizzato');
assert(app.includes('metadataStatusModalHtml'), 'La modale fonti non ha un renderer aggiornabile');
assert(app.includes('setInterval(updateMetadataStatusModal, 1000)'), 'La modale fonti non aggiorna il contenuto mentre resta aperta');
assert(app.includes('metadata-retry-line'), 'La modale fonti non mostra l’evidenza del retry in attesa');
assert(app.includes('nextRetryAt = allRows'), 'Il prossimo retry non viene calcolato per il pannello fonti');

console.log('✓ Fix Sprint 1 e raccomandazioni verificate');
