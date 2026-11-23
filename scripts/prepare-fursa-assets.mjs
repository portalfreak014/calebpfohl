import { readFile, writeFile } from 'node:fs/promises';
import { inflateSync, deflateSync } from 'node:zlib';

function decode(buffer) {
  if (buffer.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Brand source is not PNG');
  let width, height, channels;
  const data = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset+4, offset+8);
    const chunk = buffer.subarray(offset+8, offset+8+length);
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4);
      channels = chunk[9] === 6 ? 4 : chunk[9] === 2 ? 3 : 0;
      if (chunk[8] !== 8 || !channels || chunk[10] || chunk[11] || chunk[12]) throw new Error('Brand source requires non-interlaced 8-bit RGB/RGBA PNG');
    }
    if (type === 'IDAT') data.push(chunk);
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(data));
  const stride = width*channels;
  const pixels = Buffer.alloc(width*height*channels);
  const paeth = (a,b,c) => { const p=a+b-c, x=Math.abs(p-a), y=Math.abs(p-b), z=Math.abs(p-c); return x<=y && x<=z ? a : y<=z ? b : c; };
  for (let y=0; y<height; y++) {
    const filter = raw[y*(stride+1)];
    if (filter > 4) throw new Error('Unknown PNG filter');
    for (let x=0; x<stride; x++) {
      const i=y*stride+x, a=x>=channels ? pixels[i-channels] : 0, b=y ? pixels[i-stride] : 0, c=y && x>=channels ? pixels[i-stride-channels] : 0;
      pixels[i]=(raw[y*(stride+1)+1+x]+(filter===0 ? 0 : filter===1 ? a : filter===2 ? b : filter===3 ? Math.floor((a+b)/2) : paeth(a,b,c)))&255;
    }
  }
  return {width,height,channels,pixels};
}
function crc(buffer) {
  let value=0xffffffff;
  for (const byte of buffer) { value^=byte; for(let i=0;i<8;i++) value=(value>>>1)^((value&1) ? 0xedb88320 : 0); }
  return (value^0xffffffff)>>>0;
}
function chunk(type,data) {
  const body=Buffer.concat([Buffer.from(type),data]), out=Buffer.alloc(data.length+12);
  out.writeUInt32BE(data.length); body.copy(out,4); out.writeUInt32BE(crc(body),out.length-4); return out;
}
function encode(image) {
  const head=Buffer.alloc(13); head.writeUInt32BE(image.width); head.writeUInt32BE(image.height,4); head[8]=8; head[9]=6;
  const rows=Buffer.alloc((image.width*4+1)*image.height);
  for(let y=0;y<image.height;y++) image.pixels.copy(rows,y*(image.width*4+1)+1,y*image.width*4,(y+1)*image.width*4);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
function crop(source,box) {
  const [left,top,right,bottom]=box;
  const x0=Math.round(left*source.width/1536), y0=Math.round(top*source.height/1024);
  const width=Math.round(right*source.width/1536)-x0, height=Math.round(bottom*source.height/1024)-y0;
  const pixels=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const from=((y0+y)*source.width+x0+x)*source.channels, to=(y*width+x)*4;
    source.pixels.copy(pixels,to,from,from+3); pixels[to+3]=source.channels===4 ? source.pixels[from+3] : 255;
  }
  return {width,height,pixels};
}
function clearExterior(image) {
  const {width,height,pixels}=image, seen=new Uint8Array(width*height), queue=[];
  function visit(x,y) {
    if(x<0||y<0||x>=width||y>=height) return;
    const i=y*width+x, p=i*4;
    if(seen[i] || Math.min(pixels[p],pixels[p+1],pixels[p+2])<=230) return;
    seen[i]=1; queue.push(i); pixels[p+3]=0;
  }
  for(let x=0;x<width;x++) {visit(x,0);visit(x,height-1);}
  for(let y=0;y<height;y++) {visit(0,y);visit(width-1,y);}
  for(let n=0;n<queue.length;n++) {const i=queue[n],x=i%width,y=Math.floor(i/width); visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}
}
function roundTile(image) {
  const {width,height,pixels}=image, scale=Math.min(width/314,height/312), inset=2*scale, r=44*scale;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const dx=Math.max(inset+r-(x+.5),0,(x+.5)-(width-inset-r));
    const dy=Math.max(inset+r-(y+.5),0,(y+.5)-(height-inset-r));
    const alpha=Math.max(0,Math.min(1,r-Math.hypot(dx,dy)+.5));
    const i=(y*width+x)*4+3; pixels[i]=Math.round(pixels[i]*alpha);
  }
}
const source=decode(await readFile('arabic/assets/fursabranding.png'));
if(Math.abs(source.width/source.height-1.5)>.02) throw new Error('Brand sheet layout changed; review crop coordinates');
const logo=crop(source,[196,157,493,490]); clearExterior(logo);
await writeFile('arabic/assets/fursa-logo.png',encode(logo));
for(const [theme,box] of [['light',[402,610,716,922]],['dark',[820,610,1135,922]]]) {
  const tile=crop(source,box); roundTile(tile);
  await writeFile('arabic/assets/fursa-favicon-'+theme+'.png',encode(tile));
}
const homeFile='scripts/prepare-fursa-home.mjs';
let home=await readFile(homeFile,'utf8');
const placeholder=/<div class="fursa-logo-placeholder"[\s\S]*?<\/div>/;
if(placeholder.test(home)) home=home.replace(placeholder,'<img class="fursa-hero-logo" src="assets/fursa-logo.png?v=2" alt="" width="297" height="333">');
else if(!home.includes('class="fursa-hero-logo"')) throw new Error('Hero placeholder structure changed');
if(!home.includes('.fursa-hero-logo {')) home=home.replace('.fursa-hero-copy {', '.fursa-hero-logo {display:block;flex:0 0 auto;width:clamp(68px,16vw,104px);height:auto;object-fit:contain;}\n    .fursa-hero-copy {');
home=home.replaceAll('fursa-favicon-light.png"','fursa-favicon-light.png?v=2"').replaceAll('fursa-favicon-dark.png"','fursa-favicon-dark.png?v=2"');
await writeFile(homeFile,home);
const faviconFile='arabic/favicon.js';
let favicon=await readFile(faviconFile,'utf8');
favicon=favicon.replace(/fursa-favicon-(light|dark)\.png(?:\?v=\d+)?/g,'fursa-favicon-$1.png?v=2');
await writeFile(faviconFile,favicon);
console.log('Extracted Fursa door logo and regenerated transparent-corner icons from the original brand sheet.');
