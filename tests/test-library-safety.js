'use strict';
const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
if (!app.includes('Sostituisci i dati attuali del profilo')) throw new Error('Checkbox sostituzione non trovata');
if (!app.includes('id="continueReplacement"')) throw new Error('Dialog applicativo di sostituzione non trovato');
if (!app.includes('Questa operazione cancellerà il catalogo')) throw new Error('Conferma sostituzione non trovata');
if (!app.includes('addDetailRemovalAction')) throw new Error('Rimozione dal dettaglio non trovata');
if (app.includes('class="card-remove')) throw new Error('La rimozione non deve essere esposta nelle card');
console.log('✓ Conferma import e rimozione sicura verificati');
