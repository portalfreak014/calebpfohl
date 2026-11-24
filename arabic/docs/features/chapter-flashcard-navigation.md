# Contextual chapter flashcards and glossary navigation

Updated 2026-11-23. Source implementation committed in `1102f7e`; subsequent glossary audio/layout and branding/pill commits are listed below. Full build, deployment, and browser verification remain pending. This is implementation documentation, not a live-operation guarantee.

## Homepage

A separate Flashcards section follows Chapter quizzes. Each unit is an initially collapsed native details/summary row with wrapping chapter chips. Available chips link to `flashcards.html?unit=unitN&chapter=chN`. Unavailable chapters are noninteractive and labeled coming soon for assistive technology/tooltips. All sets opens the ordinary picker, including community sets. No progress cards, extra quiz controls, or per-quiz flashcard actions are added; side-by-side placement is only a possible later idea.

`arabic/home-flashcards.js` reads UnitsManifest. There is no duplicate chapter catalog or vocabulary copy. Chip availability follows the manifest, not preloaded card counts; the destination handles failed or empty data instead of silently opening another deck.

## Glossary actions and returns

`arabic/glossary-quiz.js` supplies compact outlined Quiz and Flashcards links beside each available numeric chapter heading containing vocabulary. Each has a unit/chapter-specific accessible label and 44px minimum height. Enhancement handles asynchronous rendering and unit wrappers used by cross-unit search. Non-numeric/lesson headings do not get unsupported chapter links.

Quiz links preserve their original `return=glossary.html#chapter-N` format and last-unit storage behavior. Flashcard links carry unit/chapter plus an encoded `return=glossary.html?unit=N#chapter-N`. The glossary build patch prioritizes a valid explicit unit over saved state, so flashcard return does not depend solely on last-used unit storage. No expanded quiz return parser was added.

The prepared flashcard module validates requested chapter availability and loaded cards after its existing all-unit load promise, then calls the existing startCards routine. It retains the font timeout, core/additional merge, rendering, quiz link, audio, flipping, shuffle, and community behavior. Invalid, unavailable, empty, or failed targets leave the picker accessible with feedback.

A return URL is accepted only for the same-origin, same-folder glossary path, allowed unit 0–10, and numeric chapter fragment, then rebuilt into a constrained relative link. With valid context, Back to all sets becomes Back to glossary; it, the page-header close link, and Escape during an open deck return there. Normal/homepage visits keep existing picker behavior; no new ordinary-visit Escape handler is implied. Browser history is not replaced; the context remains if another deck is selected during that visit.

The glossary uses an immediate lookup and bounded mutation observer to scroll after content rendering. It restores the chapter, not exact pixel offset or previous search text/results. Late font/layout shifts and loading beyond eight seconds can affect restoration. Existing chapter fragment IDs and persistence keys are retained. The player's Take quiz link is not extended to forward the flashcard return context.

## Glossary audio and column presentation

- `1c199da`: glossary speech buttons in `arabic/speak.js` use a subtle 1px outline, 8px corner radius, 32px square size, and 20px symbol. Hover/focus and speech/quiz logic are unchanged.
- `1168c1b`: adds 8px inline margins so the outlined control no longer touches Arabic text in the earlier inline layout.
- `e6d826b`: scoped CSS in `glossary-quiz.js` switches table column flow to RTL, placing Arabic on the right and English on the left without changing data/DOM cell order. Language direction/alignment is explicit and existing column widths remain.
- The final layout reserves a fixed right audio lane on speech-equipped Arabic cells: 52px right padding = 12px outer inset + 32px control + 8px text gap. More-specific positioning resets inline margins and vertically centers each button 12px from the right edge. Button alignment no longer follows term length. This supersedes the earlier inline placement without changing pronunciation.

These are renderer/style enhancements, not Markdown vocabulary restructuring. They also apply to search-generated tables. Wrapped cells, narrow screens, focus outlines, and dark-mode appearance remain pending browser checks. The user's screenshot confirmed the prior outlined appearance and text crowding, not the later alignment or branding result.

## Glossary branding and flashcard pill

`2107e4e` adds `scripts/prepare-glossary-branding-and-flashcard-pill.mjs`. It reads the already-prepared homepage top bar and scoped styles, changes Home to Glossary, keeps the theme-responsive Fursa icon and Arabic subtitle, brands the browser title, and simplifies the glossary hero description. Search, glossary hero heading, vocabulary structure, chapter navigation, and existing footer are retained. It does not replace the glossary body with the homepage hero/CTA.

The same helper installs the shared pill root/scripts and base appearance in prepared flashcard HTML, initially hidden to avoid an uncontrolled startup flash. `arabic/flashcards-pill.js` observes the deck overlay class. Open course/community/deep-linked decks hide/inert/aria-hide the entire root; picker return restores it and dispatches `pill-nav:reset`. A small listener in shared `pill-nav.js` resets scroll state. Returning to the glossary navigates away rather than reopening the picker.

The pill retains mobile-only display below 700px, full-size direction-aware scroll hiding/revealing, reduced-motion and hidden-state handling, and build-added disabled Settings. It remains hidden at desktop widths; no desktop flashcard menu is added. Mobile picker clearance is increased without changing deck geometry. See [Shared UI and theme](shared-ui-and-theme.md) and [Flashcards](flashcards.md).

## Source/build ownership

- Direct assets: `home-flashcards.js`, `glossary-quiz.js`, `speak.js`, `pill-nav.js`, and `flashcards-pill.js`.
- `prepare-chapter-flashcards.mjs` installs homepage flashcard entry, glossary explicit-unit selection, and inline flashcard bootstrap/leaveStudy integration.
- The later `prepare-glossary-branding-and-flashcard-pill.mjs` installs the branded header and flashcard pill wiring/styles using prepared homepage sources.
- Generated HTML is build-workspace output, not separately committed source. Expected-source assertions intentionally fail if the integration structure changes; marker guards are intended to prevent duplicate installation.
- The current pipeline contains eight helpers, not the seven noted when this feature first landed. The full ordered command is in [Shared UI and theme](shared-ui-and-theme.md); `netlify.toml` is executable truth.
- No quiz scoring/progress, flag attribution, account records, vocabulary content, or existing URLs were changed by the glossary layout/pill updates.

## Pending checks

- Run the full build in a clean checkout and repeat; inspect generated HTML/module syntax and confirm no duplicates.
- Verify separate homepage section placement, collapsed units, chip wrapping/availability, All sets, focus, mobile sizing, and light/dark themes.
- Test multiple-unit deck content, core/additional vocabulary, loading failures, normal picker, and community decks.
- Open from glossary headings and cross-unit search; test Back, header close, and Escape with a mismatched saved unit; verify chapter targeting after asynchronous rendering and known search/offset limitations.
- Confirm normal/homepage visits retain picker return, invalid/external return URLs are ignored, and Quiz retains its original chapter/return behavior.
- Verify glossary table/header placement, fixed audio lane and 8px gap, wrapping and focus, pronunciation, and homepage-matched branding.
- Verify pill picker/open/close states for course/community/deep-link entries, keyboard/tap suppression, responsive breakpoint, scrolling and reduced motion.
- Test actual iPhone behavior, font loading, overlay/audio/flip/shuffle, and slow/offline requests. No live build/deployment/browser success is claimed.
