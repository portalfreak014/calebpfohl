# Unit 6 Chapter Navigation and Progress

## Purpose

This document describes the intended implementation for expanding the Arabic quiz experience from a Chapter 26-only entry point into an easy-to-navigate Unit 6 experience for Chapters 26–30. It also defines a local-first learner-progress design that can later connect to Google, Apple, email/password, or another account provider without rewriting quiz logic.

This work belongs on the isolated branch:

```text
feature/arabic-chapter-progress
```

Do not merge into `main` until the feature has been tested and explicitly approved.

## Current Findings

The existing project structure is:

```text
arabic/
  arabic.html
  quiz.html
  data/
    unit6.json
```

Known behavior:

- `arabic.html` is the study homepage.
- Its hero “Start studying” link currently opens `quiz.html?unit=unit6&chapter=ch26` directly.
- `quiz.html` already reads `unit` and `chapter` from URL query parameters.
- `quiz.html` fetches `data/${unit}.json` and selects a chapter from the file’s `chapters` object.
- The quiz currently stores a small, chapter-specific local-storage object under a key like `arabicStudyProgress:unit6:ch26`.
- The supplied `unit6.json` includes at least `ch26`, `ch27`, and `ch28`; Chapters 29 and 30 should be displayed as unavailable until their question data is added.

Important: preserve all existing question content in `arabic/data/unit6.json`. The intended first implementation does not require rewriting that file.

## Target User Flow

```text
Arabic homepage
  |
  +-- Continue studying
  |     +-- opens the learner’s most recently active available chapter
  |
  +-- Start studying / Choose a chapter
        |
        +-- Chapter 26 -> quiz.html?unit=unit6&chapter=ch26
        +-- Chapter 27 -> quiz.html?unit=unit6&chapter=ch27
        +-- Chapter 28 -> quiz.html?unit=unit6&chapter=ch28
        +-- Chapter 29 -> unavailable / Coming soon
        +-- Chapter 30 -> unavailable / Coming soon

Quiz page
  |
  +-- reads unit + chapter from URL
  +-- loads selected chapter’s questions
  +-- records local progress after each answered question
  +-- offers Change chapter and Back to study
  +-- presents next available chapter after completion when appropriate
```

## Chapter Manifest

Add a small standalone JavaScript file, for example:

```text
arabic/unit6-chapters.js
```

This file should hold display and routing metadata separately from the raw question data:

```js
window.ARABIC_CHAPTERS = {
  unit6: [
    { id: 'ch26', number: 26, title: 'Chapter 26', available: true },
    { id: 'ch27', number: 27, title: 'Chapter 27', available: true },
    { id: 'ch28', number: 28, title: 'Chapter 28', available: true },
    { id: 'ch29', number: 29, title: 'Chapter 29', available: false, status: 'Coming soon' },
    { id: 'ch30', number: 30, title: 'Chapter 30', available: false, status: 'Coming soon' }
  ]
};
```

Rules:

- A chapter is only `available: true` once its data exists and has been tested.
- Keep the manifest as the homepage’s source of truth for chapter cards, status labels, ordering, and next-chapter behavior.
- The quiz must still validate that a selected chapter actually exists in the fetched data. The manifest is not a replacement for validation.
- When Chapters 29–30 data is added, switch them to available and add any desired question-count metadata.

## Homepage Changes

Update `arabic/arabic.html`.

### Primary actions

Replace the fixed Chapter 26 “Start studying” behavior with either:

- A **Choose a chapter** action that opens/jumps to a visible Unit 6 chapter section; or
- A primary button that continues the last active available chapter, plus a clearly visible secondary “Choose chapter” action.

Recommended layout:

```text
Unit 6 vocabulary

[ Continue Chapter 27 ]  [ Choose chapter ]

[ Chapter 26 | 65 words | Start / Review ]
[ Chapter 27 | 60 words | Start / Continue ]
[ Chapter 28 | ...      | Start ]
[ Chapter 29 | Coming soon ]
[ Chapter 30 | Coming soon ]
```

Use large, tappable cards on mobile. Do not hide five chapters inside a dropdown.

### Homepage progress

Read the progress profile through `ProgressStore` (defined below). Show:

- Last active chapter.
- Completed or answered question count for that chapter.
- Best score and/or last score if the user completed it.
- A progress bar for the current/most-recent chapter.
- A per-chapter status: Not started, In progress, Completed, or Coming soon.
- Optional recent activity list populated from profile attempt history.

Continue behavior should prefer the profile’s `lastActive` chapter when it is still available; otherwise it should fall back to Chapter 26.

## Quiz Changes

Update `arabic/quiz.html`.

### Routing and validation

Keep the current query-parameter model:

```text
quiz.html?unit=unit6&chapter=ch27
```

Sanitize both values. If the requested unit/chapter is unknown, missing, unavailable, or has no questions:

1. Do not render an empty or broken quiz.
2. Show a helpful unavailable screen with a back-to-study action.
3. Optionally provide a “Choose another chapter” action pointing back to the Unit 6 chapter section.

### Header controls

Keep the existing exit button. Add a chapter-switch control that returns to the homepage’s Unit 6 chapter picker, for example:

```text
arabic.html#unit6-chapters
```

If header space is limited, use an icon/button with an accessible label such as “Change chapter.”

### Progress saving

Do not use the old single-purpose chapter storage key directly in quiz code after migration. Instead, call the shared progress module after a question has been checked.

Record progress after each answer rather than only at chapter completion. Store at least:

- Unit ID and chapter ID.
- Number of answered questions.
- Total questions in the chapter.
- Correct answers in the current/latest attempt.
- Current question index for resuming.
- Best completed score.
- Attempt start time, last activity time, and completion time when applicable.
- Whether the chapter has ever been completed.

Recommended behavior:

- Preserve the current question order only within the active attempt. If exact resumption is desired, persist the shuffled question IDs/order too.
- On returning to an in-progress quiz, offer “Continue where you left off” or “Start over.”
- The simplest acceptable first release is to resume at the stored question index using a deterministic or persisted question order. Do not claim a quiz can resume accurately if random order is discarded.
- Restart should create a new attempt state and should not erase historical best-score data.
- Completion should update the chapter’s best score only if the new score is higher.

### Completion screen

On completion, display:

- Score for the completed attempt.
- Personal best, if different or useful.
- Practice again.
- Back to Unit 6 chapter picker.
- Start the next available chapter when a next available chapter exists.

For Chapter 28, do not promise Chapter 29 until its data is present. Link back to chapter selection instead.

## Local-First Progress Store

Add a standalone file:

```text
arabic/progress-store.js
```

Use a versioned profile stored under one stable key:

```text
arabicStudy.profile.v1
```

Do not store user credentials, tokens, email addresses, or authentication information in this client-only profile.

### Suggested profile shape

```js
{
  schemaVersion: 1,
  userId: null,
  syncVersion: 0,
  createdAt: '2026-08-19T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
  lastActive: {
    unitId: 'unit6',
    chapterId: 'ch27',
    updatedAt: '2026-08-19T00:00:00.000Z'
  },
  units: {
    unit6: {
      chapters: {
        ch26: {
          status: 'in_progress',
          totalQuestions: 65,
          answeredCount: 12,
          correctCount: 9,
          resumeIndex: 12,
          questionOrder: [1, 7, 3],
          bestScore: 52,
          latestScore: 9,
          attempts: 2,
          startedAt: '2026-08-19T00:00:00.000Z',
          lastActivityAt: '2026-08-19T00:00:00.000Z',
          completedAt: null
        }
      }
    }
  }
}
```

The exact question-order representation can use stable question numbers or IDs. Avoid depending on array offsets if data may be reordered later.

### Required API

Expose a small, explicit API. A future authentication layer should use these same methods rather than reach into localStorage directly.

```js
window.ProgressStore = {
  getProfile(),
  saveProfile(profile),
  getChapter(unitId, chapterId),
  updateChapter(unitId, chapterId, patch),
  setLastActive(unitId, chapterId),
  resetCurrentAttempt(unitId, chapterId),
  exportProfile(),
  importProfile(profile),
  mergeProfile(remoteProfile),
  clearLocalProfile()
};
```

Implementation requirements:

- Use defensive JSON parsing and return a valid default profile if storage is absent or corrupted.
- Migrate the existing old chapter keys (for example `arabicStudyProgress:unit6:ch26`) into the new profile once when possible. Do not silently lose established local progress.
- Keep `schemaVersion` at the top level so future migrations are possible.
- Update `updatedAt` whenever profile content changes.
- Use immutable/clone-safe handling when returning objects so callers do not accidentally mutate cached state without saving.
- Gracefully handle localStorage being unavailable or full; quiz functionality should continue even if progress cannot be saved.

## Future Account Sync Design

No Google, Apple, email, password, database, or backend should be implemented in this phase.

The preparation work is architectural:

```text
Today
Quiz/Homepage -> ProgressStore -> browser localStorage

Later
Quiz/Homepage -> ProgressStore -> local cache
                               -> authenticated sync adapter -> database
```

When account support is added:

1. Authenticate a user through the selected provider.
2. Obtain a stable authenticated user ID from the backend/provider.
3. Fetch the remote progress profile.
4. Call `ProgressStore.mergeProfile(remoteProfile)` to combine local and remote state.
5. Assign `profile.userId` and increment/update `syncVersion` as appropriate.
6. Persist the merged profile locally and remotely.
7. Route all later saves through a sync adapter with retry/offline handling.

### Merge rules

Define predictable rules now:

- `bestScore`: retain the higher value.
- `attempts`: use the larger value or a safely combined total if attempts can be uniquely identified later.
- `lastActivityAt`: retain the most recent timestamp.
- `completedAt`: retain the most recent non-null completion timestamp.
- `status`: completed outranks in-progress; in-progress outranks not-started.
- `questionOrder` / `resumeIndex`: prefer the state with the most recent `lastActivityAt`.
- `lastActive`: choose the most recently updated available chapter.

Avoid collecting personally identifying data in the progress object. The future account record should link an authenticated user ID to this profile, not embed credentials in it.

## Testing Checklist

Before opening a pull request or merging:

### Navigation

- Homepage exposes Chapters 26–30 without a dropdown.
- Chapter 26, 27, and 28 links load their intended quiz data.
- Chapter 29 and 30 show Coming soon and do not create broken quiz links.
- Direct URLs such as `quiz.html?unit=unit6&chapter=ch27` work.
- Bad URLs show a helpful unavailable state.
- Quiz header can return users to chapter selection.

### Progress

- Answering a question creates/updates one versioned profile.
- Reloading resumes or clearly offers to resume the active chapter.
- Progress is independent by chapter.
- Restart resets the active attempt but keeps best-score history.
- Completion records completion and updates best score correctly.
- Homepage reflects current progress, recent chapter, and completion status.
- Existing legacy progress keys migrate without destroying data.
- The site remains usable if localStorage fails.

### Future readiness

- No quiz or homepage component accesses the new local-storage key directly; use `ProgressStore`.
- `exportProfile`, `importProfile`, and `mergeProfile` return valid profiles.
- The profile contains no credentials or personal identifiers.
- The documented merge rules are implemented or clearly marked for the later sync phase.

## Implementation Order

1. Add `unit6-chapters.js`.
2. Add and manually test `progress-store.js` in isolation.
3. Integrate the progress store into `quiz.html` while preserving existing question rendering and feedback behavior.
4. Add the homepage chapter picker and progress display in `arabic.html`.
5. Manually test Chapters 26–28 plus unavailable Chapters 29–30 on mobile and desktop widths.
6. Verify browser refresh/restart/resume behavior.
7. Commit on `feature/arabic-chapter-progress`.
8. Create a draft pull request for review; do not merge without approval.

## Guardrails

- Preserve the current Material-style mobile design.
- Preserve Arabic Unicode and `lang="ar"` / `dir="rtl"` handling.
- Do not overwrite or regenerate `unit6.json` unless explicitly required and separately reviewed.
- Do not add authentication, tracking, analytics, or external services in this phase.
- Do not promise persistence across devices before account sync exists; local progress belongs to the browser/device.
- Prefer additive standalone modules and narrow integration changes over a broad rewrite.
