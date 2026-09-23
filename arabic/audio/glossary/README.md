# Glossary audio files

This directory is reserved for future pronunciation audio used by the Arabic glossary. The glossary page does not yet load or play these files.

## Directory layout

Store recordings by unit:

```text
audio/glossary/
  unit-1/
  unit-2/
  ...
  unit-10/
```

Each file should contain one word or short phrase. Use lowercase Latin-transliteration filenames with hyphens, for example:

```text
audio/glossary/unit-2/marhaban.mp3
audio/glossary/unit-2/al-kitab.mp3
```

## File requirements

- Preferred format: MP3.
- Keep each clip short and trim leading/trailing silence.
- Use one consistent speaker and recording level when possible.
- Do not use Arabic characters, spaces, punctuation, or changing numeric IDs in filenames.
- Keep filenames stable once they are referenced by glossary data.

## Planned glossary integration

Future glossary entries will optionally reference an audio path. Entries with no path will show no audio control, so recordings can be added gradually without broken buttons.

Example planned reference:

```text
audio/glossary/unit-2/marhaban.mp3
```

When the interface is implemented, it will use this relative path to render a pronunciation play button for the corresponding entry.
