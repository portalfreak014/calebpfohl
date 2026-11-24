# Shared account card

Netlify runs scripts/prepare-account.mjs after the existing navigation preparation. It loads account-profile.js through both theme.js and pill-nav.js, with browser module caching preventing duplicate initialization. Direct source previews without build preparation do not include the integration; run the Netlify build pipeline to test it.

The shared card replaces Match only in the pill bar, not the hamburger drawer. A header account icon is placed between the theme toggle and hamburger when the hamburger is visible. The card supports X, Escape, backdrop closing, modal focus management, and focus restoration. Signed-in users see their display name, email, Google-provider badge when applicable, and logout. Existing drawer login/logout controls remain. Profile values use textContent rather than HTML interpolation.

Only Google login is implemented in the existing app. No email/password or magic-link option is advertised or added by this change. Firebase Console provider settings cannot be verified with the available GitHub connector.

The prior One Tap code is deployed, but the root cause of the reported missing prompt has not been confirmed. The build explicitly enables itp_support for Safari/iOS. A manual login card remains accessible even when Google suppresses One Tap. Existing signed-out tab-session suppression after explicit logout remains intentional. Authorized JavaScript origins for the Google OAuth client and Firebase authorized domains still require console verification. Never claim a missing automatic prompt alone proves authentication is broken.

No Firestore rules or database schema changes. Manual testing required after deploy: Google login/cancellation/logout, profile details, private browsing, Safari/Chrome, header order at desktop width, all pill pages, flashcard overlays, dark/light theme, keyboard Escape and focus restoration. Browser tests and Netlify deployment verification have not been run while preparing this commit.
