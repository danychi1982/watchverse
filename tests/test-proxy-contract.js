const fs = require('node:fs');
const tmdb = fs.readFileSync('supabase/functions/tmdb-proxy/index.ts', 'utf8');
const publicSources = fs.readFileSync('supabase/functions/public-sources-proxy/index.ts', 'utf8');

for (const token of ['credits', 'videos']) {
  if (!tmdb.includes(token)) throw new Error(`Proxy TMDB senza endpoint ${token}`);
}
if (!tmdb.includes('watch') || !tmdb.includes('providers')) throw new Error('Proxy TMDB senza endpoint watch providers');
for (const path of ['/api/cinema', '/api/trailer']) {
  if (!publicSources.includes(path)) throw new Error(`Proxy fonti pubbliche senza endpoint ${path}`);
}
if (!publicSources.includes('youtube.com/results')) throw new Error('Fallback trailer pubblico non configurato');
console.log('Contratto proxy TMDB/JustWatch/trailer/cinema verificato');
