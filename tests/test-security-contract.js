const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

for (const token of ['Content-Security-Policy', 'Permissions-Policy', 'strict-origin-when-cross-origin']) {
  if (!html.includes(token)) throw new Error(`Hardening mancante: ${token}`);
}
if (!app.includes('target="_blank" rel="noopener noreferrer"')) throw new Error('Link esterni senza protezione noopener');
if (html.includes('<script type="text/javascript">')) throw new Error('Script inline non consentito nell’entrypoint');
console.log('Contratto di hardening applicativo verificato');
