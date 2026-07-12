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
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = path.resolve(ROOT, `.${requested}`);
    if (!filePath.startsWith(ROOT)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
      response.end(body);
    });
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}/` });
    });
  });
}

async function ensureEmptyAccount(page) {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('watchverse-db');
      request.onsuccess = resolve;
      request.onerror = resolve;
      request.onblocked = resolve;
    });
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltB64 = btoa(String.fromCharCode(...salt));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('abcdef'), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 160000, hash: 'SHA-256' }, key, 256);
    const passwordHash = btoa(String.fromCharCode(...new Uint8Array(bits)));
    localStorage.setItem('watchverse.account.v2', JSON.stringify({ username: 'utente', email: 'utente@example.com', passwordHash, salt: saltB64, iterations: 160000 }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#loginForm', { timeout: 10000 });
  assert(await page.inputValue('#loginUser') === '', 'Il nome utente non deve essere precompilato.');
  assert(await page.getAttribute('#loginPassword', 'type') === 'password', 'La password deve partire oscurata.');
  await page.click('#toggleLoginPassword');
  assert(await page.getAttribute('#loginPassword', 'type') === 'text', 'Il pulsante deve mostrare la password.');
  await page.click('#toggleLoginPassword');
  assert(await page.getAttribute('#loginPassword', 'type') === 'password', 'Il pulsante deve poter nascondere la password.');
  await page.fill('#loginUser', 'utente');
  await page.fill('#loginPassword', 'abcdef');
  await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector('[data-profile-choice]', { timeout: 10000 });
  await page.locator('[data-profile-choice]').filter({ hasText: 'Daniela' }).click();
  await page.waitForSelector('#emptyPopularSeriesRail', { timeout: 10000 });
}

function useLocalTestConfig(page, baseUrl) {
  return page.route(`${baseUrl}config.js**`, route => route.fulfill({
    contentType: 'text/javascript; charset=utf-8',
    body: `window.WATCHVERSE_CONFIG = Object.freeze({
      appName: 'Watchverse', accountUsername: '', recoveryEmail: '',
      supabaseUrl: '', supabaseAnonKey: '', allowCloudSignup: false,
      tmdbProxyUrl: '', publicSourcesProxyUrl: '',
      defaultSources: Object.freeze({
        streamingLookup: Object.freeze({ enabled: false }),
        tvSchedule: Object.freeze({ enabled: false }),
        cinema: Object.freeze({ enabled: false })
      })
    });`
  }));
}

async function expectScrollable(locator) {
  const metrics = await locator.evaluate(node => ({
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
    children: node.children.length
  }));
  assert(metrics.children >= 10, 'Il rail non contiene abbastanza proposte.');
  assert(metrics.scrollWidth > metrics.clientWidth, 'Il rail non e scrollabile.');
}

(async () => {
  const { server, url } = await startStaticServer();

  try {
    const browser = await openBrowser(chromium);
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await useLocalTestConfig(page, url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await ensureEmptyAccount(page);

    const rail = page.locator('#emptyPopularSeriesRail');
    const next = page.locator('[data-rail-next="emptyPopularSeriesRail"]');
    const prev = page.locator('[data-rail-prev="emptyPopularSeriesRail"]');

    await expectScrollable(rail);
    const before = await rail.evaluate(node => node.scrollLeft);
    await next.click();
    await page.waitForFunction(
      previous => document.querySelector('#emptyPopularSeriesRail').scrollLeft > previous + 20,
      before
    );
    const afterNext = await rail.evaluate(node => node.scrollLeft);
    assert(afterNext > before, 'Il pulsante avanti non ha spostato il rail.');

    await prev.click();
    await page.waitForFunction(
      previous => document.querySelector('#emptyPopularSeriesRail').scrollLeft < previous - 20,
      afterNext
    );
    const afterPrev = await rail.evaluate(node => node.scrollLeft);
    assert(afterPrev < afterNext, 'Il pulsante indietro non ha spostato il rail.');

    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('watchverse-db', 4);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction(['movies', 'series'], 'readwrite');
        tx.objectStore('movies').put({ id:'profile-daniela|movie-supergirl', profileId:'profile-daniela', title:'Supergirl', mediaType:'movie', watched:false, state:'watchlist', favorite:false, rating:0, providerGroups:{streaming:[],rent:[],buy:[]}, cast:[] });
        tx.objectStore('series').put({ id:'profile-daniela|series-from', profileId:'profile-daniela', title:'From', mediaType:'tv', status:'watching', favorite:false, rating:0, providerGroups:{streaming:[],rent:[],buy:[]}, cast:[], seasons:[{ number:1, name:'Stagione 1', episodes:[{ season:1, episode:3, title:'Episodio 3', runtime:50 }] }] });
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
      db.close();
    });
    await page.evaluate(() => { localStorage.setItem('watchverse.session.v2', JSON.stringify({ mode: 'local', createdAt: Date.now() })); sessionStorage.removeItem('watchverse.session.temporary.v2'); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(document.querySelector('[data-profile-choice], #authMessage')) , null, { timeout: 10000 });
    if (!(await page.locator('[data-profile-choice]').count())) {
      throw new Error(`Gate profili non visualizzato dopo il login: ${await page.locator('#authMessage').textContent()}`);
    }
    await page.locator('[data-profile-choice]').filter({ hasText: 'Daniela' }).click();
    await page.waitForSelector('#aivengersButton:not(.hidden)', { timeout: 10000 });
    await page.click('#aivengersButton');
    await page.fill('#aivengersInput', 'segna come visto supergirl');
    await page.press('#aivengersInput', 'Enter');
    await page.waitForFunction(() => document.querySelector('#aivengersMessages')?.textContent.includes('Supergirl'));
    await page.fill('#aivengersInput', 'segna come visto episodio 3 della prima stagione di from');
    await page.press('#aivengersInput', 'Enter');
    await page.waitForFunction(() => document.querySelector('#aivengersMessages')?.textContent.includes('stagione 1, episodio 3'));
    const watched = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open('watchverse-db', 4); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      const values = store => new Promise((resolve, reject) => { const request = db.transaction(store).objectStore(store).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      const movies = await values('movies'); const progress = await values('progress'); db.close();
      return { movie: movies.find(item => item.title === 'Supergirl'), episode: progress.find(item => item.seriesId?.includes('series-from') && item.season === 1 && item.episode === 3) };
    });
    assert(watched.movie?.watched === true, 'AIvenger non ha segnato il film come visto.');
    assert(watched.episode?.watched === true, 'AIvenger non ha segnato l\'episodio come visto.');

    await browser.close();
    console.log('✓ E2E Home vuota: navigazione orizzontale serie popolari');
  } finally {
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
