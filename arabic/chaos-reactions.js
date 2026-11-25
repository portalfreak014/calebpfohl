import {MEME_FILES,REACTION_DURATION_MS} from './chaos-config.js';
const loaded=[];let previous=null,cleanup=null;
for(const name of MEME_FILES){
  if(typeof name!=='string'||!/^[\w .()-]+\.(png|jpe?g|webp|avif|gif)$/i.test(name))continue;
  const image=new Image();image.alt='';image.onload=()=>loaded.push({name,image});image.src=new URL('./assets/memes/'+name,import.meta.url).href;
}
export function clearReaction(){if(cleanup)cleanup();cleanup=null;}
export function playReaction(container,reduced){
  clearReaction();
  const candidates=loaded.filter(item=>item.name!==previous);
  const list=candidates.length?candidates:loaded;
  const selected=!reduced&&list.length?list[Math.floor(Math.random()*list.length)]:null;
  const node=document.createElement('div');node.className='reaction';node.style.animation='none';
  node.style.left='50%';node.style.top='50%';node.style.maxWidth='80vw';
  if(selected){previous=selected.name;const image=selected.image.cloneNode();image.style.cssText='display:block;width:clamp(140px,45vw,320px);max-width:75vw;max-height:45vh;object-fit:contain;border-radius:16px;box-shadow:0 8px 30px #0006';node.style.textShadow='none';node.append(image);}else node.textContent='nice';
  const tilt=Math.random()*36-18;
  const transform=(x,y,rotation,scale=1)=>`translate(-50%,-50%) translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scale})`;
  node.style.transform=transform(0,0,tilt);container.append(node);
  let animation=null;
  if(!reduced&&node.animate){
    const entry=Math.random()*Math.PI*2,exit=Math.random()*Math.PI*2;
    const radius=Math.hypot(innerWidth,innerHeight)*.65;
    const driftX=(Math.random()-.5)*100,driftY=(Math.random()-.5)*70;
    animation=node.animate([
      {opacity:0,transform:transform(Math.cos(entry)*radius,Math.sin(entry)*radius,tilt-12,.85),offset:0},
      {opacity:1,transform:transform(-driftX/2,-driftY/2,tilt,1),offset:.2},
      {opacity:1,transform:transform(driftX/2,driftY/2,tilt+6,1.04),offset:.75},
      {opacity:0,transform:transform(Math.cos(exit)*radius,Math.sin(exit)*radius,tilt+15,.9),offset:1}
    ],{duration:REACTION_DURATION_MS,easing:'ease-in-out',fill:'both'});
  }
  const timer=setTimeout(clearReaction,REACTION_DURATION_MS);
  cleanup=()=>{clearTimeout(timer);animation?.cancel();node.remove();};
}
