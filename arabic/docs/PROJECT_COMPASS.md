# Project Compass

Documentation reconciliation: 2026-11-23. This is a source-level architecture map, not a production certification or exhaustive audit of every feature.

## Purpose and scope

Start here before planning or implementing Arabic study application changes. Follow the owning feature document for details, and inspect current code before making claims about deployment.

Canonical app repository: https://github.com/portalfreak014/calebpfohl/tree/main/arabic/

The repository also contains root-level pages and unrelated projects. This Compass covers `arabic/` and its shared/build integrations, not the behavior of every root page. Root `README.md` provides the repository boundary.

## Product identity

Approved replacement brand: Fursa | فرصة. See [BRANDING.md](BRANDING.md). Legacy UAD/Arabic Study names may remain during migration. Approved direction, committed assets, included assets, and verified live branding are separate states. Preserve disclaimers and creator credits; do not rename storage keys or APIs as cosmetic cleanup.

## Page and navigation map

Paths below are relative to `arabic/`. Listing a page does not imply that every menu exposes it or that it has been browser-tested.

| Page | Role |
|---|---|
| `arabic.html` | Study home and unit/chapter entry point. |
| `glossary.html` | Vocabulary reference and chapter-quiz entry actions. |
| `flashcards.html` | Course/community deck picker and full-screen card overlay. Built-in decks can deep-link to chapter quizzes. |
| `quiz.html` | Vocabulary quiz activity; accepts unit/chapter query parameters. |
| `match.html` | Matching activity; see its feature document for behavior. |
| `roots.html` | Root reference; consult the Freya root-chart document for editorial ownership. |
| `docs.html` | Documentation viewer; document discovery uses the docs manifest. |
| `ttt.html` | Listening/transcription tool; consult its feature document. |
| `U8_reading_review.html`, `hieroglyphics.html` | Additional standalone pages; do not assume shared integrations without checking their includes. |
| `old/` | Archived material; skipped by the Arabic preparation helper. |

Shared navigation has two surfaces: the regular drawer and a responsive four-link pill (Home, Glossary, Flashcards, Match). The documented breakpoint is 700 CSS pixels. Drawer-only destinations/actions, including Roots, Docs, and authentication, are not automatically represented in the mobile pill. Treat this as a known access/design limitation, not full navigation parity. Flashcards and quizzes are focused study pages rather than ordinary shared-menu pages.

## Canonical sources and file ownership

| Change | Start with |
|---|---|
| Human-maintained vocabulary / coverage | `../data/glossary/unit{N}-glossary.md`, root `AGENTS.md`, [workflow](GLOSSARY_WORKFLOW.md). |
| Structured vocabulary fields | `../data/templates/vocabulary-entry.template.json`, [schema](VOCABULARY_SCHEMA.md). |
| Chapter/unit availability | `../data/units-manifest.js` and [content contract](features/content-contract-and-manifest.md); verify supporting content before enabling. |
| Built/structured content | `../data/vocabulary/unit{N}/chapter{NN}.json`, `../data/unit{N}.json`; not authoritative glossary coverage. |
| Home and activity layout | The owning HTML page and feature document. |
| Drawer / responsive navigation | `../hamburger-menu.js`, `../pill-nav.js`. |
| Theme / startup | `../theme.js`, root `scripts/prepare-arabic.mjs`. |
| Authentication / progress | `../firebase-auth.js`, `../progress-store.js`, Firebase architecture docs. |
| Shared credits/footer | `../footer.js`, root `scripts/prepare-footer.mjs`; source homepage footer can be replaced during preparation. |
| Scroll-to-top | `../scrollup.js`; document scrolling, not nested overlay scrolling. |
| Pronunciation | `../speak.js`, `../flashcards-audio.js`, and page wiring. These are separate implementations; do not assume flashcards currently reuses speak.js. |
| Glossary quiz actions | `../glossary-quiz.js`, root `scripts/prepare-glossary-quiz.mjs`. |
| Favicons / branding assets | `../favicon.js`, `../assets/`, [branding](BRANDING.md). Script presence alone does not activate page integration. |
| Deployment | Root `netlify.toml` and preparation scripts. |
| Docs viewer discovery | `manifest.json`, `generate-manifest.mjs`; regenerate/verify after adding documents. |

Relative paths beginning `../` in this table refer to the Arabic app directory from this docs directory. Root paths are explicitly identified.

## Runtime relationships

1. HTML supplies layout and page-specific behavior.
2. Shared-menu pages load `hamburger-menu.js`, which loads the theme controller and can initialize pill navigation.
3. `theme.js` sets `html[data-theme]`, injects theme tokens, updates color-scheme/theme metadata, and adds a toggle beside `[data-menu-button]` where available.
4. `firebase-auth.js` supplies shared Firebase auth/database objects and account/progress integration. `theme.js` separately synchronizes theme preferences.
5. `favicon.js`, when included, observes `data-theme` and selects `assets/fursa-favicon-light.png` or `assets/fursa-favicon-dark.png`; absent an explicit theme it uses system preference. It does not decide the site's saved theme.
6. Footer, audio, and scroll scripts require appropriate page/build wiring. A shared script existing in the repository does not mean every page loads it.

The flashcard implementation inspected during reconciliation reads Markdown core/additional glossaries for manifest chapters and reads community decks from Firestore. Do not assume every activity has migrated to a single JSON pipeline; inspect each consumer before changing content contracts.

## Browser state and Firebase

- Guest theme: `uad-theme-guest`.
- Account theme cache: `uad-theme:{uid}`.
- Pending account theme write: `uad-theme-pending:{uid}`.
- Build-patched startup cache: `uad-theme-last-rendered`.
- Account theme document: `users/{uid}/progress/preferences`.
- Account learning-progress document: `users/{uid}/progress/current`.
- Local learning progress is owned by `ProgressStore`; consult its implementation before changing storage or migration rules.
- Community flashcards use the `communityFlashcards` collection. Owner checks in UI are not substitutes for deployed security rules.

Theme preference reads occur during auth initialization, not through a continuous cross-device subscription. Browser storage failures and cloud failures must not prevent study. See [shared UI/theme](features/shared-ui-and-theme.md) and [Firebase architecture](FIREBASE_PROGRESS_SYNC_AND_ACTIVITY_ARCHITECTURE.md). Deployed security rules were not verified in this reconciliation.

## Build and deployment: source differs from prepared output

Current `netlify.toml` preparation chain:

```sh
node scripts/prepare-arabic.mjs && node scripts/prepare-glossary-quiz.mjs && node scripts/prepare-footer.mjs
```

- `prepare-arabic.mjs` inserts early theme selection/styles, patches theme startup persistence, and adds theme integration to flashcards/quizzes with their theme/auth controls hidden. It processes shared-menu HTML and those study pages, excluding `old/`.
- It splits Google Fonts requests: text uses `display=optional`; Material Symbols uses `display=block` and readiness handling. Therefore a source link using `display=swap` may not describe the prepared page. Investigate this distinction when diagnosing fallback fonts.
- `prepare-glossary-quiz.mjs` ensures the glossary includes the units manifest and glossary-quiz action script.
- `prepare-footer.mjs` supplies shared homepage-footer integration; coordinate source/footer matching changes with that helper.
- Preparation modifies the build workspace; it does not itself commit transformed output to GitHub. Its expected-source-string assertions must be updated alongside relevant refactors.
- `/arabic/*` has revalidation-based cache headers in configuration. Inspect current redirect targets before changing URLs; configuration presence does not prove deployment success.

Run the preparation chain in a clean working copy to inspect generated changes and reproduce deployment behavior. Do not confuse a raw-file preview with prepared output. This reconciliation did not run the build or verify production headers/routes.

## Status and verification boundaries

- Implemented in inspected source: theme/local-account preference handling, authentication/progress integration, course/community flashcard logic, and the preparation chain.
- Fursa: approved design direction and committed assets/helper; page-by-page adoption and live behavior require verification.
- Known issue under investigation: reported initial flashcard font differs until inspection/resizing. Explicit font loading was suggested; neither user-applied changes nor a production fix are certified here.
- Unverified: full browser/mobile/accessibility testing, production build/deployment, cloud security rules, end-to-end account synchronization, and every page's optional helper includes.
- Future schema migrations and other roadmap items remain proposals unless current implementation and evidence establish otherwise.

Do not translate historical 'done' labels into 'verified live'. Historical notes reflect their recording date; for example, the November 16 Unit 10 deferral is not evidence of current unit availability.

## Decision rules and next steps

1. Preserve URLs, Arabic Unicode/lang/dir, accounts, progress, creator credits, and unofficial/content-rights notices.
2. Keep content, activity logic, learner state, and external services separate. Do not require sign-in for ordinary study.
3. Prefer focused additive changes; preserve internal UAD names/storage keys unless explicitly migrating them.
4. Finish Fursa page wiring and verify light/dark favicon behavior before marking rollout complete.
5. Reproduce the font issue using prepared output and cold/warm loads; verify the chosen fix without DevTools.
6. Audit navigation and shared helper coverage per page, especially mobile access and focused overlays.
7. Update the owning feature document, this Compass when architecture changes, the index when status changes, and the changelog for reconciliations/releases. Check the docs manifest when adding files.

## Detailed references

Start with [documentation index](README.md), [shared UI/theme](features/shared-ui-and-theme.md), [branding](BRANDING.md), [content contract](features/content-contract-and-manifest.md), [quiz/progress](features/quiz-engine-and-progress.md), [flashcards](features/flashcards.md), [community flashcards](features/community-flashcards.md), [matching](features/matching-game.md), and [root chart](features/freyas-root-chart.md). Read [content rights](../CONTENT_AND_RIGHTS.md) and [support policy](../SUPPORT_POLICY.md) before changing claims or distribution.
