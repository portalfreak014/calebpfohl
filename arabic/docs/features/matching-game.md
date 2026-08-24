# Picture Matching / Mix-and-Match Game Mode ⏳ Planned

## Purpose

A new study mode selectable per chapter, alongside the existing Arabic-to-English and English-to-Arabic quiz directions (see [quiz-engine-and-progress.md](quiz-engine-and-progress.md)) — a card-matching-style game using pictures. Requested 2026-08-24. Mechanics are intentionally undecided; the ask is foundational scaffolding (in the spirit of the original quiz engine scaffolding — see `CHANGELOG.md`), not a fully designed game.

Should carry a visible "New!" badge in the UI, distinct from the existing "Coming soon" badge pattern (see [homepage.md](homepage.md)) — this signals available-now-and-new, not unavailable.

## Where it plugs in (proposed, not yet implemented)

- `arabic/quiz.html` — rendering/engine, likely a new mode value alongside the existing direction modes.
- `arabic/data/units-manifest.js` — chapter/unit registry, likely needs a new per-chapter flag, e.g. `hasMatchGame`, so a chapter can opt in without engine changes, consistent with the unit-agnostic design goal in [content-contract-and-manifest.md](content-contract-and-manifest.md).
- `arabic/progress-store.js` — possibly, if match-game results should feed the same progress model as quiz answers. Must be additive only, consistent with how `knownWords` was added without disturbing existing fields (see [known-vocabulary.md](known-vocabulary.md)).

## Status: not started

Full-content reconstruction of `quiz.html`, `arabic.html`, `units-manifest.js`, and `progress-store.js` was attempted 2026-08-24 and deferred — each file had grown through many incremental commits and was too large to safely reconstruct from commit diffs alone without risking a corrupted push.

**Unblocking options (pick one before implementation starts):**
1. Paste the current contents of `quiz.html`, `arabic.html`, `progress-store.js`, and `units-manifest.js` directly into the conversation (this is exactly how this documentation split itself was unblocked).
2. Authorize a slower reconstruction via sequential commit-diff replay for each file.
3. If GitHub Pages is enabled for this repo, share the live Pages URL so the rendered/served files can be fetched directly.

## Rules (once started)

- Must reuse the existing Content Contract and `UnitsManifest` rather than introducing a parallel content format, consistent with the rule already established for other mini-games in [classmate-feedback.md](../backlog/classmate-feedback.md).
- Must not silently change how `ProgressStore.recordAnswer` scores a streak for the existing quiz modes.
- The "New!" badge is a presentation-layer detail and must not be stored inside `knownWords`, `bestScore`, or other existing progress fields.

## Testing checklist

- [ ] Foundational scaffolding (mode plumbing, manifest flag, minimal UI) is in place for at least one chapter.
- [ ] "New!" badge renders distinctly from the existing "Coming soon" badge and does not block interaction.
- [ ] If wired into `ProgressStore`, match-game results are additive and do not affect existing `knownWords`/`bestScore` fields for the same chapter.
