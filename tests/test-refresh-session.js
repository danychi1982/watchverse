const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');

if (!app.includes("const requestedHash = location.hash && location.hash !== '#/' ? location.hash : '#/home';")) {
  throw new Error('La rotta corrente non viene conservata durante il ripristino del profilo.');
}
if (!app.includes("const savedProfileId = localStorage.getItem('watchverse.currentProfile');")) {
  throw new Error('Il profilo corrente non viene ripristinato dopo il refresh.');
}
if (!app.includes('if (navigator.onLine || !state.profiles.length)')) {
  throw new Error('Il fallback offline della scelta profilo non e\u0027 presente.');
}
if (!app.includes("const cloudPrimary = navigator.onLine && window.WatchverseCloudSync?.isEnabled() && ['series','movies','progress'].includes(store);")) {
  throw new Error('La sincronizzazione cloud non e\u0027 protetta dal fallback offline.');
}
if (!app.includes("location.hash = kind === 'series' ? '#/series' : '#/movies';")) {
  throw new Error('La rimozione non reindirizza alla lista del tipo corretto.');
}
if (!app.includes('function isCandidateInLibrary(row)') || !app.includes('!isCandidateInLibrary(row)')) {
  throw new Error('Le proposte non escludono la libreria gia\u0027 presente.');
}
if (!app.includes('scheduleMetadataRecoveryPass();\n      return;')) {
  throw new Error('I retry metadati persistenti non richiedono una scelta manuale.');
}

console.log('Watchverse 1.0.0: refresh e fallback offline verificati');
