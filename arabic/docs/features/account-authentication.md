# Account Authentication (Google + Magic Link) ⏳ Planned

Intentionally sequenced after Known Vocabulary shipped and is manually verified, so `mergeProfile()` only needs to handle one finished profile shape rather than being updated twice. Not started; no auth-related code exists in the repository yet.

## Purpose

Adds real sign-in via Google OAuth and passwordless magic-link email, so learners can access progress across devices. No passwords are ever stored. Backend logic runs as Node.js serverless functions via Netlify Functions, deployed from this same repository — there is no separate server to provision. Netlify Functions execute as standard Node.js; a file like `netlify/functions/auth-google-callback.js` with a normal `exports.handler` signature is Node code, run automatically through the same GitHub integration already deploying this site. This is unrelated to GitHub Actions (CI/CD scripts, not live endpoints) and requires no separate Node server or hosting account.

## Setup

- [ ] Google OAuth 2.0 client in Google Cloud Console; client ID/secret stored as Netlify environment variables, never committed.
- [ ] `netlify/functions/auth-google-callback.js` completes the OAuth flow and issues a session; the returned stable Google user ID becomes `profile.userId`.
- [ ] Magic-link: `netlify/functions/auth-magic-link-request.js` generates a signed, single-use, 15-minute-expiring token and sends it via a transactional email API (Resend/Postmark/SendGrid — provider chosen at build time); `netlify/functions/auth-magic-link-verify.js` validates it and issues a session.
- [ ] Sessions are a signed httpOnly cookie/token, never stored client-side as raw credentials. Signing out clears the session but preserves local `ProgressStore` data.
- [ ] Netlify DB (Postgres): a `users` table (user ID, auth method, email/Google ID, createdAt) and a `progress` table/column holding the synced profile.

## Sync behavior

On sign-in: fetch remote profile, call the existing `ProgressStore.mergeProfile(remoteProfile)` using the merge rules already defined in [quiz-engine-and-progress.md](quiz-engine-and-progress.md), persist the merged result, and sync every subsequent update with retry/offline handling that never blocks the quiz on failure.

## Rules

- No password-based auth. No secrets in client code, `localStorage`, or the repo — Netlify environment variables only. Sign-in is never required to use the quiz. Magic-link tokens are single-use and expiring. The existing `ProgressStore` API is not changed by this feature.

## Testing checklist additions

- [ ] Google sign-in creates a stable `users` record.
- [ ] Magic-link request/verify round-trip works; expired/used tokens fail with a clear message.
- [ ] Local progress made before sign-in merges correctly afterward, not overwritten.
- [ ] Signing out preserves local progress. The quiz remains fully usable for a user who never signs in.
