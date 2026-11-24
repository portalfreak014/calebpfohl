# Shared UI, theme persistence, and build preparation

Updated 2026-11-23. This reconciles committed source through `2107e4e`; it supersedes this page's earlier two-step build, scroll-scaling, four-item-only pill, and flashcards-without-navigation descriptions. Production deployment, full build, browser rendering, account sync, and accessibility have not been end-to-end verified.

## Files and responsibilities

| File | Responsibility |
|---|---|
| `arabic/hamburger-menu.js` | Shared drawer, disabled Progress item, theme loader, and automatic pill initialization/styles on shared-menu pages. |
| `arabic/pill-nav.js` | Shared pill links, responsive exclusivity, direction-aware scroll visibility, resize/focus handling, and scoped `pill-nav:reset` listener. |
| `arabic/flashcards-pill.js` | Hides/inerts the flashcard pill while a deck overlay is open and restores/resets it on return to the picker. |
| `arabic/scrollup.js` | Reusable fading scroll-to-top button. |
| `arabic/theme.js` | Theme tokens, menu-adjacent toggle where permitted, browser persistence, and Firebase account preferences. |
| `arabic/footer.js` | Reusable credits and unofficial-affiliation disclaimer. |
| `arabic/glossary-quiz.js` | Compact chapter actions, glossary column/audio-lane CSS, and fragment restoration after rendering. |
| `arabic/speak.js` | Existing glossary/quiz speech behavior and compact outlined glossary audio buttons. |
| `netlify.toml` | Executable preparation order, existing redirects, and Arabic cache headers. |

## Footer and credits

The homepage credits Caleb Pfohl, Perplexity Pro, and Google's Material Design 3. The disclaimer states that the site is independent/unofficial and not affiliated with, endorsed by, or sponsored by the U.S. Army, Presidio of Monterey, DLIFLC, Department of Defense, or another government agency. Shared wording lives in `arabic/footer.js`.

```html
<div data-study-footer></div>
<script src="footer.js" defer></script>
```

The placeholder controls placement; adjust script paths outside `arabic/`. Multiple placeholders are supported without double rendering. After inserting placeholders dynamically, call `window.StudyFooter.render()`. Colors inherit theme variables with fallbacks. Other pages do not automatically receive this footer.

Homepage source still has its legacy inline footer; `prepare-footer.mjs` replaces it and adds the script in build output. Edit `footer.js` for shared wording and review the helper's source assertion if refactoring the legacy footer. Glossary branding does not remove or rewrite its existing footer.

## Responsive and direction-aware navigation

- Below 700 CSS pixels: the initialized pill is visible unless scroll/deck state hides it; regular shared menu button/drawer are hidden.
- At 700px and above: the pill is hidden and an existing regular menu can be used. A page without a menu does not acquire one simply by loading the pill.
- Runtime source lists Home, Glossary, Flashcards, Match. Build preparation adds a fifth, disabled Settings item with Coming soon text. The shared drawer also has disabled Settings and Progress placeholders.
- `60cfd7d` replaced scroll scaling: retain the original pill size, hide after downward movement, reveal after upward movement, use an 8px accumulated threshold per direction, and keep it visible near the top. Hidden navigation is inert/aria-hidden and cannot intercept taps. Tab reveals it; visible keyboard focus prevents scroll hiding. Reduced motion disables its transition.
- Resizing to mobile closes an open shared drawer; focus moves away from controls that become hidden.
- `hamburger-menu.js` creates a missing pill container and loads `pill-nav.js` after DOM readiness if needed, supplying shared appearance/bottom clearance. If automatic loading fails, the normal menu remains available.
- The flashcard picker is now an explicit exception to the older study-page exclusion: its prepared HTML gets the pill directly. Any open deck hides the entire root with hidden/inert/aria-hidden; returning dispatches `pill-nav:reset`. The observer uses the deck overlay's `is-open` class, covering course/community decks and deep links. Details are in [Flashcards](flashcards.md).
- Quizzes remain focused study pages without this new picker pill. Flashcards still have no newly added desktop menu.

Known limitation: the mobile pill does not expose Roots, Docs, or Google login/logout. Hiding the drawer hides those drawer-only actions on mobile. Disabled Settings is not a functioning alternate route. No broader mobile account/navigation redesign is included.

## Glossary branding and table presentation

`2107e4e` adds `prepare-glossary-branding-and-flashcard-pill.mjs`. At build time it reads the prepared homepage header, substitutes Glossary for Home, scopes the matching header rules, and reuses theme-responsive Fursa icon styles/assets. It changes the browser title to `Glossary — Fursa | فرصة` and replaces the technical hero description with `Browse Arabic and English vocabulary by unit and chapter.` The glossary hero heading, search, chapter links/actions, vocabulary renderer, and footer remain intact; the homepage hero/CTA is not copied wholesale.

`e6d826b` adds glossary-only CSS in `glossary-quiz.js`: RTL table flow places the existing Arabic first column on the right and English on the left. Language-specific cell/header direction and text alignment are explicit. This is visual table placement, not a rewrite of Markdown column order, data keys, or DOM cell order. Existing column widths are retained.

Glossary audio styling in `speak.js` uses a 32px square target, 20px symbol, 1px theme-outline border, and 8px corner radius (`1c199da`). `1168c1b` changed margins to 8px on both inline sides. The later, more-specific glossary layout rule reserves 52px right padding only on audio-equipped Arabic cells: 12px edge + 32px button + 8px text gap. It overrides those margins to zero and positions every button 12px from the cell's right edge, vertically centered. Button placement no longer follows word length. Hover/focus styles and speech logic are unchanged. Search-generated tables receive the same scoped styles. A browser without speech support still gets the column layout but does not receive speech buttons from `speak.js`.

These styles are enhancements loaded through the prepared glossary's action script, not new vocabulary structure. Check narrow-screen wrapping, multiline cells, focus outline clipping, header alignment, and light/dark contrast before treating the layout as verified.

## Scroll-to-top

`scrollup.js` is included on the homepage, glossary, and flashcards. Reuse it with:

```html
<script src="scrollup.js" defer></script>
```

It fades/slides in above 80px document scroll; `data-threshold="160"` overrides that threshold. The 48px button sits bottom-right, with a 20px desktop offset plus safe area and 92px mobile offset below 699.98px to clear the pill. It uses Shadow DOM, an accessible label, hidden-state tab/disabled handling, passive scrolling, animation-frame batching, and duplicate protection. Scrolling is smooth unless reduced motion is requested. It targets document scrolling, not nested deck-overlay scrolling. The deck-aware pill controller does not redesign this separate widget.

## Theme and persistence

`theme.js` applies shared dark tokens for homepage/glossary names. Build preparation supplies study-page aliases (`--surface-low`, `--on-surface`, `--variant`) and targeted card/button overrides. A 44px toggle mounts beside `[data-menu-button]` where permitted. Flashcards and quizzes retain build-applied `data-theme-controls="off"` and `data-firebase-auth-ui="off"`, plus theme/account integration without visible theme/auth controls.

| Browser key | Purpose |
|---|---|
| `uad-theme-guest` | Explicit signed-out choice. |
| `uad-theme:{uid}` | One account's cached preference. |
| `uad-theme-pending:{uid}` | Account preference awaiting cloud save. |
| `uad-theme-last-rendered` | Last rendered mode for early startup, written by the build-patched runtime. |

Without a saved choice, system preference supplies the default. Theme storage failures are caught; switching can still work without guaranteed persistence. Same-origin storage events reconcile other tabs.

Account preferences use `users/{uid}/progress/preferences` with `theme` and `updatedAt`, separate from learner progress at `users/{uid}/progress/current`. Existing Firebase client exports are reused; no Admin SDK/credentials were added. The documented owner-only `users/{uid}/progress/{document=**}` rule covers this path, but deployed rules were not checked or changed.

At sign-in, priority is a user choice made while loading, then pending local account choice, then remote theme; an account without a remote choice starts with current mode. Writes merge only theme fields in the separate preferences document. Failures show status and retain pending local state; the online event retries writes. Remote preference reads occur at auth initialization, not as a cross-device continuous subscription.

## Current build pipeline

`netlify.toml` currently runs these eight helpers in order:

```sh
node scripts/prepare-fursa-assets.mjs &&
node scripts/prepare-fursa-home.mjs &&
node scripts/prepare-arabic.mjs &&
node scripts/prepare-glossary-quiz.mjs &&
node scripts/prepare-footer.mjs &&
node scripts/prepare-navigation.mjs &&
node scripts/prepare-chapter-flashcards.mjs &&
node scripts/prepare-glossary-branding-and-flashcard-pill.mjs
```

1. Extract Fursa logo/favicon assets and prepare asset references in the homepage helper.
2. Transform homepage branding, hero, and chapter-quiz CTA/anchor.
3. Install early theme/styles, font-request configuration, and study-page theme integration.
4. Install glossary manifest/actions and verified flag-attribution/retry/backend build transformations.
5. Replace homepage legacy footer with shared footer wiring.
6. Prepare quiz bottom controls/snackbar, inline-notice suppression, and Settings placeholders.
7. Install chapter flashcard homepage entry, deep links, and glossary-unit/return integration.
8. Copy homepage-derived glossary branding and flashcard pill base styles; add picker pill/controller includes.

These helpers change the build workspace, not committed generated HTML. The final helper depends on prepared homepage markup/CSS and earlier navigation/deep-link preparation; changing those sources requires reviewing its regex/source assertions. Marker guards are intended to avoid duplicate installation. Full clean/repeated build success has not been recorded. Earlier two-, three-, six-, and seven-step counts describe older states; this order supersedes them. `netlify.toml` remains authoritative.

`prepare-arabic.mjs` processes non-archived shared-menu HTML plus flashcards/quiz, skips directories named `old`, and places early startup after charset. Startup uses last-rendered browser mode, then guest choice, then system mode; account reconciliation follows Firebase initialization. A first visit cannot know an unfetched remote account preference.

Text font requests use `display=optional`, so a fallback may remain on a slow first visit. Material Symbols use separate `display=block` requests; spans stay hidden until readiness to avoid raw ligature flashes. Failed icon-font loading may leave icons hidden. No custom font cache or offline worker was added. Local previews must run the full preparation chain to reproduce published behavior.

## Caching and deferred content

`/arabic/*` uses `Cache-Control: public, max-age=0, must-revalidate`: storage is permitted, but stale responses require revalidation. This is not cache-first/offline operation. External Firebase/font services retain their own cache rules; browser theme storage is independent of login. Existing `/areastudies` and `/arabic` redirects are retained.

Unit 10 enablement was deferred after inspection found placeholder/empty glossary/JSON/chapter content. No vocabulary was invented and no Unit 10 flags were enabled by these UI changes.

## Pending verification

- Full clean build, repeat build, generated HTML/module inspection, and Netlify deployment/cache headers.
- Homepage/glossary/header icons at 699px, 700px, and desktop; drawer resizing, keyboard focus, disclaimer/footer preservation, mobile limitations.
- Flashcard picker pill visible/reset after return, hidden and unfocusable in all deck types/deep links, no unexpected desktop pill/menu, mobile content clearance.
- Glossary English-left/Arabic-right headers and rows, fixed audio lane, short/multiline entries, narrow widths, search results, outline/focus states, pronunciation, and unchanged chapter actions/returns.
- Scroll-to-top thresholds, reduced motion, and document-versus-overlay behavior.
- Guest/account/other-account/sign-out theme persistence, another browser/device, slow/offline Firebase, blocked storage, and unchanged progress.
- Cold/warm startup, slow/missing fonts/icons, actual iPhone behavior, both card faces and quiz directions/controls.

No security-rule deployment, account-sync verification, successful production build, or cross-browser validation is implied by this documentation update.
