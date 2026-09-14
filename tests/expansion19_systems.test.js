'use strict';
const path=require('path');
global.window=global;
const mem={};
global.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
const root=path.resolve(__dirname,'..');
for(const f of [
  'js/data/gameData.js','js/data/protocols.js','js/data/tunings.js','js/data/conversions.js','js/data/chapter3.js','js/data/expansion08.js','js/data/expansion09.js','js/data/doctrines.js','js/data/characterStyles.js','js/data/expansion10.js','js/data/expansion11.js','js/data/expansion12.js','js/data/enemyBehaviors.js','js/data/expansion13.js','js/data/expansion14.js','js/data/expansion17.js','js/data/expansion18.js','js/data/expansion19.js','js/data/runes.js','js/data/arcana.js','js/data/expansion20.js','js/data/balance22.js',
  'js/core/utils.js','js/core/unlock.js','js/data/unlocks.js','js/data/unlocks07.js','js/data/unlocks08.js','js/data/unlocks09.js','js/data/unlocks10.js','js/data/unlocks11.js','js/data/unlocks12.js','js/data/unlocks13.js','js/data/unlocks14.js','js/data/unlocks17.js','js/data/unlocks18.js','js/data/unlocks19.js','js/data/unlocks20.js','js/core/state.js','js/core/enemy.js','js/core/battle.js'
]) require(path.join(root,f));
const BL=global.BuildLab,D=BL.Data;
const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(D.V19_CHARACTER_IDS.length===8,`v19 characters ${D.V19_CHARACTER_IDS.length}`);
assert(D.V19_STYLE_IDS.length===24,`v19 styles ${D.V19_STYLE_IDS.length}`);
assert(D.V19_RELIC_IDS.length===40,`v19 relics ${D.V19_RELIC_IDS.length}`);
assert(D.V19_PROTOCOL_IDS.length===20,`v19 protocols ${D.V19_PROTOCOL_IDS.length}`);
assert(D.V19_TUNING_IDS.length===12,`v19 tunings ${D.V19_TUNING_IDS.length}`);
assert(D.V19_TRAIT_IDS.length===12,`v19 traits ${D.V19_TRAIT_IDS.length}`);
assert(D.V19_BEHAVIOR_IDS.length===20,`v19 behaviors ${D.V19_BEHAVIOR_IDS.length}`);
for(const id of D.V19_CHARACTER_IDS)assert(D.V19_CHARACTER_RULES[id],`character rule missing ${id}`);
for(const id of D.V19_STYLE_IDS)assert(D.V19_STYLE_RULES[id],`style rule missing ${id}`);
for(const id of D.V19_RELIC_IDS)assert(D.V19_RELIC_RULES[id],`relic rule missing ${id}`);
for(const id of D.V19_PROTOCOL_IDS)assert(D.V19_PROTOCOL_RULES[id],`protocol rule missing ${id}`);
for(const id of D.V19_TUNING_IDS)assert(D.V19_TUNING_RULES[id],`tuning rule missing ${id}`);
for(const id of D.V19_TRAIT_IDS)assert(D.V19_TRAIT_RULES[id]&&D.V19_TRAIT_CONDITIONS[id],`trait rule/condition missing ${id}`);
assert((D.ENEMY_STAT_CONFIG.find(x=>x.key==='resist')?.max||0)>=100,'v19 resistance slider was not expanded to 100');
for(const id of D.V19_BEHAVIOR_IDS){const b=D.ENEMY_BEHAVIORS[id];assert(b&&Array.isArray(b.requires)&&b.requires.length>=2,`behavior requirement missing ${id}`);b.requires.forEach(t=>assert(D.TRAITS[t],`behavior ${id} requires unknown trait ${t}`));}

const allowedWhen=new Set(['tuned','converted','tunedOrConverted','minTags','maxTags','tag','enemyTraitsMin','enemyTraitsMax','enemyBehaviorsMin','position','positionSide','positionChanged','positionSame','linkActive','pairCard','recentReshuffle','lowHp','statusMin','discarded','upgraded','reserved','doctrine','blockish','counterish','hitsMin','copiesMin','copiesMax','promptMin','promptMax','sameAsLast','differentFromLast','altStyle','cardStatus']);
for(const source of [D.V19_CHARACTER_RULES,D.V19_STYLE_RULES,D.V19_RELIC_RULES])for(const [id,clauses] of Object.entries(source||{}))for(const c of clauses||[])for(const k of Object.keys(c.when||{}))assert(allowedWhen.has(k),`unknown v19 condition ${id}.${k}`);
for(const source of [D.V19_PROTOCOL_RULES,D.V19_TUNING_RULES])for(const [id,r] of Object.entries(source||{}))for(const k of Object.keys(r.when||{}))assert(allowedWhen.has(k),`unknown v19 condition ${id}.${k}`);

// 新しい横方向コンテンツにアンロック経路があること。
const rewards=new Set(D.UNLOCKS.flatMap(u=>u.reward||[]));
for(const id of D.V19_TRAIT_IDS){const u=D.UNLOCKS.find(x=>x.id===`v19_discover_${id}`);assert(u&&u.condition&&u.reward.includes(id),`trait discovery goal missing ${id}`);}

for(const [label,ids] of Object.entries({character:D.V19_CHARACTER_IDS,style:D.V19_STYLE_IDS,relic:D.V19_RELIC_IDS,protocol:D.V19_PROTOCOL_IDS,tuning:D.V19_TUNING_IDS})){
  const missing=ids.filter(id=>!rewards.has(id));assert(!missing.length,`${label} orphan unlocks: ${missing.join(',')}`);
}

// 新しい特殊個体はステータス条件から発見・自動選択される。
let s=BL.Store.defaultState();s.unlockedSystems.advanced_enemy_parameters=true;s.enemy.hp=10;s.enemy.def=10;
let found=BL.Enemy.detectDiscoveries(s);assert(s.unlockedTraits.v19_ironheart&&s.enemy.traits.v19_ironheart,`v19 ironheart discovery missing: ${found}`);
let eff=BL.Enemy.effective(s);assert(eff.traits.includes('v19_ironheart'),'effective enemy missing v19 trait');assert(eff.hp>42*10,'v19 trait hp multiplier not applied');

// 新しい複合挙動は該当特殊個体の組み合わせから発見される。
s=BL.Store.defaultState();s.unlockedTraits.v19_ironheart=true;s.unlockedTraits.berserk=true;s.enemy.traits.v19_ironheart=true;s.enemy.traits.berserk=true;
found=BL.Enemy.detectBehaviorDiscoveries(s);assert(s.unlockedBehaviors.v19_bh_ironrage,`v19 behavior discovery missing: ${found}`);

// v0.19調律が実戦倍率へ接続される。
function firstDamage(tuned){
  const st=BL.Store.defaultState();st.character='combo';st.deck=Array(10).fill('double_strike');st.enemy.hp=20;st.enemy.atk=1;st.enemy.def=1;
  if(tuned){st.unlockedTunings.v19_mono_tune=true;st.cardTunings.double_strike='v19_mono_tune';}
  BL.Store.state=st;const r=BL.Battle.create(false);assert(!r.error,'v19 tuning battle create');const hp=BL.Battle.current.enemy.hp;BL.Battle.play(0);const loss=hp-(BL.Battle.current?BL.Battle.current.enemy.hp:0);if(BL.Battle.current)BL.Battle.retire();return loss;
}
const base=firstDamage(false),boost=firstDamage(true);assert(boost>base,`v19 tuning did not boost mono-tag card: base=${base}, tuned=${boost}`);

// 新規キャラ/スタイル/遺物/プロトコル/調律は最低1回の実戦で例外を起こさない。
for(const cid of D.V19_CHARACTER_IDS){
  const st=BL.Store.defaultState();st.unlockedCharacters[cid]=true;st.character=cid;st.enemy.hp=20;st.enemy.atk=1;BL.Store.state=st;let r=BL.Battle.create(false);assert(!r.error,`v19 character battle ${cid}`);BL.Battle.play(0);if(BL.Battle.current)BL.Battle.retire();
}
for(const sid of D.V19_STYLE_IDS){
  const style=D.CHARACTER_STYLES[sid],st=BL.Store.defaultState();st.unlockedCharacters[style.character]=true;st.character=style.character;st.unlockedCharacterStyles[sid]=true;st.characterStyles[style.character]=sid;st.enemy.hp=20;st.enemy.atk=1;BL.Store.state=st;let r=BL.Battle.create(false);assert(!r.error,`v19 style battle ${sid}`);BL.Battle.play(0);if(BL.Battle.current)BL.Battle.retire();
}
for(const rid of D.V19_RELIC_IDS){const st=BL.Store.defaultState();st.unlockedRelics[rid]=true;st.relics=[rid];st.enemy.hp=20;st.enemy.atk=1;BL.Store.state=st;let r=BL.Battle.create(false);assert(!r.error,`v19 relic battle ${rid}`);BL.Battle.play(0);if(BL.Battle.current)BL.Battle.retire();}
for(const pid of D.V19_PROTOCOL_IDS){const st=BL.Store.defaultState();st.unlockedProtocols[pid]=true;st.protocol=pid;st.enemy.hp=20;st.enemy.atk=1;BL.Store.state=st;let r=BL.Battle.create(false);assert(!r.error,`v19 protocol battle ${pid}`);BL.Battle.play(0);if(BL.Battle.current)BL.Battle.retire();}
for(const tid of D.V19_TUNING_IDS){const st=BL.Store.defaultState();st.unlockedTunings[tid]=true;st.cardTunings.double_strike=tid;st.enemy.hp=20;st.enemy.atk=1;BL.Store.state=st;let r=BL.Battle.create(false);assert(!r.error,`v19 tuning battle ${tid}`);BL.Battle.play(0);if(BL.Battle.current)BL.Battle.retire();}

// v0.18以前のセーブはv0.19へ移行。
const migrated=BL.Store.mergeDefaults({version:18,deck:[...D.DEFAULT_DECK],unlockedCards:{},unlockedRelics:{}});assert(migrated.version===30,'v18->v20 migration failed');
console.log(`PASS expansion19_systems.test.js (+${D.V19_CHARACTER_IDS.length} chars / +${D.V19_STYLE_IDS.length} styles / +${D.V19_RELIC_IDS.length} relics / +${D.V19_PROTOCOL_IDS.length} protocols / +${D.V19_TUNING_IDS.length} tunings / +${D.V19_TRAIT_IDS.length} traits / +${D.V19_BEHAVIOR_IDS.length} behaviors)`);
