# Quiz Engine & Progress Store

## Quiz Changes ✅ Done

`arabic/quiz.html` reads `unit`/`chapter`/`mode` from the URL, validates against the fetched JSON, renders questions with shuffled choice position, saves progress after each answer, and shows a completion screen with a next-chapter link. Also includes the "Mark as known" toggle and per-word recordAnswer wiring (see [known-vocabulary.md](known-vocabulary.md)), and the flag control (see [content-quality-control.md](content-quality-control.md) and [flag-attribution.md](flag-attribution.md)). Signed-in flag attribution and the subsequently hidden inline notice are clarified in the [November 23 reconciliation](../SESSION_RECONCILIATION_2026-11-23.md); reports are no longer uniformly anonymous.

## Local-First Progress Store ✅ Done

`arabic/progress-store.js` exposes `window.ProgressStore` with `getProfile`, `saveProfile`, `getChapter`, `updateChapter`, `setLastActive`, `resetCurrentAttempt`, `recordAnswer`, `markWordKnown`, `markWordUnknown`, `isWordKnown`, `getKnownWordCount`, `getKnownWords`, `exportProfile`, `importProfile`, `mergeProfile`, `clearLocalProfile`. Stored under one versioned key, `arabicStudy.profile.v1`, with legacy-key migration and defensive parsing.

### Merge rules (for future account sync)

- `bestScore`: retain the higher value. `lastActivityAt`/`completedAt`: retain the most recent. `status`: completed > in-progress > not-started. `lastActive`: most recently updated available chapter. `knownWords`: merged monotonically per word (known status never reverts during a merge; streak takes the max). No personally identifying data belongs in the progress object.

## Quiz Direction Mode (English-to-Arabic) ✅ Done

`quiz.html?...&mode=en-to-ar` reverses the prompt/answer roles: the correct English meaning becomes the prompt, the Arabic word becomes the correct choice, and distractors are Arabic words sampled from other questions in the same chapter. Covers 100% of a chapter's vocabulary. Tracked as a separate `ProgressStore` record (`ch26:en-to-ar`) from the default direction. `lang`/`dir` attributes flip correctly between prompt and choices depending on direction.

## Known Issue: Quiz Does Not Resume from Saved Progress — Superseded

This issue, as originally described (resuming at a saved linear question index within a reshuffled session), is superseded by the Known Vocabulary (Mark as Known) feature. Per-word known tracking removes the need for session-position resumption entirely: a session can start fresh every time because progress is tracked per word, not per slot in a shuffled list. No fix to session-position resumption will be implemented; this is a deliberate design change, not an open bug.

## Shared bottom controls — 2026-11-23

Implementation commit: `c9b8d70`. The final build step, `scripts/prepare-navigation.mjs`, moves the existing audio and flag buttons from the upper question-actions row into the existing bottom action-area. It reuses their complete markup, IDs, and handlers rather than creating duplicate controls.

Bottom row, physically left to right:

1. Audio (`#audio-button`).
2. Choose an answer / Check answer / Continue (`#next-button`).
3. Flag (`#flag-button`).

The row uses `44px minmax(0,1fr) 44px` columns, 10px gaps, centered vertical alignment, and explicit left-to-right layout. Audio and flag have 44px square touch targets. The center action fills its remaining column, with 12px horizontal padding and `min-width:0` for narrow layouts. The existing auto top margin keeps the action area at the bottom of a sufficiently tall quiz screen; this change does not introduce fixed/sticky positioning or prevent scrolling when content is taller than the viewport.

Mark as known remains in the upper row, explicitly placed in the third grid column to retain its upper-right position after the other two controls leave. The question prompt, choices, and feedback remain above the bottom actions.

This is one transformation of the shared quiz template, without direction-specific layout branching. It applies to Arabic-to-English, English-to-Arabic, chapter and unit quizzes; written-answer mode also inherits it. Layout changes do not alter scoring, answer submission, saved progress, known-word behavior, pronunciation eligibility, immediate selected-choice speech, flag identity fields, or retry logic. In particular, moving audio does not unlock pre-answer correct-answer speech in English-to-Arabic mode.

## Pop-up placement above controls — 2026-11-23

Implementation commit: `150323a`. A subsequent screenshot showed the word-flag confirmation overlapping the center action. The build now relocates the existing `#snackbar` element inside `.quiz-bottom-controls` and makes that row its relative-positioning anchor. The snackbar uses absolute positioning, `left:50%`, and `bottom:calc(100% + 12px)`. It remains centered over the symmetric bottom row/center action, above rather than over the buttons.

The 12px offset is measured from the action area's top edge. Existing top padding in the action area adds clearance from the actual button edges, so the intended settled gap is at least 12px, not an exact 12px from the button. Width is content-sized and capped at the smaller of the row width or 420px, with normal wrapping, emergency long-word wrapping, and centered text.

The original snackbar ID, role/status and polite live-region attributes, messages, 2.5-second dismissal timer, pointer-events behavior, and show/hide animation remain. Its existing entrance translation is retained; the specified spacing describes its settled visible position. All quiz snackbar messages now share this anchor, including delivery, queued-report, and audio-related feedback. Since it is inside the quiz screen, it is also hidden when that parent screen is hidden. It is no longer independently fixed to the viewport and follows the action row when the document scrolls.

## Build ownership and maintenance

Both layout changes live in `scripts/prepare-navigation.mjs`, not directly in checked-in `quiz.html`. The helper runs last in the current Netlify preparation chain, after flag attribution has been injected and before publishing. It preserves its earlier notice-commenting and Settings placeholder work. See the [session reconciliation](../SESSION_RECONCILIATION_2026-11-23.md) for the full six-step pipeline, earlier audio changes, navigation behavior, and verification boundaries.

Build marker styles `quiz-bottom-controls-styles` and `quiz-snackbar-anchor-styles` prevent duplicate transformation in a prepared workspace. The helper asserts expected button, action-area, snackbar, and head structure; changing that source markup requires reviewing the helper. Preserve unique element IDs and the action wrapper used as the snackbar anchor. Local previews must run the configured preparation chain to match deployed output. No new package, backend endpoint, schema, storage key, or credential was introduced by these two changes.

## Verification still pending

The user screenshot after the first layout commit shows bottom controls and an overlapping flag-success message. It demonstrates that observed layout/overlap, not cross-mode correctness or a security/backend audit. No screenshot or assistant browser test has verified the final snackbar spacing fix.

- Run the complete build in a clean checkout; inspect generated markup and run again to check duplicate protection.
- Confirm exactly one audio button, flag button, next button, and snackbar; confirm upper-right known control and bottom order.
- Test Arabic-to-English and English-to-Arabic in chapter and unit quizzes, plus written-answer mode.
- Check correct/incorrect selections, repeated Arabic-choice speech, audio eligibility before/after submission, known-word advancement, and unchanged scoring/progress.
- Test flag delivery/queue/error messages and long text, plus the audio snackbar. Ensure timing, announcements, and noninteractive pop-up behavior remain usable.
- Inspect settled and animated spacing on narrow iPhones, landscape/short screens, larger fonts, both themes, and desktop. Check whether the pop-up obscures choices/feedback on cramped screens; no collision-avoidance system was added.
- Check virtual-keyboard and document-scroll behavior in written-answer mode, and asynchronous messages after leaving the quiz screen.
- Verify published build success and actual rendering; a successful Git commit alone is not deployment verification.
