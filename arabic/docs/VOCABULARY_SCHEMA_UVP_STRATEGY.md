# Vocabulary Schema UVP Strategy

**Status:** Product and positioning strategy  
**Last updated:** 2026-08-31  
**Scope:** How the Arabic vocabulary schema creates differentiated learner value for UAD Companion.

---

## Bottom line

The structured vocabulary schema is a strong product advantage, but it is not itself the user-facing UVP. The schema is the engine; the UVP is the learning outcome it enables.

> UAD Companion helps students learn Arabic vocabulary as connected word families—through roots, forms, meanings, and targeted practice—rather than isolated translation pairs.

**External benefit statement:**

> Learn the system behind the word.

---

## Schema, features, and UVP

| Layer | Meaning |
| --- | --- |
| Schema | The implementation advantage: structured records for roots, forms, part of speech, semantic scope, synonyms, verb forms, verbal nouns, plurals, and related words. |
| Feature set | What the schema generates: root-family review, form recognition, conjugation prompts, semantic-disambiguation quizzes, and weak-area drills. |
| UVP | Learner result: vocabulary becomes an interconnected system that supports recognition, recall, and use—not a list of translations. |

Students do not choose a study tool because it has dense metadata. They choose it because it helps them study faster, remember more, and understand unfamiliar words.

---

## Why this is differentiated

A typical flashcard record provides a word and a translation. A morphology-aware Arabic lexical record can connect one item to its root, Arabic pattern or form, past/present/verbal-noun forms, related derivations, contextual senses, and common confusions.

This enables a content-to-activity engine: author and verify one high-quality lexical record, then reuse it across multiple study modes without manually authoring every activity.

| Learning goal | Example activity |
| --- | --- |
| Direct recall | What does the word mean? |
| Root recognition | Which word shares this root? |
| Morphology | Identify the root or form/pattern. |
| Paradigm recall | Supply the present-tense form or verbal noun. |
| Derivation | Identify a related noun, adjective, or verb. |
| Semantic discrimination | Select the correct meaning in context. |
| Targeted review | Revisit missed forms, roots, or terms. |
| Interleaving | Mix study by root, form, part of speech, topic, or difficulty. |

---

## Recommended positioning

### Primary UVP

> UAD Companion turns unit vocabulary into connected Arabic practice—roots, forms, word families, meanings, and targeted review—not just flashcards.

### Short alternatives

> Learn Arabic vocabulary as a system, not a list.

> Go beyond translation: learn the roots, forms, and patterns that make Arabic vocabulary stick.

> Learn the system behind the word.

### Homepage copy

**Heading**

> Learn the system behind your Arabic vocabulary.

**Supporting text**

> UAD Companion connects each word to its root, pattern, forms, related words, and meaning—then turns that structure into quick practice tailored to what you need to review.

**Call to action**

> Study a word family

### UAD-specific framing

> UAD Companion helps Arabic students turn their current unit into quick, repeatable practice through vocabulary review, quizzes, matching, and progress tracking.

---

## Product proof requirements

The positioning is credible only when the product demonstrates three things.

### 1. Accurate, consistent data

Roots, forms, verbal nouns, parts of speech, related derivations, and glosses must be verified and consistently available when the interface promises them.

### 2. Data that changes study behavior

Do not only show metadata in a word-detail view. Use it to generate practice and recommendations. For example:

- A missed verb can surface its past, present, and verbal-noun forms.
- A known root can launch a root-family round.
- A learner struggling with a form can receive a focused form-recognition drill.
- Distinct senses can produce context-selection questions.

### 3. Preserved semantic nuance

Keep contextual meanings distinct instead of reducing a vocabulary item to one broad English translation. This supports stronger context and disambiguation practice.

---

## Example learner experience

For a word such as `كَتَبَ`, the app can show:

- Meaning and a short contextual example
- Root: `ك-ت-ب`
- Form: I
- Past: `كَتَبَ`
- Present: `يَكْتُبُ`
- Verbal noun: `كِتَابَة`
- Related items: `كِتَاب`, `مَكْتَب`, `مَكْتَبَة`, `مَكْتُوب`
- A **Practice this family** action

That action can generate a short round that mixes direct recall, root recognition, form identification, and context selection. The learner experiences the value rather than being asked to care about the schema itself.

---

## Schema principles

### Core rule

> Every metadata field must either improve recall, improve recognition, improve production, improve disambiguation, or enable a distinct practice activity. Otherwise, it is not priority data.

This prevents metadata collection from becoming a substitute for learning design.

### Field priorities

| Priority | Fields | Purpose |
| --- | --- | --- |
| P0 | Lemma, Arabic script, vocalization policy, English glosses, part of speech, unit/chapter, example/context | Baseline useful study and accurate meaning. |
| P0 | Root, root confidence, root-family links | Enables the central morphology and word-family value. |
| P0 | Verb past, present, verbal noun, form number, transitivity | Enables common verb-form learning and morphology drills. |
| P0 | Noun/adjective singular, plural, gender, common derived forms | Supports productive vocabulary knowledge. |
| P1 | Synonyms, antonyms, semantic labels, collocations | Enables semantic nuance and contextual exercises. |
| P1 | Difficulty, frequency/usefulness, common confusions, learner error tags | Enables prioritization and adaptive review. |
| P1 | Example sentences, translations, source/permission status | Enables contextualized meaning checks and responsible publishing. |
| P2 | Register, dialect counterparts, formality, audio variants | Valuable but costlier to maintain accurately. |
| P2 | Detailed etymology and exhaustive derivation trees | Lower priority unless they enable a specific high-value activity. |

### Recommended metadata controls

Add these fields or equivalents early:

- `confidence` or `review_status` by metadata cluster, such as root verified, form verified, and gloss verified.
- `instructional_use` or `enabled_modes`, so every field is tied to a deliberate learning activity rather than displayed merely because it exists.

---

## Learning-design guardrails

Roots and patterns are valuable, but do not market them as making Arabic easy by themselves. Arabic includes weak, hollow, and geminate verbs; borrowed terms; idioms; irregularities; and context-dependent senses.

Use a word-first and context-first design. Introduce morphological information when it gives the learner a practical memory or recognition advantage. The product should combine morphological insight with high-frequency vocabulary, contextual examples, listening, and productive use.

---

## Recommended build sequence

1. Build a single-word detail experience that turns one lexical record into several study actions.
2. Add **Practice this family** for high-confidence root-linked vocabulary.
3. Generate root, form, and context drills from verified fields.
4. Track missed terms and morphology categories, then surface targeted follow-up review.
5. Make content completeness and data confidence visible to maintainers before exposing a mode to learners.
6. Market learner outcomes on the homepage; describe the technical schema on a secondary **Built for Arabic** or **How it works** page.

---

## Strategic conclusion

The morphology-aware Arabic lexical schema can be the project’s central moat because it supports differentiated practice, adaptive review, and scalable content creation. Its depth becomes marketable only when it visibly produces better study actions and faster learner insight.

**Externally:** Learn the system behind the word.

**Internally:** Build and maintain a morphology-aware Arabic lexical learning graph.
