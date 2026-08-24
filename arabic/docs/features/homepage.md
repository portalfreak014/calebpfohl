# Homepage (`arabic/arabic.html`)

## Homepage Changes ✅ Done

`arabic/arabic.html` has a chapter-card picker at `#unit6-chapters`, a Continue card reading from `ProgressStore`, and a global direction toggle (Arabic-to-English / English-to-Arabic) persisted in `localStorage` that updates chapter links, status badges, and the Continue card.

Note: the homepage's progress display will change from "X of Y questions answered" to "X of Y words known" once that display change ships. This homepage display change is still outstanding — arabic.html has not yet been updated for it. (This is separate from the Coming Soon and footer changes below, which are done.)

## Coming Soon states (Study Sets, Class Resources) ✅ Done

- The **Study Sets** section (all cards and the "View all" control) is intentionally inert: muted styling, `pointer-events: none`, `aria-disabled="true"`, and a visible "Coming soon" badge on each item.
- The **Class Resources** section (all cards across every group) is intentionally inert with the same treatment: muted styling, non-interactive, "Coming soon" badge, and no `target="_blank"` links until real URLs are ready.
- Card title/meta text uses `display: block` on `.study-title`, `.study-meta`, `.resource-title`, `.resource-meta` so text does not run together on narrow screens.
- Unit 6 chapter cards, the Continue card, the direction toggle, bottom navigation, and the navigation drawer are unaffected and remain fully active.
- This is a deliberate, temporary UI state, not a bug — these sections will be re-enabled once real study-set and class-resource content exists.

## Site attribution footer ✅ Done

- A short, centered footer sits at the bottom of `arabic/arabic.html`, above the fixed bottom navigation, using the existing muted on-surface-variant color and a top divider consistent with the Material-style design language already in use.
- Text: "Created by Caleb Pfohl · Designed with Google Material Design 3 · Built with Perplexity Pro".
- Purely presentational; does not affect `ProgressStore`, quiz logic, or any data model.
