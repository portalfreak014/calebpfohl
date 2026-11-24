import { parseGlossary, selectWords } from './chaos-vocabulary.js';
const $=id=>document.getElementById(id), panels=['setup','game','count','paused','results'];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
$('reduced').checked=motion.matches;$('calm').checked=motion.matches;
function effects(value){$('reduced').checked=value;$('calm').checked=value;document.body.classList.toggle('reduced',value||motion.matches);}
$('reduced').onchange=()=>effects($('reduced').checked);$('calm').onchange=()=>effects($('calm').checked);motion.addEventListener('change',()=>effects($('reduced').checked));effects(motion.matches);
const shuffle=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let state='setup',previous='game',deck=[],pool=[],index=0,streak=0,best=0,score=0,correct=0,missed=[],answered=false,countdown=null,effectTimer=null,roundDirection='ar';
const player=new Audio(new URL('./assets/running_in_the_nineties.mp3',import.meta.url).href);player.loop=true;player.preload='none';player.volume=.25;
let muted=false,musicAttempt=0;
function stopMusic(){musicAttempt++;player.pause();}
function music(){
  const attempt=++musicAttempt;
  if(muted||!['loading','count','game'].includes(state)){player.pause();return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
  player.play().then(()=>{if(!['loading','count','game'].includes(state)||muted){player.pause();return;}if(attempt===musicAttempt){$('audio-status').textContent='';$('audio-retry').hidden=true;}}).catch(error=>{if(attempt!==musicAttempt)return;$('audio-status').textContent=error.name==='NotAllowedError'?'Tap Play music to enable the soundtrack.':'Soundtrack could not play. Check your connection and retry.';$('audio-retry').hidden=false;});
}
$('audio-retry').onclick=music;
$('mute').onclick=()=>{muted=!muted;player.muted=muted;$('mute').textContent=muted?'Unmute music':'Mute music';$('mute').setAttribute('aria-pressed',String(muted));if(muted)stopMusic();else music();};
$('volume').oninput=()=>{player.volume=Number($('volume').value);};
function show(next){state=next;for(const id of panels)$(id).hidden=id!==next;document.body.classList.toggle('playing',next==='game'||next==='count');$('pause').hidden=!['game','count'].includes(next);if(!['game','count','loading'].includes(next))stopMusic();}
function clearEffects(){clearTimeout(effectTimer);$('reactions').replaceChildren();}
function reaction(){clearEffects();const node=document.createElement('div');node.className='reaction'+(streak>=5?' big':'');node.textContent=streak>=10?'VOCABULARY FINAL BOSS':streak>=5?'ABSOLUTE SCHOLAR':shuffle(['BRAIN HAS ENTERED THE CHAT','CERTIFIED WORD ENJOYER','KNOWLEDGE ACQUIRED','ACADEMIC JUMPSCARE'])[0];$('reactions').append(node);effectTimer=setTimeout(clearEffects,1100);}
function chapters(){const unit=window.UnitsManifest.getUnit($('unit').value);$('chapter').replaceChildren(new Option('All available chapters','all'),...unit.chapters.filter(c=>c.available).map(c=>new Option(c.title,c.id)));}
for(const id of window.UnitsManifest.listUnits())$('unit').add(new Option(window.UnitsManifest.getUnit(id).title,id));
$('unit').value='unit8';$('unit').onchange=chapters;chapters();
const cache=new Map();
async function vocabulary(unit,chapter){
  let parsed=cache.get(unit);
  if(!parsed){const response=await fetch(`data/glossary/${unit}-glossary.md`);if(!response.ok)throw new Error('Could not load this unit glossary');parsed=parseGlossary(await response.text());cache.set(unit,parsed);}
  const allowed=window.UnitsManifest.getAvailableChapters(unit).map(c=>c.id);
  return selectWords(parsed,chapter,allowed);
}
function reset(items){deck=shuffle(items).slice(0,Number($('length').value));index=0;streak=0;best=0;score=0;correct=0;missed=[];answered=false;clearEffects();count();}
function count(){clearInterval(countdown);show('count');let n=3;$('count-text').textContent=n;$('count-text').focus();music();if(document.hidden){pause();return;}countdown=setInterval(()=>{n--;if(n>0)$('count-text').textContent=n;else{clearInterval(countdown);countdown=null;question();}},1000);}
$('start').onclick=async()=>{
  if(state==='loading')return;
  const unit=$('unit').value,chapter=$('chapter').value;
  state='loading';$('start').disabled=true;$('unit').disabled=true;$('chapter').disabled=true;$('load').textContent='Loading vocabulary…';
  player.currentTime=0;music();
  try{const words=await vocabulary(unit,chapter);if(words.length<2)throw new Error('This selection needs at least two glossary entries');pool=words;roundDirection=$('direction').value;$('load').textContent='';reset(words);}
  catch(error){state='setup';stopMusic();$('load').textContent=error.message+'. Please retry or choose another chapter.';}
  finally{$('start').disabled=false;$('unit').disabled=false;$('chapter').disabled=false;}
};
function question(){
  show('game');answered=false;$('next').hidden=true;$('feedback').textContent='';const q=deck[index];
  $('score').textContent=`${index+1}/${deck.length} · ${score} points · ${streak} streak · Best ${best}`;
  const arabic=roundDirection==='ar',answer=arabic?q.english:q.arabic;
  $('prompt').textContent=arabic?q.arabic:q.english;$('prompt').lang=arabic?'ar':'en';$('prompt').dir='auto';
  const others=[...new Set(pool.filter(word=>word.arabic!==q.arabic&&word.english!==q.english).map(word=>arabic?word.english:word.arabic))];
  const options=shuffle([answer,...shuffle(others).slice(0,3)]);$('answers').replaceChildren();
  for(const text of options){const button=document.createElement('button');button.textContent=text;button.dir='auto';button.lang=arabic?'en':'ar';button.dataset.correct=String(text===answer);button.onclick=()=>answerQuestion(button,text===answer);$('answers').append(button);}
  $('prompt').focus();
}
function answerQuestion(button,yes){
  if(answered||state!=='game')return;answered=true;const q=deck[index];
  if(yes){streak++;correct++;best=Math.max(best,streak);score+=100+Math.min(streak-1,5)*20;reaction();}else{streak=0;missed.push(q);button.classList.add('wrong');}
  for(const item of $('answers').children){item.disabled=true;if(item.dataset.correct==='true')item.classList.add('correct');}
  $('feedback').textContent=yes?`Correct! ${streak} in a row.`:`Correct answer: ${roundDirection==='ar'?q.english:q.arabic}`;
  $('score').textContent=`${index+1}/${deck.length} · ${score} points · ${streak} streak · Best ${best}`;
  $('next').textContent=index+1===deck.length?'See results':'Next question';$('next').hidden=false;$('next').focus();
}
$('next').onclick=()=>{if(!answered||state!=='game')return;index++;if(index<deck.length)question();else finish();};
function finish(){show('results');clearEffects();$('summary').textContent=`${correct}/${deck.length} correct (${Math.round(correct/deck.length*100)}%) · ${score} points · Best streak ${best}`;$('misses').replaceChildren();for(const q of missed){const li=document.createElement('li');li.textContent=`${q.arabic} — ${q.english}`;li.dir='auto';$('misses').append(li);}$('retry').hidden=!missed.length;$('results-title').focus();}
$('retry').onclick=()=>{player.currentTime=0;reset([...missed]);};$('again').onclick=()=>{show('setup');$('start').focus();};
function pause(){if(!['game','count'].includes(state))return;previous=state;clearInterval(countdown);countdown=null;clearEffects();show('paused');$('resume').focus();}
$('pause').onclick=pause;$('resume').onclick=()=>{if(previous==='count')count();else{show('game');music();(answered?$('next'):$('prompt')).focus();}};
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state==='loading')stopMusic();else pause();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape')pause();});
window.addEventListener('pagehide',()=>{clearInterval(countdown);stopMusic();clearEffects();});
window.addEventListener('pageshow',event=>{if(event.persisted&&['game','count'].includes(state))pause();});
