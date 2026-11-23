(() => {
  const anchor = document.getElementById('chapter-quizzes');
  if (!anchor || !window.UnitsManifest || document.getElementById('chapter-flashcards')) return;
  const style = document.createElement('style');
  style.textContent = `
    #chapter-flashcards .flashcard-units {display:grid;gap:8px;}
    #chapter-flashcards details {border:1px solid var(--ov);border-radius:16px;}
    #chapter-flashcards summary {cursor:pointer;padding:12px 14px;font-size:.9rem;font-weight:700;}
    #chapter-flashcards .flashcard-chips {display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 12px;}
    #chapter-flashcards .flashcard-chip {display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 12px;border:1px solid var(--ov);border-radius:999px;background:var(--sl);color:var(--ink);text-decoration:none;font-size:.78rem;font-weight:600;}
    #chapter-flashcards a.flashcard-chip:hover {background:var(--pc);color:var(--opc);}
    #chapter-flashcards .flashcard-chip[aria-disabled=true] {opacity:.45;cursor:default;}
    #chapter-flashcards .flashcard-all {font-size:.8rem;color:var(--p);white-space:nowrap;}
  `;
  document.head.append(style);
  const section = document.createElement('section');
  section.id = 'chapter-flashcards';
  section.className = 'section';
  section.setAttribute('aria-labelledby', 'chapter-flashcards-title');
  section.innerHTML = '<div class="heading"><h2 id="chapter-flashcards-title">Flashcards</h2><a class="flashcard-all" href="flashcards.html">All sets</a></div><p class="hint">Pick a unit, then a chapter.</p><div class="flashcard-units"></div>';
  const list = section.querySelector('.flashcard-units');
  for (const unitId of window.UnitsManifest.listUnits()) {
    const unit = window.UnitsManifest.getUnit(unitId);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = unit.title;
    details.append(summary);
    const chips = document.createElement('div');
    chips.className = 'flashcard-chips';
    for (const chapter of unit.chapters) {
      const chip = document.createElement(chapter.available ? 'a' : 'span');
      chip.className = 'flashcard-chip';
      chip.textContent = 'Ch ' + chapter.number;
      const label = unit.title + ', ' + chapter.title + (chapter.available ? ' flashcards' : ' — coming soon');
      chip.setAttribute('aria-label', label);
      chip.title = label;
      if (chapter.available) chip.href = 'flashcards.html?' + new URLSearchParams({unit:unitId, chapter:chapter.id});
      else chip.setAttribute('aria-disabled', 'true');
      chips.append(chip);
    }
    details.append(chips);
    list.append(details);
  }
  anchor.after(section);
})();
