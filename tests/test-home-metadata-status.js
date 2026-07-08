const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
function assert(v,m){if(!v)throw new Error(m)}
assert(app.includes('.slice(0, 12)') && app.includes('latestWatchedAt(s.id)'), 'Continua a guardare non usa le ultime serie viste nel rail compatto');
assert(app.includes('I film non entrano in “Continua a guardare”'), 'Separazione film/serie non esplicitata');
assert(html.includes('metadataStatusButton'), 'Indicatore metadati header mancante');
assert(app.includes('function metadataGlobalStatus()') && app.includes('showMetadataStatus'), 'Riepilogo metadati mancante');
assert(css.includes('.metadata-status-button') && css.includes('.home-summary-grid'), 'CSS 2.0.7 mancante');
console.log('ok home metadata status');
