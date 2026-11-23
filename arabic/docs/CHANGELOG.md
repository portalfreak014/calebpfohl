# Changelog

## 2026-11-23

### Documentation reconciliation

- Completed Project Compass with scope, page/navigation map, canonical file ownership, runtime dependencies, content sources, browser/Firebase state, preparation pipeline, and verification boundaries.
- Reconciled root and Arabic READMEs and the documentation index: Fursa is the approved replacement brand, not a claim that all live pages have migrated.
- Corrected authentication/community-flashcard status to acknowledge implementation in source without claiming verified production operation.
- Recorded the current three-step Netlify preparation chain, including glossary quiz preparation, and the prepared-output font-loading distinction.
- Linked existing feature references rather than creating another competing architecture document.
- Recorded remaining docs-manifest omissions and verification tasks. No manifest regeneration or application/deployment changes are included in this documentation reconciliation.

Status: documentation-only source reconciliation. No build execution, browser test, production deployment verification, or security-rule validation is implied.

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
