const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
assert(app.includes("const APP_VERSION = window.WATCHVERSE_VERSION || '1.0.0'"));
for(const asset of ['assets/themes/last-of-us-proposal-3-wallpaper.jpg','assets/themes/the-last-of-us-official-logo.png','assets/themes/tlou-loader-cordyceps.svg','assets/themes/tlou-firefly.svg','assets/themes/tlou-tattoo.svg']) {
  assert(css.includes(asset),`asset CSS mancante: ${asset}`);
  assert(fs.existsSync(asset),`file asset mancante: ${asset}`);
  assert(sw.includes(asset),`asset cache mancante: ${asset}`);
}
assert(css.includes('.topbar-brand .brand-copy'));
assert(css.includes('display:block!important'));
assert(css.includes('LOOK FOR THE LIGHT'));
assert(html.includes('styles.css?v=1.0.0'));
console.log('✓ Watchverse 1.0.0: logo, brand e loader TLOU verificati');
