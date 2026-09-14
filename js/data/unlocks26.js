'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.UNLOCKS=D.UNLOCKS||[];
 const win=(id,kind,reward,title,condition,when)=>({id,kind,reward,title,condition,event:'win',when,check:s=>!!s.claimedUnlocks?.[id],chapter:8});
 const countTag=(s,tag)=>s.deck.filter(id=>(D.CARDS[id]?.tags||[]).includes(tag)).length;
 const traits=b=>(b?.enemy?.traits||[]).filter(id=>D.TRAITS[id]).length;
 const add=(u)=>D.UNLOCKS.push(u);
 // 二面カード：システム＋8枚
 add(win('v26_dual_system','system',['dual_face','v26_dual_border'],'二面カード研究','第4ボス撃破後、防御タグ6枚以上で勝利',(s)=>s.boss4Defeated&&countTag(s,'防御')>=6));
 const dualGoals=[['v26_dual_crucible','状態異常タグ6枚以上',s=>countTag(s,'状態異常')>=6],['v26_dual_blood','自傷タグ5枚以上',s=>countTag(s,'自傷')>=5],['v26_dual_residue','捨て札タグ5枚以上',s=>countTag(s,'捨て札')>=5],['v26_dual_link','連結設定中',s=>!!s.cardLink?.a&&!!s.cardLink?.b],['v26_dual_cycle','循環タグ6枚以上',s=>countTag(s,'循環')>=6],['v26_dual_alchemy','錬成を有効化',s=>!!s.alchemy?.enabled],['v26_dual_terminal','長期戦向け構成：防御＋循環合計8枚以上',s=>countTag(s,'防御')+countTag(s,'循環')>=8]];
 dualGoals.forEach(([cid,cond,fn],i)=>add(win(`v26_dual_${i}`, 'card',[cid],`二面カード：${D.CARDS[cid].name}`,`第4ボス撃破後、${cond}で勝利`,(s)=>s.boss4Defeated&&fn(s))));
 // 元素カード：6目標×5枚
 const groups=[['fire','火','火配分4以上'],['wind','風','風配分4以上'],['water','水','水配分4以上'],['earth','土','土配分4以上'],['aether','エーテル','エーテル配分4以上']];
 for(const [key,label,cond] of groups){const ids=D.V26_CARD_IDS.filter(id=>id.startsWith(`v26_${key}_`));add(win(`v26_cards_${key}`,'card',ids,`${label}系列カード研究`,`${cond}で勝利`,(s,b)=>Number(b?.alchemy?.config?.allocation?.[key]||s.alchemy?.allocation?.[key]||0)>=4));}
 add(win('v26_cards_mixed','card',['v26_tri_reactor','v26_penta_reactor','v26_reaction_blade','v26_consumption_wall','v26_opus_vector'],'混成・錬成カード研究','3元素以上へ配分して勝利',(s,b)=>Object.values(b?.alchemy?.config?.allocation||s.alchemy?.allocation||{}).filter(n=>Number(n)>0).length>=3));
 // キャラ＋スタイル
 add(win('v26_char_salamander','mixed',['salamander','salamander_core','salamander_ash','salamander_spend'],'サラマンダー起動','火を最大配分にして錬成物を2種類以上消費して勝利',(s,b)=>s.boss4Defeated&&Number(b?.alchemy?.usedTypes||0)>=2));
 add(win('v26_char_naiad','mixed',['naiad','naiad_stock','naiad_cycle','naiad_frost'],'ナイアド起動','水を配分し、在庫3種類以上で勝利',(s,b)=>s.boss4Defeated&&Number(b?.alchemy?.stockTypes||0)>=3));
 add(win('v26_char_quint','mixed',['quint','quint_tri','quint_penta','quint_react'],'クイント起動','3元素以上へ配分して勝利',(s,b)=>s.boss4Defeated&&Object.values(b?.alchemy?.config?.allocation||s.alchemy?.allocation||{}).filter(n=>Number(n)>0).length>=3));
 // 遺物20を10目標で2個ずつ
 for(let i=0;i<D.V26_RELIC_IDS.length;i+=2){const rs=D.V26_RELIC_IDS.slice(i,i+2);add(win(`v26_relic_${i/2}`,'relic',rs,`元素遺物研究 ${i/2+1}`,i<10?'単元素を4以上配分して勝利':i<14?'3元素以上配分して勝利':'上位錬成物を生成して勝利',(s,b)=>s.boss4Defeated&&(i<10?Object.values(b?.alchemy?.config?.allocation||s.alchemy?.allocation||{}).some(n=>Number(n)>=4):i<14?Object.values(b?.alchemy?.config?.allocation||s.alchemy?.allocation||{}).filter(n=>Number(n)>0).length>=3:Number(b?.alchemy?.advancedTypes||0)>=1)));}
 // プロトコル12、調律10
 for(let i=0;i<D.V26_PROTOCOL_IDS.length;i+=4)add(win(`v26_protocol_${i/4}`,'protocol',D.V26_PROTOCOL_IDS.slice(i,i+4),`元素プロトコル研究 ${i/4+1}`,'第4ボス撃破後、元素・錬成ビルドで勝利',(s)=>s.boss4Defeated&&!!s.alchemy?.enabled));
 for(let i=0;i<D.V26_TUNING_IDS.length;i+=5)add(win(`v26_tuning_${i/5}`,'mixed',D.V26_TUNING_IDS.slice(i,i+5),`元素調律研究 ${i/5+1}`,'第4ボス撃破後、調律中カードを含む元素・錬成ビルドで勝利',(s)=>s.boss4Defeated&&Object.keys(s.cardTunings||{}).length>=1&&!!s.alchemy?.enabled));
 // 特殊個体発見10
 for(const id of D.V26_TRAIT_IDS){const cfg=D.V26_TRAIT_CONDITIONS[id],t=D.TRAITS[id];add({id:`v26_discover_${id}`,kind:'trait',reward:[id],title:`特殊個体：${t.name.replace(/個体$/,'')}`,condition:`${cfg.advanced?'第1ボス撃破後、':''}${cfg.label}に設定して実験開始`,check:s=>!!s.unlockedTraits?.[id],chapter:8});}
 // 複合挙動20
 for(const id of D.V26_BEHAVIOR_IDS){const b=D.ENEMY_BEHAVIORS[id],names=b.requires.map(x=>D.TRAITS[x]?.name||x);add({id:`v26_behavior_${id}`,kind:'behavior',reward:[id],title:`複合挙動：${b.name}`,condition:`${names.join('＋')}を同時適用して実験開始`,check:s=>!!s.unlockedBehaviors?.[id],chapter:8});}
 // 新規大アルカナ10枚
 const arcanaGoals=[
  ['arcana_fool','異なるカードを8種類以上含むデッキ',s=>new Set(s.deck).size>=8],
  ['arcana_priestess','状態異常タグ7枚以上',s=>countTag(s,'状態異常')>=7],
  ['arcana_empress','防御＋循環タグ合計8枚以上',s=>countTag(s,'防御')+countTag(s,'循環')>=8],
  ['arcana_emperor','単発攻撃タグまたは連撃タグを7枚以上',s=>countTag(s,'単発')+countTag(s,'連撃')>=7],
  ['arcana_hierophant','調律・役割変換・ルーンを合計3種類以上設定',s=>Object.keys(s.cardTunings||{}).length+Object.keys(s.cardConversions||{}).length+Object.keys(s.cardRunes||{}).length>=3],
  ['arcana_lovers','カード連結を設定して勝利',s=>!!s.cardLink?.a&&!!s.cardLink?.b],
  ['arcana_hanged','持ち越し系カードを含むデッキで勝利',s=>countTag(s,'持ち越し')>=1||countTag(s,'提示操作')>=3],
  ['arcana_death','捨て札＋循環タグ合計8枚以上',s=>countTag(s,'捨て札')+countTag(s,'循環')>=8],
  ['arcana_devil','自傷＋状態異常タグ合計8枚以上',s=>countTag(s,'自傷')+countTag(s,'状態異常')>=8],
  ['arcana_judgement','特殊個体3種類以上の敵に勝利',(s,b)=>traits(b)>=3]
 ];
 for(const [id,cond,fn] of arcanaGoals)add(win(`v26_${id}`,'arcana',[id],`アルカナ：${D.ARCANA[id].name}`,`第4ボス撃破後、${cond}で勝利`,(s,b)=>s.boss4Defeated&&fn(s,b)));
 // 72件へ合わせる補助攻略目標。報酬は既存の追加要素を束ねて再提示し、重複取得は安全。
 let serial=0;while(D.UNLOCKS.filter(u=>String(u.id).startsWith('v26_')).length<72){const rid=D.V26_RELIC_IDS[serial%D.V26_RELIC_IDS.length];add(win(`v26_mastery_${serial}`,'mixed',[rid],`元素熟達 ${serial+1}`,`第4ボス撃破後、特殊個体${2+(serial%3)}種類以上の敵に勝利`,(s,b)=>s.boss4Defeated&&traits(b)>=2+(serial%3)));serial++;}

 // 図鑑用：実際のアンロックデータから発見条件を取得。
 D.traitUnlockInfo=function(id){return D.UNLOCKS.find(u=>(u.reward||[]).includes(id))||null;};
 D.traitConditionText=function(id){return D.traitUnlockInfo(id)?.condition||'発見条件未登録';};
 D.arcanaUnlockInfo=function(id){return D.UNLOCKS.find(u=>(u.reward||[]).includes(id)&&u.kind==='arcana')||null;};
 D.arcanaConditionText=function(id){const a=D.ARCANA[id];if(!a?.requiresUnlock)return '第4ボス撃破時に解放';return D.arcanaUnlockInfo(id)?.condition||'解放条件未登録';};
})();
