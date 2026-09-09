# Firebase Google SSO Setup

## Purpose

This guide records the Firebase setup for Google single sign-on (SSO) in the static Arabic learning app at `arabic/`. The project is hosted in the `portalfreak014/calebpfohl` repository and is expected to be served from `https://calebpfohl.com/arabic/`.

## Current application architecture

- The Arabic app is static HTML and JavaScript; it does not use npm or a bundler.
- Main pages: `arabic.html`, `quiz.html`, `match.html`, and `docs.html`.
- Existing progress is browser-local through `progress-store.js`.
- Firebase will provide Google authentication first. A later change can synchronize user progress to Cloud Firestore.

## Firebase project

| Setting | Value |
| --- | --- |
| Firebase project ID | `arabic-3e9b3` |
| Auth domain | `arabic-3e9b3.firebaseapp.com` |
| Web app ID | `1:466230326485:web:86728180ed573a79f5de5c` |
| Analytics measurement ID | `G-V4R6ZVF91W` |
| Firestore location | `nam5` (United States) |

The Firebase Web configuration is intended for browser use. It contains public client identifiers and must not be confused with an Admin SDK credential or service-account key. Never commit Firebase service-account JSON, private keys, or other server credentials.

## Console setup completed

1. A Firebase Web app was registered in project `arabic-3e9b3`.
2. Firebase Authentication was configured with the Google provider enabled.
3. The Google provider uses the project support email `caleb.pfohl@gmail.com`.
4. Cloud Firestore was created with the default database in `nam5 (United States)`.
5. Firestore was initialized in production mode.

The provider display name currently remains the Firebase default project label. This only affects the name users may see on the Google consent/sign-in experience; it does not block authentication. It can be changed later in Firebase project settings.

## Authorized domains

Firebase Authentication accepts hostnames only, not URL paths. Configure:

```text
calebpfohl.com
```

Do not use `calebpfohl.com/arabic`. The application path is valid in the browser URL, but Firebase authorizes the domain separately. Keep Firebase's default domains unless there is a reason to remove them. Add other deployment hostnames only when they are actually used.

## Client implementation plan

The SSO implementation will use Firebase's modular browser SDK loaded with `type="module"` and CDN imports. No npm installation is required.

Planned changes:

- Add `arabic/firebase-auth.js` to initialize Firebase and export authentication helpers.
- Use `GoogleAuthProvider`, `signInWithPopup`, `signOut`, and `onAuthStateChanged`.
- Add an accessible shared sign-in/sign-out control and signed-in account indicator to `arabic.html`, `quiz.html`, `match.html`, and `docs.html`.
- Preserve the existing local-only progress flow while authentication is introduced.
- In a follow-up, migrate or synchronize `progress-store.js` data to a UID-scoped Firestore document.

## Firestore model and rules

Use a UID-scoped document path so each authenticated user owns only their own progress:

```text
users/{uid}/progress/current
```

Recommended initial rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/progress/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Publish these rules in **Firestore Database → Rules** before enabling client-side progress syncing. Production-mode Firestore denies client reads and writes until rules allow them.

## Verification checklist

After the code PR is deployed:

1. Visit `https://calebpfohl.com/arabic/` over HTTPS.
2. Confirm the sign-in control appears on each supported page.
3. Sign in with Google and confirm the account indicator updates.
4. Refresh and confirm Firebase restores the session.
5. Sign out and confirm the app returns to the signed-out UI.
6. If Google reports `auth/unauthorized-domain`, verify that `calebpfohl.com`—without `/arabic`—is listed in Firebase Authentication authorized domains.
7. Once progress sync ships, verify one account cannot read or overwrite another account's Firestore progress.

## Security notes

- Never use test-mode Firestore rules for production.
- Do not store secrets, service-account credentials, or unrestricted privileged access tokens in this static repository.
- The Firebase browser `apiKey` is not an authorization boundary; Firestore Security Rules and Authentication enforce data access.
- Restrict the web API key in Google Cloud where feasible, while preserving the Firebase services needed by this app.
