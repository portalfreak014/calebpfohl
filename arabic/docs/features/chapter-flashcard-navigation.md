# Contextual chapter flashcards

Recorded 2026-11-23. Implementation proposal/source behavior; full build and browser verification pending.

## Homepage

A separate Flashcards section follows Chapter quizzes. Each unit is a compact, initially collapsed native details/summary row with wrapping chapter chips. Available chips link directly to flashcards.html?unit=unitN&chapter=chN. Unavailable chapters remain noninteractive and are labeled coming soon for assistive technology and in their tooltip. All sets opens the ordinary picker, including community sets. No progress cards, extra quiz controls, or flashcard links beside existing quizzes are added. Side-by-side integration is only a possible later idea.

arabic/home-flashcards.js reads the existing UnitsManifest; no duplicate chapter catalog or vocabulary copy is introduced. Availability follows the manifest, not a preloaded card count. A chapter whose data fails to load is handled by the flashcard destination rather than silently opening a different deck.

## Glossary actions

arabic/glossary-quiz.js replaces the large filled Take quiz button with compact outlined Quiz and Flashcards links adjacent to each available numeric chapter heading with vocabulary. Each has a unit/chapter-specific accessible label and a 44px minimum height. The shared action enhancement handles initial and asynchronously rendered glossary chapters, including unit wrappers used by search results. Lessons/non-numeric headings are not given unsupported chapter links.

Quiz links retain the existing glossary return parameter and last-unit storage behavior. Flashcard links carry both their target unit/chapter and return=glossary.html?unit=N#chapter-N. The glossary build patch gives a valid explicit unit query priority over its saved unit, allowing chapter restoration even if the browser's saved unit differs. The glossary loads normally with an empty search field; search text/results are not restored. Existing chapter fragment IDs are retained.

## Flashcard lifecycle

The prepared flashcard module parses unit/chapter parameters, waits for the existing loadCourse promise (including its current all-unit loading), validates availability and actual cards, and calls the existing startCards routine. It preserves the font-loading timeout, original core/additional card merge, rendering, quiz link, audio, flipping, shuffle, and community behavior. Invalid, unavailable, empty, or failed targets leave the picker accessible with a status message instead of opening an unrelated chapter.

When the return parameter validates as the same-origin, same-folder glossary.html, an allowed unit 0-10, and a numeric chapter fragment, it is rebuilt into a constrained relative URL. The deck's Back to all sets button is labeled Back to glossary and navigates there; the page header close link does the same. Escape while the deck is open also returns there. Ordinary visits and homepage deep links have no glossary return and retain the existing leaveStudy picker behavior. Browser history is not replaced, and no new persistence key is used. A return context remains in effect if a different deck is selected during that visit.

The glossary restores the fragment after its content renders; an immediate lookup and a bounded mutation observer handle both already-present and late-loaded content. This targets the chapter, not the exact prior pixel offset. No guarantee against late font/layout shifts or loading beyond the existing eight-second observer window is implied.

## Build integration

scripts/prepare-chapter-flashcards.mjs is appended after the previous six preparation commands in netlify.toml. It injects home-flashcards.js into the prepared homepage, patches glossary unit selection, and extends the flashcards inline module's bootstrap/leaveStudy behavior. These HTML changes occur in the build workspace rather than being committed as generated HTML. Exact-source assertions fail if the expected lifecycle changes; markers prevent duplicate installation. glossary-quiz.js and home-flashcards.js are direct source assets. Existing quiz direction/progress/scoring and flag handling are unchanged.

This seven-command pipeline supersedes the earlier six-command count in the session reconciliation and quiz maintenance notes. netlify.toml remains the executable source of truth.

## Pending checks

- Run the complete build in a clean checkout and repeat it; inspect generated HTML and module syntax.
- Verify section placement after quizzes, collapsed units, wrapping chips, disabled availability, All sets, keyboard focus, mobile width, and light/dark themes.
- Open available chapter chips from multiple units; verify correct card vocabulary, missing/failed target feedback, unchanged regular picker and community sets.
- From glossary headings and cross-unit search results, open Flashcards and test Back, header close, and Escape; confirm exact unit and chapter after asynchronous glossary loading, including when stored last unit differs.
- Test ordinary/homepage flashcards still close to the picker; test invalid and external return parameters are ignored.
- Verify Quiz still starts the right chapter and retains its existing return behavior; no quiz return-format expansion was made here.
- Test actual iPhone behavior, font loading, overlays, audio, flip/shuffle, and slow/offline requests. No deployment or live browser test is claimed by this documentation.
