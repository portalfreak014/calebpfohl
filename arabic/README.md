# Arabic Learning Project

This directory contains the Arabic-learning application, its vocabulary data, and supporting documentation.

## Vocabulary architecture

| Location | Role | Use it for |
| --- | --- | --- |
| `data/glossary/` | Authoritative, human-maintained source glossary | Checking whether a vocabulary item is already covered; reviewing and extending glossary source material |
| `data/vocabulary/unit{N}/chapter{NN}.json` | Structured per-chapter vocabulary output | Chapter-level application data and structured-entry work |
| `data/unit{N}.json` | Built unit-level vocabulary data | Application consumption and unit-level output |

The source glossary follows the naming convention `unit{N}-glossary.md`, such as `data/glossary/unit7-glossary.md`.

## Glossary cross-references

For a screenshot, reading passage, or exercise from a specific unit and chapter:

1. Open `data/glossary/unit{N}-glossary.md`.
2. Find the matching chapter section.
3. Extract the requested, highlighted, or underlined Arabic terms.
4. Compare each term against the chapter entries, allowing for ordinary inflectional variants and the definite article.
5. Report each term as present, missing, or a possible variant; include current glossary wording and proposed entries for missing terms.

Do not use `data/vocabulary/` or `data/unit{N}.json` as the default source when the question is whether a term is already in the glossary.

## Documentation

- [Glossary workflow](docs/GLOSSARY_WORKFLOW.md)
- [Glossary source files](data/glossary/README.md)
- [Glossary migration record](docs/GLOSSARY_MIGRATION_2026-08-27.md)
- Repository-level instructions: [`../AGENTS.md`](../AGENTS.md)

## Discovery rule

Before reporting that a glossary file is absent, list the relevant directory directly. Do not rely only on code-search results, which may be incomplete.
