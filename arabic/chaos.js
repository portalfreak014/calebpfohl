const $ = id => document.getElementById(id);
const panels = ['setup','game','count','paused','results'];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
$('reduced').checked = motion.matches;
function effects() { document.body.classList.toggle('reduced', $('reduced').checked || motion.matches); }
$('reduced').onchange = effects; motion.addEventListener('change', effects); effects();
const shuffle = values => {const a = [...values]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;};
let state='setup', previous='game', deck=[], index=0, streak=0, best=0, score=0, correct=0, missed=[], answered=false, countdown=null, effectTimer=null;
let context=null, gain=null, beat=null, step=0, localUrl=null;
const player = new Audio(); player.loop=true;
function stopMusic(){clearInterval(beat);beat=null;player.pause();if(gain&&context)gain.gain.setValueAtTime(0,context.currentTime);}
function music(){
  stopMusic();
  if(!$('music').checked || !['count','game'].includes(state))return;
  const volume=Number($('volume').value);player.volume=volume;
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
  if(localUrl){player.play().catch(()=>{$('audio-status').textContent='Music was blocked. Toggle Music to retry; the quiz still works.';});return;}
  try{
    if(!context){const AC=window.AudioContext||window.webkitAudioContext;context=new AC();gain=context.createGain();gain.connect(context.destination);}
    context.resume().catch(()=>{$('audio-status').textContent='Audio unavailable. You can still play muted.';});
    gain.gain.setValueAtTime(volume*.35,context.currentTime);
    const notes=[130.81,130.81,196,164.81,146.83,146.83,220,196,110,110,164.81,146.83,98,146.83,196,146.83];
    beat=setInterval(()=>{if(context.state!=='running')return;const t=context.currentTime;const oscillator=context.createOscillator(), envelope=context.createGain();oscillator.type=step%4===0?'triangle':'square';oscillator.frequency.value=notes[step%notes.length]*(step%2?2:1);envelope.gain.setValueAtTime(.3,t);envelope.gain.exponentialRampToValueAtTime(.001,t+.09);oscillator.connect(envelope);envelope.connect(gain);oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};oscillator.start(t);oscillator.stop(t+.1);step++;},100);
  }catch{$('audio-status').textContent='Synth audio is unavailable. Choose a local track or play muted.';}
}
$('music').onchange=music; $('volume').oninput=()=>{player.volume=Number($('volume').value);if(gain&&context)gain.gain.setValueAtTime(Number($('volume').value)*.35,context.currentTime);};
$('track').onchange=()=>{stopMusic();if(localUrl)URL.revokeObjectURL(localUrl);localUrl=$('track').files[0]?URL.createObjectURL($('track').files[0]):null;if(localUrl)player.src=localUrl;else player.removeAttribute('src');};
function show(next){state=next;for(const id of panels)$(id).hidden=id!==next;document.body.classList.toggle('playing',next==='game'||next==='count');$('pause').hidden=!['game','count'].includes(next);if(!['game','count'].includes(next))stopMusic();}
function clearEffects(){clearTimeout(effectTimer);$('reactions').replaceChildren();}
function reaction(){clearEffects();const node=document.createElement('div');node.className='reaction'+(streak>=5?' big':'');node.textContent=streak>=10?'VOCABULARY FINAL BOSS':streak>=5?'ABSOLUTE SCHOLAR':shuffle(['BRAIN HAS ENTERED THE CHAT','CERTIFIED WORD ENJOYER','KNOWLEDGE ACQUIRED','ACADEMIC JUMPSCARE'])[0];$('reactions').append(node);effectTimer=setTimeout(clearEffects,1100);}
function chapters(){const unit=window.UnitsManifest.getUnit($('unit').value);$('chapter').replaceChildren(new Option('All available chapters','all'),...unit.chapters.filter(c=>c.available).map(c=>new Option(c.title,c.id)));}
for(const id of window.UnitsManifest.listUnits())$('unit').add(new Option(window.UnitsManifest.getUnit(id).title,id));
$('unit').value='unit8';$('unit').onchange=chapters;chapters();
function reset(items){deck=shuffle(items).slice(0,Number($('length').value));index=0;streak=0;best=0;score=0;correct=0;missed=[];answered=false;clearEffects();count();}
function count(){clearInterval(countdown);show('count');let n=3;$('count-text').textContent=n;$('count-text').focus();music();countdown=setInterval(()=>{n--;if(n>0)$('count-text').textContent=n;else{clearInterval(countdown);countdown=null;question();}},1000);}
$('start').onclick=async()=>{
  $('start').disabled=true;$('load').textContent='Loading vocabulary…';
  try{
    const response=await fetch(`data/${$('unit').value}.json`);if(!response.ok)throw new Error('Vocabulary file unavailable');const data=await response.json();
    const list=Object.entries(data.chapters||{}).filter(([id])=>$('chapter').value==='all'||id===$('chapter').value).flatMap(([,chapter])=>chapter.questions||[]);
    const valid=list.filter(q=>typeof q.arabic==='string'&&q.choices&&typeof q.choices[q.answer]==='string'&&new Set(Object.values(q.choices)).size>=2);
    if(!valid.length)throw new Error('No compatible vocabulary found for this selection');
    $('load').textContent='';reset(valid);
  }catch(error){$('load').textContent=error.message+'. Try another chapter.';}finally{$('start').disabled=false;}
};
function question(){
  show('game');answered=false;$('next').hidden=true;$('feedback').textContent='';const q=deck[index];
  $('score').textContent=`${index+1}/${deck.length} · ${score} points · ${streak} streak · Best ${best}`;
  $('prompt').textContent=$('direction').value==='ar'?q.arabic:q.choices[q.answer];$('prompt').lang=$('direction').value==='ar'?'ar':'en';$('prompt').dir='auto';
  const options=$('direction').value==='ar'?shuffle([...new Set(Object.values(q.choices))]).map(text=>({text,correct:text===q.choices[q.answer]})):shuffle([{text:q.arabic,correct:true},...shuffle([...new Set(deck.map(item=>item.arabic))].filter(text=>text!==q.arabic)).slice(0,3).map(text=>({text,correct:false}))]);
  $('answers').replaceChildren();
  for(const option of options){const button=document.createElement('button');button.textContent=option.text;button.dir='auto';button.lang=$('direction').value==='ar'?'en':'ar';button.dataset.correct=String(option.correct);button.onclick=()=>answer(button,option.correct);$('answers').append(button);}
  $('prompt').focus();
}
function answer(button,yes){
  if(answered||state!=='game')return;answered=true;const q=deck[index];
  if(yes){streak++;correct++;best=Math.max(best,streak);score+=100+Math.min(streak-1,5)*20;reaction();}else{streak=0;missed.push(q);button.classList.add('wrong');}
  for(const item of $('answers').children){item.disabled=true;if(item.dataset.correct==='true')item.classList.add('correct');}
  $('feedback').textContent=yes?`Correct! ${streak} in a row.`:`Correct answer: ${$('direction').value==='ar'?q.choices[q.answer]:q.arabic}`;
  $('score').textContent=`${index+1}/${deck.length} · ${score} points · ${streak} streak · Best ${best}`;
  $('next').textContent=index+1===deck.length?'See results':'Next question';$('next').hidden=false;$('next').focus();
}
$('next').onclick=()=>{if(!answered||state!=='game')return;index++;if(index<deck.length)question();else finish();};
function finish(){show('results');clearEffects();$('summary').textContent=`${correct}/${deck.length} correct (${Math.round(correct/deck.length*100)}%) · ${score} points · Best streak ${best}`;$('misses').replaceChildren();for(const q of missed){const li=document.createElement('li');li.textContent=`${q.arabic} — ${q.choices[q.answer]}`;li.dir='auto';$('misses').append(li);}$('retry').hidden=!missed.length;$('results-title').focus();}
$('retry').onclick=()=>reset([...missed]);$('again').onclick=()=>{show('setup');$('start').focus();};
function pause(){if(!['game','count'].includes(state))return;previous=state;clearInterval(countdown);countdown=null;clearEffects();show('paused');$('resume').focus();}
$('pause').onclick=pause;$('resume').onclick=()=>{if(previous==='count')count();else{show('game');music();(answered?$('next'):$('prompt')).focus();}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')pause();});
window.addEventListener('pagehide',()=>{clearInterval(countdown);stopMusic();clearEffects();if(context)context.suspend().catch(()=>{});});
