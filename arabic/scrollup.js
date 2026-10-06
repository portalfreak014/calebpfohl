(() => {
  "use strict";

  const script = document.currentScript;
  const parsedThreshold = Number(script?.dataset.threshold ?? 300);
  const threshold = Number.isFinite(parsedThreshold)
    ? Math.max(0, parsedThreshold)
    : 300;

  function init() {
    // Prevent duplicate buttons if loaded more than once.
    if (document.getElementById("portable-scrollup")) return;

    const host = document.createElement("div");
    host.id = "portable-scrollup";

    // Keep site styles from interfering with the button.
    const root = host.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          right: max(20px, env(safe-area-inset-right));
          bottom: max(20px, env(safe-area-inset-bottom));
          z-index: 2147483647;
        }

        button {
          box-sizing: border-box;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          background: #171717;
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background 150ms ease, transform 150ms ease;
        }

        button[hidden] {
          display: none;
        }

        button:hover {
          background: #333;
          transform: translateY(-2px);
        }

        button:focus-visible {
          outline: 3px solid #60a5fa;
          outline-offset: 4px;
        }

        svg {
          width: 22px;
          height: 22px;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none;
          }
        }
      </style>

      <button
        type="button"
        aria-label="Scroll to top"
        title="Scroll to top"
        hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 12l6-6 6 6M12 6v12"></path>
        </svg>
      </button>
    `;

    const button = root.querySelector("button");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function updateVisibility() {
      button.hidden = window.scrollY < threshold;
    }

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        left: window.scrollX,
        behavior: reducedMotion.matches ? "instant" : "smooth"
      });
    });

    document.body.appendChild(host);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("pageshow", updateVisibility);
    updateVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
