'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V23_CHARACTER_IDS.length,5);assert.equal(D.V23_STYLE_IDS.length,15);assert.equal(D.V23_RELIC_IDS.length,30);assert.equal(D.V23_PROTOCOL_IDS.length,15);assert.equal(D.V23_TUNING_IDS.length,10);assert.equal(D.V23_TRAIT_IDS.length,10);assert.equal(D.V23_BEHAVIOR_IDS.length,20);assert.equal(D.V23_RUNE_IDS.length,5);
assert.deepEqual({chars:Object.keys(D.CHARACTERS).length,styles:Object.keys(D.CHARACTER_STYLES).length,relics:Object.keys(D.RELICS).length,protocols:Object.keys(D.PROTOCOLS).length,tunings:Object.keys(D.TUNINGS).length,traits:Object.keys(D.TRAITS).length,behaviors:Object.keys(D.ENEMY_BEHAVIORS).length,runes:Object.keys(D.RUNES).length},{chars:38,styles:95,relics:385,protocols:155,tunings:62,traits:91,behaviors:108,runes:17});
assert(D.SYSTEM_GUIDES.some(g=>g.id==='element_builds'),'element guide missing');
assert(D.GUIDE_REFERENCE_GROUPS.runes.some(x=>x.id==='v23_rune_fire'),'element rune guide missing');

// v0.22 save migration preserves existing build data and advances version.
let migrated=BL.Store.mergeDefaults({version:22,boss4Defeated:true,alchemy:{enabled:true,allocation:{fire:6,air:0,water:0,earth:6,aether:0},recipes:['lava'],hold:[]},deck:[...D.DEFAULT_DECK],unlockedCards:{},unlockedRelics:{}});
assert.equal(migrated.version,26);assert.equal(migrated.alchemy.allocation.fire,6);assert(migrated.unlockedSystems.rune&&migrated.unlockedSystems.arcana);

function damage(setup){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('blood_blade');BL.Store.state.enemy.atk=.1;BL.Store.state.enemy.def=1;setup?.(BL.Store.state);let result=null;BL.Battle.onEnd=r=>result=r;const start=BL.Battle.create(false);assert(!start.error);const before=BL.Battle.current.enemy.hp;BL.Battle.play(0);const b=BL.Battle.current||result.battle;const dealt=before-b.enemy.hp;if(BL.Battle.current)BL.Battle.retire();return dealt;}
const base=damage();
const wrong=damage(s=>{s.unlockedRunes.v23_rune_fire=true;s.cardRunes.blood_blade='v23_rune_fire';s.alchemy=D.ALCHEMY.normalize({enabled:true,allocation:{water:12}});});
const fire=damage(s=>{s.unlockedRunes.v23_rune_fire=true;s.cardRunes.blood_blade='v23_rune_fire';s.alchemy=D.ALCHEMY.normalize({enabled:true,allocation:{fire:12}});});
assert.equal(wrong,base,'fire rune should not amplify without fire allocation');assert(fire>base,`fire rune not applied ${base}->${fire}`);
const ignis=damage(s=>{s.unlockedCharacters.ignis=true;s.character='ignis';s.unlockedRunes.v23_rune_fire=true;s.cardRunes.blood_blade='v23_rune_fire';s.alchemy=D.ALCHEMY.normalize({enabled:true,allocation:{fire:12}});});
assert(ignis>fire,`Ignis elemental character not applied ${fire}->${ignis}`);

// Element trait discovery/effective stats and behavior discovery.
BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedSystems.advanced_enemy_parameters=true;Object.assign(BL.Store.state.enemy,{atk:12,regen:4});BL.Enemy.detectDiscoveries(BL.Store.state);assert(BL.Store.state.unlockedTraits.v23_cinder,'cinder discovery failed');
BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedTraits.v23_bedrock=true;BL.Store.state.enemy.traits.v23_bedrock=true;let e=BL.Enemy.effective(BL.Store.state);assert(e.def>=6&&e.hp>42,'bedrock trait stats not applied');
BL.Store.state=BL.Store.defaultState();for(const id of ['v23_cinder','v23_gale']){BL.Store.state.unlockedTraits[id]=true;BL.Store.state.enemy.traits[id]=true;}let found=BL.Enemy.detectBehaviorDiscoveries(BL.Store.state);assert(found.includes('火嵐連鎖'),'element behavior discovery failed');assert(BL.Store.state.unlockedBehaviors.v23_bh_firestorm);assert(BL.Enemy.effective(BL.Store.state).behaviors.includes('v23_bh_firestorm'));

// Element rune unlock route is visible and functional after boss4.
BL.Store.state=BL.Store.defaultState();BL.Store.state.boss4Defeated=true;BL.Store.state.alchemy=D.ALCHEMY.normalize({enabled:true,allocation:{fire:6,earth:6}});let got=BL.Unlock.processWinUnlocks(BL.Store.state,{isBoss:false,bossId:null,player:{hp:50,maxHp:50},enemy:{traits:[],behaviors:[]},alchemy:{made:{},reactions:{}},linkComboCount:0});assert(BL.Store.state.unlockedRunes.v23_rune_fire,'fire rune unlock route failed');assert(got.includes('火印のルーン'));


// Smoke all v0.23 player-side additions through a real battle.
function smoke(setup,label){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('blood_blade');BL.Store.state.enemy.atk=.1;BL.Store.state.enemy.hp=20;BL.Store.state.alchemy=D.ALCHEMY.normalize({enabled:true,allocation:{fire:3,air:3,water:2,earth:2,aether:2},recipes:['steam','sand','pulse'],hold:[]});setup(BL.Store.state);const r=BL.Battle.create(false);assert(!r.error,label+' start');BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok,label+' invariant');BL.Battle.retire();}}
for(const id of D.V23_RELIC_IDS)smoke(s=>{s.unlockedRelics[id]=true;s.relics=[id];},'relic '+id);
for(const id of D.V23_PROTOCOL_IDS)smoke(s=>{s.unlockedProtocols[id]=true;s.protocol=id;},'protocol '+id);
for(const id of D.V23_TUNING_IDS)smoke(s=>{s.unlockedTunings[id]=true;s.cardTunings.blood_blade=id;},'tuning '+id);
for(const id of D.V23_RUNE_IDS)smoke(s=>{s.unlockedRunes[id]=true;s.cardRunes.blood_blade=id;},'rune '+id);
for(const charId of D.V23_CHARACTER_IDS)smoke(s=>{s.unlockedCharacters[charId]=true;s.character=charId;},'character '+charId);
for(const styleId of D.V23_STYLE_IDS){const st=D.CHARACTER_STYLES[styleId];smoke(s=>{s.unlockedCharacters[st.character]=true;s.character=st.character;s.unlockedCharacterStyles[styleId]=true;s.characterStyles[st.character]=styleId;},'style '+styleId);}

// Every v0.23 data item is reachable from at least one visible unlock goal.
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V23_CHARACTER_IDS,...D.V23_STYLE_IDS,...D.V23_RELIC_IDS,...D.V23_PROTOCOL_IDS,...D.V23_TUNING_IDS,...D.V23_TRAIT_IDS,...D.V23_BEHAVIOR_IDS,...D.V23_RUNE_IDS])assert(rewarded.has(id),`v23 item has no unlock route: ${id}`);
const chapter6=D.UNLOCKS.filter(u=>u.chapter===6);assert.equal(chapter6.length,60,`chapter6 unlock count ${chapter6.length}`);
console.log('PASS expansion23_systems.test.js',{characters:D.V23_CHARACTER_IDS.length,styles:D.V23_STYLE_IDS.length,relics:D.V23_RELIC_IDS.length,protocols:D.V23_PROTOCOL_IDS.length,tunings:D.V23_TUNING_IDS.length,traits:D.V23_TRAIT_IDS.length,behaviors:D.V23_BEHAVIOR_IDS.length,runes:D.V23_RUNE_IDS.length,chapter6:chapter6.length,totalUnlocks:D.UNLOCKS.length});
