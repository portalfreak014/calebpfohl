import { readFile, writeFile } from 'node:fs/promises';

const file = 'arabic/arabic.html';
let html = await readFile(file, 'utf8');
if (!html.includes('data-study-footer')) {
  const footer = /<footer\b[^>]*>\s*<p\b[^>]*>Created by Caleb Pfohl with Perplexity Pro\.[\s\S]*?<\/footer>/;
  if (!footer.test(html)) throw new Error('Expected homepage credits footer was not found; review footer migration.');
  html = html.replace(footer, '<div data-study-footer></div>');
}
if (!/src=["'](?:\.\/)?footer\.js["']/.test(html)) {
  html = html.replace(/<\/body>/i, '<script src="footer.js" defer></script>\n</body>');
}
await writeFile(file, html);
