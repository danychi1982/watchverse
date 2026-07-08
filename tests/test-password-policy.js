const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');
const { TextEncoder } = require('util');

class Store {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const window = {
  WATCHVERSE_CONFIG: {},
  crypto: webcrypto,
  TextEncoder,
  localStorage: new Store(),
  sessionStorage: new Store(),
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  atob: value => Buffer.from(value, 'base64').toString('binary')
};
const context = {
  window,
  ...window,
  fetch: async () => { throw new Error('Network access not expected in local policy test.'); },
  console,
  Date,
  JSON,
  String,
  Uint8Array,
  Error,
  setTimeout,
  clearTimeout
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8'), context);

(async () => {
  let fiveRejected = false;
  try {
    await window.WatchverseAuth.setup({ username: 'daniela', email: 'd@example.com', password: 'abcde' });
  } catch (error) {
    fiveRejected = /almeno 6/.test(error.message);
  }
  if (!fiveRejected) throw new Error('Una password di 5 caratteri deve essere rifiutata.');

  await window.WatchverseAuth.setup({ username: 'daniela', email: 'd@example.com', password: 'abcdef' });
  await window.WatchverseAuth.signIn('daniela', 'abcdef', true);
  if (!window.WatchverseAuth.getSession()) throw new Error('Una password di 6 caratteri deve essere accettata.');

  console.log('✓ Password: minimo 6 caratteri, senza altri vincoli');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
