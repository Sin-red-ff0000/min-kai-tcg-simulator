'use strict';
(function(){
  const BL = window.BuildLab;
  const D = BL.Data;
  const KEY='build_lab_proto_v32';
  const OLD_KEYS=['build_lab_proto_v30','build_lab_proto_v26','build_lab_proto_v25','build_lab_proto_v24','build_lab_proto_v23','build_lab_proto_v22','build_lab_proto_v21','build_lab_proto_v20','build_lab_proto_v19','build_lab_proto_v18','build_lab_proto_v17','build_lab_proto_v16','build_lab_proto_v15','build_lab_proto_v14','build_lab_proto_v13','build_lab_proto_v12','build_lab_proto_v11','build_lab_proto_v10','build_lab_proto_v09','build_lab_proto_v08','build_lab_proto_v07','build_lab_proto_v06','build_lab_proto_v05','build_lab_proto_v04','build_lab_proto_v03','build_lab_proto_v02','build_lab_proto_v01'];

  function defaultState(){
    return {
      version:32,
      alchemy:D.ALCHEMY?.defaults()||{enabled:false},
      character:'standard',
      deck:[...D.DEFAULT_DECK],
      relics:[],
      unlockedCharacterStyles:{}, characterStyles:{},
      unlockedCards:Object.fromEntries(D.BASE_CARD_IDS.map(id=>[id,true])),
      unlockedRelics:Object.fromEntries(D.BASE_RELIC_IDS.map(id=>[id,true])),
      unlockedTraits:{}, unlockedBehaviors:{}, unlockedProtocols:{}, unlockedSystems:{}, unlockedCharacters:{standard:true,combo:true,tank:true}, unlockedDoctrines:{}, unlockedTunings:{}, cardTunings:{}, unlockedConversions:{}, cardConversions:{}, unlockedLinkModes:{reciprocal:true}, cardLink:{a:null,b:null}, linkMode:'reciprocal', protocol:null, doctrine:null, unlockedRunes:{}, cardRunes:{}, unlockedArcana:{}, arcana:{id:null,orientation:'upright'}, defeatedTraits:{}, flags:{}, claimedUnlocks:{}, bossDefeated:false,boss2Defeated:false,boss3Defeated:false,boss4Defeated:false,
      enemy:{hp:1,atk:1,def:1,spd:1,regen:0,resist:0,traits:{}},
      stats:{wins:0,losses:0,bossWins:0},
      ui:{cardSearch:'',cardTag:'all',cardTag2:'all',cardTagMode:'and',cardEffect:'all',cardHits:'0',cardState:'unlocked',cardSort:'name',deckSubtab:'cards',enemySubtab:'stats',unlockSearch:'',unlockState:'all',unlockKind:'all',unlockAxis:'all',unlockChapter:'all',unlockCondition:'all',unlockSort:'status',relicSearch:'',relicTag:'all',relicTag2:'all',relicTagMode:'and',relicState:'unlocked',relicSort:'name',protocolSearch:'',protocolTag:'all',protocolState:'unlocked',tuningSearch:'',tuningState:'deck',tuningType:'all',conversionSearch:'',conversionState:'deck',conversionType:'all',runeSearch:'',runeState:'deck',runeType:'all',arcanaSearch:'',arcanaState:'unlocked',linkSearch:'',doctrineSearch:'',doctrineState:'unlocked',cardMobileLimit:60,relicMobileLimit:48}
    };
  }

  function mergeDefaults(raw){
    const base=defaultState(); const s={...base,...raw};
    s.unlockedCards={...base.unlockedCards,...(raw.unlockedCards||{})};
    s.unlockedRelics={...base.unlockedRelics,...(raw.unlockedRelics||{})};
    s.unlockedTraits={...(raw.unlockedTraits||{})};
    s.unlockedBehaviors={...(raw.unlockedBehaviors||{})};
    s.unlockedProtocols={...(raw.unlockedProtocols||{})};
    s.unlockedSystems={...(raw.unlockedSystems||{})};
    s.unlockedDoctrines={...(raw.unlockedDoctrines||{})};
    s.unlockedTunings={...(raw.unlockedTunings||{})};
    s.unlockedConversions={...(raw.unlockedConversions||{})};
    s.cardConversions={...(raw.cardConversions||{})};
    s.unlockedRunes={...(raw.unlockedRunes||{})};
    s.cardRunes={...(raw.cardRunes||{})};
    s.unlockedArcana={...(raw.unlockedArcana||{})};
    s.arcana={...base.arcana,...(raw.arcana||{})};
    s.unlockedCharacters={standard:true,combo:true,tank:true,...(raw.unlockedCharacters||{})};
    s.unlockedCharacterStyles={...(raw.unlockedCharacterStyles||{})};
    s.characterStyles={...(raw.characterStyles||{})};
    s.cardTunings={...(raw.cardTunings||{})};
    s.cardLink={...base.cardLink,...(raw.cardLink||{})};
    s.unlockedLinkModes={reciprocal:true,...(raw.unlockedLinkModes||{})};
    s.linkMode=raw.linkMode||'reciprocal';
    s.defeatedTraits={...(raw.defeatedTraits||{})};
    s.flags={...(raw.flags||{})};
    s.claimedUnlocks={...(raw.claimedUnlocks||{})};
    s.enemy={...base.enemy,...(raw.enemy||{})};
    s.enemy.traits={...((raw.enemy&&raw.enemy.traits)||{})};
    s.stats={...base.stats,...(raw.stats||{})};
    s.ui={...base.ui,...(raw.ui||{})};
    s.deck=(Array.isArray(raw.deck)?raw.deck:base.deck).filter(id=>D.CARDS[id]);
    s.relics=(Array.isArray(raw.relics)?raw.relics:[]).filter(id=>D.RELICS[id]).slice(0,3);
    const requestedProtocol=raw.protocol,requestedDoctrine=raw.doctrine;
    if(!D.CHARACTERS[s.character]||!s.unlockedCharacters[s.character])s.character='standard';
    // v0.5までに追加した初期要素も既存セーブで即使用可能。
    D.BASE_CARD_IDS.forEach(id=>s.unlockedCards[id]=true);
    D.BASE_RELIC_IDS.forEach(id=>s.unlockedRelics[id]=true);
    // v0.2以前の進行を新しいデータ駆動アンロックへ移行。
    const oldFlagMap={hp5:'u_hp5',atk5:'u_atk5',def5:'u_def5',spd2:'u_spd2',hp5spd2:'c_longdrive',atk5def5:'c_shatter',giantFast:'r_longdrive',berserkArmored:'r_pressure'};
    Object.entries(oldFlagMap).forEach(([oldKey,newId])=>{if(s.flags[oldKey])s.claimedUnlocks[newId]=true;});
    const defeatMap={giant:'r_giant',berserk:'r_berserk',armored:'r_armored',fast:'r_fast'};
    Object.entries(defeatMap).forEach(([traitId,unlockId])=>{if(s.defeatedTraits[traitId])s.claimedUnlocks[unlockId]=true;});
    if(s.unlockedTraits.tyrant)s.claimedUnlocks.c_tyrant=true;if(s.unlockedTraits.mobile_fortress)s.claimedUnlocks.c_mobile=true;
    // 旧版で第1ボス撃破済みなら、統合後のボス報酬アンロックへ移行。
    if(s.bossDefeated){s.claimedUnlocks.boss_clear=true;s.unlockedSystems.prompt_control=true;}
    if(s.boss2Defeated){s.claimedUnlocks.boss2_clear=true;s.unlockedSystems.card_link=true;s.unlockedSystems.card_conversion=true;}
    if(s.boss3Defeated){s.claimedUnlocks.boss3_clear=true;s.unlockedSystems.deck_doctrine=true;}
    if(s.boss4Defeated){s.claimedUnlocks.boss4_clear=true;s.unlockedSystems.rune=true;s.unlockedSystems.arcana=true;}
    // 達成済みアンロックの報酬を再付与し、追加報酬も取りこぼさない。
    for(const u of D.UNLOCKS||[]){if(!s.claimedUnlocks[u.id])continue;for(const id of u.reward||[])BL.Unlock.grant(s,id);}
    s.protocol=(requestedProtocol&&D.PROTOCOLS?.[requestedProtocol]&&s.unlockedProtocols[requestedProtocol])?requestedProtocol:null;
    s.doctrine=(requestedDoctrine&&D.DOCTRINES?.[requestedDoctrine]&&s.unlockedDoctrines[requestedDoctrine])?requestedDoctrine:null;
    // 調律は存在するカードかつ有効な調律だけ保持。
    for(const [cardId,tuneId] of Object.entries({...s.cardTunings})){const t=D.TUNINGS?.[tuneId];if(!D.CARDS[cardId]||!t||(t.requiresUnlock&&!s.unlockedTunings?.[tuneId]))delete s.cardTunings[cardId];}
    // 最大2種類（第2章の基本仕様）。旧/壊れたセーブも安全に丸める。
    Object.keys(s.cardTunings).slice(2).forEach(id=>delete s.cardTunings[id]);
    // 役割変換は有効なカード・変換だけ保持。最大2種類。
    for(const [cardId,convId] of Object.entries({...s.cardConversions})){const cv=D.CARD_CONVERSIONS?.[convId];if(!D.CARDS[cardId]||!cv||(cv.requiresUnlock&&!s.unlockedConversions?.[convId])||!D.canApplyConversion?.(cardId,convId))delete s.cardConversions[cardId];}
    Object.keys(s.cardConversions).slice(2).forEach(id=>delete s.cardConversions[id]);
    if(!D.CARDS[s.cardLink.a]||!D.CARDS[s.cardLink.b]||s.cardLink.a===s.cardLink.b)s.cardLink={a:null,b:null};
    if(!D.LINK_MODES?.[s.linkMode]||!s.unlockedLinkModes?.[s.linkMode])s.linkMode='reciprocal';
    for(const [charId,styleId] of Object.entries({...s.characterStyles})){const st=D.CHARACTER_STYLES?.[styleId];if(!st||st.character!==charId||!s.unlockedCharacterStyles?.[styleId])delete s.characterStyles[charId];}
    for(const [cardId,runeId] of Object.entries({...s.cardRunes})){if(!D.CARDS[cardId]||!D.RUNES?.[runeId]||!s.unlockedRunes?.[runeId])delete s.cardRunes[cardId];}
    Object.keys(s.cardRunes).slice(3).forEach(id=>delete s.cardRunes[id]);
    if(!D.ARCANA?.[s.arcana?.id]||!s.unlockedArcana?.[s.arcana?.id])s.arcana={id:null,orientation:'upright'};else s.arcana.orientation=s.arcana.orientation==='reversed'?'reversed':'upright';
    s.alchemy=D.ALCHEMY?.normalize(raw.alchemy)||{enabled:false};
    s.version=32;
    return s;
  }

  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw)return mergeDefaults(JSON.parse(raw));
      for(const key of OLD_KEYS){const old=localStorage.getItem(key);if(old)return mergeDefaults(JSON.parse(old));}
    }catch(e){console.warn('save load failed',e);}
    return defaultState();
  }

  function validDefaultDeck(s){
    const rules=D.getDeckRules?D.getDeckRules(s):{deckSize:10,copyLimit:2};
    const pool=[...D.DEFAULT_DECK,...D.BASE_CARD_IDS].filter((id,i,a)=>D.CARDS[id]&&s.unlockedCards[id]&&a.indexOf(id)===i);
    const out=[],counts={};
    for(const id of pool){
      if(out.length>=rules.deckSize)break;
      if((counts[id]||0)>=rules.copyLimit)continue;
      out.push(id);counts[id]=(counts[id]||0)+1;
    }
    // 念のため不足時は解放済みカードから補完。
    if(out.length<rules.deckSize){
      for(const id of Object.keys(D.CARDS)){
        if(out.length>=rules.deckSize)break;
        if(!s.unlockedCards[id]||(counts[id]||0)>=rules.copyLimit)continue;
        out.push(id);counts[id]=(counts[id]||0)+1;
      }
    }
    return out;
  }
  function resetEnemyObject(){return {hp:1,atk:1,def:1,spd:1,regen:0,resist:0,traits:{}};}

  BL.Store={
    KEY,defaultState,mergeDefaults,
    state:load(),
    save(){localStorage.setItem(KEY,JSON.stringify(this.state));},
    resetDeck(){this.state.deck=validDefaultDeck(this.state);this.save();return this.state.deck;},
    clearDeck(){this.state.deck=[];this.save();return this.state.deck;},
    resetAlchemy(){this.state.alchemy=D.ALCHEMY?.defaults()||{enabled:false};this.save();},
    resetRelics(){this.state.relics=[];this.save();},
    resetProtocol(){this.state.protocol=null;this.save();},
    resetTunings(){this.state.cardTunings={};this.save();},
    resetConversions(){this.state.cardConversions={};this.save();},
    resetRunes(){this.state.cardRunes={};this.save();},
    resetArcana(){this.state.arcana={id:null,orientation:'upright'};this.save();},
    resetLinks(){this.state.cardLink={a:null,b:null};this.state.linkMode='reciprocal';this.save();},
    resetDoctrine(){this.state.doctrine=null;this.state.deck=[...D.DEFAULT_DECK];this.save();},
    resetCurrentStyle(){delete this.state.characterStyles[this.state.character];this.save();},
    resetCharacter(){this.state.character='standard';this.save();},
    resetEnemyTraits(){this.state.enemy.traits={};this.save();return this.state.enemy.traits;},
    resetExperiment(){this.state.enemy=resetEnemyObject();this.save();},
    resetBuild(){
      const s=this.state;
      s.alchemy=D.ALCHEMY?.defaults()||{enabled:false};s.character='standard';s.characterStyles={};s.doctrine=null;s.deck=[...D.DEFAULT_DECK];s.relics=[];s.protocol=null;s.cardTunings={};s.cardConversions={};s.cardRunes={};s.arcana={id:null,orientation:'upright'};s.cardLink={a:null,b:null};s.linkMode='reciprocal';s.enemy=resetEnemyObject();
      this.save();return s;
    },
    reset(){localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));this.state=defaultState();this.save();return this.state;}
  };
})();
