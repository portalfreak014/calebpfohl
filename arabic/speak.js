(function () {
  function initReturn() {
    var back = new URLSearchParams(location.search).get('return');
    if (!back || !/^glossary\.html(#[A-Za-z0-9_-]+)?$/.test(back)) return;
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#exit-button, a[href="arabic.html"]');
      if (!t) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      location.href = back;
    }, true);
  }
  initReturn();

  if (!('speechSynthesis' in window)) return;

  var arabicVoice = null;
  function pickVoice() {
    var voices = speechSynthesis.getVoices();
    arabicVoice = voices.find(function (v) { return /^ar(-|_|$)/i.test(v.lang); }) || null;
  }
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);

  function requestPlaybackSession() {
    try {
      if ('audioSession' in navigator && navigator.audioSession) {
        navigator.audioSession.type = 'playback';
      }
    } catch (error) {
      console.warn('Playback audio session unavailable; using default speech audio:', error);
    }
  }

  function speak(text) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    if (arabicVoice) u.voice = arabicVoice;
    u.rate = 0.85;
    speechSynthesis.cancel();
    requestPlaybackSession();
    speechSynthesis.speak(u);
  }
  function clean(text) { return String(text || '').trim().replace(/\s*\/\s*/g, '، '); }

  function initGlossary() {
    var content = document.getElementById('content');
    if (!content) return;
    var style = document.createElement('style');
    style.textContent =
      '.speak-btn{display:inline-grid;place-items:center;box-sizing:border-box;width:32px;height:32px;margin-inline:8px;padding:0;border:1px solid var(--outline-variant,#cac4d0);border-radius:8px;background:transparent;color:var(--primary,#6750a4);vertical-align:middle}' +
      '.speak-btn:hover{background:rgb(103 80 164 / .12)}' +
      '.speak-btn:focus-visible{outline:3px solid var(--primary,#6750a4);outline-offset:2px}' +
      '.speak-btn .material-symbols-rounded{font-size:20px}';
    document.head.appendChild(style);
    function addButtons() {
      content.querySelectorAll('td.arabic:not([data-speak])').forEach(function (td) {
        td.dataset.speak = '1';
        var text = clean(td.textContent);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'speak-btn';
        btn.setAttribute('aria-label', 'Pronounce ' + text);
        btn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">volume_up</span>';
        btn.addEventListener('click', function () { speak(text); });
        td.appendChild(btn);
      });
    }
    addButtons();
    new MutationObserver(addButtons).observe(content, { childList: true, subtree: true });
  }

  function initQuiz() {
    var audioBtn = document.getElementById('audio-button');
    if (!audioBtn) return;
    document.addEventListener('click', function (e) {
      var choice = e.target.closest && e.target.closest('#choices button.choice');
      if (!choice || choice.disabled) return;
      try {
        if (mode !== 'en-to-ar' || state.answered) return;
        var text = clean(state.displayToOriginal[choice.dataset.key]);
        if (text) speak(text);
      } catch (err) {
        console.warn('Selected choice pronunciation unavailable:', err);
      }
    }, true);
    var lastQuestion = null;
    window.updateAudioButton = function () {
      var b = document.getElementById('audio-button');
      if (!b) return;
      b.setAttribute('aria-disabled', 'false');
      b.title = 'Listen to pronunciation';
      b.setAttribute('aria-label', 'Listen to pronunciation');
      try {
        var q = state.questions[state.index];
        if (!q || !q.arabic || mode !== 'ar-to-en' || q === lastQuestion) return;
        if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
        lastQuestion = q;
        setTimeout(function () { speak(clean(q.arabic)); }, 250);
      } catch (err) {}
    };
    window.updateAudioButton();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('#audio-button');
      if (!b) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        var q = state.questions[state.index];
        if (!q || !q.arabic) return;
        if (mode !== 'ar-to-en' && !state.answered) { showSnackbar('Answer first to hear it.'); return; }
        speak(clean(q.arabic));
      } catch (err) {}
    }, true);
  }

  function init() { initGlossary(); initQuiz(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
