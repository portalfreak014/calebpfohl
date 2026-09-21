# Simplified Unit & Chapter Picker

**Status:** Planned

## Problem

The current Arabic Study homepage renders each available unit as an open `<details>` element. All available chapter rows appear at once, producing a dense, line-list-like page that is harder to scan on a phone. A unit being available should not imply that it is expanded.

## Goal

Replace the default expanded-directory presentation with a calmer two-level quiz picker:

1. The learner scans compact unit cards first.
2. The learner opens a unit to see only that unit’s chapter choices.
3. The learner selects a chapter and begins the selected quiz mode.

## Default State

- Every unit, including available units, starts closed on a normal visit.
- The interface must not render every available chapter at once.
- Each unit card should retain concise information: unit title, availability or progress summary, and a chevron that communicates expand/collapse.
- The first low-risk implementation change is to remove the automatic `open` attribute from available unit `<details>` elements.

## Interaction Model

### One unit at a time

- Opening a unit closes any other open unit.
- Selecting the currently open unit again closes it.
- The selected unit displays its own chapter cards, chapter progress, and Start, Continue, or Review state.
- This reduces vertical density and makes the active selection unambiguous.

### Unit cards

A collapsed card should communicate the unit’s identity and state without exposing its full chapter list. For example:

```text
[ 8 ]  Unit 8
       3 chapters available                         >
```

An expanded card reveals only the selected unit’s chapter choices:

```text
[ 8 ]  Unit 8                                      v

       Chapter 36
       Vocabulary quiz                         Start

       Chapter 37
       Vocabulary quiz                         Start
```

## Deep Links and Return Flow

- A direct fragment such as `arabic.html#unit8-chapters` opens the corresponding unit.
- This preserves the quiz page’s Change Chapter return flow.
- The interface may remember the learner’s most recently manually opened unit in `localStorage`.
- A stored preference must never cause all available units to expand automatically.

## Quiz Modes

- The picker continues to support Arabic-to-English and English-to-Arabic launches for available chapters.
- The Unit 8, Chapter 36 Type the Answer prototype remains explicitly scoped to that chapter and should be visibly marked **New**.
- The written-answer prototype requires the complete Arabic word or phrase in one input field; no part of the Arabic answer is revealed before submission.
- A future mixed or adaptive Learn mode is separate from this navigation refactor. It may eventually combine multiple-choice, written-answer, flashcard, listening, and other activity types.

## Rollout Plan

1. Remove automatic expansion of available unit panels.
2. Implement the one-open-unit interaction.
3. Add fragment-aware opening for direct chapter-picker links.
4. Simplify unit-card metadata and chapter presentation after the interaction is verified on mobile.
5. Consider optional last-open-unit persistence only after default and deep-link behavior work correctly.

## Testing Checklist

- Confirm every unit is closed on a normal homepage visit.
- Confirm opening one unit closes another.
- Confirm a second activation of the open unit closes it.
- Confirm keyboard users can open and close units using native `<details>` and `<summary>` behavior.
- Confirm mobile scrolling remains comfortable when one unit is expanded.
- Confirm `arabic.html#unit8-chapters` opens Unit 8.
- Confirm existing quiz URLs and Arabic-to-English/English-to-Arabic mode links remain unchanged.
- Confirm the Unit 8, Chapter 36 Type the Answer link remains correctly scoped and marked New.

## Non-goals

- Do not change quiz data files, vocabulary data, `ProgressStore`, chapter IDs, or existing quiz URL contracts.
- Do not change completion, known-word, audio, flagging, or quiz-mode scoring behavior as part of the picker redesign.
- Do not implement the future mixed/adaptive Learn mode as part of this work.
