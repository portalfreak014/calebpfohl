const SITES = {
  legallyspeaking: 'https://legallyspeakingpodcast.com/',
  madamedevaux: 'https://madamedevaux.com/',
  arabic: 'https://calebpfohl.com/arabic'
};

const MAX_BYTES = 1_000_000;
const TIMEOUT_MS = 8_000;

function decodeHtml(value = '') {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function attributes(tag) {
  const values = {};
  const pattern = /([\w:-]+)\s*=\s*(["'])(.*?)\2/g;
  let match;
  while ((match = pattern.exec(tag))) values[match[1].toLowerCase()] = match[3];
  return values;
}

function meta(html, names) {
  const wanted = new Set(names.map(name => name.toLowerCase()));
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs = attributes(tag);
    const key = (attrs.property || attrs.name || '').toLowerCase();
    if (wanted.has(key) && attrs.content) return decodeHtml(attrs.content.trim());
  }
  return '';
}

async function fetchLimited(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Missing upstream response body');
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new Error('Upstream response too large');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { response, text: new TextDecoder().decode(bytes) };
  } finally {
    clearTimeout(timer);
  }
}

async function usableImage(url) {
  if (!url) return '';
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'user-agent': 'CalebPfohlPortfolioPreview/1.0', accept: 'image/*' }
    });
    return response.ok && (response.headers.get('content-type') || '').startsWith('image/') ? response.url : '';
  } catch {
    return '';
  }
}

export default async request => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { Allow: 'GET', 'content-type': 'application/json' }
    });
  }

  const site = new URL(request.url).searchParams.get('site');
  const url = SITES[site];
  if (!url) {
    return new Response(JSON.stringify({ error: 'Unknown portfolio site' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const { text: html } = await fetchLimited(url, {
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'CalebPfohlPortfolioPreview/1.0' }
    });
    const rawImage = meta(html, ['og:image', 'twitter:image', 'twitter:image:src']);
    let candidate = '';
    try {
      const parsed = new URL(rawImage, url);
      if (/^https?:$/.test(parsed.protocol)) candidate = parsed.href;
    } catch {}

    const fallbackTitle = decodeHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]*>/g, '').trim());
    const image = await usableImage(candidate);

    return new Response(JSON.stringify({
      site,
      url,
      title: meta(html, ['og:title', 'twitter:title']) || fallbackTitle,
      description: meta(html, ['og:description', 'twitter:description', 'description']),
      image
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Preview unavailable', site, url }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }
    });
  }
};
