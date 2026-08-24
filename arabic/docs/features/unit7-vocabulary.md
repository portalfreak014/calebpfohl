# Unit 7 (Chapters 31–32 Vocabulary) ✅ Done

`arabic/data/unit7.json` and the `unit7` entry in `arabic/data/units-manifest.js` are live on `main`, following the exact Content Contract and manifest shape used for Unit 6. Chapter 31 (`ch31`) and Chapter 32 (`ch32`, 69 questions) are both marked `available: true`. No engine changes were required to add either chapter — `quiz.html`, `progress-store.js`, and the manifest helper API worked immediately once each chapter's data existed, confirming the unit-agnostic design goal holds in practice, including for a second chapter added after the fact.

`arabic.html` was updated to add a `#unit7-chapters` picker section mirroring `#unit6-chapters`. The previously hardcoded `UNIT_ID` constant was generalized to `UNIT_IDS = ["unit6", "unit7"]`, and the chapter-list renderer was parameterized (`renderChapterListForUnit`/`renderAllChapterLists`) rather than duplicated, so a future Unit 8 needs only a new array entry and a new `#unit8-chapters` section, not new rendering logic. The Continue card's fallback-chapter logic was also updated to check each unit in `UNIT_IDS` order rather than defaulting to Unit 6 alone. A navigation-drawer link for Unit 7 vocabulary was added alongside the existing (now relabeled) Unit 6 link. Chapter 32 required no further homepage changes — it appears automatically in the existing `#unit7-chapters` list once added to the manifest.

## Content format correction (Chapter 31 launch bug) ✅ Done

Chapter 31 initially shipped with a mismatched content shape (`arabic`/`english`/`type` fields with no answer choices) instead of the actual required shape used by `quiz.html` and matching `unit6.json`: `number`, `arabic`, a `choices` object keyed `A`–`D`, and an `answer` field naming the correct key. This caused a "Quiz unavailable" error for every learner clicking into Chapter 31 from the homepage, since the quiz engine had nothing to render. The fix regenerated all 45 Chapter 31 questions in the correct format, with 3 distractor choices per question sampled from other Chapter 31 vocabulary, and this correction shipped as its own commit before Chapter 32 was added. Chapter 32 was built directly in the correct format from the start.

## Chapter 31 vocabulary gap-fill (2026-08-24) ✅ Done

A word-by-word QC pass compared the Chapter 31 source textbook passage (university education reform in the Arab world) against every `arabic` entry in `ch31`. Three vocabulary terms were underlined in the source passage but missing from the JSON, and have been added as questions 46–48, in the same `number`/`arabic`/`choices`(`A`–`D`)/`answer` shape as the rest of the file:

| # | Arabic | English |
|---|---|---|
| 46 | حَظِيَ (بـ) / يَحْظى / حُظْوة | to enjoy, receive, be granted |
| 47 | لا بُدَّ من | it is necessary, there's no avoiding |
| 48 | حاصل (من حَصَلَ / يَحْصُلُ / حُصول) | occurring, taking place |

Commit `1161f7e` — "Add missing Ch31 vocab: تحظى, لا بُدَّ من, حاصل" on `main`. Chapter 31 now totals **48 questions** (originally shipped with 45). Chapter 32 (69 questions) was not touched by this pass. No engine or manifest changes were required, consistent with the Content Contract.

## Rules

- Every new chapter's questions must be authored directly in the `number`/`arabic`/`choices`(`A`–`D`)/`answer` shape used by `unit6.json` — never in an intermediate or simplified shape — since `quiz.html` has no fallback rendering path for a differently-shaped question object.
- Distractor choices should be sampled from vocabulary within the same chapter, consistent with how Chapters 26–31 and 32 were built, so no engine change is needed to support a new chapter's answer options.
- Multi-word vocabulary with closely related meanings within the same chapter (e.g. "quarrel" the noun vs. "to quarrel" the verb, both present in Chapter 32) should be spot-checked after generation, since random distractor sampling can occasionally produce a technically-wrong-but-plausible-sounding decoy pair.
