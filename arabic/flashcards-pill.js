(() => {
  'use strict';
  const root = document.querySelector('[data-pill-nav]');
  const overlay = document.getElementById('deck-overlay');
  if (!root || !overlay) return;
  let previous;
  function sync() {
    const open = overlay.classList.contains('is-open');
    if (open === previous) return;
    previous = open;
    if (open) {
      if (root.contains(document.activeElement)) document.getElementById('back-to-sets')?.focus({preventScroll:true});
      root.inert = true;
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
    } else {
      root.dispatchEvent(new Event('pill-nav:reset'));
      root.inert = false;
      root.hidden = false;
      root.removeAttribute('aria-hidden');
    }
  }
  new MutationObserver(sync).observe(overlay, {attributes:true, attributeFilter:['class']});
  window.addEventListener('pageshow', sync);
  sync();
})();
