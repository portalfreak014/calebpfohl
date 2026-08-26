# Content-first vocabulary migration

## Purpose

Move unit vocabulary from presentation-first word lists to durable, content-first lexical records. The immediate app can continue to use only the basics—`lemma`, `arabic`, and `transliteration`—while the data model preserves optional grammar, relation, audio, and source data for future quizzes, games, search, and study views.

This document records the agreed schema direction and the first saved templates.

## Core principles

- Keep the existing learner-facing field name `partOfSpeech`; do not replace it with `pos`.
- `arabic` is the exact form being taught or displayed in a vocabulary item.
- `lemma` is the dictionary headword. For verbs, use the third-person masculine singular past form as the lemma.
- Make advanced data optional and part-of-speech-specific. Do not add noun fields such as `gender` to particles merely to make objects look uniform.
- Use a nested `grammar` object for morphology and grammatical behavior.
- Keep controlled values consistent across the dataset.
- Use `null` for unavailable or not-applicable values when retaining a known field is useful; omit fields that have no semantic meaning for that word type.

## Shared lexical record

Every entry can use this shared foundation:

```json
{
  "id": "u6-001",
  "arabic": "يَكْتُبُ",
  "lemma": "كَتَبَ",
  "transliteration": "yaktubu",
  "lemmaTransliteration": "kataba",
  "glosses": ["he writes", "he is writing"],
  "partOfSpeech": "verb",
  "partOfSpeechArabic": "فعل",
  "chapter": 30,
  "unit": 6,
  "variety": "msa",
  "register": "standard",
  "frequency": null,
  "level": null,
  "audio": {
    "status": "pending",
    "src": null,
    "speaker": null,
    "dialect": "msa"
  },
  "examples": [],
  "synonyms": [],
  "antonyms": [],
  "relatedWords": [],
  "tags": ["core-vocabulary"],
  "grammar": {},
  "notes": [],
  "source": {
    "book": null,
    "page": null,
    "lesson": null
  },
  "createdAt": null,
  "updatedAt": null
}
```

## Verbs

Arabic classroom grammar commonly introduces three core verb forms: **فعل ماضٍ** (past), **فعل مضارع** (present/imperfect), and **فعل أمر** (imperative). Store these under `grammar.arabSchoolForms`, separate from a future full conjugation table.

For the displayed form `يَكْتُبُ`, the lemma is `كَتَبَ`; the three school forms are `كَتَبَ / يَكْتُبُ / اُكْتُبْ`.

```json
{
  "grammar": {
    "root": ["ك", "ت", "ب"],
    "verbForm": "I",
    "transitivity": "transitive",
    "voice": "active",
    "arabSchoolForms": {
      "past": {
        "arabic": "كَتَبَ",
        "transliteration": "kataba",
        "labelArabic": "فعل ماضٍ",
        "labelEnglish": "past",
        "person": "third",
        "gender": "masculine",
        "number": "singular"
      },
      "imperfect": {
        "arabic": "يَكْتُبُ",
        "transliteration": "yaktubu",
        "labelArabic": "فعل مضارع",
        "labelEnglish": "present / imperfect",
        "person": "third",
        "gender": "masculine",
        "number": "singular"
      },
      "imperative": {
        "arabic": "اُكْتُبْ",
        "transliteration": "uktub",
        "labelArabic": "فعل أمر",
        "labelEnglish": "imperative",
        "person": "second",
        "gender": "masculine",
        "number": "singular"
      }
    },
    "derivedForms": {
      "verbalNoun": {
        "arabic": "كِتَابَة",
        "transliteration": "kitābah",
        "glosses": ["writing"]
      },
      "activeParticiple": {
        "arabic": "كَاتِب",
        "transliteration": "kātib",
        "glosses": ["writer", "writing"]
      },
      "passiveParticiple": {
        "arabic": "مَكْتُوب",
        "transliteration": "maktūb",
        "glosses": ["written"]
      }
    },
    "verbClass": {
      "rootLength": 3,
      "weakType": "sound",
      "hasHamza": false,
      "isDoubled": false
    },
    "conjugation": {
      "past": {},
      "imperfectIndicative": {},
      "imperative": {}
    }
  }
}
```

`conjugation` can later hold all person/gender/number forms without a migration. Examples of stable keys are `1s`, `2ms`, `2fs`, `2mp`, `2fp`, `3ms`, and `3fs`.

## Nominals

Traditional Arabic groups nouns, adjectives, pronouns, demonstratives, relative pronouns, and many adverbs under **اسم**. Use learner-friendly `partOfSpeech` subtypes while retaining `partOfSpeechArabic` where useful.

### Nouns

Useful noun data includes gender, number, plural, plural type, dual, definiteness, and—when the project needs formal MSA or Classical Arabic—case forms.

```json
{
  "partOfSpeech": "noun",
  "partOfSpeechArabic": "اسم",
  "grammar": {
    "gender": "masculine",
    "number": "singular",
    "isProperNoun": false,
    "isCountable": true,
    "isHuman": false,
    "forms": {
      "indefiniteSingular": "كِتَاب",
      "definiteSingular": "الْكِتَاب",
      "dualNominative": "كِتَابَانِ",
      "dualOblique": "كِتَابَيْنِ",
      "plural": "كُتُب"
    },
    "pluralType": "broken",
    "feminineForm": null,
    "masculineForm": null,
    "caseForms": {
      "indefinite": {
        "nominative": "كِتَابٌ",
        "accusative": "كِتَابًا",
        "genitive": "كِتَابٍ"
      },
      "definite": {
        "nominative": "الْكِتَابُ",
        "accusative": "الْكِتَابَ",
        "genitive": "الْكِتَابِ"
      }
    }
  }
}
```

### Adjectives

Store agreement forms for gender and number. Add `comparativeSuperlative` where it exists.

```json
{
  "partOfSpeech": "adjective",
  "partOfSpeechArabic": "صفة",
  "grammar": {
    "baseGender": "masculine",
    "forms": {
      "masculineSingular": "كَبِير",
      "feminineSingular": "كَبِيرَة",
      "masculinePlural": "كِبَار",
      "femininePlural": "كَبِيرَات"
    },
    "comparativeSuperlative": {
      "arabic": "أَكْبَر",
      "transliteration": "akbar",
      "glosses": ["bigger", "biggest"]
    }
  }
}
```

### Pronouns

Pronoun records should identify type, person, gender, number, and related independent/attached forms.

```json
{
  "partOfSpeech": "pronoun",
  "partOfSpeechArabic": "ضمير",
  "grammar": {
    "pronounType": "independent_personal",
    "person": "second",
    "gender": "masculine",
    "number": "singular",
    "forms": {
      "independent": "أَنْتَ",
      "possessiveSuffix": "ـكَ",
      "objectSuffix": "ـكَ"
    }
  }
}
```

## Particles and other types

Particles generally do not carry noun-like inflection. Model grammatical behavior instead.

- `preposition`: `governsCase`, `canAttachPronounSuffix`, `attachedPronounForms`
- `conjunction`: `isClitic`, `attachesToFollowingWord`, `function`
- `negation_particle`: `scope`, `affectsVerbMood`
- `interrogative`: `questionType`
- `adverb`: `adverbType` such as `time`, `place`, `manner`, or `frequency`
- `numeral`: `numericValue`, `numeralType`, `genderBehavior`, `countedNounCase`
- `interjection`: `function` and `register`

Examples:

```json
{
  "partOfSpeech": "preposition",
  "partOfSpeechArabic": "حرف جر",
  "grammar": {
    "governsCase": "genitive",
    "canAttachPronounSuffix": true,
    "attachedPronounForms": {
      "3ms": "فِيهِ",
      "3fs": "فِيهَا",
      "1s": "فِيَّ"
    }
  }
}
```

```json
{
  "partOfSpeech": "conjunction",
  "partOfSpeechArabic": "حرف عطف",
  "grammar": {
    "isClitic": true,
    "attachesToFollowingWord": true,
    "function": "coordination"
  }
}
```

## Controlled vocabularies

Use these values consistently:

```json
{
  "partOfSpeech": [
    "verb",
    "noun",
    "adjective",
    "adverb",
    "pronoun",
    "demonstrative",
    "relative_pronoun",
    "interrogative",
    "preposition",
    "conjunction",
    "article",
    "negation_particle",
    "particle",
    "numeral",
    "interjection"
  ],
  "variety": [
    "msa",
    "classical",
    "egyptian",
    "levantine",
    "gulf",
    "maghrebi"
  ],
  "gender": ["masculine", "feminine", "common"],
  "number": ["singular", "dual", "plural"],
  "pluralType": [
    "sound_masculine",
    "sound_feminine",
    "broken",
    "collective",
    "indeclinable",
    "unknown"
  ],
  "verbForm": [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "quadriliteral"
  ]
}
```

## Saved templates

The templates directory contains valid JSON blank records for the major categories:

- `arabic/data/templates/vocabulary-entry.template.json`
- `arabic/data/templates/verb.template.json`
- `arabic/data/templates/noun.template.json`
- `arabic/data/templates/adjective.template.json`
- `arabic/data/templates/pronoun.template.json`
- `arabic/data/templates/particle.template.json`

Use the master template when beginning a record, then use the POS-specific template when the word's grammar warrants it. These templates deliberately use `null`, empty arrays, and empty objects so they can be safely copied and filled without suggesting grammatical data that has not been verified.

## Initial migration scope

1. Preserve current unit data and current app behavior.
2. Add `lemma` first, then normalize `partOfSpeech` values.
3. Add verb school forms for verbs as they are verified.
4. Add noun gender and plural data where relevant.
5. Add examples, audio, relations, and advanced morphology incrementally.
6. Only populate formal case and mood fields for content that needs MSA/Classical precision.

## Implementation status

### Completed

- The content-first schema, controlled vocabularies, and reusable JSON templates are documented and saved in `arabic/data/templates/`.
- `arabic/data/raw-vocabulary/README.md` defines raw Markdown glossaries as the human-readable recovery layer.
- Placeholder glossary files exist for Units 1–10 in `arabic/data/raw-vocabulary/`.
- Valid empty unit JSON shells exist for Units 1–5 and Units 8–10.
- Existing `unit6.json` and `unit7.json` were preserved without modification.
- `units-manifest.js` and application navigation were intentionally left unchanged, so empty unit files do not change current app behavior.

### Deferred intentionally

- Raw Unit 1–10 glossary files have not yet been populated with verified vocabulary.
- The existing Unit 6 and Unit 7 quiz-shaped JSON files have not yet been migrated to the content-first lexical schema.
- No existing unit is yet powered by the new rich lexical records.
- App integration for future populated unit JSON files remains pending. This requires reviewing and safely updating the existing unit manifest and relevant quiz/game consumers, then adding navigation controls in `arabic.html`.

### Content-validation backlog

- Review the Unit 7 Chapter 32 entry `احْتَجَّ / يَحْتَجُّ / احْتِجاج`: the source data shows “to protest” as choice `A` but marks `D` as the answer. This is logged for later validation; no source data was changed.
- Validate all existing answer keys and glossary meanings in a separate content-review pass. Do not silently correct source wording during raw-backup or schema-migration work.

### Next safe sequence

1. Populate each raw glossary from verified source material.
2. Validate answer keys and meanings separately.
3. Establish the canonical rich vocabulary data location and migrate one unit at a time.
4. Update the manifest and consumers only after populated data is ready.
5. Add unit-access controls in `arabic.html`.

This approach keeps vocabulary authoring lightweight now while ensuring the content can power morphology drills, matching games, adaptive review, filters, and future learning modes later.
