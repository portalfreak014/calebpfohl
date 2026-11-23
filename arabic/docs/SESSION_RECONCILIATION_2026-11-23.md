# November 23 implementation reconciliation

Scope: work discussed and committed before the later visual-effect discussion, plus the subsequently approved pill scroll behavior. This supplement records omissions and supersedes older descriptions where explicitly identified below. It does not document or implement the deferred visual-effect discussion.

## Status and evidence boundaries

Implementation commits were accepted on main. Builds and end-to-end tests were not run by the assistant during this session. User screenshots show portions of the deployed header and flag notice, but do not establish complete build, cross-browser, accessibility, authentication, or Sheets correctness. Do not treat committed as production-verified. This document describes intended/source behavior and retains unresolved work explicitly.

## Brand and favicon work

- Approved brand: Fursa | فرصة; tagline: Your opportunity to improve. Keep existing URLs, accounts, saved progress, vocabulary, and functionality. Retain independent/unofficial-course and non-affiliation wording in the footer. Direction: opening door with Arabic ف, purple/lavender, light/dark variants. Not an English F.
- BRANDING.md was created/updated in 1a9277f and 881c915.
- Initial light/dark 512px PNG icon extractions were saved under arabic/assets/. favicon.js was added in c5cb6e4, then theme.js was updated in 81a110a to load it automatically. The runtime chooses by data-theme; full browser behavior remains unverified.
- 1a5e456 added scripts/prepare-fursa-home.mjs: replaces the homepage ع header mark with theme-responsive icon images; changes title/description and hero to Fursa | فرصة with the smaller tagline; initially adds a styled door/logo placeholder; changes the hero CTA to Chapter quizzes with its arrow and an in-page chapter-quizzes anchor. Removes the previous resume-link rewrite so the CTA stays a chapter-list anchor. Smooth scrolling follows the existing reduced-motion override. Quiz/progress links and storage are preserved.
- 5986906 added scripts/prepare-fursa-assets.mjs: extracts the standalone upper-left door-and-ف mark from the repository brand sheet arabic/assets/fursabranding.png; exports arabic/assets/fursa-logo.png with exterior white removed; regenerates light/dark icons with alpha-masked rounded corners; patches the homepage preparation helper to replace its placeholder with the actual mark; versions literal image URLs with v=2.
- No image generation was used for these extractions. Transparent PNG previews were separately exported from the attached JPEG; the deployed build uses the repository PNG, not those preview files.
- Asset extraction assumes the original 3:2 sheet layout, with proportional crop coordinates based on 1536x1024. The decoder accepts non-interlaced 8-bit RGB/RGBA PNG only and fails on unsupported formats. It is a raster extraction, not an original vector asset. Check the corners and fine edges against both themes; no claim of pixel-perfect halo removal is verified.

## Audio and study-screen follow-ups

- arabic/flashcards-audio.js was previously committed, and Caleb reported adding its script tag to flashcards.html. Browser playback was not verified.
- 5a09360 updated arabic/speak.js: clicking an enabled Arabic choice before submission in English-to-Arabic quizzes immediately requests speech, including incorrect choices and reselections. The choice is read from state.displayToOriginal. Speech synthesis cancels prior speech rather than queueing it. This adds no scoring/submission mutation. Post-submission choices remain excluded. Device voice availability and pronunciation quality vary; test actual browsers.
- The same speech helper retains glossary buttons and the separate quiz audio-button behavior. Immediate choice speech is not the same as unlocking the correct-answer audio button before submission.
- Text-font loading is rewritten to display=optional by prepare-arabic.mjs. A proposed flashcard font-loading adjustment and scrollup.js include were discussed but were not confirmed implemented. Do not mark them complete from the suggestion alone.

## Companion backlog

5a09360 also created backlog/site-companion.md. Explore an original friendly helper inspired by Clippy or a teddy bear; no character/name/artwork has been chosen. Initial scope is non-AI. An AI connection is only a possible separately approved later phase. No companion runtime, AI requests, credentials, or data collection were added. The backlog includes placement, hide preferences, accessibility, motion, privacy, and future approval questions.

## Flag attribution and Google Sheets

4bcea47 added netlify/functions/flag-identity.js, expanded scripts/prepare-glossary-quiz.mjs, and added features/flag-attribution.md.

- Existing Flags columns A-G remain Timestamp, Unit, Chapter, Quiz direction, Arabic word, Correct answer, Status. H-J add Flagged by, User ID, Email. Missing display name falls back to Signed-in user; unavailable email stays blank. Signed-out reports are Anonymous with blank identity columns. Old rows are not backfilled.
- The endpoint derives name/UID/email from a verified Firebase ID token for arabic-3e9b3, not JSON identity claims. It checks RS256 signature and key, audience, issuer, subject, expiration, issued-at, and auth_time. Google signing certificates are cached five minutes. Individual token revocation is not checked. Existing Sheets credentials remain in environment variables; no new credential was committed.
- Existing sheets receive H-J headers on first report after deployment. Conflicting nonempty H-J headers fail rather than overwrite unrelated headers. Sheet writes use RAW to avoid treating learner/profile text as formulas.
- The original local queue key is retained. New entries store original UID, not token/name/email. Retries obtain a token only for the matching current user; legacy, signed-out, and different-account queued reports go anonymously. Same-user token/verification failures remain queued. Auth initialization failure asks the learner to retry instead of guessing identity.
- Queue handling now retains unsent entries rather than discarding those after the first failed send. It removes a successfully sent matching entry from the latest queue. Full queues refuse new reports. Pending reports say Saved to send later; delivered reports thank the learner. Live Sheets writes and these retry cases still require testing.
- Account details are not added to the existing analytics event. Sheet sharing must be reviewed because reports now contain email addresses. Anonymous reports remain possible; this is report attribution, not a requirement to sign in.

### Notice visibility supersession

The initial attribution change inserted a visible inline disclosure and connected it to the flag control with aria-describedby. At Caleb's request, 1b7ebb0 added a final build step that wraps the paragraph in an HTML comment and removes that ARIA reference. Account attribution remains enabled. The notice is therefore no longer rendered or announced in the prepared quiz. This supersedes the visible-notice claims and checklist in features/flag-attribution.md and any earlier assistant descriptions. No alternate user-facing privacy location or settings page was implemented in this session.

## Navigation and Settings

1b7ebb0 added scripts/prepare-navigation.mjs. It adds a disabled Settings (Coming soon) item after Progress in the hamburger menu and a disabled fifth Settings item in the mobile pill. Settings has no destination or implemented controls. The final build expands the pill grid to five equal columns and adds disabled styling. It does not add a Coming soon group heading. Roots, Docs, and sign-in/out remain drawer-only actions on desktop; this change does not solve their mobile discoverability.

The current pill source change replaces the previous 100%-to-70% scroll scaling. It remains at its original full size. Downward movement hides it with a 220ms slide/fade after an 8px directional threshold and beyond 64px page depth. Upward movement of 8px reveals it. At or above the top 24px region it is shown. Repeated motion in one direction holds the same state instead of repeatedly restarting the transition. Scroll work is animation-frame batched; top/bottom overscroll is clamped. Hidden navigation is inert, aria-hidden, and noninteractive. Tab, resize, breakpoint changes, and pageshow reveal it. Visible keyboard focus within the pill prevents hiding. Reduced motion disables transitions. The desktop breakpoint remains 700px. This supersedes scroll scaling in features/shared-ui-and-theme.md; Settings is still applied to the source by the build helper.

## Current preparation pipeline and ownership

netlify.toml runs, in order:

1. scripts/prepare-fursa-assets.mjs — generates PNGs, patches the homepage helper and literal favicon asset URLs.
2. scripts/prepare-fursa-home.mjs — transforms homepage branding/hero/chapter anchor and removes resume-CTA rewriting.
3. scripts/prepare-arabic.mjs — early themes, study-page aliases/integration, font preparation.
4. scripts/prepare-glossary-quiz.mjs — glossary quiz actions plus flag attribution/reporting endpoint and content-quality documentation transformation.
5. scripts/prepare-footer.mjs — shared homepage footer integration.
6. scripts/prepare-navigation.mjs — comments out the quiz notice and adds Settings placeholders to both nav scripts.

Generated changes occur in the build workspace, not as generated-file commits. Thus source HTML/endpoint/nav may differ from what is deployed. The direction-aware scroll logic itself is a direct source edit in pill-nav.js. Local previews need the complete pipeline. Preserve helper ordering, matching assertions, and idempotence when refactoring. The assets helper mutates another preparation script in the workspace; inspect that generated helper when debugging hero output. No dependencies were added for the custom PNG decoder.

This six-step list supersedes older two/three-step instructions in existing documentation, including CHANGELOG, PROJECT_COMPASS, and shared-ui-and-theme. netlify.toml is the executable source of truth. Existing redirects and Arabic cache revalidation settings were retained.

## Documentation discovery

The manifest update preserves its existing documents and adds BRANDING.md, features/shared-ui-and-theme.md, backlog/site-companion.md, features/flag-attribution.md, and this supplement. These files were previously missing from viewer discovery. Earlier documentation reconciliation was 86d4405; this supplement covers subsequent session changes and explicitly supersedes stale descriptions without rewriting historical changelog entries.

## Remaining verification and follow-up

- Run the full pipeline in a clean checkout and inspect generated diffs, repeat-run behavior, build success, and function bundling. No assistant-executed full build is recorded.
- Test actual icon alpha edges, standalone-logo crop/contrast, favicon refresh, hero mobile wrapping, chapter CTA, theme switching, and unchanged footer/disclaimers.
- Test speech on supported iPhone/desktop browsers: incorrect choice, repeated choice, rapid reselection, submission, and unchanged scoring; check flashcard audio separately.
- Test signed-in/anonymous flags, invalid and expired tokens, wrong project, missing profile fields, schema collisions, queue/storage failures, retries across accounts, notice absence, and restricted sheet access. No live report was submitted as a test during this work.
- Test the five-item pill at narrow widths, at 699/700px, after resize/history restoration, fast/reversed scrolling, bounce, Tab navigation, focused links, and reduced motion. Confirm hidden controls cannot intercept taps and the pill never scales.
- Decide later whether to provide an alternate accessible privacy/account-attribution explanation; it was not added automatically.
- Existing proposed font/scrollup changes, docs generated-output drift, mobile drawer-only action access, and the companion remain follow-ups, not silently completed features.
