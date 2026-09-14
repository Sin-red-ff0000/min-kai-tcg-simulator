'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V31_STAGE_CARD_IDS.length,6);assert.equal(D.V31_RELIC_IDS.length,6);assert.equal(D.V31_PROTOCOL_IDS.length,3);assert.equal(D.V31_TUNING_IDS.length,3);
function battle(){return {turn:1,enemy:{traits:[],behaviors:[],status:{poison:0,burn:0,vulnerable:0,weak:0}},player:{hp:80,maxHp:80,block:0},discardedEver:{},linkComboCount:0,reshuffles:0,alchemy:{reactions:{},stock:{},used:{}}};}
// Each choice-growth card has a meaningful stage 2 and a distinct stage 3, rather than monotonic same-role scaling.
for(const id of D.V31_STAGE_CARD_IDS){const s=D.MULTI_STAGE_CARDS[id];assert(s.choiceGrowth,id+' missing choiceGrowth');assert.equal(s.stages.length,3);assert(s.stages[1].stageRole&&s.stages[2].stageRole,id+' missing stage roles');assert.notEqual(s.stages[1].stageRole,s.stages[2].stageRole,id+' stage roles must differ');}
// Cycle card can deliberately stay at stage 2 until a third reshuffle.
let i={uid:'cg1',cardId:'v31_stage_tempered'},b=battle();b.reshuffles=1;let c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1);assert.equal(c.name,'靭性刃');assert(c.holdable);b.reshuffles=2;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1,'should be able to hold middle stage');b.reshuffles=3;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,2);assert.equal(c.name,'焼入刃');assert(!c.holdable);
// Link card similarly holds at 1-3 combos and commits at 4.
i={uid:'cg2',cardId:'v31_stage_link_guard'};b=battle();b.linkComboCount=1;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1);assert.equal(c.stageRole,'迎撃維持');b.linkComboCount=3;assert.equal(D.resolveMultiStageCard(i,b,BL.Store.state).stage,1);b.linkComboCount=4;assert.equal(D.resolveMultiStageCard(i,b,BL.Store.state).stage,2);
// Discard card growth remains UID-local.
i={uid:'cg3',cardId:'v31_stage_discard_memory'};b=battle();D.noteMultiStageDiscard(i,b);assert.equal(i.stage,1);const other={uid:'cg4',cardId:'v31_stage_discard_memory'};assert.equal(D.resolveMultiStageCard(other,b,BL.Store.state).stage,0);D.noteMultiStageUse(i,b);D.noteMultiStageUse(i,b);assert.equal(i.stage,1);D.noteMultiStageUse(i,b);assert.equal(i.stage,2);
// Every new item has an unlock route.
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V31_STAGE_CARD_IDS,...D.V31_RELIC_IDS,...D.V31_PROTOCOL_IDS,...D.V31_TUNING_IDS])assert(rewarded.has(id),'v31 item has no unlock route '+id);
// Execute every card through the real battle pipeline and preserve ownership.
for(const id of D.V31_STAGE_CARD_IDS){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill(id);BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=1;BL.Store.state.enemy.def=1;BL.Store.state.enemy.spd=1;const start=BL.Battle.create(false);assert(!start.error,'start failed '+id);BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok,'ownership fail '+id);BL.Battle.retire();}}
console.log('PASS expansion31_choice_growth.test.js');
