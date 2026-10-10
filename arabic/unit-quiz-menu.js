(() => {
  const container = document.getElementById('units');
  if (!container) return;
  function addUnitQuizzes() {
    const mode = document.getElementById('en')?.classList.contains('active') ? '&mode=en-to-ar' : '';
    container.querySelectorAll('details.unit:not(.soon)').forEach(section => {
      const unitId = section.id.replace(/-chapters$/, '');
      const chapters = section.querySelector('.chapters');
      if (!chapters || chapters.querySelector('[data-unit-quiz]')) return;
      const fragment = document.createDocumentFragment();
      [['unit50','50-question quiz','50 random entries (or all if fewer)','50'],
       ['unitall','Entire-unit quiz','Every entry across available chapters','All']].forEach(([id,title,description,badge]) => {
        const link = document.createElement('a');
        link.className = 'chapter';
        link.dataset.unitQuiz = id;
        link.href = `quiz.html?unit=${encodeURIComponent(unitId)}&chapter=${id}${mode}`;
        link.innerHTML = `<span class="num">${badge}</span><span><span class="ctitle">${title}</span><span class="cmeta">${description}</span></span><span class="status">Start</span>`;
        fragment.appendChild(link);
      });
      chapters.prepend(fragment);
    });
  }
  addUnitQuizzes();
  new MutationObserver(addUnitQuizzes).observe(container,{childList:true,subtree:true});
})();
