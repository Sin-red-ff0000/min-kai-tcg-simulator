'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),characters:new Set(Object.keys(D.CHARACTERS)),styles:new Set(Object.keys(D.CHARACTER_STYLES||{})),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{})),traits:new Set(Object.keys(D.TRAITS||{})),behaviors:new Set(Object.keys(D.ENEMY_BEHAVIORS||{}))};

  // 条件変化型二面カード。各実体は表面から始まり、条件達成後はその戦闘中ずっと裏面を維持する。
  D.SYSTEMS.dual_face={name:'二面カード',desc:'各カード実体は表面から開始し、固有条件を満たすと裏面へ自動変化する。変化後はその戦闘中、表面へ戻らない。'};
  D.DUAL_FACE_CARDS={
    v26_dual_border:{condition:'防御12以上',front:{name:'境界の刃',kind:'damage',damage:10,tags:['単発','防御転用'],desc:'10ダメージ。防御12以上になると「境界盾刃」へ変化。'},back:{name:'境界盾刃',kind:'hybrid',damage:13,block:9,tags:['単発','防御'],desc:'13ダメージ＋防御9。'},check:(b)=>b.player.block>=12},
    v26_dual_crucible:{condition:'敵の状態異常2種類以上',front:{name:'毒液相',kind:'damage',damage:7,status:{type:'poison',amount:3},tags:['状態異常','毒'],desc:'7ダメージ＋毒3。敵の状態異常2種類以上で「灰熱相」へ変化。'},back:{name:'灰熱相',kind:'damage',damage:11,status:{type:'burn',amount:4},tags:['状態異常','火傷'],desc:'11ダメージ＋火傷4。'},check:(b)=>['poison','burn','vulnerable','weak'].filter(k=>b.enemy.status[k]>0).length>=2},
    v26_dual_blood:{condition:'HP50%以下',front:{name:'裂血殻',kind:'damage',damage:15,selfDamage:3,tags:['自傷','単発'],desc:'自傷3、15ダメージ。HP50%以下で「羽化殻」へ変化。'},back:{name:'羽化殻',kind:'hybrid',damage:12,block:12,tags:['瀕死','防御'],desc:'12ダメージ＋防御12。'},check:(b)=>b.player.hp<=b.player.maxHp/2},
    v26_dual_residue:{condition:'同一ターンに2枚以上捨てる',front:{name:'堆積相',kind:'damage',damage:8,onDiscard:{block:5},tags:['捨て札','防御'],desc:'8ダメージ。捨てられた時、防御5。同一ターンに2枚以上捨てると「回収相」へ変化。'},back:{name:'回収相',kind:'hybrid',damage:8,block:7,effect:'recoverLastDiscard',tags:['捨て札','循環'],desc:'8ダメージ＋防御7。最後の捨て札を山札上へ回収。'},check:(b)=>b.discardedThisTurn>=2},
    v26_dual_link:{condition:'連結コンボを1回以上成立',front:{name:'連射殻',kind:'damage',damage:4,hits:3,tags:['連撃','連結'],desc:'4×3ダメージ。連結コンボ成立後「共振殻」へ変化。'},back:{name:'共振殻',kind:'hybrid',damage:5,hits:3,block:6,tags:['連撃','連結','防御'],desc:'5×3ダメージ＋防御6。'},check:(b)=>b.linkComboCount>=1},
    v26_dual_cycle:{condition:'山札を1回以上再構築',front:{name:'休眠種',kind:'block',block:10,tags:['循環','防御'],desc:'防御10。山札再構築後「発芽輪」へ変化。'},back:{name:'発芽輪',kind:'hybrid',damage:11,block:8,tags:['循環','複合'],desc:'11ダメージ＋防御8。'},check:(b)=>b.reshuffles>=1},
    v26_dual_alchemy:{condition:'上位錬成物を1種類以上生成',front:{name:'未成相',kind:'block',block:8,tags:['錬成','防御'],desc:'防御8。上位錬成物生成後「賢者相」へ変化。'},back:{name:'賢者相',kind:'hybrid',damage:14,block:8,tags:['錬成','上位錬成','複合'],desc:'14ダメージ＋防御8。'},check:(b)=>Object.keys(b?.alchemy?.made||{}).some(id=>D.ALCHEMY?.advancedMaterials?.includes?.(id)&&b.alchemy.made[id]>0)||Number(b?.alchemy?.advancedTypes||0)>0},
    v26_dual_terminal:{condition:'4ターン目到達',front:{name:'観測面',kind:'block',block:9,tags:['長期戦','防御'],desc:'防御9。4ターン目以降「決裁面」へ変化。'},back:{name:'決裁面',kind:'damage',damage:20,tags:['長期戦','単発'],desc:'20ダメージ。'},check:(b)=>b.turn>=4}
  };
  for(const [id,df] of Object.entries(D.DUAL_FACE_CARDS))D.CARDS[id]={id,name:df.front.name,tags:[...df.front.tags,'二面'],desc:df.front.desc,kind:df.front.kind,...df.front,dualFace:true,requiresUnlock:true};
  D.resolveDualFaceCard=function(instance,battle,state){const base=D.CARDS[instance.cardId],df=D.DUAL_FACE_CARDS?.[instance.cardId];if(!df||!battle)return base;if(instance.face!=='back'&&df.check(battle,instance,state)){instance.face='back';instance.transformedAtTurn=battle.turn;}const face=instance.face==='back'?df.back:df.front;return {...base,...face,id:instance.cardId,dualFace:true,face:instance.face||'front'};};

  // 元素・錬成拡充カード30種。
  const eCards=[
    ['v26_fire_lance','熔火槍',['火','単発'],{kind:'damage',damage:16},'16ダメージ。火配分を主軸にする安定単発。'],
    ['v26_fire_blood','熔血刃',['火','自傷'],{kind:'damage',damage:21,selfDamage:4},'自傷4、21ダメージ。'],
    ['v26_fire_guard','火山防壁',['火','防御'],{kind:'block',block:15},'防御15。'],
    ['v26_fire_multi','火花連射',['火','連撃'],{kind:'damage',damage:5,hits:3},'5×3ダメージ。'],
    ['v26_fire_status','焼蝕針',['火','状態異常'],{kind:'damage',damage:7,status:{type:'burn',amount:4}},'7ダメージ＋火傷4。'],
    ['v26_wind_multi','疾風連刃',['風','連撃'],{kind:'damage',damage:4,hits:4},'4×4ダメージ。'],
    ['v26_wind_guard','偏流障壁',['風','防御'],{kind:'block',block:12,nextBuffAfterUse:.12},'防御12。次カード+12%。'],
    ['v26_wind_cycle','回転翼',['風','循環'],{kind:'damage',damage:10,v22Route:'bottom'},'10ダメージ。使用後は山札下へ。'],
    ['v26_wind_status','風蝕針',['風','状態異常'],{kind:'damage',damage:6,status:{type:'weak',amount:2}},'6ダメージ＋弱体2。'],
    ['v26_wind_hybrid','浮岩打',['風','複合'],{kind:'hybrid',damage:9,block:8},'9ダメージ＋防御8。'],
    ['v26_water_cycle','還流水刃',['水','循環'],{kind:'damage',damage:9,effect:'recoverLastDiscard'},'9ダメージ。最後の捨て札を回収。'],
    ['v26_water_guard','霜晶壁',['水','防御'],{kind:'block',block:16},'防御16。'],
    ['v26_water_status','冷却針',['水','状態異常'],{kind:'damage',damage:5,status:{type:'weak',amount:3}},'5ダメージ＋弱体3。'],
    ['v26_water_hybrid','噴泉反射',['水','複合'],{kind:'hybrid',damage:8,block:10},'8ダメージ＋防御10。'],
    ['v26_water_single','水圧槍',['水','単発'],{kind:'damage',damage:15,armorPierce:.25},'15ダメージ。防御25%無視。'],
    ['v26_earth_guard','星鉄壁',['土','防御'],{kind:'block',block:18},'防御18。'],
    ['v26_earth_hit','黒曜打',['土','単発'],{kind:'damage',damage:18},'18ダメージ。'],
    ['v26_earth_counter','火山殻',['土','反撃'],{kind:'block',block:13,counter:.45},'防御13。反撃率45%。'],
    ['v26_earth_hybrid','深泥圧',['土','複合'],{kind:'hybrid',damage:10,block:11},'10ダメージ＋防御11。'],
    ['v26_earth_status','泥濁針',['土','状態異常'],{kind:'damage',damage:7,status:{type:'vulnerable',amount:2}},'7ダメージ＋脆弱2。'],
    ['v26_aether_tune','共鳴波',['エーテル','調律'],{kind:'damage',damage:14},'14ダメージ。調律・ルーン軸の橋渡し。'],
    ['v26_aether_guard','周期障壁',['エーテル','防御'],{kind:'block',block:14},'防御14。'],
    ['v26_aether_multi','星光列',['エーテル','連撃'],{kind:'damage',damage:4,hits:4},'4×4ダメージ。エーテル連撃の基礎札。'],
    ['v26_aether_cycle','世界種回帰',['エーテル','循環'],{kind:'block',block:9,effect:'recoverLastDiscard'},'防御9。最後の捨て札を回収。'],
    ['v26_aether_status','虚光針',['エーテル','状態異常'],{kind:'damage',damage:6,status:{type:'vulnerable',amount:3}},'6ダメージ＋脆弱3。'],
    ['v26_tri_reactor','三相炉',['元素','混成'],{kind:'hybrid',damage:10,block:10},'3元素混成向けの10ダメージ＋防御10。'],
    ['v26_penta_reactor','五相炉',['元素','混成'],{kind:'hybrid',damage:12,block:12},'5元素混成向けの12ダメージ＋防御12。'],
    ['v26_reaction_blade','反応刃',['錬成','反応'],{kind:'damage',damage:17},'反応種類数を伸ばすビルド向け。17ダメージ。'],
    ['v26_consumption_wall','消費防壁',['錬成','消費'],{kind:'block',block:17},'消費種類数を伸ばすビルド向け。防御17。'],
    ['v26_opus_vector','大業ベクトル',['錬成','上位錬成'],{kind:'hybrid',damage:13,block:13},'上位錬成物の種類数を伸ばすビルド向け。13ダメージ＋防御13。']
  ];
  for(const [id,name,tags,body,desc] of eCards)D.CARDS[id]={id,name,tags,desc,...body,requiresUnlock:true};

  // キャラクター3 / スタイル9
  const chars={
    salamander:{id:'salamander',name:'サラマンダー',role:'火・消費錬成',hp:70,desc:'火配分と攻撃系錬成物の消費を火力へ変える。'},
    naiad:{id:'naiad',name:'ナイアド',role:'水・備蓄循環',hp:78,desc:'水配分、在庫維持、再構築を安定へ変える。'},
    quint:{id:'quint',name:'クイント',role:'多元素混成',hp:74,desc:'3元素から5元素へ広げる混成型。'}
  };Object.assign(D.CHARACTERS,chars);
  D.V26_CHARACTER_RULES={salamander:[{when:{elementDominant:'fire'},mult:1.12},{when:{materialDiversityUsedMin:2},mult:1.15}],naiad:[{when:{elementDominant:'water'},mult:1.12},{when:{materialStockDiversityMin:3},mult:1.15}],quint:[{when:{elementDiversityMin:3},mult:1.12},{when:{elementDiversityMin:5},mult:1.15}]};
  const styleRows=[
    ['salamander_core','salamander','熔核型','熔核生成済みなら+32%。',{materialMade:'magma_core'},1.32],['salamander_ash','salamander','灰熱型','火属性カード+24%。',{cardElement:'fire'},1.24],['salamander_spend','salamander','燃料消費型','錬成物3種類以上消費済み+34%。',{materialDiversityUsedMin:3},1.34],
    ['naiad_stock','naiad','貯水型','在庫3種類以上+28%。',{materialStockDiversityMin:3},1.28],['naiad_cycle','naiad','還流型','再構築直後+34%。',{recentReshuffle:true},1.34],['naiad_frost','naiad','霜晶型','霜晶生成済み+30%。',{materialMade:'frost_crystal'},1.30],
    ['quint_tri','quint','三相型','3元素以上配分+26%。',{elementDiversityMin:3},1.26],['quint_penta','quint','五相型','5元素配分+38%。',{elementDiversityMin:5},1.38],['quint_react','quint','反応型','反応4種類以上+34%。',{reactionTypesMin:4},1.34]
  ];D.V26_STYLE_RULES={};for(const [id,ch,name,desc,when,mult] of styleRows){D.CHARACTER_STYLES[id]={id,character:ch,name,tags:['元素','錬成'],desc};D.V26_STYLE_RULES[id]=[{when,mult}];}

  // 遺物20
  D.V26_RELIC_RULES={};const relRows=[
    ['v26_fire_resonator','火相共鳴器','火が最大配分なら+20%。',{elementDominant:'fire'},1.20],['v26_wind_resonator','風相共鳴器','風が最大配分なら+20%。',{elementDominant:'wind'},1.20],['v26_water_resonator','水相共鳴器','水が最大配分なら+20%。',{elementDominant:'water'},1.20],['v26_earth_resonator','土相共鳴器','土が最大配分なら+20%。',{elementDominant:'earth'},1.20],['v26_aether_resonator','第五相共鳴器','エーテルが最大配分なら+20%。',{elementDominant:'aether'},1.20],
    ['v26_tri_prism','三相プリズム','3元素以上配分で+22%。',{elementDiversityMin:3},1.22],['v26_penta_prism','五相プリズム','5元素配分で+32%。',{elementDiversityMin:5},1.32],['v26_reaction_history','反応履歴器','3元素以上配分＋反応5種類以上で+34%。',{elementDiversityMin:3,reactionTypesMin:5},1.34],['v26_consumption_history','消費履歴器','3元素以上配分＋4種類以上消費で+34%。',{elementDiversityMin:3,materialDiversityUsedMin:4},1.34],['v26_stock_lattice','備蓄格子','在庫5種類以上で+27%。',{materialStockDiversityMin:5},1.27],
    ['v26_magma_bridge','熔核血路','熔核生成済み＋自傷カード+31%。',{materialMade:'magma_core',selfDamage:true},1.31],['v26_storm_bridge','雷晶連結器','雷晶生成済み＋3ヒット以上+30%。',{materialMade:'storm_crystal',hitsMin:3},1.30],['v26_frost_bridge','霜晶還流器','霜晶生成済み＋再構築直後+30%。',{materialMade:'frost_crystal',recentReshuffle:true},1.30],['v26_starsteel_bridge','星鉄防壁器','星鉄生成済み＋防御・複合+30%。',{materialMade:'starsteel',blockish:true},1.30],['v26_resonance_bridge','共鳴調律器','共鳴晶生成済み＋調律カード+31%。',{materialMade:'resonance_prism',tuned:true},1.31],
    ['v26_world_bridge','世界種刻印器','世界種生成済み＋ルーンカード+32%。',{materialMade:'world_seed',runed:true},1.32],['v26_link_reactor','連結反応炉','反応4種以上＋連結コンボ+32%。',{reactionTypesMin:4,linkActive:true},1.32],['v26_arcana_still','秘儀蒸留塔','上位錬成物3種以上＋アルカナ一致+34%。',{advancedMaterialDiversityMin:3,arcanaMatch:true},1.34],['v26_boss_crucible','試金坩堝','上位錬成物生成済み＋ボス戦+35%。',{advancedMaterialMade:true,enemyIsBoss:true},1.35],['v26_long_furnace','長期炉','4ターン目以降+24%。',{turnMin:4},1.24]
  ];for(const [id,name,desc,when,mult] of relRows){D.RELICS[id]={name,tags:['元素','錬成'],desc,requiresUnlock:true};D.V26_RELIC_RULES[id]=[{when,mult}];}

  // プロトコル12
  D.V26_PROTOCOL_RULES={};const pRows=[
    ['v26_p_tri','三相運用規格','3元素以上配分+32%、未達-8%。',{elementDiversityMin:3},1.32,.92],['v26_p_penta','五相運用規格','5元素配分+42%、未達-12%。',{elementDiversityMin:5},1.42,.88],['v26_p_react','反応履歴規格','反応5種以上+38%、未達-10%。',{reactionTypesMin:5},1.38,.90],['v26_p_consume','多消費規格','消費4種以上+40%、未達-11%。',{materialDiversityUsedMin:4},1.40,.89],['v26_p_stock','多槽規格','在庫5種以上+37%、未達-9%。',{materialStockDiversityMin:5},1.37,.91],['v26_p_opus','大業工程規格','上位錬成物4種以上+46%、未達-13%。',{advancedMaterialDiversityMin:4},1.46,.87],['v26_p_rune','刻印錬成規格','上位錬成物2種＋ルーンカード+40%、未達-10%。',{advancedMaterialDiversityMin:2,runed:true},1.40,.90],['v26_p_tune','調律錬成規格','上位錬成物2種＋調律カード+40%、未達-10%。',{advancedMaterialDiversityMin:2,tuned:true},1.40,.90],['v26_p_link','連結錬成規格','反応3種＋連結コンボ+39%、未達-10%。',{reactionTypesMin:3,linkActive:true},1.39,.90],['v26_p_lowhp','熔血規格','熔核生成済み＋HP半分以下+44%、未達-12%。',{materialMade:'magma_core',lowHp:true},1.44,.88],['v26_p_cycle','霜環規格','霜晶生成済み＋再構築直後+42%、未達-11%。',{materialMade:'frost_crystal',recentReshuffle:true},1.42,.89],['v26_p_hybrid','混成大業規格','3元素以上＋強化層2つ+43%、未達-12%。',{elementDiversityMin:3,augmentationMin:2},1.43,.88]
  ];for(const [id,name,desc,when,hit,miss] of pRows){D.PROTOCOLS[id]={name,tags:['元素','錬成'],desc,effect:id,requiresUnlock:true};D.V26_PROTOCOL_RULES[id]={when,hit,miss};}

  // 調律10
  D.V26_TUNING_RULES={};const tRows=[
    ['v26_t_fire','火相調律','火が最大配分なら+38%、未達-9%。',{elementDominant:'fire'},1.38,.91],['v26_t_wind','風相調律','風が最大配分なら+38%、未達-9%。',{elementDominant:'wind'},1.38,.91],['v26_t_water','水相調律','水が最大配分なら+38%、未達-9%。',{elementDominant:'water'},1.38,.91],['v26_t_earth','土相調律','土が最大配分なら+38%、未達-9%。',{elementDominant:'earth'},1.38,.91],['v26_t_aether','第五相調律','エーテル最大配分なら+38%、未達-9%。',{elementDominant:'aether'},1.38,.91],['v26_t_tri','三相調律','3元素以上配分+40%、未達-10%。',{elementDiversityMin:3},1.40,.90],['v26_t_penta','五相調律','5元素配分+50%、未達-14%。',{elementDiversityMin:5},1.50,.86],['v26_t_react','反応媒介調律','反応4種以上+44%、未達-11%。',{reactionTypesMin:4},1.44,.89],['v26_t_consume','消費媒介調律','3元素以上配分＋3種類以上消費で+47%、未達-13%。',{elementDiversityMin:3,materialDiversityUsedMin:3},1.47,.87],['v26_t_opus','大業媒介調律','上位錬成物4種以上+52%、未達-15%。',{advancedMaterialDiversityMin:4},1.52,.85]
  ];for(const [id,name,desc,when,hit,miss] of tRows){D.TUNINGS[id]={name,tags:['元素','錬成','調律'],desc,effect:id,requiresUnlock:true};D.V26_TUNING_RULES[id]={when,hit,miss};}

  // 特殊個体10 + 複合挙動20
  const traitDefs={
    v26_fireborn:{name:'火成個体',short:'火成',desc:'攻撃×1.14、火傷圧を強める。'},v26_windborn:{name:'風成個体',short:'風成',desc:'速度+0.35。'},v26_waterborn:{name:'水成個体',short:'水成',desc:'再生+3。'},v26_earthborn:{name:'地成個体',short:'地成',desc:'防御+5。'},v26_aetherborn:{name:'第五相個体',short:'第五相',desc:'耐性+18%。'},v26_triphase:{name:'三相個体',short:'三相',desc:'HP/攻撃×1.08。'},v26_pentaphase:{name:'五相個体',short:'五相',desc:'HP×1.12、防御+2、耐性+8%。'},v26_reactive:{name:'反応個体',short:'反応',desc:'攻撃×1.10、速度+0.15。'},v26_hoarder:{name:'備蓄個体',short:'備蓄',desc:'HP×1.15、再生+1。'},v26_consumer:{name:'消費個体',short:'消費',desc:'攻撃×1.13、防御+2。'}
  };Object.assign(D.TRAITS,traitDefs);D.V26_TRAIT_RULES={v26_fireborn:{atkMult:1.14},v26_windborn:{spdAdd:.35},v26_waterborn:{regenAdd:3},v26_earthborn:{defAdd:5},v26_aetherborn:{resistAdd:18},v26_triphase:{hpMult:1.08,atkMult:1.08},v26_pentaphase:{hpMult:1.12,defAdd:2,resistAdd:8},v26_reactive:{atkMult:1.10,spdAdd:.15},v26_hoarder:{hpMult:1.15,regenAdd:1},v26_consumer:{atkMult:1.13,defAdd:2}};
  D.V26_TRAIT_CONDITIONS={v26_fireborn:{label:'攻撃倍率10以上＋速度2以上',check:e=>e.atk>=10&&e.spd>=2},v26_windborn:{label:'速度5以上',check:e=>e.spd>=5},v26_waterborn:{label:'再生力8以上',check:e=>e.regen>=8},v26_earthborn:{label:'防御倍率12以上',check:e=>e.def>=12},v26_aetherborn:{label:'状態異常耐性85%以上',check:e=>e.resist>=85},v26_triphase:{label:'HP/攻撃/防御倍率8以上',check:e=>e.hp>=8&&e.atk>=8&&e.def>=8},v26_pentaphase:{label:'HP/攻撃/防御10以上＋速度3＋再生5＋耐性60%以上',advanced:true,check:e=>e.hp>=10&&e.atk>=10&&e.def>=10&&e.spd>=3&&e.regen>=5&&e.resist>=60},v26_reactive:{label:'攻撃9以上＋速度4以上＋耐性50%以上',advanced:true,check:e=>e.atk>=9&&e.spd>=4&&e.resist>=50},v26_hoarder:{label:'HP倍率14以上＋再生6以上',advanced:true,check:e=>e.hp>=14&&e.regen>=6},v26_consumer:{label:'攻撃倍率12以上＋防御倍率8以上',check:e=>e.atk>=12&&e.def>=8}};
  const tids=Object.keys(traitDefs),names=['元素暴走','相転連鎖','霜火循環','地脈共振','第五相障壁','三相脈動','五相再編','反応加速','備蓄再生','消費強襲','火風乱流','火水蒸散','火土熔殻','火 ether 共鳴','風水還流','風土浮岩','風 ether 共振','水土深層化','水 ether 世界脈','土 ether 晶析'];
  let bi=0;for(let i=0;i<tids.length&&bi<20;i++)for(let j=i+1;j<tids.length&&bi<20;j++,bi++){const id=`v26_bh_${bi}`;D.ENEMY_BEHAVIORS[id]={name:names[bi].replace(' ether ','エーテル'),requires:[tids[i],tids[j]],desc:bi%4===0?'3ターンごとに攻撃+5。':bi%4===1?'3ターンごとに障壁12。':bi%4===2?'3ターンごとにHP7回復。':'前ターン回復時に追加行動。',rules:bi%4===0?{everyNTurnAttackBonus:{turns:3,amount:5}}:bi%4===1?{everyNTurnBlock:{turns:3,amount:12}}:bi%4===2?{everyNTurnCleanseHeal:{turns:3,amount:0,heal:7}}:{healNextExtraAction:true}};}

  D.V26_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));D.V26_CHARACTER_IDS=Object.keys(D.CHARACTERS).filter(id=>!before.characters.has(id));D.V26_STYLE_IDS=Object.keys(D.CHARACTER_STYLES).filter(id=>!before.styles.has(id));D.V26_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));D.V26_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));D.V26_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));D.V26_TRAIT_IDS=Object.keys(D.TRAITS).filter(id=>!before.traits.has(id));D.V26_BEHAVIOR_IDS=Object.keys(D.ENEMY_BEHAVIORS).filter(id=>!before.behaviors.has(id));
})();
