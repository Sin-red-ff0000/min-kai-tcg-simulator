'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V32_BRANCH_CARD_IDS.length,6);assert.equal(D.V32_RELIC_IDS.length,6);assert.equal(D.V32_PROTOCOL_IDS.length,3);assert.equal(D.V32_TUNING_IDS.length,3);
function battle(){return {turn:1,enemy:{traits:[],behaviors:[],status:{poison:0,burn:0,vulnerable:0,weak:0}},player:{hp:80,maxHp:80,block:0},discardedEver:{},discardedThisTurn:0,linkComboCount:0,reshuffles:0,alchemy:{reactions:{},stock:{},used:{}}};}
for(const id of D.V32_BRANCH_CARD_IDS){const s=D.BRANCH_STAGE_CARDS[id];assert(s,id+' missing branch spec');assert.equal(s.branches.length,2);assert.notEqual(s.branches[0].face.name,s.branches[1].face.name);}
// Forge: same middle stage can become two different final forms, and branch is locked per UID.
let i={uid:'b1',cardId:'v32_branch_forge'},b=battle();b.alchemy.reactions={a:true,b:true};let c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,1);assert.equal(c.name,'鍛造芯');b.player.block=20;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.stage,2);assert.equal(c.name,'城塞刃');assert.equal(i.branch,'fortress');b.player.block=0;b.linkComboCount=5;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.name,'城塞刃','branch must stay locked');
let j={uid:'b2',cardId:'v32_branch_forge'},b2=battle();b2.alchemy.reactions={a:true,b:true};D.resolveMultiStageCard(j,b2,BL.Store.state);b2.linkComboCount=3;c=D.resolveMultiStageCard(j,b2,BL.Store.state);assert.equal(c.name,'連星刃');assert.equal(j.branch,'stars');assert.notEqual(i.branch,j.branch,'same card id must branch per instance');
// Arcana has mutually exclusive final roles.
BL.Store.state.arcana={id:'fool',orientation:'upright'};i={uid:'a1',cardId:'v32_branch_arcana'};b=battle();b.turn=2;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.name,'守護秘儀');
BL.Store.state.arcana={id:'fool',orientation:'reversed'};j={uid:'a2',cardId:'v32_branch_arcana'};b=battle();b.turn=2;c=D.resolveMultiStageCard(j,b,BL.Store.state);assert.equal(c.name,'破戒秘儀');
// Adversity can recover or commit deeper.
BL.Store.state=BL.Store.defaultState();i={uid:'hp1',cardId:'v32_branch_adversity'};b=battle();b.player.hp=50;D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(i.stage,1);b.player.hp=75;c=D.resolveMultiStageCard(i,b,BL.Store.state);assert.equal(c.name,'再生殻');
j={uid:'hp2',cardId:'v32_branch_adversity'};b=battle();b.player.hp=50;D.resolveMultiStageCard(j,b,BL.Store.state);b.player.hp=25;c=D.resolveMultiStageCard(j,b,BL.Store.state);assert.equal(c.name,'破断殻');
// Unlock coverage.
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V32_BRANCH_CARD_IDS,...D.V32_RELIC_IDS,...D.V32_PROTOCOL_IDS,...D.V32_TUNING_IDS])assert(rewarded.has(id),'v32 item has no unlock route '+id);
// Real pipeline smoke + ownership.
for(const id of D.V32_BRANCH_CARD_IDS){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill(id);BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=1;BL.Store.state.enemy.def=1;BL.Store.state.enemy.spd=1;const start=BL.Battle.create(false);assert(!start.error,'start failed '+id);BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok,'ownership fail '+id);BL.Battle.retire();}}
console.log('PASS expansion32_branch_growth.test.js');
