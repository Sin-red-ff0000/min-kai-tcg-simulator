'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V29_CARD_IDS.length,12);assert.equal(D.V29_ADAPTIVE_CARD_IDS.length,8);assert.equal(D.V29_DUAL_CARD_IDS.length,4);assert.equal(D.V29_RELIC_IDS.length,6);assert.equal(D.V29_PROTOCOL_IDS.length,4);assert.equal(D.V29_TUNING_IDS.length,4);assert.equal(Object.keys(D.DUAL_FACE_CARDS).length,16);
function battle(traits=[],behaviors=[]){return {turn:2,enemy:{traits,behaviors,status:{poison:0,burn:0,vulnerable:0,weak:0}},player:{hp:40,maxHp:80,block:0},discardedEver:{},linkComboCount:0,alchemy:{reactions:{}}};}
let inst={uid:'x1',cardId:'v29_analyze_edge'};
let c=D.resolveAdaptiveCard(D.CARDS[inst.cardId],inst,battle(['armored']));assert.equal(c.adaptiveMode,'armor');assert.equal(c.damage,15);assert.equal(c.armorPierce,.65);
c=D.resolveAdaptiveCard(D.CARDS[inst.cardId],inst,battle(['regenerative']));assert.equal(c.adaptiveMode,'regen');assert.equal(c.status.type,'burn');assert.equal(c.status.amount,4);
c=D.resolveAdaptiveCard(D.CARDS[inst.cardId],inst,battle(['berserk']));assert.equal(c.adaptiveMode,'assault');assert.equal(c.heal,3);
inst={uid:'x2',cardId:'v29_behavior_edge'};c=D.resolveAdaptiveCard(D.CARDS[inst.cardId],inst,battle([],['bh_regen_armor']));assert.equal(c.adaptiveMode,'guard');assert.equal(c.armorPierce,1);
// dual pressure
inst={uid:'d1',cardId:'v29_dual_pressure'};let b=battle();b.player.block=19;assert.equal(D.resolveDualFaceCard(inst,b).face,'front');b.player.block=20;assert.equal(D.resolveDualFaceCard(inst,b).face,'back');b.player.block=0;assert.equal(D.resolveDualFaceCard(inst,b).face,'back');
// dual residue uses instance UID rather than a global discard count
inst={uid:'d2',cardId:'v29_dual_residue'};b=battle();b.discardedEver.other=true;assert.equal(D.resolveDualFaceCard(inst,b).face,'front');b.discardedEver.d2=true;assert.equal(D.resolveDualFaceCard(inst,b).face,'back');
// reactor transforms only after three distinct reactions
inst={uid:'d3',cardId:'v29_dual_reactor'};b=battle();b.alchemy.reactions={a:1,b:1};assert.equal(D.resolveDualFaceCard(inst,b).face,'front');b.alchemy.reactions.c=1;assert.equal(D.resolveDualFaceCard(inst,b).face,'back');
// all v29 content has unlock routes
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V29_CARD_IDS,...D.V29_RELIC_IDS,...D.V29_PROTOCOL_IDS,...D.V29_TUNING_IDS])assert(rewarded.has(id),'v29 item has no unlock route '+id);
// adaptive cards must actually expose multiple distinct effect shapes, not just multipliers.
for(const id of D.V29_ADAPTIVE_CARD_IDS){const s=D.ADAPTIVE_CARDS[id];assert(s.branches.length>=3,id+' lacks branches');const sig=new Set(s.branches.map(x=>JSON.stringify(x.patch)));assert(sig.size>=3,id+' branches are not distinct');}
// no exact description duplicates involving v29 additions.
for(const [label,obj] of [['cards',D.CARDS],['relics',D.RELICS],['protocols',D.PROTOCOLS],['tunings',D.TUNINGS]]){const map=new Map();for(const [id,x] of Object.entries(obj)){const d=(x.desc||'').trim();if(!d)continue;if(!map.has(d))map.set(d,[]);map.get(d).push(id);}const dup=[...map.values()].filter(ids=>ids.length>1&&ids.some(id=>id.startsWith('v29_')));assert.equal(dup.length,0,`${label} v29 duplicate descriptions ${JSON.stringify(dup)}`);}
console.log('PASS expansion29_adaptive.test.js');
