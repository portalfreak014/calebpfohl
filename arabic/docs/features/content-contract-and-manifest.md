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

## Vocabulary Metadata ⏳ Planned

Vocabulary metadata is optional and additive: existing quiz entries remain valid until they are enriched. New learning activities must tolerate missing fields and hide unavailable features rather than failing.

Each vocabulary item should receive a stable `id` that does not change when its display text or distractors change. For a verb, use structured morphology instead of packing forms into a single `arabic` string.

```json
{
  "id": "unit6-ch26-017",
  "arabic": "نمّى",
  "lemma": "نمّى",
  "partOfSpeech": "verb",
  "forms": {
    "perfect": { "arabic": "فَعَلَ", "transliteration": "fa'ala" },
    "imperfect": { "arabic": "يَفْعَلُ", "transliteration": "yaf'alu" },
    "verbalNoun": { "arabic": "فِعْل", "transliteration": "fi'l" }
  },
  "transliteration": "nammā",
  "root": "ن م ي",
  "glosses": ["to develop", "to grow"],
  "audio": {
    "src": "audio/unit6/ch26/unit6-ch26-017.mp3",
    "lang": "ar",
    "dialect": "msa",
    "speaker": "native-msa-v1"
  }
}
```

### Required fields for new metadata-rich entries

- `id`: stable identifier, unique within the content collection.
- `arabic`: primary Arabic display form.
- `lemma`: dictionary/headword form, written in Arabic.
- `partOfSpeech`: controlled value such as `verb`, `noun`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `particle`, or `phrase`.

### Verb forms

For verbs, `forms.perfect`, `forms.imperfect`, and `forms.verbalNoun` may be supplied. Each form has Arabic text and optional transliteration. The example labels describe the fields: `perfect` corresponds to فَعَلَ (`fa'ala`), `imperfect` to يَفْعَلُ (`yaf'alu`), and `verbalNoun` to فِعْل (`fi'l`). Use actual forms for each word; do not use these example forms as generic replacements.

Non-verbs omit inapplicable verb-form fields. A phrase can use `lemma` equal to its canonical phrase and `partOfSpeech: "phrase"`.

### Additional metadata

The schema adds these three broadly useful fields beyond lemma and part of speech:

- `transliteration`: a searchable learner-facing Latin-script reading of the primary display form.
- `root`: Arabic triliteral or quadriliteral root when known, for word-family learning; omit it when uncertain or not applicable.
- `glosses`: an ordered array of concise accepted meanings. Activities may show one preferred meaning while search, flashcards, and review screens can expose alternatives.

### Audio metadata

`audio` is optional and activity-agnostic. Any feature may render a shared audio control when `audio.src` is present; features must not assume audio exists for every word.

- `src`: same-origin, relative path to a licensed or original audio file.
- `lang`: language tag, normally `ar`.
- `dialect`: controlled label such as `msa`, `egyptian`, `levantine`, or `gulf`.
- `speaker`: non-identifying recording/version label for quality control.

The shared player belongs in a reusable module, not in quiz-specific logic. Quiz, flashcards, and matching can all invoke it with the entry's `audio` object. It must provide a labeled Listen control, keyboard access, error handling, and no-op behavior when audio is absent.

### Compatibility rules

- Preserve `number`, `arabic`, `choices`, and `answer` while the quiz uses its current format.
- Do not require a full migration of existing vocabulary data before shipping the shared player.
- Keep translations/distractors in activity-specific fields for now; `glosses` is canonical lexical metadata, not a replacement for quiz answer validation.
- Validate IDs, controlled part-of-speech values, form object shape, audio paths, and duplicate roots/lemmas only where applicable.
- Do not commit recordings without clear permission or a documented license.

## Units and Chapters Manifest ✅ Done

`arabic/data/units-manifest.js` holds `window.UNITS_MANIFEST`, keyed by unit ID, and a `window.UnitsManifest` helper API (`listUnits`, `getUnit`, `listChapters`, `getChapter`, `getAvailableChapters`, `getNextAvailableChapter`). All five Unit 6 chapters (`ch26`-`ch30`) are marked `available: true`.
