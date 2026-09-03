# UAD Companion Marketing Strategy and Product Roadmap

**Status:** Working strategy document  
**Last updated:** 2026-09-03  
**Scope:** Product positioning, naming, launch readiness, roadmap, and measurement for the Arabic study application in `arabic/`.

---

## 1. Executive summary

The Arabic application is an actively maintained, data-driven study tool with vocabulary review, quizzes, matching practice, and local progress persistence. Its immediate strength is not generic Arabic instruction; it is fast, repeatable practice organized around a learner's current course unit.

The product should be packaged and presented as an **independent study companion for UAD Arabic students**. The near-term priority is making the product's purpose, audience, available content, and first action obvious. New features should support activation and repeat use rather than expanding breadth before the existing experience is clearly understood.

### Recommended product name

**UAD Companion**

### Recommended descriptor

**An independent Arabic study companion**

### Recommended positioning statement

> UAD Companion helps Arabic students turn their current unit into quick, repeatable practice through vocabulary review, quizzes, matching, and progress tracking.

### Recommended short tagline

> Review faster. Recall more. Stay on track.

---

## 2. Current product assessment

### Existing strengths

- The application contains distinct study modes: vocabulary-oriented study, quizzes, and matching games.
- Progress is stored locally through `progress-store.js`, supporting continuity between sessions.
- Study content is modular and data-driven, with unit files, glossary data, quiz data, matching sets, vocabulary data, and templates.
- Glossary architecture and migration workflows are documented, making content maintenance more repeatable.
- The repository is actively maintained; recent work includes content, glossary, migration, and documentation updates.
- A dedicated GA4 property exists for the Arabic product and should become the source of truth for adoption and engagement decisions.

### Current maturity

This is beyond a prototype: it has functional learning loops and an emerging content system. However, it currently presents more like a capable personal or cohort utility than a packaged product.

The next maturity step is **product clarity**:

1. Make the audience explicit.
2. Make the user benefit explicit.
3. Give a new user one obvious first action.
4. Be transparent about content coverage.
5. Instrument the key study funnel before prioritizing broad feature work.

### Content-coverage risk

The data structure includes Units 1 through 10, while substantial content is currently concentrated in Units 6 and 7 and several other unit files are placeholders. The UI and marketing must not imply fully populated course-wide coverage until it exists.

**Recommended user-facing wording:**

> Available now: study materials for Units 6–7. Additional units are in development.

Adjust this statement whenever coverage changes.

---

## 3. Audience and positioning

### Primary audience

Students currently enrolled in UAD Arabic instruction who need quick, focused review tied to their present unit.

### Secondary audience

Arabic learners outside UAD, but only after the product has either:

- Broader MSA content independent of school-specific course structure, or
- A reusable framework allowing other programs to load their own unit-aligned content.

### User problem

Intensive language students commonly face scattered study material, repetitive manual review, and limited visibility into what they need to practice next. Generic language applications are often not aligned with the vocabulary or unit currently being taught.

### Value proposition

UAD Companion reduces study setup and helps learners spend short windows of time practicing the material most relevant to their current unit.

### Product category

Curriculum-aligned study companion.

### Differentiation

- Aligned to the learner's current unit rather than generic Arabic content.
- Multiple short-form recall modes in one place.
- Progress persistence supports repeated use.
- Built around the real workflow of students in intensive instruction.

### Positioning guardrail

Do not position the product as an official replacement for instruction, course materials, or assessment. It is a supplement for independent practice.

---

## 4. Brand and naming decision

### Decision

Use **UAD Companion** for the initial UAD-focused release.

### Why it works

| Criterion | Assessment |
| --- | --- |
| Audience relevance | Strong. UAD students immediately understand why it may be relevant to them. |
| Memorability | Stronger than a generic Arabic-study title. |
| Category signal | "Companion" communicates supportive practice, not a replacement curriculum. |
| External discoverability | Limited. "UAD" will have little meaning to general Arabic learners. |
| Expansion flexibility | Limited as a standalone universal brand; manageable with a parent-brand structure. |
| Institutional ambiguity | Requires clear independent/unofficial language. |

### Brand architecture options

**Near-term recommendation**

- Product name: **UAD Companion**
- Descriptor: **An independent Arabic study companion**
- Homepage title: **UAD Companion — Arabic practice for your current unit**
- Tagline: **Review faster. Recall more. Stay on track.**

**Expansion-ready option**

If the project may later serve broader Arabic learners or additional programs, use a parent identity and treat UAD Companion as the first edition:

- Parent brand: **Arabic Study Companion**
- UAD-specific experience: **UAD Companion**

This permits future products such as MSA Companion, DLPT Companion, or course-specific companion experiences without a disruptive rebrand.

### Naming and affiliation safeguards

Use an unambiguous disclaimer in the application footer, About page, and any public landing page:

> UAD Companion is an independent, student-built study tool. It is not affiliated with, endorsed by, or an official product of DLI, UAD, the U.S. Army, or the Department of Defense.

Avoid:

- Official seals, insignia, logos, or design elements that imply institutional endorsement.
- Claims that the application is "the UAD app" or represents course leadership.
- Publishing restricted, sensitive, copyrighted, or non-public course material without authorization.

Before public launch, verify applicable school/unit guidance concerning use of course names and curriculum-derived content.

---

## 5. Website messaging and conversion plan

### Homepage goal

A first-time visitor should be able to answer four questions in the first screen:

1. What is this?
2. Who is it for?
3. Why is it useful?
4. What do I do first?

### Recommended hero copy

**Heading**

> Arabic practice built around your UAD coursework.

**Supporting text**

> Review unit vocabulary, test yourself with focused quizzes, build speed with matching rounds, and keep your study progress in one place.

**Primary CTA**

> Start studying

**Secondary CTA**

> See how it works

### Recommended onboarding flow

1. Select the current unit.
2. Select a study mode: vocabulary review, quiz, or matching.
3. Complete a short session.
4. Receive progress feedback and a recommendation for what to do next.

### Translate features into outcomes

| Feature | User-facing benefit |
| --- | --- |
| Progress tracking | Pick up where you left off. |
| Quizzes | Find weak vocabulary before the next assessment. |
| Matching practice | Build faster recognition through short review rounds. |
| Unit-based data | Practice the material from the unit you are studying now. |
| Data-driven content | Receive consistent study activities as new unit content is added. |

### Recommended information architecture

- **Home:** Clear value proposition, current coverage, CTA, benefits, trust statement.
- **Study:** Unit selection and the recommended next activity.
- **Glossary:** Browse book-derived vocabulary by unit and chapter, with Arabic and English displayed exactly as recorded in the source glossary; link into matching chapter quizzes when available.
- **Progress:** Completed work, weak areas, recent activity, next suggested step.
- **How it works:** Short user guide with a 2–3 minute first-session walkthrough.
- **Coverage:** Units and study modes available now; planned content marked clearly as planned.
- **Feedback:** Short form for errors, missing terms, requested units, and feature requests.
- **About / disclaimer:** Independent-product status, privacy summary, and content policy.

### Documentation split

Maintain two clear documentation tracks:

| Documentation type | Audience | Purpose |
| --- | --- | --- |
| User guide | Learners | What the tool does, how to start, coverage, privacy, and feedback |
| Contributor/content guide | Maintainers and contributors | Data schema, glossary workflow, importing content, QA, and release process |

Developer and content-operation documentation should remain detailed. User-facing documentation should focus on outcomes and the next action, not internal implementation.

---

## 6. Product roadmap

### Phase 1 — Product clarity and launch readiness

**Priority:** Highest  
**Target outcome:** A new UAD student immediately understands the tool and completes a first study session.

- Adopt UAD Companion across user-facing surfaces.
- Add the homepage hero, supporting proposition, and primary CTA.
- Build a Start Here / first-session onboarding path.
- Publish truthful, visible content coverage status.
- Add a read-only glossary-viewing experience so learners can browse available unit and chapter vocabulary outside quiz mode.
- Add an About page or footer with independence, affiliation, privacy, and content-use statements.
- Validate the entire experience on mobile before considering a release complete.
- Add a direct feedback route.

**Definition of done:** A new user can select a unit and finish an activity without needing documentation or explanation from the builder.

### Phase 2 — Activation and retention

**Priority:** High  
**Target outcome:** Users return because the next best review task is easy to find.

- Add Continue Last Session.
- Recommend a next activity based on unit selection, recent activity, or missed terms.
- Surface weak terms after missed quiz or matching answers.
- Add simple progress by unit.
- Add a lightweight daily session target: for example, 10 minutes, 20 terms, or one quiz.
- Add a simple session history or study streak only if it motivates rather than distracts.

**Definition of done:** A returning user has a clear, useful recommendation in one click.

### Phase 3 — Content scale and quality

**Priority:** High  
**Target outcome:** New material can be added reliably without eroding content accuracy or user trust.

- Complete one unit end to end before expanding thinly across many units.
- Prioritize coverage based on actual student demand and current instructional timing.
- Establish a content QA checklist: Arabic spelling, diacritics policy, transliteration policy, English gloss accuracy, duplicate detection, source/permission review, and review date.
- Build glossary pages from the authoritative files in `arabic/data/glossary/`, organized by unit and chapter.
- Preserve the book-derived Arabic and English transcription exactly in the public glossary view; keep any future corrections, notes, or enhanced lexical metadata separate from the source display.
- Link glossary chapters to the corresponding quiz or matching activity only when that activity is available.
- Improve repeatable import and validation tooling for unit, glossary, quiz, and matching data.
- Display a content version or last-reviewed date where it helps users identify current material.

**Definition of done:** A new unit can be created, checked, and published using a documented workflow with minimal manual rework.

### Phase 4 — Pilot and growth

**Priority:** Medium  
**Target outcome:** Validate whether UAD students return and recommend the tool.

- Recruit a small cohort of UAD student testers.
- Observe first use: can each user find their unit, understand a study mode, and complete a task?
- Ask three post-session questions: What was confusing? What did you expect? Would you use this again tomorrow?
- Promote peer-to-peer first through class channels, a QR card, a short demo, or direct referrals.
- Publish a simple product changelog with content additions, fixes, and feature changes.
- Delay broad public promotion until onboarding, coverage messaging, and first-use engagement are reliable.

**Definition of done:** Pilot users demonstrate repeat use, provide actionable feedback, and request additional content or capabilities.

### Phase 5 — Optional expansion

**Priority:** Later  
**Target outcome:** Serve learners beyond the initial UAD context without diluting the original product.

- Separate generic MSA content from UAD-specific content.
- Decide whether the product becomes a public Arabic learning tool or a configurable course-companion framework.
- Use the parent-brand model if multiple programs, dialect tracks, or exam-preparation experiences are introduced.

---

## 7. Measurement plan

### Analytics objective

Use GA4 to understand whether visitors activate, complete meaningful study activity, return, and identify which units/modes generate demand. Do not optimize on pageviews alone.

### Core funnel

`Visit → select unit → start study mode → complete activity → return`

### Recommended events

| Event | Purpose |
| --- | --- |
| `view_home` | Measure reach to the product entry point. |
| `select_unit` | Measure intent and identify demand by unit. |
| `start_vocab_review` | Measure vocabulary-study activation. |
| `start_quiz` | Measure quiz adoption. |
| `complete_quiz` | Measure meaningful quiz engagement. |
| `start_match` | Measure matching-game adoption. |
| `complete_match` | Measure meaningful matching engagement. |
| `return_session` | Measure returning study behavior. |
| `feedback_submit` | Measure feedback volume and product-learning opportunity. |

### Useful event parameters

Attach parameters where feasible:

- `unit_id`
- `unit_name`
- `study_mode`
- `session_length_seconds`
- `question_count` or `term_count`
- `score_percent` where appropriate
- `completion_status`
- `content_version`

Do not send personally identifiable information, sensitive course information, or unnecessary learner data to analytics.

### Initial success criteria

Treat these as starting hypotheses and revise after sufficient traffic accumulates:

| Metric | Initial benchmark |
| --- | --- |
| Activation | At least 50% of new visitors select a unit or start a study mode. |
| Meaningful engagement | At least 35% of activated users complete one study activity. |
| Retention | Track 7-day return rate after enough new-user volume exists. |
| Content signal | Requests for new units and repeat activity in existing units. |
| Product-market signal | Users return without prompts and recommend the tool to peers. |

### Reporting cadence

- Review activation and completion weekly during pilot.
- Review retention and unit demand monthly.
- Use qualitative feedback with the metrics; a low completion rate may indicate a confusing flow, missing content, or an overly long activity.

---

## 8. Backlog priorities

### P0 — Before wider distribution

- [ ] Approve and implement product naming.
- [ ] Add a clear landing-page hero and primary CTA.
- [ ] Add a Start Here flow.
- [ ] Publish current content coverage status.
- [ ] Add independent/unofficial disclaimer and content-use safeguards.
- [ ] Confirm mobile usability.
- [ ] Confirm GA4 is receiving the core funnel events.
- [ ] Add user feedback collection.

### P1 — Improve repeat use

- [ ] Continue Last Session.
- [ ] Suggested next activity.
- [ ] Weak-term review loop.
- [ ] Progress by unit.
- [ ] Lightweight session goal.
- [ ] User-facing guide and coverage page.
- [ ] Glossary pages with unit/chapter browsing and links to available study activities.

### P2 — Scale content responsibly

- [ ] Unit content QA checklist.
- [ ] Repeatable import and validation process.
- [ ] Content versioning / last-reviewed visibility.
- [ ] Demand-based unit expansion.
- [ ] Pilot tester workflow and feedback synthesis.

### P3 — Consider after validation

- [ ] General-audience MSA content.
- [ ] Parent-brand architecture.
- [ ] Configurable course-companion framework.
- [ ] Broader public marketing.

---

## 9. Launch checklist

### Product clarity

- [ ] Product name is visible and consistent.
- [ ] The homepage states who the tool is for and why it is useful.
- [ ] A first-time user has one primary CTA.
- [ ] Current content coverage is accurate and visible.
- [ ] A user can begin studying in two or fewer decisions.

### Trust and compliance

- [ ] Independent/unofficial disclaimer is present.
- [ ] No official marks or language imply endorsement.
- [ ] Content sources and permission considerations have been reviewed.
- [ ] Analytics excludes unnecessary personal and sensitive data.
- [ ] Privacy information is available in plain language.

### Experience and measurement

- [ ] Mobile experience tested.
- [ ] Quiz and matching flows tested from a new-user state.
- [ ] Progress behavior tested across refreshes and return sessions.
- [ ] Core GA4 events verified.
- [ ] Feedback submission path verified.
- [ ] Glossary pages tested on mobile, including unit/chapter navigation and links to available study activities.

---

## 10. Decision record

**Recommended decision:** Launch the UAD-focused version as **UAD Companion**, presented as an independent Arabic study companion.

**Rationale:** The name makes the product immediately relevant to the first and most reachable audience, while "Companion" accurately frames it as a supplemental practice tool. Clear independence language protects against confusion about official affiliation.

**Primary next step:** Implement the P0 clarity items before expanding feature breadth or broadly promoting the product.
