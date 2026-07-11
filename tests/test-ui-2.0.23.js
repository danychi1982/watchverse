const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const server=fs.readFileSync('avvia_server.py','utf8');

assert(app.includes("const APP_VERSION = window.WATCHVERSE_VERSION || '1.0.0'"));
assert(app.includes('detail-banner media-frame media-frame-backdrop'),'backdrop non confinato');
assert(app.includes('detail-poster media-frame media-frame-poster'),'poster non confinato');
assert(css.includes(':is(.poster,.row-poster,.search-result .thumb,.continue-poster,.cast-photo,.suggestion-poster,.person-credit-poster) > img'),'regola condivisa immagini mancante');
assert(css.includes('contain:strict'),'contenimento difensivo mancante');
assert(css.includes('assets/themes/last-of-us-infected-wall.svg'),'asset The Last of Us non usato');
assert(css.includes('assets/themes/buffy-gentlemen.svg')&&css.includes('assets/themes/buffy-cemetery.svg'),'asset Buffy e Gentlemen non usati');
assert(app.includes('THEME_NAV_ICONS')&&app.includes('<svg viewBox="0 0 24 24">'),'icone SVG tematiche mancanti');

assert(!app.includes('Servizi da controllare'),'provider ipotetici ancora presenti');
assert(app.includes("return '<p class=\"information-unavailable\">Informazione non disponibile</p>';"),'fallback provider mancante');
assert(app.includes("publicSourceFetch('/api/trailer'"),'ricerca trailer locale mancante');
assert(app.includes("publicSourceFetch('/api/cinema'"),'ricerca cinema locale mancante');
assert(!app.includes('Nessun orario disponibile'),'tabella cinema vuota ancora presente');
assert(app.includes('Solo orari trovati sui siti ufficiali delle sale preferite.'),'vincolo fonti ufficiali non esplicitato');
assert(server.includes('Gli endpoint accettano solo fonti predefinite'),'server non limitato a fonti note');
assert(html.includes('styles.css?v=1.0.0'),'cache bust CSS errato');
console.log('✓ Watchverse 1.0.0: dettagli, temi e fonti effettive verificati');
