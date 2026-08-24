# Classmate Feedback & Feature Requests ⏳ Planned

## Purpose

Raw feature suggestions collected from classmates (Wadnizak, Horne, Joseph, Sorto, Hannah) testing the site. Recorded here verbatim in intent, cross-referenced against what already exists on `main` so nothing is duplicated or lost. None of these have been scoped, designed, or implemented yet unless explicitly marked otherwise below.

## Already addressed by existing features

- **English-to-Arabic direction (Wadnizak).** Already implemented — see [quiz-engine-and-progress.md](../features/quiz-engine-and-progress.md) (`quiz.html?...&mode=en-to-ar`). No further action needed unless Wadnizak's experience predates that feature shipping.
- **Simple one-button inaccurate-question feedback (Joseph).** Already implemented — see [content-quality-control.md](../features/content-quality-control.md). The flag control is already exactly what was requested: one button, no sign-in, doesn't interrupt the quiz.
- **Central hub page (Joseph).** Likely already addressed by `arabic/arabic.html` as the homepage/hub with the chapter picker, Continue card, and navigation drawer. Worth confirming with Joseph whether this refers to something more specific (e.g. a hub spanning multiple units/subjects) before treating this as fully resolved.

## New: content accuracy issues (likely pre-dating current engine)

These three, from Wadnizak, describe problems that may originate in older content files (e.g. a legacy `unit6.html`-era dataset) rather than the current `unit6.json` / `quiz.html` engine. Each needs to be verified against the *live* content before being treated as a bug in current code:

- [ ] **Area studies quiz question-count mismatch.** Reported: a quiz titled as N questions (6, 15, etc.) actually presents all available questions instead of that stated number. Needs reproduction against current chapters before scoping a fix — may be a stale content file issue, not an engine bug.
- [ ] **Missing years/dates on historical questions.** Some questions ask "which year did this happen" or similar without the year actually present/quizzable. This is a content-completeness issue, not an engine issue — likely requires editing the underlying question data once located.
- [ ] **Crusades numbered instead of named.** Content currently refers to Crusades by number (e.g. "the third Crusade") rather than by their commonly used names. Also a content-data fix, not an engine change, once the source question file is identified.

## New: mini-games and alternate practice modes

- [x] **Picture matching game.** Shipped 2026-08-24 as a standalone engine at `arabic/match.html`, with 2 sets for Chapter 31 and a "New!" badge. See [matching-game.md](../features/matching-game.md) for the full writeup. This satisfies the spirit of a "mini-game using existing vocabulary" request, though it was built as its own request rather than tied to a specific classmate name.
- [ ] **Hangman mini-game (Horne).** A separate game mode using existing vocabulary as the word bank. Not started; could reuse the same standalone-page pattern established by `match.html` (its own HTML file, X-to-close topbar, own `localStorage` namespace).
- [ ] **Numbers speed game (Hannah).** A timed drill mode specifically for number vocabulary/recognition speed.
- [ ] **Quizlet-style "Learn" mode (Joseph).** Presents several word meanings at once rather than one question at a time.
- [ ] **Vocabulary-in-context / example sentences (Joseph).** Show each word used in a full sentence, not just an isolated word/definition pair — conceptually similar to Language Reactor's sentence-level, in-context language exposure (Joseph).

## New: hint-before-wrong behavior

- [ ] **Hint on first miss (Hannah).** Instead of immediately marking a first incorrect answer as wrong, show a hint and allow a second attempt before revealing the correct answer. This would be a meaningful change to the existing answer-checking flow in `quiz.html` and needs to be reconciled carefully with the Known Vocabulary streak rules (see [known-vocabulary.md](../features/known-vocabulary.md)) — e.g. deciding whether a "hinted-then-correct" answer counts as a correct attempt for streak purposes, or resets the streak the way a wrong answer currently does. This decision should be made explicitly before implementation, not left implicit in the code.

## New: gamification and rewards

- [ ] **General gamification (Joseph).** No specific mechanic named beyond what's captured in the two items below; treat as an umbrella goal rather than a standalone task.
- [ ] **Lotería-style collectible cards (Sorto).** Each individual win/session award grants a collectible card, lotería-style.
- [ ] **Evolving companion/hero (Sorto).** A Khan Academy– or Blooket-style character/companion that unlocks or evolves as the learner progresses, similar in spirit to the lotería-card idea but as a single persistent character rather than a card collection. These two (lotería cards and the evolving hero) may end up as competing or complementary designs for the same underlying goal (visible, motivating progress rewards) and should be reconciled into one direction before either is built, rather than building both independently.

## Rules

- None of the items in this section should be implemented without first being scoped into their own dedicated doc (data model, rules, testing checklist), the same way Known Vocabulary, Anonymous Flagging, and the Matching Game were.
- The three content-accuracy items (question-count mismatch, missing years, Crusades naming) should be triaged first, separately from the mini-game/gamification ideas, since they may be simple content-data corrections rather than new features.
- Any new mini-game or practice mode must reuse an existing Content Contract (quiz or matching-set) rather than introducing a parallel content format, unless a genuinely new shape is justified and documented.
- Any hint-before-wrong change must not silently change how `ProgressStore.recordAnswer` scores a streak; the interaction between hints and the two-attempt known-word rule must be explicitly decided and documented before implementation.
- Gamification rewards (cards, evolving companion) are presentation-layer motivation features and must not be used as a substitute for or stored inside `knownWords`, `bestScore`, `matchProgress`, or other existing progress fields — if they need their own state, it should be additive and clearly separated.

## Testing checklist

- [ ] Each content-accuracy item (question-count mismatch, missing years, Crusades naming) has been reproduced against current live content and either fixed or confirmed to be a legacy/non-issue.
- [ ] A single gamification direction (cards vs. evolving companion, or a reconciled combination) has been chosen before implementation begins.
- [ ] The hint-before-wrong interaction with known-word streaks has been explicitly decided and written into [known-vocabulary.md](../features/known-vocabulary.md) before `quiz.html` is changed.
