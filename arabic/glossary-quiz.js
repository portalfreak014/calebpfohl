(() => {
  'use strict';
  const content = document.getElementById('content');
  if (!content || content.dataset.quizActions) return;
  content.dataset.quizActions = 'ready';
  const style = document.createElement('style');
  style.textContent = `
    .glossary-chapter-header {display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px;margin-bottom:12px;}
    .glossary-chapter-header .chapter-title {margin:0;}
    .glossary-study-actions {display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
    .glossary-study-action {display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 12px;border:1px solid var(--outline-variant,#cac4d0);border-radius:999px;background:transparent;color:var(--primary,#6750a4);font:600 .8rem/1.25 system-ui,sans-serif;text-decoration:none;-webkit-tap-highlight-color:transparent;}
    .glossary-study-action:hover {background:var(--primary-container,#e9ddff);color:var(--on-primary-container,#21005d);}
    .glossary-study-action:focus-visible {outline:3px solid var(--primary,#6750a4);outline-offset:3px;}
    @media(forced-colors:active) {.glossary-study-action {border-color:LinkText;}}
  `;
  document.head.append(style);
  function enhance(heading) {
    if (heading.dataset.quizChecked || !window.UnitsManifest) return;
    const chapterMatch = heading.textContent.trim().match(/^Chapter\s+(\d+)$/i);
    if (!chapterMatch) return;
    const section = heading.closest('section.chapter');
    if (!section) return;
    const unitSection = section.parentElement?.closest('section[id^="unit-"]');
    const unitNumber = unitSection ? unitSection.id.replace('unit-', '') : document.querySelector('.unit-tab.active')?.dataset.unit;
    if (!/^\d+$/.test(unitNumber || '')) return;
    const unitId = 'unit' + unitNumber;
    const chapterId = 'ch' + Number(chapterMatch[1]);
    const chapter = window.UnitsManifest.getChapter(unitId, chapterId);
    heading.dataset.quizChecked = 'true';
    if (!chapter?.available || !section.querySelector('tbody tr td.arabic')) return;
    const header = document.createElement('div');
    header.className = 'glossary-chapter-header';
    const actions = document.createElement('div');
    actions.className = 'glossary-study-actions';
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', chapter.title + ' study options');
    for (const [label, page] of [['Quiz','quiz.html'], ['Flashcards','flashcards.html']]) {
      const link = document.createElement('a');
      link.className = 'glossary-study-action';
      const back = page === 'flashcards.html' ? 'glossary.html?unit=' + unitNumber + '#' + section.id : 'glossary.html#' + section.id;
      link.href = page + '?' + new URLSearchParams({unit:unitId, chapter:chapterId, return:back});
      link.textContent = label;
      link.setAttribute('aria-label', label + ' for Unit ' + unitNumber + ', ' + chapter.title);
      link.addEventListener('click', () => { try { localStorage.setItem('uad-glossary-last-unit', unitNumber); } catch {} });
      actions.append(link);
    }
    heading.before(header);
    header.append(heading, actions);
  }
  function scan() { content.querySelectorAll('h4.chapter-title').forEach(enhance); }
  new MutationObserver(scan).observe(content, {childList:true, subtree:true});
  scan();
  if (location.hash.length > 1) {
    let targetId;
    try { targetId = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const scrollObserver = new MutationObserver(restore);
    function restore() {
      const target = document.getElementById(targetId);
      if (target) { target.scrollIntoView(); scrollObserver.disconnect(); }
    }
    scrollObserver.observe(content, {childList:true, subtree:true});
    restore();
    setTimeout(() => scrollObserver.disconnect(), 8000);
  }
})();
