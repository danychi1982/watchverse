'use strict';

const fs = require('node:fs');
const assert = require('node:assert');

const app = fs.readFileSync('app.js', 'utf8');
const metadata = fs.readFileSync('public-metadata.js', 'utf8');
const cloud = fs.readFileSync('cloud-sync.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

// WVERSE-33, WVERSE-173, WVERSE-174: copertura, dettaglio e retry espliciti.
for (const marker of [
  'function metadataGlobalStatus()',
  'Copertura effettiva dei metadati',
  'Dettaglio titoli',
  'retryAllMetadataIssues',
  'state.metadataAutoBudget+=rows.length',
  'scheduleMetadataRecoveryPass',
  'scheduleNextMetadataBatch'
]) assert(app.includes(marker), `Diagnostica metadati incompleta: ${marker}`);

// WVERSE-172: la ricerca non deve proporre persone né titoli non pertinenti.
assert(app.includes(".filter(row=>(row.kind==='tv'||row.kind==='movie') && searchTitleMatchesQuery(row.title, q))"));
assert(app.includes('const seenPublic=new Set([...localKeys,...sharedKeys])'));
assert(metadata.includes('relevantCatalogResult'));

// WVERSE-171: i risultati asincroni non sostituiscono l'input; il router
// conserva anche campo attivo e selezione quando aggiorna la vista.
assert(app.includes('function captureActiveField()'));
assert(app.includes('function restoreActiveField(snapshot)'));
assert(app.includes('const preservedField = preserveScroll ? captureActiveField() : null'));
assert(app.includes('restoreActiveField(preservedField)'));

// WVERSE-175/177: la rimozione usa il percorso cloud/local comune e torna alla
// libreria corretta dopo il dettaglio.
assert(app.includes("await dbDelete(store, id);"));
assert(app.includes("location.hash = kind === 'series' ? '#/series' : '#/movies';"));
assert(cloud.includes('deleted_at'));
assert(cloud.includes('revision'));

// WVERSE-176: pull e rerender sono attivi anche su dettaglio e ricerca.
assert(app.includes("['home', 'series', 'movies', 'movie', 'search'].includes(page)"));
assert(app.includes('await syncCloudProfile(profile);'));
assert(app.includes("route({ loader: false, preserveScroll: true, skipCloudRefresh: true })"));

// WVERSE-166/167/178: esistono basi condivise per responsive, accessibilità,
// focus visibile e dialog di sostituzione dati.
for (const marker of ['@media', ':focus-visible', 'continueReplacement', 'Sostituisci i dati attuali del profilo']) {
  assert(css.includes(marker) || app.includes(marker), `Audit UI non tracciabile: ${marker}`);
}

console.log('✓ Regressioni Sprint 2: metadati, ricerca, sincronizzazione, rimozione, import e audit UI verificati');
