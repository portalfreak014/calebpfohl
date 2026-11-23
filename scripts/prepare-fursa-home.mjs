import { readFile, writeFile } from 'node:fs/promises';

const file = 'arabic/arabic.html';
let html = await readFile(file, 'utf8');
if (html.includes('id="fursa-home-branding"')) {
  console.log('Fursa homepage already prepared.');
} else {
  function replaceRequired(pattern, replacement, label) {
    if (!html.match(pattern)) throw new Error(`Homepage structure changed: ${label}`);
    html = html.replace(pattern, replacement);
  }

  replaceRequired(/<title>[^<]*<\/title>/, '<title>Fursa | فرصة — Arabic study</title>', 'title');
  replaceRequired(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Fursa — your opportunity to improve with Arabic chapter quizzes, vocabulary, and study tools.">', 'description');
  replaceRequired(/<div class="mark" lang="ar">ع<\/div>/, `<div class="mark fursa-header-mark" aria-hidden="true">
          <img class="fursa-icon-light" src="assets/fursa-favicon-light.png" alt="" width="42" height="42">
          <img class="fursa-icon-dark" src="assets/fursa-favicon-dark.png" alt="" width="42" height="42">
        </div>`, 'header icon');

  replaceRequired(/<section class="hero">[\s\S]*?<\/section>/, `<section class="hero" aria-labelledby="fursa-title">
      <div class="fursa-hero-identity">
        <div class="fursa-logo-placeholder" role="img" aria-label="Space reserved for the Fursa logo">
          <span class="fursa-placeholder-door" aria-hidden="true"></span>
          <span class="fursa-placeholder-label" aria-hidden="true">Logo coming soon</span>
        </div>
        <div class="fursa-hero-copy">
          <h1 id="fursa-title"><span>Fursa</span><span class="fursa-wordmark-divider" aria-hidden="true"> | </span><span lang="ar" dir="rtl">فرصة</span></h1>
          <p class="fursa-tagline">Your opportunity to improve</p>
        </div>
      </div>
      <a class="button" id="start" href="#chapter-quizzes">
        Chapter quizzes
        <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
      </a>
    </section>`, 'hero');

  replaceRequired(/<section class="section">\s*<div class="heading">\s*<h2>Units<\/h2>/, '<section class="section" id="chapter-quizzes" aria-labelledby="chapter-quizzes-title">\n      <div class="heading">\n        <h2 id="chapter-quizzes-title">Chapter quizzes</h2>', 'chapter target');

  replaceRequired(/    function updateStartLink\(\) \{[\s\S]*?\n    \}\n\n    function render\(\)/, `    function updateStartLink() {
      start.href = '#chapter-quizzes';
    }

    function render()`, 'resume CTA override');

  const styles = `<style id="fursa-home-branding">
    .fursa-header-mark {overflow:hidden;background:transparent;}
    .fursa-header-mark img {display:block;width:42px;height:42px;object-fit:contain;border-radius:12px;}
    .fursa-header-mark .fursa-icon-dark {display:none;}
    html[data-theme=dark] .fursa-header-mark .fursa-icon-light {display:none;}
    html[data-theme=dark] .fursa-header-mark .fursa-icon-dark {display:block;}
    @media(prefers-color-scheme:dark) {
      html:not([data-theme]) .fursa-header-mark .fursa-icon-light {display:none;}
      html:not([data-theme]) .fursa-header-mark .fursa-icon-dark {display:block;}
    }
    .fursa-hero-identity {display:flex;align-items:center;gap:24px;}
    .fursa-hero-copy {min-width:0;}
    .hero #fursa-title {display:flex;align-items:baseline;flex-wrap:wrap;gap:.18em;max-width:none;margin:0 0 10px;font-size:clamp(2rem,7vw,3.25rem);line-height:1.35;letter-spacing:-.035em;}
    #fursa-title [lang=ar] {font-family:'Noto Sans Arabic',sans-serif;letter-spacing:normal;}
    .fursa-wordmark-divider {opacity:.5;font-weight:400;}
    .hero .fursa-tagline {font-size:clamp(.95rem,2.8vw,1.15rem);line-height:1.55;}
    .fursa-logo-placeholder {flex:0 0 104px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px 8px;border:1px dashed currentColor;border-radius:22px;background:rgb(255 255 255 / .08);}
    .fursa-placeholder-door {position:relative;display:block;width:32px;height:42px;border:2px solid currentColor;border-radius:3px;opacity:.6;}
    .fursa-placeholder-door::after {content:'';position:absolute;top:3px;right:-10px;width:20px;height:34px;border:2px solid currentColor;border-radius:2px;background:var(--pc);transform:skewY(-16deg);}
    .fursa-placeholder-label {font-size:.6rem;font-weight:600;text-align:center;line-height:1.4;opacity:.7;}
    #chapter-quizzes {scroll-margin-top:24px;}
    @media(max-width:480px) {
      .fursa-hero-identity {gap:14px;align-items:flex-start;}
      .fursa-logo-placeholder {flex-basis:68px;min-height:94px;padding:10px 5px;border-radius:16px;}
      .fursa-placeholder-label {font-size:.55rem;}
      .fursa-placeholder-door {width:25px;height:34px;}
      .fursa-placeholder-door::after {width:16px;height:27px;right:-8px;}
    }
    @media(prefers-reduced-motion:reduce) {html {scroll-behavior:auto!important;}}
  </style>`;
  replaceRequired(/<\/head>/, styles + '\n</head>', 'head closing tag');
  await writeFile(file, html);
  console.log('Prepared Fursa homepage branding and chapter quiz anchor.');
}
