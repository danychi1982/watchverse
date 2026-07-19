const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(app.includes('function similarSectionHtml(item, kind, suggestions = similarSuggestions(item,kind,12))'), 'La sezione correlati non accetta i suggerimenti calcolati dal rendering differito');
assert(app.includes('bindRecommendationActions(suggestions);'), 'Il CTA delle card correlate non viene associato dopo il caricamento asincrono');
assert(app.includes('function bindRecommendationActions(rows = state.recommendationResults)'), 'Il binding delle raccomandazioni non supporta il set di card della sezione corrente');
assert(app.includes("location.hash = row.kind === 'series' ? `#/series/${encodeURIComponent(item.id)}` : `#/movie/${encodeURIComponent(item.id)}`;"), 'L aggiunta da una card correlata non apre il dettaglio del titolo aggiunto');
assert(app.includes('const relevant = ranked.filter(row => row.score > 0);'), 'Il ranking delle raccomandazioni non separa i candidati pertinenti dal fallback');
assert(app.includes('return (relevant.length >= Math.min(4, limit) ? relevant : ranked).slice(0, limit);'), 'Il fallback dei suggerimenti non amplia il risultato quando i candidati pertinenti sono pochi');

console.log('✓ Raccomandazioni: CTA correlati, redirect e fallback verificati');
