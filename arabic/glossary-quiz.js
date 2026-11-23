(() => {
  'use strict';
  const content = document.getElementById('content');
  if (!content || content.dataset.quizActions) return;
  content.dataset.quizActions = 'ready';
  const style = document.createElement('style');
  style.textContent = `
    .glossary-chapter-header {display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px 16px;margin-bottom:12px;}
    .glossary-chapter-header .chapter-title {margin:0;}
    .glossary-quiz-action {display:inline-flex;position:relative;isolation:isolate;align-items:center;justify-content:center;gap:8px;flex-shrink:0;min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--primary,#6750a4);color:var(--on-primary,#fff);font:600 .875rem/1.25 system-ui,sans-serif;letter-spacing:.025em;text-decoration:none;box-shadow:0 1px 2px #0003;-webkit-tap-highlight-color:transparent;}
    .glossary-quiz-action::before {content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:currentColor;opacity:0;pointer-events:none;}
    .glossary-quiz-action:hover::before {opacity:.08;}
    .glossary-quiz-action:focus-visible::before,.glossary-quiz-action:active::before {opacity:.12;}
    .glossary-quiz-action:focus-visible {outline:3px solid var(--primary,#6750a4);outline-offset:4px;}
    .glossary-quiz-action svg {width:20px;height:20px;fill:currentColor;flex-shrink:0;}
    @media (forced-colors:active) {.glossary-quiz-action {border:1px solid ButtonText;}}
  `;
  document.head.append(style);
  function enhance(heading) {
    if (heading.dataset.quizChecked || !window.UnitsManifest) return;
    const chapterMatch = heading.textContent.trim().match(/^Chapter\s+(\d+)$/i);
    if (!chapterMatch) return;
    const section = heading.closest('section.chapter');
    const unitSection = section?.parentElement.closest('section[id^="unit-"]');
    const unitNumber = unitSection
      ? unitSection.id.replace('unit-', '')
      : document.querySelector('.unit-tab.active')?.dataset.unit;
    if (!/^\d+$/.test(unitNumber || '')) return;
    const unitId = 'unit' + unitNumber;
    const chapterId = 'ch' + Number(chapterMatch[1]);
    const chapter = window.UnitsManifest.getChapter(unitId, chapterId);
    heading.dataset.quizChecked = 'true';
    if (!chapter?.available || !section.querySelector('tbody tr td.arabic')) return;
    const header = document.createElement('div');
    header.className = 'glossary-chapter-header';
    const link = document.createElement('a');
    link.className = 'glossary-quiz-action';
    link.href = 'quiz.html?' + new URLSearchParams({unit:unitId, chapter:chapterId, return:'glossary.html#' + section.id});
    link.addEventListener('click', () => {
      try { localStorage.setItem('uad-glossary-last-unit', unitNumber); } catch (error) {}
    });
    link.setAttribute('aria-label', 'Take quiz for Unit ' + unitNumber + ', ' + chapter.title);
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 16-4-4 1.41-1.41L10 16.17l6.59-6.59L18 11l-8 8z"/></svg><span>Take quiz</span>';
    heading.before(header);
    header.append(heading, link);
  }
  function scan() {content.querySelectorAll('h4.chapter-title').forEach(enhance);}
  new MutationObserver(scan).observe(content, {childList:true, subtree:true});
  scan();

  if (location.hash.length > 1) {
    const targetId = decodeURIComponent(location.hash.slice(1));
    const scrollObserver = new MutationObserver(() => {
      const target = document.getElementById(targetId);
      if (target) { target.scrollIntoView(); scrollObserver.disconnect(); }
    });
    scrollObserver.observe(content, {childList:true, subtree:true});
    setTimeout(() => scrollObserver.disconnect(), 8000);
  }
})();
