const style = document.createElement('style');
style.textContent = `
  #fursa-account-dialog {box-sizing:border-box;width:min(440px,calc(100vw - 32px));max-height:calc(100dvh - 40px);overflow:auto;padding:24px;border:1px solid var(--outline-variant,var(--ov,#cac4d0));border-radius:24px;background:var(--surface,var(--s,#fffbfe));color:var(--text,var(--ink,#1c1b1f));font:16px/1.5 "Noto Sans",system-ui,sans-serif;box-shadow:0 20px 80px #0005;}
  #fursa-account-dialog::backdrop {background:#0006;}
  #fursa-account-dialog h2 {margin:0 48px 18px 0;font-size:1.35rem;}
  #fursa-account-dialog p {overflow-wrap:anywhere;}
  #fursa-account-close {position:absolute;top:12px;right:12px;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:inherit;font:26px system-ui;cursor:pointer;}
  #fursa-account-action {width:100%;min-height:48px;padding:10px 16px;border:0;border-radius:999px;background:var(--primary,var(--p,#6750a4));color:var(--on-primary,#fff);font:700 15px system-ui;cursor:pointer;}
  #fursa-account-action:disabled {opacity:.55;cursor:wait;}
  #fursa-account-dialog button:focus-visible,[data-account-open]:focus-visible {outline:3px solid var(--primary,var(--p,#6750a4));outline-offset:3px;}
  #fursa-account-badge {display:inline-block;padding:5px 12px;border-radius:999px;background:var(--primary-container,var(--pc,#e9ddff));color:var(--on-primary-container,var(--opc,#21005d));font-size:.8rem;}
  #fursa-account-badge[hidden] {display:none;}
  #fursa-account-status {font-size:.85rem;min-height:1.5em;}
  #fursa-header-account {display:inline-grid;place-items:center;flex-shrink:0;width:44px;height:44px;margin-inline-end:6px;padding:0;border:1px solid var(--outline-variant,var(--ov,#cac4d0));border-radius:50%;background:var(--primary-container,var(--pc,#e9ddff));color:var(--on-primary-container,var(--opc,#21005d));cursor:pointer;}
  html[data-pill-navigation] #fursa-header-account {display:none;}
  @media(min-width:700px) {html[data-pill-navigation] #fursa-header-account {display:inline-grid;}}
  [data-pill-nav] .nav button[data-account-open] {display:grid;place-items:center;align-content:center;gap:3px;min-width:0;min-height:52px;padding:3px 4px;border:0;border-radius:999px;background:transparent;color:var(--muted,var(--v,#49454f));font:700 .68rem/1.1 "Noto Sans",system-ui,sans-serif;cursor:pointer;}
  [data-pill-nav] .nav button[data-account-open]:hover {background:var(--surface-container,var(--sl,#f7f2fa));}
`;
document.head.append(style);
const dialog = document.createElement('dialog');
dialog.id = 'fursa-account-dialog';
dialog.setAttribute('aria-labelledby', 'fursa-account-title');
dialog.innerHTML = `<button id="fursa-account-close" type="button" aria-label="Close account card">×</button><h2 id="fursa-account-title">Your account</h2><p id="fursa-account-name"></p><p id="fursa-account-email"></p><p id="fursa-account-badge" hidden></p><p id="fursa-account-description">Sign in to sync your study progress across devices.</p><button id="fursa-account-action" type="button" disabled>Loading sign-in…</button><p id="fursa-account-status" role="status" aria-live="polite"></p>`;
document.body.append(dialog);
const name = dialog.querySelector('#fursa-account-name');
const email = dialog.querySelector('#fursa-account-email');
const badge = dialog.querySelector('#fursa-account-badge');
const description = dialog.querySelector('#fursa-account-description');
const action = dialog.querySelector('#fursa-account-action');
const status = dialog.querySelector('#fursa-account-status');
let account = null, ready = false, busy = false, failed = false, opener = null;
function label(button) {
  button.setAttribute('aria-label', account ? 'Open your profile' : 'Open login');
  const text = button.querySelector('[data-account-label]');
  if (text) text.textContent = account ? 'Profile' : 'Log in';
}
function makeButton(header = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.accountOpen = '';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', dialog.id);
  if (header) button.id = 'fursa-header-account';
  button.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">account_circle</span>${header ? '' : '<span data-account-label></span>'}`;
  label(button);
  return button;
}
function mount() {
  for (const link of document.querySelectorAll('[data-pill-nav] .nav a[href="match.html"]')) link.replaceWith(makeButton());
  const menu = document.querySelector('[data-menu-button]');
  if (menu) {
    let button = document.getElementById('fursa-header-account');
    if (!button) { button = makeButton(true); menu.before(button); }
    else if (button.nextElementSibling !== menu) menu.before(button);
  }
}
function render() {
  name.textContent = account ? account.displayName || 'Your profile' : 'Welcome to Fursa';
  email.textContent = account?.email || '';
  email.hidden = !account?.email;
  const google = account?.providerData?.some(provider => provider.providerId === 'google.com');
  badge.hidden = !account;
  badge.textContent = google ? 'Connected with Google' : 'Signed in';
  description.hidden = !!account;
  action.textContent = busy ? 'Please wait…' : failed ? 'Sign-in unavailable' : !ready ? 'Loading sign-in…' : account ? 'Log out' : 'Log in with Google';
  action.disabled = busy || !ready || failed;
  document.querySelectorAll('[data-account-open]').forEach(label);
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-account-open]');
  if (!button) return;
  opener = button;
  window.SharedHamburgerMenu?.close({restoreFocus:false});
  if (!dialog.open) dialog.showModal();
});
dialog.querySelector('#fursa-account-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
action.addEventListener('click', async () => {
  if (!ready || busy) return;
  busy = true; status.textContent = ''; render();
  try {
    if (account) await window.FursaAccountAuth.signOut();
    else await window.FursaAccountAuth.signIn();
  } catch (error) {
    console.error('Account action failed:', error);
    status.textContent = error.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : error.code === 'auth/popup-blocked' ? 'Your browser blocked the login window. Allow popups for this site and try again.' : error.code === 'auth/unauthorized-domain' ? 'This site domain is not authorized for Firebase login. Please contact the site owner.' : `Could not complete sign-in or logout (${error.code || 'connection error'}). Please try again.`;
  } finally { busy = false; render(); }
});
mount(); render();
new MutationObserver(mount).observe(document.body, {childList:true,subtree:true});
try {
  const [firebase, api] = await Promise.all([import('./firebase-auth.js'), import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js')]);
  if (!window.FursaAccountAuth) throw new Error('Account integration is missing from this deployment');
  api.onAuthStateChanged(firebase.auth, user => {account = user; ready = true; render();}, error => {failed = true; status.textContent = 'Account status could not load. Please reload and try again.'; render();});
} catch (error) {
  failed = true;
  status.textContent = 'Login could not load. Please reload, or check whether a content blocker is blocking Firebase.';
  console.error('Account initialization failed:', error);
  render();
}
