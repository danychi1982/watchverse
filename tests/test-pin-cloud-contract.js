const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const sync = fs.readFileSync('cloud-sync.js', 'utf8');

if (!app.includes('saveProfiles(true,true)')) throw new Error('Il salvataggio del PIN non richiede la conferma cloud.');
if (!app.includes('PIN non sincronizzato')) throw new Error('Manca il messaggio esplicito per un PIN non sincronizzato.');
if (!app.includes('PIN eliminato e sincronizzato')) throw new Error('La rimozione del PIN non attende la conferma cloud.');
if (!sync.includes("Prefer: 'return=representation'")) throw new Error('Il salvataggio profili non verifica la risposta di Supabase.');
if (!sync.includes('updated.length === 0')) throw new Error('Manca il controllo di aggiornamento a zero righe.');

console.log('Contratto PIN cloud verificato');
