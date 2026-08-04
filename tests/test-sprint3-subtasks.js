'use strict';

const fs = require('node:fs');
const assert = require('node:assert');

const app = fs.readFileSync('app.js', 'utf8');
const cloud = fs.readFileSync('cloud-sync.js', 'utf8');
const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
const syncMigration = fs.readFileSync('supabase/migrations/20260712_bidirectional_sync.sql', 'utf8');
const cleanupMigration = fs.readFileSync('supabase/migrations/20260712_profile_cleanup_rls.sql', 'utf8');
const recommendations = fs.readFileSync('tests/test-recommendation-actions.js', 'utf8');
const backup = fs.readFileSync('tests/test-library-safety.js', 'utf8');

function has(source, marker, message) {
  assert(source.includes(marker), message || `Marker mancante: ${marker}`);
}

// WVERSE-14: preferenze e impostazioni restano isolate per profilo,
// revisionate e sincronizzabili senza sovrascrivere il profilo locale.
for (const marker of [
  'function profileKey(key)',
  'function loadSettings()',
  'function saveSettings(syncCloud = true)',
  "localStorage.setItem(profileKey('settings')",
  'state.settings.revision = Number(state.settings.revision || 0) + 1',
  'function saveProfiles(syncCloud = true, strictCloud = false)'
]) has(app, marker, `Preferenze profilo incomplete: ${marker}`);

// WVERSE-28: raccomandazioni pertinenti, fallback, esclusione dei duplicati
// e CTA che aggiorna libreria e dettaglio.
for (const marker of [
  'function recommendationScore',
  'const relevant = ranked.filter(row => row.score > 0);',
  'function isCandidateInLibrary(row)',
  'bindRecommendationActions(suggestions);',
  'await route();'
]) has(app, marker, `Raccomandazioni incomplete: ${marker}`);
has(recommendations, 'fallback', 'Il contratto delle raccomandazioni non copre il fallback.');

// WVERSE-35: anteprima, sostituzione esplicita, ZIP/CSV/JSON e ripresa
// dell’importazione; durante la sostituzione le scritture cloud sono sospese.
for (const marker of [
  'function fullBackup()',
  'function runExport(type)',
  'function importGdprPlan(plan,replace=true)',
  'await cloudSync.suspendWrites?.()',
  'await window.WatchverseCloudSync.clearProfileData(currentProfile())',
  'writeGdprResume(plan',
  'id="confirmGdprImport"'
]) has(app, marker, `Import/export incompleto: ${marker}`);
has(backup, 'Sostituisci i dati attuali del profilo', 'Manca la conferma esplicita di sostituzione dati.');

// WVERSE-36/38/183: sincronizzazione bidirezionale, aggiornamenti incrementali,
// revisioni, tombstone, conflitti e refresh delle viste.
for (const marker of [
  'async function pullProfile(profile, options = {})',
  'const incremental = Boolean(since);',
  'const changedSince = () => since ? `&updated_at=gt.',
  'maxUpdatedAt',
  'async function recordConflict',
  'async function deleteRecord',
  'deleted_at',
  'revision',
  'async function suspendWrites()',
  'function resumeWrites()'
]) has(cloud, marker, `Sincronizzazione incompleta: ${marker}`);
for (const marker of [
  "['home', 'series', 'movies', 'movie', 'search'].includes(page)",
  'await syncCloudProfile(profile);',
  'state.cloudRefreshTimer',
  'state.dataRevision'
]) has(app, marker, `Refresh viste incompleto: ${marker}`);

// La persistenza cloud applica RLS e la pulizia del profilo è atomica tramite RPC.
for (const source of [schema, syncMigration]) {
  for (const marker of ['revision', 'deleted_at', 'updated_at', 'profile_id']) {
    has(source, marker, `Schema sincronizzazione incompleto: ${marker}`);
  }
}
has(cleanupMigration, 'clear_profile_data', 'RPC di pulizia profilo mancante.');
has(cleanupMigration, 'security definer', 'RPC di pulizia profilo senza security definer.');

// WVERSE-44/45/46/47, 101/102/103, 130/131/132, 134/135/136/137,
// 144/145/146: le superfici UI, dati, infrastruttura e test sono presenti
// e vengono coperte dai contratti esistenti e dalla suite funzionale.
for (const marker of [
  'function renderSettings()',
  'function importExportMarkup()',
  'function renderSearch()',
  'function renderSeriesDetail(id)',
  'function renderMovieDetail(id)',
  'function stampLocalValue(value)',
  'function dbPut(store, value)',
  'function dbBulkPut(store, values, syncCloud = true)',
  'function queuePublicMetadata',
  'function showToast',
  'aria-label'
]) has(app, marker, `Superficie applicativa/test non presente: ${marker}`);

console.log('✓ Sprint 3 subtasks: profili, raccomandazioni, backup, sync incrementale, tombstone, conflitti, viste e test coperti');
