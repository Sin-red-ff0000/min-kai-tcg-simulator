'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  const before={cards:new Set(Object.keys(D.CARDS)),characters:new Set(Object.keys(D.CHARACTERS)),styles:new Set(Object.keys(D.CHARACTER_STYLES||{})),relics:new Set(Object.keys(D.RELICS)),protocols:new Set(Object.keys(D.PROTOCOLS||{})),tunings:new Set(Object.keys(D.TUNINGS||{})),traits:new Set(Object.keys(D.TRAITS||{})),behaviors:new Set(Object.keys(D.ENEMY_BEHAVIORS||{}))};

  // v0.27: システム横断カード。単一軸の数値札ではなく、複数の既存システムを橋渡しする。
  D.V27_CARD_RULES={};
  const cards=[
    // アルカナ橋 6
    ['v27_arcana_edge','秘儀適応刃',['アルカナ','単発'],{kind:'damage',damage:11},'11ダメージ。現在のアルカナ条件に一致する時+38%。',{arcanaMatch:true},1.38],
    ['v27_arcana_guard','秘儀適応壁',['アルカナ','防御'],{kind:'block',block:11},'防御11。現在のアルカナ条件に一致する時+38%。',{arcanaMatch:true},1.38],
    ['v27_upright_vector','正位ベクトル',['アルカナ','正位置'],{kind:'hybrid',damage:8,block:8},'8ダメージ＋防御8。正位置選択中+28%。',{arcanaUpright:true},1.28],
    ['v27_reverse_vector','逆位ベクトル',['アルカナ','逆位置'],{kind:'damage',damage:13},'13ダメージ。逆位置選択中+28%。',{arcanaReversed:true},1.28],
    ['v27_arcana_plain','無銘の秘儀',['アルカナ','素体'],{kind:'damage',damage:12},'12ダメージ。強化層なし＋アルカナ一致で+48%。',{plainCard:true,arcanaMatch:true},1.48],
    ['v27_arcana_layered','重層秘儀',['アルカナ','強化'],{kind:'hybrid',damage:9,block:9},'9ダメージ＋防御9。強化層2つ以上＋アルカナ一致で+44%。',{augmentationMin:2,arcanaMatch:true},1.44],
    // 特殊個体・複合挙動逆利用 6
    ['v27_trait_hunter','形質狩り',['特殊個体','単発'],{kind:'damage',damage:12},'12ダメージ。特殊個体3種以上の敵へ+42%。',{enemyTraitsMin:3},1.42],
    ['v27_behavior_hunter','挙動断ち',['複合挙動','単発'],{kind:'damage',damage:13},'13ダメージ。複合挙動2種以上の敵へ+44%。',{enemyBehaviorsMin:2},1.44],
    ['v27_trait_bastion','形質受け',['特殊個体','防御'],{kind:'block',block:12},'防御12。特殊個体4種以上の敵へ+40%。',{enemyTraitsMin:4},1.40],
    ['v27_behavior_bastion','挙動受け',['複合挙動','防御'],{kind:'block',block:12},'防御12。複合挙動1種以上の敵へ+32%。',{enemyBehaviorsMin:1},1.32],
    ['v27_apex_probe','頂点観測',['特殊個体','観測'],{kind:'hybrid',damage:8,block:8},'8ダメージ＋防御8。特殊個体5種以上なら+52%。',{enemyTraitsMin:5},1.52],
    ['v27_complex_probe','複合観測',['複合挙動','観測'],{kind:'hybrid',damage:9,block:7},'9ダメージ＋防御7。複合挙動3種以上なら+54%。',{enemyBehaviorsMin:3},1.54],
    // ルーン×錬成 4
    ['v27_rune_opus','刻印大業刃',['ルーン','錬成'],{kind:'damage',damage:13},'13ダメージ。ルーン付与＋上位錬成物2種以上で+45%。',{runed:true,advancedMaterialDiversityMin:2},1.45],
    ['v27_rune_stock','刻印備蓄壁',['ルーン','錬成','防御'],{kind:'block',block:12},'防御12。ルーン付与＋在庫4種以上で+42%。',{runed:true,materialStockDiversityMin:4},1.42],
    ['v27_rune_react','刻印反応列',['ルーン','錬成','連撃'],{kind:'damage',damage:4,hits:3},'4×3ダメージ。ルーン付与＋反応4種以上で+40%。',{runed:true,reactionTypesMin:4},1.40],
    ['v27_rune_consume','刻印消費路',['ルーン','錬成','複合'],{kind:'hybrid',damage:8,block:8},'8ダメージ＋防御8。ルーン付与＋消費3種以上で+42%。',{runed:true,materialDiversityUsedMin:3},1.42],
    // 連結×元素 4
    ['v27_link_fire','連結火路',['連結','火'],{kind:'damage',damage:12},'12ダメージ。連結コンボ＋火最大配分で+43%。',{linkActive:true,elementDominant:'fire'},1.43],
    ['v27_link_wind','連結風路',['連結','風','連撃'],{kind:'damage',damage:4,hits:3},'4×3ダメージ。連結コンボ＋風最大配分で+41%。',{linkActive:true,elementDominant:'wind'},1.41],
    ['v27_link_water','連結水路',['連結','水','防御'],{kind:'block',block:13},'防御13。連結コンボ＋水最大配分で+41%。',{linkActive:true,elementDominant:'water'},1.41],
    ['v27_link_earth','連結地路',['連結','土','複合'],{kind:'hybrid',damage:8,block:10},'8ダメージ＋防御10。連結コンボ＋土最大配分で+41%。',{linkActive:true,elementDominant:'earth'},1.41]
  ];
  for(const [id,name,tags,body,desc,when,mult] of cards){D.CARDS[id]={id,name,tags,desc,...body,requiresUnlock:true};D.V27_CARD_RULES[id]=[{when,mult}];}

  // 条件変化型二面カードを4枚追加。変化条件自体が別システムとの橋になる。
  const duals={
    v27_dual_arcana:{condition:'現在のアルカナ条件に一致するカードを使用',front:{name:'未解読面',kind:'block',block:9,tags:['二面','アルカナ','防御'],desc:'防御9。アルカナ装備中、現在の向きの条件に一致する状況になると「解読面」へ変化。'},back:{name:'解読面',kind:'hybrid',damage:12,block:9,tags:['二面','アルカナ','複合'],desc:'12ダメージ＋防御9。'},check:(b)=>{const s=BL.Store.state,a=D.ARCANA?.[s.arcana?.id];if(!a||!s.unlockedArcana?.[s.arcana.id])return false;const side=a[s.arcana.orientation==='reversed'?'reversed':'upright'];return !!side&&b.turn>=2;}},
    v27_dual_rune:{condition:'ルーンを3枚以上のカードへ設定',front:{name:'無刻印面',kind:'damage',damage:10,tags:['二面','ルーン','単発'],desc:'10ダメージ。ルーン設定カードが3種類以上なら「刻印面」へ変化。'},back:{name:'刻印面',kind:'damage',damage:5,hits:3,tags:['二面','ルーン','連撃'],desc:'5×3ダメージ。'},check:()=>Object.keys(BL.Store.state.cardRunes||{}).length>=3},
    v27_dual_trait:{condition:'特殊個体3種類以上の敵と交戦',front:{name:'観察面',kind:'block',block:10,tags:['二面','特殊個体','防御'],desc:'防御10。敵の特殊個体特性が3種類以上なら「解析面」へ変化。'},back:{name:'解析面',kind:'damage',damage:18,tags:['二面','特殊個体','単発'],desc:'18ダメージ。'},check:(b)=>(b.enemy.traits||[]).filter(id=>D.TRAITS[id]).length>=3},
    v27_dual_link:{condition:'連結コンボを2回成立',front:{name:'予備回路',kind:'hybrid',damage:7,block:7,tags:['二面','連結','複合'],desc:'7ダメージ＋防御7。連結コンボ2回成立後「主回路」へ変化。'},back:{name:'主回路',kind:'hybrid',damage:11,block:11,tags:['二面','連結','複合'],desc:'11ダメージ＋防御11。'},check:(b)=>b.linkComboCount>=2}
  };
  Object.assign(D.DUAL_FACE_CARDS,duals);for(const [id,df] of Object.entries(duals))D.CARDS[id]={id,name:df.front.name,tags:[...df.front.tags],desc:df.front.desc,kind:df.front.kind,...df.front,dualFace:true,requiresUnlock:true};

  // キャラクター2 / スタイル6
  Object.assign(D.CHARACTERS,{astral:{id:'astral',name:'アストラル',role:'アルカナ・刻印横断',hp:72,desc:'アルカナとルーンを重ねるほど、条件一致札の選択価値が上がる。'},tracker:{id:'tracker',name:'トラッカー',role:'特殊個体攻略',hp:76,desc:'敵の特殊個体・複合挙動を観測し、強敵ほど出力へ変換する。'}});
  D.V27_CHARACTER_RULES={astral:[{when:{arcanaMatch:true},mult:1.13},{when:{runed:true},mult:1.12}],tracker:[{when:{enemyTraitsMin:2},mult:1.12},{when:{enemyBehaviorsMin:1},mult:1.13}]};
  D.V27_STYLE_RULES={};const styles=[
    ['astral_plain','astral','白紙秘儀型','強化層なし＋アルカナ一致で+32%。',{plainCard:true,arcanaMatch:true},1.32],['astral_rune','astral','刻印秘儀型','ルーン付与＋アルカナ一致で+30%。',{runed:true,arcanaMatch:true},1.30],['astral_opus','astral','大業秘儀型','上位錬成物2種以上＋アルカナ一致で+31%。',{advancedMaterialDiversityMin:2,arcanaMatch:true},1.31],
    ['tracker_trait','tracker','形質狩猟型','特殊個体3種以上の敵へ+31%。',{enemyTraitsMin:3},1.31],['tracker_behavior','tracker','挙動狩猟型','複合挙動2種以上の敵へ+33%。',{enemyBehaviorsMin:2},1.33],['tracker_apex','tracker','頂点追跡型','特殊個体5種以上の敵へ+42%。',{enemyTraitsMin:5},1.42]
  ];for(const [id,ch,name,desc,when,mult] of styles){D.CHARACTER_STYLES[id]={id,character:ch,name,tags:['横断','観測'],desc};D.V27_STYLE_RULES[id]=[{when,mult}];}

  // 遺物16
  D.V27_RELIC_RULES={};const relics=[
    ['v27_arcana_compass','秘儀羅針','アルカナ一致カード+24%。',{arcanaMatch:true},1.24],['v27_arcana_rune_prism','秘儀刻印プリズム','アルカナ一致＋ルーン付与で+32%。',{arcanaMatch:true,runed:true},1.32],['v27_arcana_plain_seal','白紙秘儀印','アルカナ一致＋強化層なしで+31%。',{arcanaMatch:true,plainCard:true},1.31],['v27_arcana_opus_seal','大業秘儀印','アルカナ一致＋上位錬成物2種以上で+34%。',{arcanaMatch:true,advancedMaterialDiversityMin:2},1.34],
    ['v27_trait_scope','形質照準器','特殊個体3種以上の敵へ+25%。',{enemyTraitsMin:3},1.25],['v27_behavior_scope','挙動照準器','複合挙動2種以上の敵へ+28%。',{enemyBehaviorsMin:2},1.28],['v27_apex_scope','頂点照準器','特殊個体5種以上の敵へ+37%。',{enemyTraitsMin:5},1.37],['v27_complex_scope','複合照準器','複合挙動3種以上の敵へ+39%。',{enemyBehaviorsMin:3},1.39],
    ['v27_rune_stock_lens','刻印備蓄レンズ','ルーン付与＋在庫4種以上で+30%。',{runed:true,materialStockDiversityMin:4},1.30],['v27_rune_react_lens','刻印反応レンズ','ルーン付与＋反応4種以上で+31%。',{runed:true,reactionTypesMin:4},1.31],['v27_rune_opus_lens','刻印大業レンズ','ルーン付与＋上位錬成物3種以上で+35%。',{runed:true,advancedMaterialDiversityMin:3},1.35],['v27_rune_consume_lens','刻印消費レンズ','ルーン付与＋消費3種以上で+32%。',{runed:true,materialDiversityUsedMin:3},1.32],
    ['v27_link_tri_lens','連結三相レンズ','連結コンボ＋3元素以上配分で+30%。',{linkActive:true,elementDiversityMin:3},1.30],['v27_link_react_lens','連結反応レンズ','連結コンボ＋反応4種以上で+33%。',{linkActive:true,reactionTypesMin:4},1.33],['v27_link_rune_lens','連結刻印レンズ','連結コンボ＋ルーン付与で+31%。',{linkActive:true,runed:true},1.31],['v27_link_arcana_lens','連結秘儀レンズ','連結コンボ＋アルカナ一致で+34%。',{linkActive:true,arcanaMatch:true},1.34]
  ];for(const [id,name,desc,when,mult] of relics){D.RELICS[id]={name,tags:['横断'],desc,requiresUnlock:true};D.V27_RELIC_RULES[id]=[{when,mult}];}

  // プロトコル8 / 調律8
  D.V27_PROTOCOL_RULES={};const protocols=[
    ['v27_p_arcana_rune','秘儀刻印規格','アルカナ一致＋ルーン付与+42%、未達-11%。',{arcanaMatch:true,runed:true},1.42,.89],['v27_p_arcana_plain','白紙秘儀規格','アルカナ一致＋強化層なし+45%、未達-12%。',{arcanaMatch:true,plainCard:true},1.45,.88],['v27_p_trait','形質攻略規格','特殊個体3種以上の敵へ+39%、未達-9%。',{enemyTraitsMin:3},1.39,.91],['v27_p_behavior','挙動攻略規格','複合挙動2種以上の敵へ+43%、未達-11%。',{enemyBehaviorsMin:2},1.43,.89],['v27_p_rune_opus','刻印大業規格','ルーン付与＋上位錬成物3種以上+47%、未達-13%。',{runed:true,advancedMaterialDiversityMin:3},1.47,.87],['v27_p_rune_react','刻印反応規格','ルーン付与＋反応4種以上+44%、未達-12%。',{runed:true,reactionTypesMin:4},1.44,.88],['v27_p_link_element','連結元素規格','連結コンボ＋3元素以上配分+44%、未達-12%。',{linkActive:true,elementDiversityMin:3},1.44,.88],['v27_p_link_arcana','連結秘儀規格','連結コンボ＋アルカナ一致+47%、未達-13%。',{linkActive:true,arcanaMatch:true},1.47,.87]
  ];for(const [id,name,desc,when,hit,miss] of protocols){D.PROTOCOLS[id]={name,tags:['横断'],desc,effect:id,requiresUnlock:true};D.V27_PROTOCOL_RULES[id]={when,hit,miss};}
  D.V27_TUNING_RULES={};const tunings=[
    ['v27_t_arcana','秘儀一致調律','アルカナ一致+41%、未達-10%。',{arcanaMatch:true},1.41,.90],['v27_t_arcana_rune','秘儀刻印調律','アルカナ一致＋ルーン付与+49%、未達-14%。',{arcanaMatch:true,runed:true},1.49,.86],['v27_t_trait','形質観測調律','特殊個体3種以上の敵へ+43%、未達-11%。',{enemyTraitsMin:3},1.43,.89],['v27_t_behavior','挙動観測調律','複合挙動2種以上の敵へ+47%、未達-13%。',{enemyBehaviorsMin:2},1.47,.87],['v27_t_rune_stock','刻印備蓄調律','ルーン付与＋在庫4種以上+47%、未達-13%。',{runed:true,materialStockDiversityMin:4},1.47,.87],['v27_t_rune_opus','刻印大業調律','ルーン付与＋上位錬成物3種以上+52%、未達-15%。',{runed:true,advancedMaterialDiversityMin:3},1.52,.85],['v27_t_link_tri','連結三相調律','連結コンボ＋3元素以上配分+48%、未達-14%。',{linkActive:true,elementDiversityMin:3},1.48,.86],['v27_t_link_arcana','連結秘儀調律','連結コンボ＋アルカナ一致+52%、未達-15%。',{linkActive:true,arcanaMatch:true},1.52,.85]
  ];for(const [id,name,desc,when,hit,miss] of tunings){D.TUNINGS[id]={name,tags:['横断','調律'],desc,effect:id,requiresUnlock:true};D.V27_TUNING_RULES[id]={when,hit,miss};}

  // 特殊個体6 + 複合挙動12。従来軸と違い「複数高パラメータの組合せ」を要求。
  const traitDefs={
    v27_predator:{name:'追跡個体',short:'追跡',desc:'攻撃×1.10、速度+0.30。'},v27_citadel:{name:'城塞個体',short:'城塞',desc:'HP×1.12、防御+4。'},v27_oracle:{name:'予見個体',short:'予見',desc:'速度+0.20、耐性+12%。'},v27_reclaimer:{name:'再生個体',short:'再生',desc:'HP×1.08、再生+3。'},v27_paradox:{name:'逆説個体',short:'逆説',desc:'攻撃×1.08、防御+2、耐性+8%。'},v27_crown:{name:'冠位個体',short:'冠位',desc:'HP/攻撃×1.10、速度+0.15。'}
  };Object.assign(D.TRAITS,traitDefs);
  D.V27_TRAIT_RULES={v27_predator:{atkMult:1.10,spdAdd:.30},v27_citadel:{hpMult:1.12,defAdd:4},v27_oracle:{spdAdd:.20,resistAdd:12},v27_reclaimer:{hpMult:1.08,regenAdd:3},v27_paradox:{atkMult:1.08,defAdd:2,resistAdd:8},v27_crown:{hpMult:1.10,atkMult:1.10,spdAdd:.15}};
  D.V27_TRAIT_CONDITIONS={v27_predator:{label:'攻撃倍率10以上＋速度4以上',check:e=>e.atk>=10&&e.spd>=4},v27_citadel:{label:'HP倍率12以上＋防御倍率10以上',check:e=>e.hp>=12&&e.def>=10},v27_oracle:{label:'速度4以上＋耐性70%以上',advanced:true,check:e=>e.spd>=4&&e.resist>=70},v27_reclaimer:{label:'HP倍率10以上＋再生8以上',advanced:true,check:e=>e.hp>=10&&e.regen>=8},v27_paradox:{label:'攻撃9以上＋防御9以上＋耐性60%以上',advanced:true,check:e=>e.atk>=9&&e.def>=9&&e.resist>=60},v27_crown:{label:'HP/攻撃12以上＋速度4以上',advanced:true,check:e=>e.hp>=12&&e.atk>=12&&e.spd>=4}};
  const tids=Object.keys(traitDefs),behaviorNames=['追跡城塞','追跡予見','追跡再生','追跡逆説','追跡冠位','城塞予見','城塞再生','城塞逆説','城塞冠位','予見再生','予見逆説','再生冠位'];let bi=0;
  outer:for(let i=0;i<tids.length;i++)for(let j=i+1;j<tids.length;j++){if(bi>=12)break outer;const id=`v27_bh_${bi}`,type=bi%4;D.ENEMY_BEHAVIORS[id]={name:behaviorNames[bi],requires:[tids[i],tids[j]],desc:type===0?'3ターンごとに攻撃+6。':type===1?'3ターンごとに障壁14。':type===2?'3ターンごとにHP8回復。':'前ターン回復時に追加行動。',rules:type===0?{everyNTurnAttackBonus:{turns:3,amount:6}}:type===1?{everyNTurnBlock:{turns:3,amount:14}}:type===2?{everyNTurnCleanseHeal:{turns:3,amount:0,heal:8}}:{healNextExtraAction:true}};bi++;}

  D.V27_CARD_IDS=Object.keys(D.CARDS).filter(id=>!before.cards.has(id));D.V27_CHARACTER_IDS=Object.keys(D.CHARACTERS).filter(id=>!before.characters.has(id));D.V27_STYLE_IDS=Object.keys(D.CHARACTER_STYLES).filter(id=>!before.styles.has(id));D.V27_RELIC_IDS=Object.keys(D.RELICS).filter(id=>!before.relics.has(id));D.V27_PROTOCOL_IDS=Object.keys(D.PROTOCOLS).filter(id=>!before.protocols.has(id));D.V27_TUNING_IDS=Object.keys(D.TUNINGS).filter(id=>!before.tunings.has(id));D.V27_TRAIT_IDS=Object.keys(D.TRAITS).filter(id=>!before.traits.has(id));D.V27_BEHAVIOR_IDS=Object.keys(D.ENEMY_BEHAVIORS).filter(id=>!before.behaviors.has(id));
})();
