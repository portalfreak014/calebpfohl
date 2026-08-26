# Chapter quiz data

This directory will hold quiz-specific data separate from the canonical vocabulary records. It exists so vocabulary can support multiple learning modes without being tied to a single multiple-choice quiz format.

## File organization

Store one JSON file per chapter:

```text
quizzes/
  unit6/
    chapter26.json
    chapter27.json
  unit7/
    chapter31.json
```

Keep match-game sets and other feature-specific data separate unless they are deliberately migrated. Existing files under `../match-sets/` remain unchanged.

## Chapter file shape

Each chapter quiz file should be valid JSON and start with this container:

```json
{
  "unitId": "unit6",
  "chapter": 26,
  "title": "Chapter 26 Quiz",
  "questions": []
}
```

Question objects may refer to canonical vocabulary entries by `id` once those records exist. Keep multiple-choice options, answer keys, hints, scoring behavior, and display-order settings in quiz data—not in canonical vocabulary entries.

## Safe workflow

1. Verify the vocabulary source and canonical chapter records first.
2. Create or update one chapter quiz file at a time.
3. Validate answer keys in a separate review pass.
4. Do not move or delete legacy quiz files until the chapter replacement has been tested.
5. Update app consumers and the unit manifest only after the corresponding chapter files are ready.

## Current status

This is architecture documentation only. No chapter quiz files have been migrated here yet.
