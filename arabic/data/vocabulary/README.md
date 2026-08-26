# Canonical vocabulary data

This directory will hold the canonical, structured vocabulary records used by future study views, morphology drills, matching games, search, and other vocabulary-driven features.

## File organization

Store rich vocabulary data in one JSON file per chapter:

```text
vocabulary/
  unit6/
    chapter26.json
    chapter27.json
  unit7/
    chapter31.json
```

Do not place an entire unit's rich vocabulary in one large JSON file. Chapter-sized files keep authoring, validation, Git diffs, rollback, and AI-assisted work small and reviewable.

## Relationship to other data

- `../raw-vocabulary/` contains the human-readable recovery layer: Arabic and meaning only.
- This directory contains the canonical rich lexical records.
- `../quizzes/` contains quiz-specific presentation and answer-key data.
- Existing legacy unit quiz files remain in place until a deliberate per-chapter migration is completed.

## Chapter file shape

Each chapter file should be valid JSON and start with this container:

```json
{
  "unitId": "unit6",
  "chapter": 26,
  "title": "Chapter 26 Vocabulary",
  "entries": []
}
```

Each object in `entries` uses the content-first schema documented in `../../docs/features/content-first-vocabulary-migration.md`.

## Safe workflow

1. Populate and verify the chapter section in the raw Unit glossary first.
2. Create or update only that chapter's vocabulary JSON file.
3. Validate the JSON and review the Git diff.
4. Add quiz data separately if the chapter has a quiz.
5. Mark the chapter available in the unit manifest only after its data is ready.

Do not silently infer or change vocabulary meanings while migrating. Content validation is separate work.
