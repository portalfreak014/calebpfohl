# Mobile App Store Distribution (Google Play + Apple App Store) ⏳ Planned

## Purpose

Package the existing mobile-first web app for distribution through the Google Play Store and Apple App Store, so it can be installed like a native app rather than only accessed via browser at calebpfohl.com. This is a distribution and packaging layer on top of the existing site — it does not imply a rewrite. The current Material Design 3, mobile-first `arabic.html`/`quiz.html` experience is designed to translate directly into a wrapped app via a WebView-based or PWA-to-native packaging approach (e.g. Trusted Web Activity for Android, a WKWebView wrapper or Capacitor/Cordova-style shell for iOS), rather than being rebuilt as a separate native codebase.

## Status

- **Google Play**: the one-time $25 Google Play Developer registration fee has been paid. No app listing, build, or submission has been created yet.
- **Apple App Store**: the $99/year Apple Developer Program enrollment has not yet been started. Planned for approximately one month out from this entry, not urgent.
- Because of this sequencing, Google Play is the first target platform; iOS/App Store work is intentionally deferred until the Apple Developer account exists.

## Setup — Google Play (first target)

- [ ] Decide the packaging approach: Trusted Web Activity (wraps the existing PWA/site with minimal native shell code, preferred if the site already has a working manifest/service worker) vs. a full WebView wrapper (e.g. via Capacitor).
- [ ] Add/verify a PWA manifest (`manifest.json`) and app icons for `arabic.html`, since a Trusted Web Activity depends on the site already behaving like an installable PWA.
- [ ] Create the app listing in Google Play Console: title, description, screenshots (mobile-first design should translate well here), content rating questionnaire, privacy policy URL.
- [ ] A privacy policy is required for Play Store submission regardless of packaging approach — must account for `localStorage`-based `ProgressStore` data and the anonymous flag-reporting feature, even though neither collects personally identifying data today.
- [ ] Build and sign the release bundle (`.aab`), upload to a closed/internal testing track first, then promote to production after testing.

## Setup — Apple App Store (deferred ~1 month)

- [ ] Enroll in the Apple Developer Program ($99/year) — not yet started.
- [ ] Decide the iOS packaging approach once enrolled — likely the same shell technology chosen for Android (e.g. Capacitor) to avoid maintaining two separate native wrappers, rather than a from-scratch Swift/WKWebView app, unless a from-scratch shell turns out to be simpler for App Review purposes.
- [ ] App Store submissions have historically applied extra scrutiny to "thin WebView wrapper" apps; the app should include enough native-feeling chrome (already partially satisfied by the existing bottom nav / navigation drawer) to avoid a rejection on those grounds. This should be revisited against current App Store Review Guidelines once enrollment is active, since guidelines can change.
- [ ] Same privacy policy and content rating requirements apply, plus Apple's separate App Privacy "nutrition label" questionnaire in App Store Connect.

## Rules

- No native rewrite of `arabic.html`/`quiz.html`/`progress-store.js` — the packaged app should load the same live site (or a bundled snapshot of it), not a separate maintained codebase, to avoid two-codebase drift.
- `ProgressStore`'s local-first design must keep working unmodified inside whichever WebView/shell technology is chosen; if the packaging approach can't reliably persist `localStorage` between app launches, that is a blocking issue to resolve before submission, not an acceptable regression.
- Do not begin Apple App Store setup work until the Apple Developer Program enrollment is active — no point drafting store-specific assets against guidelines that may not be current by the time enrollment happens.
- A privacy policy must be published and linked before either store submission; it must accurately describe the local-only nature of `ProgressStore` and the anonymous nature of the flag-reporting feature.
- Google Play submission should not block on Apple Developer enrollment — the two platforms are sequenced independently, Play first.

## Testing checklist

- [ ] Site has a valid PWA manifest and passes Lighthouse's installability checks, if Trusted Web Activity is the chosen approach.
- [ ] Packaged Android build correctly persists `ProgressStore` data (known words, chapter progress) across app restarts, not just across page reloads in a browser tab.
- [ ] Play Store internal testing track build installs and runs correctly on at least one physical Android device before promoting to production.
- [ ] Privacy policy page is published, linked from both the site footer and the store listings, and accurately reflects current data practices at time of submission.
- [ ] (Once Apple enrollment is active) iOS build correctly persists `ProgressStore` data across app restarts using the same shell technology validated on Android.
