'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const D=global.BuildLab.Data,A=D.V28_BALANCE_AUDIT;
assert(A&&A.version==='0.28');assert(A.adjustedCards.length>=15);assert(A.adjustedRelics.length>=10);assert(A.adjustedProtocols.length>=6);assert(A.adjustedTunings.length>=5);
// Two-condition / high-threshold cards must now have a meaningful success payoff.
for(const [id,clauses] of Object.entries(D.V27_CARD_RULES||{})){
  const c=clauses?.[0];if(!c)continue;const burden=D.conditionBurden(c.when);
  if(burden>=2.3)assert(c.mult>=1.52,`${id} high-burden payoff too low: burden=${burden}, mult=${c.mult}`);
}
// Hard relics sit above broad one-condition relics but below protocol/tuning ceilings.
for(const id of A.adjustedRelics){const c=D.V27_RELIC_RULES[id][0];assert(c.mult>=1.37&&c.mult<=1.46,id+' relic payoff outside audit band');}
for(const id of A.adjustedProtocols){const r=D.V27_PROTOCOL_RULES[id];assert(r.hit>=1.50&&r.miss<=.88,id+' protocol risk/reward too soft');}
for(const id of A.adjustedTunings){const r=D.V27_TUNING_RULES[id];assert(r.hit>=1.56&&r.miss<=.85,id+' tuning risk/reward too soft');}
// Ensure description and actual multiplier stay synchronized for adjusted cards.
for(const id of A.adjustedCards){const pct=Math.round((D.V27_CARD_RULES[id][0].mult-1)*100);assert(D.CARDS[id].desc.includes(`+${pct}%`),id+' description mismatch');}
// Key previously under-rewarded apex conditions are explicitly protected.
assert(D.V27_CARD_RULES.v27_apex_probe[0].mult>=1.70);assert(D.V27_CARD_RULES.v27_complex_probe[0].mult>=1.70);assert(D.V27_TUNING_RULES.v27_t_rune_opus.hit>=1.64);assert(D.V27_TUNING_RULES.v27_t_link_arcana.hit>=1.64);
console.log('PASS expansion28_balance_audit.test.js');
