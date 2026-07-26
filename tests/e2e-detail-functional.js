const { chromium } = require('playwright');
const { openBrowser } = require('./e2e-browser');
const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

async function waitForAppIdle(page) {
  await page.waitForFunction(() => {
    const loader = document.querySelector('#blockingLoader');
    return !loader || loader.getAttribute('aria-hidden') === 'true' || !loader.classList.contains('is-visible');
  }, null, { timeout: 30000 });
}

function startStaticServer() {
  const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg' };
  const localConfig = `window.WATCHVERSE_CONFIG = Object.freeze({ appName:'Watchverse', accountUsername:'', recoveryEmail:'', supabaseUrl:'', supabaseAnonKey:'', allowCloudSignup:false, tmdbProxyUrl:'', publicSourcesProxyUrl:'', defaultSources:Object.freeze({ streamingLookup:Object.freeze({enabled:false}), tvSchedule:Object.freeze({enabled:false}), cinema:Object.freeze({enabled:false}) }) });`;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    if (requested === '/config.js') {
      response.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' });
      response.end(localConfig);
      return;
    }
    const filePath = path.resolve(ROOT, `.${requested}`);
    if (!filePath.startsWith(ROOT)) { response.writeHead(403); response.end('Forbidden'); return; }
    fs.readFile(filePath, (error, body) => {
      if (error) { response.writeHead(404); response.end('Not found'); return; }
      response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
      response.end(body);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, url:`http://127.0.0.1:${server.address().port}/` })));
}

async function loginAndSelectDaniela(page, { allowAlreadyAuthenticated = true } = {}) {
  if (allowAlreadyAuthenticated && await page.locator('#aivengersButton:not(.hidden)').count()) return;
  if (await page.locator('#loginForm').count()) {
    await page.fill('#loginUser','utente');
    await page.fill('#loginPassword','abcdef');
    if (await page.locator('#rememberLogin').count() && !await page.locator('#rememberLogin').isChecked()) await page.check('#rememberLogin');
    await page.click('#loginForm button[type="submit"]');
  }
  await page.waitForSelector('[data-profile-choice]');
  await page.locator('[data-profile-choice]').filter({ hasText:'Daniela' }).click();
  await page.waitForSelector('#aivengersButton:not(.hidden)');
}

async function seedAccount(page) {
  await page.evaluate(async () => {
    localStorage.clear(); sessionStorage.clear();
    await new Promise(resolve => { const request = indexedDB.deleteDatabase('watchverse-db'); request.onsuccess = resolve; request.onerror = resolve; request.onblocked = resolve; });
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltB64 = btoa(String.fromCharCode(...salt));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('abcdef'), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:160000, hash:'SHA-256' }, key, 256);
    localStorage.setItem('watchverse.account.v2', JSON.stringify({ username:'utente', email:'utente@example.com', passwordHash:btoa(String.fromCharCode(...new Uint8Array(bits))), salt:saltB64, iterations:160000 }));
  });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#loginForm');
  await loginAndSelectDaniela(page, { allowAlreadyAuthenticated:false });
}

async function putFixtures(page) {
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => { const request = indexedDB.open('watchverse-db', 4); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
    const tomorrow = new Date(Date.now()+86400000).toISOString();
    const yesterday = new Date(Date.now()-86400000).toISOString();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['movies','series'], 'readwrite');
      tx.objectStore('movies').put({ id:'profile-daniela|movie-functional', profileId:'profile-daniela', mediaType:'movie', title:'Film funzionale', year:2026, watched:false, state:'watchlist', favorite:false, rating:0, providerGroups:{streaming:[{name:'Netflix',url:'https://example.com/netflix'}],rent:[],buy:[]}, trailer:{site:'YouTube',key:'functional-trailer',name:'Trailer ufficiale',official:true}, trailerLookupStatus:'available', cinemaShowtimes:[{startsAt:yesterday,time:'20:00',title:'Film funzionale',cinemaName:'Cinema vecchio'},{startsAt:tomorrow,time:'21:00',title:'Film diverso',cinemaName:'Cinema errato'},{startsAt:tomorrow,time:'21:30',title:'Film funzionale',cinemaName:'Cinema valido'}], cinemaStatus:'available', cinemaCheckedAt:new Date().toISOString(), cast:[], overview:'Descrizione funzionale.' });
      tx.objectStore('series').put({ id:'profile-daniela|series-functional', profileId:'profile-daniela', mediaType:'tv', title:'Serie funzionale', year:2025, status:'watching', favorite:false, rating:0, providerGroups:{streaming:[{name:'Prime Video',url:'https://example.com/prime'}],rent:[],buy:[]}, trailer:{site:'YouTube',key:'series-trailer',name:'Trailer serie',official:true}, trailerLookupStatus:'available', cast:[], seasons:[{number:1,name:'Stagione 1',episodes:[{season:1,episode:1,title:'Pilota',runtime:45}]}] });
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    });
    db.close();
  });
  await page.evaluate(() => { localStorage.setItem('watchverse.currentProfile','profile-daniela'); });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => Boolean(document.querySelector('#loginForm, [data-profile-choice], #aivengersButton:not(.hidden)')));
  await loginAndSelectDaniela(page);
}

(async () => {
  const {server,url}=await startStaticServer();
  try {
    const browser=await openBrowser(chromium);
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await seedAccount(page);
    await putFixtures(page);

    await page.goto(`${url}#/movie/profile-daniela%7Cmovie-functional`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.detail-hero');
    await waitForAppIdle(page);
    assert(await page.locator('#refreshMovieMetadata').count()===1,'Il dettaglio film deve avere un solo pulsante Aggiorna.');
    assert(await page.locator('#enrichMovieTmdb, #enrichMoviePublic').count()===0,'I pulsanti tecnici separati non devono essere visibili.');
    assert(await page.locator('.availability-trailer-card').count()===1,'Trailer e streaming devono stare nello stesso box.');
    assert(await page.locator('.trailer-card').count()===0,'Il box trailer separato non deve essere renderizzato.');
    const cinemaText=await page.locator('.cinema-programming').textContent();
    assert(cinemaText.includes('21:30')&&!cinemaText.includes('20:00')&&!cinemaText.includes('21:00'),'Devono essere mostrati solo gli spettacoli validi per data e titolo.');
    await page.locator('#refreshMovieMetadata').click();
    await page.waitForFunction(() => [...document.querySelectorAll('[role="status"], .toast, .toast-title')].some(node => node.textContent.includes('Aggiornamento')));

    await page.goto(`${url}#/series/profile-daniela%7Cseries-functional`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.detail-hero');
    await waitForAppIdle(page);
    if (await page.locator('[data-detail-tab="info"]').count()) await page.locator('[data-detail-tab="info"]').click();
    assert(await page.locator('#refreshSeriesMetadata').count()===1,'Il dettaglio serie deve avere un solo pulsante Aggiorna.');
    assert(await page.locator('.availability-trailer-card').count()===1,'Anche la serie deve usare il box unificato.');
    await browser.close();
    console.log('✓ E2E dettaglio: cinema validato, aggiornamento unificato e box streaming/trailer verificati');
  } finally { server.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
