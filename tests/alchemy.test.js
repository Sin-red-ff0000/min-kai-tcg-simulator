'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
global.window=global;const mem={build_lab_proto_v20:JSON.stringify({version:20,stats:{wins:9},boss4Defeated:true})};
global.localStorage={getItem:k=>mem[k]||null,setItem:(k,v)=>mem[k]=v,removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..');
for(const m of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"?]+)/g))if(!m[1].includes('/ui/')&&!m[1].endsWith('app.js'))require(path.join(root,m[1]));
const BL=global.BuildLab,A=BL.Data.ALCHEMY,L=BL.Alchemy;
assert.equal(BL.Store.state.version,26);assert.equal(BL.Store.state.stats.wins,9);assert.equal(BL.Store.state.alchemy.enabled,false);assert(BL.Store.state.unlockedSystems.rune);
const fake=config=>({turn:1,log:[],player:{hp:30,maxHp:50,block:0},enemy:{hp:1000},alchemy:L.create({...config,enabled:true})});
const api=b=>({damage:n=>b.enemy.hp-=n,heal:n=>b.player.hp=Math.min(b.player.maxHp,b.player.hp+n)});
let b=fake(A.presets[1]);L.supply(b);assert.equal(b.alchemy.stock.obsidian,2);assert.equal(b.alchemy.stock.water,2);
let bonus=L.beforeCard(b,{hits:1},api(b));assert.equal(bonus,.3);assert.equal(b.alchemy.stock.obsidian,1);assert.equal(L.beforeCard(b,{hits:1},api(b)),0);
L.supply(b);assert.equal(b.alchemy.stock.obsidian,3); // survives resupply
b=fake({allocation:{fire:6,earth:2},recipes:['lava','obsidian'],hold:['lava']});L.supply(b);assert.equal(b.alchemy.stock.lava,2);L.afterCard(b,{hits:1},api(b));assert.equal(b.alchemy.stock.lava,2);
b.alchemy.stock.water=2;L.react(b);assert.equal(b.alchemy.stock.obsidian,2);
b=fake({allocation:{aether:4,fire:8},recipes:['ember']});L.supply(b);assert.equal(b.alchemy.stock.ember,4);L.turn(b,api(b));assert.equal(b.enemy.hp,1000);assert.equal(b.alchemy.stock.ember,3);b.turn=2;L.turn(b,api(b));assert.equal(b.enemy.hp,992);assert.equal(b.alchemy.stock.ember,2);
b=fake({allocation:{aether:4,water:8},recipes:['spring']});L.supply(b);L.turn(b,api(b));b.turn=2;L.turn(b,api(b));assert.equal(b.alchemy.stock.water,0);b.turn=3;L.turn(b,api(b));assert.equal(b.alchemy.stock.water,1);assert.equal(b.alchemy.reactions.spring,4);
b=fake({allocation:{aether:4,air:8},recipes:['pulse']});L.supply(b);for(let i=1;i<=3;i++){b.turn=i;assert.equal(L.beforeCard(b,{hits:0},api(b)),i===3?.25:0);}assert.equal(b.alchemy.stock.pulse,3);
b=fake({allocation:{fire:3,earth:9},recipes:['ceramic']});L.supply(b);L.beforeHit(b,api(b));L.beforeHit(b,api(b));assert.equal(b.player.block,4);assert.equal(b.alchemy.stock.ceramic,2);
// Every recipe: exact input consumed, only declared output generated; no automatic unnamed reaction.
for(const r of A.recipes){b=fake({recipes:[r.id]});Object.assign(b.alchemy.stock,r.input);L.react(b);assert.equal(b.alchemy.stock[r.output],1,r.id);for(const id of Object.keys(r.input))assert.equal(b.alchemy.stock[id],0,r.id);}
b=fake({allocation:{fire:3,water:3,earth:3,air:3},recipes:[]});L.supply(b);assert.equal(b.alchemy.stock.aether,0);
const bad=A.normalize({enabled:true,allocation:{fire:Infinity,air:-1,water:100,earth:5},recipes:['evil','lava','lava']});assert.equal(Object.values(bad.allocation).reduce((a,b)=>a+b),12);assert.deepEqual(bad.recipes,['lava']);
// Integrated combat: config snapshot, center repeat consumes once, new battle clears stocks.
BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('blood_blade');BL.Store.state.alchemy=A.normalize({...A.presets[1],enabled:true});
let result;BL.Battle.onEnd=r=>result=r;BL.Battle.create();b=BL.Battle.current;b.enemy.hp=9999;b.enemy.atk=0;
BL.Store.state.alchemy.allocation.fire=0;assert.equal(b.alchemy.config.allocation.fire,6);
BL.Battle.play(1);assert.equal(b.alchemy.used.obsidian,1);assert(BL.Battle.invariant().ok);BL.Battle.retire();assert.equal(result.battle.alchemy.used.obsidian,1);
BL.Battle.create();assert.equal(BL.Battle.current.alchemy.used.obsidian,undefined);BL.Battle.retire();
BL.Store.state.stats.wins=27;BL.Store.resetBuild();assert.equal(BL.Store.state.stats.wins,27);assert.equal(BL.Store.state.alchemy.enabled,false);
// Stress each preset under real card and reshuffle paths.
for(const preset of A.presets){BL.Store.state=BL.Store.defaultState();BL.Store.state.alchemy=A.normalize({...preset,enabled:true});BL.Battle.create();for(let i=0;i<35&&BL.Battle.current;i++){const x=BL.Battle.current;x.enemy.hp=10000;x.player.hp=x.player.maxHp;x.enemy.atk=0;BL.Battle.play(0);if(BL.Battle.current){assert(BL.Battle.invariant().ok);for(const n of Object.values(x.alchemy.stock))assert(Number.isInteger(n)&&n>=0);}}if(BL.Battle.current)BL.Battle.retire();}
// Earlier incomplete recipes reserve partial material instead of silently losing it.
b=fake({recipes:['lava','glass']});Object.assign(b.alchemy.stock,{fire:2,earth:2});L.react(b);assert.equal(b.alchemy.stock.glass,0);assert.equal(b.alchemy.stock.fire,2);
// Round-trip retains all build settings while runtime inventory stays out of saved data.
BL.Store.state.alchemy=A.normalize({...A.presets[3],enabled:true});BL.Store.save();
assert.deepEqual(BL.Store.mergeDefaults(JSON.parse(mem[BL.Store.KEY])).alchemy,BL.Store.state.alchemy);
assert(!JSON.parse(mem[BL.Store.KEY]).alchemy.stock);
assert(BL.Data.SYSTEM_GUIDES.some(g=>g.id==='alchemy'));
// A delayed lethal effect ends real combat exactly once at turn start.
BL.Store.state=BL.Store.defaultState();BL.Store.state.alchemy=A.normalize({enabled:true,allocation:{aether:4,fire:8},recipes:['ember']});
BL.Store.state.deck=Array(10).fill('blood_blade');let ended=0;BL.Battle.onEnd=()=>ended++;BL.Battle.create();
b=BL.Battle.current;b.enemy.hp=1;b.enemy.def=9999;b.enemy.atk=0;
b.alchemy.pending=[{id:'ember',due:2}];
// Defense is deliberately honored: a scheduled hit cannot bypass a high-defense enemy.
BL.Battle.play(0);assert.equal(ended,0);assert(BL.Battle.current);
b.enemy.def=0;b.enemy.hp=1;b.alchemy.pending=[{id:'ember',due:3}];
// Select a non-attacking card to isolate the scheduled hit.
const blockId=Object.keys(BL.Data.CARDS).find(id=>BL.Data.CARDS[id].kind==='block'&&!BL.Data.CARDS[id].damage&&!BL.Data.CARDS[id].effect);
b.prompt[0].cardId=blockId;BL.Battle.play(0);assert.equal(ended,1);assert.equal(BL.Battle.current,null);
console.log('PASS alchemy: recipes, stacks, delay, reserve, snapshot, migration, reset and combat');
