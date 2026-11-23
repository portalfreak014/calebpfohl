(function () {
  if (!('speechSynthesis' in window)) return;

  var voice = null;
  function pickVoice() {
    voice = speechSynthesis.getVoices().find(function (v) { return /^ar(-|_|$)/i.test(v.lang); }) || null;
  }
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);

  function speak(text) {
    if (!text) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
  function clean(text) { return String(text || '').trim().replace(/\s*\/\s*/g, '، '); }

  function init() {
    var term = document.getElementById('arabic-term');
    var english = document.getElementById('english-meaning');
    var overlay = document.getElementById('deck-overlay');
    if (!term || !english || !overlay) return;

    var style = document.createElement('style');
    style.textContent =
      '.card-audio{position:absolute;top:10px;right:10px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--primary,#6750a4);cursor:pointer;pointer-events:auto}' +
      '.card-audio:hover{background:rgb(103 80 164 / .12)}' +
      '.card-audio:focus-visible{outline:3px solid var(--primary,#6750a4);outline-offset:2px}';
    document.head.appendChild(style);

    function current() { return clean(term.textContent); }

    function addButton(face) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-audio';
      btn.setAttribute('aria-label', 'Listen to pronunciation');
      btn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">volume_up</span>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        speak(current());
      });
      btn.addEventListener('keydown', function (e) { e.stopPropagation(); });
      face.appendChild(btn);
    }
    addButton(term.parentElement);
    addButton(english.parentElement);

    new MutationObserver(function () {
      if (!overlay.classList.contains('is-open') || !current()) return;
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
      setTimeout(function () { speak(current()); }, 250);
    }).observe(term, { childList: true, characterData: true, subtree: true });

    var back = document.getElementById('back-to-sets');
    if (back) back.addEventListener('click', function () { speechSynthesis.cancel(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
