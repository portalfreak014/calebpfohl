# Competitor & Inspiration Tracker ⏳ Living Document

## Purpose

A centralized place to track other vocabulary/language study tools (Quizlet, Memrise, Anki, and similar), what they do well, what they do poorly, and which of their features are worth adapting for this Arabic study app. This is not a one-time analysis — it's meant to be updated as new tools, classmate-shared study sets, or feature ideas come up, the same way [classmate-feedback.md](backlog/classmate-feedback.md) is a living backlog rather than a finished spec.

This doc feeds the backlog and feature docs, but is not itself a feature spec: an entry here becoming "worth building" should graduate into its own file under `features/` (the same pattern the picture matching game followed — it started as a feedback item, then became [matching-game.md](features/matching-game.md)) or into [classmate-feedback.md](backlog/classmate-feedback.md) once scoped.

## Tracked tools

### Quizlet

**What it is:** The dominant mainstream flashcard/study-set platform, free tier + Quizlet Plus subscription. Huge library of user-shared study sets, including classmates' own class vocabulary sets (see "Specific sets to watch" below).

**Study modes (free tier):**
- **Flashcards** — digital flip cards.
- **Learn** — adaptive mode mixing multiple-choice, written, and flashcard question types; shows harder question types (written) more often as a term is mastered, easier types (multiple choice) for newer terms. Resets each session — does not persist a personalized schedule across days the way true spaced repetition does.
- **Write** — type the correct answer to a prompt.
- **Spell** — audio/definition is played, learner types or "spells" the answer.
- **Test** — auto-generated practice test mixing written, matching, multiple-choice, and true/false; adjustable question count and types.
- **Match** (game) — race-against-the-clock matching of terms to definitions; tracks and displays high scores.
- **Gravity** (game) — type the correct answer before a falling "word meteor" reaches the bottom; increasing speed over time.

**Strengths:**
- Very low friction to start studying — no setup, beginner-friendly UI.
- Huge pre-made set library; easy to find and reuse a classmate's or another student's set for the exact same textbook chapter (this is literally how the "Specific sets to watch" entry below was found).
- Five distinct modes cover recognition, recall, and production (typing) practice, not just one repetitive format.
- Built-in AI generation of study sets/questions (Plus tier).

**Weaknesses (worth avoiding or improving on):**
- True spaced repetition was discontinued in 2020; "Learn" mode approximates it per-session but does not track long-term retention the way Anki or Memrise do. This app's own **Known Vocabulary (Mark as Known)** two-attempt streak system (see [known-vocabulary.md](features/known-vocabulary.md)) is already a deliberate, durable alternative to this weakness — worth keeping as a differentiator, not abandoning in favor of copying Quizlet's session-based model.
- Free tier now has usage limits and ads; Plus is required for some features (AI generation, ad-free).
- Card customization is basic (text/image/audio only) compared to Anki.
- The Match game (closest analog to this app's new `match.html`) is fun for short-term drilling but, per third-party reviews, "barely helps long-term recall" on its own — consistent with why this app's matching game is explicitly scoped as a "foundation," not a replacement for the quiz engine's spaced, tracked repetition.

### Memrise

**What it is:** A gamified, mobile-first language-learning app (not primarily a flashcard tool like Quizlet) built around spaced repetition and native-speaker video content.

**Key features:**
- **Spaced repetition system (SRS)** — automatically schedules review timing per word based on difficulty and how long ago it was last seen; visualized per-word (e.g. a "flower" icon that grows as a word is mastered and wilts if not reviewed).
- **"Learn with Locals"** — short native-speaker video clips showing real usage of words/phrases, for listening and pronunciation practice, not just text-based recall.
- **Pronunciation training** — listen-and-repeat with a mic-recorded attempt and feedback.
- **Difficult words tracking** — automatically (or manually) flags words a learner keeps missing and increases their review frequency, conceptually similar to this app's known-word streak resetting on a miss.
- **Gamification** — streaks, points, leaderboards, timed review challenges.
- **Offline mode** — downloaded lessons/review available without a connection.

**Strengths:**
- Genuine spaced repetition with per-word scheduling, not just a session-based approximation.
- Native-speaker audio/video is something this app does not currently have at all (all current content is text-based Arabic/English pairs).
- The "difficult words" auto-escalation is conceptually close to, but more automatic than, the streak-reset behavior already built into [known-vocabulary.md](features/known-vocabulary.md).

**Weaknesses:**
- Built around Memrise's own pre-made courses; less oriented toward "upload your exact class vocabulary list" than Quizlet.
- Heavier gamification (leaderboards, streaks) can feel like a distraction for a learner who just wants to drill a specific chapter's vocabulary before a quiz.

### Anki (reference point, not a direct competitor for this use case)

**What it is:** A free (desktop/Android; paid iOS), highly customizable spaced-repetition flashcard tool, popular for long-term retention of large vocabularies (e.g. medical students, language learners doing serious long-haul study).

**Relevant takeaway:** Anki's algorithmic spaced repetition (FSRS/SM-2) is the "gold standard" reference for what a true long-term retention system looks like, against which this app's simpler two-attempt streak rule ([known-vocabulary.md](features/known-vocabulary.md)) is a deliberately lighter-weight compromise — good enough for exam-prep-style studying without Anki's steep setup/learning curve.

## Specific sets to watch

### "Unit 7 MSA" (Quizlet, user kikig164)

- **URL:** https://quizlet.com/user/kikig164/folders/unit-7-msa
- **What it is:** A Quizlet folder made by another student, covering the same Unit 7 (Modern Standard Arabic) vocabulary this app's `unit7.json` / Chapters 31–32 cover. Added 2026-08-24 as the first tracked "in the wild" comparison set.
- **Status:** Not yet analyzed in detail — Quizlet's folder page requires sign-in/JS rendering that could not be fetched directly in this session. Follow-up needed: either the user reviews it manually and reports back which terms/format it uses, or a signed-in screenshot/export is provided so it can be compared against this app's `ch31`/`ch32` question lists for coverage gaps or phrasing differences, the same way the printed vocabulary worksheets have been QC'd against `unit7.json` throughout this project (see [unit7-vocabulary.md](features/unit7-vocabulary.md)).
- **Why it matters:** A classmate independently building the same unit's vocabulary in Quizlet is a natural side-by-side check — if their set includes terms this app's `ch31`/`ch32` lists are missing, that is the same kind of gap the Chapter 31 QC pass already caught twice this session (see the 2026-08-24 changelog entries).

*(Add more sets here as they're found — classmates', other Arabic-textbook Quizlet sets, etc. Keep each entry to: URL, what it covers, status of comparison, and what was learned.)*

## Feature ideas worth considering (not yet scoped)

These are feature ideas drawn from the competitor research above, not yet promoted to a full feature doc or the classmate-feedback backlog. Do not implement any of these without first scoping them the way Known Vocabulary and the Matching Game were scoped.

- [ ] **A "Learn"-style adaptive mode** (Quizlet-style): mix multiple-choice, written, and flashcard question types in one session, shifting toward harder types as a word is mastered. Distinct from the existing `quiz.html` (always multiple-choice) and `match.html` (always matching) — this would be a third mode. Overlaps with the existing classmate-feedback request "Quizlet-style Learn mode (Joseph)" in [classmate-feedback.md](backlog/classmate-feedback.md) — should be scoped together, not duplicated.
- [ ] **Native-speaker audio clips** (Memrise-style "Learn with Locals"): would require sourcing or recording actual Arabic audio per vocabulary term, a content-production effort beyond anything currently in the Content Contract. Not started; would need its own feature doc covering audio file storage/hosting before implementation.
- [ ] **True per-word spaced-repetition scheduling** (Anki/Memrise-style): a heavier alternative to the existing two-attempt streak rule. Explicitly not recommended to replace [known-vocabulary.md](features/known-vocabulary.md)'s current design without a deliberate decision — the two-attempt rule was chosen specifically for simplicity over Anki-grade complexity.
- [ ] **A timed "Gravity"-style drill mode** (Quizlet-style): falling-word typing game against a timer. Conceptually close to the existing classmate-feedback request "Numbers speed game (Hannah)" — could potentially generalize to any vocabulary set, not just numbers.

## Rules

- This doc records *observations* about other tools, not commitments to build anything. An idea only becomes a real task once it is scoped into its own feature doc (data model, rules, testing checklist) or added to [classmate-feedback.md](backlog/classmate-feedback.md), the same discipline already required there.
- Do not copy another tool's UI or branding — only the underlying mechanic/idea, adapted to this app's Content Contract and Material Design 3 styling.
- Specific competitor sets (like the Quizlet "Unit 7 MSA" folder) should be compared for *content coverage* (are we missing vocabulary they have, or vice versa) using the same QC method already used for the printed textbook worksheets — not used as a template to copy formatting from.
- Keep entries factual and sourced where possible (this initial version was grounded in current web research on Quizlet/Memrise/Anki feature sets, not assumptions).

## Testing checklist

- [ ] The "Unit 7 MSA" Quizlet set has been reviewed (manually, or via a shared export/screenshot) and cross-checked against `ch31`/`ch32` in `unit7.json` for any vocabulary gaps in either direction.
- [ ] At least one feature idea from this doc has been either promoted to a scoped feature doc, added to the classmate-feedback backlog, or explicitly rejected with a documented reason.
