# Chaos Mode: solo prototype and roadmap

## Scope of this change

Separate opt-in chaos.html route, not a replacement for the normal quiz. Guest-only local round state; no Firebase writes, progress migration, or multiplayer backend. Netlify prepare-account.mjs injects chaos-entry.js into shared theme/pill scripts. A visually unlabeled shimmer icon opens the setup page and retains a tooltip and accessible name. It mounts near theme/menu controls where present, not on every possible page without those controls. Direct source previews must run build preparation for the shared entry point; chaos.html itself works without that injection.

## Implemented prototype

Manifest-based unit/chapter selection; existing unit JSON questions without copied vocabulary; Arabic-to-English and English-to-Arabic directions; shuffled questions/options; 10/20/40 question rounds capped by available vocabulary; 3-2-1 countdown; correct/wrong feedback; streaks and capped combo bonus; original text-based meme-style reactions; smooth rainbow scenery; reduced-effects preference; mute/volume; original procedural synth loop; optional local audio-file playback; explicit next button; pause/resume; pause on backgrounding; results and missed-word retry. Reactions are original typographic placeholders, not an imported image-meme pack. English-to-Arabic distractors currently come from the selected round; smaller rounds may offer fewer than four options. There is no speed timer or penalty.

Score: 100 per correct answer plus 20 times min(streak minus 1, 5); wrong answers reset the streak. No speed bonus. Arcade points do not affect normal learner progress. Music starts after the Start action and vocabulary fetch; browser activation policies may still block it. Toggling Music retries from a direct user interaction. No pronunciation audio is included in this first prototype. The iPhone silent-switch speech issue and Google One Tap diagnosis remain separate unresolved work.

Running in the 90s remains a creative soundtrack reference, not an included recording. Only original synth audio ships. Local selected tracks are not uploaded. Curated image memes, approved music, pronunciation with music ducking, saved preferences, performance profiling, and automated/browser tests remain follow-up work. No claim of measurable dopamine or learning improvement. Avoid strobing and validate combined effects against WCAG flashing criteria before expanding visuals. References: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html and https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

## Multiplayer roadmap

1. Private invite-code rooms and a small group pilot: create/join lobby, host start, shared questions, results, rematch.
2. Evaluate Firestore versus Realtime Database plus a trusted backend, including read/write costs and presence/reconnect requirements. Do not promise serverless client-only ranked integrity.
3. Define room/member/round/submission records, authorized membership, rate limits, expiring rooms, host disconnect behavior, late joins, and cleanup.
4. Server-authoritative timing and score validation, one submission per player/question, no client-authored trusted scores. Keep future correct answers off untrusted clients where required. Define guest identity before enabling room writes.
5. Competitive versus cooperative format decision, followed by realistic device/network/load testing. Music/effects play locally; do not promise sample-accurate synchronization.

## Verification still required

This commit is prepared but has not been executed in a browser or tested through Netlify. Verify every built unit file uses a compatible chapter/questions/choices/answer shape; unsupported selections show an error rather than fabricate data. Test mobile layout, Safari audio blocking/retry, pause during countdown/feedback, background/return, replay and missed-word rounds, keyboard focus, reduced motion, muted play, no activity after exit, and no regression to account/navigation build transforms. Before larger rollout add automated state/score tests, asset licensing records, and real-device performance checks.
