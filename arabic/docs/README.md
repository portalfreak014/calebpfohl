# Arabic Study App — Documentation Index

This directory replaces the single monolithic `CHAPTER_PROGRESS_IMPLEMENTATION.md` file, which had grown too large (50KB+, 10+ incremental commits) to safely read and edit as one unit. Each shipped feature now has its own small, stable file; only `STATUS.md` and `CHANGELOG.md` change often, and both stay small by design.

## Legend
✅ Done and live on `main` | ⏳ Planned, not yet implemented

## Status Summary

| Section | Status | Doc |
|---|---|---|
| Content Contract | ✅ Done | [content-contract-and-manifest.md](features/content-contract-and-manifest.md) |
| Units and Chapters Manifest | ✅ Done | [content-contract-and-manifest.md](features/content-contract-and-manifest.md) |
| Homepage Changes | ✅ Done | [homepage.md](features/homepage.md) |
| Quiz Changes | ✅ Done | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) |
| Local-First Progress Store | ✅ Done (schema updated by Known Vocabulary) | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) |
| Quiz Direction Mode (English-to-Arabic) | ✅ Done | [quiz-engine-and-progress.md](features/quiz-engine-and-progress.md) |
| Known Vocabulary (Mark as Known) | ✅ Done — supersedes prior resume-bug issue | [known-vocabulary.md](features/known-vocabulary.md) |
| Content Quality Control (Anonymous Flagging) | ✅ Done — Google Sheets logging live on `main` | [content-quality-control.md](features/content-quality-control.md) |
| Homepage Coming Soon States (Study Sets, Class Resources) | ✅ Done — intentionally disabled pending future release | [homepage.md](features/homepage.md) |
| Site Attribution Footer | ✅ Done | [homepage.md](features/homepage.md) |
| Unit 6 Supplementary Vocabulary (sticky-note set) | ⏳ Planned — draft transcription in progress | [unit6-supplementary-vocab.md](features/unit6-supplementary-vocab.md) |
| Classmate Feedback & Feature Requests | ⏳ Planned — triage and scoping not yet started | [classmate-feedback.md](backlog/classmate-feedback.md) |
| Unit 7 (Chapters 31–32 Vocabulary) | ✅ Done — content, manifest, homepage picker live; Ch31 vocab gap-fill done 2026-08-24 | [unit7-vocabulary.md](features/unit7-vocabulary.md) |
| Picture Matching Game Mode | ⏳ Planned — foundational scaffolding requested 2026-08-24, blocked on source file access | [matching-game.md](features/matching-game.md) |
| Per-unit Vocab QC Lists | ⏳ Planned — requested 2026-08-24 | [vocab-qc-lists.md](features/vocab-qc-lists.md) |
| Account Authentication (Google + Magic Link) | ⏳ Planned — sequenced after Known Vocabulary | [account-authentication.md](features/account-authentication.md) |
| Mobile App Store Distribution (Google Play + Apple App Store) | ⏳ Planned — Play Store fee paid; Apple enrollment not started | [mobile-app-distribution.md](features/mobile-app-distribution.md) |
| Analytics (Google Tag Manager + GA4) | ✅ Done — GTM live; GA4 tag/Enhanced Measurement config still outstanding | [analytics.md](features/analytics.md) |

## Purpose

This documentation describes the intended implementation for expanding the Arabic quiz experience from a Chapter 26-only entry point into an easy-to-navigate, multi-chapter experience — designed from the outset to be unit-agnostic. Adding a new unit later (Unit 7, Unit 8, etc.) should require adding a content file and a manifest entry, not new HTML pages or engine changes. It also defines a local-first learner-progress design that can later connect to Google, Apple, email/password, or another account provider without rewriting quiz logic.

The chapter navigation, progress, English-to-Arabic direction, known-vocabulary, anonymous flagging, homepage Coming Soon states, and attribution footer work has been merged to `main` and is live in production.

## Guardrails (apply across all features)

- Preserve the current Material-style mobile design and Arabic Unicode/`lang`/`dir` handling.
- Do not overwrite or regenerate `unit6.json` unless explicitly required and separately reviewed.
- Do not add authentication, tracking, analytics, or external services before a doc specifies them.
- Prefer additive standalone modules over broad rewrites.
- No unit-specific or subject-specific logic in `quiz.html`, `progress-store.js`, or the manifest helper API.
- No quiz-direction-specific logic outside the single reversal function.
- No password-based login — Google and magic-link only. No secrets committed to the repository.
- Sign-in is never required to use the quiz or to flag a question. Flagging is anonymous-only; no identity field of any kind should be added to the flag payload.
- No public surfacing of flag data or verification status without a separate explicit decision.
- Backend failures (auth sync, flag logging) must fail gracefully, never blocking the quiz.
- Known-word status lives only in `ProgressStore`, never in content JSON, never merged with flag or `verified` data.
- No retroactive grandfathering of per-word history from old aggregate scores. A single correct answer never marks a word known on its own — two consecutive correct attempts, or a manual override, are required.
- Draft/unreviewed vocabulary (e.g. the sticky-note supplementary set) must never be committed into a file already live on `main` until the user has reviewed and corrected every entry.
- Every new chapter's questions must be authored in the correct `number`/`arabic`/`choices`/`answer` shape from the start — the Chapter 31 format bug should not recur.
- The mobile app store packaging effort must wrap the existing live site rather than fork it into a separately maintained codebase.
- Every current and future page under `arabic/` must carry the identical GTM container snippet if it should be included in analytics; this is not automatic.

## Why this split happened (2026-08-24)

The original single file (`CHAPTER_PROGRESS_IMPLEMENTATION.md`) grew past the point where it could be safely read back and edited via available GitHub tooling — reconstructing it required commit-diff replay, which works for small/young files but not for a 50KB+ file with a long incremental history. Splitting by feature keeps every file small and independently editable going forward. See `CHANGELOG.md` for the dated history of changes, and each feature file for its own status, rules, and testing checklist.
