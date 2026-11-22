import { readFile, writeFile } from 'node:fs/promises';
const file = 'arabic/glossary.html';
let html = await readFile(file, 'utf8');
for (const src of ['data/units-manifest.js', 'glossary-quiz.js']) {
  if (!html.includes('src="' + src + '"')) {
    if (!html.includes('</body>')) throw new Error('Glossary body closing tag missing');
    html = html.replace('</body>', '<script src="' + src + '" defer></script>\n</body>');
  }
}
await writeFile(file, html);
console.log('Prepared glossary chapter quiz actions.');
