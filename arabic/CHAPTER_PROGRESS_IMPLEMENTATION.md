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
| Content Quality Control (Anonymous Flagging) | ✅ Done — Google Sheets logging live on `main` |
| Homepage Coming Soon States (Study Sets, Class Resources) | ✅ Done — intentionally disabled pending future release |
| Site Attribution Footer | ✅ Done |
| Unit 6 Supplementary Vocabulary (sticky-note set) | ⏳ Planned — draft transcription in progress, not yet in a content file or wired into the site |
| Classmate Feedback & Feature Requests | ⏳ Planned — triage and scoping not yet started |
| Unit 7 (Chapters 31–32 Vocabulary) | ✅ Done — content, manifest, and homepage picker all live |
| Account Authentication (Google + Magic Link) | ⏳ Planned — intentionally sequenced after Known Vocabulary |
| Mobile App Store Distribution (Google Play + Apple App Store) | ⏳ Planned — Play Store developer fee paid; Apple Developer Program enrollment not yet started |
| Analytics (Google Tag Manager + GA4) | ✅ Done — GTM added to arabic.html and quiz.html; GA4 tag/Enhanced Measurement configuration in GTM console still outstanding |

## Purpose

This document describes the intended implementation for expanding the Arabic quiz experience from a Chapter 26-only entry point into an easy-to-navigate, multi-chapter experience — designed from the outset to be unit-agnostic. Adding a new unit later (Unit 7, Unit 8, etc.) should require adding a content file and a manifest entry, not new HTML pages or engine changes. It also defines a local-first learner-progress design that can later connect to Google, Apple, email/password, or another account provider without rewriting quiz logic.

The chapter navigation, progress, English-to-Arabic direction, known-vocabulary, anonymous flagging, homepage Coming Soon states, and attribution footer work below has been merged to `main` and is live in production.

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

Note: the homepage's progress display will change from "X of Y questions answered" to "X of Y words known" once that display change ships. This homepage display change is still outstanding — arabic.html has not yet been updated for it. (This is separate from the Coming Soon and footer changes below, which are done.)

### Coming Soon states (Study Sets, Class Resources) ✅ Done

- The **Study Sets** section (all cards and the "View all" control) is intentionally inert: muted styling, `pointer-events: none`, `aria-disabled="true"`, and a visible "Coming soon" badge on each item.
- The **Class Resources** section (all cards across every group) is intentionally inert with the same treatment: muted styling, non-interactive, "Coming soon" badge, and no `target="_blank"` links until real URLs are ready.
- Card title/meta text uses `display: block` on `.study-title`, `.study-meta`, `.resource-title`, `.resource-meta` so text does not run together on narrow screens.
- Unit 6 chapter cards, the Continue card, the direction toggle, bottom navigation, and the navigation drawer are unaffected and remain fully active.
- This is a deliberate, temporary UI state, not a bug — these sections will be re-enabled once real study-set and class-resource content exists.

### Site attribution footer ✅ Done

- A short, centered footer sits at the bottom of `arabic/arabic.html`, above the fixed bottom navigation, using the existing muted on-surface-variant color and a top divider consistent with the Material-style design language already in use.
- Text: "Created by Caleb Pfohl · Designed with Google Material Design 3 · Built with Perplexity Pro".
- Purely presentational; does not affect `ProgressStore`, quiz logic, or any data model.

## Quiz Changes ✅ Done

`arabic/quiz.html` reads `unit`/`chapter`/`mode` from the URL, validates against the fetched JSON, renders questions with shuffled choice position, saves progress after each answer, and shows a completion screen with a next-chapter link. Also includes the "Mark as known" toggle and per-word recordAnswer wiring (see Known Vocabulary section below), and the anonymous flag control (see Content Quality Control section below).

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
- The homepage's chapter progress display switches from "X of Y questions answered" to "X of Y words known," reading from `knownWords`, once this feature ships. This homepage display change is still outstanding.
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

- A "Mark as known" pill control sits next to the question kicker on the quiz screen, visually distinct from the flag control so the two are never confused by a learner. Live on `main` in `arabic/quiz.html`.
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

## Content Quality Control (Anonymous Flagging) ✅ Done

### Purpose

Tracks Arabic content accuracy and lets any user report a question they believe is wrong, without requiring sign-in. Flagging is anonymous-only by design; there is no signed-in identity concept anywhere in this feature.

### Content verification tracking ⏳ Planned

Optional `verified: true` field, to be added to a question once a human has reviewed the word, meaning, and distractors. Absence means not-yet-verified, not incorrect. Not shown to learners. Not yet implemented.

### Flag-a-question feature ✅ Implemented

- A flag icon sits next to the "Mark as known" control on the quiz screen, visually distinct from it, available regardless of anything else on the page. Submitting never interrupts the quiz.
- Captures: unit ID, chapter ID, quiz mode, the Arabic text, and the correct answer, plus a timestamp. There is no signed-in/anonymous identity field — every report is anonymous.
- `netlify/functions/report-question-flag.js` appends a row to a Google Sheet ("Flags" tab) via the Sheets API, using a dedicated Google service account (separate from any future OAuth credential), with the service account key and spreadsheet ID stored as Netlify environment variables, never committed.
- If the endpoint call fails or is unreachable, the report is stored in a local retry queue (`arabicStudy.anonymousFlagQueue.v1` in `localStorage`, capped at 50 entries) instead of being lost. The queue is flushed automatically on quiz load and after each subsequent flag action.
- Learner feedback: a snackbar reads "Word flagged for correction, thank you!" on successful delivery. When a report is only queued locally (delivery failed), the UI should show a distinct message such as "Saved to send later" so a queued report is never presented as already delivered. As of the latest commit on `main`, both paths currently show the same success message; this discrepancy is noted as a follow-up, not yet corrected.
- `googleapis` was added as a dependency in `package.json` alongside the existing `@netlify/blobs` dependency to support the Sheets API call.

### Rules

- Flagging never blocks the quiz and never requires sign-in — it is anonymous-only, full stop. Flag data goes to the Sheet, never to `ProgressStore` or `localStorage` (aside from the transient local retry queue, which only exists to survive a failed network call and is cleared once delivered). Flags and verification status are never shown publicly to learners.

### Testing checklist

- [x] Flagging works without sign-in and without any identity field.
- [ ] Flagging works identically in both quiz directions and records which was active.
- [x] Flagging never disables the answer/next button.
- [x] A submitted flag appears as a new row in the `Flags` tab of the configured Google Sheet.
- [ ] A failed submission is queued locally and successfully retried once the endpoint is reachable again.
- [ ] The success message and the queued/offline message are made visibly distinct (see note above).

## Account Authentication (Google + Magic Link) ⏳ Planned

Intentionally sequenced after Known Vocabulary shipped and is manually verified, so `mergeProfile()` only needs to handle one finished profile shape rather than being updated twice. Not started; no auth-related code exists in the repository yet.

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

## Unit 6 Supplementary Vocabulary (Sticky-Note Set) ⏳ Planned

### Purpose

A supplementary vocabulary set for Unit 6, sourced from handwritten sticky notes and a whiteboard phrase, in addition to (not replacing) the existing Chapter 26–30 content in `unit6.json`. Intended to become its own selectable study set once transcribed and reviewed, rather than being merged into the existing chapters.

### Status

- Transcription is in progress and manual, not automated. Photos of the sticky notes and a whiteboard were provided; handwriting is being transcribed entry-by-entry rather than through OCR/screenscraping, since automated extraction was not reliable enough for accurate Arabic transcription.
- One confirmed entry so far, corrected by the user from the whiteboard photo:

```json
{
  "arabic": "ابتعد عن",
  "english": "stay away from; move away from",
  "type": "verb phrase",
  "source": "whiteboard",
  "needsReview": false
}
```

- The remaining sticky-note vocabulary (five sticky notes of individual words/phrases, largely exam-review vocabulary such as verbs and abstract nouns) has not yet been transcribed into a draft JSON file. Each entry will be drafted with an explicit `needsReview` flag so uncertain handwriting/translation can be corrected before anything is added to a content file or the live site.
- No new content file has been created yet. `unit6.json` has not been modified for this feature and must not be modified directly — this will be a separate supplementary file, consistent with the Content Contract's one-file-per-unit shape, or a clearly separated chapter/set within it, to be decided when the transcription is finalized.

### Rules

- Do not write draft or unreviewed vocabulary into `unit6.json` or any file already live on `main`.
- Every transcribed entry must be reviewed and corrected by the user before it is wired into the quiz engine or homepage.
- Source sticky-note/whiteboard vocabulary follows the same Content Contract shape as existing units once finalized — no special-cased engine logic for this set.

### Testing checklist

- [ ] All sticky-note and whiteboard vocabulary is transcribed into a draft JSON with `needsReview` flags.
- [ ] User has reviewed and corrected all draft entries.
- [ ] Finalized supplementary vocabulary is added as a new, clearly labeled study set without modifying existing Unit 6 chapters.
- [ ] The new set appears correctly in both quiz directions once wired in.

## Classmate Feedback & Feature Requests ⏳ Planned

### Purpose

Raw feature suggestions collected from classmates (Wadnizak, Horne, Joseph, Sorto, Hannah) testing the site. Recorded here verbatim in intent, cross-referenced against what already exists on `main` so nothing is duplicated or lost. None of these have been scoped, designed, or implemented yet unless explicitly marked otherwise below.

### Already addressed by existing features

- **English-to-Arabic direction (Wadnizak).** Already implemented — see the Quiz Direction Mode section above (`quiz.html?...&mode=en-to-ar`). No further action needed unless Wadnizak's experience predates that feature shipping.
- **Simple one-button inaccurate-question feedback (Joseph).** Already implemented — see Content Quality Control (Anonymous Flagging) above. The flag control is already exactly what was requested: one button, no sign-in, doesn't interrupt the quiz.
- **Central hub page (Joseph).** Likely already addressed by `arabic/arabic.html` as the homepage/hub with the chapter picker, Continue card, and navigation drawer. Worth confirming with Joseph whether this refers to something more specific (e.g. a hub spanning multiple units/subjects) before treating this as fully resolved.

### New: content accuracy issues (likely pre-dating current engine)

These three, from Wadnizak, describe problems that may originate in older content files (e.g. a legacy `unit6.html`-era dataset) rather than the current `unit6.json` / `quiz.html` engine. Each needs to be verified against the *live* content before being treated as a bug in current code:

- [ ] **Area studies quiz question-count mismatch.** Reported: a quiz titled as N questions (6, 15, etc.) actually presents all available questions instead of that stated number. Needs reproduction against current chapters before scoping a fix — may be a stale content file issue, not an engine bug.
- [ ] **Missing years/dates on historical questions.** Some questions ask "which year did this happen" or similar without the year actually present/quizzable. This is a content-completeness issue, not an engine issue — likely requires editing the underlying question data once located.
- [ ] **Crusades numbered instead of named.** Content currently refers to Crusades by number (e.g. "the third Crusade") rather than by their commonly used names. Also a content-data fix, not an engine change, once the source question file is identified.

### New: mini-games and alternate practice modes

- [ ] **Hangman mini-game (Horne).** A separate game mode using existing vocabulary as the word bank.
- [ ] **Numbers speed game (Hannah).** A timed drill mode specifically for number vocabulary/recognition speed.
- [ ] **Quizlet-style "Learn" mode (Joseph).** Presents several word meanings at once rather than one question at a time.
- [ ] **Vocabulary-in-context / example sentences (Joseph).** Show each word used in a full sentence, not just an isolated word/definition pair — conceptually similar to Language Reactor's sentence-level, in-context language exposure (Joseph).

### New: hint-before-wrong behavior

- [ ] **Hint on first miss (Hannah).** Instead of immediately marking a first incorrect answer as wrong, show a hint and allow a second attempt before revealing the correct answer. This would be a meaningful change to the existing answer-checking flow in `quiz.html` and needs to be reconciled carefully with the Known Vocabulary streak rules above — e.g. deciding whether a "hinted-then-correct" answer counts as a correct attempt for streak purposes, or resets the streak the way a wrong answer currently does. This decision should be made explicitly before implementation, not left implicit in the code.

### New: gamification and rewards

- [ ] **General gamification (Joseph).** No specific mechanic named beyond what's captured in the two items below; treat as an umbrella goal rather than a standalone task.
- [ ] **Lotería-style collectible cards (Sorto).** Each individual win/session award grants a collectible card, lotería-style.
- [ ] **Evolving companion/hero (Sorto).** A Khan Academy– or Blooket-style character/companion that unlocks or evolves as the learner progresses, similar in spirit to the lotería-card idea but as a single persistent character rather than a card collection. These two (lotería cards and the evolving hero) may end up as competing or complementary designs for the same underlying goal (visible, motivating progress rewards) and should be reconciled into one direction before either is built, rather than building both independently.

### Rules

- None of the items in this section should be implemented without first being scoped into their own dedicated section of this document (data model, rules, testing checklist), the same way Known Vocabulary and Anonymous Flagging were.
- The three content-accuracy items (question-count mismatch, missing years, Crusades naming) should be triaged first, separately from the mini-game/gamification ideas, since they may be simple content-data corrections rather than new features.
- Any new mini-game or practice mode must reuse the existing Content Contract and `UnitsManifest` rather than introducing a parallel content format.
- Any hint-before-wrong change must not silently change how `ProgressStore.recordAnswer` scores a streak; the interaction between hints and the two-attempt known-word rule must be explicitly decided and documented before implementation.
- Gamification rewards (cards, evolving companion) are presentation-layer motivation features and must not be used as a substitute for or stored inside `knownWords`, `bestScore`, or other existing progress fields — if they need their own state, it should be additive and clearly separated, consistent with how `knownWords` was added without disturbing existing chapter progress fields.

### Testing checklist

- [ ] Each content-accuracy item (question-count mismatch, missing years, Crusades naming) has been reproduced against current live content and either fixed or confirmed to be a legacy/non-issue.
- [ ] A single gamification direction (cards vs. evolving companion, or a reconciled combination) has been chosen before implementation begins.
- [ ] The hint-before-wrong interaction with known-word streaks has been explicitly decided and written into the Known Vocabulary section before `quiz.html` is changed.

## Unit 7 (Chapters 31–32 Vocabulary) ✅ Done

`arabic/data/unit7.json` and the `unit7` entry in `arabic/data/units-manifest.js` are live on `main`, following the exact Content Contract and manifest shape used for Unit 6. Chapter 31 (`ch31`, 45 questions) and Chapter 32 (`ch32`, 69 questions) are both marked `available: true`. No engine changes were required to add either chapter — `quiz.html`, `progress-store.js`, and the manifest helper API worked immediately once each chapter's data existed, confirming the unit-agnostic design goal from the Purpose section holds in practice, including for a second chapter added after the fact.

`arabic.html` was updated to add a `#unit7-chapters` picker section mirroring `#unit6-chapters`. The previously hardcoded `UNIT_ID` constant was generalized to `UNIT_IDS = ["unit6", "unit7"]`, and the chapter-list renderer was parameterized (`renderChapterListForUnit`/`renderAllChapterLists`) rather than duplicated, so a future Unit 8 needs only a new array entry and a new `#unit8-chapters` section, not new rendering logic. The Continue card's fallback-chapter logic was also updated to check each unit in `UNIT_IDS` order rather than defaulting to Unit 6 alone. A navigation-drawer link for Unit 7 vocabulary was added alongside the existing (now relabeled) Unit 6 link. Chapter 32 required no further homepage changes — it appears automatically in the existing `#unit7-chapters` list once added to the manifest.

### Content format correction (Chapter 31 launch bug)

Chapter 31 initially shipped with a mismatched content shape (`arabic`/`english`/`type` fields with no answer choices) instead of the actual required shape used by `quiz.html` and matching `unit6.json`: `number`, `arabic`, a `choices` object keyed `A`–`D`, and an `answer` field naming the correct key. This caused a "Quiz unavailable" error for every learner clicking into Chapter 31 from the homepage, since the quiz engine had nothing to render. The fix regenerated all 45 Chapter 31 questions in the correct format, with 3 distractor choices per question sampled from other Chapter 31 vocabulary, and this correction shipped as its own commit before Chapter 32 was added. Chapter 32 was built directly in the correct format from the start.

### Rules

- Every new chapter's questions must be authored directly in the `number`/`arabic`/`choices`(`A`–`D`)/`answer` shape used by `unit6.json` — never in an intermediate or simplified shape — since `quiz.html` has no fallback rendering path for a differently-shaped question object.
- Distractor choices should be sampled from vocabulary within the same chapter, consistent with how Chapters 26–31 and 32 were built, so no engine change is needed to support a new chapter's answer options.
- Multi-word vocabulary with closely related meanings within the same chapter (e.g. "quarrel" the noun vs. "to quarrel" the verb, both present in Chapter 32) should be spot-checked after generation, since random distractor sampling can occasionally produce a technically-wrong-but-plausible-sounding decoy pair.

## Mobile App Store Distribution (Google Play + Apple App Store) ⏳ Planned

### Purpose

Package the existing mobile-first web app for distribution through the Google Play Store and Apple App Store, so it can be installed like a native app rather than only accessed via browser at calebpfohl.com. This is a distribution and packaging layer on top of the existing site — it does not imply a rewrite. The current Material Design 3, mobile-first `arabic.html`/`quiz.html` experience is designed to translate directly into a wrapped app via a WebView-based or PWA-to-native packaging approach (e.g. Trusted Web Activity for Android, a WKWebView wrapper or Capacitor/Cordova-style shell for iOS), rather than being rebuilt as a separate native codebase.

### Status

- **Google Play**: the one-time $25 Google Play Developer registration fee has been paid. No app listing, build, or submission has been created yet.
- **Apple App Store**: the $99/year Apple Developer Program enrollment has not yet been started. Planned for approximately one month out from this entry, not urgent.
- Because of this sequencing, Google Play is the first target platform; iOS/App Store work is intentionally deferred until the Apple Developer account exists.

### Setup — Google Play (first target)

- [ ] Decide the packaging approach: Trusted Web Activity (wraps the existing PWA/site with minimal native shell code, preferred if the site already has a working manifest/service worker) vs. a full WebView wrapper (e.g. via Capacitor).
- [ ] Add/verify a PWA manifest (`manifest.json`) and app icons for `arabic.html`, since a Trusted Web Activity depends on the site already behaving like an installable PWA.
- [ ] Create the app listing in Google Play Console: title, description, screenshots (mobile-first design should translate well here), content rating questionnaire, privacy policy URL.
- [ ] A privacy policy is required for Play Store submission regardless of packaging approach — must account for `localStorage`-based `ProgressStore` data and the anonymous flag-reporting feature, even though neither collects personally identifying data today.
- [ ] Build and sign the release bundle (`.aab`), upload to a closed/internal testing track first, then promote to production after testing.

### Setup — Apple App Store (deferred ~1 month)

- [ ] Enroll in the Apple Developer Program ($99/year) — not yet started.
- [ ] Decide the iOS packaging approach once enrolled — likely the same shell technology chosen for Android (e.g. Capacitor) to avoid maintaining two separate native wrappers, rather than a from-scratch Swift/WKWebView app, unless a from-scratch shell turns out to be simpler for App Review purposes.
- [ ] App Store submissions have historically applied extra scrutiny to "thin WebView wrapper" apps; the app should include enough native-feeling chrome (already partially satisfied by the existing bottom nav / navigation drawer) to avoid a rejection on those grounds. This should be revisited against current App Store Review Guidelines once enrollment is active, since guidelines can change.
- [ ] Same privacy policy and content rating requirements apply, plus Apple's separate App Privacy "nutrition label" questionnaire in App Store Connect.

### Rules

- No native rewrite of `arabic.html`/`quiz.html`/`progress-store.js` — the packaged app should load the same live site (or a bundled snapshot of it), not a separate maintained codebase, to avoid the two-codebase drift this document's unit-agnostic design has otherwise avoided.
- `ProgressStore`'s local-first design (see above) must keep working unmodified inside whichever WebView/shell technology is chosen; if the packaging approach can't reliably persist `localStorage` between app launches, that is a blocking issue to resolve before submission, not an acceptable regression.
- Do not begin Apple App Store setup work until the Apple Developer Program enrollment is active — no point drafting store-specific assets against guidelines that may not be current by the time enrollment happens.
- A privacy policy must be published and linked before either store submission; it must accurately describe the local-only nature of `ProgressStore` and the anonymous nature of the flag-reporting feature, consistent with the Guardrails elsewhere in this document.
- Google Play submission should not block on Apple Developer enrollment — the two platforms are sequenced independently, Play first.

### Testing checklist

- [ ] Site has a valid PWA manifest and passes Lighthouse's installability checks, if Trusted Web Activity is the chosen approach.
- [ ] Packaged Android build correctly persists `ProgressStore` data (known words, chapter progress) across app restarts, not just across page reloads in a browser tab.
- [ ] Play Store internal testing track build installs and runs correctly on at least one physical Android device before promoting to production.
- [ ] Privacy policy page is published, linked from both the site footer and the store listings, and accurately reflects current data practices at time of submission.
- [ ] (Once Apple enrollment is active) iOS build correctly persists `ProgressStore` data across app restarts using the same shell technology validated on Android.

## Analytics (Google Tag Manager + GA4) ✅ Done

### Purpose

Capture enough behavioral data to answer two questions without adding meaningful JS weight: where visitors drop off in the Unit 6/Unit 7 study funnel, and which buttons/features they actually engage with. Google Tag Manager (GTM) was chosen over hand-rolled analytics calls because a GA4 tag can be configured entirely inside the GTM container (Google Tag Manager web UI) without further code changes, and over loading `gtag.js` directly because the same container ID already existed on `index.html` — reusing it keeps one tracking setup across the whole site instead of three.

### Status

- The GTM container (`GTM-NDCR97CD`) was already live on `index.html` (the main portfolio landing page) before this work began. It was **not** present on `arabic/arabic.html` or `arabic/quiz.html`, meaning the two pages where nearly all real user activity happens — chapter selection and the quiz itself — had zero analytics coverage.
- Because each HTML document is a separate page load with its own JS context, the GTM snippet does not "carry over" from `index.html` to the Arabic subpages automatically. It must be pasted identically into every page that should be tracked.
- The container snippet (head `<script>` + body `<noscript><iframe>`) has been added identically to `arabic/arabic.html` and `arabic/quiz.html`, matching `index.html` exactly — same container ID, same placement (script immediately after `<meta charset>`, noscript iframe immediately after `<body>` opens).

### Lightweight custom events

Rather than adding a third-party analytics library or a large event-tracking framework, a single ~1-line helper was added to each page:

```js
function trackEvent(name, params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: name }, params || {}));
}
```

This pushes directly into the `dataLayer` array GTM already listens on — no additional script tags, no new dependencies, and no meaningful JS weight added. A GA4 Event tag can be configured inside GTM (in the Tag Manager web UI, not in code) to fire on any of these custom event names and forward them to GA4 as GA4 events.

| Event | Fires when | Parameters | File |
|---|---|---|---|
| `direction_toggle` | Learner switches Arabic→English / English→Arabic mode on the homepage | `direction` | `arabic.html` |
| `chapter_card_click` | Learner clicks an available chapter card | `unit_id`, `chapter_id`, `chapter_status` | `arabic.html` |
| `answer_selected` | Learner picks an answer choice (before checking it) | `unit_id`, `chapter_id`, `mode` | `quiz.html` |
| `answer_checked` | Learner submits/checks an answer | `unit_id`, `chapter_id`, `mode`, `correct` | `quiz.html` |
| `word_flagged` | Learner taps the flag-a-question control | `unit_id`, `chapter_id`, `mode` | `quiz.html` |
| `word_marked_known` | Learner manually marks a word as known | `unit_id`, `chapter_id`, `mode`, `source` | `quiz.html` |
| `chapter_completed` | Learner finishes all questions in a chapter session | `unit_id`, `chapter_id`, `mode`, `score`, `total` | `quiz.html` |

### Funnel and drop-off visibility this enables

Combined with GA4's automatic page-view tracking (no code required — GA4 tracks page views as soon as the GA4 tag is configured in GTM) and GA4's Enhanced Measurement feature (scroll-depth tracking, also configured in the GTM/GA4 UI, not in code), the event set above gives a full funnel:

`page_view` (homepage) → `chapter_card_click` → `page_view` (quiz.html) → `answer_selected`/`answer_checked` (repeated per question) → `chapter_completed`

A learner who lands on the homepage, clicks into Chapter 32, answers a few questions, and leaves without finishing will show up in GA4 as having triggered `chapter_card_click` and several `answer_checked` events but never a `chapter_completed` event for that `chapter_id` — directly answering "where do people drop off."

### Rules

- No third-party analytics library or SDK was added; all tracking flows through the existing `dataLayer` GTM already reads, keeping the JS footprint to a single small helper function per page.
- GTM/GA4 configuration itself (which tags fire on which events, GA4 property wiring, Enhanced Measurement toggles) happens in the Google Tag Manager and GA4 web consoles, not in this codebase — this document records what data is made available via `dataLayer`, not how it is configured downstream.
- The GTM container ID (`GTM-NDCR97CD`) is the same one already used on `index.html`; a second or different container must not be introduced without a documented reason, to avoid fragmenting analytics across the site.
- Every current and future page under `arabic/` must carry the identical GTM snippet (head script + noscript iframe) if it should be included in analytics — this is not automatic and must be checked when adding new pages (e.g. a future homepage display change or a new mini-game page from the Classmate Feedback backlog).
- `trackEvent()` calls must never block or delay the underlying action they're attached to (e.g. `answer_selected` fires and then immediately calls `selectAnswer()`; it does not gate it) — analytics must fail silently and never break the quiz.
- No personally identifying data is included in any event's parameters; all parameters are content identifiers (`unit_id`, `chapter_id`, `mode`) or non-identifying outcome data (`correct`, `score`, `total`, `source`).

### Privacy policy implication

This addition means the Mobile App Store Distribution section's planned privacy policy (see above) must now also disclose GTM/GA4 usage — Google Analytics is a well-understood category for a privacy policy, but the policy draft must not describe the site as having "no analytics" once this ships. This does not block Google Play submission; it is a content requirement for the privacy policy page itself, which was already planned as a prerequisite for both store submissions.

### Testing checklist

- [ ] GTM Preview mode confirms the container fires correctly on `arabic.html` and `quiz.html`, not just `index.html`.
- [ ] A GA4 tag is configured in the GTM container (if not already) so page views and the seven custom events actually reach a GA4 property, not just the browser's `dataLayer`.
- [ ] GA4 Enhanced Measurement (scroll tracking) is enabled to get drop-off signal on longer pages without additional custom events.
- [ ] Each of the seven custom events appears correctly in GA4's DebugView with the expected parameters, for at least one full manual run through a chapter (homepage → chapter click → several answers → completion).
- [ ] Privacy policy draft (see Mobile App Store Distribution section) is updated to disclose GTM/GA4 before either store submission.

## Implementation Order

1. [x] Add `data/units-manifest.js`.
2. [x] Add and manually test `progress-store.js` in isolation.
3. [x] Integrate the progress store and rendering engine into `quiz.html`.
4. [x] Add the homepage chapter picker and progress display, driven by `UnitsManifest`.
5. [ ] Manually test all chapters on mobile and desktop widths.
6. [x] Implement the English-to-Arabic direction mode.
7. [x] Implement the Known Vocabulary (Mark as Known) system: per-word streak tracking, manual override, and clean 0-based cutover, in progress-store.js and quiz.html. Homepage display change from question-count to known-word-count is still outstanding (arabic.html not yet updated for that specific display change).
8. [ ] Manually verify the known-word system on calebpfohl.com (streak increments/resets correctly, manual override works, per-direction independence, cutover shows 0 with old score preserved separately) before moving on.
9. [x] Implement the anonymous flag-a-question feature and Google Sheets logging (`netlify/functions/report-question-flag.js`, `googleapis` dependency, local retry queue).
10. [ ] Manually verify the deployed flag endpoint end-to-end: Google Sheet row creation, retry queue behavior on failure, and distinct success vs. queued learner messaging.
11. [x] Add homepage Coming Soon states for Study Sets and Class Resources.
12. [x] Add the site attribution footer.
13. [ ] Transcribe, review, and finalize the Unit 6 supplementary vocabulary (sticky notes + whiteboard phrase) into a new content file, then wire it into the homepage and quiz as its own study set.
14. [x] Add Unit 7 Chapter 31 vocabulary content file, manifest entry, and homepage chapter picker.
15. [x] Fix Chapter 31's content format bug (missing multiple-choice `choices`/`answer` fields) that caused "Quiz unavailable."
16. [x] Add Unit 7 Chapter 32 vocabulary (69 questions) to the existing `unit7.json` and manifest, in the corrected format from the start.
17. [ ] Set up Netlify Functions scaffolding and the Google OAuth client; implement Google sign-in.
18. [ ] Implement magic-link email sign-in.
19. [ ] Set up Netlify DB and wire up profile sync for both sign-in methods, including the known-word fields.
20. [ ] Add the `verified` field convention and begin tracking verification status.
21. [ ] Test account authentication and sync per its checklist before opening a pull request.
22. [ ] Set up the Google Play Console listing and submit an internal testing build (Play Store developer fee already paid).
23. [ ] Enroll in the Apple Developer Program (planned ~1 month out), then begin iOS packaging and App Store listing work.
24. [x] Add the GTM-NDCR97CD container to arabic.html and quiz.html, matching index.html.
25. [x] Add lightweight dataLayer event tracking (direction_toggle, chapter_card_click, answer_selected, answer_checked, word_flagged, word_marked_known, chapter_completed).
26. [ ] Configure a GA4 tag inside the GTM container to actually forward page views and the seven custom events to a GA4 property; enable Enhanced Measurement for scroll-depth signal.

## Guardrails

- Preserve the current Material-style mobile design and Arabic Unicode/`lang`/`dir` handling.
- Do not overwrite or regenerate `unit6.json` unless explicitly required and separately reviewed.
- Do not add authentication, tracking, analytics, or external services before this document specifies them.
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
