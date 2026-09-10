# Firebase Progress Sync and Activity Architecture

## Status

This document records the Firebase and user-interface work completed for the Arabic study app, along with the agreed direction for quiz, matching, and future learning activities.

The working branch for the current progress-sync/UI work is `feature/firebase-progress-sync`.

## Completed foundation

### Firebase project and authentication

- Firebase project: `arabic-3e9b3`.
- A Firebase Web app is registered.
- Google is enabled as the Firebase Authentication provider.
- The deployed site domain is authorized in Firebase Authentication as `calebpfohl.com` (hostnames only; do not include `/arabic`).
- Authentication is persistent: Firebase restores a signed-in session after refreshes and normally across browser restarts until the user signs out or browser/site data is cleared.

### Firestore and privacy

- Cloud Firestore was created in `nam5 (United States)` using production mode.
- User progress is stored at:

  ```text
  users/{uid}/progress/current
  ```

- The intended Firestore rule permits only an authenticated user to access their own progress document:

  ```javascript
  rules_version = '2';

  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/progress/{document} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }
  }
  ```

- Do not put service-account JSON, private keys, or other privileged server credentials in this static repository. The Firebase Web configuration contains client identifiers; Firestore rules and Firebase Authentication enforce data access.

### Local-first progress model

`arabic/progress-store.js` remains the local-first profile store. It keeps a versioned profile in browser local storage under `arabicStudy.profile.v1` and exposes functions including:

- `getProfile` / `saveProfile`
- `updateChapter` / `setLastActive`
- `recordAnswer`
- `markWordKnown` / `markWordUnknown`
- `exportProfile` / `importProfile`
- `mergeProfile`

Local progress remains useful when signed out or offline.

## Firestore synchronization

`arabic/firebase-auth.js` is the shared browser module for Firebase Authentication and cloud progress synchronization. It uses the Firebase modular CDN SDK; this static project does not need npm or a build step.

When a user signs in:

1. Firebase provides a stable authenticated UID.
2. The app reads `users/{uid}/progress/current` from Firestore.
3. The existing local profile and the cloud profile are merged through `ProgressStore.mergeProfile`.
4. The merged local profile is associated with the UID and saved locally.
5. The merged profile is written back to Firestore.

This is the migration path for existing learners: browser-local progress is not discarded at first sign-in; it is merged into the signed-in user’s cloud profile.

After hydration, profile saves are debounced before being written to Firestore. This keeps interactions responsive and reduces unnecessary writes. The page also attempts a pending write during `pagehide`.

### Important limitation

A Google login alone does not store learning data in a Google account. Firebase Authentication provides identity; Firestore provides the cross-device data store. Cross-device restore works only after the cloud-sync implementation has successfully written the profile to Firestore and the learner signs in with the same Google account.

### Sync verification

After deploying the sync branch:

1. Sign in with Google.
2. Complete or update a quiz.
3. Wait at least one to two seconds for the debounced write.
4. In Firebase Console, open **Build → Firestore Database → Data**.
5. Confirm a document exists at `users / <Firebase UID> / progress / current`.
6. Sign into the same Google account from another browser/device and confirm the cloud profile merges into local progress.
7. Do not clear data from the original browser until the Firestore document and cross-device restore have been confirmed.

## Navigation and account UI

### Homepage is the hub

`arabic.html` is the discovery and account hub. Its navigation drawer is the preferred home for account controls. The account UI must not cover learning content.

The accepted drawer pattern is:

- **Signed out:** one visually distinct but drawer-aligned outlined button labeled **Log in with Google**.
- **Signed in:** one ordinary drawer item labeled **Log out**, with a logout icon.
- Do not show the provider name, email, or avatar in the persistent signed-in menu item. Google is a sign-in method, not an account-management surface.
- Do not create a floating, fixed, bottom, or overlay account card.

Each page must contain at most one account container:

```html
<div id="firebase-auth" class="firebase-auth-drawer"></div>
```

For the homepage, place it at the end of the drawer’s **More** area, before the drawer closing tag. Duplicate `id="firebase-auth"` elements are invalid and cause JavaScript to target only the first one.

Remove legacy fixed positioning rules for `#firebase-auth`, including any `position: fixed` and mobile `bottom`/`left` overrides.

### Activity pages are focused

Quiz, matching, and future games should be self-contained learning activities rather than miniature versions of the homepage.

| Aspect | Homepage hub | Quiz/game activity |
| --- | --- | --- |
| Navigation | Hamburger drawer | Close (`X`) action |
| Account UI | Drawer only | No persistent account UI |
| Purpose | Discover, choose, resume | Focus on one learning session |
| Progress | Overview | Save quietly in background |
| Exit | Normal navigation | Return to hub or prior page |

Activity pages should load the shared progress/auth modules in this order:

```html
<script src="progress-store.js"></script>
<script type="module" src="./firebase-auth.js"></script>
```

Pages using the unit manifest should load it before `progress-store.js`. A game that does not need unit data can omit `data/units-manifest.js`.

`firebase-auth.js` should be allowed to operate without rendering visible account controls on activity pages. When no `#firebase-auth` element exists, authentication/session restoration and progress sync should remain background behavior; it should not create a fallback floating component.

## Matching game direction

The matching game should match the quiz activity pattern:

- Replace the current Home navigation control with an `X` close button.
- Keep the activity header compact: close action, title, optional set/progress information.
- Do not add a hamburger drawer, bottom navigation, or persistent login UI to the game page.

Suggested exit markup:

```html
<button class="icon-button"
        id="close-activity-button"
        type="button"
        aria-label="Exit matching game">
  <span class="material-symbols-rounded" aria-hidden="true">close</span>
</button>
```

Suggested behavior:

```javascript
document
  .getElementById('close-activity-button')
  .addEventListener('click', () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = 'arabic.html';
    }
  });
```

## Analytics

Analytics should be small, purposeful, and privacy-conscious. Use the existing `dataLayer`/Google Tag Manager integration for event recording. Do not send answer text, vocabulary terms, email addresses, Firebase UIDs, or other personal identifiers to analytics.

Recommended activity events:

- `activity_started`: activity type and selected set/chapter
- `match_completed`: set ID, matched-pair count, mistakes, duration
- `activity_exited`: set ID, progress so far, mistakes, duration, and completion status

Example helper:

```javascript
function trackEvent(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: name,
    activity: 'matching_game',
    ...params,
  });
}
```

## Progress for future games

Use `ProgressStore` rather than a game-specific storage system. A matching set can be stored as a chapter-like record, for example:

```javascript
ProgressStore.updateChapter('match', activeSetId, {
  status: completed ? 'completed' : 'in_progress',
  totalQuestions: pairs.length,
  answeredCount: matchedPairs,
  correctCount: matchedPairs,
  latestScore: matchedPairs,
  bestScore: Math.max(previousBest, matchedPairs),
  lastActivityAt: new Date().toISOString(),
});
```

Only retain detailed game-board state when resumability is a genuine learner benefit. Otherwise, save the compact outcome/progress record and keep the game lightweight.

## Implementation order

1. Finish the homepage drawer account UI and remove fixed-card CSS.
2. Verify Firestore sync with a real signed-in profile and a second browser/device.
3. Clean up `quiz.html`, `match.html`, and `docs.html` so activity pages do not carry persistent account overlays.
4. Update `match.html` to use the same close (`X`) interaction as the quiz.
5. Add limited start/completion/exit analytics to activities.
6. Extract common close, telemetry, and session-save behavior into a small activity helper only after it is repeated across multiple activities.

## Definition of done

The account/progress work is complete when:

- The homepage drawer has one account action area and no floating account overlay.
- Sign-in uses **Log in with Google** and signed-in users see a simple **Log out** item.
- Progress is private in Firestore under the signed-in user’s UID.
- Existing local progress merges into the cloud profile on first sign-in.
- The same signed-in user can restore progress in a second browser/device.
- Quiz and game pages remain visually focused, with background-only identity/sync behavior and a clear close action.
