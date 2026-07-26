const { chromium } = require('playwright');
const { openBrowser } = require('./e2e-browser');
const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const RETRY_MODE = process.env.WATCHVERSE_RETRY_MODE || 'massive';
const CONFIG = `window.WATCHVERSE_CONFIG = Object.freeze({ appName:'Watchverse', accountUsername:'', recoveryEmail:'', supabaseUrl:'', supabaseAnonKey:'', allowCloudSignup:false, tmdbProxyUrl:'', publicSourcesProxyUrl:'', defaultSources:Object.freeze({ streamingLookup:Object.freeze({enabled:false}), tvSchedule:Object.freeze({enabled:false}), cinema:Object.freeze({enabled:false}) }) });`;

function startServer() {
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
  const server=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://127.0.0.1'); const requested=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
    if(requested==='/config.js'){response.writeHead(200,{'Content-Type':types['.js'],'Cache-Control':'no-store'});response.end(CONFIG);return;}
    const filePath=path.resolve(ROOT,`.${requested}`); if(!filePath.startsWith(ROOT)){response.writeHead(403);response.end();return;}
    fs.readFile(filePath,(error,body)=>{if(error){response.writeHead(404);response.end();return;}response.writeHead(200,{'Content-Type':types[path.extname(filePath)]||'application/octet-stream'});response.end(body);});
  });
  return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve({server,url:`http://127.0.0.1:${server.address().port}/`})));
}

async function login(page) {
  await page.fill('#loginUser','utente'); await page.fill('#loginPassword','abcdef'); await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector('[data-profile-choice]'); await page.locator('[data-profile-choice]').filter({hasText:'Daniela'}).click(); await page.waitForSelector('#aivengersButton:not(.hidden)');
}

async function seed(page) {
  await page.evaluate(async()=>{
    localStorage.clear();sessionStorage.clear();
    await new Promise(resolve=>{const request=indexedDB.deleteDatabase('watchverse-db');request.onsuccess=resolve;request.onerror=resolve;request.onblocked=resolve;});
    const salt=crypto.getRandomValues(new Uint8Array(16)); const saltB64=btoa(String.fromCharCode(...salt));
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('abcdef'),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:160000,hash:'SHA-256'},key,256);
    localStorage.setItem('watchverse.account.v2',JSON.stringify({username:'utente',email:'utente@example.com',passwordHash:btoa(String.fromCharCode(...new Uint8Array(bits))),salt:saltB64,iterations:160000}));
  });
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForSelector('#loginForm'); await login(page);
  await page.evaluate(async()=>{
    localStorage.setItem('watchverse.profile-daniela.settings',JSON.stringify({publicMetadataEnabled:true,autoEnrichVisible:false,themeDefaultsVersion:1}));
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('watchverse-db',4);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    await new Promise((resolve,reject)=>{const tx=db.transaction('movies','readwrite');tx.objectStore('movies').put({id:'profile-daniela|retry-film',profileId:'profile-daniela',mediaType:'movie',title:'Retry film',year:2026,watched:false,state:'watchlist',favorite:false,rating:0,poster:null,overview:'Importato dall’esportazione GDPR di TV Time.',cast:[],publicMetadata:{failedAt:new Date(Date.now()-60000).toISOString(),error:'Fonte temporaneamente non disponibile',errorCategory:'Errore tecnico',attempts:3,nextRetryAt:new Date(Date.now()-1000).toISOString(),parts:{coreComplete:false}}});tx.objectStore('movies').put({id:'profile-daniela|covered-film',profileId:'profile-daniela',mediaType:'movie',title:'Film coperto',year:2025,watched:false,state:'watchlist',favorite:false,rating:0,poster:'https://example.com/covered.jpg',overview:'Descrizione già presente.',cast:[{name:'Attore'}],publicMetadata:{parts:{coreComplete:true,castComplete:true},updatedAt:new Date().toISOString()}});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(document.querySelector('#metadataStatusButton:not(.hidden)')));
  await page.evaluate(()=>{window.WatchversePublicMetadata.lookupMovie=async()=>({title:'Retry film',originalTitle:'Retry film',year:2026,overview:'Descrizione riuscita.',poster:'https://example.com/retry.jpg',cast:[{name:'Attore',character:'Sé stesso'}],provider:'wikipedia',providerLabel:'Wikipedia',sourceUrl:'https://example.com',language:'it',resolution:{provider:'wikipedia'}});});
}

(async()=>{
  const {server,url}=await startServer();
  try {
    const browser=await openBrowser(chromium); const page=await browser.newPage({viewport:{width:1280,height:900}});
    const metadataScript=fs.readFileSync(path.join(ROOT,'public-metadata.js'),'utf8');
    await page.route(`${url}public-metadata.js`,route=>route.fulfill({contentType:'text/javascript; charset=utf-8',body:`${metadataScript}\nwindow.WatchversePublicMetadata.lookupMovie=async()=>{throw new Error('Errore simulato della fonte');};`}));
    await page.goto(url,{waitUntil:'domcontentloaded'}); await seed(page);
    await page.locator('#metadataStatusButton').click(); await page.waitForSelector('#openMetadataIssues'); await page.locator('#openMetadataIssues').click();
    if (RETRY_MODE === 'single') { await page.waitForSelector('[data-metadata-retry]'); await page.locator('[data-metadata-retry]').first().click(); }
    else { await page.waitForSelector('#retryAllMetadataIssues'); await page.locator('#retryAllMetadataIssues').click(); }
    assert((await page.locator('.toast').count()) > 0, 'Il retry deve mostrare un feedback visibile.');
    await page.waitForFunction(async()=>{const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('watchverse-db',4);request.onsuccess=()=>resolve(request.result);request.onerror=reject;});const row=await new Promise((resolve,reject)=>{const tx=db.transaction('movies','readonly');const request=tx.objectStore('movies').get('profile-daniela|retry-film');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});db.close();return row?.publicMetadata?.parts?.coreComplete===true&&row.publicMetadata.error==null&&Number(row.publicMetadata.attempts||0)===0;},{}, {timeout:30000});
    await browser.close(); console.log('✓ E2E retry metadati: retry massivo in coda, ciclo preservato e copertura aggiornata');
  } finally { server.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
