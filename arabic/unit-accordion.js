(() => {
  const container = document.getElementById('units');
  if (!container || container.dataset.springReady) return;
  container.dataset.springReady = 'true';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  let desired = null;
  let revision = 0;

  function cancel(section) {
    const job = running.get(section);
    if (!job) return;
    running.delete(section);
    job.animation.cancel();
    for (const saved of job.styles) {
      if (saved.value) section.style.setProperty(saved.name, saved.value, saved.priority);
      else section.style.removeProperty(saved.name);
    }
    job.resolve();
  }

  function animateTo(section, open) {
    const start = section.getBoundingClientRect().height;
    cancel(section);
    if (!section.isConnected) return Promise.resolve();
    const summary = section.querySelector('summary');
    if (!summary) return Promise.resolve();
    if (reducedMotion.matches || typeof section.animate !== 'function') {
      section.open = open;
      return Promise.resolve();
    }
    if (!open && !section.open) return Promise.resolve();
    section.open = true;
    const css = getComputedStyle(section);
    const collapsed = summary.getBoundingClientRect().height + parseFloat(css.borderTopWidth || 0) + parseFloat(css.borderBottomWidth || 0);
    const expanded = section.getBoundingClientRect().height;
    const end = open ? expanded : collapsed;
    if (Math.abs(start - end) < 1) {
      section.open = open;
      return Promise.resolve();
    }
    const styles = ['overflow', 'overflow-anchor'].map(name => ({name, value:section.style.getPropertyValue(name), priority:section.style.getPropertyPriority(name)}));
    section.style.setProperty('overflow', 'hidden');
    section.style.setProperty('overflow-anchor', 'none');
    return new Promise(resolve => {
      const animation = section.animate([
        {height:start + 'px'},
        {height:end + 'px'}
      ], {
        duration:open ? 440 : 300,
        easing:open ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.2,1)',
        fill:'both'
      });
      running.set(section, {animation, styles, resolve});
      animation.onfinish = () => {
        if (running.get(section)?.animation !== animation) return;
        section.open = open;
        cancel(section);
      };
    });
  }

  async function select(target) {
    desired = target;
    const token = ++revision;
    const others = [...container.querySelectorAll('details.unit')].filter(section => section !== target && (section.open || running.has(section)));
    await Promise.all(others.map(section => animateTo(section, false)));
    if (token !== revision || !target?.isConnected) return;
    await animateTo(target, true);
  }

  container.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    const section = summary?.parentElement;
    if (!section?.matches('details.unit') || !container.contains(section)) return;
    if (event.target.closest('a,button,input,select,textarea')) return;
    event.preventDefault();
    select(desired === section ? null : section);
  });

  container.addEventListener('toggle', event => {
    const section = event.target;
    if (!section.matches('details.unit') || !section.open || running.has(section) || desired === section) return;
    section.open = false;
    select(section);
  }, true);

  reducedMotion.addEventListener('change', () => {
    revision++;
    for (const section of [...running.keys()]) cancel(section);
    container.querySelectorAll('details.unit').forEach(section => {section.open = section === desired;});
  });

  function reconcile() {
    for (const section of [...running.keys()]) if (!section.isConnected) cancel(section);
    if (desired && !desired.isConnected) {desired = null;revision++;}
    let first = desired;
    container.querySelectorAll('details.unit[open]').forEach(section => {
      if (!first) first = section;
      else if (section !== first && !running.has(section)) section.open = false;
    });
    if (!desired) desired = first;
  }
  reconcile();
  new MutationObserver(reconcile).observe(container, {childList:true});
})();
