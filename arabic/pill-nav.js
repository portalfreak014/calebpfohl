(() => {
  const root = document.querySelector('[data-pill-nav]');
  if (!root) return;

  const page = location.pathname.split('/').pop() || 'arabic.html';
  const items = [
    { href: 'arabic.html', icon: 'home', label: 'Home' },
    { href: 'glossary.html', icon: 'menu_book', label: 'Glossary' },
    { href: 'flashcards.html', icon: 'style', label: 'Flashcards' },
    { href: 'match.html', icon: 'extension', label: 'Match' }
  ];

  root.innerHTML = `
    <style>
      [data-pill-nav] .nav {
        opacity: 1;
        transform: translateY(0);
        transition: transform 220ms ease, opacity 220ms ease;
      }
      [data-pill-nav] .nav.is-scroll-hidden {
        opacity: 0;
        transform: translateY(calc(100% + 32px + env(safe-area-inset-bottom)));
      }
      [data-pill-nav] .nav.is-scroll-hidden .navin {
        pointer-events: none !important;
      }
      [data-pill-nav] .navin {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      html[data-pill-navigation] [data-menu-button],
      html[data-pill-navigation] [data-hamburger-menu] {
        display: none !important;
      }
      @media (min-width: 700px) {
        [data-pill-nav] { display: none !important; }
        html[data-pill-navigation] [data-menu-button] { display: grid !important; }
        html[data-pill-navigation] [data-hamburger-menu] { display: block !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        [data-pill-nav] .nav { transition: none; }
      }
    </style>
    <nav class="nav" aria-label="Primary navigation">
      <div class="navin">
        ${items.map(item => {
          const active = !item.external && item.href === page;
          const attrs = item.external
            ? ' target="_blank" rel="noopener noreferrer"'
            : '';
          return `<a${active ? ' class="active" aria-current="page"' : ''} href="${item.href}"${attrs}>
            <span class="material-symbols-rounded" aria-hidden="true">${item.icon}</span>
            ${item.label}
          </a>`;
        }).join('')}
      </div>
    </nav>
  `;

  document.documentElement.setAttribute('data-pill-navigation', '');
  const desktop = window.matchMedia('(min-width: 700px)');
  const nav = root.querySelector('.nav');
  let hidden = false;
  let frame = null;
  let direction = 0;
  let distance = 0;
  const scrollPosition = () => Math.max(0, Math.min(window.scrollY, Math.max(0, document.documentElement.scrollHeight - window.innerHeight)));
  let lastY = scrollPosition();

  function setHidden(next) {
    if (next && nav.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
    if (hidden === next) return;
    hidden = next;
    nav.classList.toggle('is-scroll-hidden', hidden);
    nav.inert = hidden;
    if (hidden) nav.setAttribute('aria-hidden', 'true');
    else nav.removeAttribute('aria-hidden');
  }

  function resetScrollState() {
    lastY = scrollPosition();
    direction = 0;
    distance = 0;
    setHidden(false);
  }

  root.addEventListener('pill-nav:reset', resetScrollState);

  function syncNavigation() {
    resetScrollState();
    if (desktop.matches) {
      if (root.contains(document.activeElement)) document.querySelector('[data-menu-button]')?.focus();
      return;
    }
    const menuButton = document.querySelector('[data-menu-button]');
    const menuRoot = document.querySelector('[data-hamburger-menu]');
    const restoreFocus = document.activeElement === menuButton || menuRoot?.contains(document.activeElement);
    window.SharedHamburgerMenu?.close({restoreFocus:false});
    if (restoreFocus) root.querySelector('a')?.focus();
  }

  function updateVisibility() {
    frame = null;
    const y = scrollPosition();
    const delta = y - lastY;
    lastY = y;
    if (desktop.matches || y <= 24) {
      direction = 0;
      distance = 0;
      setHidden(false);
      return;
    }
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) {
      direction = nextDirection;
      distance = 0;
    }
    distance = Math.min(8, distance + Math.abs(delta));
    if (distance < 8) return;
    if (direction < 0) setHidden(false);
    else if (y > 64) setHidden(true);
  }

  desktop.addEventListener('change', syncNavigation);
  window.addEventListener('scroll', () => {
    if (frame === null) frame = requestAnimationFrame(updateVisibility);
  }, {passive:true});
  window.addEventListener('pageshow', resetScrollState);
  window.addEventListener('resize', resetScrollState);
  window.addEventListener('keydown', event => {
    if (event.key === 'Tab') resetScrollState();
  }, true);
  nav.addEventListener('focusin', () => setHidden(false));
  syncNavigation();
})();
