# TTT Listening and Transcription (`arabic/ttt.html`) — Planned

## Purpose

Replace the current two-PDF listening workflow with one interactive, chapter-based HTML practice page.

Currently, each chapter requires two separate PDFs to be opened side by side:
- An audio sheet containing numbered audio controls.
- A matching worksheet containing fill-in-the-blank or transcription prompts.

This is inconvenient because changing focus away from the audio PDF can interrupt playback, and matching each audio number to its worksheet prompt requires manual side-by-side navigation.

The TTT page will keep each prompt and its matching audio together in one place. It will support every course chapter that has TTT material.

## Scope

- New page: `arabic/ttt.html`.
- Dynamic unit and chapter selection.
- Per-chapter activities loaded from structured data rather than hard-coded into page markup.
- One audio control per activity.
- Prompt types:
  - Fill in the blank.
  - Full-sentence transcription.
- Typed response fields for learner answers.
- A compact expandable audio player with play/pause, progress scrubbing, elapsed/total time, and volume control.
- The page should use the existing Arabic Study visual language and shared navigation drawer.

## Activity Experience

Each activity displays:
1. Its original activity number.
2. A clear Arabic prompt, including blanks when relevant.
3. A play-audio button, styled consistently with the quiz page.
4. A compact audio player that opens only after the user selects the audio button.
5. A response field appropriate to the exercise:
   - Blank-sized inputs for fill-in-the-blank prompts.
   - A larger Arabic-capable text area for full transcription prompts.
6. Optional translation instruction when the original worksheet includes one.

Audio remains attached to its activity, so the learner never needs a separate tab, window, or PDF for playback.

## Content Model

TTT content should live separately from vocabulary and quiz data.

Suggested location:

```text
arabic/data/ttt/
  unit1/
    chapter01.json
  unit8/
    chapter36.json
```

Suggested chapter format:

```json
{
  "unitId": "unit8",
  "chapterId": "ch36",
  "title": "Chapter 36 TTT",
  "audioBasePath": "audio/unit8/ch36/",
  "activities": [
    {
      "number": 14,
      "type": "fill-blank",
      "audio": "14.mp3",
      "promptArabic": "يمكن أن ______ المرض إلى ______ ويصعب القضاء عليه و______.",
      "translationRequired": false,
      "answerFields": 3
    },
    {
      "number": 15,
      "type": "transcription",
      "audio": "15.mp3",
      "promptArabic": "",
      "instruction": "Listen and transcribe the complete sentence.",
      "translationRequired": true
    }
  ]
}
```

The exact schema can expand later for answer keys, hints, reference translations, or instructor feedback. The first version should prioritize faithful prompts and reliable playback.

## Audio Rules

- Use native HTML `<audio>` elements for dependable browser playback.
- Only one activity audio clip may play at a time; starting a new clip pauses the previous one.
- Opening the mini-player must not start playback automatically.
- The mini-player must provide:
  - Play/pause.
  - Seek bar.
  - Current time and total duration.
  - Volume control.
- Audio file paths must remain relative to the repository so the static GitHub-hosted site can load them.

## Answer Storage

Learner drafts should persist locally so that navigating between activities or refreshing the page does not erase work.

```js
localStorage["arabicStudy.ttt.v1.unit8.ch36"] = {
  "14": ["answer one", "answer two", "answer three"],
  "15": "full transcribed sentence"
}
```

TTT storage must remain separate from quiz progress, match-game state, Firebase authentication, and documentation-editor storage.

## Navigation

- Add `TTT` to the hamburger drawer on every relevant page.
- Add a link from each available unit/chapter area to the matching TTT chapter when content exists.
- The TTT page should restore the learner’s last selected unit and chapter on return.

## Content Migration

For each chapter:
1. Collect the audio PDF and the matching worksheet PDF.
2. Match every audio number to its corresponding prompt.
3. Identify whether each activity is fill-in-the-blank or full transcription.
4. Export or source the individual audio files.
5. Create the chapter JSON file.
6. Verify audio numbering, prompt text, blank count, Arabic direction, and worksheet order.

No content should be published until the audio and worksheet have been checked against each other.

## Testing Checklist

- [ ] Unit and chapter selectors show only available TTT content.
- [ ] Every activity number matches the source materials.
- [ ] Each play button opens its own compact player.
- [ ] Play/pause, scrubbing, timing, and volume work on desktop and mobile.
- [ ] Starting one clip pauses any other currently playing clip.
- [ ] Fill-in-the-blank prompts show the correct number of answer fields.
- [ ] Transcription prompts provide a full Arabic-capable response area.
- [ ] Typed answers persist after reload.
- [ ] Answers from one chapter never appear in another chapter.
- [ ] The menu drawer, Home, Glossary, Flashcards, Match, Root Chart, Progress, and authentication behave consistently.
- [ ] Test with the first migrated chapter before migrating the complete course.
