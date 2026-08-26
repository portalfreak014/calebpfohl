# Content-first vocabulary migration

## Purpose

Move vocabulary content toward one canonical JSON file per chapter while retaining the unit-level raw glossaries as the human-readable source and recovery layer.

## Canonical layout

```text
arabic/data/vocabulary/
  unit1/
    chapter1.json ... chapter5.json
  unit2/
    chapter6.json ... chapter10.json
  unit3/
    chapter11.json ... chapter15.json
  unit4/
    chapter16.json ... chapter20.json
  unit5/
    chapter21.json ... chapter25.json
  unit6/
    chapter26.json ... chapter30.json
  unit7/
    chapter31.json ... chapter35.json
  unit8/
    chapter36.json ... chapter40.json
  unit9/
    chapter41.json ... chapter45.json
  unit10/
    chapter46.json ... chapter50.json
```

Each chapter JSON file is currently an empty array scaffold. App integration, manifest updates, and JSON-entry migration remain future work.

## Raw glossary layer

The files under `arabic/data/raw-vocabulary/` remain the readable source material for vocabulary migration and review.

### Completed raw glossary work

- Unit 6: `unit6-glossary.md` is populated with Markdown vocabulary tables for Chapters 26–30.
- Unit 7: `unit7-glossary.md` is populated so far with Markdown vocabulary tables for Chapters 31–32.

## Completed structural work

- Chapter-level vocabulary directories and five JSON scaffolds exist for Units 1–10.
- Chapter numbering is cumulative across units: Unit 1 covers 1–5, Unit 2 covers 6–10, and Unit 10 covers 46–50.
- Every unit directory includes a README listing its chapter range and source glossary.

## Next steps

1. Add the remaining raw-vocabulary source material, including Unit 7 Chapters 33–35.
2. Convert raw glossary entries into the documented canonical JSON schema, one file per chapter.
3. Update the unit manifest and application loaders to consume chapter files.
4. Add validation and quality-control checks before switching any user-facing view to the new data source.
