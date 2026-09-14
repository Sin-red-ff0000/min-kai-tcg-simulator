'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const add=u=>D.UNLOCKS.push(u),win=(id,kind,reward,title,condition,when)=>({id,kind,reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:10});
 const reactionKinds=b=>Object.values(b?.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length;
 add(win('v30_composite_traits','card',D.V30_COMPOSITE_CARD_IDS.slice(0,3),'交差解析研究I','特殊個体4種類以上または複合挙動3種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&((b.enemy?.traits||[]).length>=4||(b.enemy?.behaviors||[]).length>=3)));
 add(win('v30_composite_advanced','card',D.V30_COMPOSITE_CARD_IDS.slice(3),'交差解析研究II','特殊個体3種類以上＋複合挙動2種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&(b.enemy?.traits||[]).length>=3&&(b.enemy?.behaviors||[]).length>=2));
 add(win('v30_stage_alchemy','card',['v30_stage_forge'],'三段階：星炉','異なる錬成反応を4種類以上起こして勝利',(s,b)=>s.boss4Defeated&&reactionKinds(b)>=4));
 add(win('v30_stage_archive','card',['v30_stage_archive'],'三段階：完成記録','同一戦闘で8枚以上を捨て札にして勝利',(s,b)=>s.boss4Defeated&&Object.keys(b.discardedEver||{}).length>=8));
 add(win('v30_stage_link','card',['v30_stage_link'],'三段階：環状回路','連結コンボを3回以上成立させて勝利',(s,b)=>s.boss4Defeated&&(b.linkComboCount||0)>=3));
 add(win('v30_stage_arcana','card',['v30_stage_arcana'],'三段階：大秘儀片','アルカナ装備中、4ターン目以降に勝利',(s,b)=>s.boss4Defeated&&!!s.arcana?.id&&b.turn>=4));
 add(win('v30_stage_cycle','card',['v30_stage_reshuffle','v30_stage_adversity'],'三段階：循環と逆境','山札を2回再構築、またはHP40%以下で勝利',(s,b)=>s.boss4Defeated&&((b.reshuffles||0)>=2||b.player.hp<=b.player.maxHp*.40)));
 add(win('v30_support','mixed',[...D.V30_RELIC_IDS,...D.V30_PROTOCOL_IDS,...D.V30_TUNING_IDS],'成長・交差支援研究','三段階または複合解析タグのカードを4枚以上採用して勝利',(s)=>s.boss4Defeated&&s.deck.filter(id=>{const t=D.CARDS[id]?.tags||[];return t.includes('三段階')||t.includes('複合解析');}).length>=4));
})();
