const SERVICE = 'https://tenslant-id.tenslant44.workers.dev';
const CLIENT_ID = 'cartman-royale';
const REDIRECT_URI = 'https://tenslant44.github.io/Cartman-Royale/';
const SCOPES = 'profile saves:read saves:write';
const SAVE_KEY = 'cartman-royale-progress';
const SESSION_KEY = 'tenslant.oauth.pending';
const $ = (id) => document.getElementById(id);
const panel = $('tenslantPanel');
const statusEl = $('tenslantStatus');
const syncEl = $('tenslantSync');
const messageEl = $('tenslantMessage');
const actionsEl = $('tenslantActions');
const conflictEl = $('tenslantConflict');
let accessToken = null;
let expiresAt = 0;
let user = null;
let adapter = null;
let revision = 0;
let cloudReady = false;
let saveTimer = null;
let saveInFlight = Promise.resolve();
let queuedCallback = null;

function showMessage(text = '') { messageEl.textContent = text; }
function status(text) { statusEl.textContent = text; }
function syncStatus(text) { syncEl.textContent = text; }
function button(label, action, secondary = false) {
  const el = document.createElement('button');
  el.type = 'button'; el.textContent = label;
  if (secondary) el.className = 'secondary';
  el.addEventListener('click', () => Promise.resolve(action()).catch(() => showMessage('That action could not be completed.')));
  return el;
}
function render() {
  actionsEl.replaceChildren();
  if (accessToken && Date.now() < expiresAt && user) {
    status('Connected as @' + user.username);
    actionsEl.append(button('Sync now', () => uploadCurrent(true)), button('Sign out', signOut, true));
  } else {
    status('Tenslant ID is not connected');
    actionsEl.append(button('Sign in with Tenslant ID', beginAuthorization));
  }
}
function base64url(bytes) {
  let binary = '';
  for (const value of bytes) binary += String.fromCharCode(value);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
async function beginAuthorization() {
  if (!window.crypto?.subtle || !window.crypto.getRandomValues) { showMessage('Secure sign-in is unavailable in this browser.'); return; }
  const verifier = base64url(window.crypto.getRandomValues(new Uint8Array(32)));
  const state = base64url(window.crypto.getRandomValues(new Uint8Array(24)));
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64url(new Uint8Array(digest));
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ verifier, state, createdAt: Date.now() }));
  const url = new URL('/authorize.html', SERVICE);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', SCOPES);
  location.assign(url.href);
}
async function api(path, options = {}) {
  if (!accessToken || Date.now() >= expiresAt) {
    accessToken = null; user = null; cloudReady = false; render();
    syncStatus('Cloud disconnected · sign in again to sync');
    showMessage('Your Tenslant ID connection expired. Local progress is safe.');
    throw Object.assign(new Error('expired'), { auth: true });
  }
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', 'Bearer ' + accessToken);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  let response;
  try { response = await fetch(SERVICE + path, { ...options, headers, cache: 'no-store' }); }
  catch { throw new Error('The Tenslant ID service is temporarily unreachable. Local progress is safe.'); }
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 || body.error === 'invalid_token') {
    accessToken = null; user = null; cloudReady = false; render();
    throw Object.assign(new Error('Your Tenslant ID connection expired. Sign in again to sync.'), { auth: true });
  }
  if (!response.ok) {
    const messages = {
      insufficient_scope: 'Tenslant ID did not grant the save permissions this game needs.',
      game_mismatch: 'The access token is not registered for Cartman Royale.',
      account_banned: 'This Tenslant ID account cannot access games right now.',
      game_banned: 'Cartman Royale access is currently disabled.',
      save_too_large: 'The cloud save exceeds the service size limit.',
      invalid_save_key: 'The cloud save key was rejected.',
      missing_data: 'The service rejected an empty save.',
      revision_conflict: 'The cloud save changed on another device.'
    };
    const error = new Error(messages[body.error] || 'Cloud sync failed (' + (body.error || response.status) + ').');
    error.code = body.error; error.status = response.status; error.body = body;
    throw error;
  }
  return body;
}
function localProgressExists(snapshot) {
  const p = snapshot?.progress;
  return Boolean(p && (p.credits > 0 || p.diamonds > 0 || p.ownedSkins.length > 1 || (p.halloween && (p.halloween.candy > 50 || p.halloween.boostUntil > 0 || p.halloween.delivered?.length > 0))));
}
async function finishCallback(params) {
  const pendingRaw = sessionStorage.getItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  history.replaceState(null, '', location.pathname + location.hash);
  if (!pendingRaw) { showMessage('Sign-in data was missing. Start sign-in again.'); return; }
  let pending;
  try { pending = JSON.parse(pendingRaw); } catch { showMessage('Sign-in data was invalid. Start sign-in again.'); return; }
  if (!params.get('state') || params.get('state') !== pending.state || Date.now() - pending.createdAt > 5 * 60 * 1000) {
    showMessage('The sign-in check expired or did not match. Start sign-in again.'); return;
  }
  if (params.get('error')) { showMessage(params.get('error') === 'access_denied' ? 'Sign-in was cancelled.' : 'Tenslant ID could not authorize this game.'); return; }
  const code = params.get('code');
  if (!code || !pending.verifier) { showMessage('The authorization response was incomplete. Start sign-in again.'); return; }
  syncStatus('Finishing secure sign-in…');
  try {
    const response = await fetch(SERVICE + '/api/oauth/token', {
      method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, code, redirect_uri: REDIRECT_URI, code_verifier: pending.verifier })
    });
    const token = await response.json().catch(() => ({}));
    const grantedScopes = new Set(String(token.scope || '').split(/\s+/).filter(Boolean));
    if (!response.ok || !token.access_token || token.token_type?.toLowerCase() !== 'bearer' || !Number.isFinite(Number(token.expires_in)) || Number(token.expires_in) <= 0 || SCOPES.split(' ').some((scope) => !grantedScopes.has(scope))) throw new Error(token.error || 'Tenslant ID did not return the required save permissions. Start sign-in again.');
    accessToken = token.access_token;
    expiresAt = Date.now() + Math.min(Number(token.expires_in), 3600) * 1000;
    const profile = await api('/api/oauth/userinfo');
    if (!profile.user?.id || !profile.user?.username) throw new Error('Tenslant ID returned an invalid profile.');
    user = { id: String(profile.user.id), username: String(profile.user.username) };
    render();
    syncStatus('Connected. Checking cloud save…');
    if (adapter) await connectCloud(); else queuedCallback = true;
  } catch (error) {
    accessToken = null; user = null; render();
    showMessage(error.message || 'Could not complete sign-in. Start again.');
    syncStatus('Cloud sync unavailable');
  }
}
async function connectCloud() {
  if (!adapter || !accessToken || !user) return;
  cloudReady = false;
  conflictEl.replaceChildren();
  try {
    const result = await api('/api/games/' + CLIENT_ID + '/saves');
    if (!Array.isArray(result.saves)) throw new Error('Unexpected cloud-save response.');
    const cloud = result.saves.find((save) => save?.key === SAVE_KEY);
    if (cloud) {
      revision = Number.isSafeInteger(cloud.revision) && cloud.revision > 0 ? cloud.revision : 0;
      const local = adapter.snapshot();
      if (JSON.stringify(local.progress) === JSON.stringify(cloud.data?.progress)) {
        cloudReady = true; syncStatus('Cloud save is current'); return;
      }
      syncStatus('Cloud and local progress differ. Choose which copy to keep.');
      showMessage('Your local progress is kept until you choose. Currency and rewards are never combined.');
      conflictEl.append(
        button('Restore cloud save', async () => { try { await adapter.restore(cloud.data); cloudReady = true; conflictEl.replaceChildren(); showMessage('Cloud save restored to this device.'); syncStatus('Saved to cloud · revision ' + revision); } catch (e) { showMessage(e.message); } }),
        button('Replace cloud with local', () => uploadCurrent(true), true)
      );
      return;
    }
    revision = 0;
    const local = adapter.snapshot();
    if (localProgressExists(local)) {
      syncStatus('No cloud save yet. Local progress is available.');
      showMessage('Upload this device’s local progress to your Tenslant ID account?');
      conflictEl.append(
        button('Upload local save', async () => { cloudReady = true; await uploadCurrent(true); }),
        button('Keep local only', () => { cloudReady = false; conflictEl.replaceChildren(); showMessage('Local progress remains on this device.'); syncStatus('Connected · cloud save not created'); }, true)
      );
    } else {
      cloudReady = true;
      syncStatus('Connected · no cloud save yet');
      showMessage('Your local game is ready. A cloud save will be created after progress changes.');
    }
  } catch (error) {
    if (error.auth) return;
    cloudReady = false;
    syncStatus('Cloud service temporarily unavailable · local game is safe');
    showMessage(error.message);
  }
}
async function uploadCurrent(explicit = false) {
  if (!accessToken || !user || !adapter) return;
  if (!cloudReady && !explicit) return;
  const snapshot = adapter.snapshot();
  const body = { data: snapshot, expectedRevision: revision };
  syncStatus('Syncing…');
  showMessage('');
  saveInFlight = saveInFlight.then(async () => {
    try {
      const result = await api('/api/games/' + CLIENT_ID + '/saves/' + SAVE_KEY, { method: 'PUT', body: JSON.stringify(body) });
      if (!Number.isSafeInteger(result.revision) || result.revision < 1) throw new Error('The save response was incomplete; local progress is safe.');
      revision = result.revision;
      cloudReady = true;
      conflictEl.replaceChildren();
      syncStatus('Saved to cloud · revision ' + revision);
    } catch (error) {
      if (error.code === 'revision_conflict') {
        cloudReady = false;
        syncStatus('Cloud changed elsewhere. Reading the latest revision…');
        try { await connectCloud(); } catch (readError) { showMessage(readError.message); }
        return;
      }
      if (!error.auth) { syncStatus('Cloud save failed · local progress is safe'); showMessage(error.message); }
    }
  });
  await saveInFlight;
}
function markDirty() {
  if (!adapter) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => uploadCurrent(false), 1800);
}
async function signOut() {
  const tokenToRevoke = accessToken;
  if (tokenToRevoke) fetch(SERVICE + '/api/oauth/revoke', { method: 'POST', headers: { Authorization: 'Bearer ' + tokenToRevoke } }).catch(() => {});
  accessToken = null; expiresAt = 0; user = null; revision = 0; cloudReady = false;
  if (saveTimer) clearTimeout(saveTimer);
  conflictEl.replaceChildren();
  syncStatus('Signed out · local progress stays on this device');
  showMessage('This signs Cartman Royale out. Your Tenslant ID website session is unchanged.');
  render();
}
function registerGameAdapter(value) {
  adapter = value;
  if (queuedCallback) { queuedCallback = false; connectCloud(); }
}
async function handleCallback() {
  const params = new URLSearchParams(location.search);
  if (params.has('code') || params.has('error') || params.has('state')) await finishCallback(params);
}
if (window.__PORTABLE_BUILD__) panel.hidden = true;
render();
handleCallback();
window.TenslantID = { registerGameAdapter, markDirty, getConnectedUser: () => user ? { ...user } : null };
