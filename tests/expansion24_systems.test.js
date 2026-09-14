'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data,A=D.ALCHEMY;
assert.equal(D.V24_ADVANCED_MATERIAL_IDS.length,12);assert.equal(D.V24_CHARACTER_IDS.length,5);assert.equal(D.V24_STYLE_IDS.length,15);assert.equal(D.V24_RELIC_IDS.length,30);assert.equal(D.V24_PROTOCOL_IDS.length,15);assert.equal(D.V24_TUNING_IDS.length,10);assert.equal(D.V24_TRAIT_IDS.length,10);assert.equal(D.V24_BEHAVIOR_IDS.length,20);
assert.deepEqual({chars:Object.keys(D.CHARACTERS).length,styles:Object.keys(D.CHARACTER_STYLES).length,relics:Object.keys(D.RELICS).length,protocols:Object.keys(D.PROTOCOLS).length,tunings:Object.keys(D.TUNINGS).length,traits:Object.keys(D.TRAITS).length,behaviors:Object.keys(D.ENEMY_BEHAVIORS).length},{chars:40,styles:101,relics:411,protocols:169,tunings:76,traits:97,behaviors:120});
let s=BL.Store.mergeDefaults({version:23,boss4Defeated:true,alchemy:{enabled:true,allocation:{fire:6,earth:6},recipes:['lava'],hold:[]}});assert.equal(s.version,30);assert.equal(s.alchemy.allocation.fire,6);
for(const id of D.V24_ADVANCED_MATERIAL_IDS)assert(A.effects[id]&&A.recipes.some(r=>r.output===id),'missing advanced material '+id);
let a=BL.Alchemy.create(A.normalize({enabled:true,allocation:{fire:8,earth:1,aether:1,air:2},recipes:['ember','lava','magma_core'],hold:[]}));let fake={turn:1,alchemy:a,log:[],player:{hp:50,maxHp:50,block:0},enemy:{hp:100,block:0}};BL.Alchemy.supply(fake);assert((a.made.magma_core||0)>=1,'advanced chain recipe failed');
BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedSystems.advanced_enemy_parameters=true;Object.assign(BL.Store.state.enemy,{hp:8,atk:8});BL.Enemy.detectDiscoveries(BL.Store.state);assert(BL.Store.state.unlockedTraits.v24_crucible,'v24 trait discovery failed');

assert(D.SYSTEM_GUIDES.some(g=>g.id==='advanced_alchemy'),'advanced alchemy guide missing');
assert(D.GUIDE_REFERENCE_GROUPS.tunings.some(x=>x.id==='v24_product'),'v24 tuning guide missing');
function damage(withRelic){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('blood_blade');BL.Store.state.enemy.atk=.1;BL.Store.state.enemy.def=1;if(withRelic){BL.Store.state.unlockedRelics.v24_magma_core=true;BL.Store.state.relics=['v24_magma_core'];}let result=null;BL.Battle.onEnd=r=>result=r;const start=BL.Battle.create(false);assert(!start.error);if(withRelic)BL.Battle.current.alchemy.made.magma_core=1;const before=BL.Battle.current.enemy.hp;BL.Battle.play(0);const b=BL.Battle.current||result.battle;const dealt=before-b.enemy.hp;if(BL.Battle.current)BL.Battle.retire();return dealt;}
assert(damage(true)>damage(false),'v24 relic battle rule not applied');
function smoke(setup,label){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('blood_blade');BL.Store.state.enemy.atk=.1;BL.Store.state.alchemy=A.normalize({enabled:true,allocation:{fire:3,air:3,water:2,earth:2,aether:2},recipes:['steam','sand','pulse'],hold:[]});setup(BL.Store.state);const r=BL.Battle.create(false);assert(!r.error,label+' start');BL.Battle.current.alchemy.made.magma_core=1;BL.Battle.current.alchemy.made.storm_crystal=1;BL.Battle.current.alchemy.used.magma_core=1;BL.Battle.current.alchemy.reactions.steam=1;BL.Battle.current.alchemy.reactions.sand=1;BL.Battle.current.alchemy.reactions.pulse=1;BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok,label+' invariant');BL.Battle.retire();}}
for(const id of D.V24_RELIC_IDS)smoke(st=>{st.unlockedRelics[id]=true;st.relics=[id];},'relic '+id);
for(const id of D.V24_PROTOCOL_IDS)smoke(st=>{st.unlockedProtocols[id]=true;st.protocol=id;},'protocol '+id);
for(const id of D.V24_TUNING_IDS)smoke(st=>{st.unlockedTunings[id]=true;st.cardTunings.blood_blade=id;},'tuning '+id);
for(const id of D.V24_CHARACTER_IDS)smoke(st=>{st.unlockedCharacters[id]=true;st.character=id;},'character '+id);
for(const id of D.V24_STYLE_IDS){const sty=D.CHARACTER_STYLES[id];smoke(st=>{st.unlockedCharacters[sty.character]=true;st.character=sty.character;st.unlockedCharacterStyles[id]=true;st.characterStyles[sty.character]=id;},'style '+id);}

const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V24_CHARACTER_IDS,...D.V24_STYLE_IDS,...D.V24_RELIC_IDS,...D.V24_PROTOCOL_IDS,...D.V24_TUNING_IDS,...D.V24_TRAIT_IDS,...D.V24_BEHAVIOR_IDS])assert(rewarded.has(id),'no unlock route '+id);
assert.equal(D.UNLOCKS.filter(u=>u.chapter===7).length,60);
console.log('PASS expansion24_systems.test.js',{materials:12,characters:5,styles:15,relics:30,protocols:15,tunings:10,traits:10,behaviors:20,chapter7:60});
