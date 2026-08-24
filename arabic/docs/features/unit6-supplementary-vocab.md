# Unit 6 Supplementary Vocabulary (Sticky-Note Set) ⏳ Planned

## Purpose

A supplementary vocabulary set for Unit 6, sourced from handwritten sticky notes and a whiteboard phrase, in addition to (not replacing) the existing Chapter 26–30 content in `unit6.json`. Intended to become its own selectable study set once transcribed and reviewed, rather than being merged into the existing chapters.

## Status

- Transcription is in progress and manual, not automated. Photos of the sticky notes and a whiteboard were provided; handwriting is being transcribed entry-by-entry rather than through OCR/screenscraping, since automated extraction was not reliable enough for accurate Arabic transcription.
- One confirmed entry so far, corrected by the user from the whiteboard photo:

```json
{
  "arabic": "ابتعد عن",
  "english": "stay away from; move away from",
  "type": "verb phrase",
  "source": "whiteboard",
  "needsReview": false
}
```

- The remaining sticky-note vocabulary (five sticky notes of individual words/phrases, largely exam-review vocabulary such as verbs and abstract nouns) has not yet been transcribed into a draft JSON file. Each entry will be drafted with an explicit `needsReview` flag so uncertain handwriting/translation can be corrected before anything is added to a content file or the live site.
- No new content file has been created yet. `unit6.json` has not been modified for this feature and must not be modified directly — this will be a separate supplementary file, consistent with the Content Contract's one-file-per-unit shape, or a clearly separated chapter/set within it, to be decided when the transcription is finalized.

## Rules

- Do not write draft or unreviewed vocabulary into `unit6.json` or any file already live on `main`.
- Every transcribed entry must be reviewed and corrected by the user before it is wired into the quiz engine or homepage.
- Source sticky-note/whiteboard vocabulary follows the same Content Contract shape as existing units once finalized — no special-cased engine logic for this set.

## Testing checklist

- [ ] All sticky-note and whiteboard vocabulary is transcribed into a draft JSON with `needsReview` flags.
- [ ] User has reviewed and corrected all draft entries.
- [ ] Finalized supplementary vocabulary is added as a new, clearly labeled study set without modifying existing Unit 6 chapters.
- [ ] The new set appears correctly in both quiz directions once wired in.
