# Account Authentication

## Status
Planned platform feature. The current application is anonymous and stores learning progress locally in the browser.

## Purpose
Account authentication enables learners to retain progress across devices, supports a durable known-vocabulary model, and provides the identity foundation for mobile app distribution and account-linked analytics.

## Initial scope
- Offer Google Sign-In as the first supported authentication method.
- Continue to permit anonymous use; signing in should be a clear, non-blocking way to preserve progress across devices.
- Store only the learning state required for cross-device continuity: completed content, quiz and matching-game results, study settings, and known-vocabulary/mastery data when available.
- Provide sign-out and an understandable path to request or perform account/data deletion.
- Keep cloud data as the canonical record after sign-in while maintaining a local cache for offline use.

## Deferred scope
- Traditional email/password authentication, including verification and password-reset support.
- Social features, public profiles, and nonessential account customization.

## Anonymous-to-account progress migration
On a learner’s first successful sign-in, import locally stored anonymous progress into their cloud account. If cloud progress already exists, merge records conservatively: never reduce completion, preserve the furthest progress per unit or chapter, retain the highest known-vocabulary or mastery state, and resolve settings by the most recently updated value. After a confirmed sync, cloud data becomes canonical while the device retains a cache for offline use.

## Acceptance criteria
- A learner with only local progress experiences no loss after their first Google sign-in.
- A returning learner who signs in on a new device receives their cloud progress.
- A learner who accumulates local progress while offline receives a non-destructive merge at the next sign-in or sync.
- Sign-out removes local account data from the device but does not delete cloud progress.
- Account deletion clearly distinguishes deletion of cloud account/data from merely signing out.
- The first-sync flow is tested with conflicting local and cloud records, with neither record regressing.

## Release requirement
Define, implement, and test this migration behavior before the Play Store build, so existing web learners can sign in without losing progress.