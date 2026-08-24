# Content Contract & Units/Chapters Manifest

## Content Contract ✅ Done

Every unit's JSON file must conform to the same shape, regardless of subject matter.

```json
{
  "unitId": "unit6",
  "title": "Unit 6 Vocabulary",
  "chapters": {
    "ch26": { "number": 26, "title": "Chapter 26", "questions": [] }
  }
}
```

Rules: file location `arabic/data/{unitId}.json`; `chapters` keyed by chapter ID; `questions` array holds actual content; adding a unit requires no engine changes; the manifest is never a substitute for validating the fetched JSON.

## Units and Chapters Manifest ✅ Done

`arabic/data/units-manifest.js` holds `window.UNITS_MANIFEST`, keyed by unit ID, and a `window.UnitsManifest` helper API (`listUnits`, `getUnit`, `listChapters`, `getChapter`, `getAvailableChapters`, `getNextAvailableChapter`). All five Unit 6 chapters (`ch26`-`ch30`) are marked `available: true`.
