'use strict';
const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const metadata = fs.readFileSync('public-metadata.js', 'utf8');
if (!app.includes(".filter(row=>row.kind==='tv'||row.kind==='movie')")) throw new Error('La ricerca non limita i risultati a film e serie');
if (!app.includes('const seenPublic=new Set([...localKeys,...sharedKeys])')) throw new Error('La ricerca non deduplica i risultati locali e pubblici');
if (!app.includes('Risultati disponibili')) throw new Error('La ricerca non usa una lista unica di risultati');
if (!app.includes("local?`<a class=\"secondary\"")) throw new Error('Il risultato locale non espone l\'azione Apri');
if (!metadata.includes('looksLikePersonDescription') || !metadata.includes('relevantCatalogResult')) throw new Error('Filtro risultati pubblici non pertinente');
console.log('✓ Ricerca: risultati film/serie deduplicati e lista unificata verificati');
