'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');global.window=global;const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]};
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const f=m[1];if(f.includes('/ui/')||f.endsWith('app.js'))continue;require(path.join(root,f));}
const BL=global.BuildLab,D=BL.Data;
assert.equal(D.V27_CARD_IDS.length,24);assert.equal(D.V27_CHARACTER_IDS.length,2);assert.equal(D.V27_STYLE_IDS.length,6);assert.equal(D.V27_RELIC_IDS.length,16);assert.equal(D.V27_PROTOCOL_IDS.length,8);assert.equal(D.V27_TUNING_IDS.length,8);assert.equal(D.V27_TRAIT_IDS.length,6);assert.equal(D.V27_BEHAVIOR_IDS.length,12);
assert.equal(Object.keys(D.DUAL_FACE_CARDS).length,16,'dual-face total should be 16');
for(const id of D.V27_CARD_IDS)assert(D.CARDS[id]?.requiresUnlock,'v27 card missing unlock flag '+id);
const rewarded=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));for(const id of [...D.V27_CARD_IDS,...D.V27_CHARACTER_IDS,...D.V27_STYLE_IDS,...D.V27_RELIC_IDS,...D.V27_PROTOCOL_IDS,...D.V27_TUNING_IDS,...D.V27_TRAIT_IDS,...D.V27_BEHAVIOR_IDS])assert(rewarded.has(id),'v27 item has no unlock route '+id);
for(const id of D.V27_TRAIT_IDS)assert.notEqual(D.traitConditionText(id),'発見条件未登録','trait condition missing '+id);
// 横断カードは必ず条件ルールを持ち、単純な基礎値上位互換として追加されていない。
for(const id of D.V27_CARD_IDS.filter(id=>!D.CARDS[id].dualFace))assert(D.V27_CARD_RULES[id]?.length,'cross-system card has no condition '+id);
// 新二面カードの条件変化：特殊個体3種で裏面化し、条件が外れても戻らない。
BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedCards.v27_dual_trait=true;BL.Store.state.deck=Array(10).fill('v27_dual_trait');BL.Store.state.enemy.hp=.1;BL.Store.state.enemy.atk=.1;['giant','berserk','armored'].forEach(id=>{BL.Store.state.unlockedTraits[id]=true;BL.Store.state.enemy.traits[id]=true;});let st=BL.Battle.create(false);assert(!st.error);const inst=BL.Battle.current.prompt[0];assert.equal(D.resolveDualFaceCard(inst,BL.Battle.current).face,'back');BL.Battle.current.enemy.traits=[];assert.equal(D.resolveDualFaceCard(inst,BL.Battle.current).face,'back');BL.Battle.retire();
// 新規説明文の完全一致なし。
for(const [label,obj] of [['cards',D.CARDS],['relics',D.RELICS],['protocols',D.PROTOCOLS],['tunings',D.TUNINGS]]){const map=new Map();for(const [id,x] of Object.entries(obj)){const d=(x.desc||'').trim();if(!d)continue;if(!map.has(d))map.set(d,[]);map.get(d).push(id);}const dup=[...map.values()].filter(ids=>ids.length>1&&ids.some(id=>id.startsWith('v27_')));assert.equal(dup.length,0,`${label} v27 duplicate descriptions ${JSON.stringify(dup)}`);}
console.log('PASS expansion27_systems.test.js');
