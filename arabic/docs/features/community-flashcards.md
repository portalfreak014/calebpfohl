# Community Flashcards

## Status

Planned. Community Flashcards lets signed-in learners create and immediately publish simple Arabic/English flashcard sets from `flashcards.html`. Community sets use the existing flashcard player; they do not use Git-hosted JSON files.

## Product decision

- The UI lives directly on `arabic/flashcards.html`, beneath the existing Unit 8 chapter picker.
- The section title is **Community flashcards**.
- A very light purple divider subtly separates the Unit 8 and community sections.
- Public, published sets appear in the Community Flashcards list and open in the same card player as course sets.
- The creator button label is **Create a set**.
- A signed-in learner can create a set from the page with a short form: set title, Arabic/English card pairs, an Add card action, and a Publish set action.
- Initial publishing is immediate. A valid submitted set is saved as public and published without manual review.
- Learners must be able to study without an account. An account is required only to create, edit, or delete a community set.

## Data model

Store each set as one document in the Firestore `communityFlashcards` collection. Do not store all community content in one shared document or static JSON file: independent documents avoid concurrent-write conflicts and allow set-level ownership, editing, deletion, and moderation.

Suggested document shape:

```js
{
  title: "Unit 8 — Food",
  ownerId: "firebase-auth-uid",
  ownerName: "Display name",
  cards: [
    { arabic: "...", english: "..." }
  ],
  visibility: "public",
  status: "published",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

Required initial validation:

- Trim title and card fields before saving.
- Require a non-empty title.
- Require at least two complete Arabic/English card pairs.
- Reject incomplete cards instead of silently publishing them.
- Preserve Arabic text as Unicode and render it with `lang="ar"` and right-to-left direction in the player.

## Flashcard-page behavior

1. Load the existing Unit 8 chapter list from `data/unit8.json` unchanged.
2. Render a light divider and the Community Flashcards heading below that list.
3. Query Firestore for sets where `visibility == "public"` and `status == "published"`.
4. Render each result in the existing chapter-card visual language, showing its title, creator name, and card count.
5. Selecting a community set loads its `cards` array into the existing player. The player must not need a separate implementation for community content.
6. Show a concise empty state if no public community sets exist.
7. Provide a **Create a set** action in the community section. Signed-out users receive a clear instruction to log in; signed-in users can expand or open the inline creator form.
8. For set owners, provide simple edit and delete actions without exposing those actions to other users.

## Authorization and Firestore rules

Client-side UI checks are not security. Firestore Security Rules must enforce the policy:

- Anyone may read only documents with `visibility == "public"` and `status == "published"`.
- An authenticated user may create a document only when `ownerId` equals `request.auth.uid`.
- An authenticated user may update or delete only a document whose `ownerId` equals `request.auth.uid`.
- Validate the required data shape and cap title length, card count, and field lengths in rules where practical.
- Do not allow clients to change another user's ownership fields.

Keep Firestore failures non-blocking: show a clear error in the Community Flashcards section and retain any unsaved form entries in the page until the learner changes or dismisses them.

## Future moderation path

Immediate publishing is the initial policy, but the data model intentionally supports an owner-managed approval layer later. The relevant fields are `visibility` and `status`.

Possible future states:

| visibility | status | Meaning |
|---|---|---|
| `public` | `published` | Visible in the community list and studyable by everyone. |
| `private` | `draft` | Visible only to its owner while being written or revised. |
| `private` | `pending` | Submitted or created for owner review; not visible publicly. |
| `private` | `rejected` | Not public; retain only when a reviewer needs a record or feedback workflow. |

To introduce moderation later:

1. Change new learner-created sets to `private` / `pending` rather than publishing immediately.
2. Give the site owner an admin review view or a controlled Firestore workflow to inspect pending sets.
3. Approve by changing the set to `public` / `published`; reject by changing it to `private` / `rejected`.
4. Update Firestore rules so only an approved administrator identity or trusted server-side function can alter moderation fields on another author's set.

Until an admin role is implemented, ordinary users should not be able to create private/pending sets for review through the public UI. The site owner can create them manually in Firestore if needed.

## Acceptance criteria

- The flashcards page clearly separates Unit 8 and Community Flashcards with a subtle light-purple divider.
- Public/published Firestore sets render below the course sets.
- A selected community set runs in the existing flip-card player.
- Signed-in users can create and immediately publish valid sets without leaving `flashcards.html`.
- Signed-out users can still browse and study public community sets.
- Ownership and published-only reading are enforced by Firestore rules, not only hidden UI controls.
- The document fields support a future private/pending approval workflow without migrating existing published sets.
