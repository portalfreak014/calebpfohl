# Arabic Glossary Workflow

## Source of truth

The authoritative, human-maintained glossary files are in `arabic/data/raw-vocabulary/`. There is one Markdown file per unit, named `unit{N}-glossary.md`; for example, `unit7-glossary.md`.

Use these files first when checking whether terms from a reading, screenshot, or exercise are already covered.

## Cross-referencing

1. Open the relevant `unit{N}-glossary.md` file.
2. Locate the matching chapter section.
3. Compare the requested Arabic terms with the chapter entries.
4. Treat ordinary inflectional changes and the definite article as possible variants rather than automatically missing terms.
5. Report terms as present, missing, or possible variants, and propose entries for missing terms.

## Related locations

- `arabic/data/vocabulary/unit{N}/chapter{NN}.json` contains structured per-chapter vocabulary output.
- `arabic/data/unit{N}.json` contains built unit-level data.

These JSON files serve different purposes and are not the default source for coverage checks.

## Discovery rule

Before reporting that a glossary file does not exist, list the relevant repository directory. Do not rely solely on code search, which may return incomplete results.
