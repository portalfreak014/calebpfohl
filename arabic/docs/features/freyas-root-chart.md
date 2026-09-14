# Freya's Root Chart — Feature Plan

## Attribution and Source

**Freya's Root Chart is created and maintained by Freya Selberg.**

The live workbook is the editorial source of truth: [Freya's Root Chart workbook](https://dliflc01-my.sharepoint.com/:x:/r/personal/freya_selberg_dliflc_edu/Documents/Microsoft%20Teams%20Chat%20Files/freyasRootChart-copy%202.xlsx?d=wf04d4c304b6543f3986ca250e9463ed5&csf=1&web=1&e=LzEV8r&nav=MTVfe0Q0MzZENUU3LTAzRkItQkM0RC04NTk2LTdGOTc5OUMwQTgzQX0). Treat imports as reviewed snapshots of a living source, not as a replacement for Freya's chart. Preserve this attribution on the Root Chart landing page, root detail pages, and in imported root-record source metadata.

Before publishing imported content, confirm permission for web use and retain any attribution, usage, or editorial-caveat requirements supplied by Freya. Do not automatically import, alter, or overwrite chart content without review.

## Purpose

Freya's Root Chart turns Arabic root study into connected semantic learning: learners explore a root's core thread, see how documented forms extend it, practice retrieval, and return through scheduled review. It should teach relationships among roots, forms, and vocabulary rather than present isolated translations or a raw spreadsheet.

## Connected Schema Model

Use two connected, reusable content layers.

- **Vocabulary entries:** Per-chapter rich records in `arabic/data/vocabulary/{unitId}/{chapterId}.json`, authored from `arabic/data/templates/`. Each record holds word-specific data: Arabic, lemma, glosses, part of speech, grammar, examples, audio, tags, and source.
- **Root records:** Shared records in `arabic/data/roots.json`. Each record holds the root's core semantic thread, populated form explanations, keywords, source notes, editorial caveats, and source attribution.

Every vocabulary entry that has a known root may include both fields below:

```json
{
  "rootId": "j-m-ayn",
  "grammar": {
    "root": ["ج", "م", "ع"]
  }
}
```

`rootId` is the stable relationship key used to link a word to a record in `roots.json`. It is based on root letters, not an English semantic description, so it remains stable if a thread or gloss changes. `grammar.root` holds the actual Arabic letters for display, search, and linguistic data. Entries with uncertain or inapplicable roots may omit both fields.

A root record uses the same identifier:

```json
{
  "id": "j-m-ayn",
  "root": "جمع",
  "transliteration": "j-m-ʿ",
  "thread": "collecting, assembling, or bringing separate units together into a whole",
  "forms": {},
  "keywords": [],
  "examples": [],
  "editorialNotes": [],
  "source": {
    "title": "Freya's Root Chart",
    "creator": "Freya Selberg",
    "sourceUrl": "https://dliflc01-my.sharepoint.com/:x:/r/personal/freya_selberg_dliflc_edu/Documents/Microsoft%20Teams%20Chat%20Files/freyasRootChart-copy%202.xlsx?d=wf04d4c304b6543f3986ca250e9463ed5&csf=1&web=1&e=LzEV8r&nav=MTVfe0Q0MzZENUU3LTAzRkItQkM0RC04NTk2LTdGOTc5OUMwQTgzQX0",
    "importedAt": null,
    "sourceUpdatedAt": null,
    "permissionStatus": "pending-confirmation"
  },
  "status": "draft"
}
```

Do not duplicate a root's thread or form explanation into every linked vocabulary entry. Instead, resolve `rootId` at runtime: a quiz can offer an “Explore this root” link after a question, and a root detail page can generate focused practice from all linked vocabulary entries.

## Learner Experiences

| View | Learner goal | Data used |
|---|---|---|
| Explore | Understand a root and its semantic thread | Root record plus linked vocabulary |
| Practice | Recall meanings and distinguish forms | Vocabulary entries plus root relationships |
| Review | Return to weak or due material | Separate word and root mastery records |

A root detail page leads with the root, transliteration, source attribution, and core thread. It then renders only populated forms, followed by linked vocabulary and optional contextual notes. Ask learners to predict a form-to-meaning connection before revealing its explanation.

The quiz remains activity-focused. It can generate dynamic multiple-choice distractors from vocabulary pools, validate answers using normalized values or stable IDs rather than A/B/C/D positions, and surface a linked root after feedback. The Root Chart can launch targeted word, form, and semantic-thread practice without duplicating quiz data.

## Progress and Review

Keep learner data separate from content. Word mastery measures recall of a vocabulary item; root mastery measures recognition of a root's thread and documented form relationships. Store both in the local-first progress layer, keyed respectively by vocabulary-entry ID and `rootId`.

Initial root mastery states are Seed, Sprout, Branch, Tree, and Rooted. Review missed or low-confidence roots sooner, and increase the interval after successful delayed recall. Do not treat a completed activity or a single correct answer as mastery.

## Migration Scope

1. Preserve all current legacy `number` / `arabic` / `choices` / `answer` content unchanged.
2. Add `rootId` as an optional field to the general vocabulary template and applicable part-of-speech templates; retain `grammar.root` for Arabic root letters.
3. Create dense rich vocabulary records per chapter in `arabic/data/vocabulary/{unitId}/{chapterId}.json`, using templates as the authoring base.
4. Build a normalizer so the quiz can safely consume legacy questions and rich entries during the transition.
5. Start with a small, reviewed sample of roots and linked vocabulary, then validate display, Arabic Unicode, links, dynamic distractors, audio absence, and progress behavior.
6. Expand chapter by chapter only after the sample is sound; never bulk-convert unreviewed editorial content.

## UX and Content Rules

- Render only actually documented forms; do not display empty Form I-X placeholders.
- Keep raw source text and editorial notes distinct from concise learner-facing summaries.
- Preserve rare, archaic, dialectal, uncertain, and incomplete notes rather than presenting them as settled facts.
- Preserve Arabic Unicode in data, import tools, and display; do not use a damaged CSV export that substitutes question marks.
- Keep Arabic legible and RTL-aware, while English explanatory text remains easy to scan.
- Make missing audio, missing roots, and incomplete metadata non-blocking.
- Use the existing design language; do not require a framework rewrite for the first vertical slice.

## MVP

Begin with 10-30 carefully reviewed root records and their linked vocabulary. Ship a searchable Root Chart browser, a root-detail view, a short adaptive “master this root” practice round, local root-progress tracking, and a clear source credit to Freya Selberg. Defer social features, currencies, broad gamification, accounts, and automated unreviewed conversion.

## Future-Agent Checklist

- Read this document and `PROJECT_COMPASS.md` before altering root or vocabulary architecture.
- Treat Freya's live workbook as the editorial source of truth and preserve its creator/maintainer credit.
- Confirm the source preserves Arabic Unicode before importing.
- Validate the `rootId` relationship with reviewed samples containing roots, forms, blanks, linked words, and caveats.
- Request explicit approval before publishing imported source content, writing data, or changing live feature behavior.
