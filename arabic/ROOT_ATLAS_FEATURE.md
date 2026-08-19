# Arabic Root Atlas — Feature Plan

## Purpose

This document is the implementation brief for a future Arabic-root learning feature. It preserves the product direction, content model, game design, phased build plan, and guardrails discussed before implementation.

The central idea is to turn the Arabic root workbook into a **Root Atlas**: learners explore a root’s semantic thread, see how verbal forms extend it, practice retrieval, and return through scheduled review. The product should teach the internal logic and imagery of roots—not merely test isolated translations.

## Source Material

The source workbook’s `Roots` sheet contains, for each root:

- A root identifier
- A `Thread`: the core image or semantic through-line
- Entries for Measures/Forms 1–10
- Keyword and related-vocabulary notes
- Editorial notes, examples, caveats, usage/register comments, and occasional placeholders such as `X` or `todo`

Treat the spreadsheet as the **editorial source of truth**, not as a directly rendered interface. Before use in the website, export and normalize it into a clean data format. Preserve original editorial notes as optional deep-dive content; do not force every note into the first-screen learning experience.

### Data quality note

A CSV export supplied during planning replaced Arabic characters with question marks, so it must not be used for production conversion. When converting the workbook in the future, preserve Unicode/Arabic text. Prefer the original `.xlsx`, or export with **CSV UTF-8**.

## Product Model

Build three complementary experiences:

| View | Learner goal | Interface |
| --- | --- | --- |
| Explore | Understand a root and its semantic thread | Root browser, detail page, form map, keywords |
| Practice | Recall meanings and distinguish forms | Flashcards, matching, multiple choice, typing |
| Play | Build mastery through short challenges | Daily quest, streaks, themed runs, progress map |

The point is a short learning loop: learn a root in roughly 60–90 seconds, answer a few meaningful questions, gain or lose mastery based on performance, and see the root again at an appropriate future interval.

## Content Schema

Create a canonical object per root. Use only populated forms in the UI; do not show empty Form I–X slots just because the schema allows them. Keep raw editorial text separate from cleaned learner-facing text when practical.

```json
{
  "id": "jam-collect",
  "root": "جمع",
  "transliteration": "j-m-ʿ",
  "thread": "collecting, assembling, or bringing separate units together into a single whole",
  "forms": {
    "1": { "summary": "bringing separate things together", "sourceNote": "..." },
    "2": { "summary": "systematic amassing or setup", "sourceNote": "..." },
    "4": { "summary": "alignment of minds or decisions", "sourceNote": "..." },
    "5": { "summary": "a crowd forming itself", "sourceNote": "..." },
    "8": { "summary": "coming together for a defined purpose", "sourceNote": "..." },
    "10": { "summary": "pulling together scattered energy or courage", "sourceNote": "..." }
  },
  "keywords": [
    { "arabic": "", "gloss": "", "note": "" }
  ],
  "examples": [],
  "editorialNotes": [],
  "status": "draft"
}
```

Recommended normalization rules:

- Retain the original source text in a `sourceNote` or `editorialNotes` field.
- Add short, learner-facing summaries manually or through a review workflow; do not silently flatten nuance.
- Omit cells that are empty or contain only `X` from normal form displays.
- Keep `todo`, `rare`, archaic, dialect-only, and uncertainty notes visible in an editorial/review layer.
- Use stable IDs that do not depend solely on display Arabic, so content remains addressable if a spelling/transliteration is later revised.
- Preserve Unicode in all JSON, HTML, and tooling.

Suggested eventual location: `arabic/data/roots.json`. The current project already has `arabic.html`, `quiz.html`, and a `data/` directory containing `unit6.json`; avoid overwriting existing material.

## Root Detail Page

A root page should lead with the memorable core image and progressively disclose detail. Suggested page structure:

1. **Hero card** — Arabic root, transliteration, core image/thread, and optional audio control.
2. **Form path** — only populated forms, shown as connected nodes/cards. Each has a concise plain-English explanation.
3. **Predictive challenge** — hide one form’s explanation and invite the learner to infer it before revealing the answer.
4. **Keywords** — related vocabulary linked to mini-definitions or future detail pages.
5. **Why it works** — expanded semantic reasoning, examples, historical notes, register cautions, and editorial context after the learner has attempted recall.

The page should make semantic relationships spatially legible. A learner should see a root’s basic action and how causative, reflexive, reciprocal, acquisitive, or other extensions relate to it. Do not turn every page into an impenetrable ten-column grammatical table.

### Example learning interaction

For a root whose thread is binding or knotting, ask why a derived meaning can be “to believe,” then reveal the explanation that belief is framed as tying the mind firmly to an idea. This uses the workbook’s strongest asset—semantic storytelling—as active retrieval rather than passive reading.

## Game Design

Do not build a points-only system. Reward retrieval, understanding, consistency, and delayed recall. Keep challenges concise and relevant to material the learner has already encountered.

### Core loop

1. Introduce one root in 60–90 seconds.
2. Ask three to five adaptive questions.
3. Update mastery for that root.
4. Schedule a later review based on accuracy and confidence.
5. Unlock related roots, keywords, collections, or story fragments.

### Mastery states

Use visible progress states that signal understanding, not just completion:

- **Seed** — introduced
- **Sprout** — recognizes the root/thread
- **Branch** — distinguishes relevant forms
- **Tree** — can explain the semantic connection
- **Rooted** — retains it across delayed reviews

A semantic **forest** can visualize the collection. Cluster roots by theme, for example connection, motion, clarity, judgment, or gathering. Each mastered root becomes a growing tree. The visual should support navigation and a feeling of accumulated understanding, not distract from learning.

### Game modes

- **Root Detective** — show a derived word; ask the learner to identify the root, core idea, and/or likely form.
- **Form Builder** — show a root and a meaning; ask which form best fits, then explain the semantic shift.
- **Semantic Ladder** — arrange populated forms from foundational action through extensions.
- **Keyword Constellation** — match related vocabulary to the root’s central image.
- **Lightning Round** — ten fast questions in roughly 60 seconds, restricted to previously studied material.
- **Story Unlock** — award fragments of an illustrated root-learning journey for meaningful progress rather than random loot.
- **Daily Root** — one new root plus three due reviews as a manageable recurring ritual.

### Question types

Vary prompts so learners cannot win by recognizing superficial answer patterns:

- Identify the shared image behind a root.
- Choose the form associated with a concise meaning.
- Explain why a keyword belongs to the root family.
- Match a derived term to the correct root.
- Complete a semantic chain: root → concrete image → derived meaning.
- Arrange a set of forms/meanings by semantic progression.
- Use a short typed answer only when answer checking can be robust.

Ask for confidence after some answers: “I guessed,” “fairly sure,” or “I know this.” Combine confidence with correctness to schedule review. High-confidence errors should return sooner; low-confidence correct answers should not be treated as fully mastered.

## Review and Adaptation

For the MVP, a lightweight local review system is sufficient. Store:

- Learned root IDs
- Current mastery state and score per root
- Accuracy by question type
- Confidence selections
- Streak and last activity date
- Next review timestamp

Initial scheduling can be simple: review missed or low-confidence material soon, then space successful reviews farther apart. A later version can adopt a more formal spaced-repetition model. Do not let streak preservation encourage shallow rapid clicking; quality and retention should dominate rewards.

## Existing Project Integration

Use the current structure as the initial separation of concerns:

- `arabic/arabic.html` → **Explore / Root Atlas**
- `arabic/quiz.html` → **Practice / Play**
- `arabic/data/` → normalized structured content, eventually including `roots.json`

Suggested frontend components/modules, adapted to the project’s existing style rather than requiring a framework rewrite:

- `RootCard`
- `RootBrowser` / search and filter
- `RootDetail`
- `FormMap`
- `KeywordList`
- `QuizQuestion`
- `QuizEngine`
- `MasteryBadge`
- `DailyQuest`
- `ProgressStore`

First inspect the existing HTML and JavaScript before choosing whether to use modular JavaScript, custom elements, or a small framework. Preserve the current site’s visual language unless a redesign is explicitly desired.

## MVP Scope

Do not begin by converting every root or building every game mechanic. Launch a small, polished vertical slice.

### MVP content

Use 10–30 carefully edited roots. A strong initial set includes roots that demonstrate different semantic relationships, such as gathering/connection, binding, understanding, clarity, measurement, striving, judgment, symbolism, and summarizing. Select the exact source entries only after checking the preserved Unicode workbook.

### MVP features

1. Searchable root browser.
2. Root detail page with core image, populated form map, keywords, and progressive disclosure.
3. Five-question “master this root” challenge.
4. Local progress and a simple next-review date.
5. A small mastery visualization.

### Explicitly defer

- Leaderboards
- Multiplayer competition
- Elaborate currencies, loot boxes, or complex economies
- Large-scale social features
- Accounts/cloud synchronization, unless multi-device continuity becomes necessary
- Full automated conversion without editorial data review

The priority is proving that learners return to understand and review roots.

## Build Sequence

### Phase 0: Audit and preserve

- Inspect `arabic.html`, `quiz.html`, and existing data formats.
- Obtain the original workbook or a UTF-8 CSV with Arabic text intact.
- Define a schema and conversion process.
- Produce a small reviewed dataset; do not publish raw data blindly.

### Phase 1: Explore

- Add root-data loading.
- Build search/browse and root detail views.
- Render only populated forms.
- Add responsive RTL-aware presentation for Arabic while retaining readable English explanations.

### Phase 2: Practice

- Build a question generator from the reviewed data.
- Implement multiple-choice and matching first.
- Add feedback that explains the semantic relationship, not only whether the answer was right.
- Save local mastery and review data.

### Phase 3: Retention and play

- Add daily new-root plus review loop.
- Add mastery states and semantic forest/map.
- Add confidence ratings and adaptive scheduling.
- Introduce one or two game modes only after the basic loop feels useful.

### Phase 4: Evaluate

Track return behavior, completion, question accuracy, confidence calibration, and which root pages produce the most confusion. Use this evidence to revise content and interaction design before expanding the dataset.

## UX and Content Principles

- Put the root’s core image before terminology-heavy morphology labels.
- Let learners predict before explaining.
- Use concise learner-facing language, with detailed notes behind an optional reveal.
- Preserve caveats around archaic, rare, dialectal, uncertain, or nonproductive forms.
- Never present a speculative editorial note as an unqualified fact.
- Keep Arabic legible: use a robust Arabic-capable font, sufficient size and line height, and appropriate `dir="rtl"` on Arabic fragments or containers.
- Ensure form inputs, keyboard navigation, contrast, feedback, and reduced-motion behavior are accessible.
- Do not assume every root has every form or that every form follows a simple mechanical semantic rule. The content should teach tendencies and specific evidence, not overpromise universal predictability.

## Future Enhancements

Potential later additions, only after the MVP demonstrates value:

- Audio pronunciation and word-level recordings
- Example sentences with translations
- Filters for theme, frequency, level, form, and review status
- Personalized study paths
- Exportable study packs
- Cloud sync and accounts
- Editorial dashboard for reviewing imported root content
- Content versioning and change history
- Teacher/classroom mode

## Definition of Done for the First Release

The first release is done when a learner can:

1. Find a root.
2. Understand its core semantic image.
3. Explore its actually documented forms without empty placeholders.
4. Complete a short adaptive practice set.
5. Receive explanations that connect form and meaning.
6. Return later to a clearly identified review queue.
7. See meaningful mastery progress without needing a leaderboard or virtual currency.

## Future-Agent Checklist

Before changing this feature, a future assistant/developer should:

1. Read this document and inspect the live contents of `arabic/`.
2. Confirm the authoritative data source preserves Arabic Unicode.
3. Check the project’s existing HTML/CSS/JS patterns before proposing architecture changes.
4. Validate every data transformation with sample roots containing Arabic, multiple forms, blanks, keywords, and editorial caveats.
5. Make the smallest useful vertical slice first.
6. Keep raw source notes separate from polished learner content.
7. Avoid destructive changes to existing files or data without explicit user approval.
8. Request confirmation before commits, pull requests, deployments, or other external writes.

## Summary

The feature should become a semantic, game-supported learning system—not a spreadsheet viewer and not a generic flashcard clone. The workbook’s distinctive value lies in its core images and explanations of how related forms extend those images. Build around that insight: browse a root, understand its thread, predict meaning, practice retrieval, and return for review.
