'use strict';
const path=require('path');global.window=global;
const mem={};global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
const root=path.resolve(__dirname,'..');for(const f of ['js/data/gameData.js','js/data/protocols.js','js/data/tunings.js','js/data/conversions.js','js/data/chapter3.js','js/data/expansion08.js','js/data/expansion09.js','js/data/doctrines.js','js/data/characterStyles.js','js/data/expansion10.js','js/data/expansion11.js','js/data/expansion12.js','js/data/enemyBehaviors.js','js/data/expansion13.js','js/data/expansion14.js','js/core/utils.js','js/core/unlock.js','js/data/unlocks.js','js/data/unlocks07.js','js/data/unlocks08.js','js/data/unlocks09.js','js/data/unlocks10.js','js/data/unlocks11.js','js/data/unlocks12.js','js/data/unlocks13.js','js/data/unlocks14.js','js/core/state.js','js/core/enemy.js','js/core/battle.js'])require(path.join(root,f));
const BL=global.BuildLab,D=BL.Data;const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(D.V08_CARD_IDS.length===42,`v0.8 added-card count mismatch: ${D.V08_CARD_IDS.length}`);
assert(D.V08_RELIC_IDS.length===20,`v0.8 added-relic count mismatch: ${D.V08_RELIC_IDS.length}`);
assert(D.V08_CHARACTER_IDS.length===3,`v0.8 added-character count mismatch: ${D.V08_CHARACTER_IDS.length}`);
assert(D.V08_TRAIT_IDS.length===6,`v0.8 added-trait count mismatch: ${D.V08_TRAIT_IDS.length}`);
assert(D.V08_PROTOCOL_IDS.length===6,`v0.8 added-protocol count mismatch: ${D.V08_PROTOCOL_IDS.length}`);
assert(D.V08_TUNING_IDS.length===3,`v0.8 added-tuning count mismatch: ${D.V08_TUNING_IDS.length}`);
console.log('PASS v0.8 content counts');

// v0.8追加コンテンツが孤立していないこと。調律はシステム解放後に自動利用可能なので報酬対象外。
const rewardIds=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));
for(const id of D.V08_CARD_IDS)assert(rewardIds.has(id),`v0.8 card has no unlock route: ${id}`);
for(const id of D.V08_RELIC_IDS)assert(rewardIds.has(id),`v0.8 relic has no unlock route: ${id}`);
for(const id of D.V08_CHARACTER_IDS)assert(rewardIds.has(id),`v0.8 character has no unlock route: ${id}`);
for(const id of D.V08_PROTOCOL_IDS)assert(rewardIds.has(id),`v0.8 protocol has no unlock route: ${id}`);
for(const id of D.V08_TRAIT_IDS)assert(D.UNLOCKS.some(u=>u.kind==='trait'&&(u.reward||[]).includes(id)),`v0.8 trait has no visible discovery goal: ${id}`);
assert(D.V08_TUNING_IDS.length===3,'v0.8 tuning additions are missing');
console.log('PASS v0.8 unlock-route coverage');

// 高度パラメータから新しい特殊個体が発見される。
for(const [id,enemy] of Object.entries({
  overgrown:{hp:8,atk:1,def:1,spd:1,regen:5,resist:0},
  cleanse_rush:{hp:1,atk:1,def:1,spd:2.5,regen:0,resist:50},
  ironroot:{hp:1,atk:1,def:6,spd:1,regen:5,resist:0},
  purgefang:{hp:1,atk:6,def:1,spd:1,regen:0,resist:50},
  redgrowth:{hp:1,atk:6,def:1,spd:1,regen:5,resist:0},
  allphase:{hp:6,atk:5,def:5,spd:2,regen:4,resist:40}
})){
  BL.Store.state=BL.Store.defaultState();BL.Store.state.unlockedSystems.advanced_enemy_parameters=true;Object.assign(BL.Store.state.enemy,enemy);BL.Enemy.detectDiscoveries(BL.Store.state);assert(BL.Store.state.unlockedTraits[id],`v0.8 trait discovery missing: ${id}`);
}
console.log('PASS v0.8 advanced trait discovery');

// リスク：自傷カードの基本効果が増える。
function damageWithCharacter(character,cardId){BL.Store.state=BL.Store.defaultState();BL.Store.state.character=character;BL.Store.state.unlockedCharacters[character]=true;BL.Store.state.deck=Array(10).fill(cardId);BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=.1;BL.Store.state.enemy.def=1;const st=BL.Battle.create(false);assert(!st.error,'character test start failed');const before=BL.Battle.current.enemy.hp;BL.Battle.play(0);const after=BL.Battle.current?BL.Battle.current.enemy.hp:0;if(BL.Battle.current)BL.Battle.retire();return before-after;}
const stdBlood=damageWithCharacter('standard','blood_blade'),riskBlood=damageWithCharacter('risk','blood_blade');assert(riskBlood>stdBlood,`risk bonus not applied: standard=${stdBlood} risk=${riskBlood}`);
console.log('PASS risk character bonus');

// ループ：自然再構築時に防御3を得る。
BL.Store.state=BL.Store.defaultState();BL.Store.state.character='loop';BL.Store.state.unlockedCharacters.loop=true;BL.Store.state.deck=Array(10).fill('wall');BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=.1;BL.Battle.create(false);for(let i=0;i<3&&BL.Battle.current;i++)BL.Battle.play(0);assert(BL.Battle.current&&BL.Battle.current.reshuffles>=1,'loop reshuffle did not occur');assert(BL.Battle.current.player.block>=3,'loop reshuffle block missing');BL.Battle.retire();
console.log('PASS loop character reshuffle bonus');

// カタリスト：複数種類の状態異常を新規付与すると次カード強化が残る。
BL.Store.state=BL.Store.defaultState();BL.Store.state.character='catalyst';BL.Store.state.unlockedCharacters.catalyst=true;BL.Store.state.deck=Array(10).fill('contamination');BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=.1;BL.Battle.create(false);BL.Battle.play(0);assert(BL.Battle.current&&BL.Battle.current.player.nextBuff>=.10,'catalyst next-card buff missing');BL.Battle.retire();
console.log('PASS catalyst character status bonus');

// 状態異常にも基本効果倍率が反映される（既存システム整合性修正）。
function poisonAfter(character){BL.Store.state=BL.Store.defaultState();BL.Store.state.character=character;BL.Store.state.unlockedCharacters[character]=true;BL.Store.state.deck=Array(10).fill('blood_poison');BL.Store.state.enemy.hp=50;BL.Store.state.enemy.atk=.1;BL.Battle.create(false);BL.Battle.play(0);const p=BL.Battle.current?BL.Battle.current.enemy.status.poison:0;if(BL.Battle.current)BL.Battle.retire();return p;}
assert(poisonAfter('catalyst')>poisonAfter('standard'),'status basic-effect multiplier is not reflected');
console.log('PASS status multiplier consistency');

// v0.7セーブはv0.8へ安全に移行。
const migrated=BL.Store.mergeDefaults({version:7,deck:[...D.DEFAULT_DECK],unlockedCards:{},unlockedRelics:{},bossDefeated:true,boss2Defeated:true});assert(migrated.version===26,'save version did not migrate to current version');assert(migrated.unlockedSystems.prompt_control&&migrated.unlockedSystems.card_link,'boss systems lost during v0.8 migration');
console.log('PASS v0.8 migration');
