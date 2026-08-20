# Unit Navigation and Progress (Unit-Agnostic)

## Purpose

This document describes the intended implementation for expanding the Arabic quiz experience from a Chapter 26-only entry point into an easy-to-navigate, multi-chapter experience — designed from the outset to be unit-agnostic. Adding a new unit later (Unit 7, Unit 8, etc.) should require adding a content file and a manifest entry, not new HTML pages or engine changes. It also defines a local-first learner-progress design that can later connect to Google, Apple, email/password, or another account provider without rewriting quiz logic.

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
- Its hero "Start studying" link currently opens `quiz.html?unit=unit6&chapter=ch26` directly.
- `quiz.html` already reads `unit` and `chapter` from URL query parameters.
- `quiz.html` fetches `data/${unit}.json` and selects a chapter from the file's `chapters` object.
- The quiz currently stores a small, chapter-specific local-storage object under a key like `arabicStudyProgress:unit6:ch26`.
- The supplied `unit6.json` includes at least `ch26`, `ch27`, and `ch28`; Chapters 29 and 30 should be displayed as unavailable until their question data is added.

Important: preserve all existing question content in `arabic/data/unit6.json`. The intended first implementation does not require rewriting that file.

## Content Contract

Every unit's JSON file must conform to the same shape, regardless of subject matter. This is what makes the quiz engine unit-agnostic: the engine renders whatever conforms to this contract, without knowing what unit or subject it belongs to.

```json
{
  "unitId": "unit6",
  "title": "Unit 6 Vocabulary",
  "chapters": {
    "ch26": {
      "number": 26,
      "title": "Chapter 26",
      "questions": []
    },
    "ch27": {
      "number": 27,
      "title": "Chapter 27",
      "questions": []
    }
  }
}
```

Rules:

- File location: `arabic/data/{unitId}.json`, one file per unit.
- Top-level `unitId` must match the filename (`unit6.json` -> `"unitId": "unit6"`).
- `chapters` is an object keyed by chapter ID (`ch26`, `ch27`, ...), not an array. This allows lookups by ID without scanning.
- Each chapter's `questions` array holds the actual quiz content. The internal question shape is unchanged from the existing `unit6.json` structure — this contract does not require rewriting existing question data.
- Adding a new unit means adding a new file that satisfies this contract. No changes to `quiz.html`, the manifest helper API, or `progress-store.js` are required.
- The manifest (below) is display/routing metadata only and is never a substitute for this contract. `quiz.html` must always validate that the fetched JSON actually contains the requested chapter before rendering.

## Target User Flow

```text
Arabic homepage
  |
  +-- Continue studying
  |     +-- opens the learner's most recently active available chapter
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
  +-- loads selected chapter's questions
  +-- records local progress after each answered question
  +-- offers Change chapter and Back to study
  +-- presents next available chapter after completion when appropriate
```

## Units and Chapters Manifest

Add a single standalone JavaScript file, unit-agnostic by design:

```text
arabic/data/units-manifest.js
```

This file holds display and routing metadata for every unit, separately from the raw question data. It is keyed by unit ID so that adding a new unit is an additive change to one file, not a new file per unit:

```js
window.UNITS_MANIFEST = {
  unit6: {
    title: 'Unit 6 Vocabulary',
    chapters: [
      { id: 'ch26', number: 26, title: 'Chapter 26', available: true },
      { id: 'ch27', number: 27, title: 'Chapter 27', available: true },
      { id: 'ch28', number: 28, title: 'Chapter 28', available: true },
      { id: 'ch29', number: 29, title: 'Chapter 29', available: true },
      { id: 'ch30', number: 30, title: 'Chapter 30', available: true }
    ]
  }
  // Future units are added the same way, e.g. unit7: { title: '...', chapters: [...] }
};
```

A small helper API (`window.UnitsManifest`) wraps this object so callers never reach into `window.UNITS_MANIFEST` directly:

```js
window.UnitsManifest = {
  listUnits(),
  getUnit(unitId),
  listChapters(unitId),
  getChapter(unitId, chapterId),
  getAvailableChapters(unitId),
  getNextAvailableChapter(unitId, currentChapterId)
};
```

Rules:

- A chapter is only `available: true` once its data exists in the corresponding `data/{unitId}.json` and has been tested.
- Keep the manifest as the homepage's source of truth for chapter cards, status labels, ordering, and next-chapter behavior — for every unit, not just Unit 6.
- The quiz must still validate that a selected chapter actually exists in the fetched data (per the Content Contract). The manifest is not a replacement for validation.
- Do not create a per-unit manifest file (e.g. `unit7-chapters.js`). All units live as entries in the one manifest.

## Homepage Changes

Update `arabic/arabic.html`.

### Primary actions

Replace the fixed Chapter 26 "Start studying" behavior with either:

- A **Choose a chapter** action that opens/jumps to a visible Unit 6 chapter section; or
- A primary button that continues the last active available chapter, plus a clearly visible secondary "Choose chapter" action.

Use large, tappable cards on mobile. Do not hide five chapters inside a dropdown.

### Homepage progress

Read the progress profile through `ProgressStore` (defined below). Show:

- Last active chapter.
- Completed or answered question count for that chapter.
- Best score and/or last score if the user completed it.
- A progress bar for the current/most-recent chapter.
- A per-chapter status: Not started, In progress, Completed, or Coming soon.
- Continue behavior should prefer the profile's `lastActive` chapter when it is still available; otherwise it should fall back to Chapter 26.

## Quiz Changes

Update `arabic/quiz.html`.

### Routing and validation

Keep the current query-parameter model:

```text
quiz.html?unit=unit6&chapter=ch27
```

Sanitize both values. If the requested unit/chapter is unknown, missing, unavailable, or has no questions, show a helpful unavailable screen with a back-to-study action rather than an empty or broken quiz.

### Rendering engine

`quiz.html` itself should contain no unit-specific or subject-specific logic. It is a thin shell: read `unit`/`chapter` from the URL, `fetch('data/' + unit + '.json')`, validate the response against the Content Contract, then render.

### Header controls

Keep the existing exit button. Add a chapter-switch control that returns to the homepage's Unit 6 chapter picker (`arabic.html#unit6-chapters`).

### Progress saving

Call the shared progress module after each question is checked, not only at chapter completion. Restart creates a new attempt state and keeps historical best-score data. Completion updates the chapter's best score only if the new score is higher.

### Completion screen

Display score, personal best, practice-again, back-to-picker, and the next available chapter when one exists.

## Local-First Progress Store

Add a standalone file:

```text
arabic/progress-store.js
```

Use a versioned profile stored under one stable key: `arabicStudy.profile.v1`. Do not store user credentials, tokens, email addresses, or authentication information in this client-only profile.

### Required API

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

Implementation requirements: defensive JSON parsing with a valid default profile fallback; migrate legacy chapter keys once; keep `schemaVersion` for future migrations; update `updatedAt` on every change; clone-safe returns; graceful handling if localStorage is unavailable.

## Future Account Sync Design

The concrete implementation of this phase is specified in the "Account Authentication (Google + Magic Link)" section below. The rules stated here continue to apply.

### Merge rules

- `bestScore`: retain the higher value.
- `attempts`: use the larger value or a safely combined total if attempts can be uniquely identified later.
- `lastActivityAt`: retain the most recent timestamp.
- `completedAt`: retain the most recent non-null completion timestamp.
- `status`: completed outranks in-progress; in-progress outranks not-started.
- `questionOrder` / `resumeIndex`: prefer the state with the most recent `lastActivityAt`.
- `lastActive`: choose the most recently updated available chapter.

Avoid collecting personally identifying data in the progress object. The account record should link an authenticated user ID to this profile, not embed credentials in it.

## Testing Checklist

### Navigation

- Homepage exposes Chapters 26-30 without a dropdown.
- All chapter links load their intended quiz data.
- Direct URLs such as `quiz.html?unit=unit6&chapter=ch27` work.
- Bad URLs show a helpful unavailable state.
- Quiz header can return users to chapter selection.

### Progress

- Answering a question creates/updates one versioned profile.
- Reloading resumes or clearly offers to resume the active chapter.
- Progress is independent by chapter.
- Restart resets the active attempt but keeps best-score history.
- Completion records completion and updates best score correctly.
- Existing legacy progress keys migrate without destroying data.
- The site remains usable if localStorage fails.

### Future readiness

- No quiz or homepage component accesses local-storage keys directly; use `ProgressStore` and `UnitsManifest`.
- `exportProfile`, `importProfile`, and `mergeProfile` return valid profiles.
- The profile contains no credentials or personal identifiers.

## Quiz Direction Mode (English-to-Arabic)

### Purpose

Every question in a chapter's data already pairs one Arabic word with one English meaning (`arabic` + the correct entry in `choices`, identified by `answer`). This section adds a second quiz direction that mirrors that same pairing instead of duplicating it: English-to-Arabic mode shows the English meaning as the prompt and requires selecting the correct Arabic word from among distractor words drawn from the same chapter.

This is a **rendering-direction feature**, not a new content type. No new fields are required in `unit6.json` or any future unit's data file.

### Coverage rule

English-to-Arabic mode covers 100% of a chapter's vocabulary. There is no minimum-question threshold and no partial coverage.

### URL and routing

```text
quiz.html?unit=unit6&chapter=ch26&mode=ar-to-en   (default)
quiz.html?unit=unit6&chapter=ch26&mode=en-to-ar   (new direction)
```

Any value other than `ar-to-en` or `en-to-ar` falls back to `ar-to-en`.

### Reversal logic

- **Arabic-to-English**: prompt is `q.arabic`. Correct choice is `q.choices[q.answer]`. Distractors are the other entries in `q.choices`.
- **English-to-Arabic**: prompt is `q.choices[q.answer]`. Correct choice is `q.arabic`. Distractors are `arabic` values sampled from the other questions in the same chapter, excluding the current question's own word, then shuffled for on-screen position.

### Rendering and language attributes

Direction changes which side needs Arabic typography and RTL handling. Arabic-to-English: prompt is `lang="ar" dir="rtl"`. English-to-Arabic: prompt is plain English LTR, and each Arabic choice is individually marked `lang="ar" dir="rtl"`.

### Progress tracking

English-to-Arabic attempts are tracked as a separate chapter record: `ch26` for Arabic-to-English, `ch26:en-to-ar` for English-to-Arabic. `UnitsManifest` chapter entries are unchanged; direction is a quiz-session setting.

### Testing checklist additions

- English-to-Arabic covers exactly the same questions as Arabic-to-English for that chapter.
- Distractor Arabic words are never duplicates within a single question.
- Arabic renders correctly with `lang="ar" dir="rtl"` whether as prompt or choice.
- Progress for the two directions of a chapter are tracked independently.

## Account Authentication (Google + Magic Link)

### Purpose

This section replaces the placeholder "Future Account Sync Design" phase with a concrete implementation. It adds real sign-in so learners can access their progress across devices, using two methods: Google sign-in for users who want it, and passwordless email (magic link) for users who do not want to use a Google account. No passwords are ever stored.

This is the first feature in this document requiring a backend. All backend logic runs as Node.js serverless functions via Netlify Functions, deployed from this same repository — there is no separate server to provision or manage.

Netlify Functions execute as standard Node.js. Writing a file such as `netlify/functions/auth-google-callback.js` with a normal `exports.handler` signature is Node code; Netlify runs it in a Node runtime automatically on every deploy through the same GitHub integration already deploying this site. This is not an alternative to Node and is not related to GitHub Actions (which runs CI/CD scripts, not live API endpoints) — it is Node, running in this repository, deployed the same way every other change in this document has been deployed. No separate Node server, hosting account, or additional deploy pipeline is required.

### Architecture

```text
Browser (arabic.html / quiz.html)
  |
  +-- ProgressStore (existing, unchanged)
  |
  +-- Auth client (new, thin wrapper)
        |
        +-- Netlify Functions (Node, in netlify/functions/)
              |
              +-- Google OAuth callback handler
              +-- Magic-link request + verify handlers
              +-- Session issuance
              |
              +-- Netlify DB (Postgres)
                    |
                    +-- users table
                    +-- progress table (or JSON profile blob per user)
```

### Google sign-in setup

1. Create an OAuth 2.0 client ID in Google Cloud Console, scoped to this site's production and Netlify preview domains.
2. Store the client ID and client secret as Netlify environment variables (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`). Never commit these to the repository.
3. Add a Netlify Function (e.g. `netlify/functions/auth-google-callback.js`) that completes the OAuth redirect flow and issues a session.
4. On successful sign-in, the function returns a stable Google-provided user ID. This becomes `profile.userId` in the existing `ProgressStore` schema.

### Magic-link email setup

1. User submits their email address in a lightweight sign-in form (no password field).
2. A Netlify Function (e.g. `netlify/functions/auth-magic-link-request.js`) generates a signed, time-limited token tied to that email address and stores a pending-verification record.
3. The same function sends an email containing a link back to the site with the token, via a transactional email API (a service such as Resend, Postmark, or SendGrid — the specific provider is an implementation choice made when this is built, not fixed here). The provider's API key is stored as a Netlify environment variable, never committed.
4. When the user clicks the link, a verification function (e.g. `netlify/functions/auth-magic-link-verify.js`) checks the token, and if valid and not expired, issues a session and returns a stable user ID derived from the verified email address.
5. Magic links expire after a short window (a reasonable default is 15 minutes) and are single-use. A used or expired token must fail verification with a clear "request a new link" message, not a silent failure.

### Session handling

- Sessions are represented by a signed, httpOnly session cookie or token issued by the relevant auth function, not by storing credentials client-side.
- The browser's auth client checks for an existing valid session on page load and, if present, treats the user as signed in without requiring them to sign in again.
- Signing out clears the session token and does not delete local `ProgressStore` data — a signed-out user keeps their local-only progress, consistent with the existing local-first design.

### Data storage

Add to Netlify DB (Postgres):

- A `users` table: stable user ID, auth method (`google` or `magic-link`), email (for magic-link users) or Google account identifier, `createdAt`.
- A `progress` table or column: the user's merged `ProgressStore`-shaped profile, keyed by user ID, updated on sync.

### Sync behavior

On successful sign-in:

1. Fetch the remote profile for that user ID from Netlify DB, if one exists.
2. Call the existing `ProgressStore.mergeProfile(remoteProfile)` to combine local and remote state, using the merge rules already defined above. Those rules are unchanged by this section.
3. Persist the merged profile back to Netlify DB via a Netlify Function.
4. On every subsequent progress update during the session, sync the change to the backend using the same merge-then-save pattern, with reasonable retry/offline handling — if the sync call fails, keep the local save and retry later rather than blocking the quiz.

### Rules

- Do not implement password-based authentication. Google and magic-link are the only two sign-in methods.
- Do not store credentials, tokens, or session secrets in client-side code, `localStorage`, or the repository. All secrets are Netlify environment variables.
- Do not require sign-in to use the quiz. Anonymous, local-only progress must continue to work exactly as it does today.
- Magic-link tokens must be single-use and expire. Do not issue non-expiring links.
- The existing `ProgressStore` API is not changed by this feature. Auth is an additive layer that calls this existing API; it does not replace it.

### Testing checklist additions

- A new user can sign in with Google and a `users` record is created with a stable ID.
- A new user can request a magic link, receive an email, and sign in by clicking it.
- An expired or already-used magic link fails verification with a clear message.
- Local progress made before signing in is preserved and merged correctly after sign-in, not overwritten.
- Signing out preserves local `ProgressStore` data and does not sign the user into someone else's session.
- The quiz remains fully usable, with local-only progress, for a user who never signs in.

## Content Quality Control

### Purpose

Arabic vocabulary content must be verified as accurate — word, transliteration if present, and English meaning — before it is treated as trustworthy. This section adds two things: a lightweight verification-tracking convention for content, and a permanent flag-a-question feature so any user can report a question they believe is incorrect. Reported flags must reach a place the site owner will actually see them, not disappear into a single user's local storage.

### Content verification tracking

Extend the Content Contract's question shape (additive, optional field, no change to any existing required field):

```json
{
  "arabic": "عرض",
  "choices": { "A": "to show", "B": "...", "C": "...", "D": "..." },
  "answer": "A",
  "verified": true
}
```

Rules:

- `verified` is optional. Its absence is treated as not-yet-verified, not as incorrect.
- Setting `verified: true` is a manual, deliberate action after a human review of that word, its meaning, and its distractors — not a default and not something the quiz engine sets automatically.
- The quiz engine does not currently need to display verification status to learners. This field exists so verification progress can be tracked and queried without needing a separate document. Surfacing this in the UI is a future, separate decision.

### Flag-a-question feature

Add a flag control to the quiz screen in `quiz.html`, available on every question regardless of sign-in status:

- A small, unobtrusive icon button near the question with an accessible label such as "Report this question."
- Tapping it opens a minimal inline confirmation, optionally allowing the user to select a reason (e.g. "Arabic looks wrong," "English meaning seems off," "Answer choices are confusing") or leave it blank.
- Submitting a flag does not interrupt the quiz; the user continues answering normally.

### Flag data captured

- Unit ID, chapter ID, and the question's identifying data (the `arabic` text and the `answer` key at minimum).
- The selected reason, if any.
- The current quiz mode (`ar-to-en` or `en-to-ar`), since a flag raised in one direction may point to a distractor-selection issue specific to that direction rather than the underlying word pair.
- The signed-in user ID if signed in, or a clear `anonymous` marker if not. Flagging must work fully for anonymous users.
- A timestamp.

### Flag delivery

- A Netlify Function (e.g. `netlify/functions/report-question-flag.js`) receives the flag submission from the browser.
- The function appends a row to a Google Sheet using the Google Sheets API, authenticated with a dedicated Google service account created for this purpose.
- The service account's credentials are stored as a Netlify environment variable (e.g. `GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY`) and are never committed to the repository. This is a separate credential from the Google OAuth client used for sign-in.
- The target spreadsheet ID is also stored as a Netlify environment variable, not hardcoded in client or function code.
- If the Sheets API call fails, the function should still return a success response to the user's flag submission if the flag was otherwise durably queued or retried server-side, rather than surfacing backend failures to the learner mid-quiz.

### Rules

- Flagging must never block or interrupt quiz progress. It is fire-and-forget from the learner's perspective.
- Flag data is written to the Google Sheet, not to `ProgressStore` or `localStorage`.
- Do not require sign-in to flag a question.
- Do not display other users' flags or flag counts to learners.

### Testing checklist additions

- Flagging a question while signed out succeeds and appears in the Google Sheet marked `anonymous`.
- Flagging a question while signed in includes the correct user ID in the logged row.
- Flagging works identically in both quiz directions, and the logged row correctly records which direction was active.
- Flagging does not disable the Next/Check answer button or otherwise interrupt the current attempt.
- A `verified: true` question and an unverified question render and function identically to the learner at this stage.

## Implementation Order

1. Add `data/units-manifest.js`.
2. Add and manually test `progress-store.js` in isolation.
3. Integrate the progress store and the rendering engine into `quiz.html`.
4. Add the homepage chapter picker and progress display in `arabic.html`, driven by `UnitsManifest`.
5. Manually test all chapters on mobile and desktop widths.
6. Verify browser refresh/restart/resume behavior.
7. Verify unit-agnosticism with a throwaway second unit fixture, then remove it before opening a PR.
8. Implement the English-to-Arabic direction mode, reusing the existing engine.
9. Set up Netlify Functions scaffolding and the Google OAuth client, then implement Google sign-in per the Account Authentication section.
10. Implement magic-link email sign-in, including the transactional email provider integration.
11. Set up Netlify DB and wire up profile sync (fetch, merge, persist) for both sign-in methods.
12. Add the `verified` field convention to the Content Contract and begin tracking verification status for existing chapters.
13. Implement the flag-a-question feature in `quiz.html`, the Google Sheets logging Netlify Function, and the dedicated Sheets service account credential.
14. Test account authentication, sync, and the flag feature per their testing checklists before opening a pull request.

## Guardrails

- Preserve the current Material-style mobile design.
- Preserve Arabic Unicode and `lang="ar"` / `dir="rtl"` handling.
- Do not overwrite or regenerate `unit6.json` unless explicitly required and separately reviewed.
- Do not add authentication, tracking, analytics, or external services in phases before this document specifies them.
- Prefer additive standalone modules and narrow integration changes over a broad rewrite.
- Do not introduce unit-specific or subject-specific logic into `quiz.html`, `progress-store.js`, or the manifest helper API.
- Do not introduce quiz-direction-specific logic outside the single reversal function. Both directions share `ProgressStore`, `UnitsManifest`, and the shuffle mechanism.
- Do not implement password-based login. Google and magic-link only.
- Do not store any authentication secret, API key, or service account credential in the repository. All such values are Netlify environment variables.
- Do not make sign-in a requirement for using the quiz or for flagging a question.
- Do not surface flag data or verification status as a public-facing feature without a separate, explicit decision to do so.
- Do not let a failed backend sync (auth sync or flag logging) block or degrade the core quiz experience; both must fail gracefully.
