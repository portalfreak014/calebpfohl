# Portfolio link previews

## Completed

The portfolio cards on the home page can now load lightweight link-preview metadata for:

- Legally Speaking Podcast (`legallyspeaking`)
- Madame Devaux (`madamedevaux`)
- Arabic resources (`arabic`)

The work was merged into `main` through pull request #11 with squash commit `44ed20854298fb8aa4ddac98708b90d0a6fa40d7`.

## Architecture

`netlify/functions/link-preview.js` is a Netlify Function that serves:

```
/.netlify/functions/link-preview?site=<allowed-site-key>
```

The function uses a fixed allowlist of the three portfolio destinations. It does not accept an arbitrary URL, which prevents the endpoint from being used as an open server-side request proxy.

For each allowed site, it fetches the configured page and returns JSON with its URL, title, description, and image when available. Metadata is read from Open Graph and Twitter tags, with the document title used as a title fallback.

## Safeguards

- `GET` requests only; other methods return HTTP 405.
- Unknown site keys return HTTP 400.
- Upstream fetches use an 8-second timeout.
- Upstream response bodies are limited to 1 MB.
- Only HTTP(S) preview-image URLs are returned.
- Successful responses are CDN-cacheable for one hour, with stale-while-revalidate enabled.
- Failed upstream requests return HTTP 502 and are cached briefly.

## Front-end behavior

Each supported `.work-card` has a `data-preview-site` attribute. On page load, the home page calls the Netlify endpoint for those cards. If preview metadata is available, the card title and description are refreshed and an Open Graph image is shown.

Existing card titles and descriptions remain in the HTML as progressive-enhancement fallbacks. If the endpoint, upstream site, or image is unavailable, visitors still see the original portfolio cards and can use their existing links.

## Deployment

The feature is on `main`; Netlify should publish it through the repository's normal main-branch deployment configuration. After deployment, verify each supported endpoint and confirm that unsupported `site` values return HTTP 400.
