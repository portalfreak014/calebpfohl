# Flashcards

## Status

Implemented in `arabic/flashcards.html`. The page provides an accessible, browse-style Arabic-to-English flashcard experience for Unit 8 Chapters 36 through 40, plus public community-created decks. It is separate from the scheduled-repetition design described in earlier planning notes: cards are manually browsed and flipped rather than rated or scheduled.

## Course decks

- Course decks load from `data/unit8.json`.
- The chapter picker currently exposes Unit 8 Chapters 36 through 40.
- Selecting a course deck opens the player in a full-screen overlay while preserving the chapter-picker scroll position underneath.
- The player shows the chapter title and current card position.
- Each card presents Arabic on the front and the matching English meaning on the reverse. Arabic uses `lang="ar"` and right-to-left rendering.

## Player controls

- Select the card, press Enter, or press Space to flip it.
- **Previous** and **Next** move through the deck with wraparound at each end.
- Next cards enter from the right; previous cards enter from the left. Both transitions include a short fade.
- **Shuffle** randomizes the active deck and returns to its first card.
- **Back to all sets** closes the overlay and restores the user to the deck picker.
- Motion respects `prefers-reduced-motion`; card and overlay transitions are disabled for users who request reduced motion.

## Quiz deep links

Built-in chapter decks show a **Take quiz** control in the player. It opens the quiz for the active chapter using this format:

```text
quiz.html?unit=unit8&chapter=<chapter-id>
```

For example, the Chapter 36 deck links to:

```text
quiz.html?unit=unit8&chapter=ch36
```

The control is intentionally hidden for community decks because community sets do not have matching chapter quiz data.

## Community decks

Community-created decks are documented in [Community Flashcards](community-flashcards.md). They use the same player and support the same flip, browse, shuffle, and reduced-motion behavior as course decks. They do not show **Take quiz**.

## Current constraints

- Flashcards are Arabic-to-English only.
- The player does not currently use `ProgressStore`, recall ratings, due dates, or spaced repetition.
- Community-deck editing is not yet implemented.

## Future enhancements

- Add an English-to-Arabic mode.
- Add local-first recall tracking and scheduling through `ProgressStore`.
- Add swipe navigation while retaining visible buttons and keyboard controls.
- Add an owner-only edit flow for community decks.
