/* Watchverse authentication: local-first, Supabase-ready */
(function (root) {
  'use strict';

  const ACCOUNT_KEY = 'watchverse.account.v2';
  const LOCAL_SESSION = 'watchverse.session.v2';
  const SESSION_SESSION = 'watchverse.session.temporary.v2';
  const enc = new TextEncoder();
  const config = root.WATCHVERSE_CONFIG || {};

  const bytesToB64 = bytes => btoa(String.fromCharCode(...bytes));
  const b64ToBytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  const randomBytes = size => crypto.getRandomValues(new Uint8Array(size));
  const cloudConfigured = () => !!(config.supabaseUrl && config.supabaseAnonKey);
  const authBase = () => `${String(config.supabaseUrl || '').replace(/\/$/, '')}/auth/v1`;
  const cloudHeaders = extra => ({ apikey: config.supabaseAnonKey, 'Content-Type': 'application/json', ...extra });

  async function derive(secret, saltB64, iterations = 160000) {
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations, hash: 'SHA-256' }, key, 256);
    return bytesToB64(new Uint8Array(bits));
  }

  function readLocalAccount() {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'); } catch { return null; }
  }
  function readAccount() {
    if (cloudConfigured()) return {
      username: String(config.accountUsername || '').toLowerCase(),
      email: String(config.recoveryEmail || '').toLowerCase(),
      cloud: true
    };
    const local = readLocalAccount();
    if (local) return local;
    return null;
  }
  function writeAccount(account) { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account)); }
  function readStoredSession() {
    const raw = localStorage.getItem(LOCAL_SESSION) || sessionStorage.getItem(SESSION_SESSION);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function getSession() {
    const s = readStoredSession();
    if (!s) return null;
    if (s.mode === 'cloud') return s.access_token ? s : null;
    if (!s.createdAt || Date.now() - s.createdAt > 1000 * 60 * 60 * 24 * 90) { signOut(); return null; }
    return s;
  }
  function storeSession(value, remember = true) {
    const raw = JSON.stringify(value);
    if (remember) { localStorage.setItem(LOCAL_SESSION, raw); sessionStorage.removeItem(SESSION_SESSION); }
    else { sessionStorage.setItem(SESSION_SESSION, raw); localStorage.removeItem(LOCAL_SESSION); }
  }
  function setLocalSession(remember) { storeSession({ createdAt: Date.now(), mode: 'local' }, remember); }
  function signOut() { localStorage.removeItem(LOCAL_SESSION); sessionStorage.removeItem(SESSION_SESSION); }

  async function cloudRequest(path, options = {}) {
    const response = await fetch(`${authBase()}${path}`, {
      ...options,
      headers: cloudHeaders(options.headers || {})
    });
    let data = null;
    try { data = await response.json(); } catch { /* no body */ }
    if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || 'Operazione di autenticazione non riuscita.');
    return data;
  }

  async function setup({ username, email, password }) {
    if (!username || !email || !password) throw new Error('Compila tutti i campi.');
    if (password.length < 6) throw new Error('La password deve avere almeno 6 caratteri.');
    if (cloudConfigured()) {
      if (!config.allowCloudSignup) throw new Error('La registrazione pubblica è disattivata. Crea l’utente proprietario dal pannello Supabase.');
      const data = await cloudRequest('/signup', { method: 'POST', body: JSON.stringify({ email, password, data: { username } }) });
      return { username: String(username).trim().toLowerCase(), email: String(email).trim().toLowerCase(), cloud: true, user: data.user };
    }
    const salt = bytesToB64(randomBytes(16));
    const passwordHash = await derive(password, salt);
    const account = {
      username: String(username).trim().toLowerCase(),
      email: String(email).trim().toLowerCase(),
      passwordHash, salt, iterations: 160000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    writeAccount(account);
    return account;
  }

  async function cloudPasswordGrant(email, password) {
    return cloudRequest('/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async function signIn(identifier, password, remember = true) {
    const account = readAccount();
    if (!account) throw new Error('Account non ancora configurato.');
    const id = String(identifier || '').trim().toLowerCase();
    if (id !== account.username && id !== account.email) throw new Error('Nome utente o password non corretti.');
    if (cloudConfigured()) {
      const data = await cloudPasswordGrant(account.email, password);
      storeSession({ mode: 'cloud', ...data, createdAt: Date.now(), remember }, remember);
      return account;
    }
    const hash = await derive(password, account.salt, account.iterations || 160000);
    if (hash !== account.passwordHash) throw new Error('Nome utente o password non corretti.');
    setLocalSession(remember);
    return account;
  }

  async function restoreSession() {
    const session = getSession();
    // Dopo l'attivazione di Supabase non riutilizzare una vecchia sessione locale:
    // consentirebbe l'accesso, ma disabiliterebbe di fatto la sincronizzazione cloud.
    if (cloudConfigured() && session && session.mode !== 'cloud') {
      signOut();
      return null;
    }
    if (!session || session.mode !== 'cloud') return session;
    const expiresAtMs = Number(session.expires_at || 0) * 1000;
    if (!expiresAtMs || expiresAtMs > Date.now() + 60_000) return session;
    if (!session.refresh_token) { signOut(); return null; }
    try {
      const data = await cloudRequest('/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh_token }) });
      const remember = localStorage.getItem(LOCAL_SESSION) != null;
      const refreshed = { mode: 'cloud', ...data, createdAt: Date.now(), remember };
      storeSession(refreshed, remember);
      return refreshed;
    } catch { signOut(); return null; }
  }

  async function verifyPassword(password) {
    const account = readAccount();
    if (!account) return false;
    if (cloudConfigured()) {
      try { await cloudPasswordGrant(account.email, password); return true; } catch { return false; }
    }
    return await derive(password, account.salt, account.iterations || 160000) === account.passwordHash;
  }

  async function changePassword(currentPassword, newPassword) {
    if (String(newPassword || '').length < 6) throw new Error('La nuova password deve avere almeno 6 caratteri.');
    if (cloudConfigured()) {
      if (!(await verifyPassword(currentPassword))) throw new Error('La password attuale non è corretta.');
      const session = await restoreSession();
      if (!session?.access_token) throw new Error('Sessione scaduta: accedi di nuovo.');
      await cloudRequest('/user', { method: 'PUT', headers: { Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ password: newPassword }) });
      return;
    }
    if (!(await verifyPassword(currentPassword))) throw new Error('La password attuale non è corretta.');
    const account = readLocalAccount();
    account.salt = bytesToB64(randomBytes(16));
    account.passwordHash = await derive(newPassword, account.salt, account.iterations || 160000);
    account.updatedAt = new Date().toISOString();
    writeAccount(account);
  }

  async function localReset(email, newPassword) {
    if (cloudConfigured()) throw new Error('In modalità cloud usa il link ricevuto via email.');
    const account = readLocalAccount();
    if (!account || String(email || '').trim().toLowerCase() !== account.email) throw new Error('Indirizzo email non riconosciuto.');
    if (String(newPassword || '').length < 6) throw new Error('La nuova password deve avere almeno 6 caratteri.');
    account.salt = bytesToB64(randomBytes(16));
    account.passwordHash = await derive(newPassword, account.salt, account.iterations || 160000);
    account.updatedAt = new Date().toISOString();
    writeAccount(account);
    signOut();
  }

  async function sendRecoveryEmail(email) {
    if (!cloudConfigured()) throw new Error('Il recupero via email sarà attivo dopo la configurazione Supabase.');
    await cloudRequest('/recover', {
      method: 'POST',
      body: JSON.stringify({ email, redirect_to: location.origin + location.pathname })
    });
  }

  root.WatchverseAuth = {
    readAccount, setup, signIn, signOut, getSession, restoreSession, verifyPassword, changePassword, localReset,
    sendRecoveryEmail, cloudConfigured, defaults: {
      username: config.accountUsername || '',
      email: config.recoveryEmail || ''
    }
  };
})(window);
