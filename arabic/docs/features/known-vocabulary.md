# Known Vocabulary (Mark as Known) ✅ Done

## Purpose

Replace the current chapter progress model ("12 of 65 questions answered," tied to a linear, reshuffled quiz session) with a per-word known/unknown model: "12 of 65 words known." This is a more meaningful and more durable signal than session position, and it directly resolves the resume-bug issue (see [quiz-engine-and-progress.md](quiz-engine-and-progress.md)), since there is no session position to resume — known-word status persists independently of how any single quiz session is shuffled or interrupted.

This is learner-facing personalization data, distinct from the flag-a-question feature (which reports content problems to the site owner) and from `verified` (which tracks content-accuracy review). All three are per-question metadata, but serve different purposes and audiences, and none should be merged into one field or one storage location.

## Two-attempt confirmation rule

A word becomes known automatically only after being answered correctly on **two separate attempts with no incorrect answer in between**:

- Each word has a per-direction correct-streak counter, starting at 0.
- A correct answer increments that word's streak by 1.
- An incorrect answer resets that word's streak to 0, regardless of how high it was.
- When a word's streak reaches 2, it is marked known automatically.
- "Two separate attempts" means two distinct times the word was presented and answered — not two correct answers within the same instant, and not dependent on both attempts happening in the same session. A learner could get a word right today and right again next week and it becomes known at that point.
- A lucky single correct guess is deliberately insufficient to mark a word known. This is intentional: the two-attempt rule exists specifically so "known" reflects demonstrated retention, not a one-time guess.

## Manual override

Independent of the streak mechanism, a learner can manually mark a word as known (or unknown) at any time via a dedicated control, without needing to answer it correctly at all. This is useful for words a learner already knows from outside the app and does not want to be quizzed on repeatedly.

- Manually marking a word known sets its status to known immediately and does not require or reset the streak counter.
- Manually un-marking a known word (whether it became known via streak or manual override) resets it to not-known and resets its streak counter to 0.

## Per-direction tracking

Known-word status and streak counts are tracked independently per quiz direction, consistent with how chapter progress is already separated (`ch26` vs. `ch26:en-to-ar`). Knowing a word Arabic-to-English does not imply knowing it English-to-Arabic, since recognition and recall are different skills.

## Data model

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

## Cutover: no retroactive grandfathering

Every learner starts at 0 known words under this system, including learners who had high scores under the old session-based model. This is a deliberate decision, not an oversight: the old model never recorded *which specific words* were answered correctly, only aggregate counts (`correctCount`, `bestScore`), so there is no way to accurately reconstruct per-word history. Rather than fabricate a starting known-count that might not reflect reality, the cutover is clean.

- The old `bestScore`, `attempts`, and `completedAt` fields are preserved and remain visible as a separate "past best score" stat, not deleted and not merged into the new known-word count.
- The homepage's chapter progress display switches from "X of Y questions answered" to "X of Y words known," reading from `knownWords`, once this feature ships. This homepage display change is still outstanding.
- This should be communicated clearly in the UI at cutover (e.g. a brief note that known-word tracking is new and starts fresh) so a returning learner is not confused by a lower number than they remember.

## `ProgressStore` API additions ✅ Implemented

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

## Quiz behavior ✅ Implemented

- A "Mark as known" pill control sits next to the question kicker on the quiz screen, visually distinct from the flag control so the two are never confused by a learner. Live on `main` in `arabic/quiz.html`.
- Not yet implemented: a "focus mode" that would let a quiz session start with already-known words excluded from that chapter's question set, in either direction. This remains a future additive option on top of the existing shuffle-and-render flow.
- Because there is no meaningful session position to resume (progress is per-word, not per-slot), a quiz session simply starts fresh each time. The prior plan to resume at a saved question index is retired.

## Rules

- Do not write known-word status to `unit6.json` or any content file. It is learner-specific and belongs only in `ProgressStore`.
- Do not merge known-word data with flag data or `verified` data. They serve different purposes and different audiences.
- A single correct answer must never, by itself, mark a word known. Two separate correct attempts with no incorrect answer between them are required, unless the manual override is used.
- Marking a word as known (by either path) must never affect `bestScore`, `status`, or other existing chapter-level progress fields.
- This feature requires no backend and works fully for anonymous, non-signed-in users, consistent with the rest of the local-first design. Once Account Authentication exists, known-word data syncs the same way the rest of the profile does, via the existing `mergeProfile` mechanism.
- Do not implement any form of retroactive grandfathering that infers per-word history from old aggregate scores. If old scores are surfaced at all, they must be clearly labeled as a separate, historical stat, not folded into the new known-word count.

## Testing checklist

- [ ] A word's streak increments on a correct answer and resets to 0 on an incorrect answer.
- [ ] A word becomes known only after two consecutive correct answers with no incorrect answer between them, not after one.
- [ ] Manually marking a word known sets it to known immediately, regardless of streak.
- [ ] Manually un-marking a word resets both `known` and `streak` to their initial state.
- [ ] Known-word counts and streaks for `ch26` and `ch26:en-to-ar` are tracked independently.
- [ ] A returning user with old `bestScore` data sees 0 known words at cutover, with the old score still visible separately, not blended into the new count.
- [ ] Focus mode (not yet built) correctly excludes known words without breaking the 100%-coverage guarantee of English-to-Arabic mode for the remaining words, once implemented.

This checklist has not yet been manually run against the live site; see `CHANGELOG.md` Implementation Order step 8.
