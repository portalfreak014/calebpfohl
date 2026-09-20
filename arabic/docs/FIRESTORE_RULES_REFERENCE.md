# Arabic Study — Firestore Rules Reference

Use this document as the canonical Firestore Security Rules reference for the Arabic Study app. It is intentionally separate from feature notes, like `HAMBURGER_MENU_TEMPLATE.md`, so future Firestore-backed features have one stable place to start.

## Purpose

The Arabic Study app is a static Netlify site that uses Firebase browser SDKs. The Firebase web configuration is public client configuration, not a server credential. Firestore Security Rules are the authorization boundary: they determine which browser requests may read, create, update, or delete data.

Never use test-mode rules in production. Never add an Admin SDK service-account JSON, private key, or privileged token to this repository or browser code.

## Current collections

| Collection/path | Purpose | Access model |
|---|---|---|
| `users/{uid}/progress/current` | Synced learner progress | Only the authenticated owner may read or write. |
| `communityFlashcards/{setId}` | Student-created Arabic/English flashcard sets | Anyone can read public/published sets; only the authenticated author can create, update, or delete their own set. |

## Initial ruleset

Paste this complete ruleset into **Firebase Console → Firestore Database → Rules**, then select **Publish**.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/progress/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /communityFlashcards/{setId} {
      allow read: if resource.data.visibility == "public"
                  && resource.data.status == "published";

      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid
                    && request.resource.data.visibility == "public"
                    && request.resource.data.status == "published"
                    && request.resource.data.title is string
                    && request.resource.data.title.size() > 0
                    && request.resource.data.cards is list
                    && request.resource.data.cards.size() >= 2;

      allow update, delete: if request.auth != null
                            && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

## What the rules enforce

- Public visitors can study only documents explicitly marked `visibility: "public"` and `status: "published"`.
- A creator must be signed in, and their new document's `ownerId` must be their Firebase UID.
- The initial creator form can publish directly because it writes `visibility: "public"` and `status: "published"`.
- A user can edit or delete only a set whose existing `ownerId` matches their Firebase UID.
- The existing UID-scoped progress rule stays intact.

## Setup and verification

1. Open the correct Firebase project: `arabic-3e9b3`.
2. Go to **Firestore Database → Rules**.
3. Replace the current rules with the Initial ruleset above, preserving both the progress and community-set sections.
4. Select **Publish**.
5. Confirm Firebase Authentication has Google enabled and that `calebpfohl.com` is listed under **Authentication → Settings → Authorized domains**. Add hostnames only; do not include `/arabic`.
6. Open the deployed `arabic/flashcards.html` page, sign in, create a test set with at least two cards, and confirm it appears in Community flashcards after refresh.
7. Sign out and confirm the published test set remains readable.
8. Sign into a different account and verify it cannot edit or delete the first account's set.

## Composite index

The Community Flashcards page queries published public sets by `createdAt` descending. Firestore may show a failed-precondition error containing a direct link to create a composite index. Open that generated link, create the index, wait for it to finish building, then reload the page.

Expected query fields:

```text
visibility ascending
status ascending
createdAt descending
```

## Future moderation

The initial product policy publishes valid learner-created sets immediately. The community-set documents already reserve `visibility` and `status` for a future review workflow:

| visibility | status | Meaning |
|---|---|---|
| `public` | `published` | Visible to everyone. |
| `private` | `draft` | Visible only to its owner while being written. |
| `private` | `pending` | Awaiting owner/admin review and not public. |
| `private` | `rejected` | Not public; retained only if needed for feedback or recordkeeping. |

Do not merely loosen the client UI when moderation is added. Update these rules first so ordinary users cannot set approval fields for another author, and use a trusted server-side process or an explicit verified-admin mechanism before permitting cross-user moderation.

## Important limitations

The initial `allow update, delete` line correctly prevents non-owners from changing a set, but it does not yet validate every changed field. Before adding private/pending submission, administrator approval, reports, likes, comments, or any other user-generated feature, strengthen the rules to validate allowed fields, data types, string lengths, and ownership-field immutability.

Keep this file updated whenever a Firestore collection, query, rule, or authorization decision changes. Add a dated entry to `arabic/docs/CHANGELOG.md` when rules are deployed or behavior changes.
