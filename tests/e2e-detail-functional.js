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
  const localConfig = `window.WATCHVERSE_CONFIG = Object.freeze({ appName:'Watchverse', accountUsername:'', recoveryEmail:'', supabaseUrl:'', supabaseAnonKey:'', allowCloudSignup:false, tmdbProxyUrl:'/tmdb-proxy', publicSourcesProxyUrl:'', defaultSources:Object.freeze({ streamingLookup:Object.freeze({enabled:false}), tvSchedule:Object.freeze({enabled:false}), cinema:Object.freeze({enabled:false}) }) });`;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    if (requested === '/config.js') {
      response.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' });
      response.end(localConfig);
      return;
    }
    if (requested === '/tmdb-proxy') {
      let raw = ''; request.on('data', chunk => { raw += chunk; }); request.on('end', () => {
        const payload = JSON.parse(raw || '{}');
        const responses = {
          '/search/movie': { results:[{ id:991, title:'Film funzionale', original_title:'Functional film', release_date:'2026-06-01', overview:'Risultato sicuro.' }] },
          '/movie/991': { id:991, title:'Film funzionale', original_title:'Functional film', release_date:'2026-06-01', overview:'Trama TMDB verificata.', runtime:101, poster_path:'/functional-poster.jpg', backdrop_path:'/functional-backdrop.jpg', genres:[{name:'Dramma'}], imdb_id:'tt0991' },
          '/movie/991/credits': { cast:[{ id:1, name:'Attrice di prova', character:'Protagonista', profile_path:null }] },
          '/movie/991/watch/providers': { results:{ IT:{ flatrate:[{provider_name:'Netflix',provider_id:8}], rent:[{provider_name:'Netflix',provider_id:8}], buy:[], link:'https://example.com/netflix' } } },
          '/movie/991/videos': { results:[] }
        };
        response.writeHead(200, { 'Content-Type':'application/json' }); response.end(JSON.stringify(responses[payload.path] || {}));
      });
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
      tx.objectStore('movies').put({ id:'profile-daniela|movie-functional', profileId:'profile-daniela', mediaType:'movie', title:'Film funzionale', originalTitle:'Functional film', aliases:['Film funzionale - versione italiana'], year:2026, watched:false, state:'watchlist', favorite:false, rating:0, providerGroups:{streaming:[{name:'Netflix',url:'https://example.com/netflix'},{name:'Prime Video',url:'https://example.com/prime'}],rent:[{name:'Netflix',url:'https://example.com/netflix'}],buy:[{name:'Prime Video',url:'https://example.com/prime'}]}, trailer:{site:'YouTube',key:'functional-trailer',name:'Trailer ufficiale',official:true}, trailerLookupStatus:'available', cinemaShowtimes:[{startsAt:yesterday,time:'20:00',title:'Film funzionale',cinemaName:'Cinema vecchio'},{startsAt:tomorrow,time:'21:00',title:'Film diverso',cinemaName:'Cinema errato'},{startsAt:tomorrow,time:'21:30',title:'Film funzionale - versione italiana',cinemaName:'Cinema valido'}], cinemaStatus:'available', cinemaCheckedAt:new Date().toISOString(), cast:[], overview:'Descrizione funzionale.' });
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

    await page.setViewportSize({width:480,height:1040});
    await page.goto(`${url}#/home`,{waitUntil:'domcontentloaded'});
    await waitForAppIdle(page);
    assert(await page.locator('#metadataStatusButton').count()===1,'Il controllo metadati deve restare disponibile in viewport mobile.');
    assert(await page.locator('#metadataStatusButton').isVisible(),'Il controllo metadati mobile non deve essere nascosto dal layout responsive.');
    await page.locator('#metadataStatusButton').click();
    await page.waitForSelector('#metadataStatusModalContent');
    assert(await page.locator('.metadata-top-actions').isVisible(),'Le azioni principali dei metadati devono essere raggiungibili in alto nella modale.');
    assert(await page.locator('.metadata-top-actions button').count()===4,'La barra azioni metadati non deve duplicare né perdere comandi.');
    await page.locator('#resumeMetadata').click();
    assert(await page.locator('#metadataStatusModalContent').isVisible(),'Aggiorna ora non deve chiudere la modale dello stato fonti.');
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:1280,height:900});

    await page.goto(`${url}#/movie/profile-daniela%7Cmovie-functional`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.detail-hero');
    await waitForAppIdle(page);
    assert((await page.evaluate(() => window.WATCHVERSE_CONFIG?.tmdbProxyUrl || '')).includes('tmdb-proxy'),'Il runner deve usare il proxy TMDB simulato per verificare il refresh.');
    assert(await page.locator('#refreshMovieMetadata').count()===1,'Il dettaglio film deve avere un solo pulsante Aggiorna.');
    assert(await page.locator('#enrichMovieTmdb, #enrichMoviePublic').count()===0,'I pulsanti tecnici separati non devono essere visibili.');
    assert(await page.locator('.availability-trailer-card').count()===1,'Trailer e streaming devono stare nello stesso box.');
    assert(await page.locator('.trailer-card').count()===0,'Il box trailer separato non deve essere renderizzato.');
    assert(await page.locator('.provider-logo-only').count()===2,'Le piattaforme devono essere deduplicate e mostrate come soli loghi.');
    assert(await page.locator('.provider-group').count()===0,'Disponibilità, noleggio e acquisto non devono creare sezioni ripetute.');
    assert(await page.locator('.provider-attribution').count()===0,'La nota tecnica JustWatch non deve occupare spazio nel dettaglio.');
    assert(await page.locator('#detailFavorite').getAttribute('aria-pressed')==='false','Un film non preferito deve esporre aria-pressed=false.');
    assert((await page.locator('#detailFavorite').textContent()).includes('♡'),'Un film non preferito deve usare il cuore vuoto.');
    await page.locator('#detailMainAction').click();
    assert(await page.locator('#toastRegion .toast').filter({hasText:'Film segnato come visto'}).count()===1,'Il click su Visto deve dare feedback immediato.');
    const cinemaText=await page.locator('.cinema-programming').textContent();
    assert(cinemaText.includes('21:30')&&!cinemaText.includes('20:00')&&!cinemaText.includes('21:00'),'Devono essere mostrati solo gli spettacoli validi per data e titolo, incluse le varianti del titolo.');
    await page.locator('#refreshMovieMetadata').click();
    await page.waitForFunction(() => document.querySelector('.detail-poster img')?.getAttribute('src')?.includes('functional-poster.jpg') || document.querySelector('#modalRoot .notice.danger, #modalRoot [data-tmdb-match]'));
    assert(await page.locator('#modalRoot .notice.danger, #modalRoot [data-tmdb-match]').count()===0, `Il match unico sicuro deve aggiornare senza richiesta manuale: ${await page.locator('#modalRoot').textContent()}`);
    assert((await page.locator('.detail-poster img').getAttribute('src')).includes('functional-poster.jpg'),'Il refresh deve applicare la locandina ricevuta da TMDB.');
    assert(await page.locator('#toastRegion .toast').filter({hasText:'Metadati aggiornati'}).count()===1,'L’aggiornamento TMDB deve produrre un solo toast di conferma.');
    const functionalRows = await page.evaluate(async () => {
      const db = await new Promise((resolve,reject)=>{const request=indexedDB.open('watchverse-db',4);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      const rows = await new Promise((resolve,reject)=>{const tx=db.transaction('movies','readonly');const request=tx.objectStore('movies').getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}); db.close();
      return rows.filter(row => row.id === 'profile-daniela|movie-functional' || Number(row.tmdbId) === 991);
    });
    assert(functionalRows.length===1 && functionalRows[0].id==='profile-daniela|movie-functional','Il refresh deve aggiornare il record esistente senza duplicarlo.');

    await page.goto(`${url}#/series/profile-daniela%7Cseries-functional`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.detail-hero');
    await waitForAppIdle(page);
    if (await page.locator('[data-detail-tab="info"]').count()) await page.locator('[data-detail-tab="info"]').click();
    assert(await page.locator('#refreshSeriesMetadata').count()===1,'Il dettaglio serie deve avere un solo pulsante Aggiorna.');
    assert(await page.locator('.availability-trailer-card').count()===1,'Anche la serie deve usare il box unificato.');
    await page.locator('[data-detail-tab="episodes"]').click();
    await page.locator('[data-season-toggle="1"]').click();
    assert(await page.locator('[data-season-toggle="1"]').getAttribute('aria-expanded')==='false','La stagione deve potersi chiudere.');
    await page.goto(`${url}#/home`,{waitUntil:'domcontentloaded'});
    await waitForAppIdle(page);
    await page.goto(`${url}#/series/profile-daniela%7Cseries-functional`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('[data-detail-tab="episodes"]');
    await page.locator('[data-detail-tab="episodes"]').click();
    assert(await page.locator('[data-season-toggle="1"]').getAttribute('aria-expanded')==='false','La stagione chiusa non deve riaprirsi dopo un rerender del dettaglio.');
    await browser.close();
    console.log('✓ E2E dettaglio: cinema validato, aggiornamento unificato e box streaming/trailer verificati');
  } finally { server.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
