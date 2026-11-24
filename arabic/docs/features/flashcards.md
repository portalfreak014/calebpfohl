# Flashcards

## Status

Updated 2026-11-23. Implemented source lives in `arabic/flashcards.html`, with chapter-link and pill integration applied during the Netlify build. This is a manually browsed Arabic-to-English player, not a scheduled-repetition system. Recent implementation commits are recorded in [Changelog](../CHANGELOG.md). Full build, deployment, and end-to-end browser verification remain pending; committed source is not proof of live operation.

## Course decks and content ownership

- `data/units-manifest.js` supplies units, chapter identifiers, titles, and availability. The picker is no longer limited to Unit 8 Chapters 36–40.
- Flashcards fetch `data/glossary/{unitId}-glossary.md` and the optional `{unitId}-additional.md`, parse numeric `## Chapter N` headings, and merge each chapter's Arabic/English pairs. Identical pairs are deduplicated. `data/unit8.json` is not the current flashcard loader's source.
- Manifest availability, successful loading, and actual card content determine whether a picker button is enabled. An available manifest entry alone does not guarantee a working deck.
- Selecting a deck opens a full-screen overlay while retaining the picker scroll position. The player displays its title and card position, with Arabic on the front and English on the reverse. Arabic has `lang="ar"` and RTL rendering.
- Opening waits for the existing Arabic-font request, capped at 1.5 seconds. This does not replace broader font/browser verification.

## Player controls

- Select the card, press Enter, or press Space to flip it.
- Previous and Next wrap at both ends. Next enters from the right; Previous enters from the left, with a short fade.
- Shuffle randomizes the deck and returns to its first card.
- Back to all sets normally closes the overlay and restores picker scroll. A valid glossary return context instead labels it Back to glossary and navigates to the originating unit/chapter.
- Reduced-motion preferences disable card/overlay transitions.
- `flashcards-audio.js` supplies the separate flashcard audio enhancement; the recent glossary audio CSS changes do not implement or replace it. Browser audio checks remain pending.

## Entry points and contextual returns

The homepage has a separate compact Flashcards section after Chapter quizzes: collapsed unit rows contain chapter chips, and All sets opens the full picker. Chips do not appear beside quiz cards. Availability uses the shared manifest, without duplicating vocabulary or progress cards.

Prepared chapter links use `flashcards.html?unit=unitN&chapter=chN`. The build extends the existing loader/bootstrap to open a valid, available, nonempty chapter after course loading. It currently waits for the existing all-unit loading promise. Bad, unavailable, empty, or failed targets leave the picker available with a status message rather than opening another chapter.

Glossary chapter headings offer compact Quiz and Flashcards links. A glossary-origin flashcard link also carries an encoded `return=glossary.html?unit=N#chapter-N`. The return is validated against the same origin and glossary path, allowed units 0–10, and a numeric chapter fragment, then rebuilt as a constrained relative URL.

With a valid return context, Back to glossary, the page-header close link, and Escape while a deck is open return to that unit/chapter. Homepage and ordinary visits retain normal picker behavior. This does not add a universal Escape-to-close handler for ordinary visits. The return context remains in effect if another deck is selected during that visit.

The glossary prioritizes a valid explicit unit query over the saved unit, then scrolls to the chapter after rendering. This restores the chapter, not a search query/results or exact pixel position. The fragment observer is bounded at eight seconds; delayed content/fonts may affect restoration. See [Contextual chapter flashcards](chapter-flashcard-navigation.md).

## Picker-only pill navigation

Commit `2107e4e` adds the existing shared mobile pill to the prepared picker through `scripts/prepare-glossary-branding-and-flashcard-pill.mjs` and `arabic/flashcards-pill.js`.

- Below 700 CSS pixels, the picker uses the shared navigation and normal direction-aware scroll behavior.
- Any open deck, course or community, hides the entire pill root and makes it inert/aria-hidden. This also covers chapter deep links, without adding per-deck handlers.
- Returning to the picker removes that hidden state and dispatches `pill-nav:reset` so previous scroll-hidden state is reset. Glossary-return navigation leaves the page rather than restoring the picker.
- At 700px and above, the shared pill remains hidden. This change does not add a desktop flashcard drawer/menu.
- Mobile picker bottom padding clears the pill. Deck layout and the inherited study-page theme/auth-control suppression remain unchanged.

## Quiz deep links

Built-in chapter decks show Take quiz with `quiz.html?unit=<unit-id>&chapter=<chapter-id>`, for example `quiz.html?unit=unit8&chapter=ch36`. Community decks have no corresponding chapter quiz and hide this control. The glossary return added to the flashcard entry is not propagated into this player-to-quiz link; no broader quiz return-format support is implied.

## Community decks and constraints

[Community Flashcards](community-flashcards.md) documents public sets, signed-in creation/publishing, and owner deletion. Community sets share the player, audio enhancement, browsing, shuffle, reduced-motion, and deck-aware pill behavior. Recent navigation changes do not change publishing, authentication, Firestore rules, or deletion logic.

Flashcards remain Arabic-to-English only and do not use ProgressStore, recall ratings, due dates, or spaced repetition. Community editing is not implemented. Future ideas include reverse direction, local-first scheduling, swipe navigation with visible controls retained, and an owner edit flow; these are not delivered features.

## Build and verification

`prepare-chapter-flashcards.mjs` installs deep links and glossary returns; the later `prepare-glossary-branding-and-flashcard-pill.mjs` installs picker navigation/styles. Generated HTML stays in the build workspace. The shared pill's Settings item is still added by `prepare-navigation.mjs`, not duplicated in the flashcard controller. See [Shared UI and theme](shared-ui-and-theme.md) for the eight-command build order.

Pending: clean and repeated full builds; generated-module syntax; multiple units and core/additional vocabulary; loading failures; glossary return with a mismatched saved unit; direct/homepage/community entries; picker/open/close visibility; keyboard and hidden-state interaction; 699px/700px/desktop sizing; light/dark themes; slow/failed fonts; actual iPhone audio, flip, shuffle, and navigation; unchanged quiz/community behavior. No deployment, rules, account-sync, or live browser success is claimed here.
