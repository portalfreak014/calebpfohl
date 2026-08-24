# Session Log — Unit 7 Vocabulary QC & Feature Roadmap
**Date:** August 24, 2026

This log documents a quality-control pass on Unit 7 vocabulary and lays out the plan for three follow-up items requested for the Arabic study app. It is a standalone companion to `CHAPTER_PROGRESS_IMPLEMENTATION.md` (not a replacement) — future work described here should eventually be folded into that doc once implemented.

---

## 1. Completed: Chapter 31 vocabulary gap-fill

**What happened:** The source textbook passage for Chapter 31 (university education reform in the Arab world) was compared word-for-word against `arabic/data/unit7.json`. Every underlined vocabulary term in the passage was checked against the existing `ch31` question list.

**Result:** 3 terms were underlined in the source text but missing from the JSON. They have been added as questions 46–48 in `ch31`, in the same 4-choice multiple-choice format as the rest of the file:

| # | Arabic | English |
|---|---|---|
| 46 | حَظِيَ (بـ) / يَحْظى / حُظْوة | to enjoy, receive, be granted |
| 47 | لا بُدَّ من | it is necessary, there's no avoiding |
| 48 | حاصل (من حَصَلَ / يَحْصُلُ / حُصول) | occurring, taking place |

**Commit:** `1161f7e` — "Add missing Ch31 vocab: تحظى, لا بُدَّ من, حاصل" on `main`.

Chapter 31 now totals 48 questions (was 45); Chapter 32 (69 questions) was untouched.

---

## 2. Requested, not yet started: full vocab QC lists

**Goal:** For every unit, generate a plain list of all vocabulary (Arabic + English), grouped by chapter, separate from the quiz JSON — for fast human scanning/QC without having to read raw JSON.

**Plan:**
- Pull directly from each `arabic/data/unitN.json` file.
- Output format: likely Markdown (one file per unit, or one combined file with per-unit/per-chapter headers), possibly mirrored as JSON/plain text if useful for tooling later.
- This is a read-only, low-risk task — blocked only on scheduling, not on any technical obstacle.

---

## 3. Requested, not yet started: picture matching/mix-and-match game mode

**Goal:** Add a new study mode alongside the existing English→Arabic and Arabic→English quiz directions — a card-matching-style game using pictures, selectable per chapter. Should carry a "New!" badge in the UI to flag it as a newly added feature. Exact game mechanics are open — the ask is foundational scaffolding (similar in spirit to how the quiz engine itself was originally scaffolded), not a fully designed game yet.

**Where it plugs in:** `arabic/quiz.html` (quiz engine/UI), `arabic/data/units-manifest.js` (chapter/unit registry — likely needs a flag like `hasMatchGame` or similar per chapter), and possibly `arabic/progress-store.js` if match-game results should feed into the same progress tracking as quiz answers.

**Why it's not started yet:** `quiz.html`, `arabic.html`, `units-manifest.js`, and `progress-store.js` have each grown through many incremental commits (10+ each) and are too large to safely reconstruct client-side from diffs alone in this session — the tooling used here can read file content reliably via full-diff replay for small/young files (like `unit7.json`), but not yet for these larger, older files without risking a corrupted push.

**Unblocking options (pick one before implementation starts):**
1. Paste the current contents of `quiz.html`, `arabic.html`, `progress-store.js`, and `units-manifest.js` directly into the conversation.
2. Authorize a slower reconstruction via sequential commit-diff replay for each file.
3. If GitHub Pages is enabled for this repo, share the live Pages URL so the rendered/served files can be fetched directly.

---

## Next session checklist
- [ ] Generate per-unit vocab QC lists (Markdown/JSON).
- [ ] Unblock file access for `quiz.html` / `arabic.html` / `units-manifest.js` / `progress-store.js`.
- [ ] Scaffold picture matching game mode + "New!" badge once unblocked.
- [ ] Fold this log into `CHAPTER_PROGRESS_IMPLEMENTATION.md` once the above are implemented.
