# Per-Unit Vocabulary QC Lists ⏳ Planned

## Purpose

For every unit, generate a plain list of all vocabulary (Arabic + English) grouped by chapter, separate from the quiz JSON — so a human can scan for gaps (like the Chapter 31 fix documented in [unit7-vocabulary.md](unit7-vocabulary.md)) without reading raw JSON. Requested 2026-08-24.

## Plan

- Pull directly from each `arabic/data/unitN.json` file — never hand-transcribed, to avoid drift from the source of truth.
- Output format: likely a Markdown file per unit (or one combined file with per-unit/per-chapter headers), possibly mirrored as JSON/plain text if useful for tooling later.
- Read-only, low-risk; not started, blocked only on scheduling, not on any technical obstacle (unlike the matching game feature, this doesn't require reading any of the large HTML/JS files).

## Rules

- Must be regenerated from the live JSON files whenever vocabulary changes, not maintained by hand, to avoid becoming its own second source of truth that can drift from `unit6.json`/`unit7.json`/etc.
- Must not be wired into the quiz engine or `ProgressStore` — this is a QC/authoring aid only, not a new learner-facing feature.

## Testing checklist

- [ ] A generated list for at least one unit is spot-checked against its source JSON for completeness (every question represented, no duplicates, no omissions).
- [ ] The generation process is repeatable (e.g. a script or documented manual process) so it can be re-run after future vocabulary additions like the Chapter 31 gap-fill.
