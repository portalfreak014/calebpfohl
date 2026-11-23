import { readFile, writeFile } from 'node:fs/promises';

const homeFile = 'arabic/arabic.html';
let home = await readFile(homeFile, 'utf8');
if (!home.includes('src="home-flashcards.js"')) {
  if (!home.includes('id="chapter-quizzes"') || !home.includes('</body>')) throw new Error('Prepared homepage chapter section missing');
  home = home.replace('</body>', '<script src="home-flashcards.js" defer></script>\n</body>');
  await writeFile(homeFile, home);
}

const glossaryFile = 'arabic/glossary.html';
let glossary = await readFile(glossaryFile, 'utf8');
if (!glossary.includes('const requestedGlossaryUnit =')) {
  const original = 'const initialUnit = UNITS.includes(savedUnit) ? savedUnit : 1;';
  if (!glossary.includes(original)) throw new Error('Glossary initial-unit logic changed');
  glossary = glossary.replace(original, `const glossaryUnitParam = new URLSearchParams(location.search).get('unit');
const requestedGlossaryUnit = /^\\d+$/.test(glossaryUnitParam || '') ? Number(glossaryUnitParam) : null;
const initialUnit = requestedGlossaryUnit !== null && UNITS.includes(requestedGlossaryUnit) ? requestedGlossaryUnit : UNITS.includes(savedUnit) ? savedUnit : 1;`);
  await writeFile(glossaryFile, glossary);
}

const flashFile = 'arabic/flashcards.html';
let flash = await readFile(flashFile, 'utf8');
if (!flash.includes('/* chapter-flashcard-links-v1 */')) {
  const leave = 'function leaveStudy(){';
  const bootstrap = 'loadCourse();resetCreator();loadCommunitySets();';
  if (!flash.includes(leave) || !flash.includes(bootstrap)) throw new Error('Flashcard lifecycle changed; review deep-link integration');
  flash = flash.replace(leave, "function leaveStudy(){if(flashcardReturn){location.assign(flashcardReturn);return;}");
  const integration = `/* chapter-flashcard-links-v1 */
const flashcardParams = new URLSearchParams(location.search);
let flashcardReturn = null;
try {
  const rawReturn = flashcardParams.get('return');
  if (rawReturn) {
    const candidate = new URL(rawReturn, location.href);
    const allowed = new URL('glossary.html', location.href);
    const unitParam = candidate.searchParams.get('unit');
    if (candidate.origin === allowed.origin && candidate.pathname === allowed.pathname && /^\\d+$/.test(unitParam || '') && Number(unitParam) >= 0 && Number(unitParam) <= 10 && /^#chapter-[0-9]+$/.test(candidate.hash)) {
      flashcardReturn = 'glossary.html?unit=' + Number(unitParam) + candidate.hash;
    }
  }
} catch {}
if (flashcardReturn) {
  const close = document.querySelector('.topbar a.icon-button');
  if (close) { close.href = flashcardReturn; close.setAttribute('aria-label', 'Return to glossary chapter'); }
  $('back-to-sets').textContent = 'Back to glossary';
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && deckOverlay.classList.contains('is-open')) { event.preventDefault(); leaveStudy(); }
  });
}
async function openRequestedFlashcards() {
  const unitId = flashcardParams.get('unit');
  const chapterId = flashcardParams.get('chapter');
  if (!unitId && !chapterId) return;
  const unit = courseUnits.get(unitId);
  const chapter = unit?.chapters.find(item => item.id === chapterId);
  const items = chapter ? unit.cards.get(chapter.number) || [] : [];
  if (!chapter?.available || unit.error || !items.length) {
    $('course-message').textContent = 'This chapter could not be opened. Choose another set below or reload to try again.';
    return;
  }
  await startCards(items, unit.title + ' · ' + chapter.title, unitId + ':' + chapterId, {unitId, chapterId});
}
loadCourse().then(openRequestedFlashcards).catch(error => { console.error('Chapter flashcards could not open:', error); $('course-message').textContent = 'This chapter could not be opened. Please choose a set below.'; });
resetCreator();loadCommunitySets();`;
  flash = flash.replace(bootstrap, () => integration);
  await writeFile(flashFile, flash);
}
console.log('Prepared homepage chapter chips, flashcard deep links, and validated glossary returns.');
