# Shared UI, theme persistence, and build preparation

Recorded: 2026-11-16. Scope: the changes made in this session on `main`. Code was committed; production deployment, browser rendering, account sync, and accessibility have not been end-to-end verified.

## Files and responsibilities

| File | Responsibility |
|---|---|
| `arabic/hamburger-menu.js` | Shared drawer, disabled Progress item, theme loader, and automatic pill initialization/styles. |
| `arabic/pill-nav.js` | Four pill links, exclusive responsive navigation, resize focus handling, and scroll scaling. |
| `arabic/scrollup.js` | Reusable fading scroll-to-top button. |
| `arabic/theme.js` | Theme tokens, visible toggle where a menu button exists, browser persistence, and Firebase account preferences. |
| `arabic/footer.js` | Reusable credits and unofficial-affiliation disclaimer. |
| `scripts/prepare-arabic.mjs` | Early inline theme initialization/styles, font loading configuration, and study-page integration at build time. |
| `scripts/prepare-footer.mjs` | Replaces the homepage inline footer with the reusable footer include at build time. |
| `netlify.toml` | Build command, existing redirects, and Arabic cache headers. |

## Footer and credits

The homepage initially received an inline footer crediting Caleb Pfohl, Perplexity Pro, and Google's Material Design 3. It states that this is an independent, unofficial resource, not affiliated with, endorsed by, or sponsored by the U.S. Army, Presidio of Monterey, DLIFLC, Department of Defense, or another government agency. The same wording now lives in `arabic/footer.js`.

Include it on a page inside `arabic/` using:

```html
<div data-study-footer></div>
<script src="footer.js" defer></script>
```

Adjust the script path for another directory. The placeholder controls placement. The script supports multiple placeholders and avoids rendering a placeholder twice. For dynamically added placeholders, call `window.StudyFooter.render()` after insertion. Colors inherit the site's light/dark variables, with fallbacks. Other pages are not automatically given the footer.

The repository's homepage source still contains its original inline footer. `prepare-footer.mjs` replaces that footer and adds the script tag in the deployed build output. Edit `footer.js` for future shared wording changes. If changing/removing the legacy homepage footer, also review the build helper's matching assertion.

## Responsive navigation

- Below 700 CSS pixels: pill visible; regular menu button/drawer hidden after pill initialization.
- At 700 CSS pixels and above: pill hidden; regular menu available.
- Links: Home, Glossary, Flashcards, Match. The pill scales from 100% to 70% over the first 150 pixels of scrolling. Reduced-motion preferences disable its transition.
- Resizing to mobile closes an open drawer. Focus moves away from navigation that becomes hidden.
- `hamburger-menu.js` creates a missing `data-pill-nav` container and loads `pill-nav.js` after DOM readiness if a pill has not already rendered. This fixes the glossary without an HTML-specific include. Its shared styles supply the pill appearance and mobile bottom clearance. If loading fails, the regular menu remains available.
- Pages without the shared menu are not automatically given navigation; flashcards and quizzes remain focused study pages.
- Progress is disabled, greyed out, and labeled `Progress (Coming soon)` in the shared drawer.

Known tradeoff: the four-link mobile pill does not include Roots, Docs, or Google login/logout. Hiding the drawer also hides those drawer-only actions on mobile. Additional access needs a separate design change; it was not implemented in this session.

## Scroll-to-top

`scrollup.js` is included directly by `arabic.html` and `glossary.html`. To use it elsewhere:

```html
<script src="scrollup.js" defer></script>
```

The button fades/slides in when `window.scrollY` exceeds 80 pixels, and hides near the top. Override the threshold with `data-threshold="160"` on the script. It is 48 by 48 pixels, bottom-right, with a 20-pixel desktop bottom offset plus safe-area inset. Below 699.98px its bottom offset is 92 pixels plus safe-area inset to clear the pill.

It uses a Shadow DOM, an accessible label, hidden-state tab/disabled handling, a passive scroll listener, animation-frame batching, and duplicate-button protection. Clicking scrolls to the top smoothly unless reduced motion is requested. The script scrolls the document, not nested scroll containers.

## Theme and persistence

`theme.js` applies shared dark color variables for the homepage/glossary token names. The build also supplies study-page aliases (`--surface-low`, `--on-surface`, and `--variant`) and targeted card/button overrides.

A 44px toggle is inserted beside `[data-menu-button]`. Flashcards and vocabulary quizzes receive `data-theme-controls="off"` and `data-firebase-auth-ui="off"` during the build, load `theme.js`, and inherit the theme/account integration without a visible theme toggle or auth panel.

Browser storage keys:

| Key | Purpose |
|---|---|
| `uad-theme-guest` | Explicit signed-out preference. |
| `uad-theme:{uid}` | Cached preference for one Firebase user. |
| `uad-theme-pending:{uid}` | Account preference awaiting a successful cloud save. |
| `uad-theme-last-rendered` | Last rendered theme for early startup; written by the build-patched runtime. |

Without a saved choice, the system color preference supplies the default. Storage failures are caught, so theme switching still works for that page, but persistence cannot be guaranteed when browser storage is unavailable or cleared. Same-origin storage events update the visible theme in other tabs.

Account preferences use `users/{uid}/progress/preferences` with `theme` and `updatedAt`, separate from learner progress at `users/{uid}/progress/current`. The existing Firebase client exports are reused; no Admin SDK or new credentials were added. The repository's documented owner-only `users/{uid}/progress/{document=**}` rule covers this path, but deployed rules were not checked or changed.

At sign-in, a new user choice made while loading takes priority, then a pending local account save, then the remote theme; an account without a remote preference starts with the current mode. Writes merge only theme fields into the separate preferences document. Failures show a status message and retain pending local state; writes retry on the browser's online event. Remote preferences are read on auth initialization, not continuously subscribed across devices.

## Build-time startup and fonts

Netlify runs:

```sh
node scripts/prepare-arabic.mjs && node scripts/prepare-footer.mjs
```

`prepare-arabic.mjs` transforms the published HTML and theme runtime in the build workspace; it does not commit the generated output back to GitHub. It processes non-archived HTML under `arabic/` that uses the shared menu, plus `flashcards.html` and `quiz.html`; directories named `old` are skipped.

The helper inlines theme selection/styles after the charset declaration, before body rendering. It uses the last rendered browser mode, then the guest preference, then the system preference. Account preferences are still reconciled after Firebase initializes. A first visit on a new browser cannot know a remote account preference before it is fetched.

Text Google Fonts requests use `display=optional`: on a slow first load, a fallback font may remain for that visit instead of swapping visibly later. Material Symbols use a separate `display=block` request, and their spans remain hidden until the icon font loads, preventing raw ligature text such as `menu` from flashing. A failed icon-font request can leave those icons hidden.

The theme build patches depend on expected source strings in `theme.js`. They intentionally fail the build if those strings change unexpectedly. When refactoring the theme, update the build integration too. Local previews must run the build helpers to reproduce the published behavior.

## Caching

`/arabic/*` receives `Cache-Control: public, max-age=0, must-revalidate`. Responses may be stored, but stale responses must be revalidated before reuse; this is not cache-first/offline operation. No service worker, offline cache, or custom Google Fonts cache was added. External font/Firebase requests retain their own server caching rules. Browser theme storage is independent of Google login. Existing `/areastudies` and `/arabic` redirects were retained.

## Deferred content request

Unit 10 was inspected but not enabled, at the user's request after the findings. `unit10-glossary.md` was a placeholder, `unit10.json` had no chapters, and the inspected chapter 46 vocabulary file was empty. No vocabulary was invented and no Unit 10 availability flags were changed.

## Verification checklist (not yet completed)

- Run both build helpers in a clean checkout; confirm all generated pages and inspect the diff.
- Check homepage/glossary at 699px, exactly 700px, and wider; resize with the drawer open.
- Confirm mobile links, footer clearance, keyboard navigation, dark-mode contrast, and drawer-only action limitations.
- Check scroll-to-top at the threshold, after returning to the top, and with reduced motion.
- Check light/dark persistence as guest, signed-in user, another account, after sign-out, and on another browser/device.
- Test slow/offline Firebase and blocked storage; confirm failures do not prevent studying.
- Verify flashcard picker, both card faces, overlays, quiz inputs/choices/feedback, and no study-page toggle.
- Test cold/warm loads, slow fonts, missing icon fonts, and no unintended theme flash on ordinary same-account navigation.
- Confirm Netlify deployment/build success and actual response cache headers.
- Check footer content occurs once on the published homepage and that a second page can reuse the include.
