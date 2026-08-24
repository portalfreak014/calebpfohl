# Analytics (Google Tag Manager + GA4) ✅ Done

## Purpose

Capture enough behavioral data to answer two questions without adding meaningful JS weight: where visitors drop off in the Unit 6/Unit 7 study funnel, and which buttons/features they actually engage with. Google Tag Manager (GTM) was chosen over hand-rolled analytics calls because a GA4 tag can be configured entirely inside the GTM container (Google Tag Manager web UI) without further code changes, and over loading `gtag.js` directly because the same container ID already existed on `index.html` — reusing it keeps one tracking setup across the whole site instead of three.

## Status

- The GTM container (`GTM-NDCR97CD`) was already live on `index.html` (the main portfolio landing page) before this work began. It was **not** present on `arabic/arabic.html` or `arabic/quiz.html`, meaning the two pages where nearly all real user activity happens — chapter selection and the quiz itself — had zero analytics coverage.
- Because each HTML document is a separate page load with its own JS context, the GTM snippet does not "carry over" from `index.html` to the Arabic subpages automatically. It must be pasted identically into every page that should be tracked.
- The container snippet (head `<script>` + body `<noscript><iframe>`) has been added identically to `arabic/arabic.html` and `arabic/quiz.html`, matching `index.html` exactly — same container ID, same placement (script immediately after `<meta charset>`, noscript iframe immediately after `<body>` opens).

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

## Funnel and drop-off visibility this enables

Combined with GA4's automatic page-view tracking (no code required) and GA4's Enhanced Measurement feature (scroll-depth tracking, configured in the GTM/GA4 UI, not in code), the event set above gives a full funnel:

`page_view` (homepage) → `chapter_card_click` → `page_view` (quiz.html) → `answer_selected`/`answer_checked` (repeated per question) → `chapter_completed`

A learner who lands on the homepage, clicks into Chapter 32, answers a few questions, and leaves without finishing will show up in GA4 as having triggered `chapter_card_click` and several `answer_checked` events but never a `chapter_completed` event for that `chapter_id` — directly answering "where do people drop off."

## Rules

- No third-party analytics library or SDK was added; all tracking flows through the existing `dataLayer` GTM already reads, keeping the JS footprint to a single small helper function per page.
- GTM/GA4 configuration itself (which tags fire on which events, GA4 property wiring, Enhanced Measurement toggles) happens in the Google Tag Manager and GA4 web consoles, not in this codebase.
- The GTM container ID (`GTM-NDCR97CD`) is the same one already used on `index.html`; a second or different container must not be introduced without a documented reason.
- Every current and future page under `arabic/` must carry the identical GTM snippet (head script + noscript iframe) if it should be included in analytics — this is not automatic and must be checked when adding new pages (e.g. the planned matching game).
- `trackEvent()` calls must never block or delay the underlying action they're attached to — analytics must fail silently and never break the quiz.
- No personally identifying data is included in any event's parameters; all parameters are content identifiers (`unit_id`, `chapter_id`, `mode`) or non-identifying outcome data (`correct`, `score`, `total`, `source`).

## Privacy policy implication

This addition means the Mobile App Store Distribution's planned privacy policy must also disclose GTM/GA4 usage — the policy draft must not describe the site as having "no analytics" once this ships. This does not block Google Play submission; it is a content requirement for the privacy policy page itself.

## Testing checklist

- [ ] GTM Preview mode confirms the container fires correctly on `arabic.html` and `quiz.html`, not just `index.html`.
- [ ] A GA4 tag is configured in the GTM container so page views and the seven custom events actually reach a GA4 property, not just the browser's `dataLayer`.
- [ ] GA4 Enhanced Measurement (scroll tracking) is enabled to get drop-off signal on longer pages without additional custom events.
- [ ] Each of the seven custom events appears correctly in GA4's DebugView with the expected parameters, for at least one full manual run through a chapter.
- [ ] Privacy policy draft is updated to disclose GTM/GA4 before either store submission.
