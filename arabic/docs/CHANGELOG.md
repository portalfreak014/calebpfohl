# Changelog

## 2026-11-23

### Contextual flashcards, glossary layout, and branding

- `1102f7e`: added a separate compact homepage Flashcards section with collapsed unit rows/chapter chips and All sets; added compact glossary Quiz/Flashcards actions, chapter deep links, and validated glossary-unit/chapter returns. Ordinary entries retain picker return; glossary context does not restore search text/exact pixel offset and is not forwarded by the player's Take quiz link.
- `1c199da`: added subtle 1px rounded outlines to 32px glossary audio buttons, retaining 20px symbols and existing speech behavior.
- `1168c1b`: added inline spacing around those buttons after the user's screenshot showed text crowding.
- `e6d826b`: glossary-only CSS places English left and Arabic right, preserves language direction and existing column widths, and gives audio controls a fixed far-right lane with an 8px text gap. No Markdown/data/DOM cell reordering or pronunciation changes.
- `2107e4e`: added homepage-derived Fursa glossary top-bar branding with Glossary replacing Home, a branded browser title, and concise glossary introduction. Added the shared mobile pill to the prepared flashcard picker; any open deck hides/inerts the pill, and picker return restores/resets it. Existing mobile/desktop and scroll behavior remain; no new desktop flashcard menu.
- Current build has eight ordered helpers, ending with `prepare-chapter-flashcards.mjs` and `prepare-glossary-branding-and-flashcard-pill.mjs`. These counts supersede earlier historical pipeline descriptions; `netlify.toml` remains authoritative.
- Reconciled [Flashcards](features/flashcards.md), [Contextual chapter flashcards](features/chapter-flashcard-navigation.md), and [Shared UI and theme](features/shared-ui-and-theme.md), including stale Unit-8-only/JSON-loader and scroll-scaling descriptions, source/build ownership, return/navigation limitations, theme/footer constraints, and pending tests. These existing paths are already in the docs manifest; no discovery-path changes are needed.

Status: implementation commits succeeded. The user's screenshot showed the earlier outlined glossary buttons and spacing issue; it does not verify subsequent column alignment, branding, or pill behavior. Full clean/repeated build, deployment, browser/iPhone, responsive, accessibility, and regression checks remain pending. This reconciliation changes documentation only, not application/configuration/vocabulary/progress/security rules.

### Shared quiz bottom controls and pop-up spacing

- `c9b8d70`: moved the shared quiz audio button to the bottom-left and flag button to the bottom-right, around the center answer/continue action; retained Mark as known in the upper-right grid column.
- Added 44px square audio/flag targets and a flexible center button with 10px grid gaps. The same template covers Arabic-to-English, English-to-Arabic, chapter/unit quizzes, and written-answer mode without changing scoring, progress, audio eligibility, or reporting behavior.
- `150323a`: moved the existing snackbar into the bottom action area and anchored it above that row with a 12px offset plus existing row padding, centered responsive sizing, and text wrapping. Retained its ID, live-region attributes, text/timing, and animation; it now follows the row rather than remaining fixed to the viewport.
- Both transformations are owned by the existing final build helper, `scripts/prepare-navigation.mjs`; generated quiz HTML is not committed back to source.
- Added implementation/maintenance notes and a cross-direction, responsive-layout, accessibility, and regression checklist to [Quiz Engine & Progress Store](features/quiz-engine-and-progress.md). Corrected that feature page's stale anonymous-only report description.

Status: implementation committed; the user's screenshot showed the first layout and overlapping snackbar. Full build execution, cross-mode testing, and final snackbar spacing verification remain pending. This documentation update changes no application code. The helper called final above was final at that time; later helpers are listed in the current build section linked above.

### Follow-up reconciliation and direction-aware pill

- `60cfd7d`: replaced scroll scaling in `arabic/pill-nav.js` with full-size stable visibility states: hide on downward movement, reveal on upward movement, threshold-based jitter protection, near-top visibility, reduced-motion support, and hidden-state interaction/accessibility handling.
- Added [November 23 implementation reconciliation](SESSION_RECONCILIATION_2026-11-23.md) to cover the prior branding/hero/CTA, theme-responsive icons and standalone-logo extraction, immediate quiz-choice audio, non-AI companion backlog, verified flag attribution/retry fixes, hidden inline notice, Settings placeholders, six-step build pipeline, and outstanding verification.
- Updated docs discovery to include the reconciliation and previously omitted branding, shared-UI, companion, and flag-attribution documents. The supplement explicitly supersedes earlier build, scroll-scaling, and notice-visibility descriptions while preserving historical entries.

Status: source changes committed; no full build or cross-browser verification was recorded. Deferred design discussion was intentionally excluded from documentation scope. The historical six-step count is superseded by the current eight-step pipeline.

### Documentation reconciliation

- Completed Project Compass with scope, page/navigation map, canonical file ownership, runtime dependencies, content sources, browser/Firebase state, preparation pipeline, and verification boundaries.
- Reconciled root and Arabic READMEs and the documentation index: Fursa is the approved replacement brand, not a claim that all live pages have migrated.
- Corrected authentication/community-flashcard status to acknowledge implementation in source without claiming verified production operation.
- Recorded the then-current three-step Netlify preparation chain, including glossary quiz preparation, and the prepared-output font-loading distinction.
- Linked existing feature references rather than creating another competing architecture document.
- Recorded remaining docs-manifest omissions and verification tasks. No manifest regeneration or application/deployment changes were included in that documentation reconciliation.

Status: documentation-only source reconciliation. No build execution, browser test, production deployment verification, or security-rule validation is implied. Later discovery updates and pipeline changes are recorded above.

## 2026-11-16

### Shared UI and theme

- Added homepage credits for Caleb Pfohl, Perplexity Pro, and Material Design 3, plus an unofficial/non-affiliation disclaimer; extracted reusable `arabic/footer.js` with homepage build integration.
- Disabled and greyed out the shared Progress menu item with a Coming soon label.
- Made pill navigation and the regular menu mutually exclusive at 700px; added automatic pill initialization/styles through `hamburger-menu.js` so the glossary participates without HTML-specific wiring.
- Updated `scrollup.js` with an 80px fade-in threshold, responsive bottom positioning, reduced-motion handling, and direct includes on the homepage and glossary.
- Added shared light/dark mode with a visible menu-adjacent toggle, local guest/account caches, and Firebase UID-scoped theme preferences separate from study progress.
- Extended build-time theme integration to flashcards and vocabulary quizzes without theme/auth controls.
- Added early theme initialization, optional text-font loading, icon-font readiness handling, and revalidation-based Arabic cache headers through the Netlify build pipeline.
- Investigated but deferred Unit 10 enablement because inspected source/data files were placeholders or empty. No content flags changed.
- Added [shared UI and theme maintenance notes](features/shared-ui-and-theme.md), including usage snippets, storage paths, build/source distinctions, known limitations, and a pending verification checklist.

Status: committed implementation; production deployment and end-to-end verification were not confirmed during this session. No Firestore rules were deployed.

## 2026-09-26

### Flashcards

- Added the Unit 8 flashcard picker and full-screen study overlay.
- Added Arabic-to-English card flipping, keyboard flip support, Previous/Next navigation, shuffle, and wraparound browsing.
- Added directional card-entry animation: Next enters from the right and Previous enters from the left.
- Added reduced-motion handling for flashcard and overlay transitions.
- Added **Take quiz** for built-in Unit 8 chapter decks. The action deep-links to the matching `quiz.html` unit/chapter query parameters.
- Added public community-deck loading, signed-in deck creation and immediate publishing, and owner-only deletion.
- Documented that community decks do not have quiz deep links and that editing remains a future enhancement.
