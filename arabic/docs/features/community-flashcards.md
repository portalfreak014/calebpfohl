# Community Flashcards

## Status

Implemented in `flashcards.html`. Signed-in learners can create and immediately publish simple Arabic/English flashcard sets. Public, published sets appear beneath the Unit 8 course-deck picker and run in the same flashcard player as built-in decks.

## Current behavior

- The UI lives in `arabic/flashcards.html`, beneath the Unit 8 chapter picker.
- The section title is **Community flashcards** and is separated from course decks with a subtle light-purple divider.
- Public sets are loaded from Firestore documents where `visibility == "public"` and `status == "published"`.
- Each set tile displays its title, creator name, and card count.
- Anyone can browse and study public community decks without signing in.
- A signed-in learner can use **Create a set** to open the inline form, provide a title and at least two Arabic/English card pairs, and publish the set immediately.
- Set owners see an owner-only **Delete** button. Deletion requires confirmation and permanently removes the Firestore document.
- Community sets use the shared overlay player, including card flip, Previous/Next navigation, shuffle, directional navigation animation, keyboard flipping, and reduced-motion support.
- Community decks do not show **Take quiz** because there is no matching quiz dataset.

## Validation

The page validates before publishing:

- A title is required and limited to 80 characters in the form.
- Every submitted card must contain both Arabic and English text.
- A set must contain at least two complete card pairs.
- Arabic text is preserved as Unicode and rendered with `lang="ar"` and right-to-left direction.

## Data model

Each set is one Firestore document in the `communityFlashcards` collection:

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

Independent documents prevent concurrent-write conflicts and allow ownership checks at the set level.

## Authorization and rules

UI visibility is not authorization. Firestore Security Rules must enforce these policies:

- Read access is limited to documents that are public and published.
- A signed-in user may create only a document whose `ownerId` equals `request.auth.uid`.
- A signed-in user may delete only a document they own.
- A signed-in user may update only a document they own once editing is added.
- Rules should validate document shape and practical field/card-count limits, and must prevent ownership-field takeover.

When Firestore operations fail, the page displays a concise error without blocking use of other decks. The creator form remains available so the learner can retry.

## Editing status

Community-deck editing is planned but not implemented. The current product supports creation, publishing, studying, and owner-only deletion. Do not document an Edit control as available until both the UI and Firestore-rule path are implemented.

## Future moderation

The `visibility` and `status` fields preserve a migration path to moderation. A future workflow could create sets as `private` / `pending`, then allow a trusted administrator or server-side process to publish them as `public` / `published`. Ordinary learners should not be able to change another author's ownership or moderation fields.

## Acceptance criteria

- Public/published Firestore sets render beneath Unit 8 course decks.
- Signed-out learners can browse and study community decks.
- Signed-in learners can immediately publish valid decks from the page.
- Only the owner sees and can use the Delete action.
- A selected community deck uses the shared flashcard player.
- Community decks do not expose a quiz deep link.
- Firestore rules, rather than hidden controls alone, enforce ownership and public-reading policy.
