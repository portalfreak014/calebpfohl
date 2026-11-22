(() => {
  const container = document.getElementById('units');
  if (!container || container.dataset.springReady) return;
  container.dataset.springReady = 'true';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  function stop(section) {
    const job = running.get(section);
    if (!job) return;
    running.delete(section);
    job.animation.cancel();
    if (job.overflow) section.style.setProperty('overflow', job.overflow, job.priority);
    else section.style.removeProperty('overflow');
  }
  container.addEventListener('toggle', event => {
    const section = event.target;
    if (!section.matches('details.unit')) return;
    stop(section);
    if (!section.open || reducedMotion.matches || typeof section.animate !== 'function') return;
    const summary = section.querySelector('summary');
    if (!summary) return;
    const border = getComputedStyle(section);
    const collapsed = summary.getBoundingClientRect().height + parseFloat(border.borderTopWidth || 0) + parseFloat(border.borderBottomWidth || 0);
    const expanded = section.getBoundingClientRect().height;
    if (expanded <= collapsed) return;
    const overflow = section.style.getPropertyValue('overflow');
    const priority = section.style.getPropertyPriority('overflow');
    section.style.setProperty('overflow', 'hidden');
    const bounce = Math.min(10, (expanded - collapsed) * .025);
    const animation = section.animate([
      {height: collapsed + 'px', offset: 0, easing: 'cubic-bezier(.2,0,.2,1)'},
      {height: (expanded + bounce) + 'px', offset: .72, easing: 'ease-in-out'},
      {height: (expanded - bounce * .25) + 'px', offset: .9, easing: 'ease-out'},
      {height: expanded + 'px', offset: 1}
    ], {duration: 520, fill: 'both'});
    running.set(section, {animation, overflow, priority});
    animation.onfinish = () => stop(section);
  }, true);
  reducedMotion.addEventListener('change', () => {
    for (const section of [...running.keys()]) stop(section);
  });
  new MutationObserver(() => {
    for (const section of [...running.keys()]) if (!section.isConnected) stop(section);
  }).observe(container, {childList:true});
})();
