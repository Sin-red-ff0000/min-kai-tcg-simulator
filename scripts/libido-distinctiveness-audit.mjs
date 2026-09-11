import { SERIES_DEFINITIONS } from '../src/data/seriesDefinitions.js?v=4.8';
const rows=SERIES_DEFINITIONS.filter(s=>s.manufacturerId==='libido');
const fields=['creatorIntent','companionAppeal','appealHook','signatureScene','creatorNonnegotiable','creatorQuirk','creatorFirstDecision','privateUsePriority'];
function bigrams(s=''){ const t=String(s).replace(/\s+/g,''); const set=new Set(); for(let i=0;i<t.length-1;i++) set.add(t.slice(i,i+2)); return set; }
function jaccard(a,b){ const A=bigrams(a),B=bigrams(b); let inter=0; for(const x of A) if(B.has(x)) inter++; const u=A.size+B.size-inter; return u?inter/u:0; }
let max=0,pair=null; const combined=rows.map(r=>fields.map(f=>r[f]??'').join(' '));
for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++){ const v=jaccard(combined[i],combined[j]); if(v>max){max=v;pair=[rows[i].id,rows[j].id];} }
const uniqueByField=Object.fromEntries(fields.map(f=>[f,new Set(rows.map(r=>r[f])).size]));
const hooks=new Set(rows.map(r=>r.creatorProfile?.appealHook).filter(Boolean));
const scenes=new Set(rows.map(r=>r.creatorProfile?.signatureScene).filter(Boolean));
const nonneg=new Set(rows.map(r=>r.creatorProfile?.nonnegotiable).filter(Boolean));
const quirks=new Set(rows.map(r=>r.creatorProfile?.quirk).filter(Boolean));
const ok=rows.length===226 && Object.values(uniqueByField).every(v=>v===226) && hooks.size>=15 && scenes.size>=15 && nonneg.size>=15 && quirks.size>=15 && max<0.70;
console.log(JSON.stringify({ok,libido:rows.length,uniqueByField,sourcePools:{hooks:hooks.size,scenes:scenes.size,nonneg:nonneg.size,quirks:quirks.size},maxSimilarity:Number(max.toFixed(3)),closestPair:pair},null,2));
if(!ok) process.exit(1);
