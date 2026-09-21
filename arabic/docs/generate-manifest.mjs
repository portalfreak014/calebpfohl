import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const docsDirectory = dirname(scriptPath);
const manifestPath = join(docsDirectory, 'manifest.json');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  }));
  return files.flat();
}

function firstParagraph(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const paragraph = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```') || trimmed.startsWith('|')) {
      if (paragraph.length) break;
      continue;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) continue;
    paragraph.push(trimmed);
  }

  return paragraph.join(' ').slice(0, 220);
}

function documentMetadata(path, markdown) {
  const relativePath = relative(docsDirectory, path).split(sep).join('/');
  const heading = markdown.match(/^#\s+(.+)$/m);
  const fileName = relativePath.replace(/\.md$/i, '').split('/').pop();
  const section = relativePath.includes('/') ? relativePath.split('/')[0] : 'Core';

  return {
    path: relativePath,
    title: heading ? heading[1].trim() : fileName.replace(/[-_]/g, ' '),
    summary: firstParagraph(markdown),
    section
  };
}

const paths = await walk(docsDirectory);
const markdownPaths = paths
  .filter(path => extname(path).toLowerCase() === '.md')
  .sort((a, b) => a.localeCompare(b));

const documents = await Promise.all(markdownPaths.map(async path => {
  const markdown = await readFile(path, 'utf8');
  return documentMetadata(path, markdown);
}));

const manifest = {
  generatedAt: new Date().toISOString(),
  documents
};

await mkdir(docsDirectory, { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${relative(process.cwd(), manifestPath)} with ${documents.length} documents.`);
