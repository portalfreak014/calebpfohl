(() => {
  if (window.UADTheme) return;
  const base = document.currentScript.src;
  const key = 'uad-theme-guest';
  const valid = value => value === 'dark' || value === 'light';
  const read = name => { try { return localStorage.getItem(name); } catch { return null; } };
  const save = (name, value) => { try { localStorage.setItem(name, value); } catch {} };
  const system = matchMedia('(prefers-color-scheme: dark)');
  let mode = valid(read(key)) ? read(key) : system.matches ? 'dark' : 'light';
  let user = null, ready = false, revision = 0, generation = 0;
  let api = null, reference = null, writing = false, queued = null;
  const style = document.createElement('style');
  style.textContent = `
    html[data-theme=dark] {
      color-scheme:dark;
      --p:#d0bcff!important;--pc:#4f378b!important;--opc:#eaddff!important;
      --s:#141218!important;--sl:#211f26!important;--sh:#2b2930!important;
      --ink:#e6e0e9!important;--v:#cac4d0!important;--o:#938f99!important;--ov:#49454f!important;
      --primary:#d0bcff!important;--on-primary:#381e72!important;
      --primary-container:#4f378b!important;--on-primary-container:#eaddff!important;
      --surface:#141218!important;--surface-container:#211f26!important;--surface-high:#2b2930!important;
      --additional-surface:#302b38!important;--text:#e6e0e9!important;--muted:#cac4d0!important;
      --outline:#938f99!important;--outline-variant:#49454f!important;
      background:#141218;color:#e6e0e9;
    }
    html[data-theme=dark] body {background:var(--surface,var(--s));color:var(--text,var(--ink));}
    html[data-theme=dark] .navin {background:rgb(33 31 38 / .96);}
    html[data-theme=dark] .button {color:var(--on-primary);}
    html[data-theme=dark] tbody tr.additional:hover {background:#3c3546;}
    #uad-theme-toggle {display:inline-grid;place-items:center;flex-shrink:0;width:44px;height:44px;margin-inline-start:auto;margin-inline-end:6px;border:1px solid var(--outline-variant,var(--ov,#cac4d0));border-radius:50%;background:var(--primary-container,var(--pc,#e9ddff));color:var(--on-primary-container,var(--opc,#21005d));cursor:pointer;font:700 22px/1 system-ui;}
    #uad-theme-toggle:focus-visible {outline:3px solid var(--primary,var(--p,#6750a4));outline-offset:3px;}
    #uad-theme-status {position:fixed;left:16px;bottom:160px;z-index:30;max-width:calc(100vw - 32px);padding:10px 14px;border-radius:12px;background:var(--surface-container,var(--sl,#f7f2fa));color:var(--text,var(--ink,#1c1b1f));font:14px/1.4 system-ui;box-shadow:0 2px 12px #0003;}
    #uad-theme-status:empty {display:none;}
  `;
  document.head.append(style);
  const button = document.createElement('button');
  button.id = 'uad-theme-toggle';
  button.type = 'button';
  const status = document.createElement('div');
  status.id = 'uad-theme-status';
  status.setAttribute('role', 'status');
  function apply(value) {
    mode = value;
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    button.textContent = value === 'dark' ? '☀' : '☾';
    button.setAttribute('aria-label', value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('aria-pressed', String(value === 'dark'));
    button.title = value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', value === 'dark' ? '#141218' : '#6750a4');
  }
  apply(mode);
  function mount() {
    const menu = document.querySelector('[data-menu-button]');
    if (menu && !button.isConnected) menu.before(button);
    if (!status.isConnected) document.body.append(status);
  }
  mount();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  async function flush() {
    if (writing || !ready || !user || !api || !queued) return;
    const job = {value:queued, uid:user.uid, ref:reference, generation};
    queued = null; writing = true;
    try {
      await api.setDoc(job.ref, {theme:job.value, updatedAt:api.serverTimestamp()}, {merge:true});
      if (generation === job.generation && !queued) {
        save('uad-theme-pending:' + job.uid, '');
        status.textContent = '';
      }
    } catch (error) {
      if (generation === job.generation) {
        queued = queued || job.value;
        status.textContent = 'Theme saved in this browser. Account sync unavailable; retrying when online.';
      }
      console.error('Theme sync failed:', error);
    } finally {
      writing = false;
    }
    if (queued && queued !== job.value) flush();
  }
  function set(value) {
    if (!valid(value)) return;
    revision++; apply(value);
    if (user) {
      save('uad-theme:' + user.uid, value);
      save('uad-theme-pending:' + user.uid, value);
      queued = value; flush();
    } else save(key, value);
  }
  button.addEventListener('click', () => set(mode === 'dark' ? 'light' : 'dark'));
  window.addEventListener('online', flush);
  window.addEventListener('storage', event => {
    const currentKey = user ? 'uad-theme:' + user.uid : key;
    if (event.key === currentKey && valid(event.newValue)) apply(event.newValue);
  });
  system.addEventListener('change', event => {
    if (!user && !valid(read(key))) apply(event.matches ? 'dark' : 'light');
  });
  window.UADTheme = {set, get:() => mode};
  Promise.all([
    import(new URL('./firebase-auth.js', base).href),
    import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
  ]).then(([firebase, authApi, firestore]) => {
    api = firestore;
    authApi.onAuthStateChanged(firebase.auth, async account => {
      const token = ++generation;
      user = account; ready = false; queued = null;
      status.textContent = '';
      if (!account) {
        apply(valid(read(key)) ? read(key) : system.matches ? 'dark' : 'light');
        return;
      }
      reference = api.doc(firebase.db, 'users', account.uid, 'progress', 'preferences');
      const ref = reference;
      const pending = read('uad-theme-pending:' + account.uid);
      const cached = read('uad-theme:' + account.uid);
      const before = revision;
      if (valid(cached)) apply(cached);
      try {
        const snapshot = await api.getDoc(ref);
        if (token !== generation) return;
        const remote = snapshot.exists() ? snapshot.data().theme : null;
        if (revision !== before) queued = mode;
        else if (valid(pending)) { apply(pending); queued = pending; }
        else if (valid(remote)) apply(remote);
        else queued = mode;
        save('uad-theme:' + account.uid, mode);
        ready = true;
        if (queued) {save('uad-theme-pending:' + account.uid, queued);flush();}
      } catch (error) {
        if (token !== generation) return;
        ready = true;
        status.textContent = 'Using browser theme. Could not load account preference; change the theme to retry saving.';
        console.error('Theme preference load failed:', error);
      }
    });
  }).catch(error => {
    status.textContent = 'Theme works in this browser. Google account theme sync is unavailable.';
    console.error('Theme account integration failed:', error);
  });
})();
