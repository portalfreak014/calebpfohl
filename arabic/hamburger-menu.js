(() => {
  const root = document.querySelector('[data-hamburger-menu]');
  if (!root) return;

  root.innerHTML = `
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
        <button id="progress-menu-button" type="button"><span class="material-symbols-rounded" aria-hidden="true">bar_chart</span>Progress</button>
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
})();
