'use strict';
(function(){
  const BL=window.BuildLab; const D=BL.Data; const U=BL.Util;
  let seq=0;
  const Battle={current:null,onChange:null,onEnd:null};

  function emit(){if(typeof Battle.onChange==='function')Battle.onChange(Battle.current);}
  function log(msg){const b=Battle.current;if(b)b.log.push(`T${b.turn}：${msg}`);}
  function state(){return BL.Store.state;}
  function hasRelic(id){return state().relics.includes(id);}
  function activeProtocol(id){return state().protocol===id;}
  function tuningFor(instance){return state().cardTunings?.[instance.cardId]||null;}
  function runeFor(instance){const r=D.getCardRune?.(state(),instance.cardId);return r?.id||null;}
  function activeArcana(){const s=state(),id=s.arcana?.id;return id&&D.ARCANA?.[id]&&s.unlockedArcana?.[id]?D.ARCANA[id]:null;}
  function arcanaOrientation(){return state().arcana?.orientation==='reversed'?'reversed':'upright';}
  function conversionFor(instance){return state().cardConversions?.[instance.cardId]||null;}
  function cardTags(instance){return D.getCardTags?D.getCardTags(state(),instance.cardId):(card(instance)?.tags||[]);}
  function isConverted(instance){return !!conversionFor(instance);}
  function deckRules(){return D.getDeckRules?D.getDeckRules(state()):{deckSize:10,copyLimit:2,promptDelta:0,effectMult:1,id:null};}
  function activeStyle(){return D.getCharacterStyle?D.getCharacterStyle(state(),state().character):null;}
  function styleIs(id){return activeStyle()?.id===id;}
  function hasAltStyle(){return !!activeStyle();}
  function deckCopies(id){return state().deck.filter(x=>x===id).length;}
  function distinctDeckTags(){return new Set(state().deck.flatMap(id=>D.getCardTags?D.getCardTags(state(),id):(D.CARDS[id]?.tags||[]))).size;}
  function doctrineActive(){return !!deckRules().id;}
  function linkPair(){const s=state();if(!BL.Unlock.hasSystem(s,'card_link'))return null;const l=s.cardLink||{};return l.a&&l.b&&l.a!==l.b?[l.a,l.b]:null;}
  function activeLinkMode(){const s=state(),id=s.linkMode||'reciprocal';return D.LINK_MODES?.[id]||D.LINK_MODES?.reciprocal||{id:'reciprocal',mult:1.35};}
  function linkPairDisjoint(){const pair=linkPair();if(!pair)return false;const a=D.getCardTags?D.getCardTags(state(),pair[0]):D.CARDS[pair[0]]?.tags||[],b=D.getCardTags?D.getCardTags(state(),pair[1]):D.CARDS[pair[1]]?.tags||[];return !a.some(t=>b.includes(t));}
  function pairIncludesCurrent(instance){const pair=linkPair();return !!(pair&&pair.includes(instance.cardId));}
  function linkedCombo(instance){const b=Battle.current,pair=linkPair();if(!b||!pair||!b.lastUsed)return false;const current=instance.cardId,prev=b.lastUsed.cardId;if(!(pair.includes(current)&&pair.includes(prev)&&current!==prev))return false;const dir=prev===pair[0]&&current===pair[1]?'forward':prev===pair[1]&&current===pair[0]?'reverse':null,mode=activeLinkMode();return !mode.direction||mode.direction===dir;}
  function linkDirection(instance){const b=Battle.current,pair=linkPair();if(!b||!pair||!b.lastUsed)return null;const current=instance.cardId,prev=b.lastUsed.cardId;if(prev===pair[0]&&current===pair[1])return'forward';if(prev===pair[1]&&current===pair[0])return'reverse';return null;}
  function inst(cardId){return {uid:`c${++seq}`,cardId,upgraded:false,wasReserved:false};}
  function card(x){let base=D.CARDS[x.cardId];if(D.resolveDualFaceCard)base=D.resolveDualFaceCard(x,Battle.current,state());if(D.resolveMultiStageCard)base=D.resolveMultiStageCard(x,Battle.current,state());if(D.resolveAdaptiveCard)base=D.resolveAdaptiveCard(base,x,Battle.current,state());return base;}
  function pileFindAndRemove(uid){
    const b=Battle.current;if(!b)return null;
    const piles=['draw','discard','excluded','reserved','prompt','resolving'];
    for(const p of piles){const i=b[p].findIndex(x=>x.uid===uid);if(i>=0)return b[p].splice(i,1)[0];}
    if(b.centerReserved&&b.centerReserved.uid===uid){const x=b.centerReserved;b.centerReserved=null;return x;}
    return null;
  }
  function moveTo(uid,target,front=false){const x=pileFindAndRemove(uid);if(!x)return null;if(target==='centerReserved'){Battle.current.centerReserved=x;return x;}front?Battle.current[target].unshift(x):Battle.current[target].push(x);return x;}
  function allOwnedInstances(){
    const b=Battle.current;if(!b)return[];
    const arr=[...b.draw,...b.discard,...b.excluded,...b.reserved,...b.prompt,...b.resolving];if(b.centerReserved)arr.push(b.centerReserved);return arr;
  }
  function invariant(){
    const b=Battle.current;if(!b)return {ok:true,count:0,unique:0};
    const arr=allOwnedInstances(),uids=arr.map(x=>x.uid),set=new Set(uids);
    return {ok:arr.length===b.initialDeckSize&&set.size===arr.length,count:arr.length,unique:set.size,expected:b.initialDeckSize};
  }
  function statusCount(){const s=Battle.current.enemy.status;return ['poison','burn','vulnerable','weak'].filter(k=>s[k]>0).length;}
  function hasAnyStatus(){return statusCount()>0;}
  function enemyBehaviorCount(){return Battle.current?.enemy?.behaviors?.length||0;}
  function hasEnemyBehavior(id){return !!Battle.current?.enemy?.behaviors?.includes(id);}
  function behaviorDefs(){return (Battle.current?.enemy?.behaviors||[]).map(id=>D.ENEMY_BEHAVIORS?.[id]).filter(Boolean);}
  function v19CardStatus(c,type){
    if(c?.status?.type===type||c?.perHitStatus?.type===type)return true;
    if(Array.isArray(c?.statuses)&&c.statuses.some(x=>x?.type===type))return true;
    return false;
  }
  function v19RuleMatch(when,ctx){
    if(!when)return true;const b=Battle.current;
    if(when.tuned!=null&&!!ctx.tune!==!!when.tuned)return false;
    if(when.runed!=null&&!!ctx.rune!==!!when.runed)return false;
    if(when.converted!=null&&!!ctx.conv!==!!when.converted)return false;
    if(when.tunedOrConverted&&!(ctx.tune||ctx.conv))return false;
    if(when.plainCard&&(ctx.tune||ctx.conv||ctx.rune))return false;
    if(when.augmentationMin!=null&&[ctx.tune,ctx.conv,ctx.rune].filter(Boolean).length<when.augmentationMin)return false;
    if(when.arcanaActive&&!activeArcana())return false;
    if(when.arcanaUpright&&(!activeArcana()||arcanaOrientation()!=='upright'))return false;
    if(when.arcanaReversed&&(!activeArcana()||arcanaOrientation()!=='reversed'))return false;
    if(when.minTags!=null&&ctx.tags.length<when.minTags)return false;if(when.maxTags!=null&&ctx.tags.length>when.maxTags)return false;
    if(when.tag&&!ctx.tags.includes(when.tag))return false;
    const traits=(b.enemy.traits||[]).filter(id=>D.TRAITS[id]).length,beh=enemyBehaviorCount();
    if(when.enemyTraitsMin!=null&&traits<when.enemyTraitsMin)return false;if(when.enemyTraitsMax!=null&&traits>when.enemyTraitsMax)return false;
    if(when.enemyBehaviorsMin!=null&&beh<when.enemyBehaviorsMin)return false;
    if(when.position&&ctx.pos!==when.position)return false;if(when.positionSide&&ctx.pos==='center')return false;
    if(when.positionChanged&&!(b.lastChoicePosition&&ctx.pos!==b.lastChoicePosition))return false;
    if(when.positionSame&&!(b.lastChoicePosition&&ctx.pos===b.lastChoicePosition))return false;
    if(when.linkActive!=null&&!!ctx.linkActive!==!!when.linkActive)return false;if(when.pairCard&&!pairIncludesCurrent(ctx.instance))return false;if(when.notPairCard&&pairIncludesCurrent(ctx.instance))return false;
    if(when.recentReshuffle&&!b.firstCardAfterReshuffle)return false;if(when.lowHp&&b.player.hp>b.player.maxHp/2)return false;if(when.highHp&&b.player.hp<=b.player.maxHp/2)return false;
    if(when.enemyIsBoss&&!b.isBoss)return false;
    if(when.statusMin!=null&&statusCount()<when.statusMin)return false;if(when.statusMax!=null&&statusCount()>when.statusMax)return false;if(when.discarded&&!b.discardedEver[ctx.instance.uid])return false;if(when.notDiscarded&&b.discardedEver[ctx.instance.uid])return false;
    if(when.upgraded&&!ctx.instance.upgraded)return false;if(when.reserved&&!ctx.instance.wasReserved)return false;if(when.notReserved&&ctx.instance.wasReserved)return false;if(when.doctrine&&!doctrineActive())return false;if(when.turnMin!=null&&b.turn<when.turnMin)return false;
    if(when.blockish&&!(ctx.c.kind==='block'||ctx.c.kind==='hybrid'))return false;if(when.counterish&&!(ctx.c.counter||ctx.c.fixedCounter))return false;
    if(when.attackish&&!(ctx.c.kind==='damage'||ctx.c.kind==='hybrid'||ctx.c.damage!=null||ctx.c.hits))return false;
    if(when.selfDamage&&!(ctx.c.selfDamage||ctx.conv==='blood_role'))return false;if(when.selfDamageOrLowHp&&!(ctx.c.selfDamage||ctx.conv==='blood_role'||b.player.hp<=b.player.maxHp/2))return false;
    const hits=Math.max(ctx.c.hits||0,ctx.c.conditionalHits||0,ctx.c.prevAttackHits||0,ctx.c.lowHpHits||0);if(when.hitsMin!=null&&hits<when.hitsMin)return false;if(when.hitsMax!=null&&hits>when.hitsMax)return false;
    if(when.copiesMin!=null&&deckCopies(ctx.instance.cardId)<when.copiesMin)return false;if(when.copiesMax!=null&&deckCopies(ctx.instance.cardId)>when.copiesMax)return false;
    if(when.promptMin!=null&&b.lastPromptCount<when.promptMin)return false;if(when.promptMax!=null&&b.lastPromptCount>when.promptMax)return false;
    if(when.sameAsLast&&(!b.lastUsed||b.lastUsed.cardId!==ctx.instance.cardId))return false;
    if(when.differentFromLast&&(!b.lastUsed||b.lastUsed.cardId===ctx.instance.cardId))return false;
    if(when.altStyle&&!hasAltStyle())return false;if(when.cardStatus&&!v19CardStatus(ctx.c,when.cardStatus))return false;
    if(when.arcanaMatch&&!currentArcanaMatches(ctx))return false;
    const allocation=b?.alchemy?.config?.allocation||state().alchemy?.allocation||{};
    if(when.alchemyEnabled&&!b?.alchemy?.config?.enabled)return false;
    if(when.elementMin){for(const [id,n] of Object.entries(when.elementMin))if(Number(allocation[id]||0)<n)return false;}
    if(when.elementMax){for(const [id,n] of Object.entries(when.elementMax))if(Number(allocation[id]||0)>n)return false;}
    if(when.elementDominant){const ids=Object.keys(D.ELEMENT_INFO||{}),max=Math.max(0,...ids.map(id=>Number(allocation[id]||0)));if(max<=0||Number(allocation[when.elementDominant]||0)!==max)return false;}
    if(when.elementDiversityMin!=null&&Object.keys(D.ELEMENT_INFO||{}).filter(id=>Number(allocation[id]||0)>0).length<when.elementDiversityMin)return false;
    const cardElement=D.RUNES?.[ctx.rune]?.element||D.getCardElement?.(state(),ctx.instance.cardId)||null;
    if(when.cardElement&&cardElement!==when.cardElement)return false;
    if(when.materialMade&&Number(b?.alchemy?.made?.[when.materialMade]||0)<1)return false;
    if(when.materialUsed&&Number(b?.alchemy?.used?.[when.materialUsed]||0)<1)return false;
    if(when.materialStock&&Number(b?.alchemy?.stock?.[when.materialStock]||0)<1)return false;
    if(Array.isArray(when.materialAnyMade)&&!when.materialAnyMade.some(id=>Number(b?.alchemy?.made?.[id]||0)>0))return false;
    if(Array.isArray(when.materialAnyUsed)&&!when.materialAnyUsed.some(id=>Number(b?.alchemy?.used?.[id]||0)>0))return false;
    if(when.materialDiversityMadeMin!=null&&Object.values(b?.alchemy?.made||{}).filter(n=>Number(n||0)>0).length<when.materialDiversityMadeMin)return false;
    if(when.materialDiversityUsedMin!=null&&Object.values(b?.alchemy?.used||{}).filter(n=>Number(n||0)>0).length<when.materialDiversityUsedMin)return false;
    if(when.materialStockDiversityMin!=null&&Object.values(b?.alchemy?.stock||{}).filter(n=>Number(n||0)>0).length<when.materialStockDiversityMin)return false;
    if(when.reactionTypesMin!=null&&Object.values(b?.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length<when.reactionTypesMin)return false;
    const advIds=D.V24_ADVANCED_MATERIAL_IDS||[];
    if(when.advancedMaterialMade&&!advIds.some(id=>Number(b?.alchemy?.made?.[id]||0)>0))return false;
    if(when.advancedMaterialDiversityMin!=null&&advIds.filter(id=>Number(b?.alchemy?.made?.[id]||0)>0).length<when.advancedMaterialDiversityMin)return false;
    if(when.reactionTotalMin!=null&&Object.values(b?.alchemy?.reactions||{}).reduce((a,n)=>a+Number(n||0),0)<when.reactionTotalMin)return false;
    if(when.stageExact!=null&&Number(ctx.instance?.stage||0)!==Number(when.stageExact))return false;
    if(when.stageMin!=null&&Number(ctx.instance?.stage||0)<Number(when.stageMin))return false;
    if(when.secondTag&&!(ctx.c?.tags||[]).includes(when.secondTag))return false;
    return true;
  }
  function currentArcanaMatches(ctx){const a=activeArcana();if(!a)return false;const side=a[arcanaOrientation()];return !!side&&v19RuleMatch(side.when||{},ctx);}
  function v19ApplyClauses(m,clauses,ctx){for(const clause of clauses||[])if(v19RuleMatch(clause.when,ctx))m*=clause.mult||1;return m;}

  const alchemyAPI={damage:n=>dealEnemyDamage(n),heal:n=>healPlayer(n)};
  function create(mode=false){
    const s=state(),rules=deckRules();if(s.deck.length!==rules.deckSize)return {error:`現在の構築規格ではデッキを${rules.deckSize}枚にしてください`};const counts={};for(const id of s.deck){counts[id]=(counts[id]||0)+1;if(rules.id&&counts[id]>rules.copyLimit)return {error:`現在の構築規格では同名カードは${rules.copyLimit}枚までです`};}
    const bossId=mode===true?'boss1':(['boss1','boss2','boss3','boss4'].includes(mode)?mode:null),isBoss=!!bossId;
    const discovered=isBoss?[]:BL.Enemy.detectDiscoveries(s);const behaviorDiscovered=isBoss?[]:BL.Enemy.detectBehaviorDiscoveries(s);BL.Store.save();
    const e=BL.Enemy.effective(s,bossId),c=D.CHARACTERS[s.character];
    const hpPenalty=activeProtocol('scar_exchange')?8:activeProtocol('cycle_prime')?5:0;
    const startHp=Math.max(1,c.hp-hpPenalty);
    const instances=s.deck.map(id=>inst(id));
    Battle.current={
      alchemy:BL.Alchemy?.create(s.alchemy),
      isBoss,bossId,turn:1,initialDeckSize:instances.length,
      player:{hp:startHp,maxHp:startHp,block:0,nextBuff:0,nextPenalty:0},
      enemy:{...e,block:0,status:{poison:0,burn:0,vulnerable:0,weak:0}},
      draw:U.shuffle(instances),discard:[],excluded:[],prompt:[],reserved:[],resolving:[],centerReserved:null,
      discardedEver:{},lastDiscard:null,lastUsed:null,cardUsedThisTurn:null,
      reorderNext:false,redrawNext:false,relicRedrawUsed:false,
      reshuffles:0,recentReshuffle:false,firstReshuffleHealUsed:false,firstCardAfterReshuffle:false,overrotationNext:false,
      lastWasAttack:false,lastWasMulti:false,lastWasBlock:false,discardedThisTurn:0,counter:0,fixedCounter:0,usedBlockUid:null,fastAccumulator:0,perfectWallHealedThisEnemyTurn:false,bastionMemoryHealedThisEnemyTurn:false,statusBlockGained:0,lastChoicePosition:null,previousChoicePosition:null,repeatedPosition:false,positionStreak:0,enemyHealed:false,enemyHealedLastTurn:false,behaviorHealedLastTurn:false,behaviorTriggered:{},enemyTempAtk:0,suppressRegen:false,linkComboCount:0,linkForwardCount:0,linkReverseCount:0,boss4LastLayer:null,boss4RepeatedLayer:false,
      log:[]
    };
    log(`実験開始：${e.name}`);if(discovered.length)log(`特殊個体を発見：${discovered.join(' / ')}`);if(behaviorDiscovered.length)log(`複合挙動を発見：${behaviorDiscovered.join(' / ')}`);
    BL.Alchemy?.supply(Battle.current);
    beginTurn();return {battle:Battle.current,discovered,behaviorDiscovered};
  }

  function promptCount(){const b=Battle.current;let n=3+(deckRules().promptDelta||0);if(activeProtocol('wide_scan'))n++;if(activeProtocol('narrow_scan'))n--;if(hasRelic('selection_lens'))n++;if(hasRelic('empty_crown'))n--;if(hasRelic('wounded_engine')&&b.player.hp<=b.player.maxHp/2)n++;if(b.overrotationNext){n++;b.overrotationNext=false;}if(hasRelic('long_drive_engine')&&b.recentReshuffle)n++;if(hasRelic('highspeed_core')&&b.enemy.spd>=3)n++;return U.clamp(n,2,5);}
  function drawOne(){const b=Battle.current;if(!b.draw.length){if(b.discard.length||b.excluded.length)reshuffle();else return null;}return b.draw.shift();}
  function reshuffle(includeDraw=false){
    const b=Battle.current;const pool=includeDraw?[...b.draw,...b.discard,...b.excluded]:[...b.discard,...b.excluded];if(!pool.length)return;
    b.draw=U.shuffle(pool);b.discard=[];b.excluded=[];b.reshuffles++;b.recentReshuffle=true;b.firstCardAfterReshuffle=true;log('山札を再構築。');BL.Alchemy?.supply(b);
    if(state().character==='loop'&&!styleIs('loop_rebirth')){b.player.block+=3;log('ループ：山札再構築で防御 +3');}
    if(hasRelic('long_observation')&&!b.firstReshuffleHealUsed){healPlayer(Math.round((b.player.maxHp-b.player.hp)*.25));b.firstReshuffleHealUsed=true;}
    if(hasRelic('cycle_bearing')){b.player.block+=6;log('循環軸受：防御 +6');}
    if(hasRelic('restart_capsule'))healPlayer(2);
    if(hasRelic('citadel_loop')){b.player.block+=10;log('城塞環：防御 +10');}
    if(hasRelic('endurance_clock')&&b.reshuffles===1)b.player.nextBuff=Math.max(b.player.nextBuff,.4);
    if(hasRelic('torn_bookmark')&&b.draw.length){const chosen=U.pick(b.draw);moveTo(chosen.uid,'reserved');}
  }
  function beginTurn(){
    const b=Battle.current;if(!b)return;b.player.block=0;b.counter=0;b.fixedCounter=0;b.usedBlockUid=null;b.discardedThisTurn=0;b.perfectWallHealedThisEnemyTurn=false;b.bastionMemoryHealedThisEnemyTurn=false;b.statusBlockGained=0;
    BL.Alchemy?.turn(b,alchemyAPI);if(checkEnd())return;
    if(b.enemy.status.burn>0){dealRawEnemy(b.enemy.status.burn,'火傷');b.enemy.status.burn=Math.max(0,b.enemy.status.burn-1);if(checkEnd())return;}
    const count=promptCount();b.prompt=[];
    const forced=b.centerReserved;b.centerReserved=null;
    while(b.reserved.length&&b.prompt.length<count)b.prompt.push(b.reserved.shift());
    while(b.prompt.length<count){const x=drawOne();if(!x)break;b.prompt.push(x);}
    if(forced){const center=Math.floor((b.prompt.length-1)/2);if(b.prompt[center])b.draw.unshift(b.prompt[center]);b.prompt[center]=forced;}
    if(hasRelic('echo_stone')&&b.lastDiscard&&Math.random()<.55&&!b.prompt.some(x=>x.cardId===b.lastDiscard.cardId)){
      const candidate=[...b.draw,...b.discard,...b.excluded].find(x=>x.cardId===b.lastDiscard.cardId);
      if(candidate&&b.prompt.length){const replace=b.prompt.pop();const moved=pileFindAndRemove(candidate.uid);if(moved)b.prompt.push(moved);if(replace)b.draw.unshift(replace);}
    }
    b.lastPromptCount=b.prompt.length;
    emit();
  }

  function selectedMultiplier(index,instance){
    const b=Battle.current;const c=card(instance),tags=cardTags(instance),conv=conversionFor(instance);const center=Math.floor((b.prompt.length-1)/2),pos=index<center?'left':index===center?'center':'right',tune=tuningFor(instance),rune=runeFor(instance);
    let m=1;
    if(hasRelic('empty_crown'))m*=1.25;
    if(b.player.nextBuff)m*=1+b.player.nextBuff;
    if(b.firstCardAfterReshuffle&&hasRelic('reverse_clock'))m*=1.5;
    if(b.firstCardAfterReshuffle&&hasRelic('circular_blade')&&(c.damage!=null||c.hits))m*=1.25;
    if((c.selfDamage||conv==='blood_role')&&hasRelic('blood_key'))m*=1.3;
    if((c.selfDamage||conv==='blood_role')&&hasRelic('tyrant_heart'))m*=1.2;
    if(hasRelic('center_amplifier')&&index===center)m*=1.2;
    if(hasRelic('last_page')&&b.draw.length<=2)m*=1.25;
    if(hasRelic('thin_deck_sensor')&&b.draw.length<=2)m*=1.12;
    if(hasRelic('crowded_table')&&b.lastPromptCount>=4)m*=1.2;
    if(hasRelic('narrow_focus')&&b.lastPromptCount<=2)m*=1.3;
    if(hasRelic('status_prism')&&statusCount()>=2)m*=1.2;
    if(hasRelic('late_bloom')&&b.turn>=4)m*=1.25;
    if(hasRelic('tempo_spool')&&b.lastWasMulti)m*=1.15;
    if(hasRelic('frenzy_gear')&&b.enemy.spd>=2)m*=1.2;
    if(hasRelic('offcut_engine'))m*=1+Math.min(.24,.08*b.discardedThisTurn);
    if(hasRelic('discard_memory')&&b.discardedEver[instance.uid])m*=1.25;
    if(hasRelic('multi_core')&&(c.hits||0)>=4)m*=1.2;
    if(hasRelic('triage_prism')&&statusCount()>=3)m*=1.3;
    if(hasRelic('last_breath_lens')&&b.player.hp<=b.player.maxHp/2)m*=1.25;
    if(hasRelic('scar_engine')&&(c.selfDamage||conv==='blood_role'))m*=1.2;
    if(hasRelic('cycle_meter'))m*=1+Math.min(.28,.07*b.reshuffles);
    if(hasRelic('hybrid_coupler')&&tags.length>=2)m*=1.15;
    if(hasRelic('rush_prism')&&b.player.hp<=b.player.maxHp/2&&(c.hits||0)>=3)m*=1.3;
    if(hasRelic('execution_lens')&&hasAnyStatus()&&(c.hits||0)>=2)m*=1.25;
    if(hasRelic('fourfold_core')&&tags.length>=3)m*=1.35;
    if(hasRelic('tyrant_crown')&&c.selfDamage&&b.player.hp<=b.player.maxHp/2)m*=1.35;
    if(hasRelic('mobile_gyro')&&(b.lastWasMulti||b.recentReshuffle))m*=1.2;
    if(hasRelic('calibration_core'))m*=1.1;
    if(hasRelic('danger_sensor')&&b.enemy.atk>=30&&(c.kind==='block'||c.kind==='hybrid'))m*=1.25;
    if(hasRelic('center_compass')&&pos==='center')m*=1.12;
    if(hasRelic('reserve_amplifier')&&instance.wasReserved)m*=1.30;
    if(hasRelic('regen_hunter')&&b.enemy.regen>0&&(c.damage!=null||c.hits||c.kind==='hybrid'))m*=1.20;
    if(hasRelic('resistance_converter')&&b.enemy.resist>0)m*=1+Math.floor(b.enemy.resist/20)*.06;
    if(hasRelic('adaptive_lens')&&(b.enemy.regen>0||b.enemy.resist>0)&&tags.length>=2)m*=1.18;
    if(hasRelic('regen_clamp')&&b.enemy.regen>=5&&(c.damage!=null||c.hits||c.kind==='hybrid'))m*=1.18;
    if(hasRelic('null_lens')&&b.enemy.resist>=70)m*=1.20;
    if(hasRelic('convergence_core')&&b.enemy.regen>0&&b.enemy.resist>0&&tags.length>=2)m*=1.22;
    if(hasRelic('tuning_core')&&tune)m*=1.12;
    if(hasRelic('second_observer')&&tune&&pos==='center')m*=1.15;
    if(hasRelic('position_prism')&&b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1+Math.min(.20,.10*((b.positionStreak||0)+1));
    if(state().character==='standard'){if(styleIs('standard_focus'))m*=pos==='center'?1.80:1.10;else if(styleIs('standard_wings'))m*=pos==='center'?.90:1.45;}
    if(state().character==='combo'){const mh=Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0);if(styleIs('combo_catalytic')&&mh>=3)m*=1.25;if(styleIs('combo_precision')&&mh>=5)m*=1.40;}
    if(state().character==='tank'&&styleIs('tank_tempered')&&instance.upgraded)m*=1.18;
    if(state().character==='archive'&&b.discardedEver[instance.uid])m*=styleIs('archive_salvage')?1.15:1.30;
    if(state().character==='vector'){if(styleIs('vector_flux')){if(b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.30;}else if(pos==='center')m*=1.10;}
    if(state().character==='risk'){if(styleIs('risk_crisis')){m*=b.player.hp<=b.player.maxHp/2?1.35:.90;if(c.selfDamage&&b.player.hp<=b.player.maxHp/2)m*=1.10;}else{if(c.selfDamage)m*=1.20;if(b.player.hp<=b.player.maxHp/2)m*=1.15;}}
    if(state().character==='loop'&&b.firstCardAfterReshuffle)m*=styleIs('loop_rebirth')?1.55:1.30;
    if(state().character==='catalyst'){if(styleIs('catalyst_spectrum')){if(statusCount()>=2)m*=1.25;if(statusCount()>=3&&tags.includes('状態異常'))m*=1.15;}else if(tags.includes('状態異常'))m*=1.15;}
    if(hasRelic('residue_memory')&&b.discardedEver[instance.uid])m*=1.14;
    if(hasRelic('spill_engine'))m*=1+Math.min(.40,.05*b.discardedThisTurn);
    if(hasRelic('scar_lens')&&c.selfDamage)m*=1.10;
    if(hasRelic('brink_reactor')&&b.player.hp<=b.player.maxHp/2&&(c.kind==='damage'||c.kind==='hybrid'||c.damage!=null||c.hits))m*=1.30;
    if(hasRelic('loop_core'))m*=1+Math.min(.40,.05*b.reshuffles);
    if(hasRelic('restart_prism')&&b.firstCardAfterReshuffle)m*=1.25;
    if(hasRelic('wall_matrix')&&(c.kind==='block'||c.kind==='hybrid'))m*=1.15;
    if(hasRelic('counter_battery')&&(c.counter||c.fixedCounter))m*=1.20;
    if(hasRelic('multihit_lens')&&Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0)>=4)m*=1.16;
    if(hasRelic('status_matrix')&&statusCount()>=1)m*=1+Math.min(.27,.09*statusCount());
    if(hasRelic('consume_prism')&&(c.consumeStatus||c.consumeStatuses))m*=1.25;
    if(hasRelic('center_archive')&&pos==='center'&&b.discardedEver[instance.uid])m*=1.25;
    if(hasRelic('tuned_scar')&&tune&&(c.selfDamage||conv==='blood_role'))m*=1.25;
    if(hasRelic('tuned_cycle_core')&&tune&&b.firstCardAfterReshuffle)m*=1.25;
    if(hasRelic('regen_guard_lens')&&b.enemy.regen>0&&(c.kind==='block'||c.kind==='hybrid'))m*=1.18;
    if(hasRelic('resist_assault_lens')&&b.enemy.resist>=50&&(c.damage!=null||c.hits||c.kind==='hybrid'))m*=1.18;
    if(tune==='overload')m*=1.25;
    if(tune==='recycle')m*=.90;
    if(tune==='residue')m*=.95;
    if(hasRelic('frenzy_clock')&&b.lastWasMulti&&(c.hits||0)>=2)m*=1.2;
    if(activeProtocol('fortify_calibration')){if(c.kind==='block')m*=1.18;else if(c.kind==='damage')m*=.94;}
    if(activeProtocol('assault_calibration')){if(c.kind==='damage')m*=1.14;else if(c.kind==='block')m*=.92;}
    if(activeProtocol('discard_harness'))m*=.95;
    const protocolHits=Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0);
    if(activeProtocol('multihit_accelerator')){if(protocolHits>=3)m*=1.18;else if((c.damage!=null||c.kind==='hybrid')&&protocolHits<=1)m*=.92;}
    if(activeProtocol('ailment_catalyst')&&(c.damage!=null||c.hits||c.kind==='hybrid'))m*=.92;
    if(activeProtocol('scar_exchange')&&(c.selfDamage||conv==='blood_role'))m*=1.25;
    if(activeProtocol('cycle_prime')&&b.firstCardAfterReshuffle)m*=1.30;
    if(activeProtocol('hybrid_optimizer'))m*=tags.length>=2?1.18:.95;
    if(activeProtocol('counter_matrix')&&c.kind==='damage')m*=.95;
    if(activeProtocol('center_drive'))m*=index===center?1.22:.92;
    if(activeProtocol('wide_scan'))m*=.90;
    if(activeProtocol('narrow_scan'))m*=1.20;
    if(activeProtocol('position_flux')&&b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.18;
    if(activeProtocol('reserve_drive'))m*=instance.wasReserved?1.25:.95;
    if(activeProtocol('anti_regen'))m*=b.enemy.regen>0?1.20:.95;
    if(activeProtocol('tuned_overdrive'))m*=tune?1.18:.95;
    if(activeProtocol('adaptive_build')&&(b.enemy.regen>0||b.enemy.resist>0)&&tags.length>=2)m*=1.20;
    if(activeProtocol('residue_cycle')){const d=tags.includes('捨て札'),cy=tags.includes('循環');if(d||cy)m*=d&&cy?1.30:1.12;}
    if(activeProtocol('critical_maintenance'))m*=b.player.hp<=b.player.maxHp/2?1.25:.92;
    if(activeProtocol('ailment_web')&&tags.includes('状態異常')){m*=1.12;if(statusCount()>=2)m*=1.20;}
    if(activeProtocol('guard_counter')){if(c.kind==='block'||c.kind==='hybrid'||c.counter||c.fixedCounter)m*=1.20;else if(c.kind==='damage')m*=.92;}
    if(activeProtocol('tuned_bridge'))m*=tune&&tags.length>=2?1.25:.95;
    const linkActive=linkedCombo(instance);
    if(linkActive){const lm=activeLinkMode();m*=lm.mult||1.35;if(lm.bridge&&linkPairDisjoint())m*=1.20;}
    if(linkActive&&hasRelic('link_core'))m*=1.20;
    if(linkActive&&hasRelic('linked_tuner')&&tune)m*=1.18;
    if(linkActive&&hasRelic('relay_prism')&&b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.20;
    if(linkActive&&hasRelic('adaptive_router')&&b.enemy.traits.filter(x=>D.TRAITS[x]).length>=2)m*=1.20;
    if(linkActive&&hasRelic('link_cycle_core')&&b.firstCardAfterReshuffle)m*=1.25;
    if(linkActive&&hasRelic('link_scar_core')&&c.selfDamage)m*=1.25;
    if(linkActive&&hasRelic('link_discard_core')&&b.discardedEver[instance.uid])m*=1.20;
    if(linkActive&&hasRelic('link_status_core')&&hasAnyStatus())m*=1.20;
    if(state().character==='relay'&&linkActive){if(styleIs('relay_direction'))m*=linkDirection(instance)==='forward'?1.40:.90;else m*=1.20;}
    if(activeProtocol('link_amplifier'))m*=linkActive?1.25:.95;
    if(activeProtocol('link_guardian')&&linkActive)m*=1.15;
    if(activeProtocol('adaptive_routing')&&linkActive&&b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.35;
    if(activeProtocol('tuned_relay')&&pairIncludesCurrent(instance)){m*=linkActive&&tune?1.30:.95;}
    if(activeProtocol('link_cycle')&&linkActive&&(tags.includes('循環')||b.firstCardAfterReshuffle))m*=1.30;
    if(tune==='focus')m*=pos==='center'?1.30:.90;
    if(tune==='reserve')m*=instance.wasReserved?1.35:.92;
    if(tune==='relay')m*=linkActive?1.30:.90;
    if(tune==='rapid')m*=Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0)>=3?1.30:.92;
    if(tune==='guard')m*=(c.kind==='block'||c.kind==='hybrid')?1.30:.90;
    if(tune==='brink')m*=b.player.hp<=b.player.maxHp/2?1.40:.90;
    const rules=deckRules(),copies=deckCopies(instance.cardId),tagCount=distinctDeckTags();
    m*=rules.effectMult||1;
    if(rules.id==='duplicate')m*=copies>=2?(rules.duplicateMult||1):(rules.uniqueMult||1);
    if(rules.id==='hybrid')m*=tags.length>=2?(rules.hybridMult||1):(rules.singleTagMult||1);
    if(rules.id==='spectrum')m*=tagCount>=(rules.tagDiversityMin||6)?(rules.diverseMult||1):(rules.sparseMult||1);
    if(state().character==='architect'&&rules.id){if(styleIs('architect_specialist'))m*=tags.length===1?1.30:1.05;else{m*=1.10;if(tags.length>=2)m*=1.08;}}
    if(state().character==='echo'){if(styleIs('echo_singleton'))m*=copies===1?1.28:.95;else if(copies>=2)m*=1.22;}
    if(hasRelic('compact_frame')&&state().deck.length<=8)m*=1.18;
    if(hasRelic('expanded_bus')&&state().deck.length>=12)m*=1.15;
    if(hasRelic('singleton_badge')&&copies===1)m*=1.18;
    if(hasRelic('duplicate_stamp')&&copies>=2)m*=1.18;
    if(hasRelic('spectrum_prism')&&tagCount>=6)m*=1.15;
    if(hasRelic('doctrine_core')&&rules.id)m*=1.12;
    if(hasRelic('doctrine_guard')&&rules.id&&(c.kind==='block'||c.kind==='hybrid'))m*=1.18;
    if(hasRelic('doctrine_status')&&rules.id&&tags.includes('状態異常'))m*=1.18;
    if(hasRelic('doctrine_link')&&rules.id&&linkActive)m*=1.20;
    if(hasRelic('doctrine_tuning')&&rules.id&&tune)m*=1.20;
    if(hasRelic('compact_residue')&&state().deck.length<=8&&b.discardedEver[instance.uid])m*=1.20;
    if(hasRelic('compact_cycle')&&state().deck.length<=8&&b.firstCardAfterReshuffle)m*=1.22;
    if(hasRelic('expanded_multi')&&state().deck.length>=12&&protocolHits>=3)m*=1.18;
    if(hasRelic('expanded_status')&&state().deck.length>=12&&tags.includes('状態異常'))m*=1.18;
    if(hasRelic('singleton_counter')&&copies===1&&(c.counter||c.fixedCounter))m*=1.25;
    if(hasRelic('duplicate_discard')&&copies>=2&&tags.includes('捨て札'))m*=1.22;
    if(hasRelic('spectrum_bridge')&&tagCount>=6&&tags.length>=2)m*=1.20;
    if(hasRelic('architect_compass')&&rules.id&&b.lastUsed){const prev=D.CARDS[b.lastUsed.cardId];if(prev&&!prev.tags.some(t=>c.tags.includes(t)))m*=1.18;}
    if(activeProtocol('compact_drive'))m*=state().deck.length<=8?1.20:.93;
    if(activeProtocol('expanded_drive'))m*=state().deck.length>=12?1.18:.93;
    if(activeProtocol('singleton_drive')&&copies===1)m*=1.18;
    if(activeProtocol('duplicate_drive')&&copies>=2)m*=1.18;
    if(activeProtocol('spectrum_drive')&&tagCount>=6)m*=1.15;
    if(activeProtocol('doctrine_bridge'))m*=rules.id?(tags.length>=2?1.20:.95):.95;
    if(tune==='doctrine_tune')m*=rules.id?1.25:.90;
    if(tune==='singular_tune')m*=copies===1?1.30:.90;
    if(tune==='duplicate_tune')m*=copies>=2?1.30:.90;
    if(hasRelic('focal_core')&&pos==='center')m*=1.12;
    if(hasRelic('wing_compass')&&pos!=='center')m*=1.18;
    if(hasRelic('catalytic_mesh')&&Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0)>=3&&tags.includes('状態異常'))m*=1.22;
    if(hasRelic('precision_barrel')&&Math.max(c.hits||0,c.conditionalHits||0,c.prevAttackHits||0,c.lowHpHits||0)>=5)m*=1.24;
    if(hasRelic('forge_memory')&&instance.upgraded)m*=1.20;
    if(hasRelic('flux_gyro')&&b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.18;
    if(hasRelic('salvage_binder')&&b.discardedEver[instance.uid]){m*=1.18;if(c.kind==='block'||c.kind==='hybrid')m*=1.08;}
    if(hasRelic('relay_diode')&&linkDirection(instance)==='forward')m*=1.25;
    if(hasRelic('crisis_prism')&&b.player.hp<=b.player.maxHp/2&&c.selfDamage)m*=1.28;
    if(hasRelic('rebirth_spindle')&&b.firstCardAfterReshuffle)m*=1.28;
    if(hasRelic('spectrum_cell')){if(statusCount()>=2)m*=1.20;if(statusCount()>=3)m*=1.10;}
    if(hasRelic('singleton_mirror')&&copies===1)m*=1.22;
    if(activeProtocol('style_resonance')&&hasAltStyle())m*=1.15;
    if(activeProtocol('focus_calibration'))m*=pos==='center'?1.24:.94;
    if(activeProtocol('forge_calibration'))m*=instance.upgraded?1.25:.95;
    if(activeProtocol('salvage_calibration'))m*=b.discardedEver[instance.uid]?1.25:.95;
    if(activeProtocol('flux_calibration')){if(b.lastChoicePosition&&pos!==b.lastChoicePosition)m*=1.25;else if(b.lastChoicePosition===pos)m*=.92;}
    if(activeProtocol('spectrum_calibration')){if(statusCount()>=2)m*=1.18;if(statusCount()>=3)m*=1.15;}
    if(conv==='residue_role')m*=.82;
    if(conv==='blood_role')m*=1.25;
    if(conv==='cycle_role')m*=.90;
    if(hasRelic('conversion_core')&&conv)m*=1.18;
    if(hasRelic('split_chamber')&&conv==='split')m*=1.20;
    if(hasRelic('bulwark_joint')&&conv==='bulwark')m*=1.18;
    if(hasRelic('counter_hinge')&&conv==='counter_role')m*=1.18;
    if(hasRelic('blood_seal')&&conv==='blood_role')m*=1.20;
    if(hasRelic('cycle_ribbon')&&conv==='cycle_role')m*=1.18;
    if(hasRelic('tuned_converter')&&conv&&tune)m*=1.22;
    if(hasRelic('linked_converter')&&conv&&linkActive)m*=1.22;
    if(hasRelic('style_converter')&&conv&&hasAltStyle())m*=1.18;
    if(hasRelic('doctrine_converter')&&conv&&doctrineActive())m*=1.18;
    if(activeProtocol('conversion_overdrive'))m*=conv?1.22:.95;
    if(activeProtocol('split_matrix')&&(conv==='split'||protocolHits>=4))m*=1.20;
    if(activeProtocol('conversion_guard')){if(conv==='bulwark'||conv==='counter_role')m*=1.22;else if(c.kind==='damage')m*=.95;}
    if(activeProtocol('residue_converter')&&(conv==='residue_role'||tags.includes('捨て札')))m*=1.18;
    if(activeProtocol('blood_converter')&&(conv==='blood_role'||tags.includes('自傷')))m*=1.20;
    if(activeProtocol('conversion_bridge')&&conv&&tags.length>=2)m*=1.25;
    const behaviorCount=enemyBehaviorCount();
    if(behaviorCount>0){
      if(hasRelic('behavior_scope'))m*=1.18;
      if(hasRelic('behavior_hammer')&&(c.kind==='damage'||c.kind==='hybrid'||c.damage!=null||c.hits))m*=1.20;
      if(hasRelic('behavior_wall')&&(c.kind==='block'||c.kind==='hybrid'))m*=1.20;
      if(hasRelic('behavior_catalyst')&&tags.includes('状態異常'))m*=1.20;
      if(hasRelic('behavior_relay')&&linkActive)m*=1.25;
      if(hasRelic('behavior_tuner')&&tune)m*=1.25;
      if(hasRelic('behavior_converter')&&conv)m*=1.25;
      if(hasRelic('behavior_doctrine_relic')&&doctrineActive())m*=1.20;
      if(hasRelic('behavior_style_relic')&&hasAltStyle())m*=1.20;
      if(hasRelic('behavior_discard_relic')&&b.discardedEver[instance.uid])m*=1.20;
      if(hasRelic('behavior_cycle_relic')&&b.firstCardAfterReshuffle)m*=1.22;
      if(hasRelic('behavior_crisis_relic')&&b.player.hp<=b.player.maxHp/2&&(c.selfDamage||conv==='blood_role'))m*=1.28;
    }
    if(activeProtocol('behavior_analysis'))m*=behaviorCount>0?1.20:.95;
    if(activeProtocol('behavior_assault')&&behaviorCount>0&&protocolHits>=3)m*=1.24;
    if(activeProtocol('behavior_fortify')&&behaviorCount>0&&(c.kind==='block'||c.kind==='hybrid'||c.counter||c.fixedCounter))m*=1.24;
    if(activeProtocol('behavior_ailment')&&behaviorCount>0&&tags.includes('状態異常'))m*=1.24;
    if(activeProtocol('behavior_bridge_protocol')&&behaviorCount>0&&(tune||conv))m*=1.25;
    if(activeProtocol('behavior_combo_protocol')&&behaviorCount>=2)m*=1.28;
    for(const rid of state().relics||[]){const rr=D.V13_RELIC_RULES?.[rid];if(!rr)continue;if(rr.tag&&!tags.includes(rr.tag))continue;if(rr.linked&&!linkActive)continue;if(rr.mode&&activeLinkMode().id!==rr.mode)continue;if(rr.direction&&linkDirection(instance)!==rr.direction)continue;if(rr.bridgeDisjoint&&!linkPairDisjoint())continue;if(rr.altStyle&&!hasAltStyle())continue;if(rr.converted&&!conv)continue;m*=rr.mult||1;}
    for(const rid of state().relics||[]){const rr=D.V14_RELIC_RULES?.[rid];if(!rr)continue;if(rr.tag&&!tags.includes(rr.tag))continue;if(rr.tags){const hitCount=rr.tags.filter(t=>tags.includes(t)).length;if(rr.requireAll&&hitCount<rr.tags.length)continue;if(!rr.requireAll&&hitCount===0)continue;}if(rr.altStyle&&!hasAltStyle())continue;if(rr.tuned&&!tune)continue;if(rr.converted&&!conv)continue;if(rr.enemyBehavior&&behaviorCount<=0)continue;if(rr.doctrine&&!doctrineActive())continue;if(rr.linkedCard&&!pairIncludesCurrent(instance))continue;m*=rr.mult||1;}
    const pr=D.V13_PROTOCOL_RULES?.[state().protocol];if(pr){const hits=(pr.tags||[]).filter(t=>tags.includes(t)).length;if(hits>=2)m*=1.28;else if(hits===1)m*=1.12;else m*=.95;}
    const pr14=D.V14_PROTOCOL_RULES?.[state().protocol];if(pr14){if(pr14.tags){const hits=pr14.tags.filter(t=>tags.includes(t)).length;if(hits>=2)m*=pr14.double||1;else if(hits===1)m*=pr14.single||1;else m*=pr14.miss||1;}else{let ok=true;if(pr14.altStyle&&!hasAltStyle())ok=false;if(pr14.tuned&&!tune)ok=false;if(pr14.converted&&!conv)ok=false;if(pr14.enemyBehavior&&behaviorCount<=0)ok=false;m*=ok?(pr14.hit||1):(pr14.miss||1);}}
    const v19ctx={instance,c,tags,tune,conv,rune,pos,linkActive};
    const v19style=activeStyle();const v19charClauses=(v19style&&D.V19_STYLE_RULES?.[v19style.id])||D.V19_CHARACTER_RULES?.[state().character];
    if(v19charClauses)m=v19ApplyClauses(m,v19charClauses,v19ctx);
    for(const rid of state().relics||[]){const clauses=D.V19_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr19=D.V19_PROTOCOL_RULES?.[state().protocol];if(pr19)m*=v19RuleMatch(pr19.when,v19ctx)?(pr19.hit||1):(pr19.miss||1);
    const tr19=D.V19_TUNING_RULES?.[tune];if(tr19)m*=v19RuleMatch(tr19.when,v19ctx)?(tr19.hit||1):(tr19.miss||1);
    const v20style=activeStyle();const v20charClauses=(v20style&&D.V20_STYLE_RULES?.[v20style.id])||D.V20_CHARACTER_RULES?.[state().character];if(v20charClauses)m=v19ApplyClauses(m,v20charClauses,v19ctx);
    for(const rid of state().relics||[]){const clauses=D.V20_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr20=D.V20_PROTOCOL_RULES?.[state().protocol];if(pr20)m*=v19RuleMatch(pr20.when,v19ctx)?(pr20.hit||1):(pr20.miss||1);
    for(const rid of state().relics||[]){const clauses=D.V22_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr22=D.V22_PROTOCOL_RULES?.[state().protocol];if(pr22)m*=v19RuleMatch(pr22.when,v19ctx)?(pr22.hit||1):(pr22.miss||1);
    const tr20=D.V20_TUNING_RULES?.[tune];if(tr20)m*=v19RuleMatch(tr20.when,v19ctx)?(tr20.hit||1):(tr20.miss||1);
    const v23style=activeStyle();const v23charClauses=(v23style&&D.V23_STYLE_RULES?.[v23style.id])||D.V23_CHARACTER_RULES?.[state().character];if(v23charClauses)m=v19ApplyClauses(m,v23charClauses,v19ctx);
    for(const rid of state().relics||[]){const clauses=D.V23_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr23=D.V23_PROTOCOL_RULES?.[state().protocol];if(pr23)m*=v19RuleMatch(pr23.when,v19ctx)?(pr23.hit||1):(pr23.miss||1);
    const tr23=D.V23_TUNING_RULES?.[tune];if(tr23)m*=v19RuleMatch(tr23.when,v19ctx)?(tr23.hit||1):(tr23.miss||1);
    const v24style=activeStyle();const v24charClauses=(v24style&&D.V24_STYLE_RULES?.[v24style.id])||D.V24_CHARACTER_RULES?.[state().character];if(v24charClauses)m=v19ApplyClauses(m,v24charClauses,v19ctx);
    for(const rid of state().relics||[]){const clauses=D.V24_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr24=D.V24_PROTOCOL_RULES?.[state().protocol];if(pr24)m*=v19RuleMatch(pr24.when,v19ctx)?(pr24.hit||1):(pr24.miss||1);
    const tr24=D.V24_TUNING_RULES?.[tune];if(tr24)m*=v19RuleMatch(tr24.when,v19ctx)?(tr24.hit||1):(tr24.miss||1);
    for(const rid of state().relics||[]){const clauses=D.V26_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr26=D.V26_PROTOCOL_RULES?.[state().protocol];if(pr26)m*=v19RuleMatch(pr26.when,v19ctx)?(pr26.hit||1):(pr26.miss||1);
    const tr26=D.V26_TUNING_RULES?.[tune];if(tr26)m*=v19RuleMatch(tr26.when,v19ctx)?(tr26.hit||1):(tr26.miss||1);
    const v26style=activeStyle();const v26charClauses=(v26style&&D.V26_STYLE_RULES?.[v26style.id])||D.V26_CHARACTER_RULES?.[state().character];if(v26charClauses)m=v19ApplyClauses(m,v26charClauses,v19ctx);
    const card27=D.V27_CARD_RULES?.[instance.cardId];if(card27)m=v19ApplyClauses(m,card27,v19ctx);
    for(const rid of state().relics||[]){const clauses=D.V27_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr27=D.V27_PROTOCOL_RULES?.[state().protocol];if(pr27)m*=v19RuleMatch(pr27.when,v19ctx)?(pr27.hit||1):(pr27.miss||1);
    const tr27=D.V27_TUNING_RULES?.[tune];if(tr27)m*=v19RuleMatch(tr27.when,v19ctx)?(tr27.hit||1):(tr27.miss||1);
    for(const rid of state().relics||[]){const clauses=D.V29_RELIC_RULES?.[rid];if(clauses)m=v19ApplyClauses(m,clauses,v19ctx);}
    const pr29=D.V29_PROTOCOL_RULES?.[state().protocol];if(pr29)m*=v19RuleMatch(pr29.when,v19ctx)?(pr29.hit||1):(pr29.miss||1);
    const tr29=D.V29_TUNING_RULES?.[tune];if(tr29)m*=v19RuleMatch(tr29.when,v19ctx)?(tr29.hit||1):(tr29.miss||1);
    const v27style=activeStyle();const v27charClauses=(v27style&&D.V27_STYLE_RULES?.[v27style.id])||D.V27_CHARACTER_RULES?.[state().character];if(v27charClauses)m=v19ApplyClauses(m,v27charClauses,v19ctx);
    if(rune){const rr=D.RUNES?.[rune];if(rr&&v19RuleMatch(rr.when||{},v19ctx))m*=rr.hit||1;}
    const arc=activeArcana();if(arc){const side=arc[arcanaOrientation()];if(side&&v19RuleMatch(side.when||{},v19ctx))m*=side.mult||1;}
    if(b.player.nextPenalty)m*=Math.max(0,1-b.player.nextPenalty);
    return m;
  }

  function resolvedHits(instance,position){const b=Battle.current,c=card(instance),conv=conversionFor(instance),linkActive=linkedCombo(instance);let hits=c.hits||((c.damage!=null||c.kind==='hybrid')?1:0);if(c.conditionalHits&&hasAnyStatus())hits=c.conditionalHits;if(c.prevAttackHits&&b.lastWasAttack)hits=c.prevAttackHits;if(c.prevMultiHits&&b.lastWasMulti)hits=c.prevMultiHits;if(c.lowHpHits&&b.player.hp<=b.player.maxHp/2)hits=c.lowHpHits;if(c.hitsIfRecentReshuffle&&b.recentReshuffle)hits=c.hitsIfRecentReshuffle;if(c.hitsIfPosition&&(position||b.lastChoicePosition)===c.hitsIfPosition.position)hits=c.hitsIfPosition.value;if(c.hitsIfTuned&&tuningFor(instance))hits=c.hitsIfTuned;if(c.hitsIfLinkedCombo&&linkActive)hits=c.hitsIfLinkedCombo;if(c.hitsIfLinkForward&&linkActive&&linkDirection(instance)==='forward')hits=c.hitsIfLinkForward;if(c.hitsIfLinkReverse&&linkActive&&linkDirection(instance)==='reverse')hits=c.hitsIfLinkReverse;if(c.hitsIfDeckSizeMax&&state().deck.length<=c.hitsIfDeckSizeMax.max)hits=c.hitsIfDeckSizeMax.value;if(c.hitsIfDeckSizeMin&&state().deck.length>=c.hitsIfDeckSizeMin.min)hits=c.hitsIfDeckSizeMin.value;if(c.hitsIfUniqueCopy&&deckCopies(instance.cardId)===1)hits=c.hitsIfUniqueCopy;if(c.hitsIfDuplicateCopy&&deckCopies(instance.cardId)>=2)hits=c.hitsIfDuplicateCopy;if(c.hitsIfDoctrine&&doctrineActive())hits=c.hitsIfDoctrine;if(c.hitsIfDeckTagMin&&distinctDeckTags()>=c.hitsIfDeckTagMin.min)hits=c.hitsIfDeckTagMin.value;if(c.hitsIfConverted&&conv)hits=c.hitsIfConverted;if(c.hitsIfEnemyBehavior&&enemyBehaviorCount()>0)hits=c.hitsIfEnemyBehavior;return hits;}
  function play(index){
    const b=Battle.current;if(!b||!b.prompt[index])return;
    const selected=b.prompt[index],c=card(selected),center=Math.floor((b.prompt.length-1)/2),others=b.prompt.filter((_,i)=>i!==index),prevPos=b.lastChoicePosition,pos=index<center?'left':index===center?'center':'right',tune=tuningFor(selected),conv=conversionFor(selected),selectedWasReserved=!!selected.wasReserved;
    const alchemyCard={...c,hits:resolvedHits(selected,pos)};if(conv==='split'&&alchemyCard.hits===1)alchemyCard.hits=3;
    const linkActive=linkedCombo(selected),mult=selectedMultiplier(index,selected)*(1+(BL.Alchemy?.beforeCard(b,alchemyCard,alchemyAPI)||0)),kindKey=(conv==='bulwark'||conv==='counter_role')?'hybrid':(c.kind==='hybrid'?'hybrid':(c.kind||'utility')),boss4Layer=linkActive?'link':(tune&&conv?'dual':tune?'tune':conv?'conversion':(cardTags(selected).length>=2?'hybrid':'base'));b.player.nextBuff=0;b.player.nextPenalty=0;b.firstCardAfterReshuffle=false;b.previousChoicePosition=prevPos;b.repeatedPosition=!!(prevPos&&prevPos===pos);b.lastChoicePosition=pos;b.positionStreak=(prevPos&&prevPos!==pos)?Math.min(2,(b.positionStreak||0)+1):0;b.boss3RepeatedKind=!!(b.bossId==='boss3'&&b.lastUsedKind&&b.lastUsedKind===kindKey);b.lastUsedKind=kindKey;b.boss4RepeatedLayer=!!(b.bossId==='boss4'&&b.boss4LastLayer&&b.boss4LastLayer===boss4Layer);b.boss4LastLayer=boss4Layer;
    // prompt所有権を先に解消。選ばれなかったカードは捨て札/除外へ。
    b.prompt=[];b.resolving.push(selected);others.forEach(x=>discardInstance(x,true));
    const repeat=(state().character==='standard'&&!hasAltStyle()&&index===center)?2:1;if(repeat===2)log(`${D.CHARACTERS.standard.name}：中央枠を2回発動。`);
    for(let r=0;r<repeat;r++){applyCard(selected,mult);if(checkEnd())return;}if(D.noteMultiStageUse)D.noteMultiStageUse(selected,b);
    if(state().character==='vector'){if(styleIs('vector_flux')){if(prevPos&&prevPos!==pos){b.player.block+=4;log('ベクトル・流動型：位置変更で防御 +4');}}else{if(pos==='left'){b.player.block+=5;log('ベクトル：左枠選択で防御 +5');}else if(pos==='right'){b.player.nextBuff=Math.max(b.player.nextBuff,.25);log('ベクトル：右枠選択で次カード強化。');}}}
    if(state().character==='archive'&&styleIs('archive_salvage')&&b.discardedEver[selected.uid]){b.player.block+=5;log('アーカイブ・回収型：防御 +5');}
    if(linkActive){const dir=linkDirection(selected);b.linkComboCount++;if(dir==='forward')b.linkForwardCount++;if(dir==='reverse')b.linkReverseCount++;log(`カード連結：${activeLinkMode().name}コンボ成立${dir==='forward'?'（A→B）':dir==='reverse'?'（B→A）':''}。`);if(state().character==='relay'&&!styleIs('relay_direction')){b.player.block+=3;log('リレー：防御 +3');}if(hasRelic('relay_buffer')){b.player.block+=4;log('継電バッファ：防御 +4');}if(hasRelic('twin_guard')&&(c.kind==='block'||c.kind==='hybrid')){b.player.block+=4;log('双極装甲：防御 +4');}if(hasRelic('pair_memory'))b.player.nextBuff=Math.max(b.player.nextBuff,.10);if(hasRelic('chain_reserve')&&selectedWasReserved)b.player.nextBuff=Math.max(b.player.nextBuff,.20);if(activeProtocol('link_guardian')){b.player.block+=3;log('連結防護規格：防御 +3');}}
    if(hasRelic('left_battery')&&pos==='left'){b.player.block+=4;log('左翼蓄電池：防御 +4');}
    if(hasRelic('right_capacitor')&&pos==='right')b.player.nextBuff=Math.max(b.player.nextBuff,.15);
    if(tune==='overload'&&hasRelic('overload_sink')){b.player.block+=5;log('過負荷吸収槽：防御 +5');}
    if(tune==='recycle'&&hasRelic('recycle_rotor'))b.player.nextBuff=Math.max(b.player.nextBuff,.10);
    b.lastWasBlock=(c.kind==='block'||c.kind==='hybrid'||conv==='bulwark'||conv==='counter_role');
    if(c.kind==='block'||c.kind==='hybrid'||conv==='bulwark'||conv==='counter_role')b.usedBlockUid=selected.uid;b.lastUsed=selected;if(state().character==='tank')b.cardUsedThisTurn=selected;
    if(c.effect==='centerReserve'&&others[0])reserveExisting(others[0],true);
    if(c.effect==='holdOne'&&others[0])reserveExisting(others[0],false);
    if(c.effect==='reorderNext')b.reorderNext=true;if(c.effect==='redrawNext')b.redrawNext=true;
    if(hasRelic('holding_tank')&&others[0])reserveExisting(others[0],false);
    // 選択カードを必ず「移動」させる。複製しない。
    pileFindAndRemove(selected.uid);selected.wasReserved=false;if(tune==='overload'||c.v22Route==='exclude'||((c.selfDamage||conv==='blood_role')&&hasRelic('blood_key')))b.excluded.push(selected);else if(c.returnBottom||c.v22Route==='bottom'||tune==='recycle'||conv==='cycle_role'||(hasRelic('cycle_reserve')&&selectedWasReserved))b.draw.push(selected);else b.discard.push(selected);
    BL.Alchemy?.afterCard(b,alchemyCard,alchemyAPI);if(checkEnd())return;
    b.recentReshuffle=false;
    enemyTurn();
  }

  function reserveExisting(instance,center=false){const moved=moveTo(instance.uid,center?'centerReserved':'reserved');if(moved){moved.wasReserved=true;log(`《${card(moved).name}》を${center?'中央に':'次ターンへ'}予約。`);}}

  function discardInstance(instance,fromPrompt){
    const b=Battle.current,c=card(instance);b.lastDiscard=instance;b.discardedEver[instance.uid]=true;b.discardedThisTurn++;if(D.noteMultiStageDiscard)D.noteMultiStageDiscard(instance,b);
    // 選別のレンズは次の再構築まで専用除外パイルへ。
    (hasRelic('selection_lens')?b.excluded:b.discard).push(instance);
    if(fromPrompt&&c.onDiscard){
      let m=hasRelic('discard_furnace')?1.5:1;if(activeProtocol('discard_harness'))m*=1.5;
      if(c.onDiscard.block){const n=Math.round(c.onDiscard.block*m);b.player.block+=n;log(`《${c.name}》捨て札効果：防御 +${n}`);}
      if(c.onDiscard.damage){const n=Math.round(c.onDiscard.damage*m);dealRawEnemy(n,`${c.name}の捨て札効果`);}
      if(c.onDiscard.heal)healPlayer(Math.round(c.onDiscard.heal*m));if(c.onDiscard.buffNext)b.player.nextBuff=Math.max(b.player.nextBuff,c.onDiscard.buffNext*m);
      if(c.onDiscard.status){let n=c.onDiscard.amount;if(hasRelic('ash_collector')&&['poison','burn'].includes(c.onDiscard.status))n++;applyStatus(c.onDiscard.status,Math.max(1,Math.round(n*m)));}
      if(hasRelic('discard_dagger'))dealRawEnemy(3,'廃棄短剣');
      if(hasRelic('salvage_mesh')){b.player.block+=2;log('回収網：防御 +2');}
      if(hasRelic('discard_capacitor'))b.player.nextBuff=Math.max(b.player.nextBuff,.2);
    }
    if(fromPrompt&&tuningFor(instance)==='residue'){b.player.nextBuff=Math.max(b.player.nextBuff,.15);if(hasRelic('residue_receiver')){b.player.block+=4;log('残滓受信器：防御 +4');}}
    if(fromPrompt&&conversionFor(instance)==='residue_role'){let bonus=.25;if(hasRelic('residue_vat'))bonus+=.10;b.player.nextBuff=Math.max(b.player.nextBuff,bonus);log(`残滓変換：次カード +${Math.round(bonus*100)}%`);}
    if(fromPrompt)instance.wasReserved=false;
  }

  function upgradedMult(instance){return instance.upgraded?1.35:1;}
  function applyCard(instance,baseMult=1){
    const b=Battle.current,c=card(instance),conv=conversionFor(instance),linkActive=linkedCombo(instance),mult=baseMult*upgradedMult(instance);log(`《${c.name}${instance.upgraded?'＋':''}${conv?'［'+D.CARD_CONVERSIONS[conv].name.replace('変換','')+'］':''}》`);
    if(conv==='blood_role'){let extra=hasRelic('blood_seal')?2:3;b.player.hp=Math.max(0,b.player.hp-extra);log(`血契変換・自傷 ${extra}`);if(hasRelic('clotting_unit')){b.player.block+=4;log('血液凝固器：防御 +4');}if(checkEnd())return;}
    if(c.selfDamage){const d=Math.round(c.selfDamage);b.player.hp=Math.max(0,b.player.hp-d);log(`自傷 ${d}`);if(hasRelic('clotting_unit')){b.player.block+=4;log('血液凝固器：防御 +4');}if(hasRelic('pain_converter')){b.player.block+=d;log(`疼痛変換器：防御 +${d}`);}if(hasRelic('red_gear'))b.player.nextBuff=Math.max(b.player.nextBuff,.15);if(hasRelic('blood_iron_reactor')){b.player.block+=3;b.player.nextBuff=Math.max(b.player.nextBuff,.1);log('鉄血炉：防御 +3 / 次カード強化');}if(checkEnd())return;}
    if(c.block!=null||c.kind==='hybrid'||conv==='bulwark'||conv==='counter_role'){
      let v=c.block||0;if(conv==='bulwark')v+=hasRelic('bulwark_joint')?10:8;if(conv==='counter_role')v*=.80;if(c.lowHpBlock&&b.player.hp<=b.player.maxHp/2)v=c.lowHpBlock;if(c.discardBlockBoost&&b.discardedEver[instance.uid])v=c.discardBlockBoost;if(c.blockIfRecentReshuffle&&b.recentReshuffle)v=c.blockIfRecentReshuffle;if(c.blockIfPrevAttack&&b.lastWasAttack)v=c.blockIfPrevAttack;if(c.blockIfPrevBlock&&b.lastWasBlock)v=c.blockIfPrevBlock;if(c.blockIfTurnMin&&b.turn>=c.blockIfTurnMin.turn)v=c.blockIfTurnMin.value;if(c.blockPerReshuffle)v+=c.blockPerReshuffle*b.reshuffles;if(c.blockPerDiscardedThisTurn)v+=c.blockPerDiscardedThisTurn*b.discardedThisTurn;if(c.blockPerStatusType)v+=c.blockPerStatusType*statusCount();if(c.blockIfPrevMulti&&b.lastWasMulti)v=c.blockIfPrevMulti;if(c.blockIfDrawMax&&b.draw.length<=c.blockIfDrawMax.max)v=c.blockIfDrawMax.value;if(c.blockIfPromptMax&&b.lastPromptCount<=c.blockIfPromptMax.max)v=c.blockIfPromptMax.value;if(c.blockIfPosition&&b.lastChoicePosition===c.blockIfPosition.position)v=c.blockIfPosition.value;if(c.blockIfEnemyResistMin&&b.enemy.resist>=c.blockIfEnemyResistMin.min)v=c.blockIfEnemyResistMin.value;if(c.blockIfEnemyRegenMin&&b.enemy.regen>=c.blockIfEnemyRegenMin.min)v=c.blockIfEnemyRegenMin.value;if(c.blockIfTuned&&tuningFor(instance))v=c.blockIfTuned;if(c.blockIfReserved&&instance.wasReserved)v=c.blockIfReserved;if(c.blockIfLinkedCombo&&linkActive)v=c.blockIfLinkedCombo;if(c.blockIfLinkForward&&linkActive&&linkDirection(instance)==='forward')v=c.blockIfLinkForward;if(c.blockIfLinkReverse&&linkActive&&linkDirection(instance)==='reverse')v=c.blockIfLinkReverse;if(c.blockIfLinkBridge&&linkActive&&activeLinkMode().id==='bridge')v=c.blockIfLinkBridge;if(c.blockIfAdaptiveEnemy&&b.enemy.regen>0&&b.enemy.resist>=30)v=c.blockIfAdaptiveEnemy;if(c.blockIfDeckSizeMax&&state().deck.length<=c.blockIfDeckSizeMax.max)v=c.blockIfDeckSizeMax.value;if(c.blockIfDeckSizeMin&&state().deck.length>=c.blockIfDeckSizeMin.min)v=c.blockIfDeckSizeMin.value;if(c.blockIfUniqueCopy&&deckCopies(instance.cardId)===1)v=c.blockIfUniqueCopy;if(c.blockIfDuplicateCopy&&deckCopies(instance.cardId)>=2)v=c.blockIfDuplicateCopy;if(c.blockIfDoctrine&&doctrineActive())v=c.blockIfDoctrine;if(c.blockIfDeckTagMin&&distinctDeckTags()>=c.blockIfDeckTagMin.min)v=c.blockIfDeckTagMin.value;if(c.blockPerDistinctDeckTag)v+=Math.min(c.blockPerDistinctDeckTag.max||999,distinctDeckTags()*c.blockPerDistinctDeckTag.value);if(c.blockPerExcluded)v+=c.blockPerExcluded*b.excluded.length;if(c.blockIfConverted&&conv)v=c.blockIfConverted;if(c.blockIfStyle&&hasAltStyle())v=c.blockIfStyle;if(c.blockIfEnemyBurn&&b.enemy.status.burn>0)v=c.blockIfEnemyBurn;if(c.blockIfEnemyBehavior&&enemyBehaviorCount()>0)v=c.blockIfEnemyBehavior;if(c.blockPerEnemyBehavior){const cfg=c.blockPerEnemyBehavior;v+=Math.min(cfg.max||999,enemyBehaviorCount()*cfg.value);}if(hasRelic('steadfast_frame')&&b.turn>=4)v+=4;if(hasRelic('burnt_bandage')&&b.player.hp<=b.player.maxHp/2)v+=3;v=Math.round(v*mult);b.player.block+=v;log(`防御 +${v}`);if(c.counter||conv==='counter_role'){let cv=(c.counterIfStatus&&hasAnyStatus())?c.counterIfStatus:(c.counter||0);if(c.counterIfPosition&&b.lastChoicePosition===c.counterIfPosition.position)cv=c.counterIfPosition.value;if(c.counterIfLinkedCombo&&linkActive)cv=c.counterIfLinkedCombo;if(c.counterIfRecentReshuffle&&b.recentReshuffle)cv=c.counterIfRecentReshuffle;if(c.counterIfEnemyBehavior&&enemyBehaviorCount()>0)cv=c.counterIfEnemyBehavior;if(conv==='counter_role')cv=Math.max(cv,hasRelic('counter_hinge')?.80:.65);b.counter=Math.max(b.counter,cv);}if(c.fixedCounter)b.fixedCounter=Math.max(b.fixedCounter,c.fixedCounter);
    }
    if(c.heal)healPlayer(Math.round(c.heal*mult));if(c.healIfReshuffle&&b.reshuffles>0)healPlayer(Math.round(c.healIfReshuffle*mult));if(c.healIfLowHp&&b.player.hp<=b.player.maxHp/2)healPlayer(Math.round(c.healIfLowHp*mult));if(c.healIfEnemyRegen&&b.enemy.regen>0)healPlayer(Math.round(c.healIfEnemyRegen*mult));if(c.healIfLinkedCombo&&linkActive)healPlayer(Math.round(c.healIfLinkedCombo*mult));if(c.healIfEnemyBehavior&&enemyBehaviorCount()>0)healPlayer(Math.round(c.healIfEnemyBehavior*mult));
    if(c.selfDamage&&instance.cardId==='blood_contract'){b.player.nextBuff=Math.max(b.player.nextBuff,c.buffNext);return;}
    if(c.effect==='rebuild'){if(b.discard.length||b.excluded.length)reshuffle(true);b.player.nextBuff=Math.max(b.player.nextBuff,c.buffNext||0);return;}
    if(c.effect==='mill2'){for(let i=0;i<2&&b.draw.length;i++)discardInstance(b.draw.shift(),true);return;}
    if(c.effect==='selection'){const x=b.discard[b.discard.length-1]||b.excluded[b.excluded.length-1];if(x)reserveExisting(x,false);return;}
    if(c.effect==='recall'){if(b.lastDiscard)reserveExisting(b.lastDiscard,false);return;}
    if(c.effect==='adversity'){if(b.player.hp<=b.player.maxHp/2){for(let i=0;i<2;i++){const x=b.discard.pop();if(!x)break;b.draw.unshift(x);if(hasRelic('recovery_thread'))healPlayer(2);}log('捨て札から最大2枚を山札へ回収。');}return;}
    if(c.effect==='recover2Discard'){let moved=0;for(let i=0;i<2;i++){const x=b.discard.pop();if(!x)break;b.draw.unshift(x);moved++;if(hasRelic('recovery_thread'))healPlayer(2);}if(moved)log(`捨て札から${moved}枚を山札へ回収。`);return;}

    let hits=resolvedHits(instance);
    let dmg=c.damage||0;if(c.lowHpDamage&&b.player.hp<=b.player.maxHp/2)dmg=c.lowHpDamage;if(c.damageIfStatus&&hasAnyStatus())dmg=c.damageIfStatus;if(c.damageIfPoison&&b.enemy.status.poison>0)dmg=c.damageIfPoison;if(c.damageIfPrevMulti&&b.lastWasMulti)dmg=c.damageIfPrevMulti;if(c.damageIfRecentReshuffle&&b.recentReshuffle)dmg=c.damageIfRecentReshuffle;if(c.damageIfPromptMax&&b.lastPromptCount<=c.damageIfPromptMax.max)dmg=c.damageIfPromptMax.value;if(c.damageIfPromptMin&&b.lastPromptCount>=c.damageIfPromptMin.min)dmg=c.damageIfPromptMin.value;if(c.damageIfDrawMax&&b.draw.length<=c.damageIfDrawMax.max)dmg=c.damageIfDrawMax.value;if(c.damageIfTurnMin&&b.turn>=c.damageIfTurnMin.turn)dmg=c.damageIfTurnMin.value;if(c.damagePerReshuffle)dmg+=c.damagePerReshuffle*b.reshuffles;if(c.damagePerStatusType)dmg+=c.damagePerStatusType*statusCount();if(c.damagePerTotalStatus)dmg+=c.damagePerTotalStatus*Object.values(b.enemy.status).reduce((a,n)=>a+n,0);if(c.damagePerDiscardedThisTurn)dmg+=c.damagePerDiscardedThisTurn*b.discardedThisTurn;if(c.damagePerMissingHpPct)dmg+=Math.floor(((b.player.maxHp-b.player.hp)/b.player.maxHp)*10)*c.damagePerMissingHpPct;if(c.discardBoostValue&&b.discardedEver[instance.uid])dmg=c.discardBoostValue;if(c.discardBoost&&b.discardedEver[instance.uid])dmg=16;if(c.damageIfPosition&&b.lastChoicePosition===c.damageIfPosition.position)dmg=c.damageIfPosition.value;if(c.damageIfEnemyRegenMin&&b.enemy.regen>=c.damageIfEnemyRegenMin.min)dmg=c.damageIfEnemyRegenMin.value;if(c.damageIfEnemyResistMin&&b.enemy.resist>=c.damageIfEnemyResistMin.min)dmg=c.damageIfEnemyResistMin.value;if(c.damageIfTuned&&tuningFor(instance))dmg=c.damageIfTuned;if(c.damageIfReserved&&instance.wasReserved)dmg=c.damageIfReserved;if(c.damageIfLinkedCombo&&linkActive)dmg=c.damageIfLinkedCombo;if(c.damageIfLinkForward&&linkActive&&linkDirection(instance)==='forward')dmg=c.damageIfLinkForward;if(c.damageIfLinkReverse&&linkActive&&linkDirection(instance)==='reverse')dmg=c.damageIfLinkReverse;if(c.damageIfLinkBridge&&linkActive&&activeLinkMode().id==='bridge')dmg=c.damageIfLinkBridge;if(c.damageIfLinkedAndTuned&&linkActive&&tuningFor(instance))dmg=c.damageIfLinkedAndTuned;if(c.damageIfAdaptiveEnemy&&b.enemy.regen>0&&b.enemy.resist>=30)dmg=c.damageIfAdaptiveEnemy;if(c.damagePerTotalStatusIfLinked&&linkActive)dmg+=c.damagePerTotalStatusIfLinked*Object.values(b.enemy.status).reduce((a,n)=>a+n,0);if(c.damagePerPromptCard)dmg+=c.damagePerPromptCard*b.lastPromptCount;if(c.discardedPositionBonus&&b.discardedEver[instance.uid]&&b.lastChoicePosition!=='center')dmg+=c.discardedPositionBonus;if(c.damagePerEnemyResistStep)dmg+=Math.floor(b.enemy.resist/10)*c.damagePerEnemyResistStep;if(c.damageIfDeckSizeMax&&state().deck.length<=c.damageIfDeckSizeMax.max)dmg=c.damageIfDeckSizeMax.value;if(c.damageIfDeckSizeMin&&state().deck.length>=c.damageIfDeckSizeMin.min)dmg=c.damageIfDeckSizeMin.value;if(c.damageIfUniqueCopy&&deckCopies(instance.cardId)===1)dmg=c.damageIfUniqueCopy;if(c.damageIfDuplicateCopy&&deckCopies(instance.cardId)>=2)dmg=c.damageIfDuplicateCopy;if(c.damageIfDoctrine&&doctrineActive())dmg=c.damageIfDoctrine;if(c.damageIfDeckTagMin&&distinctDeckTags()>=c.damageIfDeckTagMin.min)dmg=c.damageIfDeckTagMin.value;if(c.damagePerDistinctDeckTag)dmg+=Math.min(c.damagePerDistinctDeckTag.max||999,distinctDeckTags()*c.damagePerDistinctDeckTag.value);if(c.damageIfConverted&&conv)dmg=c.damageIfConverted;if(c.damageIfStyle&&hasAltStyle())dmg=c.damageIfStyle;if(c.damageIfConvertedAndHybrid&&conv&&cardTags(instance).length>=2)dmg=c.damageIfConvertedAndHybrid;if(c.damageIfConvertedAndTuned&&conv&&tuningFor(instance))dmg=c.damageIfConvertedAndTuned;if(c.damageIfConvertedAndLinked&&conv&&linkActive)dmg=c.damageIfConvertedAndLinked;if(c.damageIfDiscarded&&b.discardedEver[instance.uid])dmg=c.damageIfDiscarded;if(c.damageIfDiscardedLowHp&&b.discardedEver[instance.uid]&&b.player.hp<=b.player.maxHp/2)dmg=c.damageIfDiscardedLowHp;if(c.damageIfStatusAndReshuffle&&statusCount()>=2&&b.reshuffles>0)dmg=c.damageIfStatusAndReshuffle;if(c.damageIfEnemyBehavior&&enemyBehaviorCount()>0)dmg=c.damageIfEnemyBehavior;if(c.damageIfEnemyBehaviorMin&&enemyBehaviorCount()>=c.damageIfEnemyBehaviorMin.min)dmg=c.damageIfEnemyBehaviorMin.value;if(c.damagePerEnemyBehavior){const cfg=c.damagePerEnemyBehavior;dmg+=Math.min(cfg.max||999,enemyBehaviorCount()*cfg.value);}if(c.damageIfEnemyBehaviorAndLinked&&enemyBehaviorCount()>0&&linkActive)dmg=c.damageIfEnemyBehaviorAndLinked;if(c.damageIfEnemyBehaviorAndTuned&&enemyBehaviorCount()>0&&tuningFor(instance))dmg=c.damageIfEnemyBehaviorAndTuned;if(c.damageIfEnemyBehaviorAndConverted&&enemyBehaviorCount()>0&&conv)dmg=c.damageIfEnemyBehaviorAndConverted;if(conv==='split'&&hits<=1&&dmg>0){hits=3;dmg*=.45;}if(conv==='bulwark'&&dmg>0)dmg*=.75;
    const vul=b.enemy.status.vulnerable>0?1.5:1;
    if(hits){for(let h=1;h<=hits;h++){
      let per=dmg;if(c.rampingIfStatus&&hasAnyStatus()&&h>=2)per+=h-1;if(c.damagePerHitIfEnemyHealed&&b.enemyHealed)per+=c.damagePerHitIfEnemyHealed;if(c.damagePerHitIfEnemyRegenMin&&b.enemy.regen>=c.damagePerHitIfEnemyRegenMin.min)per+=c.damagePerHitIfEnemyRegenMin.value;if(c.damagePerHitIfStatusTypes&&statusCount()>=c.damagePerHitIfStatusTypes.min)per+=c.damagePerHitIfStatusTypes.value;if(hasRelic('chain_reactor')&&hits>=3&&h>=3)per+=h-2;let ignore=c.armorPierce||0;if(c.armorPierceIfStatus&&hasAnyStatus())ignore=Math.max(ignore,c.armorPierceIfStatus);if(c.armorPierceIfRecentReshuffle&&b.recentReshuffle)ignore=Math.max(ignore,c.armorPierceIfRecentReshuffle);if(c.armorPierceIfEnemyResistMin&&b.enemy.resist>=c.armorPierceIfEnemyResistMin.min)ignore=Math.max(ignore,c.armorPierceIfEnemyResistMin.value);if(c.armorPierceIfEnemyBehavior&&enemyBehaviorCount()>0)ignore=Math.max(ignore,c.armorPierceIfEnemyBehavior);if(c.ignoreArmorIfPoison&&b.enemy.status.poison>0)ignore=1;if(hasRelic('erosion_sample')&&hasAnyStatus())ignore=Math.max(ignore,.3);if(hasRelic('corrosion_lens')&&hasAnyStatus())ignore=Math.max(ignore,.2);if(hasRelic('mobile_coil')&&hits>=2)ignore=Math.max(ignore,.15);if(hasRelic('fracture_scope')&&b.enemy.def>=15)ignore=Math.max(ignore,.25);if(hasRelic('purification_breaker')&&b.enemy.resist>=50&&hits>=2)ignore=Math.max(ignore,.2);const extra=(hasRelic('multiblade')&&hits>=2&&h===hits)?3:0;dealEnemyDamage((per+extra)*mult*vul,ignore);if(c.perHitStatus){let psa=c.perHitStatus.amount;if(conv==='detonate_role')psa*=.70;applyStatus(c.perHitStatus.type,Math.max(1,Math.round(psa)),c.ignoreStatusResist||(c.ignoreStatusResistIfEnemyBehavior&&enemyBehaviorCount()>0));}if(state().character==='combo'){if(styleIs('combo_catalytic')){if(h===hits&&hits>=3){applyStatus('poison',1);applyStatus('burn',1);}}else if(!styleIs('combo_precision')&&h>=2)applyRandomStatus(1);}if(hasRelic('tainted_needle')&&hits>=2&&h===hits)applyRandomStatus(1);
    }}
    if(hits>=2&&hasRelic('impact_mesh')){const n=Math.min(6,hits);b.player.block+=n;log(`衝撃網：防御 +${n}`);}if(hits>=3&&hasRelic('momentum_vessel'))b.player.nextBuff=Math.max(b.player.nextBuff,.2);
    if(b.enemy.status.vulnerable>0&&hits)b.enemy.status.vulnerable=Math.max(0,b.enemy.status.vulnerable-1);
    if(c.status){let amount=c.status.amount;if(c.statusIfDeckSizeMax&&state().deck.length<=c.statusIfDeckSizeMax.max)amount=c.statusIfDeckSizeMax.amount;if(c.statusIfDeckSizeMin&&state().deck.length>=c.statusIfDeckSizeMin.min)amount=c.statusIfDeckSizeMin.amount;if(c.statusIfUniqueCopy&&deckCopies(instance.cardId)===1)amount=c.statusIfUniqueCopy;if(c.statusIfDuplicateCopy&&deckCopies(instance.cardId)>=2)amount=c.statusIfDuplicateCopy;if(c.statusIfDoctrine&&doctrineActive())amount=c.statusIfDoctrine;if(c.reshuffleStatus&&b.reshuffles>0)amount=c.reshuffleStatus;if(c.statusIfRecentReshuffle&&b.recentReshuffle)amount=c.statusIfRecentReshuffle;if(c.statusPerReshuffle)amount+=c.statusPerReshuffle*b.reshuffles;if(c.statusIfEnemyHpAbove&&b.enemy.hp>b.enemy.maxHp*c.statusIfEnemyHpAbove.ratio)amount=c.statusIfEnemyHpAbove.amount;if(c.statusIfPosition&&b.lastChoicePosition===c.statusIfPosition.position)amount=c.statusIfPosition.amount;if(c.statusIfTuned&&tuningFor(instance))amount=c.statusIfTuned;if(c.statusIfLinkedCombo&&linkActive)amount=c.statusIfLinkedCombo;if(c.statusIfAdaptiveEnemy&&b.enemy.regen>0&&b.enemy.resist>=30)amount=c.statusIfAdaptiveEnemy;if(c.statusIfConverted&&conv)amount=c.statusIfConverted;if(c.statusIfEnemyBehavior&&enemyBehaviorCount()>0)amount=c.statusIfEnemyBehavior;if(conv==='detonate_role')amount*=.70;if(linkActive&&hasRelic('twin_needle'))amount+=2;applyStatus(c.status.type,Math.max(1,Math.round(amount*mult)),c.ignoreStatusResist||(c.ignoreStatusResistIfEnemyBehavior&&enemyBehaviorCount()>0));if(c.extraStatusIfEnemyResistMin&&b.enemy.resist>=c.extraStatusIfEnemyResistMin.min)applyStatus(c.extraStatusIfEnemyResistMin.type,c.extraStatusIfEnemyResistMin.amount,c.ignoreStatusResist);}
    if(c.statuses)c.statuses.forEach(st=>{let amt=c.statusesIfDeckTagMin&&distinctDeckTags()>=c.statusesIfDeckTagMin.min?c.statusesIfDeckTagMin.amount:st.amount;if(c.statusesIfEnemyBehavior&&enemyBehaviorCount()>0)amt=c.statusesIfEnemyBehavior;if(conv==='detonate_role')amt*=.70;applyStatus(st.type,Math.max(1,Math.round(amt*mult)),c.ignoreStatusResist||(c.ignoreStatusResistIfEnemyBehavior&&enemyBehaviorCount()>0));});
    if(conv==='detonate_role'){const type=(b.enemy.status.poison||0)>=(b.enemy.status.burn||0)?'poison':'burn',available=b.enemy.status[type]||0;if(available>0){const ratio=hasRelic('detonation_chamber')?.40:.30,used=Math.max(1,Math.floor(available*ratio));b.enemy.status[type]=Math.max(0,available-used);dealRawEnemy(used*2,'起爆変換');}}
    if(c.consumeStatus){const amount=b.enemy.status[c.consumeStatus.type]||0;if(amount>0){b.enemy.status[c.consumeStatus.type]=0;dealRawEnemy(Math.round(amount*c.consumeStatus.ratio*mult),`${c.name}の消費効果`);if(c.consumeStatus.type==='poison'&&hasRelic('venom_siphon'))healPlayer(4);if(c.consumeStatus.type==='burn'&&hasRelic('cinder_shield')){b.player.block+=6;log('灰盾：防御 +6');}}}
    if(c.consumeStatuses){let total=0;for(const type of c.consumeStatuses.types){total+=b.enemy.status[type]||0;b.enemy.status[type]=0;}if(total>0)dealRawEnemy(Math.round(total*c.consumeStatuses.ratio*mult),`${c.name}の複合消費`);}
    if(c.damagePlusBlockRatio)dealRawEnemy(Math.round(b.player.block*c.damagePlusBlockRatio),`${c.name}の防御転換`);
    if(c.effectIfConverted==='recoverLastDiscard'&&conv&&b.lastDiscard){const moved=moveTo(b.lastDiscard.uid,'draw',true);if(moved)log(`変換効果：《${card(moved).name}》を山札の上へ回収。`);}
    if(c.effectIfEnemyBehavior==='recoverLastDiscard'&&enemyBehaviorCount()>0&&b.lastDiscard){const moved=moveTo(b.lastDiscard.uid,'draw',true);if(moved)log(`複合挙動解析：《${card(moved).name}》を山札の上へ回収。`);}
    if(c.effect==='recoverLastDiscard'&&b.lastDiscard){const moved=moveTo(b.lastDiscard.uid,'draw',true);if(moved){log(`《${card(moved).name}》を山札の上へ回収。`);if(hasRelic('recovery_thread'))healPlayer(2);}}
    if(c.effect==='positionCycle'){if(b.lastChoicePosition==='left'&&b.lastDiscard){const moved=moveTo(b.lastDiscard.uid,'draw',true);if(moved)log(`位置循環：《${card(moved).name}》を山札の上へ回収。`);}else if(b.lastChoicePosition==='right')b.player.nextBuff=Math.max(b.player.nextBuff,.25);}
    if(c.effect==='suppressRegen')b.suppressRegen=true;
    if(c.buffNext)b.player.nextBuff=Math.max(b.player.nextBuff,(c.buffNextIfReshuffle&&b.reshuffles>0)?c.buffNextIfReshuffle:c.buffNext);if(c.nextBuffAfterUse)b.player.nextBuff=Math.max(b.player.nextBuff,c.nextBuffAfterUse);
    b.lastWasAttack=hits>0;b.lastWasMulti=hits>=2;if(hits>=3&&hasRelic('overrotation'))b.overrotationNext=true;
  }

  function dealEnemyDamage(raw,ignoreArmor=0){const b=Battle.current;let def=b.enemy.def*(1-ignoreArmor);let dmg=Math.max(0,Math.round(raw-def));if(b.enemy.traits.includes('armored'))dmg=Math.round(dmg*.9);const guarded=Math.min(b.enemy.block||0,dmg);b.enemy.block=Math.max(0,(b.enemy.block||0)-dmg);dmg-=guarded;b.enemy.hp-=dmg;log(`敵に ${dmg} ダメージ${guarded?`（障壁 ${guarded}）`:''}`);return dmg;}
  function dealRawEnemy(n,source){const b=Battle.current;b.enemy.hp-=Math.round(n);log(`${source}で敵に ${Math.round(n)} ダメージ`);}
  function applyRandomStatus(n){applyStatus(U.pick(['poison','burn','vulnerable','weak']),n);}
  function applyStatus(type,amount,ignoreResist=false){const b=Battle.current,before=statusCount(),otherBefore={poison:b.enemy.status.poison,burn:b.enemy.status.burn};if(activeProtocol('ailment_catalyst'))amount+=1;let resist=ignoreResist?0:b.enemy.resist;if(!ignoreResist&&hasRelic('sterile_needle'))resist=Math.max(0,resist-20);if(!ignoreResist&&activeProtocol('anti_resist'))resist=Math.max(0,resist-15);amount=Math.max(0,Math.round(amount*(1-resist/100)));if(amount<=0){log('状態異常は耐性で無効化された。');return;}b.enemy.status[type]+=amount;if(hasRelic('ailment_shell')&&b.statusBlockGained<6){b.player.block+=1;b.statusBlockGained++;log('症状外殻：防御 +1');}log(`${({poison:'毒',burn:'火傷',vulnerable:'脆弱',weak:'弱体'})[type]} +${amount}`);if(state().character==='catalyst'&&!styleIs('catalyst_spectrum')&&statusCount()>before){b.player.nextBuff=Math.max(b.player.nextBuff,.10);log('カタリスト：新しい症状を観測し、次カードを強化。');}if(hasRelic('mixed_vial')&&statusCount()>before&&before>0)dealRawEnemy(4,'混成薬瓶');if(hasRelic('toxic_ash_catalyst')){if(type==='poison'&&otherBefore.burn>0)dealRawEnemy(4,'毒火触媒');if(type==='burn'&&otherBefore.poison>0)dealRawEnemy(4,'毒火触媒');}}
  function healPlayer(n){const b=Battle.current;if(n<=0)return;b.player.hp=Math.min(b.player.maxHp,b.player.hp+n);log(`HP ${n} 回復`);}
  function enemyAttackValue(){const b=Battle.current;let a=b.enemy.atk+(b.enemyTempAtk||0);if(b.enemy.status.weak>0)a*=.7;return Math.max(1,Math.round(a));}
  function actionCountPreview(){const b=Battle.current;return Math.max(1,Math.floor(b.enemy.spd+(b.fastAccumulator||0)));}
  function bossIntentText(){const b=Battle.current;if(b?.bossId==='boss2')return `適応攻撃 ${enemyAttackValue()} ｜ 同じ位置を連続選択すると攻撃+3・次ターン障壁10 ｜ 再生 ${b.enemy.regen} / 耐性 ${b.enemy.resist}%`;if(b?.bossId==='boss3')return `構築攻撃 ${enemyAttackValue()} ｜ 同じカード種別を連続使用すると攻撃+2・次ターン障壁8 ｜ 再生 ${b.enemy.regen} / 耐性 ${b.enemy.resist}%`;if(b?.bossId==='boss4')return `統合攻撃 ${enemyAttackValue()} ｜ 同じ強化系統を連続使用すると攻撃+2・次ターン障壁9 ｜ 再生 ${b.enemy.regen} / 耐性 ${b.enemy.resist}%`;return `観測攻撃 ${enemyAttackValue()} ｜ 左：次ターン障壁7 / 中央：この攻撃+3 / 右：次カード効果-15%`;}


  function enemyTurn(){
    const b=Battle.current;if(checkEnd())return;if(b.isBoss)b.enemy.block=0;
    const defs=behaviorDefs(),turn=b.turn;let tempAtk=0;
    for(const def of defs){const r=def.rules||{};
      if(r.lowHpAtkOnce&&b.enemy.hp<=b.enemy.maxHp/2&&!b.behaviorTriggered[def.name+'_atk']){b.enemy.atk+=r.lowHpAtkOnce;b.behaviorTriggered[def.name+'_atk']=true;log(`${def.name}：攻撃力 +${r.lowHpAtkOnce}`);}
      if(r.lowHpSpeedOnce&&b.enemy.hp<=b.enemy.maxHp/2&&!b.behaviorTriggered[def.name+'_spd']){b.enemy.spd+=r.lowHpSpeedOnce;b.behaviorTriggered[def.name+'_spd']=true;log(`${def.name}：速度 +${r.lowHpSpeedOnce.toFixed(2)}`);}
      if(r.everyNTurnAttackBonus&&turn%r.everyNTurnAttackBonus.turns===0)tempAtk+=r.everyNTurnAttackBonus.amount;
      if(r.statusAttackBonus&&hasAnyStatus())tempAtk+=r.statusAttackBonus;
      if(r.healNextAttackBonus&&b.behaviorHealedLastTurn)tempAtk+=r.healNextAttackBonus;
      if(r.consumeDebuffAttackBonus&&(b.enemy.status.weak>0||b.enemy.status.vulnerable>0)){if(b.enemy.status.weak>0)b.enemy.status.weak--;if(b.enemy.status.vulnerable>0)b.enemy.status.vulnerable--;tempAtk+=r.consumeDebuffAttackBonus;log(`${def.name}：弱体・脆弱を消費して攻撃を増幅。`);}
    }
    b.enemyTempAtk=tempAtk;b.fastAccumulator+=b.enemy.spd;let actions=Math.floor(b.fastAccumulator);b.fastAccumulator-=actions;actions=Math.max(1,actions);
    for(const def of defs){const r=def.rules||{};if(r.everyNTurnExtraAction&&turn%r.everyNTurnExtraAction.turns===0)actions+=r.everyNTurnExtraAction.extra||1;if(r.healNextExtraAction&&b.behaviorHealedLastTurn)actions++;if(r.multiActionBlock&&actions>=2){b.enemy.block+=r.multiActionBlock;log(`${def.name}：障壁 ${r.multiActionBlock}`);}if(r.everyNTurnBlock&&turn%r.everyNTurnBlock.turns===0){b.enemy.block+=r.everyNTurnBlock.amount;log(`${def.name}：障壁 ${r.everyNTurnBlock.amount}`);}}
    let reflectedThisTurn=false;
    for(let i=0;i<actions;i++){
      if(b.enemy.status.poison>0){dealRawEnemy(b.enemy.status.poison,'毒');b.enemy.status.poison=Math.max(0,b.enemy.status.poison-1);if(checkEnd())return;}
      BL.Alchemy?.beforeHit(b,alchemyAPI);
      const incoming=enemyAttackValue()+(b.bossId==='boss1'&&b.lastChoicePosition==='center'?3:0)+(b.bossId==='boss2'&&b.repeatedPosition?3:0)+(b.bossId==='boss3'&&b.boss3RepeatedKind?2:0)+(b.bossId==='boss4'&&b.boss4RepeatedLayer?2:0),beforeBlock=b.player.block,blocked=Math.min(beforeBlock,incoming),dmg=Math.max(0,incoming-beforeBlock);b.player.block=Math.max(0,b.player.block-incoming);b.player.hp-=dmg;log(`敵の攻撃 ${incoming}（防御 ${blocked} / 被ダメ ${dmg}）`);
      if(dmg>0&&b.counter>0){let cm=1;if(activeProtocol('counter_matrix'))cm*=1.3;if(hasRelic('counter_core'))cm*=1.4;if(hasRelic('red_mirror'))cm*=1.3;if(hasRelic('breaker_anvil')&&hasAnyStatus())cm*=1.35;dealRawEnemy(Math.round(dmg*b.counter*cm),'反撃');}if(dmg>0&&b.fixedCounter>0)dealRawEnemy(Math.round(b.fixedCounter*(activeProtocol('counter_matrix')?1.3:1)),'迎撃');if(dmg>0&&hasRelic('reflect_bone')&&!reflectedThisTurn){dealRawEnemy(Math.round(dmg*.5),'反射骨');reflectedThisTurn=true;}
      if(blocked>=incoming/2&&hasRelic('pressure_plate'))applyStatus('vulnerable',1);
      if(blocked>=incoming&&incoming>0){if(hasRelic('perfect_wall')&&!b.perfectWallHealedThisEnemyTurn){healPlayer(2);b.perfectWallHealedThisEnemyTurn=true;}if(hasRelic('iron_heartbeat'))b.player.nextBuff=Math.max(b.player.nextBuff,.25);if(hasRelic('fortress_core'))b.player.nextBuff=Math.max(b.player.nextBuff,.30);if(hasRelic('bastion_memory')&&!b.bastionMemoryHealedThisEnemyTurn){healPlayer(3);b.bastionMemoryHealedThisEnemyTurn=true;}if(b.usedBlockUid){const used=allOwnedInstances().find(x=>x.uid===b.usedBlockUid);if(used&&card(used).returnIfFullBlock){const moved=moveTo(used.uid,'draw',true);if(moved)log(`受け流し：《${card(moved).name}》を山札へ戻した。`);}}}
      if(dmg>0&&b.usedBlockUid&&hasRelic('cracked_shield')){const moved=moveTo(b.usedBlockUid,'draw',true);if(moved)log(`亀裂の盾：《${card(moved).name}》を山札へ戻した。`);}
      if(b.enemy.status.weak>0)b.enemy.status.weak=Math.max(0,b.enemy.status.weak-1);if(checkEnd())return;
    }
    let healedThisTurn=0;
    if(b.enemy.regen>0&&b.enemy.hp>0){let regen=b.enemy.regen;for(const def of defs){const r=def.rules||{};if(r.lowHpRegenMult&&b.enemy.hp<=b.enemy.maxHp/2)regen*=r.lowHpRegenMult;}if(b.suppressRegen)regen*=.5;if(hasRelic('cautery_core')&&b.enemy.status.burn>0)regen*=.5;regen=Math.max(0,Math.round(regen));if(regen>0){const before=b.enemy.hp;b.enemy.hp=Math.min(b.enemy.maxHp,b.enemy.hp+regen);const healed=b.enemy.hp-before;if(healed>0){healedThisTurn=healed;b.enemyHealed=true;log(`敵が再生力でHP ${healed} 回復。`);for(const def of defs){const r=def.rules||{};if(r.healBlockRatio){const gain=Math.min(r.healBlockMax||999,Math.max(1,Math.round(healed*r.healBlockRatio)));b.enemy.block+=gain;log(`${def.name}：再生により障壁 ${gain}`);}}}}b.suppressRegen=false;}
    for(const def of defs){const r=def.rules||{};if(r.cleanseEnd){let removed=0;for(const type of ['poison','burn']){const before=b.enemy.status[type]||0, after=Math.max(0,before-r.cleanseEnd.amount);removed+=before-after;b.enemy.status[type]=after;}if(removed>0){if(r.cleanseEnd.block){b.enemy.block+=r.cleanseEnd.block;log(`${def.name}：状態異常を浄化し障壁 ${r.cleanseEnd.block}`);}else log(`${def.name}：状態異常を浄化。`);}}if(r.everyNTurnCleanseHeal&&turn%r.everyNTurnCleanseHeal.turns===0){let removed=0;for(const type of ['poison','burn','vulnerable','weak']){const before=b.enemy.status[type]||0, after=Math.max(0,before-r.everyNTurnCleanseHeal.amount);removed+=before-after;b.enemy.status[type]=after;}const before=b.enemy.hp;b.enemy.hp=Math.min(b.enemy.maxHp,b.enemy.hp+r.everyNTurnCleanseHeal.heal);const heal=b.enemy.hp-before;if(removed||heal)log(`${def.name}：状態異常を抑制しHP ${heal} 回復。`);}}
    b.behaviorHealedLastTurn=healedThisTurn>0;b.enemyTempAtk=0;
    if(b.bossId==='boss1'){if(b.lastChoicePosition==='left'){b.enemy.block=7;log('観測体：左枠を観測し、次ターン用の障壁7を展開。');}else if(b.lastChoicePosition==='right'){b.player.nextPenalty=Math.max(b.player.nextPenalty,.15);log('観測体：右枠を観測し、次カードの効果を15%低下。');}else if(b.lastChoicePosition==='center')log('観測体：中央枠を観測し、攻撃を増幅した。');}
    if(b.bossId==='boss2'&&b.repeatedPosition){b.enemy.block=10;log('適応体：同じ位置の連続選択へ適応し、次ターン障壁10を展開。');}
    if(b.bossId==='boss3'&&b.boss3RepeatedKind){b.enemy.block=8;log('構築体：同じカード種別の連続使用を解析し、次ターン障壁8を展開。');}
    if(b.bossId==='boss4'&&b.boss4RepeatedLayer){b.enemy.block=9;log('統合体：同じ強化系統の連続使用へ適応し、次ターン障壁9を展開。');}
    if(state().character==='tank'){if(styleIs('tank_forge')){const candidates=allOwnedInstances().filter(x=>!x.upgraded);if(candidates.length){const target=U.pick(candidates);target.upgraded=true;log(`フォート・自動鍛造型：《${card(target).name}》が強化版へ変化。`);}else{b.player.nextBuff=Math.max(b.player.nextBuff,.20);log('フォート・自動鍛造型：全カード鍛造済み。次カードを強化。');}}else if(b.cardUsedThisTurn&&!b.cardUsedThisTurn.upgraded){b.cardUsedThisTurn.upgraded=true;log(`フォート：《${card(b.cardUsedThisTurn).name}》が強化版へ変化。`);}}b.cardUsedThisTurn=null;
    b.turn++;beginTurn();
  }

  function checkEnd(){const b=Battle.current;if(!b)return true;if(b.enemy.hp<=0){finish(true,false);return true;}if(b.player.hp<=0){finish(false,false);return true;}return false;}
  function finish(win,retired){
    const b=Battle.current;if(!b)return;const s=state();let newUnlocks=[];
    if(win){s.stats.wins++;if(b.bossId==='boss1')s.bossDefeated=true;if(b.bossId==='boss2')s.boss2Defeated=true;if(b.bossId==='boss3')s.boss3Defeated=true;if(b.bossId==='boss4')s.boss4Defeated=true;if(b.isBoss)s.stats.bossWins++;newUnlocks.push(...BL.Unlock.processWinUnlocks(s,b));}else if(!retired)s.stats.losses++;
    BL.Store.save();const result={win,retired,battle:b,newUnlocks:[...new Set(newUnlocks)]};Battle.current=null;if(typeof Battle.onEnd==='function')Battle.onEnd(result);emit();
  }

  function retire(){finish(false,true);}
  function swapWithCenter(index){const b=Battle.current;if(!b||b.prompt.length<3)return false;const center=Math.floor((b.prompt.length-1)/2);if(index===center)return false;if(!(BL.Unlock.hasSystem(state(),'prompt_control')&&(hasRelic('phase_exchanger')||b.reorderNext)))return false;[b.prompt[index],b.prompt[center]]=[b.prompt[center],b.prompt[index]];log(b.reorderNext?'再配列：中央枠と交換。':'位相交換器：中央枠と交換。');b.reorderNext=false;emit();return true;}
  function redraw(index){const b=Battle.current;if(!b||!b.prompt[index])return false;const allowed=BL.Unlock.hasSystem(state(),'prompt_control')&&((hasRelic('reroll_terminal')&&!b.relicRedrawUsed)||b.redrawNext);if(!allowed)return false;const old=b.prompt[index],next=drawOne();if(!next)return false;b.prompt[index]=next;b.draw.unshift(old);if(b.redrawNext){b.redrawNext=false;log('再提示：1枠を引き直した。');}else{b.relicRedrawUsed=true;log('再抽選端末：1枠を引き直した。');}if(hasRelic('reroll_capacitor'))b.player.nextBuff=Math.max(b.player.nextBuff,.20);emit();return true;}
  function statusText(){const b=Battle.current;if(!b)return'';const s=b.enemy.status,parts=[];if(s.poison)parts.push(`毒${s.poison}`);if(s.burn)parts.push(`火傷${s.burn}`);if(s.vulnerable)parts.push(`脆弱${s.vulnerable}`);if(s.weak)parts.push(`弱体${s.weak}`);return parts.join(' / ')||'状態異常なし';}
  function upgradedCount(){const b=Battle.current;if(!b)return 0;return allOwnedInstances().filter(x=>x.upgraded).length;}

  Object.assign(Battle,{create,play,retire,swapWithCenter,redraw,enemyAttackValue,actionCountPreview,bossIntentText,statusText,invariant,allOwnedInstances,upgradedCount,enemyBehaviorCount});
  BL.Battle=Battle;
})();
