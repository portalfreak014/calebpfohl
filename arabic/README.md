# Arabic study application — Fursa rebrand in progress

Independent Arabic-learning tools and reference materials. This is an unofficial project, not affiliated with, endorsed by, or officially connected to DLIFLC, UAD, or the U.S. Department of Defense.

## Start here

- [Project Compass](docs/PROJECT_COMPASS.md): page map, ownership, dependencies, data, build behavior, and verification boundaries.
- [Documentation index](docs/README.md): feature references and status definitions.
- [Branding](docs/BRANDING.md): approved Fursa direction and rollout checklist.
- [Shared UI/theme](docs/features/shared-ui-and-theme.md): detailed UI and persistence behavior; its dated build command must be checked against current `../netlify.toml`.

## Branding status

Fursa | فرصة is the approved replacement for (Unofficial) UAD Study Companion. Use `Glossary · Fursa`-style titles when migrating pages. Existing page titles and visible branding may still use the old name; documentation does not establish production rollout completion. Preserve creator credits and unofficial-affiliation/content-rights notices. Keep technical APIs and storage keys stable unless a separate migration is approved.

## Entry points and maintenance

`arabic.html` is the study home. `glossary.html`, `flashcards.html`, `quiz.html`, `match.html`, `roots.html`, and `docs.html` provide the principal study/reference surfaces. Additional standalone HTML tools are inventoried in the Compass.

The shared menu can initialize pill navigation and load `theme.js`. Source HTML is not always deployed unchanged: run the preparation chain documented in the Compass to reproduce build-time integration. Never infer feature availability solely from a script's presence.

For vocabulary changes, read root `AGENTS.md`, `docs/GLOSSARY_WORKFLOW.md`, and the schema/template references first. Preserve Arabic Unicode and language/direction handling.
