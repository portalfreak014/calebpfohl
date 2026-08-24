# Content Quality Control (Anonymous Flagging) ✅ Done

## Purpose

Tracks Arabic content accuracy and lets any user report a question they believe is wrong, without requiring sign-in. Flagging is anonymous-only by design; there is no signed-in identity concept anywhere in this feature.

## Content verification tracking ⏳ Planned

Optional `verified: true` field, to be added to a question once a human has reviewed the word, meaning, and distractors. Absence means not-yet-verified, not incorrect. Not shown to learners. Not yet implemented.

## Flag-a-question feature ✅ Implemented

- A flag icon sits next to the "Mark as known" control on the quiz screen, visually distinct from it, available regardless of anything else on the page. Submitting never interrupts the quiz.
- Captures: unit ID, chapter ID, quiz mode, the Arabic text, and the correct answer, plus a timestamp. There is no signed-in/anonymous identity field — every report is anonymous.
- `netlify/functions/report-question-flag.js` appends a row to a Google Sheet ("Flags" tab) via the Sheets API, using a dedicated Google service account (separate from any future OAuth credential), with the service account key and spreadsheet ID stored as Netlify environment variables, never committed.
- If the endpoint call fails or is unreachable, the report is stored in a local retry queue (`arabicStudy.anonymousFlagQueue.v1` in `localStorage`, capped at 50 entries) instead of being lost. The queue is flushed automatically on quiz load and after each subsequent flag action.
- Learner feedback: a snackbar reads "Word flagged for correction, thank you!" on successful delivery. When a report is only queued locally (delivery failed), the UI should show a distinct message such as "Saved to send later" so a queued report is never presented as already delivered. As of the latest commit on `main`, both paths currently show the same success message; this discrepancy is noted as a follow-up, not yet corrected.
- `googleapis` was added as a dependency in `package.json` alongside the existing `@netlify/blobs` dependency to support the Sheets API call.

## Rules

- Flagging never blocks the quiz and never requires sign-in — it is anonymous-only, full stop. Flag data goes to the Sheet, never to `ProgressStore` or `localStorage` (aside from the transient local retry queue, which only exists to survive a failed network call and is cleared once delivered). Flags and verification status are never shown publicly to learners.

## Testing checklist

- [x] Flagging works without sign-in and without any identity field.
- [ ] Flagging works identically in both quiz directions and records which was active.
- [x] Flagging never disables the answer/next button.
- [x] A submitted flag appears as a new row in the `Flags` tab of the configured Google Sheet.
- [ ] A failed submission is queued locally and successfully retried once the endpoint is reachable again.
- [ ] The success message and the queued/offline message are made visibly distinct (see note above).
