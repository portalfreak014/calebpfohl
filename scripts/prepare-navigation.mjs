import { readFile, writeFile } from 'node:fs/promises';

const quizFile = 'arabic/quiz.html';
let quiz = await readFile(quizFile, 'utf8');
const notice = /<p id="flag-privacy-notice"[^>]*>[\s\S]*?<\/p>/;
if (!quiz.includes('<!-- Inline flag notice hidden')) {
  if (!notice.test(quiz)) throw new Error('Flag notice missing; review quiz preparation');
  quiz = quiz.replace(notice, match => '<!-- Inline flag notice hidden; account attribution remains enabled.\n' + match + '\n-->');
}
quiz = quiz.replace(/\saria-describedby="flag-privacy-notice"/g, '');
await writeFile(quizFile, quiz);

const pillFile = 'arabic/pill-nav.js';
let pill = await readFile(pillFile, 'utf8');
if (!pill.includes('fursa-settings-coming-soon')) {
  const item = "{ href: 'match.html', icon: 'extension', label: 'Match' }";
  if (!pill.includes(item)) throw new Error('Pill item list changed');
  pill = pill.replace(item, item + ",\n    { icon: 'settings', label: 'Settings', disabled: true }");
  const map = '${items.map(item => {';
  if (!pill.includes(map)) throw new Error('Pill renderer changed');
  pill = pill.replace(map, map + `
          if (item.disabled) return '<button class="fursa-settings-coming-soon" type="button" disabled aria-label="Settings — coming soon"><span class="material-symbols-rounded" aria-hidden="true">settings</span><span>Settings</span><small>Coming soon</small></button>';
`);
  pill = pill.replace('repeat(4, minmax(0, 1fr))', 'repeat(5, minmax(0, 1fr))');
  const styles = `
      [data-pill-nav] .navin .fursa-settings-coming-soon {
        display:grid;place-items:center;align-content:center;gap:2px;min-width:0;min-height:52px;
        padding:3px 2px;border:0;border-radius:999px;background:transparent;
        color:var(--muted,var(--v,#49454f));opacity:.5;cursor:not-allowed;
        font:700 .65rem/1.1 "Noto Sans",system-ui,sans-serif;
      }
      [data-pill-nav] .fursa-settings-coming-soon small {font-size:.5rem;font-weight:500;white-space:nowrap;}
`;
  if (!pill.includes('</style>')) throw new Error('Pill styles missing');
  pill = pill.replace('</style>', styles + '\n    </style>');
}
await writeFile(pillFile, pill);

const menuFile = 'arabic/hamburger-menu.js';
let menu = await readFile(menuFile, 'utf8');
if (!menu.includes('id="settings-menu-button"')) {
  const progress = /<button id="progress-menu-button"[^>]*>[\s\S]*?<\/button>/;
  if (!progress.test(menu)) throw new Error('Progress menu item missing');
  menu = menu.replace(progress, match => match + '\n        <button id="settings-menu-button" type="button" disabled><span class="material-symbols-rounded" aria-hidden="true">settings</span><span>Settings <small>(Coming soon)</small></span></button>');
  const styles = `
      [data-hamburger-menu] #settings-menu-button:disabled {
        opacity:.38;cursor:not-allowed;background:transparent;color:var(--v,#49454f);
      }
      [data-hamburger-menu] #settings-menu-button:disabled .material-symbols-rounded {color:inherit;}
`;
  if (!menu.includes('</style>')) throw new Error('Menu styles missing');
  menu = menu.replace('</style>', styles + '\n    </style>');
}
await writeFile(menuFile, menu);
console.log('Commented out the inline flag notice and added Settings coming-soon placeholders to both navigation components.');
