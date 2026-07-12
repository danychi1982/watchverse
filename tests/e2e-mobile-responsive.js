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
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
  ].filter(Boolean).find(file => fs.existsSync(file));
}

function startStaticServer() {
  const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };
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

function useLocalConfig(page, baseUrl) {
  return page.route(`${baseUrl}config.js**`, route => route.fulfill({
    contentType:'text/javascript; charset=utf-8',
    body:`window.WATCHVERSE_CONFIG=Object.freeze({appName:'Watchverse',accountUsername:'',recoveryEmail:'',supabaseUrl:'',supabaseAnonKey:'',allowCloudSignup:false,tmdbProxyUrl:'',publicSourcesProxyUrl:'',defaultSources:{streamingLookup:{enabled:false},tvSchedule:{enabled:false},cinema:{enabled:false}}});`
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
    localStorage.setItem('watchverse.account.v2', JSON.stringify({ username: 'mobile', email: 'mobile@example.com', passwordHash, salt: saltB64, iterations: 160000 }));
  });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#loginForm');
  await page.fill('#loginUser','mobile');
  await page.fill('#loginPassword','abcdef');
  await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector('[data-profile-choice]');
  await page.locator('[data-profile-choice]').filter({ hasText:'Daniela' }).click();
  await page.waitForSelector('#main');
}

async function seedLibrary(page) {
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => { const request = indexedDB.open('watchverse-db', 4); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['series','movies'], 'readwrite');
      tx.objectStore('series').put({ id:'profile-daniela|series-mobile', profileId:'profile-daniela', mediaType:'tv', title:'Serie mobile di prova', year:'2024', status:'watching', favorite:false, seasons:[{number:1,name:'Stagione 1',episodes:[{season:1,episode:1,title:'Episodio di prova',runtime:45}]}] });
      tx.objectStore('movies').put({ id:'profile-daniela|movie-mobile', profileId:'profile-daniela', mediaType:'movie', title:'Film mobile di prova', year:'2024', watched:false, favorite:false, state:'watchlist', providerGroups:{streaming:[],rent:[],buy:[]}, cast:[] });
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    });
    db.close();
  });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('[data-profile-choice]');
  await page.click('[data-profile-choice]');
  await page.waitForSelector('#main');
}

async function assertMobileLayout(page, label) {
  const result = await page.evaluate(() => {
    const rect = node => { const r=node.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
    const selectors = ['.topbar', '.topbar-brand', '.top-actions', '#main'];
    const boxes = Object.fromEntries(selectors.map(selector => [selector, rect(document.querySelector(selector))]));
    const topbar = boxes['.topbar']; const brand = boxes['.topbar-brand']; const actions = boxes['.top-actions'];
    return { width:innerWidth, scrollWidth:document.documentElement.scrollWidth, boxes, collision:!!(brand && actions && brand.right > actions.left - 2), bottomNav:!!document.querySelector('.bottom-nav') };
  });
  assert(result.scrollWidth <= result.width + 1, `${label}: overflow orizzontale (${result.scrollWidth}px > ${result.width}px)`);
  assert(!result.collision, `${label}: logo e azioni header si sovrappongono`);
  assert(result.bottomNav, `${label}: navigazione mobile assente`);
}

(async () => {
  const { server, url } = await startStaticServer();
  try {
    const browser = await openBrowser(chromium);
    for (const viewport of [{ width:412, height:915 }, { width:360, height:800 }]) {
      const page = await browser.newPage({ viewport });
      await useLocalConfig(page, url);
      await page.goto(url, { waitUntil:'domcontentloaded' });
      await seedAccount(page);
      await assertMobileLayout(page, `${viewport.width}px Home`);
      for (const route of ['#/series', '#/movies', '#/search', '#/programming', '#/settings']) {
        await page.goto(`${url}${route}`, { waitUntil:'domcontentloaded' });
        await page.waitForTimeout(120);
        await assertMobileLayout(page, `${viewport.width}px ${route}`);
      }
      await seedLibrary(page);
      for (const route of ['#/series/profile-daniela%7Cseries-mobile', '#/movie/profile-daniela%7Cmovie-mobile']) {
        await page.goto(`${url}${route}`, { waitUntil:'domcontentloaded' });
        await page.waitForTimeout(120);
        await assertMobileLayout(page, `${viewport.width}px ${route}`);
      }
      await page.close();
    }
    await browser.close();
    console.log('✓ E2E responsive mobile: 412px e 360px senza overflow o collisioni header');
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
