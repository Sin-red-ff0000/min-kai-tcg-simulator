'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V30_CARD_IDS.length,12);assert.equal(D.V30_COMPOSITE_CARD_IDS.length,6);assert.equal(D.V30_STAGE_CARD_IDS.length,6);assert.equal(D.V30_RELIC_IDS.length,4);assert.equal(D.V30_PROTOCOL_IDS.length,2);assert.equal(D.V30_TUNING_IDS.length,2);
function battle(){return {turn:1,enemy:{traits:[],behaviors:[],status:{poison:0,burn:0,vulnerable:0,weak:0}},player:{hp:80,maxHp:80,block:0},discardedEver:{},linkComboCount:0,reshuffles:0,alchemy:{reactions:{}}};}
// composite adaptive: effect shape changes by combinations, not a simple multiplier.
let b=battle(),i={uid:'c1',cardId:'v30_cross_breaker'};b.enemy.traits=['armored','regenerative'];let c=D.resolveAdaptiveCard(D.CARDS[i.cardId],i,b);assert.equal(c.adaptiveMode,'armor_regen');assert.equal(c.armorPierce,.70);assert.equal(c.status.type,'burn');
b=battle();b.enemy.traits=['fast','berserk'];c=D.resolveAdaptiveCard(D.CARDS[i.cardId],i,b);assert.equal(c.adaptiveMode,'speed_assault');assert.equal(c.hits,3);assert.equal(c.block,7);
// three-stage alchemy growth can advance one stage at a time as thresholds are met.
i={uid:'s1',cardId:'v30_stage_forge'};b=battle();c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,0);assert.equal(c.name,'冷炉刃');b.alchemy.reactions={a:1,b:1};c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1);assert.equal(c.name,'熱炉刃');b.alchemy.reactions.c=1;b.alchemy.reactions.d=1;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,2);assert.equal(c.name,'星炉刃');b.alchemy.reactions={};assert.equal(D.resolveMultiStageCard(i,b,BL.Store.state).stage,2,'stage must not regress');
// archive growth is per-card-instance: discard once -> stage 2, then two uses -> stage 3.
i={uid:'s2',cardId:'v30_stage_archive'};b=battle();assert.equal(D.resolveMultiStageCard(i,b,BL.Store.state).stage,0);D.noteMultiStageDiscard(i,b);assert.equal(i.stage,1);D.noteMultiStageUse(i,b);assert.equal(i.stage,1);D.noteMultiStageUse(i,b);assert.equal(i.stage,2);
const other={uid:'s3',cardId:'v30_stage_archive'};assert.equal(D.resolveMultiStageCard(other,b,BL.Store.state).stage,0,'growth must be UID-local');
// adversity can climb through both thresholds and never fall back.
i={uid:'s4',cardId:'v30_stage_adversity'};b=battle();b.player.hp=55;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1);b.player.hp=30;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,2);b.player.hp=80;assert.equal(D.resolveMultiStageCard(i,b,BL.Store.state).stage,2);

// New cards execute through the real battle pipeline without ownership breakage.
for(const id of D.V30_CARD_IDS){
  BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill(id);BL.Store.state.enemy.hp=40;BL.Store.state.enemy.atk=1;BL.Store.state.enemy.def=1;BL.Store.state.enemy.spd=1;BL.Store.state.relics=[];
  const started=BL.Battle.create(false);assert(!started.error,'v30 battle start failed '+id);BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok,'v30 ownership invariant '+id);BL.Battle.retire();}
}
// Every new item has a visible unlock route.
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V30_CARD_IDS,...D.V30_RELIC_IDS,...D.V30_PROTOCOL_IDS,...D.V30_TUNING_IDS])assert(rewarded.has(id),'v30 item has no unlock route '+id);
// Composite branches and stage effects are structurally distinct.
for(const id of D.V30_COMPOSITE_CARD_IDS){const s=D.ADAPTIVE_CARDS[id];assert.equal(s.branches.length,3);assert.equal(new Set(s.branches.map(x=>JSON.stringify(x.patch))).size,3,id+' duplicate branch effects');}
for(const id of D.V30_STAGE_CARD_IDS){const s=D.MULTI_STAGE_CARDS[id];assert.equal(s.stages.length,3);assert.equal(s.checks.length,2);assert.equal(new Set(s.stages.map(x=>JSON.stringify({kind:x.kind,damage:x.damage,block:x.block,hits:x.hits,heal:x.heal}))).size,3,id+' stages not distinct');}
console.log('PASS expansion30_growth.test.js');
