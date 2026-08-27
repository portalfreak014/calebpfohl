const SITES = {
  legallyspeaking: 'https://legallyspeakingpodcast.com/',
  madamedevaux: 'https://madamedevaux.com/',
  arabic: 'https://calebpfohl.com/arabic'
};

const MAX_BYTES = 1_000_000;

function meta(html, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'));
    if (match) return (match[1] || match[2] || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  }
  return '';
}

async function page(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'text/html', 'user-agent': 'CalebPfohlPortfolioPreview/1.0' } });
    if (!response.ok) throw new Error('Upstream request failed');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error('Upstream response too large');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder().decode(bytes);
  } finally { clearTimeout(timer); }
}

export default async request => {
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { Allow: 'GET', 'content-type': 'application/json' } });
  const site = new URL(request.url).searchParams.get('site');
  const url = SITES[site];
  if (!url) return new Response(JSON.stringify({ error: 'Unknown portfolio site' }), { status: 400, headers: { 'content-type': 'application/json' } });
  try {
    const html = await page(url);
    const rawImage = meta(html, ['og:image', 'twitter:image', 'twitter:image:src']);
    let image = '';
    try { const candidate = new URL(rawImage, url); if (/^https?:$/.test(candidate.protocol)) image = candidate.href; } catch {}
    const fallbackTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]*>/g, '').trim();
    return new Response(JSON.stringify({ site, url, title: meta(html, ['og:title', 'twitter:title']) || fallbackTitle, description: meta(html, ['og:description', 'twitter:description', 'description']), image }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Preview unavailable', site, url }), { status: 502, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
  }
};
