# Picture Matching / Mix-and-Match Game Mode ✅ Done (foundation)

## Purpose

A new study mode, standalone from the quiz engine — a card-matching-style game using pictures/vocabulary pairs. Requested 2026-08-24. Shipped same day as a foundational, standalone engine at `arabic/match.html`, separate from `quiz.html` rather than a new mode inside it (simpler to build and iterate on independently while the mechanic is still experimental).

Carries a visible "New!" badge (gradient pill) in the homepage bottom nav, navigation drawer, and on the match page's own header — distinct from the existing "Coming soon" badge pattern (see [homepage.md](homepage.md)) — signaling available-now-and-new, not unavailable.

## What shipped (2026-08-24)

- **`arabic/match.html`** — the engine. Tap an Arabic term on the left, then tap its English meaning on the right. Correct pairs lock in green and become disabled; incorrect picks flash red, briefly, then reset both selections. A "Shuffle & restart" control re-shuffles both columns and resets progress for the current set. A completion panel appears once all pairs in a set are matched, with "Play again" and "Next set" actions.
- **Matching Set Content Contract** — mirrors the quiz unit Content Contract's unit-agnostic design:
  ```json
  {
    "setId": "ch31-set1",
    "title": "The Syrian Virtual University",
    "unit": "unit7",
    "chapter": "ch31",
    "sourcePage": "31.5",
    "pairs": [
      { "arabic": "افتتاح", "english": "opening / inauguration" }
    ]
  }
  ```
  Saved as standalone files under `arabic/data/match-sets/` (`ch31-set1.json`, `ch31-set2.json`). The engine's `MATCH_SETS` array in `match.html` is currently hand-populated from these files; a future iteration could fetch them the way `quiz.html` fetches unit JSON, but for the initial two sets this was not necessary.
- **Content conversion pipeline** — the two initial sets were converted from `Chapter_31_Pages_31.5_31.6_Vocabulary_Sheets.pdf` (a printed matching worksheet: Arabic terms in one column, lettered English meanings in another). This is now a repeatable process: attach a similar worksheet PDF in a future session, and the term/meaning pairs get extracted into the same JSON shape and added to `match.html`'s set list — no engine changes required, the same way a new quiz chapter needs only a new content file plus a manifest entry.
- **Progress tracking** — per-set match count and mistake count save to `localStorage` under `arabicStudy.matchProgress.v1.{setId}`, a separate namespace from `ProgressStore` (`arabicStudy.profile.v1`) and from `docs.html`'s storage (`arabicStudy.docs.v1.*`). A completed set shows a "Complete" status badge in the set picker.
- **Navigation** — `match.html` uses the same focused-task topbar pattern as `quiz.html`: an X icon-button on the left that returns to `arabic.html`, a centered eyebrow ("Matching game" + New! badge) and title, no persistent bottom nav bar. This is deliberately different from the home hub's bottom-nav + drawer pattern, since this is a single-purpose activity screen, not a hub page. `arabic.html`'s bottom nav (Home → Match → Learn → Progress) and navigation drawer both link to `match.html` with the New! badge.
- **Analytics** — `trackEvent()` fires `match_set_selected`, `match_pair_correct`, `match_pair_incorrect`, and `match_set_completed` (with `mistake_count`), following the same `dataLayer` pattern documented in [analytics.md](analytics.md). No new GTM container or third-party library was introduced.

## Rules

- Must reuse the Matching Set Content Contract for any new set rather than introducing a parallel shape, consistent with the rule already established for other mini-games in [classmate-feedback.md](../backlog/classmate-feedback.md).
- Must not silently change how `ProgressStore.recordAnswer` scores a streak for the existing quiz modes — `match.html` has its own, entirely separate progress mechanism and must stay that way unless a future decision explicitly links the two.
- The "New!" badge is a presentation-layer detail and must not be stored inside `knownWords`, `bestScore`, `matchProgress`, or any other progress field — it is driven purely by the nav/drawer markup, not by data.
- Every current and future page under `arabic/` (including `match.html`) must carry the identical GTM container snippet, per the existing analytics rule.
- New matching-set conversions from source worksheets should preserve the source's original English lettering/order only insofar as it helps verify correctness during conversion; the live set's `pairs` array order does not need to match the source, since `match.html` shuffles both columns independently on load.

## Possible next steps (not yet decided/started)

- Fetching match-set JSON dynamically (like `quiz.html` fetches unit JSON) instead of hand-embedding the `MATCH_SETS` array in `match.html`, once there are enough sets that embedding becomes unwieldy.
- A per-chapter flag in `units-manifest.js` (e.g. `hasMatchGame`) so the quiz chapter picker could surface a "Practice with matching" link directly from a chapter card, rather than requiring a separate visit to `match.html`'s set picker.
- Deciding whether match-game completion should feed into `ProgressStore` at all (e.g. as a supplementary signal alongside `knownWords`) — intentionally not done yet, since it would require the same care given to how `knownWords` was added without disturbing existing fields.

## Testing checklist

- [x] Foundational scaffolding (engine, content contract, minimal UI) is in place for two sets.
- [x] "New!" badge renders distinctly from the existing "Coming soon" badge and does not block interaction.
- [ ] If wired into `ProgressStore` in the future, match-game results are additive and do not affect existing `knownWords`/`bestScore` fields for the same chapter.
- [ ] A third-party worksheet PDF conversion has been exercised at least once more, to confirm the pipeline generalizes beyond the initial Chapter 31 sheets.
