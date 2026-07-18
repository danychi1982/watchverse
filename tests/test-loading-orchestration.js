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
assert(app.includes("route({ loader:false, preserveScroll:true })"), 'Le azioni locali non aggiornano la vista senza bloccare la navigazione.' );
assert(app.includes('await reloadData({ migrate:false });'), 'L apertura del profilo attende ancora la migrazione del catalogo.' );
assert(app.includes('await reloadData({ migrate:true });'), 'La migrazione del catalogo non e stata spostata nel lavoro in background.' );
assert(app.includes("const profileButton = $$('[data-profile-choice]').find"), 'La selezione del profilo dipende da CSS.escape.' );
assert(!app.includes('document.querySelector(`[data-profile-choice="${CSS.escape(id)}"]`)'), 'E rimasto il selettore profilo non portabile.' );
assert(styles.includes('.blocking-loader.is-visible { opacity:1; visibility:visible; pointer-events:auto; }'), 'Il loader di navigazione lascia passare click concorrenti.' );
assert(!styles.includes('.blocking-loader.is-visible { opacity:1; visibility:visible; pointer-events:none; }'), 'Il loader di navigazione non deve lasciare passare click concorrenti.' );

console.log('Orchestrazione loader, cache locale e azioni non bloccanti verificata.');
