# Glossary Location Migration

**Date:** 2026-08-27

## Completed changes

- Renamed the authoritative glossary directory from `arabic/data/raw-vocabulary/` to `arabic/data/glossary/`.
- Preserved the existing glossary README and the Unit 1–10 Markdown glossary files during the move.
- Added repository-level glossary instructions in `AGENTS.md`.
- Added `arabic/docs/GLOSSARY_WORKFLOW.md` for project-level cross-reference guidance.
- Updated those workflow documents to identify `arabic/data/glossary/` as the source of truth.

## Current source of truth

The human-maintained vocabulary source files are:

```text
arabic/data/glossary/unit{N}-glossary.md
```

Example:

```text
arabic/data/glossary/unit7-glossary.md
```

## Data roles

- `arabic/data/glossary/`: Human-maintained source glossaries.
- `arabic/data/vocabulary/unit{N}/chapter{NN}.json`: Structured chapter-level vocabulary output.
- `arabic/data/unit{N}.json`: Built unit-level data used by the application.

## Remaining follow-up

No machine-readable glossary index has been created. If automated chapter lookup becomes necessary, add a separately maintained or generated index with unit, chapter, entry, Arabic term, English gloss, and source-file/section metadata.

## Audit note

GitHub code search returned incomplete results during the migration review. The documented workflow files were updated, but this record does not certify that every historical or external reference to `raw-vocabulary` has been found.
