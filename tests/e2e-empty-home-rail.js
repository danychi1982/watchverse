const { chromium } = require('playwright-core');
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
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.fill('#setupUsername', 'utente');
  await page.fill('#setupEmail', 'utente@example.com');
  await page.fill('#setupPassword', 'abcdef');
  await page.fill('#setupPassword2', 'abcdef');
  await page.click('#setupForm button[type="submit"]');
  await page.waitForSelector('[data-profile-choice]', { timeout: 10000 });
  await page.locator('[data-profile-choice]').filter({ hasText: 'Daniela' }).click();
  await page.waitForSelector('#emptyPopularSeriesRail', { timeout: 10000 });
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
  const executablePath = chromeExecutablePath();
  if (!executablePath) throw new Error('Chrome o Edge non trovato per il test e2e.');

  const { server, url } = await startStaticServer();

  try {
    const browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
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

    await browser.close();
    console.log('✓ E2E Home vuota: navigazione orizzontale serie popolari');
  } finally {
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
