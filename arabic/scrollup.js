(() => {
  'use strict';

  const script = document.currentScript;
  const value = Number(script?.dataset.threshold ?? 80);
  const threshold = Number.isFinite(value) ? Math.max(0, value) : 80;

  function init() {
    if (document.getElementById('portable-scrollup')) return;

    const host = document.createElement('div');
    host.id = 'portable-scrollup';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          right: max(20px, env(safe-area-inset-right));
          bottom: calc(20px + env(safe-area-inset-bottom));
          z-index: 15;
          pointer-events: none;
        }
        button {
          box-sizing: border-box;
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid var(--ov, #cac4d0);
          border-radius: 16px;
          background: var(--pc, #e9ddff);
          color: var(--opc, #21005d);
          box-shadow: 0 4px 12px rgb(0 0 0 / .18);
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transform: translateY(12px);
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
        }
        button.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }
        button:hover { filter: brightness(.96); }
        button:focus-visible {
          outline: 3px solid var(--p, #6750a4);
          outline-offset: 4px;
        }
        svg { width: 24px; height: 24px; pointer-events: none; }
        @media (max-width: 699.98px) {
          :host { bottom: calc(92px + env(safe-area-inset-bottom)); }
        }
        @media (prefers-reduced-motion: reduce) {
          button { transition: none; transform: none; }
        }
      </style>
      <button type="button" aria-label="Scroll to top" title="Scroll to top" aria-hidden="true" tabindex="-1" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 12l6-6 6 6M12 6v12"></path>
        </svg>
      </button>
    `;

    const button = root.querySelector('button');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pending = false;

    function updateVisibility() {
      const visible = window.scrollY > threshold;
      button.classList.toggle('visible', visible);
      button.disabled = !visible;
      button.tabIndex = visible ? 0 : -1;
      button.setAttribute('aria-hidden', String(!visible));
      pending = false;
    }

    function scheduleUpdate() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(updateVisibility);
    }

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        left: window.scrollX,
        behavior: reducedMotion.matches ? 'instant' : 'smooth'
      });
    });

    document.body.appendChild(host);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('pageshow', updateVisibility);
    updateVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
