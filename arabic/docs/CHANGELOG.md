# Changelog

Dated, append-only history of implementation work. New entries go at the top. This file, plus `README.md` (status/index), replaces the old single `CHAPTER_PROGRESS_IMPLEMENTATION.md` file — see `README.md` for why.

---

## 2026-08-24 (later) — Matching game engine shipped + nav/UX tweaks

- Shipped `arabic/match.html`, a generic, reusable matching-game engine: tap an Arabic term, then tap its English match; correct pairs lock in green, wrong picks flash red and reset. Per-set progress (matched count, mistakes) saves to `localStorage` under `arabicStudy.matchProgress.v1.*` — its own namespace, separate from `ProgressStore`. Fires `dataLayer` events (`match_set_selected`, `match_pair_correct`, `match_pair_incorrect`, `match_set_completed`) following the existing analytics pattern. See [features/matching-game.md](features/matching-game.md).
- Defined a new **Matching Set Content Contract** (`setId`/`title`/`unit`/`chapter`/`sourcePage`/`pairs[]`), mirroring the quiz unit Content Contract. Converted the attached `Chapter_31_Pages_31.5_31.6_Vocabulary_Sheets.pdf` worksheet into two matching sets — "The Syrian Virtual University" and "Academic Institutes in Iraq," 12 pairs each — saved as standalone files at `arabic/data/match-sets/ch31-set1.json` and `ch31-set2.json`. This establishes a repeatable pipeline: future worksheet PDFs can be converted into the same JSON shape and added to `match.html`'s set list with no engine changes.
- Added `arabic/docs.html`, an interactive, editable rendering of the split documentation, styled to match `arabic.html`. Edits save to `localStorage` under `arabicStudy.docs.v1.*` keys — its own namespace, separate from `ProgressStore` and from the match-game progress keys. Per-device only, not a shared multi-user real-time document (that would require a backend, which this site intentionally does not have). See [features/interactive-docs-page.md](features/interactive-docs-page.md).
- UX tweak: `arabic.html`'s bottom nav now has 4 tabs — Home, **Match** (new, with a "New!" pill), Learn (coming soon), Progress (coming soon) — and the navigation drawer gained a "Matching game" entry (same New! badge) plus a "Project docs" link to `docs.html` that hadn't been wired in yet.
- UX tweak: `match.html` was restyled to match `quiz.html`'s focused-task pattern — a topbar with an X button (closes back to `arabic.html`) and a centered title, no persistent bottom nav — instead of the home hub's bottom-nav-plus-drawer pattern. This distinction (hub pages use bottom nav; focused single-task pages use X-to-close) is now a documented convention, see `README.md` Guardrails.

## 2026-08-24 — Interactive docs page + documentation split + Chapter 31 vocab gap-fill

- Split the single `CHAPTER_PROGRESS_IMPLEMENTATION.md` (50KB+, 10+ incremental commits, too large to safely reconstruct via commit-diff replay) into `arabic/docs/README.md` (index + status + guardrails) plus one small file per feature under `arabic/docs/features/` and `arabic/docs/backlog/`. Every sentence from the original file was preserved during the split, just re-filed by topic. The original `CHAPTER_PROGRESS_IMPLEMENTATION.md` file itself is left in place as a historical artifact; new edits should target the split docs instead.
- Fixed Chapter 31 vocabulary gap in `unit7.json`: added 3 missing terms (تحظى, لا بُدَّ من, حاصل) as questions 46–48, found via a word-by-word QC pass against the source textbook passage. See [features/unit7-vocabulary.md](features/unit7-vocabulary.md). Commit `1161f7e`.
- Requested (not yet started): per-unit vocab QC lists — see [features/vocab-qc-lists.md](features/vocab-qc-lists.md).

---

## Implementation Order (historical, as of 2026-08-23)

1. [x] Add `data/units-manifest.js`.
2. [x] Add and manually test `progress-store.js` in isolation.
3. [x] Integrate the progress store and rendering engine into `quiz.html`.
4. [x] Add the homepage chapter picker and progress display, driven by `UnitsManifest`.
5. [ ] Manually test all chapters on mobile and desktop widths.
6. [x] Implement the English-to-Arabic direction mode.
7. [x] Implement the Known Vocabulary (Mark as Known) system: per-word streak tracking, manual override, and clean 0-based cutover, in progress-store.js and quiz.html. Homepage display change from question-count to known-word-count is still outstanding (arabic.html not yet updated for that specific display change).
8. [ ] Manually verify the known-word system on calebpfohl.com (streak increments/resets correctly, manual override works, per-direction independence, cutover shows 0 with old score preserved separately) before moving on.
9. [x] Implement the anonymous flag-a-question feature and Google Sheets logging (`netlify/functions/report-question-flag.js`, `googleapis` dependency, local retry queue).
10. [ ] Manually verify the deployed flag endpoint end-to-end: Google Sheet row creation, retry queue behavior on failure, and distinct success vs. queued learner messaging.
11. [x] Add homepage Coming Soon states for Study Sets and Class Resources.
12. [x] Add the site attribution footer.
13. [ ] Transcribe, review, and finalize the Unit 6 supplementary vocabulary (sticky notes + whiteboard phrase) into a new content file, then wire it into the homepage and quiz as its own study set.
14. [x] Add Unit 7 Chapter 31 vocabulary content file, manifest entry, and homepage chapter picker.
15. [x] Fix Chapter 31's content format bug (missing multiple-choice `choices`/`answer` fields) that caused "Quiz unavailable."
16. [x] Add Unit 7 Chapter 32 vocabulary (69 questions) to the existing `unit7.json` and manifest, in the corrected format from the start.
17. [ ] Set up Netlify Functions scaffolding and the Google OAuth client; implement Google sign-in.
18. [ ] Implement magic-link email sign-in.
19. [ ] Set up Netlify DB and wire up profile sync for both sign-in methods, including the known-word fields.
20. [ ] Add the `verified` field convention and begin tracking verification status.
21. [ ] Test account authentication and sync per its checklist before opening a pull request.
22. [ ] Set up the Google Play Console listing and submit an internal testing build (Play Store developer fee already paid).
23. [ ] Enroll in the Apple Developer Program (planned ~1 month out), then begin iOS packaging and App Store listing work.
24. [x] Add the GTM-NDCR97CD container to arabic.html and quiz.html, matching index.html.
25. [x] Add lightweight dataLayer event tracking (direction_toggle, chapter_card_click, answer_selected, answer_checked, word_flagged, word_marked_known, chapter_completed).
26. [ ] Configure a GA4 tag inside the GTM container to actually forward page views and the seven custom events to a GA4 property; enable Enhanced Measurement for scroll-depth signal.
27. [ ] Generate per-unit vocab QC lists.
28. [x] Build the picture matching game mode (`match.html`) foundation, with 2 matching sets for Chapter 31, a "New!" badge, and dataLayer event tracking.
29. [x] Build an interactive, editable docs.html page for browsing/editing project documentation.
30. [x] Add "Match" to the homepage bottom nav and drawer; restyle match.html with a quiz.html-style X-to-close topbar instead of a bottom nav.
