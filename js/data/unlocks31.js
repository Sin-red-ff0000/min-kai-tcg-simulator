'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const add=u=>D.UNLOCKS.push(u),win=(id,reward,title,condition,when)=>({id,kind:'mixed',reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:11});
 const stockKinds=b=>Object.values(b?.alchemy?.stock||{}).filter(n=>Number(n||0)>0).length;
 const usedKinds=b=>Object.values(b?.alchemy?.used||{}).filter(n=>Number(n||0)>0).length;
 add(win('v31_choice_cycle',['v31_stage_tempered'],'選択成長：靭性','山札を3回以上再構築して勝利',(s,b)=>s.boss4Defeated&&(b.reshuffles||0)>=3));
 add(win('v31_choice_alchemy',['v31_stage_reservoir'],'選択成長：調圧','錬成物を2種類以上在庫し、3種類以上消費して勝利',(s,b)=>s.boss4Defeated&&stockKinds(b)>=2&&usedKinds(b)>=3));
 add(win('v31_choice_link',['v31_stage_link_guard'],'選択成長：護線','連結コンボ4回以上で勝利',(s,b)=>s.boss4Defeated&&(b.linkComboCount||0)>=4));
 add(win('v31_choice_arcana',['v31_stage_arcana_balance'],'選択成長：均衡と反転','逆位置アルカナで4ターン目以降に勝利',(s,b)=>s.boss4Defeated&&s.arcana?.orientation==='reversed'&&b.turn>=4));
 add(win('v31_choice_history',['v31_stage_discard_memory'],'選択成長：備忘','同一戦闘で6枚以上を捨て札にして勝利',(s,b)=>s.boss4Defeated&&Object.keys(b.discardedEver||{}).length>=6));
 add(win('v31_choice_adversity',['v31_stage_adversity_guard'],'選択成長：背水','HP35%以下で勝利',(s,b)=>s.boss4Defeated&&b.player.hp<=b.player.maxHp*.35));
 add(win('v31_choice_support',[...D.V31_RELIC_IDS,...D.V31_PROTOCOL_IDS,...D.V31_TUNING_IDS],'選択成長支援研究','選択成長カードを3枚以上採用して勝利',(s)=>s.boss4Defeated&&s.deck.filter(id=>D.CARDS[id]?.tags?.includes('選択成長')).length>=3));
})();
