# Data Caching and Sign-in Progress Migration

## Status

Planned. This specification addresses two learner-facing reliability problems:

1. Vocabulary and manifest data should not feel like it is downloaded from scratch on every visit.
2. Signing in with Google must safely adopt existing browser-local progress into that Google account without overwriting either local or cloud learning history.

This is an original implementation plan. It must not copy third-party code, branding, or interface assets.

## Data caching goals

- Cache static learning data: unit manifests, vocabulary JSON, and other versioned read-only content.
- Serve cached content immediately when available, then refresh in the background when the network is available.
- Keep learning activities usable on repeat visits and during brief connectivity loss.
- Never cache authenticated Firestore progress as an authoritative replacement for `ProgressStore` or Firestore.
- Do not cache sensitive authentication responses, Firebase tokens, or private user data in application-managed caches.

## Cache design

Use a versioned service-worker cache for same-origin, public static assets:

- Cache name format: `arabic-study-static-v{n}`.
- Precache the app shell required to launch the study experience: `arabic.html`, `quiz.html`, `match.html`, future `flashcards.html`, shared scripts, styles, and the units manifest.
- Use stale-while-revalidate for vocabulary JSON and the unit manifest: return a cached valid response immediately, fetch a newer copy in the background, and replace the cache only after a successful response.
- Use cache-first for immutable local assets such as icons and fonts when licensing permits local hosting.
- Use network-first with a cached fallback for HTML documents so deployments become visible promptly while repeat loads remain resilient.
- Cache only successful `GET` responses from the same origin. Respect version changes by deleting obsolete `arabic-study-*` caches during service-worker activation.

## Content freshness

- Every vocabulary or manifest change must update a content version in the manifest or cache name.
- When cached content updates, show no disruptive prompt during an active quiz, match, or flashcard session. Apply the new content at the next activity launch.
- Provide a small optional "Update available" action on the home page after a service-worker update is ready; never silently discard an in-progress activity.
- Add a visible offline state only when current data is unavailable. If cached data is available, allow study to continue normally.

## Sign-in migration problem

The current sign-in path merges the browser profile with the cloud profile, but a profile already marked with a different `userId` can be incorrectly treated as ordinary local progress. That risks blending one person's shared-browser history into another person's account. It also lacks explicit migration metadata, conflict reporting, and a recovery path.

## Required migration behavior

1. Before Google sign-in hydration, read the local profile and its `userId`.
2. If the local profile is anonymous (`userId: null`), classify it as eligible local progress and merge it with the signed-in user's Firestore profile.
3. If the local profile belongs to the same Firebase UID, merge and sync normally.
4. If the local profile belongs to a different Firebase UID, do not upload or merge it automatically. Preserve it as a separate local backup and start from the signed-in user's cloud profile.
5. After a successful anonymous-to-account migration, set `userId` to the Firebase UID, record `migratedToUserId`, `migratedAt`, and a schema version, then write the merged profile to both local storage and Firestore.
6. Mark the migration complete only after Firestore acknowledges the merged write. A failed write must leave anonymous local data intact and retryable.
7. On future sign-ins to the same account, merge changes idempotently: repeating hydration must not duplicate attempts, erase known words, or downgrade a better score.

## Merge rules

- Preserve the highest `bestScore`, most recent activity/completion timestamps, strongest completion state, and the union of known words.
- Keep `latestScore`, question order, and resume position from the profile with the newer `lastActivityAt`.
- Do not automatically combine two profiles that have distinct non-null user IDs.
- Keep merge metadata separate from learner-facing chapter data.
- Increment a sync version only after a validated local or cloud merge, and retain the prior profile as a timestamped backup before destructive schema migration.

## Implementation changes

- Add a service worker such as `arabic/sw.js` and register it from the Arabic app shell.
- Add a small cache utility only if it is needed to expose cache/version state to the UI; do not duplicate browser cache logic inside every activity page.
- Extend `ProgressStore` with explicit ownership/migration helpers, for example: `getProfileOwner`, `createBackup`, `canMigrateAnonymousProfile`, `finalizeProfileMigration`, and `setProfileOwner`.
- Update `firebase-auth.js` so ownership is checked before `mergeProfile` and Firestore writes.
- Queue progress writes only after migration hydration has completed successfully.
- Add an explicit sign-out rule: sign-out ends cloud syncing but leaves the current local profile available for offline use; it does not delete progress.

## Verification checklist

- First visit loads normally; a second visit reuses cached manifest and vocabulary data while refreshing it in the background.
- A repeat visitor can open already-visited study content while temporarily offline.
- Deploying updated content refreshes the cache without breaking an active activity.
- Anonymous local progress merges into an empty Google account and appears from a second device after sync.
- Anonymous local progress merges safely with an existing Google account using the stated merge rules.
- A profile owned by Google account A is never merged into Google account B on a shared browser.
- A network or Firestore failure during first sign-in leaves the original local profile recoverable and allows a later retry.
- Sign-out does not delete local learning history.
