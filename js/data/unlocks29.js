'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const add=u=>D.UNLOCKS.push(u),win=(id,kind,reward,title,condition,when)=>({id,kind,reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:9});
 const traits=b=>(b?.enemy?.traits||[]).filter(id=>D.TRAITS[id]).length,beh=b=>b?.enemy?.behaviors?.length||0;
 add(win('v29_adaptive_traits','card',D.V29_ADAPTIVE_CARD_IDS.slice(0,4),'形質解析カード研究','特殊個体3種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&traits(b)>=3));
 add(win('v29_adaptive_behaviors','card',D.V29_ADAPTIVE_CARD_IDS.slice(4),'挙動解析カード研究','複合挙動2種類以上の敵に勝利',(s,b)=>s.boss4Defeated&&beh(b)>=2));
 add(win('v29_dual_pressure','card',['v29_dual_pressure'],'二面：反圧殻','戦闘中に防御20以上を保持して勝利',(s,b)=>s.boss4Defeated&&(b.player?.block||0)>=20));
 add(win('v29_dual_residue','card',['v29_dual_residue'],'二面：記録片','同一戦闘でカードを6枚以上捨てて勝利',(s,b)=>s.boss4Defeated&&Object.keys(b.discardedEver||{}).length>=6));
 add(win('v29_dual_reactor','card',['v29_dual_reactor'],'二面：臨界炉','異なる反応を3種類以上発生させて勝利',(s,b)=>s.boss4Defeated&&Object.values(b.alchemy?.reactions||{}).filter(n=>Number(n||0)>0).length>=3));
 add(win('v29_dual_adversity','card',['v29_dual_adversity'],'二面：逆境写本','逆位置アルカナ装備中、HP半分以下で勝利',(s,b)=>s.boss4Defeated&&s.arcana?.orientation==='reversed'&&b.player.hp<=b.player.maxHp/2));
 add(win('v29_support','mixed',[...D.V29_RELIC_IDS,...D.V29_PROTOCOL_IDS],'解析支援研究','解析タグ4枚以上を採用し、特殊個体か複合挙動を持つ敵に勝利',(s,b)=>s.boss4Defeated&&s.deck.filter(id=>(D.CARDS[id]?.tags||[]).includes('解析')).length>=4&&(traits(b)>=1||beh(b)>=1)));
 add(win('v29_tunings','mixed',D.V29_TUNING_IDS,'解析調律研究','解析タグカードに調律を設定して勝利',(s)=>s.boss4Defeated&&Object.entries(s.cardTunings||{}).some(([id,v])=>v&&(D.CARDS[id]?.tags||[]).includes('解析'))));
})();
