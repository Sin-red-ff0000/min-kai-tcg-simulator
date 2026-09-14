'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{}))};

  // v0.29: 解析カード。倍率ではなく、敵の特性・複合挙動に応じてカード本体の効果が別物へ変わる。
  const groups={
    armor:new Set(['armored','regencarapace','v20_aegis','v20_colossus','v23_bedrock','v23_crystal','v24_calcined','v24_crystalline','v26_earthborn','v27_citadel']),
    regen:new Set(['regenerative','hyperregen','regencarapace','v19_mutant','v19_biofortress','v19_plague','v19_rapidregen','v20_bloom','v23_tide','v23_abyss','v24_condense','v24_distilled','v26_waterborn','v27_reclaimer']),
    assault:new Set(['berserk','v19_ravager','v19_vengeful','v20_executioner','v23_cinder','v23_inferno','v24_volatile','v26_fireborn','v26_consumer','v27_predator','v27_crown']),
    speed:new Set(['fast','v19_afterimage','v19_phantom','v19_rapidregen','v20_flash','v23_gale','v23_tempest','v24_distilled','v24_sublime','v26_windborn','v27_oracle']),
    resist:new Set(['purifier','v19_hyperclean','v20_voidskin','v20_aegis','v23_crystal','v23_astral','v24_calcined','v24_catalytic','v24_crystalline','v26_aetherborn','v27_oracle','v27_paradox'])
  };
  D.V29_TRAIT_GROUPS=groups;
  function hasGroup(b,name){const set=groups[name];return !!set&&(b?.enemy?.traits||[]).some(id=>set.has(id));}
  function behaviorProfile(b){const defs=(b?.enemy?.behaviors||[]).map(id=>D.ENEMY_BEHAVIORS?.[id]).filter(Boolean);return {
    heal:defs.some(x=>x.rules?.lowHpRegenMult||x.rules?.healBlockRatio||x.rules?.everyNTurnCleanseHeal||x.rules?.healNextAttackBonus||x.rules?.healNextExtraAction),
    guard:defs.some(x=>x.rules?.everyNTurnBlock||x.rules?.healBlockRatio),
    assault:defs.some(x=>x.rules?.everyNTurnAttackBonus||x.rules?.healNextAttackBonus||x.rules?.lowHpAtkOnce||x.rules?.healNextExtraAction),
    complex:defs.length>=2
  };}

  D.ADAPTIVE_CARDS={
    v29_analyze_edge:{
      name:'解析変刃',base:{kind:'damage',damage:10,tags:['解析','特殊個体','単発']},
      branches:[
        {key:'armor',label:'装甲解析',test:b=>hasGroup(b,'armor'),patch:{damage:15,armorPierce:.65}},
        {key:'regen',label:'再生解析',test:b=>hasGroup(b,'regen'),patch:{damage:11,status:{type:'burn',amount:4}}},
        {key:'assault',label:'攻勢解析',test:b=>hasGroup(b,'assault'),patch:{damage:14,heal:3}}
      ],desc:'10ダメージ。重装系なら15ダメージ＋65%防御貫通、再生系なら11ダメージ＋火傷4、攻勢系なら14ダメージ＋HP3回復。'},
    v29_analyze_wall:{
      name:'解析変壁',base:{kind:'block',block:10,tags:['解析','特殊個体','防御']},
      branches:[
        {key:'assault',label:'攻勢受け',test:b=>hasGroup(b,'assault'),patch:{block:18,counter:.45}},
        {key:'armor',label:'城塞受け',test:b=>hasGroup(b,'armor'),patch:{block:15,heal:4}},
        {key:'speed',label:'高速受け',test:b=>hasGroup(b,'speed'),patch:{block:13,counter:.65}}
      ],desc:'防御10。攻勢系なら防御18＋45%反撃、重装系なら防御15＋HP4回復、高速系なら防御13＋65%反撃。'},
    v29_analyze_status:{
      name:'解析試薬',base:{kind:'hybrid',damage:7,block:5,tags:['解析','特殊個体','状態異常']},
      branches:[
        {key:'resist',label:'耐性崩し',test:b=>hasGroup(b,'resist'),patch:{damage:8,block:5,status:{type:'vulnerable',amount:3},ignoreStatusResist:true}},
        {key:'regen',label:'再生焼灼',test:b=>hasGroup(b,'regen'),patch:{damage:7,block:5,status:{type:'burn',amount:5}}},
        {key:'armor',label:'装甲腐食',test:b=>hasGroup(b,'armor'),patch:{damage:9,block:5,status:{type:'poison',amount:3},armorPierce:.35}}
      ],desc:'7ダメージ＋防御5。耐性系なら脆弱3を耐性無視、再生系なら火傷5、重装系なら毒3＋35%防御貫通へ変化。'},
    v29_analyze_barrage:{
      name:'解析連射',base:{kind:'damage',damage:4,hits:3,tags:['解析','特殊個体','連撃']},
      branches:[
        {key:'armor',label:'穿孔列',test:b=>hasGroup(b,'armor'),patch:{damage:7,hits:2,armorPierce:.55}},
        {key:'regen',label:'焼灼列',test:b=>hasGroup(b,'regen'),patch:{damage:3,hits:4,perHitStatus:{type:'burn',amount:1}}},
        {key:'speed',label:'追随列',test:b=>hasGroup(b,'speed'),patch:{damage:3,hits:5}}
      ],desc:'4×3ダメージ。重装系なら7×2＋55%防御貫通、再生系なら3×4＋各ヒット火傷1、高速系なら3×5へ変化。'},
    v29_behavior_edge:{
      name:'挙動読解刃',base:{kind:'damage',damage:11,tags:['解析','複合挙動','単発']},
      branches:[
        {key:'guard',label:'障壁読解',test:b=>behaviorProfile(b).guard,patch:{damage:14,armorPierce:1}},
        {key:'heal',label:'回復読解',test:b=>behaviorProfile(b).heal,patch:{damage:10,status:{type:'burn',amount:5}}},
        {key:'assault',label:'攻勢読解',test:b=>behaviorProfile(b).assault,patch:{damage:13,block:8}}
      ],desc:'11ダメージ。障壁系挙動なら14ダメージ＋完全防御貫通、回復系なら10ダメージ＋火傷5、攻勢系なら13ダメージ＋防御8。'},
    v29_behavior_wall:{
      name:'挙動読解壁',base:{kind:'block',block:11,tags:['解析','複合挙動','防御']},
      branches:[
        {key:'assault',label:'先読み迎撃',test:b=>behaviorProfile(b).assault,patch:{block:17,counter:.55}},
        {key:'heal',label:'回復封鎖',test:b=>behaviorProfile(b).heal,patch:{block:14,status:{type:'weak',amount:3}}},
        {key:'guard',label:'持久転換',test:b=>behaviorProfile(b).guard,patch:{block:18,heal:3}}
      ],desc:'防御11。攻勢挙動なら防御17＋55%反撃、回復挙動なら防御14＋弱体3、障壁挙動なら防御18＋HP3回復。'},
    v29_behavior_matrix:{
      name:'複合読解行列',base:{kind:'hybrid',damage:7,block:7,tags:['解析','複合挙動','複合']},
      branches:[
        {key:'complex',label:'多重読解',test:b=>behaviorProfile(b).complex,patch:{damage:12,block:12}},
        {key:'heal',label:'生命読解',test:b=>behaviorProfile(b).heal,patch:{damage:8,block:10,heal:5}},
        {key:'assault',label:'攻勢読解',test:b=>behaviorProfile(b).assault,patch:{damage:12,block:8,counter:.35}}
      ],desc:'7ダメージ＋防御7。複合挙動2種以上なら12/12、回復挙動なら8/10＋HP5回復、攻勢挙動なら12/8＋35%反撃。'},
    v29_paradox_reader:{
      name:'逆説読解器',base:{kind:'hybrid',damage:8,block:8,tags:['解析','特殊個体','複合']},
      branches:[
        {key:'mixed',label:'矛盾解析',test:b=>hasGroup(b,'armor')&&hasGroup(b,'assault'),patch:{damage:14,block:14}},
        {key:'endure',label:'耐久解析',test:b=>hasGroup(b,'regen')&&hasGroup(b,'resist'),patch:{damage:9,block:15,heal:5}},
        {key:'tempo',label:'機動解析',test:b=>hasGroup(b,'speed')&&hasGroup(b,'assault'),patch:{damage:5,hits:3,block:7}}
      ],desc:'8ダメージ＋防御8。重装＋攻勢で14/14、再生＋耐性で9/15＋HP5回復、高速＋攻勢で5×3＋防御7へ変化。'}
  };

  D.resolveAdaptiveCard=function(base,instance,battle){
    const spec=D.ADAPTIVE_CARDS?.[instance?.cardId];if(!spec||!battle)return base;
    let resolved={...base,...spec.base,name:spec.name,desc:base.desc||spec.desc,adaptive:true,adaptiveMode:'base'};
    for(const br of spec.branches){if(br.test(battle)){resolved={...resolved,...br.patch,adaptiveMode:br.key,adaptiveLabel:br.label};break;}}
    return resolved;
  };
  for(const [id,spec] of Object.entries(D.ADAPTIVE_CARDS))D.CARDS[id]={id,name:spec.name,desc:spec.desc,...spec.base,requiresUnlock:true,adaptive:true};

  // 条件変化型二面カード4枚。今回は「敵の数」ではなく、プレイ履歴・戦況・錬成工程を変化条件にする。
  const duals={
    v29_dual_pressure:{condition:'防御を20以上保持',front:{name:'耐圧殻',kind:'block',block:10,tags:['二面','防御','解析'],desc:'防御10。防御を20以上保持すると「反圧殻」へ変化。'},back:{name:'反圧殻',kind:'hybrid',damage:11,block:13,counter:.40,tags:['二面','防御','反撃'],desc:'11ダメージ＋防御13。40%反撃。'},check:b=>b.player.block>=20},
    v29_dual_residue:{condition:'このカード自身が一度捨て札になる',front:{name:'未記録片',kind:'damage',damage:9,tags:['二面','捨て札','解析'],desc:'9ダメージ。一度捨て札になった後「記録済片」へ変化。'},back:{name:'記録済片',kind:'hybrid',damage:12,block:8,tags:['二面','捨て札','複合'],desc:'12ダメージ＋防御8。'},check:(b,i)=>!!b.discardedEver?.[i.uid]},
    v29_dual_reactor:{condition:'異なる反応を3種類以上発生',front:{name:'低温炉',kind:'block',block:9,tags:['二面','錬成','防御'],desc:'防御9。反応3種類以上で「臨界炉」へ変化。'},back:{name:'臨界炉',kind:'damage',damage:5,hits:4,tags:['二面','錬成','連撃'],desc:'5×4ダメージ。'},check:b=>Object.values(b.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length>=3},
    v29_dual_adversity:{condition:'HP半分以下かつ逆位置アルカナ',front:{name:'順境写本',kind:'hybrid',damage:7,block:9,tags:['二面','アルカナ','防御'],desc:'7ダメージ＋防御9。HP半分以下かつアルカナ逆位置で「逆境写本」へ変化。'},back:{name:'逆境写本',kind:'hybrid',damage:14,block:7,heal:3,tags:['二面','アルカナ','瀕死'],desc:'14ダメージ＋防御7＋HP3回復。'},check:b=>b.player.hp<=b.player.maxHp/2&&BL.Store.state.arcana?.orientation==='reversed'&&!!BL.Store.state.arcana?.id}
  };
  Object.assign(D.DUAL_FACE_CARDS,duals);for(const [id,df] of Object.entries(duals))D.CARDS[id]={id,name:df.front.name,tags:[...df.front.tags],desc:df.front.desc,kind:df.front.kind,...df.front,dualFace:true,requiresUnlock:true};

  // 解析系サポート。カード本体は分岐効果、装備類は解析札を成立させるための補助に留める。
  D.V29_RELIC_RULES={};
  const relics=[
    ['v29_trait_atlas','形質図譜','解析タグカードは特殊個体2種類以上の敵へ+24%。',{tag:'解析',enemyTraitsMin:2},1.24],
    ['v29_behavior_atlas','挙動図譜','解析タグカードは複合挙動1種類以上の敵へ+25%。',{tag:'解析',enemyBehaviorsMin:1},1.25],
    ['v29_analysis_prism','解析プリズム','解析タグ＋ルーン付与で+30%。',{tag:'解析',runed:true},1.30],
    ['v29_analysis_link','解析継電器','解析タグの連結コンボ+32%。',{tag:'解析',linkActive:true},1.32],
    ['v29_analysis_arcana','解析秘儀鏡','解析タグ＋アルカナ一致で+33%。',{tag:'解析',arcanaMatch:true},1.33],
    ['v29_analysis_residue','解析残滓器','一度捨てられた解析タグカード+34%。',{tag:'解析',discarded:true},1.34]
  ];for(const [id,name,desc,when,mult] of relics){D.RELICS[id]={name,tags:['解析'],desc,requiresUnlock:true};D.V29_RELIC_RULES[id]=[{when,mult}];}

  D.V29_PROTOCOL_RULES={};
  const protocols=[
    ['v29_p_traits','形質解析規格','解析タグ＋特殊個体2種以上で+42%、未達-10%。',{tag:'解析',enemyTraitsMin:2},1.42,.90],
    ['v29_p_behavior','挙動解析規格','解析タグ＋複合挙動1種以上で+44%、未達-11%。',{tag:'解析',enemyBehaviorsMin:1},1.44,.89],
    ['v29_p_rune','刻印解析規格','解析タグ＋ルーン付与で+46%、未達-12%。',{tag:'解析',runed:true},1.46,.88],
    ['v29_p_link','連結解析規格','解析タグ＋連結コンボで+48%、未達-13%。',{tag:'解析',linkActive:true},1.48,.87]
  ];for(const [id,name,desc,when,hit,miss] of protocols){D.PROTOCOLS[id]={name,tags:['解析'],desc,effect:id,requiresUnlock:true};D.V29_PROTOCOL_RULES[id]={when,hit,miss};}

  D.V29_TUNING_RULES={};
  const tunings=[
    ['v29_t_traits','形質同調','解析タグ＋特殊個体3種以上で+50%、未達-14%。',{tag:'解析',enemyTraitsMin:3},1.50,.86],
    ['v29_t_behavior','挙動同調','解析タグ＋複合挙動2種以上で+54%、未達-15%。',{tag:'解析',enemyBehaviorsMin:2},1.54,.85],
    ['v29_t_arcana','秘儀解析同調','解析タグ＋アルカナ一致で+56%、未達-16%。',{tag:'解析',arcanaMatch:true},1.56,.84],
    ['v29_t_residue','残滓解析同調','一度捨てた解析タグカード+58%、未達-17%。',{tag:'解析',discarded:true},1.58,.83]
  ];for(const [id,name,desc,when,hit,miss] of tunings){D.TUNINGS[id]={name,tags:['解析','調律'],desc,effect:id,requiresUnlock:true};D.V29_TUNING_RULES[id]={when,hit,miss};}

  D.V29_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));D.V29_ADAPTIVE_CARD_IDS=Object.keys(D.ADAPTIVE_CARDS);D.V29_DUAL_CARD_IDS=Object.keys(duals);
  D.V29_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));D.V29_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));D.V29_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));
})();
