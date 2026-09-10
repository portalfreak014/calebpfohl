# Desktop Sign-In Prompt

## Purpose

Add a non-blocking sign-in prompt on the Arabic Study homepage for signed-out desktop users. Its purpose is to explain the benefit of signing in: quiz progress and known-word progress can be saved and restored across devices through Firebase Authentication and Cloud Firestore.

This prompt is an application-owned dialog. It must not imitate Google’s own account picker, identity-verification dialog, account list, email display, or `Verifying…` screen. Google/Firebase owns and renders those screens after the user initiates sign-in.

## Where it appears

- Page: `arabic.html` only.
- Device: desktop/tablet layouts at `min-width: 700px`.
- User state: only while signed out.
- Timing: show after a short delay, approximately 1.4 seconds, after the homepage becomes available.
- Frequency: no more than once per browser every 30 days after dismissal.
- Do not show the prompt on quiz, matching, documentation, or future focused activity pages.

## Content and interaction

Dialog content:

- Title: **Save your progress**.
- Explanation: **Log in to keep your quiz progress and known words available across devices.**
- Primary action: **Continue with Google**.
- Secondary action: **Not now**.
- Close control: accessible close button with an `X` icon.

The primary action must use the existing Firebase sign-in flow. It should programmatically activate the existing `#firebase-sign-in` control in the homepage navigation drawer rather than introduce another independent OAuth flow.

A learner can dismiss the prompt using:

- **Not now**
- The close button
- Clicking the backdrop
- The Escape key

Dismissal should be saved under `arabicStudy.signinPromptDismissedAt` in local storage. The prompt may reappear after 30 days. Successful sign-in should close it without recording a dismissal.

## Accessibility

- Use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` for the dialog title.
- Move keyboard focus to the Google action when the dialog opens.
- Support Escape to dismiss.
- Keep visible labels for all actions.
- Do not show the dialog while the user is already signed in.

## Firebase state bridge

`firebase-auth.js` should publish the current Firebase user before dispatching the existing `firebase-auth-state-changed` event:

```javascript
window.__firebaseCurrentUser = user || null;

window.dispatchEvent(
  new CustomEvent('firebase-auth-state-changed', {
    detail: { user: user || null },
  }),
);
```

The homepage can use this state to suppress the prompt and close an open dialog immediately after sign-in.

## Styling direction

The dialog should fit the existing Material Design 3-inspired Arabic Study interface:

- Centered surface with a dimmed, lightly blurred backdrop.
- Compact width, approximately 420px maximum.
- A cloud-sync or equivalent application icon; not a fake Google verification surface.
- Outlined white Google-action button with a clear **Continue with Google** label.
- Visual treatment should be app-branded and readable, not a reproduction of Google’s verification UI.

## Relationship to navigation

The homepage drawer remains the canonical account surface:

- Signed out: visually distinct **Log in with Google** drawer item.
- Signed in: a single normal inline **Log out** drawer item.

The desktop prompt is only an optional entry point into that same sign-in action. It does not replace the drawer account action and does not appear in learning activities.

## Verification checklist

1. Open `arabic.html` at desktop width while signed out.
2. Confirm the prompt appears after the delay.
3. Confirm **Not now**, the close control, backdrop click, and Escape all close the prompt.
4. Reload immediately and confirm the prompt stays suppressed.
5. Remove the local dismissal key or wait 30 days, then confirm it can appear again.
6. Choose **Continue with Google** and confirm it opens the normal Firebase/Google sign-in flow.
7. After sign-in, confirm the prompt closes and does not reappear.
8. Confirm it does not appear below 700px and does not appear on quiz, match, docs, or future activity pages.
