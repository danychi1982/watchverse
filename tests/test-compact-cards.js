const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
function assert(v,m){if(!v)throw new Error(m)}
assert(app.includes('episode-media-card'),'Schede episodio in formato card compatto mancanti');
assert(app.includes('home-media-rail') && app.includes('bindHorizontalRails'),'Navigazione orizzontale Home mancante');
assert(app.includes('class=\"search-result-copy\"'),'Layout ricerca compatto mancante');
assert(css.includes('.episode-media-card') && css.includes('.home-media-rail'),'CSS delle card e dei rail Home mancante');
assert(app.includes('scrollBackToTop') && css.includes('.back-to-top'),'Azione floating Torna su mancante');
assert(css.includes('.search-result .thumb') && css.includes('position: relative'),'Correzione mini-locandine mancante');
console.log('ok compact cards');
