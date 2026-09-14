# Vocabulary Schema Conventions

## Template versioning

Every vocabulary entry records the exact source template through two required top-level fields:

```json
{
  "templateType": "noun",
  "templateVersion": "1.0.0"
}
```

Use semantic versioning for each template independently:

- Increase the major version for a breaking structural change that requires migration.
- Increase the minor version for new optional fields or compatible additions.
- Increase the patch version for clarifications, documentation-only edits, or corrections that do not alter the expected entry shape.

When a template changes, update that template's `templateVersion` and only update a content file's `templateVersion` after the file has been reviewed or migrated. This makes outdated chapter content discoverable without pretending it has already been upgraded.

## Root-centered relationships

Arabic roots are the shared conceptual backbone of the vocabulary model. Every vocabulary template provides an optional `rootId` field. Populate it when a meaningful root has been verified; use `null` for particles, pronouns, borrowed terms, fixed expressions without a defensible primary lexical root, and unresolved cases. Never infer a root solely to fill the field.

A `rootId` is a stable, letter-based key that resolves to a shared record in `arabic/data/roots.json`. It should not encode an English gloss or semantic thread, because editorial explanations may improve over time while the relationship must remain stable.

```json
{
  "rootId": "q-t-ayn",
  "grammar": {
    "root": ["ق", "ط", "ع"]
  }
}
```

Use `grammar.root` when a template supports it to store Arabic root letters for display and linguistic data. `rootId` is the cross-content relationship key. A root record owns the shared semantic thread, form explanations, source metadata, and Freya Selberg attribution for material from Freya's Root Chart.

## Phrases

For a multiword expression, use one verified primary `rootId`: the root of the phrase's primary meaning-bearing word. This is a navigational and pedagogical connection, not a claim that the whole phrase has one literal root. Keep the full phrase in `arabic` and `lemma`; individual component entries may have their own root links when they are independently useful vocabulary.

Do not add a root ID to every inflected form. Dual and plural forms inherit the lemma's relationship to its root.

## Nominal forms

For nouns, `lemma` is the canonical dictionary form. Record grammatical number in `grammar.number` when useful. Use `grammar.forms.dual` for nominative and oblique dual spellings, and `grammar.forms.plurals` for zero or more documented plural alternatives.

```json
{
  "lemma": "مهمة",
  "rootId": "h-m-m",
  "grammar": {
    "gender": "feminine",
    "number": "singular",
    "forms": {
      "dual": {
        "nominative": "مهمتان",
        "oblique": "مهمتين"
      },
      "plurals": [
        {
          "arabic": "مهام",
          "type": "broken"
        },
        {
          "arabic": "مهمات",
          "type": "sound-feminine"
        }
      ]
    }
  }
}

Use `relatedWords` only for distinct vocabulary records that need a deliberate relationship, such as a derived noun, related adjective, counterpart, or a pedagogically paired expression. Each relation should refer to a stable `entryId`; do not use it to repeat ordinary inflected forms.

```json
{
  "relatedWords": [
    {
      "entryId": "unit7-ch31-importance-ahammiyya",
      "relation": "derived-noun"
    }
  ]
}
