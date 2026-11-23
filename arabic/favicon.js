(() => {
  'use strict';
  const base = document.currentScript.src;
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let link;
  let previous;
  function update() {
    const mode = root.dataset.theme === 'dark' || root.dataset.theme === 'light'
      ? root.dataset.theme
      : system.matches ? 'dark' : 'light';
    if (mode === previous && link?.isConnected) return;
    document.querySelectorAll('link[rel~="icon"]').forEach(node => node.remove());
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.sizes = '512x512';
    link.href = new URL(`assets/fursa-favicon-${mode}.png`, base).href;
    document.head.appendChild(link);
    previous = mode;
  }
  new MutationObserver(update).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  system.addEventListener('change', update);
  update();
})();
