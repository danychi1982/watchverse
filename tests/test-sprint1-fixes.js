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

console.log('✓ Fix Sprint 1 e raccomandazioni verificate');
