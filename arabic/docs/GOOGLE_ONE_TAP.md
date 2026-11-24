# Google One Tap

## Architecture

The shared firebase-auth.js module loads Google Identity Services only after Firebase resolves the initial session as signed out. Google One Tap credentials are exchanged with Firebase using GoogleAuthProvider.credential and signInWithCredential. Existing auth-state reload behavior, progress hydration, Firestore paths, and manual popup sign-in are retained. No Netlify Function, Admin SDK credential, or Firestore rules change is required. Only pages that import firebase-auth.js receive this behavior.

The public OAuth web client ID is 466230326485-9nvl1plf61m4hi0n12klpcvqb5sg9ute.apps.googleusercontent.com. It is not a client secret.

## Console prerequisites to verify

In the Google Cloud project associated with Firebase project arabic-3e9b3, open Google Auth Platform > Clients (or APIs & Services > Credentials), select the matching web OAuth client, and ensure Authorized JavaScript origins includes https://calebpfohl.com. Add https://www.calebpfohl.com or a Netlify hostname only if actually used. Origins must not include /arabic or other paths. Verify the relevant hostnames are also in Firebase Authentication authorized domains. These console settings have not been verified or changed by this implementation.

If a Content Security Policy is configured, allow the Google Identity Services resources documented at https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy.

## Behavior

- Signed-in visitors are not prompted.
- Signed-out visitors receive at most one automatic prompt request per document load.
- auto_select is false: request the account prompt rather than silently signing in. Google and browser policies still control whether it appears, including on iPhone/Safari and in private browsing.
- Manual Log in with Google remains unchanged and cancels any active One Tap prompt. Existing pages that suppress the shared auth UI still suppress that UI; this change does not add new visible buttons on those pages.
- Explicit logout suppresses One Tap for the current tab session, including the auth-state reload. Manual login is still available and successful login clears suppression. Storage-disabled browsers cannot retain the suppression through reload.
- data-google-one-tap="off" on the html element disables the automatic prompt independently of data-firebase-auth-ui.
- Script failures/timeouts do not block the existing manual login.

## Manual verification after Netlify deployment

1. Use a signed-out browser session on the production HTTPS origin. Confirm the prompt appears when browser/account policy permits.
2. Accept and confirm Firebase login succeeds and the existing progress sync runs.
3. Refresh and confirm the prompt does not appear while signed in.
4. Log out and confirm it does not immediately prompt again; refresh in the same tab to check suppression.
5. Use the manual login button after logout and verify it still works.
6. Dismiss the prompt and confirm the app remains usable.
7. Block accounts.google.com and verify manual Firebase login behavior remains available independently of One Tap script loading.
8. Test iPhone Safari and desktop Chrome; absence of a prompt alone is not proof of an implementation error.
9. If Google reports an origin/client configuration error, verify the client ID and authorized JavaScript origin.

Browser sign-in and Netlify deployment were not executed as part of preparing these changes.
