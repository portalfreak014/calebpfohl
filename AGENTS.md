# Arabic Glossary Workflow

## Purpose

This repository contains an Arabic-learning project under `arabic/`. Follow these instructions for requests to find, check, cross-reference, or extend Arabic vocabulary glossaries.

## Source of truth

- Authoritative, human-maintained glossary files are in `arabic/data/raw-vocabulary/`.
- Naming convention: `unit{N}-glossary.md` (for example, `unit7-glossary.md`).
- Treat these Markdown files as the source of truth for whether a vocabulary item is already covered.
- `arabic/data/vocabulary/unit{N}/chapter{NN}.json` contains structured per-chapter vocabulary output.
- `arabic/data/unit{N}.json` contains built unit-level data.
- Do not treat structured JSON or built unit data as the authoritative glossary unless the task explicitly asks about generated output.

## Cross-reference procedure

For a request such as “check the underlined terms from Unit 7, Chapter 31”:

1. Inspect the relevant source glossary at `arabic/data/raw-vocabulary/unit7-glossary.md`.
2. Locate the Chapter 31 section.
3. Extract the highlighted, underlined, or requested Arabic terms from the provided source material.
4. Compare each term with the chapter section, accounting for ordinary inflectional variants and definite articles.
5. Report each term as present, missing, or a possible variant; include the glossary wording and a suggested entry for missing terms.

Before concluding that a glossary file is absent, list the relevant repository directory directly. Do not rely only on code-search results, because GitHub search may be incomplete.

## Repository discovery

When a request refers to Arabic vocabulary, begin at `arabic/` and inspect the directory structure as needed. The word “glossary” refers by default to the Markdown source files in `arabic/data/raw-vocabulary/`.
