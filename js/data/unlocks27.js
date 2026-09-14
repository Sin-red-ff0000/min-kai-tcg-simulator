'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const add=u=>D.UNLOCKS.push(u),win=(id,kind,reward,title,condition,when)=>({id,kind,reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:9});
 const tag=(s,t)=>s.deck.filter(id=>(D.CARDS[id]?.tags||[]).includes(t)).length,traits=b=>(b?.enemy?.traits||[]).filter(id=>D.TRAITS[id]).length,beh=b=>b?.enemy?.behaviors?.length||0;
 add(win('v27_cards_arcana','card',D.V27_CARD_IDS.filter(id=>id.includes('arcana')||id.includes('upright')||id.includes('reverse')),'秘儀横断カード研究','アルカナを装備し、アルカナタグ4枚以上で勝利',(s)=>s.boss4Defeated&&!!s.arcana?.id&&tag(s,'アルカナ')>=4));
 add(win('v27_cards_hunter','card',D.V27_CARD_IDS.filter(id=>id.includes('trait')||id.includes('behavior')||id.includes('probe')),'観測攻略カード研究','特殊個体3種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&traits(b)>=3));
 add(win('v27_cards_rune','card',D.V27_CARD_IDS.filter(id=>id.startsWith('v27_rune_')),'刻印錬成カード研究','ルーンを3種類以上設定し、錬成を有効にして勝利',(s)=>s.boss4Defeated&&Object.keys(s.cardRunes||{}).length>=3&&!!s.alchemy?.enabled));
 add(win('v27_cards_link','card',D.V27_CARD_IDS.filter(id=>id.startsWith('v27_link_')),'連結元素カード研究','連結を設定し、3元素以上へ配分して勝利',(s)=>s.boss4Defeated&&!!s.cardLink?.a&&!!s.cardLink?.b&&Object.values(s.alchemy?.allocation||{}).filter(n=>Number(n)>0).length>=3));
 add(win('v27_dual_arcana','card',['v27_dual_arcana'],'二面：秘儀解読','アルカナを装備して4ターン以上の戦闘に勝利',(s,b)=>s.boss4Defeated&&!!s.arcana?.id&&b.turn>=4));
 add(win('v27_dual_rune','card',['v27_dual_rune'],'二面：刻印変化','ルーンを3種類以上設定して勝利',(s)=>s.boss4Defeated&&Object.keys(s.cardRunes||{}).length>=3));
 add(win('v27_dual_trait','card',['v27_dual_trait'],'二面：形質解析','特殊個体3種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&traits(b)>=3));
 add(win('v27_dual_link','card',['v27_dual_link'],'二面：連結主回路','連結コンボを2回以上成立させて勝利',(s,b)=>s.boss4Defeated&&b.linkComboCount>=2));
 add(win('v27_char_astral','mixed',['astral','astral_plain','astral_rune','astral_opus'],'アストラル起動','アルカナ装備＋ルーン2種類以上で勝利',(s)=>s.boss4Defeated&&!!s.arcana?.id&&Object.keys(s.cardRunes||{}).length>=2));
 add(win('v27_char_tracker','mixed',['tracker','tracker_trait','tracker_behavior','tracker_apex'],'トラッカー起動','特殊個体4種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&traits(b)>=4));
 for(let i=0;i<D.V27_RELIC_IDS.length;i+=4)add(win(`v27_relic_${i/4}`,'relic',D.V27_RELIC_IDS.slice(i,i+4),`横断遺物研究 ${i/4+1}`,i<4?'アルカナを装備して勝利':i<8?'特殊個体3種類以上の敵に勝利':i<12?'ルーン＋錬成を併用して勝利':'連結を設定して勝利',(s,b)=>s.boss4Defeated&&(i<4?!!s.arcana?.id:i<8?traits(b)>=3:i<12?Object.keys(s.cardRunes||{}).length>=1&&!!s.alchemy?.enabled:!!s.cardLink?.a&&!!s.cardLink?.b)));
 for(let i=0;i<D.V27_PROTOCOL_IDS.length;i+=2)add(win(`v27_protocol_${i/2}`,'protocol',D.V27_PROTOCOL_IDS.slice(i,i+2),`横断プロトコル研究 ${i/2+1}`,'第4ボス撃破後、2つ以上の拡張システムを併用して勝利',(s)=>s.boss4Defeated&&[!!s.arcana?.id,Object.keys(s.cardRunes||{}).length>0,!!s.cardLink?.a,!!s.alchemy?.enabled].filter(Boolean).length>=2));
 for(let i=0;i<D.V27_TUNING_IDS.length;i+=2)add(win(`v27_tuning_${i/2}`,'mixed',D.V27_TUNING_IDS.slice(i,i+2),`横断調律研究 ${i/2+1}`,'調律中カードを含み、2つ以上の拡張システムを併用して勝利',(s)=>s.boss4Defeated&&Object.keys(s.cardTunings||{}).length>0&&[!!s.arcana?.id,Object.keys(s.cardRunes||{}).length>0,!!s.cardLink?.a,!!s.alchemy?.enabled].filter(Boolean).length>=2));
 for(const id of D.V27_TRAIT_IDS){const cfg=D.V27_TRAIT_CONDITIONS[id],t=D.TRAITS[id];add({id:`v27_discover_${id}`,kind:'trait',reward:[id],title:`特殊個体：${t.name.replace(/個体$/,'')}`,condition:`${cfg.advanced?'第1ボス撃破後、':''}${cfg.label}に設定して実験開始`,check:s=>!!s.unlockedTraits?.[id],chapter:9});}
 for(const id of D.V27_BEHAVIOR_IDS){const b=D.ENEMY_BEHAVIORS[id],names=b.requires.map(x=>D.TRAITS[x]?.name||x);add({id:`v27_behavior_${id}`,kind:'behavior',reward:[id],title:`複合挙動：${b.name}`,condition:`${names.join('＋')}を同時適用して実験開始`,check:s=>!!s.unlockedBehaviors?.[id],chapter:9});}
})();
