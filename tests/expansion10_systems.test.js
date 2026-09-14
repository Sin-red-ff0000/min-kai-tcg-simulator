'use strict';
const path=require('path');global.window=global;
const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
const root=path.resolve(__dirname,'..');for(const f of ['js/data/gameData.js','js/data/protocols.js','js/data/tunings.js','js/data/conversions.js','js/data/chapter3.js','js/data/expansion08.js','js/data/expansion09.js','js/data/doctrines.js','js/data/characterStyles.js','js/data/expansion10.js','js/data/expansion11.js','js/data/expansion12.js','js/data/enemyBehaviors.js','js/data/expansion13.js','js/data/expansion14.js','js/core/utils.js','js/core/unlock.js','js/data/unlocks.js','js/data/unlocks07.js','js/data/unlocks08.js','js/data/unlocks09.js','js/data/unlocks10.js','js/data/unlocks11.js','js/data/unlocks12.js','js/data/unlocks13.js','js/data/unlocks14.js','js/core/state.js','js/core/enemy.js','js/core/battle.js'])require(path.join(root,f));
const BL=global.BuildLab,D=BL.Data;const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(D.V10_CARD_IDS.length===24,`v0.10 added-card count mismatch: ${D.V10_CARD_IDS.length}`);
assert(D.V10_RELIC_IDS.length===12,`v0.10 added-relic count mismatch: ${D.V10_RELIC_IDS.length}`);
assert(D.V10_TRAIT_IDS.length===4,`v0.10 added-trait count mismatch: ${D.V10_TRAIT_IDS.length}`);
assert(D.V10_PROTOCOL_IDS.length===6,`v0.10 added-protocol count mismatch: ${D.V10_PROTOCOL_IDS.length}`);
assert(Object.keys(D.CHARACTER_STYLES).length===14,`character style count mismatch: ${Object.keys(D.CHARACTER_STYLES).length}`);
console.log('PASS v0.10 content counts');

const rewards=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));
for(const id of D.V10_CARD_IDS)assert(rewards.has(id),`v0.10 card has no unlock route: ${id}`);
for(const id of D.V10_RELIC_IDS)assert(rewards.has(id),`v0.10 relic has no unlock route: ${id}`);
for(const id of D.V10_PROTOCOL_IDS)assert(rewards.has(id),`v0.10 protocol has no unlock route: ${id}`);
for(const id of Object.keys(D.CHARACTER_STYLES))assert(rewards.has(id),`style has no unlock route: ${id}`);
for(const id of D.V10_TRAIT_IDS)assert(D.UNLOCKS.some(u=>u.kind==='trait'&&(u.reward||[]).includes(id)),`v0.10 trait has no visible route: ${id}`);
console.log('PASS v0.10 unlock-route coverage');

// 第1ボス報酬からスタイルシステムが実際に付与される
BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('double_strike');BL.Store.state.defeatedTraits={giant:true,berserk:true,armored:true,fast:true};let end=null;BL.Battle.onEnd=r=>end=r;let start=BL.Battle.create('boss1');assert(!start.error,'boss1 start failed');BL.Battle.current.enemy.hp=1;BL.Battle.play(0);assert(end?.win,'boss1 reward test did not win');assert(BL.Store.state.unlockedSystems.character_style,'character_style system not granted by boss1');
console.log('PASS character-style boss reward');

// スタイル保存とキャラ一致検査
let s=BL.Store.defaultState();BL.Unlock.grant(s,'standard_focus');s.characterStyles.standard='standard_focus';s=BL.Store.mergeDefaults(s);assert(s.characterStyles.standard==='standard_focus','unlocked style not preserved');s.characterStyles.combo='standard_focus';s=BL.Store.mergeDefaults(s);assert(!s.characterStyles.combo,'style assigned to wrong character was not removed');
console.log('PASS style save validation');

// センター原型は中央2回発動、焦点型は1回+倍率へ置換
function centerDamage(styleId){BL.Store.state=BL.Store.defaultState();BL.Store.state.deck=Array(10).fill('double_strike');if(styleId){BL.Store.state.unlockedCharacterStyles[styleId]=true;BL.Store.state.characterStyles.standard=styleId;}const r=BL.Battle.create(false);assert(!r.error,'center style battle failed');const b=BL.Battle.current,before=b.enemy.hp,center=Math.floor((b.prompt.length-1)/2);BL.Battle.play(center);const after=BL.Battle.current?BL.Battle.current.enemy.hp:0;return before-after;}
const baseDamage=centerDamage(null),focusDamage=centerDamage('standard_focus');assert(baseDamage>focusDamage,`standard base repeat not replaced by focus style: base=${baseDamage} focus=${focusDamage}`);
console.log('PASS standard style replacement',baseDamage,focusDamage);

// フォート自動鍛造型は使用カードに限定せず1枚を強化する
BL.Store.state=BL.Store.defaultState();BL.Store.state.character='tank';BL.Store.state.deck=Array(10).fill('wall');BL.Store.state.unlockedCharacterStyles.tank_forge=true;BL.Store.state.characterStyles.tank='tank_forge';start=BL.Battle.create(false);assert(!start.error,'tank forge start failed');BL.Battle.play(0);assert(BL.Battle.upgradedCount()===1,`tank forge did not upgrade exactly one card: ${BL.Battle.upgradedCount()}`);BL.Battle.retire();
console.log('PASS tank forge style');

// 新特殊個体の発見
for(const [id,enemy] of Object.entries({crusher:{hp:1,atk:9,def:6,spd:1,regen:0,resist:0},bloodrush:{hp:1,atk:7,def:1,spd:3,regen:0,resist:0},regencarapace:{hp:7,atk:1,def:7,spd:1,regen:5,resist:0},mirrorfang:{hp:1,atk:6,def:1,spd:2.5,regen:0,resist:60}})){
  BL.Store.state=BL.Store.defaultState();if(id==='regencarapace'||id==='mirrorfang')BL.Store.state.unlockedSystems.advanced_enemy_parameters=true;Object.assign(BL.Store.state.enemy,enemy);BL.Enemy.detectDiscoveries(BL.Store.state);assert(BL.Store.state.unlockedTraits[id],`trait discovery missing: ${id}`);
}
console.log('PASS v0.10 trait discovery');

// v0.9セーブ移行
const migrated=BL.Store.mergeDefaults({version:9,bossDefeated:true,deck:[...D.DEFAULT_DECK],unlockedSystems:{},unlockedCards:{},unlockedRelics:{}});assert(migrated.version===32,'save version did not migrate to 20');assert(migrated.unlockedSystems.character_style,'boss1-cleared v0.9 save did not receive character style system');
console.log('PASS v0.10 migration');
