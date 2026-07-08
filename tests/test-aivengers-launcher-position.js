const fs=require('fs');
const assert=require('assert');
const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');
assert(css.includes('--sidebar-current: var(--sidebar-expanded);'), 'La variabile della sidebar deve essere disponibile su :root');
assert(css.includes('html.sidebar-is-collapsed { --sidebar-current: var(--sidebar-collapsed); }'), 'Manca lo stato globale della sidebar compressa');
assert(css.includes('left:clamp(39px,calc(var(--sidebar-current) / 2),calc(var(--sidebar-current) - 39px));'), 'Il launcher non ha un margine di sicurezza nella sidebar');
assert(app.includes("document.documentElement.classList.toggle('sidebar-is-collapsed'"), 'Lo stato compresso non viene propagato ai controlli flottanti');
console.log('✓ AIvengers resta interamente visibile nella sidebar espansa e compressa');
