const { chromium } = require('playwright-core');
const { openBrowser } = require('./e2e-browser');
const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function chromeExecutablePath() {
  return [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean).find(file => fs.existsSync(file));
}

function startStaticServer() {
  const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json; charset=utf-8' };
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
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

function useLocalTestConfig(page, baseUrl) {
  return page.route(`${baseUrl}config.js**`, route => route.fulfill({
    contentType:'text/javascript; charset=utf-8',
    body:`window.WATCHVERSE_CONFIG = Object.freeze({ appName:'Watchverse', accountUsername:'', recoveryEmail:'', supabaseUrl:'', supabaseAnonKey:'', allowCloudSignup:false, tmdbProxyUrl:'', publicSourcesProxyUrl:'', defaultSources:Object.freeze({ streamingLookup:Object.freeze({enabled:false}), tvSchedule:Object.freeze({enabled:false}), cinema:Object.freeze({enabled:false}) }) });`
  }));
}

async function seedAccount(page) {
  await page.evaluate(async () => {
    localStorage.clear(); sessionStorage.clear();
    await new Promise(resolve => { const request = indexedDB.deleteDatabase('watchverse-db'); request.onsuccess = resolve; request.onerror = resolve; request.onblocked = resolve; });
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltB64 = btoa(String.fromCharCode(...salt));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('abcdef'), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 160000, hash: 'SHA-256' }, key, 256);
    const passwordHash = btoa(String.fromCharCode(...new Uint8Array(bits)));
    localStorage.setItem('watchverse.account.v2', JSON.stringify({ username: 'utente', email: 'utente@example.com', passwordHash, salt: saltB64, iterations: 160000 }));
  });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#loginForm');
  await page.fill('#loginUser','utente');
  await page.fill('#loginPassword','abcdef');
  await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector('[data-profile-choice]');
  await page.locator('[data-profile-choice]').filter({ hasText:'Daniela' }).click();
  await page.waitForSelector('#aivengersButton:not(.hidden)');
}

(async () => {
  const { server, url } = await startStaticServer();
  try {
    const browser = await openBrowser(chromium);
    const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
    await useLocalTestConfig(page, url);
    await page.goto(url, { waitUntil:'domcontentloaded' });
    await seedAccount(page);
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open('watchverse-db', 4); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      await new Promise((resolve, reject) => {
        const tx = db.transaction(['series','progress'], 'readwrite');
        const seriesId = 'profile-daniela|series-from';
        tx.objectStore('series').put({ id:seriesId, profileId:'profile-daniela', title:'From', mediaType:'tv', status:'watching', favorite:false, rating:0, providerGroups:{streaming:[],rent:[],buy:[]}, cast:[], seasons:[{ number:1, name:'Stagione 1', episodes:[{ season:1, episode:3, title:'Episodio 3', runtime:50 }] }] });
        tx.objectStore('progress').put({ id:`${seriesId}:s1:e2`, profileId:'profile-daniela', seriesId, season:1, episode:2, watched:true, watchedAt:new Date().toISOString() });
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
      db.close();
    });
    await page.reload({ waitUntil:'domcontentloaded' });
    await page.waitForSelector('#homeContinueRail .episode-media-card');
    const titleLink = page.locator('#homeContinueRail .episode-media-card .card-title a').first();
    const detailLink = page.locator('#homeContinueRail .episode-media-card .card-actions a.secondary').first();
    assert(await titleLink.getAttribute('href') === '#/series/profile-daniela%7Cseries-from', 'Il titolo deve avere un href verso il dettaglio serie.');
    await titleLink.click();
    await page.waitForFunction(() => location.hash.startsWith('#/series/'));
    await page.waitForSelector('.detail-hero');
    assert((await page.locator('.detail-info h2').textContent()).includes('From'), 'Il click sul titolo deve aprire il dettaglio.');
    await page.goto(`${url}#/home`, { waitUntil:'domcontentloaded' });
    await page.waitForSelector('#homeContinueRail .episode-media-card');
    await page.locator('#homeContinueRail .episode-media-card .card-actions a.secondary').first().click();
    await page.waitForSelector('.detail-hero');
    assert((await page.locator('.detail-info h2').textContent()).includes('From'), 'Il click su Dettagli deve aprire il dettaglio.');
    await browser.close();
    console.log('✓ E2E Home: titolo e Dettagli aprono il dettaglio della serie');
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
