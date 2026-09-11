import { SERIES_DEFINITIONS } from '../src/data/seriesDefinitions.js?v=4.8';
const rows=SERIES_DEFINITIONS.filter(s=>s.manufacturerId==='libido');
const fields=['summary','creatorIntent','companionAppeal','appealHook','signatureScene','creatorNonnegotiable','creatorQuirk','creatorFirstDecision','privateUsePriority','namingConcept','developmentBackground','engineeringNotes','trainingNotes','weaponDoctrine'];
const missing=[]; const unique={};
for(const f of fields){ const vals=rows.map(r=>r[f]); unique[f]=new Set(vals).size; rows.forEach(r=>{if(!r[f]) missing.push(`${r.id}:${f}`)}); }
const creators=new Set(rows.map(r=>r.creatorProfile?.creator).filter(Boolean));
const personalities=new Set(rows.map(r=>r.creatorProfile?.personality).filter(Boolean));
const obsessions=new Set(rows.map(r=>r.creatorProfile?.obsession).filter(Boolean));
const bodies=new Set(rows.map(r=>r.libidoBodyArchetypeId).filter(Boolean));
const ok=rows.length===226 && missing.length===0 && Object.values(unique).every(v=>v===226) && creators.size===226 && bodies.size>=15 && personalities.size>=15 && obsessions.size>=25;
console.log(JSON.stringify({ok,libido:rows.length,uniqueDescriptions:unique,uniqueCreators:creators.size,personalityPatterns:personalities.size,obsessionPatterns:obsessions.size,bodyArchetypes:bodies.size,missing:missing.length},null,2));
if(!ok) process.exit(1);
