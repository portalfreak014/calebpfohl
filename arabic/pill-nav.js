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
})();
