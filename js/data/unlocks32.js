'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const add=u=>D.UNLOCKS.push(u),win=(id,reward,title,condition,when)=>({id,kind:'mixed',reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:12});
 const stockKinds=b=>Object.values(b?.alchemy?.stock||{}).filter(n=>Number(n||0)>0).length;
 const usedKinds=b=>Object.values(b?.alchemy?.used||{}).filter(n=>Number(n||0)>0).length;
 add(win('v32_branch_forge_unlock',['v32_branch_forge'],'分岐成長：鍛造','異なる錬成反応2種類以上＋連結コンボ3回以上で勝利',(s,b)=>s.boss4Defeated&&Object.values(b.alchemy?.reactions||{}).filter(Boolean).length>=2&&(b.linkComboCount||0)>=3));
 add(win('v32_branch_arcana_unlock',['v32_branch_arcana'],'分岐成長：秘儀','アルカナ装備中に4ターン目以降で勝利',(s,b)=>s.boss4Defeated&&!!s.arcana?.id&&b.turn>=4));
 add(win('v32_branch_reservoir_unlock',['v32_branch_reservoir'],'分岐成長：分配','錬成物を4種類以上在庫または4種類以上消費して勝利',(s,b)=>s.boss4Defeated&&(stockKinds(b)>=4||usedKinds(b)>=4)));
 add(win('v32_branch_adversity_unlock',['v32_branch_adversity'],'分岐成長：応力','戦闘中にHP35%以下を経験して勝利',(s,b)=>s.boss4Defeated&&b.player.hp<=b.player.maxHp*.35));
 add(win('v32_branch_memory_unlock',['v32_branch_memory'],'分岐成長：記録','同一ターン2枚以上捨てるか、連結コンボ3回以上で勝利',(s,b)=>s.boss4Defeated&&((b.discardedThisTurn||0)>=2||(b.linkComboCount||0)>=3)));
 add(win('v32_branch_tempo_unlock',['v32_branch_tempo'],'分岐成長：拍子','再構築2回以上または連結コンボ4回以上で勝利',(s,b)=>s.boss4Defeated&&((b.reshuffles||0)>=2||(b.linkComboCount||0)>=4)));
 add(win('v32_branch_support',[...D.V32_RELIC_IDS,...D.V32_PROTOCOL_IDS,...D.V32_TUNING_IDS],'分岐成長支援研究','分岐成長カードを3枚以上採用して勝利',(s)=>s.boss4Defeated&&s.deck.filter(id=>D.CARDS[id]?.tags?.includes('分岐成長')).length>=3));
})();
