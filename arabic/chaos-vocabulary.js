export function parseGlossary(markdown){
  const chapters={};let chapter=null;
  for(const raw of markdown.replace(/\r/g,'').split('\n')){
    const line=raw.trim();const heading=line.match(/^##\s+Chapter\s+(\d+)\s*$/i);
    if(heading){chapter='ch'+Number(heading[1]);chapters[chapter]||=[];continue;}
    if(/^##\s/.test(line)){chapter=null;continue;}
    if(!chapter||!line.startsWith('|'))continue;
    const cells=line.split('|').slice(1,-1).map(cell=>cell.trim());
    if(cells.length<2||/^Arabic$/i.test(cells[0])||/^:?-+:?$/.test(cells[0].replace(/\s/g,'')))continue;
    if(cells[0]&&cells[1])chapters[chapter].push({arabic:cells[0],english:cells[1]});
  }
  return chapters;
}
export function selectWords(chapters,selection,allowed){
  const seen=new Set();return Object.entries(chapters).filter(([id])=>allowed.includes(id)&&(selection==='all'||selection===id)).flatMap(([,words])=>words).filter(word=>{const key=JSON.stringify([word.arabic,word.english]);if(seen.has(key))return false;seen.add(key);return true;});
}
