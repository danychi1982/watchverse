const fs = require('node:fs');

function executablePath() {
  return [process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
    .filter(Boolean).find(file => fs.existsSync(file));
}

async function openBrowser(chromium) {
  if (process.env.WATCHVERSE_CDP_URL) return chromium.connectOverCDP(process.env.WATCHVERSE_CDP_URL);
  const path = executablePath();
  if (!path) throw new Error('Browser non trovato. Imposta WATCHVERSE_CDP_URL o CHROME_PATH.');
  try {
    return await chromium.launch({ executablePath: path, headless: true });
  } catch (error) {
    if (error?.message?.includes('spawn EPERM')) throw new Error('Chrome bloccato da Windows (spawn EPERM). Avvia Chrome con --remote-debugging-port=9222 e imposta WATCHVERSE_CDP_URL=http://127.0.0.1:9222.');
    throw error;
  }
}

module.exports = { openBrowser };
