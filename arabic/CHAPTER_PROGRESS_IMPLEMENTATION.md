# Unit Navigation and Progress (Unit-Agnostic)

## Status Summary

Legend: ✅ Done and live on `main` | ⏳ Planned, not yet implemented

| Section | Status |
|---|---|
| Content Contract | ✅ Done |
| Units and Chapters Manifest | ✅ Done |
| Homepage Changes | ✅ Done |
| Quiz Changes | ✅ Done |
| Local-First Progress Store | ✅ Done (schema updated by Known Vocabulary section below) |
| Quiz Direction Mode (English-to-Arabic) | ✅ Done |
| Known Vocabulary (Mark as Known) | ✅ Done — supersedes prior resume-bug issue |
| Account Authentication (Google + Magic Link) | ⏳ Planned — intentionally sequenced after Known Vocabulary |
| Content Quality Control | ⏳ Planned |

## Purpose

This document describes the intended implementation for expanding the Arabic quiz experience from a Chapter 26-only entry point into an easy-to-navigate, multi-chapter experience — designed from the outset to be unit-agnostic. Adding a new unit later (Unit 7, Unit 8, etc.) should require adding a content file and a manifest entry, not new HTML pages or engine changes. It also defines a local-first learner-progress design that can later connect to Google, Apple, email/password, or another account provider without rewriting quiz logic.

The chapter navigation, progress, and English-to-Arabic direction work below has been merged to `main` and is live in production.

## Content Contract ✅ Done

Every unit's JSON file must conform to the same shape, regardless of subject matter.

```json
{
  "unitId": "unit6",
  "title": "Unit 6 Vocabulary",
  "chapters": {
    "ch26": { "number": 26, "title": "Chapter 26", "questions": [] }
  }
}
```

Rules: file location `arabic/data/{unitId}.json`; `chapters` keyed by chapter ID; `questions` array holds actual content; adding a unit requires no engine changes; the manifest is never a substitute for validating the fetched JSON.

## Units and Chapters Manifest ✅ Done

`arabic/data/units-manifest.js` holds `window.UNITS_MANIFEST`, keyed by unit ID, and a `window.UnitsManifest` helper API (`listUnits`, `getUnit`, `listChapters`, `getChapter`, `getAvailableChapters`, `getNextAvailableChapter`). All five Unit 6 chapters (`ch26`-`ch30`) are marked `available: true`.

## Homepage Changes ✅ Done

`arabic/arabic.html` has a chapter-card picker at `#unit6-chapters`, a Continue card reading from `ProgressStore`, and a global direction toggle (Arabic-to-English / English-to-Arabic) persisted in `localStorage` that updates chapter links, status badges, and the Continue card.

Note: the homepage's progress display will change from "X of Y questions answered" to "X of Y words known" once the Known Vocabulary section below ships. This homepage change is still outstanding — arabic.html has not yet been updated.

## Quiz Changes ✅ Done

`arabic/quiz.html` reads `unit`/`chapter`/`mode` from the URL, validates against the fetched JSON, renders questions with shuffled choice position, saves progress after each answer, and shows a completion screen with a next-chapter link. Now also includes the "Mark as known" toggle and per-word recordAnswer wiring (see Known Vocabulary section below).

## Local-First Progress Store ✅ Done

`arabic/progress-store.js` exposes `window.ProgressStore` with `getProfile`, `saveProfile`, `getChapter`, `updateChapter`, `setLastActive`, `resetCurrentAttempt`, `recordAnswer`, `markWordKnown`, `markWordUnknown`, `isWordKnown`, `getKnownWordCount`, `getKnownWords`, `exportProfile`, `importProfile`, `mergeProfile`, `clearLocalProfile`. Stored under one versioned key, `arabicStudy.profile.v1`, with legacy-key migration and defensive parsing.

### Merge rules (for future account sync)

- `bestScore`: retain the higher value. `lastActivityAt`/`completedAt`: retain the most recent. `status`: completed > in-progress > not-started. `lastActive`: most recently updated available chapter. `knownWords`: merged monotonically per word (known status never reverts during a merge; streak takes the max). No personally identifying data belongs in the progress object.

## Quiz Direction Mode (English-to-Arabic) ✅ Done

`quiz.html?...&mode=en-to-ar` reverses the prompt/answer roles: the correct English meaning becomes the prompt, the Arabic word becomes the correct choice, and distractors are Arabic words sampled from other questions in the same chapter. Covers 100% of a chapter's vocabulary. Tracked as a separate `ProgressStore` record (`ch26:en-to-ar`) from the default direction. `lang`/`dir` attributes flip correctly between prompt and choices depending on direction.

## Known Vocabulary (Mark as Known) ✅ Done

### Purpose

Replace the current chapter progress model ("12 of 65 questions answered," tied to a linear, reshuffled quiz session) with a per-word known/unknown model: "12 of 65 words known." This is a more meaningful and more durable signal than session position, and it directly resolves the resume-bug report below, since there is no session position to resume — known-word status persists independently of how any single quiz session is shuffled or interrupted.

This is learner-facing personalization data, distinct from the flag-a-question feature (which reports content problems to the site owner) and from `verified` (which tracks content-accuracy review). All three are per-question metadata, but serve different purposes and audiences, and none should be merged into one field or one storage location.

### Two-attempt confirmation rule

A word becomes known automatically only after being answered correctly on **two separate attempts with no incorrect answer in between**:

- Each word has a per-direction correct-streak counter, starting at 0.
- A correct answer increments that word's streak by 1.
- An incorrect answer resets that word's streak to 0, regardless of how high it was.
- When a word's streak reaches 2, it is marked known automatically.
- "Two separate attempts" means two distinct times the word was presented and answered — not two correct answers within the same instant, and not dependent on both attempts happening in the same session. A learner could get a word right today and right again next week and it becomes known at that point.
- A lucky single correct guess is deliberately insufficient to mark a word known. This is intentional: the two-attempt rule exists specifically so "known" reflects demonstrated retention, not a one-time guess.

### Manual override

Independent of the streak mechanism, a learner can manually mark a word as known (or unknown) at any time via a dedicated control, without needing to answer it correctly at all. This is useful for words a learner already knows from outside the app and does not want to be quizzed on repeatedly.

- Manually marking a word known sets its status to known immediately and does not require or reset the streak counter.
- Manually un-marking a known word (whether it became known via streak or manual override) resets it to not-known and resets its streak counter to 0.

### Per-direction tracking

Known-word status and streak counts are tracked independently per quiz direction, consistent with how chapter progress is already separated (`ch26` vs. `ch26:en-to-ar`). Knowing a word Arabic-to-English does not imply knowing it English-to-Arabic, since recognition and recall are different skills.

### Data model

Known-word status is learner-specific state and belongs in `ProgressStore`, never in the content JSON (`unit6.json` must never be modified per-learner) and never in the Google Sheet used for flags.

```js
units: {
  unit6: {
    chapters: {
      ch26: {
        // ...existing chapter progress fields (status, bestScore, etc.) unchanged...
        knownWords: {
          "عرض": { known: true, streak: 2, source: "streak" },
          "وقع": { known: true, streak: 0, source: "manual" },
          "مروحة": { known: false, streak: 1, source: null }
        }
      },
      "ch26:en-to-ar": {
        knownWords: { /* tracked completely independently from ch26 above */ }
      }
    }
  }
}
```

Rules:

- The word's `arabic` text is used as its identifier, consistent with the identifier already used for the flag-a-question feature. If a stable question ID is ever added to the Content Contract, both features should migrate to it together rather than diverging.
- `source` records how the word most recently became known (`"streak"` or `"manual"`), for transparency; it has no effect on quiz or scoring behavior.
- `knownWords` is additive to the existing chapter progress shape and does not replace `status`, `bestScore`, or any other existing field.

### Cutover: no retroactive grandfathering

Every learner starts at 0 known words under this system, including learners who had high scores under the old session-based model. This is a deliberate decision, not an oversight: the old model never recorded *which specific words* were answered correctly, only aggregate counts (`correctCount`, `bestScore`), so there is no way to accurately reconstruct per-word history. Rather than fabricate a starting known-count that might not reflect reality, the cutover is clean.

- The old `bestScore`, `attempts`, and `completedAt` fields are preserved and remain visible as a separate "past best score" stat, not deleted and not merged into the new known-word count.
- The homepage's chapter progress display switches from "X of Y questions answered" to "X of Y words known," reading from `knownWords`, once this feature ships. This homepage change is still outstanding.
- This should be communicated clearly in the UI at cutover (e.g. a brief note that known-word tracking is new and starts fresh) so a returning learner is not confused by a lower number than they remember.

### `ProgressStore` API additions ✅ Implemented

```js
window.ProgressStore = {
  // ...existing methods unchanged...
  recordAnswer(unitId, chapterId, wordId, wasCorrect),
  markWordKnown(unitId, chapterId, wordId),
  markWordUnknown(unitId, chapterId, wordId),
  isWordKnown(unitId, chapterId, wordId),
  getKnownWordCount(unitId, chapterId),
  getKnownWords(unitId, chapterId)
};
```

- `recordAnswer` is called by `quiz.html` after each question is checked, replacing direct manipulation of streaks from quiz code. It increments or resets the relevant word's streak and sets `known: true` with `source: "streak"` if the streak reaches 2.
- `markWordKnown` / `markWordUnknown` implement the manual override described above and always set `source` accordingly.
- Live on `main` in `arabic/progress-store.js`.

### Quiz behavior ✅ Implemented

- A "Mark as known" pill control sits next to the question kicker on the quiz screen, visually distinct from any future flag control so the two are never confused by a learner. Live on `main` in `arabic/quiz.html`.
- Not yet implemented: a "focus mode" that would let a quiz session start with already-known words excluded from that chapter's question set, in either direction. This remains a future additive option on top of the existing shuffle-and-render flow.
- Because there is no meaningful session position to resume (progress is per-word, not per-slot), a quiz session simply starts fresh each time. The prior plan to resume at a saved question index is retired; see the Known Issue section below, which this section supersedes.

### Rules

- Do not write known-word status to `unit6.json` or any content file. It is learner-specific and belongs only in `ProgressStore`.
- Do not merge known-word data with flag data or `verified` data. They serve different purposes and different audiences.
- A single correct answer must never, by itself, mark a word known. Two separate correct attempts with no incorrect answer between them are required, unless the manual override is used.
- Marking a word as known (by either path) must never affect `bestScore`, `status`, or other existing chapter-level progress fields.
- This feature requires no backend and works fully for anonymous, non-signed-in users, consistent with the rest of the local-first design. Once Account Authentication exists, known-word data syncs the same way the rest of the profile does, via the existing `mergeProfile` mechanism.
- Do not implement any form of retroactive grandfathering that infers per-word history from old aggregate scores. If old scores are surfaced at all, they must be clearly labeled as a separate, historical stat, not folded into the new known-word count.

### Testing checklist

- [ ] A word's streak increments on a correct answer and resets to 0 on an incorrect answer.
- [ ] A word becomes known only after two consecutive correct answers with no incorrect answer between them, not after one.
- [ ] Manually marking a word known sets it to known immediately, regardless of streak.
- [ ] Manually un-marking a word resets both `known` and `streak` to their initial state.
- [ ] Known-word counts and streaks for `ch26` and `ch26:en-to-ar` are tracked independently.
- [ ] A returning user with old `bestScore` data sees 0 known words at cutover, with the old score still visible separately, not blended into the new count.
- [ ] Focus mode (not yet built) correctly excludes known words without breaking the 100%-coverage guarantee of English-to-Arabic mode for the remaining words, once implemented.

This checklist has not yet been manually run against the live site; see Implementation Order step 8.

## Known Issue: Quiz Does Not Resume from Saved Progress — Superseded

This issue, as originally described (resuming at a saved linear question index within a reshuffled session), is superseded by the Known Vocabulary (Mark as Known) section above. Per-word known tracking removes the need for session-position resumption entirely: a session can start fresh every time because progress is tracked per word, not per slot in a shuffled list. No fix to session-position resumption will be implemented; this is a deliberate design change, not an open bug.

## Account Authentication (Google + Magic Link) ⏳ Planned

Intentionally sequenced after Known Vocabulary shipped and is manually verified, so `mergeProfile()` only needs to handle one finished profile shape rather than being updated twice.

### Purpose

Adds real sign-in via Google OAuth and passwordless magic-link email, so learners can access progress across devices. No passwords are ever stored. Backend logic runs as Node.js serverless functions via Netlify Functions, deployed from this same repository — there is no separate server to provision. Netlify Functions execute as standard Node.js; a file like `netlify/functions/auth-google-callback.js` with a normal `exports.handler` signature is Node code, run automatically through the same GitHub integration already deploying this site. This is unrelated to GitHub Actions (CI/CD scripts, not live endpoints) and requires no separate Node server or hosting account.

### Setup

- [ ] Google OAuth 2.0 client in Google Cloud Console; client ID/secret stored as Netlify environment variables, never committed.
- [ ] `netlify/functions/auth-google-callback.js` completes the OAuth flow and issues a session; the returned stable Google user ID becomes `profile.userId`.
- [ ] Magic-link: `netlify/functions/auth-magic-link-request.js` generates a signed, single-use, 15-minute-expiring token and sends it via a transactional email API (Resend/Postmark/SendGrid — provider chosen at build time); `netlify/functions/auth-magic-link-verify.js` validates it and issues a session.
- [ ] Sessions are a signed httpOnly cookie/token, never stored client-side as raw credentials. Signing out clears the session but preserves local `ProgressStore` data.
- [ ] Netlify DB (Postgres): a `users` table (user ID, auth method, email/Google ID, createdAt) and a `progress` table/column holding the synced profile.

### Sync behavior

On sign-in: fetch remote profile, call the existing `ProgressStore.mergeProfile(remoteProfile)` using the merge rules already defined above, persist the merged result, and sync every subsequent update with retry/offline handling that never blocks the quiz on failure.

### Rules

- No password-based auth. No secrets in client code, `localStorage`, or the repo — Netlify environment variables only. Sign-in is never required to use the quiz. Magic-link tokens are single-use and expiring. The existing `ProgressStore` API is not changed by this feature.

### Testing checklist additions

- [ ] Google sign-in creates a stable `users` record.
- [ ] Magic-link request/verify round-trip works; expired/used tokens fail with a clear message.
- [ ] Local progress made before sign-in merges correctly afterward, not overwritten.
- [ ] Signing out preserves local progress. The quiz remains fully usable for a user who never signs in.

## Content Quality Control ⏳ Planned

### Purpose

Tracks Arabic content accuracy and lets any user report a question they believe is wrong, without requiring sign-in.

### Content verification tracking

Optional `verified: true` field added to a question once a human has reviewed the word, meaning, and distractors. Absence means not-yet-verified, not incorrect. Not shown to learners at this stage.

### Flag-a-question feature

- [ ] A flag icon on the quiz screen, available regardless of sign-in status, with an optional reason (e.g. "Arabic looks wrong," "English meaning seems off"). Submitting never interrupts the quiz.
- [ ] Captures: unit/chapter/question identifier, reason, quiz mode, signed-in user ID or `anonymous`, timestamp.
- [ ] `netlify/functions/report-question-flag.js` appends a row to a Google Sheet via the Sheets API, using a dedicated Google service account (separate credential from OAuth), with the service account key and spreadsheet ID as Netlify environment variables. A Sheets API failure must not surface as a learner-facing error if the flag was otherwise durably queued.

### Rules

- Flagging never blocks the quiz and never requires sign-in. Flag data goes to the Sheet, never to `ProgressStore` or `localStorage`. Flags and verification status are never shown publicly to learners.

### Testing checklist additions

- [ ] Anonymous and signed-in flags both log correctly with the right identity marker.
- [ ] Flagging works identically in both quiz directions and records which was active.
- [ ] Flagging never disables the answer/next button.

## Implementation Order

1. [x] Add `data/units-manifest.js`.
2. [x] Add and manually test `progress-store.js` in isolation.
3. [x] Integrate the progress store and rendering engine into `quiz.html`.
4. [x] Add the homepage chapter picker and progress display, driven by `UnitsManifest`.
5. [ ] Manually test all chapters on mobile and desktop widths.
6. [x] Implement the English-to-Arabic direction mode.
7. [x] Implement the Known Vocabulary (Mark as Known) system: per-word streak tracking, manual override, and clean 0-based cutover, in progress-store.js and quiz.html. Homepage display change from question-count to known-word-count is still outstanding (arabic.html not yet updated).
8. [ ] Manually verify the known-word system on calebpfohl.com (streak increments/resets correctly, manual override works, per-direction independence, cutover shows 0 with old score preserved separately) before moving on.
9. [ ] Set up Netlify Functions scaffolding and the Google OAuth client; implement Google sign-in.
10. [ ] Implement magic-link email sign-in.
11. [ ] Set up Netlify DB and wire up profile sync for both sign-in methods, including the known-word fields.
12. [ ] Add the `verified` field convention and begin tracking verification status.
13. [ ] Implement the flag-a-question feature and Google Sheets logging.
14. [ ] Test account authentication, sync, and the flag feature per their checklists before opening a pull request.

## Guardrails

- Preserve the current Material-style mobile design and Arabic Unicode/`lang`/`dir` handling.
- Do not overwrite or regenerate `unit6.json` unless explicitly required and separately reviewed.
- Do not add authentication, tracking, analytics, or external services before this document specifies them.
- Prefer additive standalone modules over broad rewrites.
- No unit-specific or subject-specific logic in `quiz.html`, `progress-store.js`, or the manifest helper API.
- No quiz-direction-specific logic outside the single reversal function.
- No password-based login — Google and magic-link only. No secrets committed to the repository.
- Sign-in is never required to use the quiz or to flag a question.
- No public surfacing of flag data or verification status without a separate explicit decision.
- Backend failures (auth sync, flag logging) must fail gracefully, never blocking the quiz.
- Known-word status lives only in `ProgressStore`, never in content JSON, never merged with flag or `verified` data.
- No retroactive grandfathering of per-word history from old aggregate scores. A single correct answer never marks a word known on its own — two consecutive correct attempts, or a manual override, are required.
