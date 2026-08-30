const SITES = {
  legallyspeaking: 'https://legallyspeakingpodcast.com/',
  madamedevaux: 'https://madamedevaux.com/',
  arabic: 'https://calebpfohl.com/arabic'
};

const MAX_HTML_BYTES = 1_000_000;
const MAX_IMAGE_BYTES = 5_000_000;
const TIMEOUT_MS = 8_000;

function decodeHtml(value = '') {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);?/g, (_, decimal) =>
      String.fromCodePoint(parseInt(decimal, 10))
    )
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

  while ((match = pattern.exec(tag))) {
    values[match[1].toLowerCase()] = match[3];
  }

  return values;
}

function meta(html, names) {
  const wanted = new Set(names.map(name => name.toLowerCase()));
  const tags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const attrs = attributes(tag);
    const key = (attrs.property || attrs.name || '').toLowerCase();

    if (wanted.has(key) && attrs.content) {
      return decodeHtml(attrs.content.trim());
    }
  }

  return '';
}

async function fetchLimited(url, maxBytes, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Missing upstream response body');
    }

    const chunks = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > maxBytes) {
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

    return { response, bytes };
  } finally {
    clearTimeout(timer);
  }
}

async function getPreview(site) {
  const url = SITES[site];

  if (!url) {
    throw new Error('Unknown portfolio site');
  }

  const { bytes } = await fetchLimited(url, MAX_HTML_BYTES, {
    accept: 'text/html,application/xhtml+xml',
    'user-agent': 'CalebPfohlPortfolioPreview/1.0'
  });

  const html = new TextDecoder().decode(bytes);

  const rawImage = meta(html, [
    'og:image',
    'twitter:image',
    'twitter:image:src'
  ]);

  let image = '';

  try {
    const candidate = new URL(rawImage, url);

    if (/^https?:$/.test(candidate.protocol)) {
      image = candidate.href;
    }
  } catch {}

  const fallbackTitle = decodeHtml(
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
      .replace(/<[^>]*>/g, '')
      .trim()
  );

  return {
    site,
    url,
    title: meta(html, ['og:title', 'twitter:title']) || fallbackTitle,
    description: meta(html, [
      'og:description',
      'twitter:description',
      'description'
    ]),
    image
  };
}

export default async request => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        Allow: 'GET',
        'content-type': 'application/json'
      }
    });
  }

  const requestUrl = new URL(request.url);
  const site = requestUrl.searchParams.get('site');
  const wantsImage = requestUrl.searchParams.get('image') === '1';

  if (!SITES[site]) {
    return new Response(JSON.stringify({ error: 'Unknown portfolio site' }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  }

  try {
    const preview = await getPreview(site);

    /*
     * JSON mode:
     * /.netlify/functions/link-preview?site=legallyspeaking
     */
    if (!wantsImage) {
      return new Response(JSON.stringify(preview), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control':
            'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    }

    /*
     * Image mode:
     * /.netlify/functions/link-preview?site=legallyspeaking&image=1
     *
     * This fetches the source page's og:image server-side and returns
     * its image bytes from your own Netlify domain.
     */
    if (!preview.image) {
      return new Response(null, {
        status: 404,
        headers: {
          'cache-control': 'public, max-age=300'
        }
      });
    }

    const { response, bytes } = await fetchLimited(
      preview.image,
      MAX_IMAGE_BYTES,
      {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'user-agent': 'CalebPfohlPortfolioPreview/1.0'
      }
    );

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
      return new Response(null, {
        status: 415,
        headers: {
          'cache-control': 'public, max-age=300'
        }
      });
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control':
          'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch {
    return new Response(JSON.stringify({
      error: 'Preview unavailable',
      site,
      url: SITES[site]
    }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300'
      }
    });
  }
};
