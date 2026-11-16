import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const themePath = 'arabic/theme.js';
let theme = await readFile(themePath, 'utf8');
const css = theme.match(/style\.textContent = `([\s\S]*?)`;/)?.[1];
if (!css) throw new Error('Cannot extract shared theme styles');

const originalMode = "let mode = valid(read(key)) ? read(key) : system.matches ? 'dark' : 'light';";
const cachedMode = "let mode = valid(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : valid(read(key)) ? read(key) : system.matches ? 'dark' : 'light';";
if (!theme.includes(cachedMode)) {
  if (!theme.includes(originalMode)) throw new Error('Theme startup changed; review build integration');
  theme = theme.replace(originalMode, cachedMode);
}
const originalApply = '    mode = value;';
const cachedApply = "    mode = value;\n    save('uad-theme-last-rendered', value);";
if (!theme.includes(cachedApply)) {
  if (!theme.includes(originalApply)) throw new Error('Theme apply function changed');
  theme = theme.replace(originalApply, cachedApply);
}
await writeFile(themePath, theme);

const studyCss = `
html[data-theme=dark] {
  --surface-low:#211f26!important;
  --on-surface:#e6e0e9!important;
  --variant:#cac4d0!important;
}
html[data-theme=dark] .chapter-icon {background:var(--primary-container);color:var(--on-primary-container);}
html[data-theme=dark] .community {border-top-color:var(--outline-variant);}
html[data-theme=dark] .button.tonal {color:var(--on-primary-container);}
html[data-theme=dark] .button.text {color:var(--primary);}
html[data-theme-controls=off] #uad-theme-toggle {display:none!important;}
`;

const boot = `<script id="uad-early-theme">
(() => {
  let saved = null;
  try {saved = localStorage.getItem('uad-theme-last-rendered') || localStorage.getItem('uad-theme-guest');} catch {}
  const mode = saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', mode === 'dark' ? '#141218' : '#6750a4');
    if (document.fonts) {
      document.fonts.load('24px "Material Symbols Rounded"', 'menu').then(faces => {
        if (faces.length) document.documentElement.classList.add('uad-icons-ready');
      }).catch(() => {});
    }
  }, {once:true});
})();
</script>
<style id="uad-early-theme-styles">${css}
${studyCss}
html:not(.uad-icons-ready) .material-symbols-rounded {visibility:hidden;}
</style>`;

function fontLinks(tag, href) {
  const url = new URL(href.replace(/&amp;/g, '&'));
  const families = url.searchParams.getAll('family');
  const icons = families.filter(value => value.startsWith('Material Symbols'));
  const text = families.filter(value => !value.startsWith('Material Symbols'));
  if (!families.length) return tag;
  return [[text, 'optional'], [icons, 'block']].filter(([list]) => list.length).map(([list, display]) => {
    const next = new URL(url);
    next.searchParams.delete('family');
    list.forEach(value => next.searchParams.append('family', value));
    next.searchParams.set('display', display);
    return '<link rel="stylesheet" href="' + next.href + '">';
  }).join('\n');
}

let count = 0;
async function prepare(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'old') await prepare(file);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    const studyPage = file === path.join('arabic', 'flashcards.html') || file === path.join('arabic', 'quiz.html');
    const sharedMenu = html.includes('hamburger-menu.js') && html.includes('data-hamburger-menu');
    if (!sharedMenu && !studyPage) continue;
    if (studyPage) {
      html = html.replace(/<html\b([^>]*)>/i, (tag, attrs) => {
        let updated = attrs.replace(/\sdata-theme-controls=(["']).*?\1/i, '').replace(/\sdata-firebase-auth-ui=(["']).*?\1/i, '');
        return '<html' + updated + ' data-theme-controls="off" data-firebase-auth-ui="off">';
      });
      if (!/src=["'](?:\.\/)?theme\.js["']/.test(html)) {
        html = html.replace(/<\/head>/i, '<script src="theme.js" defer></script>\n</head>');
      }
    }
    html = html.replace(/<script id="uad-early-theme">[\s\S]*?<\/script>\s*<style id="uad-early-theme-styles">[\s\S]*?<\/style>/, '');
    const charset = /<meta\s+charset=[^>]+>/i;
    if (charset.test(html)) html = html.replace(charset, match => match + '\n' + boot);
    else html = html.replace(/<head[^>]*>/i, match => match + '\n<meta charset="utf-8">\n' + boot);
    html = html.replace(/<link\b[^>]*href="(https:\/\/fonts\.googleapis\.com\/css2[^"]*)"[^>]*>/gi, fontLinks);
    await writeFile(file, html);
    count++;
  }
}
await prepare('arabic');
console.log('Prepared early theme and font loading for ' + count + ' Arabic pages.');
