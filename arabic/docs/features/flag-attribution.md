# Word flag account attribution

Added 2026-11-23. Deployment and browser verification pending.

## Google Sheets schema

Existing Flags columns A-G remain Timestamp, Unit, Chapter, Quiz direction, Arabic word, Correct answer, Status. New columns H-J are Flagged by, User ID, Email. Headers are initialized automatically on a new sheet and appended on an existing sheet on the first report after deployment. Conflicting nonempty H-J headers cause reporting to fail rather than silently overwrite unrelated columns. Existing reports are not backfilled.

Signed-in reports use name, subject/UID, and email from a signature-verified Firebase ID token for project arabic-3e9b3. Blank name becomes Signed-in user; unavailable email stays blank. Signed-out reports use Anonymous and blank UID/email. Claimed names/emails/UIDs in JSON are never trusted. Bearer tokens are checked for RS256 signature, key ID, audience, issuer, subject, expiration, issued-at, and authentication time. Signing certificates are fetched from Google's Firebase certificate endpoint and cached for five minutes. This validates tokens but does not check individual token revocation. No new service-account credential is required.

All sheet cells use RAW input so report text and profile fields are not evaluated as formulas. The correction sheet must not be publicly shared if account details are to remain private. Review sharing/access before rollout. The visible quiz notice states that signed-in flags include name, UID, and email.

## Queue and attribution

The existing local queue key is retained to preserve pending reports. New queued items include the original UID, but no tokens, names, or emails. The current question is captured before waiting for authentication initialization. A fresh token is requested on send only when the current user matches that original UID. Legacy queued reports, signed-out reports, or reports retried under a different account are sent anonymously; attribution is never guessed or reassigned. Same-account token/verification failures remain queued. Offline authentication initialization failures ask the learner to retry instead of guessing their identity.

Successful sends remove only their matching entry from the latest queue. Failed sends leave all remaining entries intact. Queued reports say Saved to send later; delivery says Word flagged for correction, thank you. A full queue refuses new entries rather than silently dropping them. Reports and the privacy notice introduce no account details into analytics events.

## Build integration

scripts/prepare-glossary-quiz.mjs retains glossary preparation and additionally transforms quiz reporting, the Sheets endpoint, and content-quality documentation during Netlify builds. Those original source files therefore remain unchanged in GitHub until the build runs. netlify/functions/flag-identity.js is the new identity verifier. Build patches fail loudly when expected source structure changes. Changes are idempotent within a build workspace.

## Verification checklist

- Run the complete configured Netlify build and confirm function bundling includes flag-identity.js.
- Confirm H-J are empty or already match the new schema before the first report.
- Test signed-in reporting: name, UID, email; test missing display name and email.
- Test signed-out reports, legacy queue items, and retries after switching accounts.
- Test offline queueing, full queue, storage failures, and a failed send with multiple reports queued.
- Test expired/invalid/wrong-project tokens: reject without accepting supplied identity.
- Confirm no account data appears in analytics or logs and sheet access is restricted appropriately.
- Inspect the visible notice and mobile quiz layout.
