# Changelog

Dated, append-only history of implementation work. New entries go at the top. This file, plus `README.md` (status/index), replaces the old single `CHAPTER_PROGRESS_IMPLEMENTATION.md` file — see `README.md` for why.

---

## 2026-08-24 — Documentation split + Chapter 31 vocab gap-fill

- Split the single `CHAPTER_PROGRESS_IMPLEMENTATION.md` (50KB+, 10+ incremental commits, too large to safely reconstruct via commit-diff replay) into `arabic/docs/README.md` (index + status + guardrails) plus one small file per feature under `arabic/docs/features/` and `arabic/docs/backlog/`. Every sentence from the original file was preserved during the split, just re-filed by topic. The original `CHAPTER_PROGRESS_IMPLEMENTATION.md` file itself is left in place as a historical artifact; new edits should target the split docs instead.
- Fixed Chapter 31 vocabulary gap in `unit7.json`: added 3 missing terms (تحظى, لا بُدَّ من, حاصل) as questions 46–48, found via a word-by-word QC pass against the source textbook passage. See [features/unit7-vocabulary.md](features/unit7-vocabulary.md). Commit `1161f7e`.
- Requested (not yet started): per-unit vocab QC lists — see [features/vocab-qc-lists.md](features/vocab-qc-lists.md).
- Requested (not yet started): picture matching/mix-and-match game mode with a "New!" badge — see [features/matching-game.md](features/matching-game.md). Blocked on getting readable access to `quiz.html`, `arabic.html`, `units-manifest.js`, `progress-store.js`.

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
27. [ ] Generate per-unit vocab QC lists (added 2026-08-24, see item above).
28. [ ] Unblock file access and scaffold the picture matching game mode + "New!" badge (added 2026-08-24, see item above).
