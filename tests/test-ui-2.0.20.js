const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');

assert(app.includes("Dove guardarlo in streaming/TV"), 'Titolo streaming/TV film mancante');
assert(app.includes("Dove guardarla in streaming/TV"), 'Titolo streaming/TV serie mancante');
assert(!app.includes('Il cinema ha priorità;'), 'Nota di sviluppo cinema ancora visibile');
assert(!app.includes('Watchverse non apre ricerche generiche'), 'Nota di sviluppo trailer ancora visibile');
assert(!app.includes('Fuso orario Europe/Rome'), 'Fuso orario ancora mostrato nel dettaglio');
assert(app.includes('function cinemaProgrammingHtml'), 'Programmazione cinema mancante');
assert(app.includes('Solo orari trovati sui siti ufficiali delle sale preferite.'), 'Descrizione fonti cinema ufficiali mancante');
assert(!app.includes('Nessun orario disponibile'), 'Le tabelle cinema vuote non devono essere mostrate');
assert(app.includes("tzlY8XD1CGg"), 'Trailer ufficiale diretto di Supergirl mancante');
assert(app.includes('class="detail-backdrop-image"'), 'Contenimento inline del backdrop mancante');
assert(css.includes('.detail-banner > img') && css.includes('max-height:230px!important'), 'Contenimento globale banner mancante');
assert(css.includes('.cinema-days-grid.cinema-days-actual') && css.includes('.cinema-time-card'), 'Stili cinema con soli orari effettivi mancanti');
assert(app.includes('Assessment AI · WCAG 2.2'), 'Assessment AI WCAG 2.2 mancante');
assert(app.includes('data-accessibility-tab="declaration"') && app.includes('data-accessibility-tab="assessment"'), 'Tab accessibilità mancanti');
assert(!html.includes('href="#/accessibility-report">Report WCAG 2.2'), 'Link report separato ancora nel footer');

assert(app.includes("name:'The Last of Us'") && app.includes("name:'Buffy the Vampire Slayer'"), 'Temi show-inspired mancanti');
assert(css.includes('html[data-theme="last-of-us"]') && css.includes('html[data-theme="buffy"]'), 'Palette temi show-inspired mancanti');
assert(app.includes('data-recommendation-filter="movie"') && app.includes('data-recommendation-filter="series"'), 'Filtri Film/Serie nelle proposte Cerca mancanti');
assert(app.includes('tvChannelChoiceCardsHtml') && css.includes('.tv-channel-logo'), 'Loghi canali TV mancanti');
assert(!app.includes('Mostra prima questo servizio'), 'Testo ridondante nelle card streaming ancora presente');
assert(app.includes('data-tooltip="${esc(n.label)}"') && css.includes('.sidebar-collapsed .nav-item::after'), 'Tooltip menu compresso mancanti');
console.log('✓ Dettaglio, cinema, streaming/TV, accessibilità e personalizzazioni 2.0.21 verificati');
