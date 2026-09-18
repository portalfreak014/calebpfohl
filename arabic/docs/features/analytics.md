# Analytics (Google Tag Manager + GA4)

## Status

Google Tag Manager is live for the Arabic Study app. The site already pushes its custom study events into `dataLayer`; GTM is responsible for forwarding them to GA4.

### Current GTM configuration

- GTM account: `6221115678` (Caleb Pfohl Website)
- Container: `179682350` (`GTM-NDCR97CD`)
- Workspace: `5`
- GA4 measurement ID: `G-0K3B85W2HH`
- Existing GA4 configuration tag: `GA4 Tag`
- Existing event tag: `GA4 Event - chapter_card_click`

### GA4 event tags created 2026-09-18

| Event | GTM tag | Tag ID | Trigger status |
| --- | --- | --- | --- |
| `quiz_started` | `GA4 Event - quiz_started` | 29 | Pending: create and attach `CE - quiz_started` Custom Event trigger |
| `quiz_answered` | `GA4 Event - quiz_answered` | 30 | Pending: create and attach `CE - quiz_answered` Custom Event trigger |
| `quiz_completed` | `GA4 Event - quiz_completed` | 31 | Pending: create and attach `CE - quiz_completed` Custom Event trigger |
| `known_word_toggled` | `GA4 Event - known_word_toggled` | 32 | Pending: create and attach `CE - known_word_toggled` Custom Event trigger |

Each tag sends its identically named event to `G-0K3B85W2HH`. They currently have no firing trigger, so they will not send data until their matching Custom Event triggers are attached.

### Still to create

- `GA4 Event - match_set_selected` with `CE - match_set_selected`
- `GA4 Event - match_pair_correct` with `CE - match_pair_correct`
- `GA4 Event - match_pair_incorrect` with `CE - match_pair_incorrect`
- `GA4 Event - match_set_completed` with `CE - match_set_completed`

## App event contract

The app pushes these events directly into the `dataLayer` array that GTM listens to. No additional script tags or dependencies are needed in the app; configure a GTM GA4 Event tag to fire on the corresponding Custom Event and forward it to GA4.

- `quiz_started`
- `quiz_answered`
- `quiz_completed`
- `known_word_toggled`
- `match_set_selected`
- `match_pair_correct`
- `match_pair_incorrect`
- `match_set_completed`

For event parameters, only add Data Layer Variables that the specific event actually includes. For example, the existing `chapter_card_click` event passes `unit_id`, `chapter_id`, and `chapter_status`; those should not be copied automatically to unrelated study events.

## Verification checklist

1. Create the matching GTM Custom Event trigger for each event and attach it to its event tag.
2. Use GTM Preview mode while starting/completing a quiz, toggling a known word, and playing a matching set.
3. Confirm the event appears in GA4 DebugView.
4. Publish the GTM workspace only after the Preview checks pass.

## Console links

These are private Google account consoles, not public URLs—access requires being signed in as the account owner.

- Google Tag Manager: https://tagmanager.google.com/
- Google Analytics: https://analytics.google.com/
