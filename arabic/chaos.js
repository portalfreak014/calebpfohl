import {parseGlossary,selectWords} from './chaos-vocabulary.js';
const $=id=>document.getElementById(id),panels=['setup','count','game','results'];
const motion=matchMedia('(prefers-reduced-motion: reduce)');$('reduced').checked=motion.matches;
function effects(){document.body.classList.toggle('reduced',$('reduced').checked||motion.matches);}
$('reduced').onchange=effects;motion.addEventListener('change',effects);effects();
const shuffle=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let state='setup',unit=null,deck=[],pool=[],index=0,streak=0,best=0,score=0,correct=0,missed=[],answered=false,countdown=null,effectTimer=null,advanceTimer=null,questionTimer=null,frame=null,deadline=0;
const cache=new Map(),player=new Audio(new URL('./assets/running_in_the_nineties.mp3',import.meta.url).href);player.loop=true;player.preload='none';player.volume=.25;
let musicAttempt=0;
function music(){const attempt=++musicAttempt;try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}player.play().then(()=>{if(attempt===musicAttempt){$('audio-status').textContent='';$('audio-retry').hidden=true;}}).catch(()=>{if(attempt!==musicAttempt)return;$('audio-status').textContent='Tap Play music to retry the soundtrack.';$('audio-retry').hidden=false;});}
$('audio-retry').onclick=music;
$('mute').onclick=()=>{player.muted=!player.muted;$('mute').textContent=player.muted?'Unmute music':'Mute music';$('mute').setAttribute('aria-pressed',String(player.muted));};
$('volume').oninput=()=>{const value=Number($('volume').value);player.volume=value;$('volume').style.setProperty('--fill',`${value*100}%`);$('volume-value').textContent=`${Math.round(value*100)}%`;};
function clearQuestion(){clearTimeout(questionTimer);questionTimer=null;cancelAnimationFrame(frame);frame=null;}
function clearAdvance(){clearTimeout(advanceTimer);advanceTimer=null;}
function clearEffects(){clearTimeout(effectTimer);$('reactions').replaceChildren();}
function show(next){state=next;for(const id of panels)$(id).hidden=id!==next;}
function reaction(){clearEffects();const node=document.createElement('div');node.className='reaction';node.textContent='nice';$('reactions').append(node);effectTimer=setTimeout(clearEffects,1600);}
function chooseUnits(){clearQuestion();clearAdvance();clearInterval(countdown);clearEffects();show('setup');$('units').hidden=false;$('chapter-panel').hidden=true;$('setup-title').textContent='Choose a unit';$('load').textContent='';$('setup-title').focus();}
function chooseUnit(id){unit=id;$('units').hidden=true;$('chapter-panel').hidden=false;$('setup-title').textContent=`Unit ${id.replace('unit','')}`;$('chapters').replaceChildren();
  for(const chapter of window.UnitsManifest.getAvailableChapters(id)){const button=document.createElement('button');button.type='button';button.textContent=chapter.number;button.setAttribute('aria-label',chapter.title);button.onclick=()=>start(chapter.id);$('chapters').append(button);}
  const all=document.createElement('button');all.textContent='All';all.setAttribute('aria-label','All chapters in this unit');all.onclick=()=>start('all');$('chapters').append(all);$('setup-title').focus();}
for(const id of window.UnitsManifest.listUnits()){const button=document.createElement('button');button.type='button';button.textContent=id.replace('unit','');button.setAttribute('aria-label',`Unit ${button.textContent}`);button.onclick=()=>chooseUnit(id);$('units').append(button);}
$('back').onclick=chooseUnits;
async function vocabulary(selectedUnit,chapter){let parsed=cache.get(selectedUnit);if(!parsed){const response=await fetch(`data/glossary/${selectedUnit}-glossary.md`);if(!response.ok)throw new Error('Could not load this glossary');parsed=parseGlossary(await response.text());cache.set(selectedUnit,parsed);}return selectWords(parsed,chapter,window.UnitsManifest.getAvailableChapters(selectedUnit).map(c=>c.id));}
async function start(chapter){if(state==='loading')return;state='loading';const selectedUnit=unit;for(const button of $('setup').querySelectorAll('button'))button.disabled=true;$('load').textContent='Loading…';music();try{const words=await vocabulary(selectedUnit,chapter);if(words.length<2)throw new Error('This selection needs at least two words');pool=words;$('load').textContent='';reset(words);}catch(error){show('setup');$('load').textContent=error.message+'. Please retry.';}finally{for(const button of $('setup').querySelectorAll('button'))button.disabled=false;}}
function reset(items){clearQuestion();clearAdvance();clearEffects();clearInterval(countdown);deck=shuffle(items).slice(0,20);index=0;streak=0;best=0;score=0;correct=0;missed=[];answered=false;show('count');let n=3;$('count-text').textContent=n;$('count-text').focus();countdown=setInterval(()=>{n--;if(n>0)$('count-text').textContent=n;else{clearInterval(countdown);countdown=null;question();}},1000);}
function scoreText(){ $('score').textContent=`${index+1}/${deck.length} · ${score} points · ${streak} streak · Best ${best}`; }
function clock(){frame=null;if(state!=='game'||answered)return;const remaining=Math.max(0,deadline-performance.now());$('clock').textContent=(remaining/1000).toFixed(3);$('clock').classList.toggle('urgent',remaining<=3000);if(remaining<=0){settle(null,false,true);return;}frame=requestAnimationFrame(clock);}
function expire(){if(state!=='game'||answered)return;const remaining=deadline-performance.now();if(remaining>0){questionTimer=setTimeout(expire,remaining);return;}settle(null,false,true);}
function question(){clearQuestion();clearAdvance();show('game');answered=false;$('feedback').textContent='';const q=deck[index];scoreText();$('prompt').textContent=q.arabic;$('prompt').lang='ar';$('prompt').dir='auto';
  const others=[...new Set(pool.filter(word=>word.arabic!==q.arabic&&word.english!==q.english).map(word=>word.english))];$('answers').replaceChildren();
  for(const text of shuffle([q.english,...shuffle(others).slice(0,3)])){const button=document.createElement('button');button.textContent=text;button.dir='auto';button.dataset.correct=String(text===q.english);button.onclick=()=>{if(state!=='game'||answered)return;if(performance.now()>=deadline)settle(null,false,true);else settle(button,text===q.english,false);};$('answers').append(button);}
  $('clock').textContent='5.000';$('clock').classList.remove('urgent');$('prompt').focus();deadline=performance.now()+5000;questionTimer=setTimeout(expire,5000);frame=requestAnimationFrame(clock);}
function advance(){clearAdvance();if(state!=='game'||!answered)return;index++;if(index<deck.length)question();else finish();}
function scheduleAdvance(){clearAdvance();advanceTimer=setTimeout(advance,500);}
function settle(button,yes,timedOut){if(answered||state!=='game')return;answered=true;clearQuestion();const q=deck[index];if(timedOut)$('clock').textContent='0.000';else $('clock').textContent=(Math.max(0,deadline-performance.now())/1000).toFixed(3);$('clock').classList.remove('urgent');
  if(yes){streak++;correct++;best=Math.max(best,streak);score+=100+Math.min(streak-1,5)*20;reaction();}else{clearEffects();streak=0;missed.push(q);if(button)button.classList.add('wrong');}
  for(const item of $('answers').children){item.disabled=true;if(item.dataset.correct==='true')item.classList.add('correct');}
  $('feedback').textContent=yes?`Correct! ${streak} in a row.`:`${timedOut?"Time's up. ":''}Correct answer: ${q.english}`;scoreText();$('feedback').focus();scheduleAdvance();}
function finish(){clearQuestion();clearAdvance();clearEffects();show('results');$('summary').textContent=`${correct}/${deck.length} correct (${Math.round(correct/deck.length*100)}%) · ${score} points · Best streak ${best}`;$('misses').replaceChildren();for(const q of missed){const li=document.createElement('li');li.textContent=`${q.arabic} — ${q.english}`;li.dir='auto';$('misses').append(li);}$('retry').hidden=!missed.length;$('results-title').focus();}
$('retry').onclick=()=>{music();reset([...missed]);};$('again').onclick=chooseUnits;
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='game'&&!answered){cancelAnimationFrame(frame);clock();}});
window.addEventListener('pagehide',()=>{clearQuestion();clearAdvance();clearInterval(countdown);clearEffects();musicAttempt++;player.pause();});
window.addEventListener('pageshow',event=>{if(!event.persisted)return;if(state==='game'){if(answered)scheduleAdvance();else clock();}else if(state==='count'){question();}music();});
