(() => {
  const root = document.querySelector('[data-pill-nav]');
  if (!root) return;

  const scheduleUrl = 'https://dliflc01.sharepoint.com/:w:/r/teams/21501AD00326_J3/_layouts/15/Doc.aspx?action=edit&sourcedoc=%7B9a92921e-5b24-42bc-9d34-8bec4f78dac2%7D&wdExp=TEAMS-TREATMENT&web=1';
  const page = location.pathname.split('/').pop() || 'arabic.html';
  const items = [
    { href: 'arabic.html', icon: 'home', label: 'Home' },
    { href: 'glossary.html', icon: 'menu_book', label: 'Glossary' },
    { href: 'flashcards.html', icon: 'style', label: 'Flashcards' },
    { href: 'match.html', icon: 'extension', label: 'Match' },
    { href: scheduleUrl, icon: 'calendar_month', label: 'Schedule', external: true }
  ];

  root.innerHTML = `
    <style>
      [data-pill-nav] .nav {
        transform-origin: top center;
        transition: transform 220ms ease;
      }

      [data-pill-nav] .navin {
        grid-template-columns: repeat(5, minmax(0, 1fr));
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

  const updatePillSize = () => {
  const progress = Math.min(window.scrollY / 150, 1);
  const scale = 1 - (progress * 0.3); // 1.0 → 0.7
  root.querySelector('.nav').style.transform = `scale(${scale})`;
};

window.addEventListener('scroll', updatePillSize, { passive: true });
updatePillSize();
})();
