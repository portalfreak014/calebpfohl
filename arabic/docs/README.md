# Arabic study application — Documentation index

Start with [Project Compass](PROJECT_COMPASS.md) for scope, page map, canonical sources, runtime dependencies, data paths, and build behavior. Approved brand: Fursa; migration is not assumed complete. See [BRANDING.md](BRANDING.md).

## Status vocabulary

- Implemented in source: code exists; not a claim of verified production operation.
- Approved/planned: direction or requirements, not proof of implementation.
- Unverified: deployment, security rules, browser behavior, or account flows not checked end to end.
- Historical: facts recorded at the document's date; recheck against current code.

## Architecture and feature references

| Area | Reference | Reconciled status / caveat |
|---|---|---|
| Site architecture | [Project Compass](PROJECT_COMPASS.md) | Source-level map reconciled 2026-11-23; not full production certification. |
| Branding | [BRANDING.md](BRANDING.md) | Fursa direction approved; page migration/integration requires verification. |
| Shared UI, navigation, theme, fonts | [shared-ui-and-theme.md](features/shared-ui-and-theme.md) | Implemented source and detailed limitations; use current Compass/netlify.toml for the expanded build chain. |
| Content/units manifest | [content-contract-and-manifest.md](features/content-contract-and-manifest.md) | Existing architecture reference; confirm actual consumer and availability. |
| Homepage | [homepage.md](features/homepage.md) | Feature reference; verify source versus prepared footer/theme output. |
| Quiz / local-first progress | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) | Implementation reference; not every roadmap migration is complete. |
| Known vocabulary | [known-vocabulary.md](features/known-vocabulary.md) | Feature reference; known status belongs in ProgressStore. |
| Content QC | [content-quality-control.md](features/content-quality-control.md) | Feature requirements/workflow; validate current wiring. |
| Authentication | [account-authentication.md](features/account-authentication.md), [setup](FIREBASE_GOOGLE_SSO_SETUP.md) | Authentication code exists; no longer accurately described as solely planned. Production verification separate. |
| Firebase progress | [architecture](FIREBASE_PROGRESS_SYNC_AND_ACTIVITY_ARCHITECTURE.md) | Source integration exists; cloud/account tests not certified here. |
| Firestore rules | [FIRESTORE_RULES_REFERENCE.md](FIRESTORE_RULES_REFERENCE.md) | Reference is not proof of deployed rules. |
| Flashcards | [flashcards.md](features/flashcards.md) | Course deck/study implementation exists; inspect current manifest rather than historical Unit 8-only notes. |
| Community flashcards | [community-flashcards.md](features/community-flashcards.md) | Load/publish/delete code exists; backend permissions and production behavior unverified here. |
| Matching | [matching-game.md](features/matching-game.md) | Feature reference; inspect current consumer before changing data. |
| Roots | [freyas-root-chart.md](features/freyas-root-chart.md) | Preserve editorial ownership; consult before architecture changes. |
| Listening/transcription | [ttt-listening-transcription.md](features/ttt-listening-transcription.md) | Feature-specific reference. |
| Docs viewer | [interactive-docs-page.md](features/interactive-docs-page.md) | Check manifest discovery when adding docs. |
| Supplementary vocabulary | [unit6-supplementary-vocab.md](features/unit6-supplementary-vocab.md) | Historical planning/reference; availability not re-audited here. |
| Schema-driven migration | [content-first-vocabulary-migration.md](features/content-first-vocabulary-migration.md), [schema](VOCABULARY_SCHEMA.md) | Architectural direction; do not assume all activities use one structured pipeline. |

## Maintenance rules

Read root `AGENTS.md` and [glossary workflow](GLOSSARY_WORKFLOW.md) before vocabulary work. Preserve Arabic Unicode, language/direction handling, URLs, accounts, and stored progress. Use `data/templates/` contracts; do not commit unreviewed vocabulary. Keep content, rendering, learner state, and external services separate; backend failure must not prevent ordinary study.

Update the owning document when behavior changes, the Compass when architecture changes, and [CHANGELOG.md](CHANGELOG.md) for dated changes. `manifest.json` supplies docs discovery; use `generate-manifest.mjs` and verify the result when adding documents. The inspected manifest omitted BRANDING.md and shared-ui-and-theme.md; this reconciliation updates existing files only and does not regenerate it.

Older feature documents and status claims must be read in their dated context. 'Implemented', 'deployed', and 'verified' are distinct claims.
