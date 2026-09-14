'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{}))};

  // v0.31: 選択成長。第2段階を「完成前の弱い形」にせず、維持する理由がある専門形へする。
  // 第3段階への条件はプレイヤーが避けられる行動に置き、育て切るか止めるかを戦闘中の判断にする。
  D.MULTI_STAGE_CARDS=D.MULTI_STAGE_CARDS||{};
  const add=(id,stages,checks)=>{D.MULTI_STAGE_CARDS[id]={stages,checks,choiceGrowth:true};const f=stages[0];D.CARDS[id]={id,...f,name:f.name,desc:f.desc,kind:f.kind,multiStage:true,choiceGrowth:true,requiresUnlock:true};};

  add('v31_stage_tempered',[
    {name:'焼鈍片',kind:'damage',damage:8,tags:['三段階','選択成長','循環','単発'],desc:'8ダメージ。山札を1回再構築すると「靭性刃」へ成長。',stageRole:'準備'},
    {name:'靭性刃',kind:'hybrid',damage:9,block:13,returnBottom:true,tags:['三段階','選択成長','循環','複合'],desc:'9ダメージ＋防御13。使用後は山札下へ戻る。再構築をさらに2回行うと、循環性を失い「焼入刃」へ成長。',stageRole:'循環維持'},
    {name:'焼入刃',kind:'damage',damage:22,armorPierce:.45,tags:['三段階','選択成長','単発'],desc:'22ダメージ＋45%防御貫通。山札下へ戻る効果は失う。',stageRole:'最終火力'}
  ],[b=>b.reshuffles>=1,b=>b.reshuffles>=3]);

  add('v31_stage_reservoir',[
    {name:'空槽',kind:'block',block:8,tags:['三段階','選択成長','錬成','防御'],desc:'防御8。錬成物の在庫が2種類以上になると「調圧槽」へ成長。',stageRole:'準備'},
    {name:'調圧槽',kind:'block',block:16,heal:3,tags:['三段階','選択成長','錬成','防御'],desc:'防御16＋HP3回復。在庫3種類以上を維持する持久形。錬成物を3種類以上消費すると「放出槽」へ成長。',stageRole:'在庫維持'},
    {name:'放出槽',kind:'hybrid',damage:17,block:9,tags:['三段階','選択成長','錬成','複合'],desc:'17ダメージ＋防御9。備蓄型から消費型へ切り替わった最終形。',stageRole:'消費攻勢'}
  ],[
    b=>Object.values(b.alchemy?.stock||{}).filter(n=>Number(n||0)>0).length>=2,
    b=>Object.values(b.alchemy?.used||{}).filter(n=>Number(n||0)>0).length>=3
  ]);

  add('v31_stage_link_guard',[
    {name:'遊線',kind:'damage',damage:8,tags:['三段階','選択成長','連結','単発'],desc:'8ダメージ。連結コンボ1回で「護線」へ成長。',stageRole:'準備'},
    {name:'護線',kind:'hybrid',damage:8,block:14,counter:.35,tags:['三段階','選択成長','連結','複合'],desc:'8ダメージ＋防御14＋反撃35%。連結を2回で止めれば迎撃形を維持。連結コンボ4回で「撃線」へ成長。',stageRole:'迎撃維持'},
    {name:'撃線',kind:'damage',damage:7,hits:3,tags:['三段階','選択成長','連結','連撃'],desc:'7×3ダメージ。防御・反撃を捨てた連結攻勢形。',stageRole:'連撃特化'}
  ],[b=>b.linkComboCount>=1,b=>b.linkComboCount>=4]);

  add('v31_stage_arcana_balance',[
    {name:'余白札',kind:'block',block:7,tags:['三段階','選択成長','アルカナ','防御'],desc:'防御7。アルカナ装備中に2ターン目へ到達すると「均衡札」へ成長。',stageRole:'準備'},
    {name:'均衡札',kind:'hybrid',damage:10,block:12,tags:['三段階','選択成長','アルカナ','複合'],desc:'10ダメージ＋防御12。正位置のままなら均衡形を維持。逆位置で4ターン目へ到達すると「反転札」へ成長。',stageRole:'正位置均衡'},
    {name:'反転札',kind:'damage',damage:19,buffNext:.25,tags:['三段階','選択成長','アルカナ','単発'],desc:'19ダメージ＋次カード+25%。防御を失った逆位置攻勢形。',stageRole:'逆位置攻勢'}
  ],[b=>b.turn>=2&&!!BL.Store.state.arcana?.id,b=>b.turn>=4&&BL.Store.state.arcana?.orientation==='reversed']);

  add('v31_stage_discard_memory',[
    {name:'封緘紙',kind:'block',block:8,tags:['三段階','選択成長','捨て札','防御'],desc:'防御8。このカード自身が捨て札になると「備忘紙」へ成長。',stageRole:'準備'},
    {name:'備忘紙',kind:'hybrid',damage:8,block:12,heal:2,tags:['三段階','選択成長','捨て札','複合'],desc:'8ダメージ＋防御12＋HP2回復。捨て履歴を利用する安定形。自身を3回使用すると「焼却記録」へ成長。',stageRole:'記録維持'},
    {name:'焼却記録',kind:'damage',damage:20,status:{type:'burn',amount:3},tags:['三段階','選択成長','捨て札','単発'],desc:'20ダメージ＋火傷3。回復と防御を捨てた最終記録。',stageRole:'焼却攻勢'}
  ],[b=>false,(b,i)=>Number(i.v30Uses||0)>=3]);
  D.MULTI_STAGE_CARDS.v31_stage_discard_memory.onDiscard=(b,i)=>{if((i.stage||0)<1)i.stage=1;};

  add('v31_stage_adversity_guard',[
    {name:'余裕殻',kind:'hybrid',damage:7,block:8,tags:['三段階','選択成長','瀕死','複合'],desc:'7ダメージ＋防御8。HP70%以下で「背水殻」へ成長。',stageRole:'準備'},
    {name:'背水殻',kind:'block',block:20,heal:4,counter:.30,tags:['三段階','選択成長','瀕死','防御'],desc:'防御20＋HP4回復＋反撃30%。HP35%より上を維持すれば生存形。HP35%以下で「破砕殻」へ成長。',stageRole:'生存維持'},
    {name:'破砕殻',kind:'damage',damage:24,selfDamage:3,tags:['三段階','選択成長','瀕死','単発'],desc:'HP3消費、24ダメージ。防御を捨てた背水攻勢形。',stageRole:'背水火力'}
  ],[b=>b.player.hp<=b.player.maxHp*.70,b=>b.player.hp<=b.player.maxHp*.35]);

  // v0.30 resolverを拡張し、表示側が「途中で止める役割」を示せるようにする。
  const prevResolve=D.resolveMultiStageCard;
  D.resolveMultiStageCard=function(instance,battle,state){
    const c=prevResolve?prevResolve(instance,battle,state):D.CARDS[instance?.cardId];
    const spec=D.MULTI_STAGE_CARDS?.[instance?.cardId];if(!spec||!spec.choiceGrowth)return c;
    const stage=Number(instance.stage||0),final=stage>=spec.stages.length-1;
    return {...c,choiceGrowth:true,stageRole:spec.stages[stage]?.stageRole||'',holdable:stage===1&&!final,growthDecision:stage===1?'この段階を維持可能':'',stageLabel:`${stage+1}/${spec.stages.length}`};
  };

  D.V29_RELIC_RULES=D.V29_RELIC_RULES||{};
  const relics=[
    ['v31_midstage_anchor','中段固定子','選択成長カードが第2段階なら+31%。',{tag:'選択成長',stageExact:1},1.31],
    ['v31_finalstage_core','終段増幅核','選択成長カードが第3段階なら+38%。',{tag:'選択成長',stageExact:2},1.38],
    ['v31_cycle_anchor','循環保持環','三段階＋循環タグカード+26%。',{tag:'三段階',secondTag:'循環'},1.26],
    ['v31_guard_anchor','守勢保持環','選択成長＋防御タグカード+27%。',{tag:'選択成長',secondTag:'防御'},1.27],
    ['v31_commit_lens','転化観測鏡','選択成長カードが最終段階なら+35%。',{tag:'選択成長',stageMin:2},1.35],
    ['v31_halfway_memory','中間記憶槽','選択成長カードが第2段階なら、複合タグをさらに+8%。',{tag:'選択成長',stageExact:1,secondTag:'複合'},1.28]
  ];
  for(const [id,name,desc,when,mult] of relics){D.RELICS[id]={name,tags:['成長','選択成長'],desc,requiresUnlock:true};D.V29_RELIC_RULES[id]=[{when,mult}];}

  D.V29_PROTOCOL_RULES=D.V29_PROTOCOL_RULES||{};
  const protocols=[
    ['v31_p_mid','中段維持規格','選択成長カードの第2段階+48%、第3段階-8%。',{tag:'選択成長',stageExact:1},1.48,.92],
    ['v31_p_final','終段決裁規格','選択成長カードの第3段階+58%、それ以前-12%。',{tag:'選択成長',stageMin:2},1.58,.88],
    ['v31_p_choice','選択成長規格','選択成長タグカード+42%、それ以外-10%。',{tag:'選択成長'},1.42,.90]
  ];
  for(const [id,name,desc,when,hit,miss] of protocols){D.PROTOCOLS[id]={name,tags:['成長','選択成長'],desc,effect:id,requiresUnlock:true};D.V29_PROTOCOL_RULES[id]={when,hit,miss};}

  D.V29_TUNING_RULES=D.V29_TUNING_RULES||{};
  const tunings=[
    ['v31_t_mid','中段同調','選択成長カードの第2段階+60%、それ以外-15%。',{tag:'選択成長',stageExact:1},1.60,.85],
    ['v31_t_final','終段同調','選択成長カードの第3段階+70%、それ以前-20%。',{tag:'選択成長',stageMin:2},1.70,.80],
    ['v31_t_choice','転化同調','選択成長タグカード+52%、未達-14%。',{tag:'選択成長'},1.52,.86]
  ];
  for(const [id,name,desc,when,hit,miss] of tunings){D.TUNINGS[id]={name,tags:['成長','選択成長','調律'],desc,effect:id,requiresUnlock:true};D.V29_TUNING_RULES[id]={when,hit,miss};}

  D.V31_STAGE_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));
  D.V31_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));
  D.V31_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));
  D.V31_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));
})();
