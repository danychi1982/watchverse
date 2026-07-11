const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const config=fs.readFileSync('config.js','utf8');
const metadata=fs.readFileSync('public-metadata.js','utf8');
function assert(v,m){if(!v)throw new Error(m);}
assert(app.includes("const APP_VERSION = window.WATCHVERSE_VERSION || '1.0.0'"),'versione 1.0.0');
assert(config.includes("provider: 'JustWatch tramite TMDB'"),'provider JustWatch/TMDB');
assert(config.includes("publicSourcesProxyUrl: 'https://aqphrgmnngxogqijdvpk.supabase.co/functions/v1/public-sources-proxy'"),'proxy fonti pubbliche Supabase configurato');
assert(config.includes("tmdbProxyUrl: 'https://aqphrgmnngxogqijdvpk.supabase.co/functions/v1/tmdb-proxy'"),'proxy TMDB Supabase configurato');
assert(config.includes("provider: 'TVmaze'"),'TVmaze preconfigurato');
assert(app.includes('syncDefaultPublicSources'),'sync fonti default');
assert(app.includes("mode: 'actual-only'"),'stato streaming solo dati effettivi');
assert(app.includes("updatedLabel:'Titoli controllati'"),'conteggio streaming trasparente');
assert(app.includes("updatedLabel:'Film controllati'"),'conteggio cinema trasparente');
assert(!app.includes('Titoli con ricerca pronta'),'la ricerca generica non deve valere come disponibilità');
assert(metadata.includes('guideUrl: show.officialSite'),'guide TV ufficiali');
console.log('✓ Fonti pubbliche: solo disponibilità effettive e stati trasparenti');
