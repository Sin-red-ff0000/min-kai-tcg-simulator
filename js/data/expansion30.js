'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{}))};

  // v0.30: 複合解析 + 3段階成長カード。
  // 二面カードが「固有条件を満たすと別面へ一度だけ変化」なのに対し、
  // 3段階カードは戦闘中の蓄積値を使い、段階的に役割が拡張される。
  const traitSets=D.V29_TRAIT_GROUPS||{};
  const has=(b,key)=>(b?.enemy?.traits||[]).some(id=>traitSets[key]?.has?.(id));
  const behDefs=b=>(b?.enemy?.behaviors||[]).map(id=>D.ENEMY_BEHAVIORS?.[id]).filter(Boolean);
  const behHas=(b,key)=>{
    const defs=behDefs(b);
    if(key==='guard')return defs.some(x=>x.rules?.everyNTurnBlock||x.rules?.healBlockRatio);
    if(key==='heal')return defs.some(x=>x.rules?.lowHpRegenMult||x.rules?.everyNTurnCleanseHeal||x.rules?.healBlockRatio);
    if(key==='assault')return defs.some(x=>x.rules?.everyNTurnAttackBonus||x.rules?.lowHpAtkOnce||x.rules?.healNextAttackBonus||x.rules?.healNextExtraAction);
    return false;
  };

  const composite={
    v30_cross_breaker:{
      name:'交差解析槍',base:{kind:'damage',damage:11,tags:['解析','特殊個体','複合解析','単発']},
      branches:[
        {key:'armor_regen',label:'装甲再生断ち',test:b=>has(b,'armor')&&has(b,'regen'),patch:{damage:16,armorPierce:.70,status:{type:'burn',amount:3}}},
        {key:'speed_assault',label:'高速攻勢迎撃',test:b=>has(b,'speed')&&has(b,'assault'),patch:{damage:6,hits:3,block:7}},
        {key:'resist_regen',label:'耐性再生崩し',test:b=>has(b,'resist')&&has(b,'regen'),patch:{damage:12,status:{type:'vulnerable',amount:4},ignoreStatusResist:true}}
      ],desc:'11ダメージ。敵の特殊個体の組み合わせに応じて、貫通＋火傷、3連撃＋防御、耐性無視の脆弱付与へ変化。'
    },
    v30_cross_bastion:{
      name:'交差解析壁',base:{kind:'block',block:11,tags:['解析','特殊個体','複合解析','防御']},
      branches:[
        {key:'armor_assault',label:'城塞攻勢受け',test:b=>has(b,'armor')&&has(b,'assault'),patch:{block:19,counter:.55}},
        {key:'speed_assault',label:'高速迎撃陣',test:b=>has(b,'speed')&&has(b,'assault'),patch:{block:15,counter:.75}},
        {key:'regen_resist',label:'再生耐性持久',test:b=>has(b,'regen')&&has(b,'resist'),patch:{block:17,heal:5}}
      ],desc:'防御11。敵の特殊個体の組み合わせに応じて、高反撃・高速迎撃・回復付き持久へ変化。'
    },
    v30_behavior_cross:{
      name:'複合挙動断章',base:{kind:'hybrid',damage:8,block:8,tags:['解析','複合挙動','複合解析','複合']},
      branches:[
        {key:'guard_heal',label:'障壁回復分解',test:b=>behHas(b,'guard')&&behHas(b,'heal'),patch:{damage:13,block:10,armorPierce:.80,status:{type:'burn',amount:3}}},
        {key:'guard_assault',label:'攻防交差読解',test:b=>behHas(b,'guard')&&behHas(b,'assault'),patch:{damage:12,block:15,counter:.40}},
        {key:'heal_assault',label:'生命攻勢転写',test:b=>behHas(b,'heal')&&behHas(b,'assault'),patch:{damage:14,block:9,heal:4}}
      ],desc:'8ダメージ＋防御8。複合挙動の組み合わせで、貫通焼灼・反撃・回復付き攻勢へ変化。'
    },
    v30_paradox_array:{
      name:'逆説配列',base:{kind:'damage',damage:12,tags:['解析','特殊個体','複合解析','単発']},
      branches:[
        {key:'triple_a',label:'城塞暴走式',test:b=>has(b,'armor')&&has(b,'assault')&&has(b,'speed'),patch:{damage:7,hits:3,armorPierce:.45}},
        {key:'triple_b',label:'不死耐性式',test:b=>has(b,'regen')&&has(b,'resist')&&has(b,'armor'),patch:{damage:15,status:{type:'burn',amount:4},armorPierce:.45}},
        {key:'triple_c',label:'高速不死式',test:b=>has(b,'speed')&&has(b,'regen')&&has(b,'assault'),patch:{damage:5,hits:4,heal:3}}
      ],desc:'12ダメージ。3系統の特殊個体が重なると、それぞれ専用の高出力解析式へ変化。'
    },
    v30_response_matrix:{
      name:'応答解析行列',base:{kind:'hybrid',damage:9,block:9,tags:['解析','複合挙動','複合解析','複合']},
      branches:[
        {key:'traits_beh',label:'形質挙動交差',test:b=>(b.enemy.traits||[]).length>=3&&(b.enemy.behaviors||[]).length>=2,patch:{damage:14,block:14}},
        {key:'traits',label:'形質優勢',test:b=>(b.enemy.traits||[]).length>=4,patch:{damage:16,block:9}},
        {key:'beh',label:'挙動優勢',test:b=>(b.enemy.behaviors||[]).length>=3,patch:{damage:10,block:17,counter:.35}}
      ],desc:'9ダメージ＋防御9。特殊個体数と複合挙動数の組み合わせで攻防配分が変化。'
    },
    v30_adaptive_relay:{
      name:'解析継電刃',base:{kind:'damage',damage:10,tags:['解析','連結','複合解析','単発']},
      branches:[
        {key:'link_traits',label:'形質継電',test:b=>b.linkComboCount>=2&&(b.enemy.traits||[]).length>=3,patch:{damage:18}},
        {key:'link_beh',label:'挙動継電',test:b=>b.linkComboCount>=2&&(b.enemy.behaviors||[]).length>=2,patch:{damage:6,hits:3,block:5}},
        {key:'link_long',label:'長期継電',test:b=>b.linkComboCount>=3&&b.turn>=4,patch:{damage:15,block:10}}
      ],desc:'10ダメージ。連結コンボを重ねた後、敵形質・複合挙動・長期戦に応じて解析出力が変化。'
    }
  };
  Object.assign(D.ADAPTIVE_CARDS,composite);
  for(const [id,spec] of Object.entries(composite))D.CARDS[id]={id,name:spec.name,desc:spec.desc,...spec.base,requiresUnlock:true,adaptive:true,compositeAdaptive:true};

  D.MULTI_STAGE_CARDS={
    v30_stage_forge:{
      stages:[
        {name:'冷炉刃',kind:'damage',damage:8,tags:['三段階','錬成','単発'],desc:'8ダメージ。異なる錬成反応を2種類起こすと「熱炉刃」へ成長。'},
        {name:'熱炉刃',kind:'damage',damage:12,tags:['三段階','錬成','単発'],desc:'12ダメージ。異なる錬成反応を4種類起こすと「星炉刃」へ成長。'},
        {name:'星炉刃',kind:'damage',damage:5,hits:4,tags:['三段階','錬成','連撃'],desc:'5×4ダメージ。'}
      ],checks:[
        b=>Object.values(b.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length>=2,
        b=>Object.values(b.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length>=4
      ]
    },
    v30_stage_archive:{
      stages:[
        {name:'白紙記録',kind:'block',block:8,tags:['三段階','捨て札','防御'],desc:'防御8。このカード自身が一度捨て札になると「追記記録」へ成長。'},
        {name:'追記記録',kind:'hybrid',damage:8,block:10,tags:['三段階','捨て札','複合'],desc:'8ダメージ＋防御10。このカード自身を2回使用すると「完成記録」へ成長。'},
        {name:'完成記録',kind:'hybrid',damage:13,block:12,heal:3,tags:['三段階','捨て札','複合'],desc:'13ダメージ＋防御12＋HP3回復。'}
      ],checks:[b=>false,(b,i)=>Number(i.v30Uses||0)>=2],
      onDiscard:(b,i)=>{if((i.stage||0)<1)i.stage=1;}
    },
    v30_stage_link:{
      stages:[
        {name:'単線回路',kind:'damage',damage:9,tags:['三段階','連結','単発'],desc:'9ダメージ。連結コンボ1回で「複線回路」へ成長。'},
        {name:'複線回路',kind:'hybrid',damage:10,block:8,tags:['三段階','連結','複合'],desc:'10ダメージ＋防御8。連結コンボ3回で「環状回路」へ成長。'},
        {name:'環状回路',kind:'hybrid',damage:14,block:11,tags:['三段階','連結','複合'],desc:'14ダメージ＋防御11。'}
      ],checks:[b=>b.linkComboCount>=1,b=>b.linkComboCount>=3]
    },
    v30_stage_arcana:{
      stages:[
        {name:'小秘儀片',kind:'block',block:8,tags:['三段階','アルカナ','防御'],desc:'防御8。2ターン目以降に「中秘儀片」へ成長。'},
        {name:'中秘儀片',kind:'hybrid',damage:9,block:9,tags:['三段階','アルカナ','複合'],desc:'9ダメージ＋防御9。4ターン目以降かつアルカナ装備中に「大秘儀片」へ成長。'},
        {name:'大秘儀片',kind:'hybrid',damage:15,block:10,tags:['三段階','アルカナ','複合'],desc:'15ダメージ＋防御10。'}
      ],checks:[b=>b.turn>=2,(b,i,s)=>b.turn>=4&&!!s.arcana?.id]
    },
    v30_stage_reshuffle:{
      stages:[
        {name:'沈殿芽',kind:'block',block:9,tags:['三段階','循環','防御'],desc:'防御9。山札を1回再構築すると「循環芽」へ成長。'},
        {name:'循環芽',kind:'hybrid',damage:8,block:11,tags:['三段階','循環','複合'],desc:'8ダメージ＋防御11。山札を2回再構築すると「輪廻樹」へ成長。'},
        {name:'輪廻樹',kind:'hybrid',damage:12,block:14,heal:4,tags:['三段階','循環','複合'],desc:'12ダメージ＋防御14＋HP4回復。'}
      ],checks:[b=>b.reshuffles>=1,b=>b.reshuffles>=2]
    },
    v30_stage_adversity:{
      stages:[
        {name:'平衡核',kind:'hybrid',damage:7,block:7,tags:['三段階','瀕死','複合'],desc:'7ダメージ＋防御7。HP75%以下で「亀裂核」へ成長。'},
        {name:'亀裂核',kind:'hybrid',damage:11,block:8,tags:['三段階','瀕死','複合'],desc:'11ダメージ＋防御8。HP40%以下で「臨界核」へ成長。'},
        {name:'臨界核',kind:'hybrid',damage:17,block:9,heal:4,tags:['三段階','瀕死','複合'],desc:'17ダメージ＋防御9＋HP4回復。'}
      ],checks:[b=>b.player.hp<=b.player.maxHp*.75,b=>b.player.hp<=b.player.maxHp*.40]
    }
  };
  D.resolveMultiStageCard=function(instance,battle,state){
    const base=D.CARDS[instance?.cardId],spec=D.MULTI_STAGE_CARDS?.[instance?.cardId];if(!spec||!battle)return base;
    instance.stage=Math.max(0,Math.min(spec.stages.length-1,Number(instance.stage||0)));
    let advanced=true;
    while(advanced&&instance.stage<spec.stages.length-1){advanced=false;const check=spec.checks[instance.stage];if(check&&check(battle,instance,state)){instance.stage++;instance.stageAtTurn=battle.turn;advanced=true;}}
    const face=spec.stages[instance.stage];return {...base,...face,id:instance.cardId,multiStage:true,stage:instance.stage,stageLabel:`${instance.stage+1}/${spec.stages.length}`};
  };
  D.noteMultiStageUse=function(instance,battle){if(!D.MULTI_STAGE_CARDS?.[instance?.cardId])return;instance.v30Uses=Number(instance.v30Uses||0)+1;D.resolveMultiStageCard(instance,battle,BL.Store.state);};
  D.noteMultiStageDiscard=function(instance,battle){const spec=D.MULTI_STAGE_CARDS?.[instance?.cardId];if(!spec)return;spec.onDiscard?.(battle,instance,BL.Store.state);D.resolveMultiStageCard(instance,battle,BL.Store.state);};
  for(const [id,spec] of Object.entries(D.MULTI_STAGE_CARDS)){const first=spec.stages[0];D.CARDS[id]={id,name:first.name,desc:first.desc,kind:first.kind,...first,multiStage:true,requiresUnlock:true};}

  // 支援装備。v0.29の汎用条件レイヤーへ登録して既存戦闘処理を再利用する。
  D.V29_RELIC_RULES=D.V29_RELIC_RULES||{};
  const relics=[
    ['v30_growth_lens','成長観測レンズ','三段階タグカード+24%。',{tag:'三段階'},1.24],
    ['v30_composite_scope','複合解析照準器','複合解析タグカード+25%。',{tag:'複合解析'},1.25],
    ['v30_growth_archive','成長記録槽','三段階＋一度捨てたカード+33%。',{tag:'三段階',discarded:true},1.33],
    ['v30_cross_relay','交差継電器','複合解析＋連結コンボで+34%。',{tag:'複合解析',linkActive:true},1.34]
  ];
  for(const [id,name,desc,when,mult] of relics){D.RELICS[id]={name,tags:['解析','成長'],desc,requiresUnlock:true};D.V29_RELIC_RULES[id]=[{when,mult}];}

  D.V29_PROTOCOL_RULES=D.V29_PROTOCOL_RULES||{};
  const protocols=[
    ['v30_p_growth','成長促進規格','三段階タグカード+45%、それ以外-10%。',{tag:'三段階'},1.45,.90],
    ['v30_p_composite','交差解析規格','複合解析タグカード+48%、それ以外-12%。',{tag:'複合解析'},1.48,.88]
  ];
  for(const [id,name,desc,when,hit,miss] of protocols){D.PROTOCOLS[id]={name,tags:['解析','成長'],desc,effect:id,requiresUnlock:true};D.V29_PROTOCOL_RULES[id]={when,hit,miss};}

  D.V29_TUNING_RULES=D.V29_TUNING_RULES||{};
  const tunings=[
    ['v30_t_growth','段階同調','三段階タグカード+56%、未達-15%。',{tag:'三段階'},1.56,.85],
    ['v30_t_composite','交差同調','複合解析タグカード+58%、未達-16%。',{tag:'複合解析'},1.58,.84]
  ];
  for(const [id,name,desc,when,hit,miss] of tunings){D.TUNINGS[id]={name,tags:['解析','成長','調律'],desc,effect:id,requiresUnlock:true};D.V29_TUNING_RULES[id]={when,hit,miss};}

  D.V30_COMPOSITE_CARD_IDS=Object.keys(composite);
  D.V30_STAGE_CARD_IDS=Object.keys(D.MULTI_STAGE_CARDS);
  D.V30_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));
  D.V30_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));
  D.V30_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));
  D.V30_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));
})();
