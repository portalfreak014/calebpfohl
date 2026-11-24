import { readFile, writeFile } from 'node:fs/promises';

// Run after homepage branding, shared navigation, and chapter-link preparation.
const home = await readFile('arabic/arabic.html', 'utf8');
function requiredMatch(pattern, label) {
  const match = home.match(pattern);
  if (!match) throw new Error('Prepared homepage structure changed: ' + label);
  return match[0];
}
function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return requiredMatch(new RegExp(escaped + '\\s*\\{[^}]*\\}'), selector);
}
const header = requiredMatch(/<header class="top">[\s\S]*?<\/header>/, 'top bar');
if (!header.includes('<b>Home</b>') || !header.includes('fursa-header-mark')) throw new Error('Prepared Fursa header missing');
const headerRules = ['.top', '.brand', '.mark', '.brand p', '.brand b', '.icon', '.icon:hover'].map(selector => {
  const css = rule(selector);
  const scoped = selector === '.top' ? '#fursa-glossary-header' : '#fursa-glossary-header ' + selector;
  return css.replace(selector, scoped);
}).join('\n');
const iconRules = ['.fursa-header-mark', '.fursa-header-mark img', '.fursa-header-mark .fursa-icon-dark', 'html[data-theme=dark] .fursa-header-mark .fursa-icon-light', 'html[data-theme=dark] .fursa-header-mark .fursa-icon-dark'].map(rule).join('\n');
const glossaryFile = 'arabic/glossary.html';
let glossary = await readFile(glossaryFile, 'utf8');
if (!glossary.includes('id="fursa-glossary-header-styles"')) {
  const oldHeader = /<header class="topbar">[\s\S]*?<\/header>/;
  if (!oldHeader.test(glossary) || !glossary.includes('</head>')) throw new Error('Glossary header structure changed');
  const branded = header.replace('<header class="top">', '<header class="top" id="fursa-glossary-header">').replace('<b>Home</b>', '<b>Glossary</b>');
  glossary = glossary.replace(oldHeader, () => branded);
  glossary = glossary.replace(/<title>[^<]*<\/title>/, '<title>Glossary — Fursa | فرصة</title>');
  glossary = glossary.replace(/<p class="hero-copy">[\s\S]*?<\/p>/, '<p class="hero-copy">Browse Arabic and English vocabulary by unit and chapter.</p>');
  glossary = glossary.replace('</head>', `<style id="fursa-glossary-header-styles">
    #fursa-glossary-header {--v:var(--muted);--pc:var(--primary-container);--opc:var(--on-primary-container);margin-bottom:18px;}
    ${headerRules}
    ${iconRules}
  </style>\n</head>`);
  await writeFile(glossaryFile, glossary);
}

const flashFile = 'arabic/flashcards.html';
let flash = await readFile(flashFile, 'utf8');
if (!flash.includes('id="flashcards-pill-styles"')) {
  const navStyles = requiredMatch(/    \.nav \{[\s\S]*?(?=    :focus-visible)/, 'pill base styles');
  const symbols = rule('.material-symbols-rounded').replace('.material-symbols-rounded', '[data-pill-nav] .material-symbols-rounded');
  if (!flash.includes('</head>') || !flash.includes('</body>') || !flash.includes('id="deck-overlay"')) throw new Error('Flashcards layout structure changed');
  if (flash.includes('data-pill-nav') || /src=["']pill-nav\.js["']/.test(flash)) throw new Error('Flashcards already has pill integration; review before preparing');
  flash = flash.replace('</head>', `<style id="flashcards-pill-styles">
    ${navStyles}
    ${symbols}
    [data-pill-nav][hidden] {display:none!important;}
    @media(max-width:699.98px) {#app {padding-bottom:calc(132px + env(safe-area-inset-bottom));}}
  </style>\n</head>`);
  flash = flash.replace('</body>', '<div data-pill-nav hidden inert aria-hidden="true"></div>\n<script src="pill-nav.js" defer></script>\n<script src="flashcards-pill.js" defer></script>\n</body>');
  await writeFile(flashFile, flash);
}
console.log('Prepared homepage-matched glossary header and deck-aware flashcard pill.');
