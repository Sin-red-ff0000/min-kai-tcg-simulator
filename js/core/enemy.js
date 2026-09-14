'use strict';
(function(){
  const BL=window.BuildLab; const D=BL.Data;
  BL.Enemy={
    detectDiscoveries(state){
      const found=[];
      const checks=[
        ['giant',state.enemy.hp>=10],['berserk',state.enemy.atk>=8],['armored',state.enemy.def>=8],['fast',state.enemy.spd>=3],['crusher',state.enemy.atk>=9&&state.enemy.def>=6],['bloodrush',state.enemy.atk>=7&&state.enemy.spd>=3],['glassrush',state.enemy.atk>=7&&state.enemy.spd>=3.5&&state.enemy.def<=2],['bloodshell',state.enemy.hp>=9&&state.enemy.atk>=7],['titan',state.enemy.hp>=12&&state.enemy.def>=9]
      ];
      if(BL.Unlock.hasSystem(state,'advanced_enemy_parameters')){
        checks.push(
          ['regenerative',state.enemy.regen>=5],['purifier',state.enemy.resist>=50],['bloodflare',state.enemy.atk>=10&&state.enemy.regen>=6],['nullstep',state.enemy.spd>=4&&state.enemy.resist>=70],['eternal',state.enemy.hp>=8&&state.enemy.regen>=10],['hyperregen',state.enemy.regen>=8],['nullfield',state.enemy.resist>=70],['convergence',state.enemy.regen>=6&&state.enemy.resist>=60],
          ['overgrown',state.enemy.hp>=8&&state.enemy.regen>=5],['cleanse_rush',state.enemy.spd>=2.5&&state.enemy.resist>=50],['ironroot',state.enemy.def>=6&&state.enemy.regen>=5],['purgefang',state.enemy.atk>=6&&state.enemy.resist>=50],['redgrowth',state.enemy.atk>=6&&state.enemy.regen>=5],['allphase',state.enemy.hp>=6&&state.enemy.atk>=5&&state.enemy.def>=5&&state.enemy.spd>=2&&state.enemy.regen>=4&&state.enemy.resist>=40],
          ['bloomwall',state.enemy.def>=8&&state.enemy.regen>=6],['rotwall',state.enemy.def>=8&&state.enemy.regen>=5&&state.enemy.resist<=30],['fluxbeast',state.enemy.spd>=3&&state.enemy.regen>=5&&state.enemy.resist>=50],['regencarapace',state.enemy.hp>=7&&state.enemy.def>=7&&state.enemy.regen>=5],['mirrorfang',state.enemy.atk>=6&&state.enemy.spd>=2.5&&state.enemy.resist>=60],['nullgiant',state.enemy.hp>=8&&state.enemy.resist>=70],['rushbloom',state.enemy.spd>=3&&state.enemy.regen>=6],['apex',state.enemy.hp>=8&&state.enemy.atk>=7&&state.enemy.def>=7&&state.enemy.spd>=2.5&&state.enemy.regen>=6&&state.enemy.resist>=60]
        );
      }
      checks.forEach(([id,ok])=>{if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}});
      for(const [id,cfg] of Object.entries(D.V19_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      for(const [id,cfg] of Object.entries(D.V20_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      for(const [id,cfg] of Object.entries(D.V23_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      for(const [id,cfg] of Object.entries(D.V24_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      for(const [id,cfg] of Object.entries(D.V26_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      for(const [id,cfg] of Object.entries(D.V27_TRAIT_CONDITIONS||{})){
        if(cfg.advanced&&!BL.Unlock.hasSystem(state,'advanced_enemy_parameters'))continue;
        let ok=false;try{ok=!!cfg.check(state.enemy);}catch(_){ok=false;}
        if(ok&&!state.unlockedTraits[id]){state.unlockedTraits[id]=true;state.enemy.traits[id]=true;found.push(D.TRAITS[id].name);}
      }
      return found;
    },
    detectBehaviorDiscoveries(state){
      const found=[];state.unlockedBehaviors=state.unlockedBehaviors||{};
      for(const [id,b] of Object.entries(D.ENEMY_BEHAVIORS||{})){
        const ok=b.requires.every(t=>state.unlockedTraits?.[t]&&state.enemy.traits?.[t]);
        if(ok&&!state.unlockedBehaviors[id]){BL.Unlock.grant(state,id);found.push(b.name);}
      }
      return found;
    },
    effective(state,bossId=null){
      if(bossId===true)bossId='boss1';
      if(bossId==='boss1')return {name:'観測体',hp:160,maxHp:160,atk:12,def:2,spd:1,regen:0,resist:0,traits:['boss'],behaviors:[],boss:true,bossId:'boss1'};
      if(bossId==='boss2')return {name:'適応体',hp:150,maxHp:150,atk:9,def:1,spd:1,regen:1,resist:15,traits:['boss2'],behaviors:[],boss:true,bossId:'boss2'};
      if(bossId==='boss3')return {name:'構築体',hp:180,maxHp:180,atk:8,def:1,spd:1,regen:1,resist:15,traits:['boss3'],behaviors:[],boss:true,bossId:'boss3'};
      if(bossId==='boss4')return {name:'統合体',hp:175,maxHp:175,atk:8,def:1,spd:1,regen:1,resist:15,traits:['boss4'],behaviors:[],boss:true,bossId:'boss4'};
      let hp=42*state.enemy.hp,atk=8*state.enemy.atk,def=Math.max(0,2.5*(state.enemy.def-1)),spd=state.enemy.spd,regen=Number(state.enemy.regen||0),resist=Number(state.enemy.resist||0);
      const active=Object.entries(state.enemy.traits).filter(([id,v])=>v&&state.unlockedTraits[id]).map(([id])=>id);
      active.forEach(id=>{switch(id){
        case'giant':hp*=1.75;break;
        case'berserk':atk*=1.6;break;
        case'armored':def+=8;break;
        case'fast':spd+=.75;break;
        case'tyrant':hp*=1.4;atk*=1.4;break;
        case'mobile_fortress':def+=6;spd+=.5;break;
        case'swift_giant':hp*=1.25;spd+=.35;break;
        case'breaker':atk*=1.2;def+=4;break;
        case'bastion':hp*=1.2;def+=4;break;
        case'frenzy':atk*=1.2;spd+=.35;break;
        case'regenerative':regen+=3;break;
        case'purifier':resist+=20;break;
        case'immortal':hp*=1.25;regen+=4;break;
        case'sanctified':def+=4;resist+=20;break;
        case'adaptive':regen+=2;resist+=15;break;
        case'liferush':regen+=2;spd+=.35;break;
        case'hyperregen':hp*=1.1;regen+=5;break;
        case'nullfield':def+=3;resist+=15;break;
        case'convergence':regen+=3;resist+=10;spd+=.2;break;
        case'overgrown':hp*=1.15;regen+=2;break;
        case'cleanse_rush':spd+=.25;resist+=10;break;
        case'ironroot':def+=3;regen+=2;break;
        case'purgefang':atk*=1.15;resist+=10;break;
        case'redgrowth':atk*=1.10;regen+=2;break;
        case'allphase':hp*=1.10;atk*=1.10;def+=2;spd+=.2;regen+=1;resist+=5;break;
        case'bloomwall':def+=4;regen+=3;break;
        case'nullgiant':hp*=1.20;resist+=15;break;
        case'rushbloom':spd+=.35;regen+=3;break;
        case'apex':hp*=1.18;atk*=1.15;def+=3;spd+=.25;regen+=2;resist+=10;break;
        case'crusher':atk*=1.18;def+=3;break;
        case'bloodrush':atk*=1.15;spd+=.35;break;
        case'regencarapace':hp*=1.12;def+=3;regen+=2;break;
        case'mirrorfang':atk*=1.12;spd+=.20;resist+=10;break;
        case'glassrush':atk*=1.20;spd+=.45;def=Math.max(0,def-2);break;
        case'rotwall':def+=5;regen+=2;resist=Math.max(0,resist-10);break;
        case'bloodshell':hp*=1.20;atk*=1.15;break;
        case'fluxbeast':spd+=.30;regen+=2;resist+=8;break;
        case'titan':hp*=1.25;def+=4;break;
        case'bloodflare':atk*=1.20;regen+=3;break;
        case'nullstep':spd+=.40;resist+=10;break;
        case'eternal':hp*=1.15;regen+=4;break;
      }});
      for(const id of active){const r=D.V19_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      for(const id of active){const r=D.V20_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      for(const id of active){const r=D.V23_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      for(const id of active){const r=D.V24_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      for(const id of active){const r=D.V26_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      for(const id of active){const r=D.V27_TRAIT_RULES?.[id];if(!r)continue;if(r.hpMult)hp*=r.hpMult;if(r.atkMult)atk*=r.atkMult;if(r.defAdd)def+=r.defAdd;if(r.spdAdd)spd+=r.spdAdd;if(r.regenAdd)regen+=r.regenAdd;if(r.resistAdd)resist+=r.resistAdd;}
      def=Math.max(0,def);spd=Math.max(.1,spd);resist=Math.min(100,Math.max(0,resist));
      const behaviors=D.getActiveEnemyBehaviors?D.getActiveEnemyBehaviors(state):[];
      return {name:active.length?active.map(id=>D.TRAITS[id].short).join('＋')+'個体':'標準試験体',hp:Math.round(hp),maxHp:Math.round(hp),atk:Math.round(atk),def:Math.round(def),spd,regen:Math.round(regen),resist:Math.round(resist),traits:active,behaviors,boss:false,bossId:null};
    }
  };
})();
