# Arabic Study App — Documentation Index

Start with [Project Compass](PROJECT_COMPASS.md) for the canonical sources, architecture direction, decision rules, and current next steps. Use the feature documents below for detailed requirements and testing notes.

This directory replaces the single monolithic `CHAPTER_PROGRESS_IMPLEMENTATION.md` file. Each shipped feature has its own small, stable file; `README.md` and `CHANGELOG.md` serve as the index and dated record.

## Legend

✅ Done and live on `main` | ⏳ Planned, not yet implemented

## Status Summary

| Section | Status | Doc |
|---|---|---|
| Project Compass | ✅ Done | [PROJECT_COMPASS.md](PROJECT_COMPASS.md) |
| Content Contract | ✅ Done | [content-contract-and-manifest.md](features/content-contract-and-manifest.md) |
| Units and Chapters Manifest | ✅ Done | [content-contract-and-manifest.md](features/content-contract-and-manifest.md) |
| Homepage Changes | ✅ Done | [homepage.md](features/homepage.md) |
| Quiz Changes | ✅ Done | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) |
| Local-First Progress Store | ✅ Done | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) |
| Known Vocabulary | ✅ Done | [known-vocabulary.md](features/known-vocabulary.md) |
| Content Quality Control | ✅ Done | [content-quality-control.md](features/content-quality-control.md) |
| Account Authentication | ⏳ Planned | [account-authentication.md](features/account-authentication.md) |
| Unit 6 Supplementary Vocabulary | ⏳ Planned | [unit6-supplementary-vocab.md](features/unit6-supplementary-vocab.md) |
| Dynamic schema-driven quiz migration | ⏳ Planned | [PROJECT_COMPASS.md](PROJECT_COMPASS.md) |

## Purpose

The app is unit-agnostic: adding a unit should require a content file and manifest entry, not new HTML pages or quiz-engine changes. It uses local-first learner progress and can later connect to an account provider without rewriting quiz logic.

## Guardrails

- Preserve Material Design 3 styling and Arabic Unicode, `lang`, and `dir` handling.
- Check `arabic/data/templates/` before defining new vocabulary fields.
- Keep content, quiz rendering, learner progress, and external-service concerns separate.
- Prefer additive modules and compatibility adapters over broad rewrites.
- Do not make sign-in required for studying or flagging content.
- Keep secrets out of the repository and make backend failures non-blocking.
- Store known-word status only in `ProgressStore`, never in content JSON.
- Do not commit unreviewed vocabulary into a live content file.
- Keep all activity code unit- and subject-agnostic.

## Documentation Use

Read Project Compass first. Then consult the feature document that owns the area being changed, update that document when the architectural decision changes, and add a changelog entry for shipped work.
