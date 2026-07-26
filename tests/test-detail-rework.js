const fs = require('node:fs');
const app = fs.readFileSync('app.js','utf8');
const css = fs.readFileSync('styles.css','utf8');
const assert = require('node:assert');

assert(app.includes('function availabilityAndTrailerHtml'), 'Box unificato streaming/trailer mancante');
assert(app.includes('function refreshDetailMetadata'), 'Aggiornamento unificato della scheda mancante');
assert(app.includes('const horizon = daysFromNow(7)'), 'Validazione intervallo cinema mancante');
assert(app.includes("if(!rawRows.length)return '';"), 'La programmazione cinema vuota deve essere nascosta');
assert(css.includes('.availability-trailer-grid'), 'Layout compatto streaming/trailer mancante');
console.log('✓ Dettaglio: cinema validato, aggiornamento unificato e box streaming/trailer verificati');
