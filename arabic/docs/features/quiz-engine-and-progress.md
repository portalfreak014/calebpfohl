# Quiz Engine & Progress Store

## Quiz Changes ✅ Done

`arabic/quiz.html` reads `unit`/`chapter`/`mode` from the URL, validates against the fetched JSON, renders questions with shuffled choice position, saves progress after each answer, and shows a completion screen with a next-chapter link. Also includes the "Mark as known" toggle and per-word recordAnswer wiring (see [known-vocabulary.md](known-vocabulary.md)), and the anonymous flag control (see [content-quality-control.md](content-quality-control.md)).

## Local-First Progress Store ✅ Done

`arabic/progress-store.js` exposes `window.ProgressStore` with `getProfile`, `saveProfile`, `getChapter`, `updateChapter`, `setLastActive`, `resetCurrentAttempt`, `recordAnswer`, `markWordKnown`, `markWordUnknown`, `isWordKnown`, `getKnownWordCount`, `getKnownWords`, `exportProfile`, `importProfile`, `mergeProfile`, `clearLocalProfile`. Stored under one versioned key, `arabicStudy.profile.v1`, with legacy-key migration and defensive parsing.

### Merge rules (for future account sync)

- `bestScore`: retain the higher value. `lastActivityAt`/`completedAt`: retain the most recent. `status`: completed > in-progress > not-started. `lastActive`: most recently updated available chapter. `knownWords`: merged monotonically per word (known status never reverts during a merge; streak takes the max). No personally identifying data belongs in the progress object.

## Quiz Direction Mode (English-to-Arabic) ✅ Done

`quiz.html?...&mode=en-to-ar` reverses the prompt/answer roles: the correct English meaning becomes the prompt, the Arabic word becomes the correct choice, and distractors are Arabic words sampled from other questions in the same chapter. Covers 100% of a chapter's vocabulary. Tracked as a separate `ProgressStore` record (`ch26:en-to-ar`) from the default direction. `lang`/`dir` attributes flip correctly between prompt and choices depending on direction.

## Known Issue: Quiz Does Not Resume from Saved Progress — Superseded

This issue, as originally described (resuming at a saved linear question index within a reshuffled session), is superseded by the Known Vocabulary (Mark as Known) feature. Per-word known tracking removes the need for session-position resumption entirely: a session can start fresh every time because progress is tracked per word, not per slot in a shuffled list. No fix to session-position resumption will be implemented; this is a deliberate design change, not an open bug.
