# Interactive Docs Page (`arabic/docs.html`) ✅ Done

## Purpose

An in-browser, editable rendering of this documentation set (everything under `arabic/docs/`), styled to match `arabic.html`, so a visitor can browse and lightly edit the docs without going through GitHub. Requested 2026-08-24.

## What it is (and isn't)

- **Is:** a per-device, persistent personal copy. Edits save automatically (debounced) to this browser's `localStorage` under `arabicStudy.docs.v1.{docId}` keys — the same storage mechanism as `ProgressStore`, but a completely separate key namespace, so a bug in the docs editor can never corrupt quiz progress data.
- **Is not:** a shared, real-time, multi-user collaborative document (the original "Google Docs style" ask). That would require a live backend (a database plus either polling or a realtime sync protocol) — this site is deliberately local-first/backend-free everywhere else, and building shared real-time editing would be a meaningfully larger feature, closer in scope to Account Authentication than to a UI tweak.

## Features

- **Doc picker** — a grid of cards, one per doc (README, Changelog, and one card per feature file), each tagged "Done"/"Planned"/"Edited" (the last one appears once a visitor has made local edits to that doc).
- **Preview/Edit toggle** — Preview renders the Markdown (headings, tables, code fences, lists, bold/inline-code, links) via a small dependency-free renderer built for this page; Edit shows a raw textarea.
- **Reset to original** — discards local edits for the active doc and restores the published (default) content baked into the page.
- **Copy Markdown** — copies the current doc's raw source to the clipboard.
- **Banner note** — explicit on-page disclosure that edits are private to this device and won't sync or appear for other visitors.

## Data model

```js
// Per-doc override, keyed by doc id:
localStorage["arabicStudy.docs.v1.readme"] = "<edited markdown source>"
// Last-opened doc, for returning to where the visitor left off:
localStorage["arabicStudy.docs.v1.lastOpen"] = "readme"
```

Publishing an update to a doc's *default* content means editing the `content` string for that doc inside `docs.html` and committing — this does not touch any visitor's local override, since overrides live under their own key and are only ever read as a fallback-on-top-of-default.

## Rules

- Must never write into `ProgressStore` (`arabicStudy.profile.v1`) or the match-game progress namespace (`arabicStudy.matchProgress.v1.*`) — `docs.html` has its own separate `arabicStudy.docs.v1.*` namespace and must stay that way.
- The banner disclosure about local-only, non-shared edits must remain accurate; if real multi-user editing is ever added, it needs its own explicit feature doc and backend design, not a silent upgrade of this page's storage model.
- Publishing a default-content update to a doc must not discard a visitor's existing local override for that doc — overrides persist independently of default-content changes, by design (a visitor's override always wins over the shipped default once one exists).

## Testing checklist

- [x] Editing a doc and reloading the page shows the edited version, not the published default.
- [x] "Reset this page to original" restores the published default and removes the override.
- [ ] Copy Markdown correctly copies the exact current textarea content, including for docs containing tables and code fences.
- [ ] Verify no doc's default content accidentally contains an unescaped `</script>` sequence if any future doc content includes literal script-tag examples.
