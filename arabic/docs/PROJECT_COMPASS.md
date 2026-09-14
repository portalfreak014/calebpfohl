# Project Compass

## Purpose

Use this document as the first reference before planning or implementing work in the Arabic study app. It identifies the canonical source for each kind of change, records the approved architectural direction, and separates current work from future ideas.

## Canonical Sources

| Need | Source of truth | Rule |
|---|---|---|
| Units and chapters | `arabic/data/units-manifest.js` | Add a unit or chapter here after its content file exists. |
| Vocabulary entry shape | `arabic/data/templates/` | Start with the general entry template and apply the part-of-speech template when relevant. |
| Vocabulary content | `arabic/data/{unitId}.json` | Keep learning content separate from UI and learner progress. |
| Quiz presentation | `arabic/quiz.html` | Render normalized activity data; do not hard-code unit or chapter content. |
| Learner progress | `arabic/progress-store.js` | Keep progress local-first and keyed by stable vocabulary IDs. |
| Feature status and rules | `arabic/docs/README.md` and feature docs | Update the relevant feature document before broad implementation changes. |

## Architecture Direction

Vocabulary is the reusable content layer. A rich vocabulary entry supplies stable identity, Arabic text, lemma, glosses, part of speech, grammar, optional audio, examples, tags, and source metadata. Activities such as quizzes, flashcards, matching, and review derive their own prompts and interactions from that shared entry rather than owning duplicate vocabulary data.

The existing `number` / `arabic` / `choices` / `answer` question format remains supported during migration. Do not rewrite all existing content at once. Add a normalization adapter in the quiz engine so it can consume both the legacy format and the metadata-rich format safely.

## Quiz Direction

For schema-driven multiple choice, the correct option comes from the selected entry's preferred gloss. The remaining options are sampled from a filtered pool of other entries, then the full option set is shuffled at render time. Filter out the current entry, duplicate glosses, and obviously incompatible distractors; prefer part-of-speech, chapter, topic, and difficulty tags when available.

The quiz UI may continue showing four options, but labels such as A/B/C/D are presentation details rather than authored content. Activities must validate answers using stable entry IDs or normalized answer values, never an authored letter position.

## Migration Order

1. Preserve live legacy questions unchanged.
2. Implement a normalizer that returns one activity-ready shape for either legacy questions or vocabulary entries.
3. Migrate a small reviewed sample using the appropriate templates, beginning with one part of speech.
4. Generate and validate dynamic distractors, Arabic/English direction changes, known-word tracking, and absent-audio behavior.
5. Migrate chapter by chapter only after the sample is correct and usable.
6. Retire legacy-only authoring fields only when all live content and activities no longer require them.

## Performance and Caching

Load a selected chapter once and keep its normalized entries in memory for the active session. Generate distractors only when rendering a question; this is lightweight for chapter-sized pools. A later versioned browser cache may store normalized content keyed by content version or source hash, then revalidate against the published JSON and replace stale cached data only when content changes.

Keep the content cache separate from `ProgressStore`. Cached content is replaceable published data; learner progress is personal durable data.

## Decision Rules

- Check `arabic/data/templates/` before inventing a vocabulary field or data shape.
- Prefer shared, activity-agnostic content and small adapters over quiz-specific one-off rules.
- Add or update a focused feature document before introducing a new subsystem or external service.
- Preserve Material Design 3 styling and correct Arabic `lang` / `dir` handling.
- Make optional data graceful: missing audio, metadata, or cache data must not block study.
- Do not put authentication, analytics, content quality flags, or learner progress into vocabulary records.
- Keep changes incremental, reviewed, and reversible.

## Current Next Steps

- Create the legacy-to-rich-content normalization adapter.
- Select one reviewed template type and one small chapter sample for migration.
- Add filtered dynamic distractor generation with deterministic tests.
- Connect the shared audio control to metadata-rich entries when audio is available.
- Document the migration result before expanding to additional chapters.
