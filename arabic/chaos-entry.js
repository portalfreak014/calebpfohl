if(!location.pathname.includes('chaos')){
  const style=document.createElement('style');style.textContent=`#fursa-chaos-entry{display:inline-grid;place-items:center;flex-shrink:0;width:36px;height:36px;margin-inline-start:auto;margin-inline-end:6px;border:1px solid #c5a9e5;border-radius:50%;background:linear-gradient(120deg,#6a429c,#2b827c,#9e4779,#6a429c);background-size:300% 300%;animation:fursa-shimmer 8s ease infinite;color:white;text-decoration:none;font:22px system-ui}#fursa-chaos-entry + #uad-theme-toggle{margin-inline-start:0}#fursa-chaos-entry:focus-visible{outline:3px solid var(--p,#6750a4);outline-offset:3px}@keyframes fursa-shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@media(prefers-reduced-motion:reduce){#fursa-chaos-entry{animation:none}}`;document.head.append(style);
  const link=document.createElement('a');link.id='fursa-chaos-entry';link.href=new URL('./chaos.html',import.meta.url).href;link.textContent='✦';link.title='Try Chaos Mode';link.setAttribute('aria-label','Try Chaos Mode — optional arcade quiz');
  function mount(){
    const theme=document.getElementById('uad-theme-toggle');
    if(theme&&link.nextElementSibling!==theme)theme.before(link);
  }
  mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
}
