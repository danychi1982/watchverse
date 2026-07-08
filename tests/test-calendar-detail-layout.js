const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
function assert(v,m){if(!v)throw new Error(m)}
assert(app.includes('groupedUpcomingHtml'), 'Calendario raggruppato per giorno mancante');
assert(app.includes('calendarHeading'), 'Intestazioni Oggi/Domani mancanti');
assert(app.includes('notification-poster'), 'Locandine nelle notifiche mancanti');
assert(app.includes('showItalyScheduleEditor'), 'Gestione programmazione Italia mancante');
assert(css.includes('.calendar-day-heading'), 'CSS calendario giornaliero mancante');
assert(css.includes('.notification-poster'), 'CSS locandine notifiche mancante');
assert(css.includes('.detail-poster { position:relative; isolation:isolate; overflow:hidden;'), 'Locandina dettaglio non confinata nel proprio riquadro');
assert(app.includes('detail-banner media-frame media-frame-backdrop'), 'Banner superiore del dettaglio mancante');
assert(!app.includes("has-image"), 'Vecchio sfondo invasivo ancora presente');
console.log('ok calendar, notifications and detail layout');
