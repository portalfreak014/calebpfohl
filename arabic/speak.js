(function () {
  if (!('speechSynthesis' in window)) return;

  var style = document.createElement('style');
  style.textContent =
    '.speak-btn{display:inline-grid;place-items:center;width:32px;height:32px;margin-left:8px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--primary,#6750a4);vertical-align:middle}' +
    '.speak-btn:hover{background:rgb(103 80 164 / .12)}' +
    '.speak-btn:focus-visible{outline:3px solid var(--primary,#6750a4);outline-offset:2px}' +
    '.speak-btn .material-symbols-rounded{font-size:20px}';
  document.head.appendChild(style);

  var arabicVoice = null;
  function pickVoice() {
    var voices = speechSynthesis.getVoices();
    arabicVoice = voices.find(function (v) { return /^ar(-|_|$)/i.test(v.lang); }) || null;
  }
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);

  function speak(text) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    if (arabicVoice) u.voice = arabicVoice;
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function addButtons(root) {
    root.querySelectorAll('td.arabic:not([data-speak])').forEach(function (td) {
      td.dataset.speak = '1';
      var text = td.textContent.trim().replace(/\s*\/\s*/g, '، ');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'speak-btn';
      btn.setAttribute('aria-label', 'Pronounce ' + text);
      btn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">volume_up</span>';
      btn.addEventListener('click', function () { speak(text); });
      td.appendChild(btn);
    });
  }

  function init() {
    var content = document.getElementById('content');
    if (!content) return;
    addButtons(content);
    new MutationObserver(function () { addButtons(content); })
      .observe(content, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
