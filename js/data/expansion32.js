'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{}))};

  // v0.32: 分岐成長。第2段階から、戦闘中の状態に応じて異なる最終形へ固定分岐する。
  // 分岐はカード実体(UID)単位で一度だけ確定し、後から条件が変わっても別枝へ乗り換えない。
  D.BRANCH_STAGE_CARDS=D.BRANCH_STAGE_CARDS||{};
  function add(id,stage0,stage1,enterCheck,branches){
    D.BRANCH_STAGE_CARDS[id]={stage0,stage1,enterCheck,branches};
    D.CARDS[id]={id,...stage0,name:stage0.name,desc:stage0.desc,kind:stage0.kind,multiStage:true,branchGrowth:true,requiresUnlock:true};
  }

  const stockKinds=b=>Object.values(b?.alchemy?.stock||{}).filter(n=>Number(n||0)>0).length;
  const usedKinds=b=>Object.values(b?.alchemy?.used||{}).filter(n=>Number(n||0)>0).length;

  add('v32_branch_forge',
    {name:'粗鉄片',kind:'damage',damage:7,tags:['三段階','分岐成長','錬成','単発'],desc:'7ダメージ。異なる錬成反応を2種類起こすと「鍛造芯」へ成長。'},
    {name:'鍛造芯',kind:'hybrid',damage:9,block:9,tags:['三段階','分岐成長','錬成','複合'],desc:'9ダメージ＋防御9。防御20以上なら「城塞刃」、連結コンボ3回なら「連星刃」へ分岐。'},
    b=>Object.values(b?.alchemy?.reactions||{}).filter(Boolean).length>=2,
    [
      {id:'fortress',label:'城塞枝',check:b=>Number(b?.player?.block||0)>=20,face:{name:'城塞刃',kind:'hybrid',damage:10,block:18,counter:.30,tags:['三段階','分岐成長','錬成','防御','複合'],desc:'10ダメージ＋防御18＋反撃30%。防御を積んだ鍛造の最終形。'}},
      {id:'stars',label:'連星枝',check:b=>Number(b?.linkComboCount||0)>=3,face:{name:'連星刃',kind:'damage',damage:6,hits:3,armorPierce:.25,tags:['三段階','分岐成長','錬成','連結','連撃'],desc:'6×3ダメージ＋25%防御貫通。連結へ寄せた鍛造の最終形。'}}
    ]
  );

  add('v32_branch_arcana',
    {name:'無相札',kind:'block',block:7,tags:['三段階','分岐成長','アルカナ','防御'],desc:'防御7。アルカナ装備中に2ターン目へ到達すると「分岐札」へ成長。'},
    {name:'分岐札',kind:'hybrid',damage:8,block:8,tags:['三段階','分岐成長','アルカナ','複合'],desc:'8ダメージ＋防御8。正位置なら「守護秘儀」、逆位置なら「破戒秘儀」へ分岐。'},
    (b,i,s)=>b.turn>=2&&!!s?.arcana?.id,
    [
      {id:'upright',label:'正位置枝',check:(b,i,s)=>s?.arcana?.orientation!=='reversed',face:{name:'守護秘儀',kind:'block',block:20,heal:4,counter:.20,tags:['三段階','分岐成長','アルカナ','防御'],desc:'防御20＋HP4回復＋反撃20%。正位置の守勢最終形。'}},
      {id:'reversed',label:'逆位置枝',check:(b,i,s)=>s?.arcana?.orientation==='reversed',face:{name:'破戒秘儀',kind:'damage',damage:21,buffNext:.25,tags:['三段階','分岐成長','アルカナ','単発'],desc:'21ダメージ＋次カード+25%。逆位置の攻勢最終形。'}}
    ]
  );

  add('v32_branch_reservoir',
    {name:'未分化槽',kind:'block',block:8,tags:['三段階','分岐成長','錬成','防御'],desc:'防御8。錬成物の在庫または消費が2種類以上になると「分配槽」へ成長。'},
    {name:'分配槽',kind:'hybrid',damage:8,block:11,tags:['三段階','分岐成長','錬成','複合'],desc:'8ダメージ＋防御11。在庫4種類で「保存槽」、消費4種類で「放出槽」へ分岐。'},
    b=>stockKinds(b)>=2||usedKinds(b)>=2,
    [
      {id:'stock',label:'備蓄枝',check:b=>stockKinds(b)>=4,face:{name:'保存槽',kind:'block',block:22,heal:5,tags:['三段階','分岐成長','錬成','防御'],desc:'防御22＋HP5回復。錬成物を残す備蓄最終形。'}},
      {id:'consume',label:'消費枝',check:b=>usedKinds(b)>=4,face:{name:'放出槽',kind:'hybrid',damage:20,block:8,tags:['三段階','分岐成長','錬成','複合'],desc:'20ダメージ＋防御8。錬成物を使い切る消費最終形。'}}
    ]
  );

  add('v32_branch_adversity',
    {name:'可塑殻',kind:'hybrid',damage:7,block:7,tags:['三段階','分岐成長','瀕死','複合'],desc:'7ダメージ＋防御7。HP70%以下で「応力殻」へ成長。'},
    {name:'応力殻',kind:'block',block:15,tags:['三段階','分岐成長','瀕死','防御'],desc:'防御15。HP85%以上まで回復すると「再生殻」、HP35%以下まで踏み込むと「破断殻」へ分岐。'},
    b=>b.player.hp<=b.player.maxHp*.70,
    [
      {id:'recover',label:'回生枝',check:b=>b.player.hp>=b.player.maxHp*.85,face:{name:'再生殻',kind:'block',block:18,heal:7,counter:.20,tags:['三段階','分岐成長','瀕死','防御'],desc:'防御18＋HP7回復＋反撃20%。危機から立て直した回生最終形。'}},
      {id:'break',label:'背水枝',check:b=>b.player.hp<=b.player.maxHp*.35,face:{name:'破断殻',kind:'damage',damage:26,selfDamage:3,armorPierce:.35,tags:['三段階','分岐成長','瀕死','単発'],desc:'HP3消費、26ダメージ＋35%防御貫通。危機へ踏み込んだ背水最終形。'}}
    ]
  );

  add('v32_branch_memory',
    {name:'未整理記録',kind:'block',block:7,tags:['三段階','分岐成長','捨て札','連結','防御'],desc:'防御7。このカード自身が一度捨て札になると「索引記録」へ成長。'},
    {name:'索引記録',kind:'hybrid',damage:8,block:10,tags:['三段階','分岐成長','捨て札','連結','複合'],desc:'8ダメージ＋防御10。同一ターン2枚以上捨てると「廃棄記録」、連結コンボ3回で「結束記録」へ分岐。'},
    (b,i)=>!!b.discardedEver?.[i.uid],
    [
      {id:'discard',label:'廃棄枝',check:b=>Number(b.discardedThisTurn||0)>=2,face:{name:'廃棄記録',kind:'damage',damage:18,status:{type:'burn',amount:3},tags:['三段階','分岐成長','捨て札','単発'],desc:'18ダメージ＋火傷3。捨て札へ寄せた最終記録。'}},
      {id:'link',label:'結束枝',check:b=>Number(b.linkComboCount||0)>=3,face:{name:'結束記録',kind:'hybrid',damage:11,block:15,tags:['三段階','分岐成長','連結','複合'],desc:'11ダメージ＋防御15。連結へ寄せた最終記録。'}}
    ]
  );

  add('v32_branch_tempo',
    {name:'零拍子',kind:'damage',damage:7,tags:['三段階','分岐成長','連撃','循環','単発'],desc:'7ダメージ。3ターン目へ到達すると「分拍子」へ成長。'},
    {name:'分拍子',kind:'hybrid',damage:8,block:8,tags:['三段階','分岐成長','連撃','循環','複合'],desc:'8ダメージ＋防御8。再構築2回なら「輪拍子」、連結コンボ4回なら「連拍子」へ分岐。'},
    b=>b.turn>=3,
    [
      {id:'cycle',label:'循環枝',check:b=>Number(b.reshuffles||0)>=2,face:{name:'輪拍子',kind:'hybrid',damage:10,block:13,heal:3,returnBottom:true,tags:['三段階','分岐成長','循環','複合'],desc:'10ダメージ＋防御13＋HP3回復。使用後は山札下へ戻る循環最終形。'}},
      {id:'chain',label:'連撃枝',check:b=>Number(b.linkComboCount||0)>=4,face:{name:'連拍子',kind:'damage',damage:5,hits:4,tags:['三段階','分岐成長','連撃','連結'],desc:'5×4ダメージ。連結を伸ばした連撃最終形。'}}
    ]
  );

  const prevResolve=D.resolveMultiStageCard;
  D.resolveMultiStageCard=function(instance,battle,state){
    const spec=D.BRANCH_STAGE_CARDS?.[instance?.cardId];
    if(!spec)return prevResolve?prevResolve(instance,battle,state):D.CARDS[instance?.cardId];
    if(!battle)return D.CARDS[instance.cardId];
    instance.stage=Math.max(0,Math.min(2,Number(instance.stage||0)));
    if(instance.stage===0&&spec.enterCheck?.(battle,instance,state)){instance.stage=1;instance.stageAtTurn=battle.turn;}
    if(instance.stage===1&&!instance.branch){
      for(const br of spec.branches){if(br.check?.(battle,instance,state)){instance.branch=br.id;instance.stage=2;instance.stageAtTurn=battle.turn;break;}}
    }
    let face=spec.stage0,branchLabel='';
    if(instance.stage===1)face=spec.stage1;
    else if(instance.stage>=2){const br=spec.branches.find(x=>x.id===instance.branch)||spec.branches[0];face=br.face;branchLabel=br.label;}
    return {...D.CARDS[instance.cardId],...face,id:instance.cardId,multiStage:true,branchGrowth:true,stage:instance.stage,branch:instance.branch||'',branchLabel,stageRole:instance.stage===1?'分岐待機':branchLabel,stageLabel:`${instance.stage+1}/3`};
  };

  const prevUse=D.noteMultiStageUse;
  D.noteMultiStageUse=function(instance,battle){
    if(D.BRANCH_STAGE_CARDS?.[instance?.cardId]){instance.v32Uses=Number(instance.v32Uses||0)+1;D.resolveMultiStageCard(instance,battle,BL.Store.state);return;}
    return prevUse?.(instance,battle);
  };
  const prevDiscard=D.noteMultiStageDiscard;
  D.noteMultiStageDiscard=function(instance,battle){
    if(D.BRANCH_STAGE_CARDS?.[instance?.cardId]){D.resolveMultiStageCard(instance,battle,BL.Store.state);return;}
    return prevDiscard?.(instance,battle);
  };

  D.V29_RELIC_RULES=D.V29_RELIC_RULES||{};
  const relics=[
    ['v32_branch_scope','分岐観測鏡','分岐成長カードが第2段階なら+26%。',{tag:'分岐成長',stageExact:1},1.26],
    ['v32_branch_commit','枝確定核','分岐成長カードが第3段階なら+36%。',{tag:'分岐成長',stageMin:2},1.36],
    ['v32_branch_guard','守勢枝標本','分岐成長＋防御タグカード+29%。',{tag:'分岐成長',secondTag:'防御'},1.29],
    ['v32_branch_multi','連撃枝標本','分岐成長＋連撃タグカード+30%。',{tag:'分岐成長',secondTag:'連撃'},1.30],
    ['v32_branch_cycle','循環枝標本','分岐成長＋循環タグカード+30%。',{tag:'分岐成長',secondTag:'循環'},1.30],
    ['v32_branch_hybrid','複合枝標本','分岐成長＋複合タグカード+28%。',{tag:'分岐成長',secondTag:'複合'},1.28]
  ];
  for(const [id,name,desc,when,mult] of relics){D.RELICS[id]={name,tags:['成長','分岐成長'],desc,requiresUnlock:true};D.V29_RELIC_RULES[id]=[{when,mult}];}

  D.V29_PROTOCOL_RULES=D.V29_PROTOCOL_RULES||{};
  const protocols=[
    ['v32_p_branch','分岐成長規格','分岐成長タグカード+46%、それ以外-11%。',{tag:'分岐成長'},1.46,.89],
    ['v32_p_wait','分岐待機規格','分岐成長カードの第2段階+52%、第3段階-10%。',{tag:'分岐成長',stageExact:1},1.52,.90],
    ['v32_p_commit','枝確定規格','分岐成長カードの第3段階+62%、それ以前-15%。',{tag:'分岐成長',stageMin:2},1.62,.85]
  ];
  for(const [id,name,desc,when,hit,miss] of protocols){D.PROTOCOLS[id]={name,tags:['成長','分岐成長'],desc,effect:id,requiresUnlock:true};D.V29_PROTOCOL_RULES[id]={when,hit,miss};}

  D.V29_TUNING_RULES=D.V29_TUNING_RULES||{};
  const tunings=[
    ['v32_t_branch','分岐同調','分岐成長タグカード+56%、未達-15%。',{tag:'分岐成長'},1.56,.85],
    ['v32_t_wait','分岐待機同調','分岐成長カードの第2段階+64%、それ以外-18%。',{tag:'分岐成長',stageExact:1},1.64,.82],
    ['v32_t_commit','枝確定同調','分岐成長カードの第3段階+74%、それ以前-22%。',{tag:'分岐成長',stageMin:2},1.74,.78]
  ];
  for(const [id,name,desc,when,hit,miss] of tunings){D.TUNINGS[id]={name,tags:['成長','分岐成長','調律'],desc,effect:id,requiresUnlock:true};D.V29_TUNING_RULES[id]={when,hit,miss};}

  D.V32_BRANCH_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));
  D.V32_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));
  D.V32_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));
  D.V32_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));
})();
