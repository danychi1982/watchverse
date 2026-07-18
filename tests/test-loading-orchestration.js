const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(app.includes('function runButtonAction('), 'Manca il wrapper comune per le azioni asincrone.' );
assert(app.includes("a[href^=\"#/\"]"), 'I link interni non hanno feedback immediato di navigazione.' );
assert(app.includes('lastUserInteractionAt'), 'Il refresh cloud non tiene conto dell interazione utente.' );
assert(app.includes('state.cloudRefreshTimer = setTimeout(refresh, 1200);'), 'Il refresh cloud non viene differito durante l interazione.' );
assert(app.includes("route({ loader:false, preserveScroll:true, skipCloudRefresh:true })"), 'Le azioni locali non aggiornano la vista senza bloccare la navigazione.' );
assert(app.includes('await reloadData({ migrate:false });'), 'L apertura del profilo attende ancora la migrazione del catalogo.' );
assert(app.includes('await reloadData({ migrate:true });'), 'La migrazione del catalogo non e stata spostata nel lavoro in background.' );
assert(app.includes('const shouldHydrateCloud = libraryIsEmpty()'), 'Il bootstrap cloud non distingue la cache vuota.' );
assert(app.includes('state.initialCloudHydrationPending = false;'), 'Lo stato di idratazione cloud non viene chiuso.' );
assert(app.includes("const profileButton = $$('[data-profile-choice]').find"), 'La selezione del profilo dipende da CSS.escape.' );
assert(!app.includes('document.querySelector(`[data-profile-choice="${CSS.escape(id)}"]`)'), 'E rimasto il selettore profilo non portabile.' );
assert(styles.includes('.blocking-loader.is-visible { opacity:1; visibility:visible; pointer-events:auto;'), 'Il loader globale deve intercettare i click quando è visibile.' );
assert(styles.includes('body.is-blocking-loading #app'), 'Le aree sottostanti al loader devono essere rese non interattive.' );
assert(app.includes('root.setAttribute(\'inert\', \'\')'), 'Il loader globale deve isolare anche la tastiera dal contenuto sottostante.' );
assert(app.includes('function startRouteProgress('), 'Manca il feedback leggero per la navigazione tra sezioni.' );
assert(app.includes("history.pushState(null, '', link.getAttribute('href'));"), 'I link interni devono aggiornare la rotta senza attendere il completamento di una preparazione in background.' );
assert(app.includes('void route({ loader: true });'), 'I link interni devono avviare subito il rendering della nuova sezione.' );
assert(app.includes('viewCache: { revision: -1, searchRecommendations: null, programmingMarkup: null }'), 'Le viste costose devono avere una cache dedicata.' );
assert(app.includes('Date.now() - state.cloudRefreshAt < 60000'), 'Il refresh cloud automatico deve essere limitato nel tempo.' );
assert(!app.includes("['home', 'series', 'movies', 'search'].includes(page)"), 'La ricerca non deve riattivare sincronizzazioni cloud automatiche ad ogni apertura.' );
assert(app.includes('const shouldShowRouteProgress ='), 'Il routing deve distinguere il progresso di navigazione dal loader modale.' );

console.log('Orchestrazione loader, cache locale e azioni non bloccanti verificata.');
