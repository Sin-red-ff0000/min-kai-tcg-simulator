'use strict';
(function(){
 const BL=window.BuildLab,D=BL.Data;D.SYSTEMS=D.SYSTEMS||{};
 D.SYSTEMS.arcana={name:'アルカナ',desc:'ビルド全体へ1枚だけ適用する強化。正位置・逆位置は強弱ではなく、異なる構築方針を選ぶ。'};
 const A=(number,id,name,tags,uDesc,uWhen,uMult,rDesc,rWhen,rMult,locked=false)=>({id,number,name,tags,upright:{name:'正位置',desc:uDesc,when:uWhen,mult:uMult},reversed:{name:'逆位置',desc:rDesc,when:rWhen,mult:rMult},requiresUnlock:locked});
 D.ARCANA={
  arcana_fool:A(0,'arcana_fool','愚者',['変化','反復'],'前回と異なるカードなら+27%。',{differentFromLast:true},1.27,'前回と同じカードなら+31%。',{sameAsLast:true},1.31,true),
  arcana_magician:A(1,'arcana_magician','魔術師',['調律','役割変換'],'調律または役割変換されたカード+22%。',{tunedOrConverted:true},1.22,'調律・役割変換・ルーンがないカード+20%。',{plainCard:true},1.20),
  arcana_priestess:A(2,'arcana_priestess','女教皇',['状態異常','観測'],'状態異常タグのカード+26%。',{tag:'状態異常'},1.26,'敵に状態異常が無い時、単発攻撃+30%。',{statusMax:0,attackish:true,hitsMax:1},1.30,true),
  arcana_empress:A(3,'arcana_empress','女帝',['防御','循環'],'防御・複合カード+23%。',{blockish:true},1.23,'山札再構築直後のカード+32%。',{recentReshuffle:true},1.32,true),
  arcana_emperor:A(4,'arcana_emperor','皇帝',['単発','連撃'],'1ヒット攻撃+31%。',{hitsMax:1,attackish:true},1.31,'3ヒット以上のカード+25%。',{hitsMin:3},1.25,true),
  arcana_hierophant:A(5,'arcana_hierophant','教皇',['素体','強化'],'強化層のないカード+24%。',{plainCard:true},1.24,'調律・変換・ルーンのうち2層以上+34%。',{augmentationMin:2},1.34,true),
  arcana_lovers:A(6,'arcana_lovers','恋人',['連結','非連結'],'連結ペアに含まれるカード+28%。',{pairCard:true},1.28,'連結ペア外のカード+23%。',{notPairCard:true},1.23,true),
  arcana_chariot:A(7,'arcana_chariot','戦車',['連撃','単発'],'3ヒット以上のカード+24%。',{hitsMin:3},1.24,'1ヒット以下の攻撃カード+30%。',{hitsMax:1,attackish:true},1.30),
  arcana_strength:A(8,'arcana_strength','力',['耐久','自傷'],'防御・複合カード+24%。',{blockish:true},1.24,'自傷カードまたはHP50%以下で+30%。',{selfDamageOrLowHp:true},1.30),
  arcana_hermit:A(9,'arcana_hermit','隠者',['単独','重複'],'デッキに同名1枚だけのカード+28%。',{copiesMax:1},1.28,'デッキに同名2枚以上あるカード+28%。',{copiesMin:2},1.28,true),
  arcana_wheel:A(10,'arcana_wheel','運命の輪',['循環','捨て札'],'山札再構築直後の最初のカード+32%。',{recentReshuffle:true},1.32,'一度でも捨てられたカード実体+28%。',{discarded:true},1.28),
  arcana_justice:A(11,'arcana_justice','正義',['反撃','攻撃'],'反撃を持つカード+32%。',{counterish:true},1.32,'攻撃カード+18%。',{attackish:true},1.18),
  arcana_hanged:A(12,'arcana_hanged','吊された男',['持ち越し','即応'],'持ち越したカード+34%。',{reserved:true},1.34,'持ち越していないカード+20%。',{notReserved:true},1.20,true),
  arcana_death:A(13,'arcana_death','死神',['捨て札','循環'],'捨てられたことのあるカード+31%。',{discarded:true},1.31,'再構築直後の未捨て札カード+30%。',{recentReshuffle:true,notDiscarded:true},1.30,true),
  arcana_temperance:A(14,'arcana_temperance','節制',['混成','単独'],'2タグ以上のカード+22%。',{minTags:2},1.22,'1タグだけのカード+28%。',{maxTags:1},1.28),
  arcana_devil:A(15,'arcana_devil','悪魔',['自傷','状態異常'],'自傷カード+36%。',{selfDamage:true},1.36,'敵に状態異常2種類以上なら全カード+23%。',{statusMin:2},1.23,true),
  arcana_tower:A(16,'arcana_tower','塔',['複合挙動','特殊個体'],'複合挙動がある敵へ+30%。',{enemyBehaviorsMin:1},1.30,'特殊個体特性3種類以上の敵へ+30%。',{enemyTraitsMin:3},1.30,true),
  arcana_star:A(17,'arcana_star','星',['状態異常'],'状態異常タグのカード+25%。',{tag:'状態異常'},1.25,'敵に2種類以上の状態異常がある時、全カード+20%。',{statusMin:2},1.20,true),
  arcana_moon:A(18,'arcana_moon','月',['提示操作'],'前ターンと異なる位置から使うと+28%。',{positionChanged:true},1.28,'前ターンと同じ位置から使うと+24%。',{positionSame:true},1.24,true),
  arcana_sun:A(19,'arcana_sun','太陽',['安定','瀕死'],'HP50%より上なら+20%。',{highHp:true},1.20,'HP50%以下なら+34%。',{lowHp:true},1.34,true),
  arcana_judgement:A(20,'arcana_judgement','審判',['ボス','特殊個体'],'ボス戦で+28%。',{enemyIsBoss:true},1.28,'特殊個体2種類以上の敵へ+31%。',{enemyTraitsMin:2},1.31,true),
  arcana_world:A(21,'arcana_world','世界',['連結'],'連結コンボ成立時+30%。',{linkActive:true},1.30,'連結ペアに含まれないカード+20%。',{notPairCard:true},1.20,true)
 };
})();
