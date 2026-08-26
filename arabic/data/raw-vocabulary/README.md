# Raw vocabulary backups

This directory holds the simplest durable record of the Arabic vocabulary: the Arabic expression and its English meaning, organized by unit and chapter.

## Purpose

These files are a human-readable recovery layer. They are intentionally separate from quiz JSON, application code, audio, grammar metadata, and generated content. If a migration, script, UI change, or automated edit goes wrong, rebuild vocabulary data from these glossaries.

## Format

Each unit should have one Markdown file named `unit<N>-glossary.md`. Organize entries under chapter headings and use this table format:

```md
| Arabic | Meaning |
|---|---|
| كِتَاب | book |
```

Keep the text exactly as it appears in the source glossary whenever possible, including diacritics, alternate forms, related verb forms, plurals, and prepositions.

## Rules

- Store only raw vocabulary and meanings in glossary files.
- Do not add IDs, part-of-speech tags, grammatical analysis, answer choices, UI state, audio paths, or code-specific fields.
- Do not silently correct wording while creating a backup. Record the source text first; make corrections separately and document them.
- Treat these files as a source-of-truth recovery layer, not as generated output that can be overwritten casually.
- Review vocabulary changes as ordinary Git diffs.

## Relationship to structured data

The files in `../` may eventually contain rich lexical records for quizzes, games, and morphology study. Those records can be created from these glossaries and expanded with additional data. The raw glossaries remain intentionally simple so the project can always be rebuilt from a readable baseline.

## Current status

- Unit 6 glossary: pending creation
- Unit 7 glossary: pending creation
