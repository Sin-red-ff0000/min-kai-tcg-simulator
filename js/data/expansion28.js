'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data;
  // v0.28 balance audit: high-burden cross-system conditions must pay clearly above
  // unconditional v0.26 cards, without turning low-burden conditions into strict upgrades.
  D.V28_BALANCE_AUDIT={version:'0.28',focus:'condition-burden-vs-payoff',adjustedCards:[],adjustedRelics:[],adjustedProtocols:[],adjustedTunings:[]};

  const cardAdjust={
    v27_arcana_edge:{mult:1.48,desc:'11ダメージ。現在のアルカナ条件に一致する時+48%。'},
    v27_arcana_guard:{mult:1.48,desc:'防御11。現在のアルカナ条件に一致する時+48%。'},
    v27_arcana_plain:{mult:1.62,desc:'12ダメージ。強化層なし＋アルカナ一致で+62%。'},
    v27_arcana_layered:{mult:1.58,desc:'9ダメージ＋防御9。強化層2つ以上＋アルカナ一致で+58%。'},
    v27_trait_hunter:{mult:1.52,desc:'12ダメージ。特殊個体3種以上の敵へ+52%。'},
    v27_behavior_hunter:{mult:1.56,desc:'13ダメージ。複合挙動2種以上の敵へ+56%。'},
    v27_trait_bastion:{mult:1.58,desc:'防御12。特殊個体4種以上の敵へ+58%。'},
    v27_apex_probe:{mult:1.72,desc:'8ダメージ＋防御8。特殊個体5種以上なら+72%。'},
    v27_complex_probe:{mult:1.76,desc:'9ダメージ＋防御7。複合挙動3種以上なら+76%。'},
    v27_rune_opus:{mult:1.66,desc:'13ダメージ。ルーン付与＋上位錬成物2種以上で+66%。'},
    v27_rune_stock:{mult:1.60,desc:'防御12。ルーン付与＋在庫4種以上で+60%。'},
    v27_rune_react:{mult:1.58,desc:'4×3ダメージ。ルーン付与＋反応4種以上で+58%。'},
    v27_rune_consume:{mult:1.62,desc:'8ダメージ＋防御8。ルーン付与＋消費3種以上で+62%。'},
    v27_link_fire:{mult:1.58,desc:'12ダメージ。連結コンボ＋火最大配分で+58%。'},
    v27_link_wind:{mult:1.56,desc:'4×3ダメージ。連結コンボ＋風最大配分で+56%。'},
    v27_link_water:{mult:1.56,desc:'防御13。連結コンボ＋水最大配分で+56%。'},
    v27_link_earth:{mult:1.56,desc:'8ダメージ＋防御10。連結コンボ＋土最大配分で+56%。'}
  };
  for(const [id,a] of Object.entries(cardAdjust)){
    if(!D.CARDS[id]||!D.V27_CARD_RULES?.[id]?.[0])continue;
    D.CARDS[id].desc=a.desc;D.V27_CARD_RULES[id][0].mult=a.mult;D.V28_BALANCE_AUDIT.adjustedCards.push(id);
  }

  // Relics remain below protocol/tuning ceilings, but two-condition relics now beat
  // broad single-condition relics by a visible margin.
  const relicAdjust={
    v27_arcana_rune_prism:[1.38,'アルカナ一致＋ルーン付与で+38%。'],
    v27_arcana_plain_seal:[1.37,'アルカナ一致＋強化層なしで+37%。'],
    v27_arcana_opus_seal:[1.42,'アルカナ一致＋上位錬成物2種以上で+42%。'],
    v27_apex_scope:[1.44,'特殊個体5種以上の敵へ+44%。'],
    v27_complex_scope:[1.46,'複合挙動3種以上の敵へ+46%。'],
    v27_rune_stock_lens:[1.38,'ルーン付与＋在庫4種以上で+38%。'],
    v27_rune_react_lens:[1.39,'ルーン付与＋反応4種以上で+39%。'],
    v27_rune_opus_lens:[1.44,'ルーン付与＋上位錬成物3種以上で+44%。'],
    v27_rune_consume_lens:[1.40,'ルーン付与＋消費3種以上で+40%。'],
    v27_link_tri_lens:[1.38,'連結コンボ＋3元素以上配分で+38%。'],
    v27_link_react_lens:[1.41,'連結コンボ＋反応4種以上で+41%。'],
    v27_link_rune_lens:[1.39,'連結コンボ＋ルーン付与で+39%。'],
    v27_link_arcana_lens:[1.42,'連結コンボ＋アルカナ一致で+42%。']
  };
  for(const [id,[mult,desc]] of Object.entries(relicAdjust)){
    if(!D.RELICS[id]||!D.V27_RELIC_RULES?.[id]?.[0])continue;
    D.RELICS[id].desc=desc;D.V27_RELIC_RULES[id][0].mult=mult;D.V28_BALANCE_AUDIT.adjustedRelics.push(id);
  }

  // Hard protocols/tunings get a larger success premium, but keep meaningful misses.
  const protocolAdjust={
    v27_p_arcana_rune:[1.50,.88,'アルカナ一致＋ルーン付与+50%、未達-12%。'],
    v27_p_arcana_plain:[1.54,.87,'アルカナ一致＋強化層なし+54%、未達-13%。'],
    v27_p_behavior:[1.50,.88,'複合挙動2種以上の敵へ+50%、未達-12%。'],
    v27_p_rune_opus:[1.58,.84,'ルーン付与＋上位錬成物3種以上+58%、未達-16%。'],
    v27_p_rune_react:[1.54,.86,'ルーン付与＋反応4種以上+54%、未達-14%。'],
    v27_p_link_element:[1.54,.86,'連結コンボ＋3元素以上配分+54%、未達-14%。'],
    v27_p_link_arcana:[1.58,.84,'連結コンボ＋アルカナ一致+58%、未達-16%。']
  };
  for(const [id,[hit,miss,desc]] of Object.entries(protocolAdjust)){
    const r=D.V27_PROTOCOL_RULES?.[id];if(!r||!D.PROTOCOLS[id])continue;
    r.hit=hit;r.miss=miss;D.PROTOCOLS[id].desc=desc;D.V28_BALANCE_AUDIT.adjustedProtocols.push(id);
  }

  const tuningAdjust={
    v27_t_arcana_rune:[1.58,.84,'アルカナ一致＋ルーン付与+58%、未達-16%。'],
    v27_t_behavior:[1.56,.85,'複合挙動2種以上の敵へ+56%、未達-15%。'],
    v27_t_rune_stock:[1.57,.84,'ルーン付与＋在庫4種以上+57%、未達-16%。'],
    v27_t_rune_opus:[1.64,.81,'ルーン付与＋上位錬成物3種以上+64%、未達-19%。'],
    v27_t_link_tri:[1.58,.83,'連結コンボ＋3元素以上配分+58%、未達-17%。'],
    v27_t_link_arcana:[1.64,.81,'連結コンボ＋アルカナ一致+64%、未達-19%。']
  };
  for(const [id,[hit,miss,desc]] of Object.entries(tuningAdjust)){
    const r=D.V27_TUNING_RULES?.[id];if(!r||!D.TUNINGS[id])continue;
    r.hit=hit;r.miss=miss;D.TUNINGS[id].desc=desc;D.V28_BALANCE_AUDIT.adjustedTunings.push(id);
  }

  // Automatic audit helpers are exposed so future expansions can reuse the same check.
  D.conditionBurden=function(when){
    if(!when)return 0;let score=Object.keys(when).length;
    const heavy=['enemyTraitsMin','enemyBehaviorsMin','advancedMaterialDiversityMin','materialStockDiversityMin','materialDiversityUsedMin','reactionTypesMin','elementDiversityMin','augmentationMin'];
    for(const k of heavy)if(when[k]!=null)score+=Math.max(0,Number(when[k])-1)*0.35;
    if(when.linkActive||when.arcanaMatch||when.recentReshuffle)score+=.35;
    return Number(score.toFixed(2));
  };
})();
