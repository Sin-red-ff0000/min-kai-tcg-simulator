'use strict';
const path=require('path');global.window=global;
const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
const root=path.resolve(__dirname,'..');for(const f of ['js/data/gameData.js','js/data/protocols.js','js/data/tunings.js','js/data/conversions.js','js/data/chapter3.js','js/data/expansion08.js','js/data/expansion09.js','js/data/doctrines.js','js/data/characterStyles.js','js/data/expansion10.js','js/data/expansion11.js','js/data/expansion12.js','js/data/enemyBehaviors.js','js/data/expansion13.js','js/data/expansion14.js','js/core/utils.js','js/core/unlock.js','js/data/unlocks.js','js/data/unlocks07.js','js/data/unlocks08.js','js/data/unlocks09.js','js/data/unlocks10.js','js/data/unlocks11.js','js/data/unlocks12.js','js/data/unlocks13.js','js/data/unlocks14.js','js/core/state.js','js/core/enemy.js','js/core/battle.js'])require(path.join(root,f));
const BL=global.BuildLab,D=BL.Data;const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(D.V09_CARD_IDS.length===36,`v0.9 added-card count mismatch: ${D.V09_CARD_IDS.length}`);
assert(D.V09_RELIC_IDS.length===18,`v0.9 added-relic count mismatch: ${D.V09_RELIC_IDS.length}`);
assert(D.V09_CHARACTER_IDS.length===2,`v0.9 added-character count mismatch: ${D.V09_CHARACTER_IDS.length}`);
assert(D.V09_TRAIT_IDS.length===4,`v0.9 added-trait count mismatch: ${D.V09_TRAIT_IDS.length}`);
assert(D.V09_PROTOCOL_IDS.length===6,`v0.9 added-protocol count mismatch: ${D.V09_PROTOCOL_IDS.length}`);
assert(D.V09_TUNING_IDS.length===3,`v0.9 added-tuning count mismatch: ${D.V09_TUNING_IDS.length}`);
assert(Object.keys(D.DOCTRINES).length===6,'構築規格が6種ではありません');
console.log('PASS v0.9 content counts');

// v0.9追加要素のアンロック経路
const rewards=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));
for(const id of D.V09_CARD_IDS)assert(rewards.has(id),`v0.9 card has no unlock route: ${id}`);
for(const id of D.V09_RELIC_IDS)assert(rewards.has(id),`v0.9 relic has no unlock route: ${id}`);
for(const id of D.V09_CHARACTER_IDS)assert(rewards.has(id),`v0.9 character has no unlock route: ${id}`);
for(const id of D.V09_PROTOCOL_IDS)assert(rewards.has(id),`v0.9 protocol has no unlock route: ${id}`);
for(const id of D.V09_TUNING_IDS)assert(rewards.has(id),`v0.9 tuning has no unlock route: ${id}`);
for(const id of D.V09_TRAIT_IDS)assert(D.UNLOCKS.some(u=>u.kind==='trait'&&(u.reward||[]).includes(id)),`v0.9 trait has no visible discovery goal: ${id}`);
for(const id of Object.keys(D.DOCTRINES))assert(rewards.has(id),`doctrine has no unlock route: ${id}`);
console.log('PASS v0.9 unlock-route coverage');

// 新特殊個体の発見
for(const [id,enemy] of Object.entries({
  bloomwall:{hp:1,atk:1,def:8,spd:1,regen:6,resist:0},
  nullgiant:{hp:8,atk:1,def:1,spd:1,regen:0,resist:70},
  rushbloom:{hp:1,atk:1,def:1,spd:3,regen:6,resist:0},
  apex:{hp:8,atk:7,def:7,spd:2.5,regen:6,resist:60}
})){
  BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedSystems.advanced_enemy_parameters=true;Object.assign(BL.Store.state.enemy,enemy);BL.Enemy.detectDiscoveries(BL.Store.state);assert(BL.Store.state.unlockedTraits[id],`v0.9 trait discovery missing: ${id}`);
}
console.log('PASS v0.9 trait discovery');

// 第3ボス挑戦条件
BL.Store.state=BL.Store.defaultState();BL.Store.state.boss2Defeated=true;BL.Store.state.claimedUnlocks.v07_link_six=true;BL.Store.state.claimedUnlocks.v07_link_tuned=true;BL.Store.state.claimedUnlocks.v08_link_cycle=true;BL.Store.state.defeatedTraits.apex=true;
assert(BL.Unlock.boss3Available(BL.Store.state),'第3ボス挑戦条件が成立しません');
let start=BL.Battle.create('boss3');assert(!start.error,'第3ボス開始失敗');assert(BL.Battle.current.enemy.maxHp===180,'第3ボスHPが想定値ではありません');BL.Battle.retire();
console.log('PASS boss3 availability/start');

// 第3ボス報酬パイプライン
BL.Store.state=BL.Store.defaultState();BL.Store.state.boss2Defeated=true;BL.Store.state.deck=Array(10).fill('patient_execution');let result=null;BL.Battle.onEnd=r=>result=r;start=BL.Battle.create('boss3');assert(!start.error,'第3ボス報酬テスト開始失敗');BL.Battle.current.enemy.hp=1;BL.Battle.play(0);assert(result?.win,'第3ボス撃破結果が勝利になっていません');assert(BL.Store.state.boss3Defeated,'boss3Defeatedが保存されていません');assert(BL.Store.state.unlockedSystems.deck_doctrine,'構築規格システムが解放されていません');for(const id of ['compact','expanded','singleton'])assert(BL.Store.state.unlockedDoctrines[id],`初期構築規格不足: ${id}`);for(const id of ['compact_edge','compact_guard','expanded_edge','expanded_guard','singleton_edge','singleton_guard'])assert(BL.Store.state.unlockedCards[id],`第3ボス報酬カード不足: ${id}`);assert(BL.Store.state.unlockedRelics.doctrine_core,'第3ボス報酬遺物不足');
console.log('PASS boss3 reward pipeline');

// 構築規格のルール変更
function unlockDoctrineState(id){const s=BL.Store.defaultState();s.boss3Defeated=true;s.unlockedSystems.deck_doctrine=true;s.unlockedDoctrines[id]=true;s.doctrine=id;return s;}
BL.Store.state=unlockDoctrineState('compact');BL.Store.state.deck=['wall','wall','double_strike','double_strike','poison_needle','poison_needle','rebuild','rebuild'];start=BL.Battle.create(false);assert(!start.error,'圧縮規格8枚で開始できません');assert(BL.Battle.current.initialDeckSize===8,'圧縮規格のデッキ枚数が反映されません');BL.Battle.retire();
BL.Store.state=unlockDoctrineState('expanded');BL.Store.state.deck=['wall','wall','double_strike','double_strike','poison_needle','poison_needle','rebuild','rebuild','counter_stance','counter_stance','blood_blade','blood_blade'];start=BL.Battle.create(false);assert(!start.error,'展開規格12枚で開始できません');assert(BL.Battle.current.lastPromptCount===4,'展開規格の提示+1が反映されません');BL.Battle.retire();
BL.Store.state=unlockDoctrineState('singleton');BL.Store.state.deck=['wall','double_strike','poison_needle','rebuild','counter_stance','blood_blade','brand','break','weakening_mist','parry'];start=BL.Battle.create(false);assert(!start.error,'単独規格の合法デッキで開始できません');BL.Battle.retire();BL.Store.state.deck=['wall','wall','poison_needle','rebuild','counter_stance','blood_blade','brand','break','weakening_mist','parry'];assert(BL.Battle.create(false).error,'単独規格で同名2枚が拒否されません');
BL.Store.state=unlockDoctrineState('duplicate');BL.Store.state.unlockedDoctrines.duplicate=true;BL.Store.state.deck=['wall','wall','wall','double_strike','double_strike','double_strike','poison_needle','poison_needle','rebuild','rebuild'];start=BL.Battle.create(false);assert(!start.error,'複製規格の同名3枚が許可されません');BL.Battle.retire();
console.log('PASS doctrine deck rules');

// 新調律はアンロック前にセーブへ残らず、grant後は保持される
let migrated=BL.Store.mergeDefaults({version:8,boss3Defeated:true,unlockedSystems:{deck_doctrine:true},deck:[...D.DEFAULT_DECK],cardTunings:{wall:'doctrine_tune'}});assert(!migrated.cardTunings.wall,'未解放の規格調律が残っています');BL.Unlock.grant(migrated,'doctrine_tune');migrated.cardTunings.wall='doctrine_tune';migrated=BL.Store.mergeDefaults(migrated);assert(migrated.unlockedTunings.doctrine_tune&&migrated.cardTunings.wall==='doctrine_tune','規格調律の個別アンロック/保存に失敗');
console.log('PASS doctrine tuning gating');

// v0.8セーブからv0.9へ移行し、第3ボス既撃破なら報酬を復元
migrated=BL.Store.mergeDefaults({version:8,boss3Defeated:true,deck:[...D.DEFAULT_DECK],unlockedCards:{},unlockedRelics:{},unlockedSystems:{}});assert(migrated.version===32,'save version did not migrate to 20');assert(migrated.unlockedSystems.deck_doctrine,'第3ボス既撃破セーブで構築規格システムが復元されません');assert(migrated.unlockedDoctrines.compact&&migrated.unlockedDoctrines.expanded&&migrated.unlockedDoctrines.singleton,'第3ボス初期規格が復元されません');
console.log('PASS v0.9 migration');
