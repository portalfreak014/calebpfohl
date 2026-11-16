(() => {
  'use strict';

  function render() {
    document.querySelectorAll('[data-study-footer]').forEach(host => {
      if (host.dataset.footerReady === 'true') return;
      const footer = document.createElement('footer');
      footer.style.cssText = 'margin-top:34px;padding-top:18px;border-top:1px solid var(--outline-variant,var(--ov,#cac4d0));color:var(--muted,var(--v,#49454f));font-family:inherit;font-size:.75rem;line-height:1.6;text-align:center;';
      const credits = document.createElement('p');
      credits.style.margin = '0 0 8px';
      credits.textContent = "Created by Caleb Pfohl with Perplexity Pro. Design inspired by Google's Material Design 3.";
      const disclaimer = document.createElement('p');
      disclaimer.style.margin = '0';
      disclaimer.textContent = 'Independent, unofficial study resource. Not officially affiliated with, endorsed by, or sponsored by the U.S. Army, the Presidio of Monterey, the Defense Language Institute Foreign Language Center (DLIFLC), the Department of Defense, or any other government agency.';
      footer.append(credits, disclaimer);
      host.replaceChildren(footer);
      host.dataset.footerReady = 'true';
    });
  }

  window.StudyFooter = {render};
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, {once:true});
  } else render();
})();
