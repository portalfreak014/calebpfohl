(() => {
  const root = document.querySelector('[data-hamburger-menu]');
  if (!root) return;

  const scriptBase = document.currentScript.src;
  const themeScript = document.createElement('script');
  themeScript.src = new URL('./theme.js', scriptBase).href;
  document.head.appendChild(themeScript);

  root.innerHTML = `
    <style>
      [data-pill-nav] .nav {
        position:fixed;right:0;bottom:max(12px,env(safe-area-inset-bottom));left:0;
        z-index:10;display:flex;justify-content:center;padding:0 12px;pointer-events:none;
      }
      [data-pill-nav] .navin {
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:min(100%,600px);
        padding:5px;border:1px solid var(--outline-variant,var(--ov,#cac4d0));border-radius:999px;
        background:var(--surface,var(--s,#fffbfe));box-shadow:0 5px 18px rgb(0 0 0 / .14);
        backdrop-filter:blur(12px);pointer-events:auto;
      }
      [data-pill-nav] .nav a {
        display:grid;place-items:center;gap:3px;min-height:52px;padding:3px 4px;
        border:0;border-radius:999px;background:transparent;color:var(--muted,var(--v,#49454f));
        font:700 .68rem/1.1 "Noto Sans","Noto Sans Arabic",system-ui,sans-serif;
        text-decoration:none;
      }
      [data-pill-nav] .nav a:hover {background:var(--surface-container,var(--sl,#f7f2fa));}
      [data-pill-nav] .nav a.active {
        background:var(--primary-container,var(--pc,#e9ddff));
        color:var(--on-primary-container,var(--opc,#21005d));
      }
      [data-pill-nav] .nav a:focus-visible {outline:3px solid var(--primary,var(--p,#6750a4));outline-offset:3px;}
      @media (width < 700px) {
        html[data-pill-navigation] .app {padding-bottom:calc(112px + env(safe-area-inset-bottom));}
      }
      @media (width >= 700px) {
        html[data-theme=dark] .drawer-backdrop {
          background:rgb(255 255 255 / .07);
          transition:opacity .22s ease,background-color .22s ease;
        }
      }
      [data-hamburger-menu] #progress-menu-button:disabled {
        opacity: .38;
        cursor: not-allowed;
        background: transparent;
      }
      [data-hamburger-menu] #progress-menu-button:disabled,
      [data-hamburger-menu] #progress-menu-button:disabled .material-symbols-rounded {
        color: var(--v, #49454f);
      }
    </style>
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="drawer" id="drawer" aria-label="Main menu" aria-hidden="true">
      <div class="drawer-head">
        <strong>Menu</strong>
        <button class="icon" id="close-menu-button" type="button" aria-label="Close menu">
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="drawer-links">
        <a href="arabic.html"><span class="material-symbols-rounded" aria-hidden="true">home</span>Home</a>
        <a href="glossary.html"><span class="material-symbols-rounded" aria-hidden="true">menu_book</span>Glossary</a>
        <a href="flashcards.html"><span class="material-symbols-rounded" aria-hidden="true">style</span>Flashcards</a>
        <a href="match.html"><span class="material-symbols-rounded" aria-hidden="true">extension</span>Match</a>
        <a href="roots.html"><span class="material-symbols-rounded" aria-hidden="true">account_tree</span>Freya's Root Chart</a>
        <button id="progress-menu-button" type="button" disabled><span class="material-symbols-rounded" aria-hidden="true">bar_chart</span><span>Progress <small>(Coming soon)</small></span></button>
        <a href="docs.html"><span class="material-symbols-rounded" aria-hidden="true">description</span>Docs</a>
        <div id="firebase-auth"></div>
      </div>
    </aside>
  `;

  const menuButton = document.querySelector('[data-menu-button]');
  const drawer = root.querySelector('#drawer');
  const backdrop = root.querySelector('#drawer-backdrop');
  const closeButton = root.querySelector('#close-menu-button');
  const progressButton = root.querySelector('#progress-menu-button');
  if (!menuButton || !drawer || !backdrop || !closeButton) return;

  function openMenu() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener('click', openMenu);
  closeButton.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);
  progressButton?.addEventListener('click', () => {
    closeMenu({ restoreFocus: false });
    document.dispatchEvent(new CustomEvent('shared-menu:progress'));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeMenu();
  });

  window.SharedHamburgerMenu = { open: openMenu, close: closeMenu };

  function initializePill() {
    let pill = document.querySelector('[data-pill-nav]');
    if (!pill) {
      pill = document.createElement('div');
      pill.setAttribute('data-pill-nav', '');
      document.body.appendChild(pill);
    }
    if (pill.querySelector('nav') || pill.dataset.loading === 'true') return;
    pill.dataset.loading = 'true';
    const pillScript = document.createElement('script');
    pillScript.src = new URL('./pill-nav.js', scriptBase).href;
    pillScript.onload = () => {delete pill.dataset.loading;};
    pillScript.onerror = () => {
      delete pill.dataset.loading;
      document.documentElement.removeAttribute('data-pill-navigation');
      console.error('Pill navigation could not load; keeping the regular menu available.');
    };
    document.head.appendChild(pillScript);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePill, {once:true});
  } else initializePill();
})();
