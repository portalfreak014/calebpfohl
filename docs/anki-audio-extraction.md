# Anki Audio Extraction and Quiz Integration

This guide explains how to extract vocabulary audio from an Anki package (`.apkg`) and make it available to the Arabic quiz data.

## What an Anki package contains

An `.apkg` file is a ZIP archive. When extracted, it normally contains:

- `collection.anki2`: Anki's card database.
- `media`: A JSON filename map.
- Numeric files such as `0`, `1`, and `2`: the actual media files.

The numeric filenames are Anki's internal media IDs. The `media` JSON maps each ID back to the original filename.

## Extract the package

Work on a copy of the package so the original stays untouched.

```bash
cp vocab.apkg vocab.zip
unzip vocab.zip -d anki-extract
```

After extraction, confirm that `anki-extract/media` exists and that the folder contains numbered media files.

## Restore the original filenames

Create a file named `restore_media.py` beside the `anki-extract` directory:

```python
import json
from pathlib import Path
import shutil

root = Path("anki-extract")
media_map = json.loads((root / "media").read_text())

output = root / "audio"
output.mkdir(exist_ok=True)

for media_id, filename in media_map.items():
    source = root / media_id
    if source.exists():
        shutil.copy2(source, output / filename)

print(f"Restored audio to: {output}")
```

Run it with:

```bash
python restore_media.py
```

The restored files will be in `anki-extract/audio/`, using their original filenames.

## Recommended repository layout

Keep audio assets separate from JSON data and organize them by dataset. This prevents filename collisions and makes links predictable.

```text
arabic/
  audio/
    units/
      unit-01/
      unit-02/
    chapters/
      chapter-01/
      chapter-02/
  data/
    units/
    chapters/
```

If the project already has a data or public-assets convention, follow that convention instead of moving files unnecessarily.

## Legacy unit JSON

For the original format where all chapters are stored in one unit JSON file, include the precise path in every vocabulary object.

```json
{
  "id": "unit-01-ch01-001",
  "arabic": "كتاب",
  "english": "book",
  "audio": "/arabic/audio/units/unit-01/kitab.mp3"
}
```

Use a stable `id` even if the JSON format does not currently require one. It lets quiz logic, progress tracking, and future edits identify a word without depending on its spelling or filename.

## Chapter-based vocabulary JSON

For the newer, schema-dense vocabulary data, keep each chapter's audio inside that chapter's directory and store the explicit audio path on the relevant entry.

```json
{
  "id": "ch01-001",
  "chapter": 1,
  "arabic": "كتاب",
  "english": "book",
  "audio": "/arabic/audio/chapters/chapter-01/kitab.mp3"
}
```

If the schema already uses a nested audio object, use the same path as its source value rather than creating a competing field.

```json
{
  "id": "ch01-001",
  "audio": {
    "source": "/arabic/audio/chapters/chapter-01/kitab.mp3"
  }
}
```

## Front-end playback

Use the JSON `audio` value directly instead of generating a filename from the Arabic or English text. Generated filenames break when Anki names use punctuation, alternate transliterations, duplicate words, or inconsistent capitalization.

```javascript
const audio = new Audio(vocabItem.audio);
audio.play();
```

Handle missing audio safely:

```javascript
function playVocabAudio(vocabItem) {
  if (!vocabItem.audio) return;

  const audio = new Audio(vocabItem.audio);
  audio.play().catch((error) => {
    console.warn("Audio could not be played:", vocabItem.id, error);
  });
}
```

## Before committing audio

- Confirm each JSON path opens successfully in the deployed site.
- Keep the original extension such as `.mp3`, `.wav`, or `.ogg`.
- Use lowercase, hyphenated filenames for any renamed files.
- Do not overwrite a different word's audio because the filenames match.
- Test a sample word from every legacy unit and every chapter-based dataset.
- Check the repository's file-size limits before adding a large audio collection. Consider Git LFS or external static hosting if the package is too large for normal Git storage.

## Quick verification

From the repository root, list the extracted audio files:

```bash
find arabic/audio -type f
```

Then search for audio references in the JSON:

```bash
grep -R '"audio"' arabic --include='*.json'
```

The goal is one reliable, explicit audio path per playable vocabulary entry.
