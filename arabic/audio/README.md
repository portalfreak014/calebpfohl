# Audio Library

This directory stores original or properly licensed vocabulary pronunciation files for the Arabic study app.

## Structure

```text
audio/
  README.md
  unit6/
    ch26/
      unit6-ch26-001.mp3
      unit6-ch26-002.mp3
    ch27/
  unit7/
```

Use one file per vocabulary entry. The filename must match the entry's stable content `id`, so a JSON audio reference remains predictable:

```json
{
  "id": "unit6-ch26-017",
  "audio": {
    "src": "audio/unit6/ch26/unit6-ch26-017.mp3",
    "lang": "ar",
    "dialect": "msa",
    "speaker": "native-msa-v1"
  }
}
```

## Recording standard

- Use clear Modern Standard Arabic unless `dialect` says otherwise.
- Record only the Arabic headword or form, without English explanation or background music.
- Prefer mono MP3, 44.1 kHz, and a consistent loudness across a chapter.
- Keep a short lead-in/out and remove long silence, clipping, noise, and filler speech.
- For verbs, record the primary lemma by default; add separate form files only when the metadata references them.
- Store source/license information outside the public learner data when needed. Do not upload recordings without permission.

## Quality control

Before linking an audio file in content JSON, confirm the path resolves, the word is pronounced accurately, playback works on mobile, and the recording matches its stated dialect and speaker label.
