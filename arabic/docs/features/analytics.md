# Analytics (Google Tag Manager + GA4) ✅ Done

## Quick links (for this project's console access)

- **GTM container/workspace:** https://tagmanager.google.com/?utm_source=marketingplatform.google.com&utm_medium=et&utm_campaign=marketingplatform.google.com%2Fabout%2Ftag-manager%2F#/container/accounts/6221115678/containers/179682350/workspaces/4
  (Account `6221115678`, Container `179682350` — this is container `GTM-NDCR97CD`, the same one referenced throughout this doc.)
- **GA4 property (Intelligence Home report):** https://analytics.google.com/analytics/web/#/a108811965p431050203/reports/intelligenthome
  (Account `108811965`, Property `431050203`.)

These are private Google account consoles, not public URLs — access requires being signed in as the account owner. Recorded here so they're easy to find whenever analytics work comes up (e.g. configuring the outstanding GA4 tag, checking Enhanced Measurement, or verifying an event in GA4 DebugView), rather than having to search for them each time.

## Purpose

Capture enough behavioral data to answer two questions without adding meaningful JS weight: where visitors drop off in the Unit 6/Unit 7 study funnel, and which buttons/features they actually engage with. Google Tag Manager (GTM) was chosen over hand-rolled analytics calls because a GA4 tag can be configured entirely inside the GTM container (Google Tag Manager web UI) without further code changes, and over loading `gtag.js` directly because the same container ID already existed on `index.html` — reusing it keeps one tracking setup across the whole site instead of three.

## Status

- The GTM container (`GTM-NDCR97CD`) was already live on `index.html` (the main portfolio landing page) before this work began. It was **not** present on `arabic/arabic.html` or `arabic/quiz.html`, meaning the two pages where nearly all real user activity happens — chapter selection and the quiz itself — had zero analytics coverage.
- Because each HTML document is a separate page load with its own JS context, the GTM snippet does not "carry over" from `index.html` to the Arabic subpages automatically. It must be pasted identically into every page that should be tracked.
- The container snippet (head `<script>` + body `<noscript><iframe>`) has been added identically to `arabic/arabic.html`, `arabic/quiz.html`, `arabic/docs.html`, and `arabic/match.html`, matching `index.html` exactly — same container ID, same placement (script immediately after `<meta charset>`, noscript iframe immediately after `<body>` opens).
- **Outstanding:** the GA4 tag itself still needs to be configured inside the GTM workspace (linked above) so the events below actually reach the GA4 property (also linked above), not just the browser's `dataLayer`. This is a GTM/GA4 console task, not a code change.

## Lightweight custom events

Rather than adding a third-party analytics library or a large event-tracking framework, a single ~1-line helper was added to each page:

```js
function trackEvent(name, params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: name }, params || {}));
}
```

This pushes directly into the `dataLayer` array GTM already listens on — no additional script tags, no new dependencies, and no meaningful JS weight added. A GA4 Event tag can be configured inside GTM (in the Tag Manager web UI, not in code) to fire on any of these custom event names and forward them to GA4 as GA4 events.

| Event | Fires when | Parameters | File |
|---|---|---|---|
| `direction_toggle` | Learner switches Arabic→English / English→Arabic mode on the homepage | `direction` | `arabic.html` |
| `chapter_card_click` | Learner clicks an available chapter card | `unit_id`, `chapter_id`, `chapter_status` | `arabic.html` |
| `answer_selected` | Learner picks an answer choice (before checking it) | `unit_id`, `chapter_id`, `mode` | `quiz.html` |
| `answer_checked` | Learner submits/checks an answer | `unit_id`, `chapter_id`, `mode`, `correct` | `quiz.html` |
| `word_flagged` | Learner taps the flag-a-question control | `unit_id`, `chapter_id`, `mode` | `quiz.html` |
| `word_marked_known` | Learner manually marks a word as known | `unit_id`, `chapter_id`, `mode`, `source` | `quiz.html` |
| `chapter_completed` | Learner finishes all questions in a chapter session | `unit_id`, `chapter_id`, `mode`, `score`, `total` | `quiz.html` |
| `doc_opened` / `doc_edit_opened` / `doc_reset` | Learner browses/edits/resets a doc | `doc_id` | `docs.html` |
| `match_set_selected` / `match_pair_correct` / `match_pair_incorrect` / `match_set_completed` | Learner interacts with the matching game | `set_id`, `mistake_count` (on completion) | `match.html` |

## Funnel and drop-off visibility this enables

Combined with GA4's automatic page-view tracking (no code required) and GA4's Enhanced Measurement feature (scroll-depth tracking, configured in the GTM/GA4 UI, not in code), the event set above gives a full funnel:

`page_view` (homepage) → `chapter_card_click` → `page_view` (quiz.html) → `answer_selected`/`answer_checked` (repeated per question) → `chapter_completed`

A learner who lands on the homepage, clicks into Chapter 32, answers a few questions, and leaves without finishing will show up in GA4 as having triggered `chapter_card_click` and several `answer_checked` events but never a `chapter_completed` event for that `chapter_id` — directly answering "where do people drop off."

## Rules

- No third-party analytics library or SDK was added; all tracking flows through the existing `dataLayer` GTM already reads, keeping the JS footprint to a single small helper function per page.
- GTM/GA4 configuration itself (which tags fire on which events, GA4 property wiring, Enhanced Measurement toggles) happens in the Google Tag Manager and GA4 web consoles (linked at the top of this doc), not in this codebase.
- The GTM container ID (`GTM-NDCR97CD`) is the same one already used on `index.html`; a second or different container must not be introduced without a documented reason.
- Every current and future page under `arabic/` must carry the identical GTM snippet (head script + noscript iframe) if it should be included in analytics — this is not automatic and must be checked when adding new pages.
- `trackEvent()` calls must never block or delay the underlying action they're attached to — analytics must fail silently and never break the quiz.
- No personally identifying data is included in any event's parameters; all parameters are content identifiers (`unit_id`, `chapter_id`, `mode`, `doc_id`, `set_id`) or non-identifying outcome data (`correct`, `score`, `total`, `source`, `mistake_count`).
- The GTM/GA4 console links at the top of this doc are private and account-specific — never embed them in any public-facing page or commit a screenshot/export of their contents that could expose account structure to the public repo.

## Privacy policy implication

This addition means the Mobile App Store Distribution's planned privacy policy must also disclose GTM/GA4 usage — the policy draft must not describe the site as having "no analytics" once this ships. This does not block Google Play submission; it is a content requirement for the privacy policy page itself.

## Testing checklist

- [ ] GTM Preview mode confirms the container fires correctly on `arabic.html`, `quiz.html`, `docs.html`, and `match.html`, not just `index.html`.
- [ ] A GA4 tag is configured in the GTM container (see quick link above) so page views and all custom events actually reach the GA4 property, not just the browser's `dataLayer`.
- [ ] GA4 Enhanced Measurement (scroll tracking) is enabled to get drop-off signal on longer pages without additional custom events.
- [ ] Each custom event appears correctly in GA4's DebugView with the expected parameters, for at least one full manual run through a chapter, the docs page, and the matching game.
- [ ] Privacy policy draft is updated to disclose GTM/GA4 before either store submission.
