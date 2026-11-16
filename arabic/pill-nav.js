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
        transform-origin: top center;
        transition: transform 220ms ease;
      }

      [data-pill-nav] .navin {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      html[data-pill-navigation] [data-menu-button],
      html[data-pill-navigation] [data-hamburger-menu] {
        display: none !important;
      }

      @media (min-width: 700px) {
        [data-pill-nav] {
          display: none !important;
        }
        html[data-pill-navigation] [data-menu-button] {
          display: grid !important;
        }
        html[data-pill-navigation] [data-hamburger-menu] {
          display: block !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        [data-pill-nav] .nav {
          transition: none;
        }
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

  function syncNavigation() {
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

  desktop.addEventListener('change', syncNavigation);
  syncNavigation();

  const updatePillSize = () => {
    const progress = Math.min(window.scrollY / 150, 1);
    const scale = 1 - (progress * 0.3);
    root.querySelector('.nav').style.transform = `scale(${scale})`;
  };

  window.addEventListener('scroll', updatePillSize, { passive: true });
  updatePillSize();
})();
