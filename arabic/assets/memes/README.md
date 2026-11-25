# Chaos meme images

Upload your approved meme images here, then edit MEME_FILES in arabic/chaos-config.js, for example:

export const MEME_FILES = ['celebration.jpg', 'scholar.png'];

Use filenames only, including the exact extension and capitalization; no URLs or subdirectories. Supported extensions: png, jpg, jpeg, webp, avif, gif. Prefer small static images without flashing. Use assets you have permission to publish. Animated content needs separate review for flashing; reduced-effects mode always falls back to stationary text rather than trying to stop animation embedded in an image.

Images preload when Chaos Mode opens. Until an image has loaded successfully, or when the list is empty, the reaction remains nice. Broken images are skipped. With multiple loaded images, the same file is not selected twice in a row. Each reaction randomly chooses entry/exit angles, tilt and center drift. At most one reaction remains mounted; the layer does not intercept answer taps.

Answer review delay: ANSWER_HOLD_MS = 1500 means 1.5 seconds. Set 1000 for one second. QUESTION_TIME_MS controls the five-second deadline; REACTION_DURATION_MS controls the two-second animation independently. The reaction may continue onto the next question; wrong answers, results, menu changes and exit clean it up. Browser/deployment testing remains required.
