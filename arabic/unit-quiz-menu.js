(() => {
  const container = document.getElementById('units');
  if (!container) return;
  const style = document.createElement('style');
  style.textContent = `
    .unit-practice {--practice-bg:#d5f3ec;--practice-ink:#083c34;--practice-outline:#729b91;grid-column:1 / -1;padding:16px;margin:4px 0 6px;border:1px solid var(--practice-outline);border-radius:20px;background:var(--practice-bg);color:var(--practice-ink);}
    html[data-theme=dark] .unit-practice {--practice-bg:#173b34;--practice-ink:#b5ecdc;--practice-outline:#527e71;}
    .unit-practice-title {margin:0;font-size:.9rem;font-weight:800;letter-spacing:.01em;}
    .unit-practice-copy {margin:4px 0 12px;font-size:.78rem;line-height:1.5;}
    .unit-practice-actions {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
    .unit-practice-action {position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:64px;min-width:0;padding:12px 16px;border:1px solid var(--practice-outline);border-radius:16px;background:var(--s,#fffbfe);color:var(--practice-ink);text-decoration:none;}
    .unit-practice-action:hover {background:var(--practice-bg);}
    .unit-practice-action:focus-visible {outline:3px solid var(--practice-ink);outline-offset:3px;}
    .unit-practice-action strong {display:block;font-size:.86rem;font-weight:750;}
    .unit-practice-action small {display:block;margin-top:4px;font-size:.73rem;line-height:1.4;}
    .unit-practice-action svg {width:20px;height:20px;fill:currentColor;flex-shrink:0;}
    .chapter-quizzes-label {grid-column:1 / -1;margin:8px 0 2px;color:var(--v,#49454f);font-size:.76rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;}
    @media(max-width:520px) {.unit-practice-actions {grid-template-columns:1fr;}}
    @media(forced-colors:active) {.unit-practice,.unit-practice-action {border-color:CanvasText;}}
  `;
  document.head.append(style);
  function addUnitQuizzes() {
    const mode = document.getElementById('en')?.classList.contains('active') ? '&mode=en-to-ar' : '';
    container.querySelectorAll('details.unit:not(.soon)').forEach(section => {
      const unitId = section.id.replace(/-chapters$/, '');
      const chapters = section.querySelector('.chapters');
      if (!chapters || chapters.querySelector('[data-unit-practice]')) return;
      const panel = document.createElement('section');
      panel.className = 'unit-practice';
      panel.dataset.unitPractice = 'true';
      const titleId = unitId + '-practice-title';
      panel.setAttribute('aria-labelledby', titleId);
      const title = document.createElement('h3');
      title.id = titleId;
      title.className = 'unit-practice-title';
      title.textContent = 'Whole-unit practice';
      const copy = document.createElement('p');
      copy.className = 'unit-practice-copy';
      copy.textContent = 'Mix vocabulary across all available chapters in this unit.';
      const actions = document.createElement('div');
      actions.className = 'unit-practice-actions';
      [['unit50','50-question mix','50 random entries, or all if fewer'],
       ['unitall','All vocabulary','Every entry across available chapters']].forEach(([id,label,description]) => {
        const link = document.createElement('a');
        link.className = 'unit-practice-action';
        link.dataset.unitQuiz = id;
        link.href = `quiz.html?unit=${encodeURIComponent(unitId)}&chapter=${id}${mode}`;
        link.setAttribute('aria-label', `${label} quiz for ${unitId.replace('unit','Unit ')}`);
        link.innerHTML = `<span><strong>${label}</strong><small>${description}</small></span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`;
        actions.appendChild(link);
      });
      panel.append(title, copy, actions);
      const label = document.createElement('h3');
      label.className = 'chapter-quizzes-label';
      label.textContent = 'Chapter quizzes';
      chapters.prepend(panel, label);
    });
  }
  addUnitQuizzes();
  new MutationObserver(addUnitQuizzes).observe(container,{childList:true,subtree:true});
  import('./unit-accordion.js').catch(error => console.warn('Unit opening animation unavailable:', error));
})();
