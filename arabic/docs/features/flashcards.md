# Flashcards

## Status

Planned. This document defines a fast, accessible, free-to-use flashcard study mode for the Arabic app. It should complement `quiz.html`, reuse the existing vocabulary JSON and `window.ProgressStore`, and avoid copying any third-party branding, code, or protected interface assets.

## Product principles

- Core study must remain free: viewing cards, flipping, grading recall, navigation, review scheduling, and progress history require no subscription or payment.
- Optimize for the shortest useful study loop: open a deck, see a card, reveal the answer, rate recall, and immediately receive the next card.
- Make Arabic readable at a glance with oversized, high-contrast type, generous line height, and uncluttered controls.
- Keep state local-first through `ProgressStore`; account sync can use the existing Firebase progress architecture later.

## Study flow

1. Launch from a unit/chapter with a URL pattern such as `flashcards.html?unit=6&chapter=26&mode=ar-to-en`.
2. Show one prompt per card. Default direction is Arabic-to-English; `en-to-ar` reverses prompt and answer roles.
3. Reveal the answer with tap/click, Space, or Enter.
4. After reveal, offer four large recall ratings: Again, Hard, Good, and Easy.
5. Schedule the card, update per-word progress, then animate directly to the next due card.
6. Finish with a concise session view: reviewed, correct-by-rating, remaining due, and a clear action to continue or switch direction.

## Interaction requirements

- Use a single, full-width card as the primary touch target. Tapping it flips between prompt and answer.
- Support keyboard controls: Space/Enter reveal; `1` Again; `2` Hard; `3` Good; `4` Easy; Left/Right move only when manual browse mode is enabled.
- Support swipe gestures after an answer is revealed, while retaining visible labeled buttons for accessibility.
- Preload the next card and honor reduced-motion preferences. Transitions should feel immediate, not decorative.
- Persist a session safely after every rating, and recover gracefully after refresh or offline use.

## Visual requirements

- Arabic prompt: at least 48 px on desktop and 36 px on small screens, with right-to-left direction and a readable Arabic-capable font stack.
- English meaning: at least 30 px on desktop and 24 px on small screens.
- Rating buttons: at least 48 px high with large labels, distinct colors, text labels, and visible keyboard-focus states.
- Keep the screen focused: deck title, progress indicator, card, answer/reveal control, and ratings. Secondary actions belong in a compact menu.
- Never rely on color alone to communicate status or recall rating.

## Scheduling model

Use a lightweight spaced-repetition model that is understandable and reliable before adding complexity:

- New cards appear first, then cards due for review.
- Again returns a card later in the same session and resets its interval.
- Hard advances slowly.
- Good advances on a normal interval.
- Easy advances more quickly.
- Each word record stores only study data needed for scheduling: direction, state, interval, due timestamp, ease factor, repetitions, lapses, and last-reviewed timestamp.

Keep scheduling records direction-specific, as the quiz already does for Arabic-to-English and English-to-Arabic modes. Existing `knownWords` remains compatible: known words can be initialized as mature cards, but users must be able to review them again.

## Data and integration

- Load chapter vocabulary from the same JSON source used by `quiz.html`.
- Add ProgressStore methods rather than a parallel storage key, for example: `getFlashcard`, `updateFlashcard`, `getDueFlashcards`, `recordFlashcardRating`, and `getFlashcardStats`.
- Use a versioned profile migration so existing local progress is preserved.
- Do not store personally identifying information in flashcard records.
- Add analytics only after core offline study works; collect aggregate feature events, not card-answer content tied to identity.

## Accessibility and quality checks

- Ensure every action works by keyboard, touch, and screen reader.
- Set correct `lang` and `dir` attributes for Arabic and English content.
- Announce card reveal and rating state without forcing screen-reader users through repeated page chrome.
- Test Arabic diacritics, long English glosses, mobile portrait layout, low-bandwidth/offline reload, and an empty-due-card state.
- Provide a no-data fallback that explains how to choose another chapter.

## Acceptance criteria

- A learner can start a chapter, flip cards, rate recall, and continue studying without an account or payment prompt.
- Text is comfortably readable on mobile and desktop at the specified minimum sizes.
- Ratings immediately schedule the card and persist after refresh.
- Arabic-to-English and English-to-Arabic progress remain separate.
- The flow works with keyboard and screen reader controls.
- The experience has no third-party branding or copied proprietary assets; it is an original implementation focused on fast, equitable study.
