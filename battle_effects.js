/* Ver46.3 battle presentation effects. Cosmetic only; no card/game state changes. */
(()=>{'use strict';
const styles=document.createElement('style');styles.textContent=`
.mk-battle-fx-controls{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:auto}
.mk-battle-fx-controls button{width:38px;height:36px;border:1px solid #70849b;border-radius:9px;background:#192a3e;color:#fff;cursor:pointer;font-size:21px;line-height:1}
.mk-battle-fx-controls button:disabled{opacity:.35;cursor:default}.online-player-section:not(.online-duel-opponent) .mk-battle-fx-controls button{opacity:1!important;pointer-events:auto!important}
.mk-battle-fx-controls button:active{transform:scale(.94)}
.mk-battle-fx-layer{position:absolute;inset:0;z-index:80;pointer-events:none;overflow:hidden;border-radius:9px}
.online-player-section{position:relative;isolation:isolate}
@media(max-width:600px){.mk-battle-fx-controls button{width:34px;height:34px}}
`;document.head.append(styles);
let active=new Map();const rand=(a,b)=>a+Math.random()*(b-a),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
function paint(slot,type){const host=document.querySelector('#online-duel-main');if(!host)return;const sections=host.querySelectorAll(':scope > .online-player-section');const target=sections[slot===2?0:1];if(!target)return;
const old=active.get(slot);if(old){cancelAnimationFrame(old.raf);old.layer.remove()}
const layer=document.createElement('div');layer.className='mk-battle-fx-layer';const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;display:block';layer.append(canvas);target.append(layer);const ctx=canvas.getContext('2d');if(!ctx)return;
let w=0,h=0,dpr=1;const rect=()=>{w=Math.max(1,target.clientWidth);h=Math.max(1,target.clientHeight);dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};rect();
const particles=Array.from({length:type==='damage'?125:220},(_,i)=>({a:rand(0,Math.PI*2),r:rand(35,Math.max(130,w*.65)),s:rand(1.5,5),delay:rand(0,.65),v:Math.random(),spin:rand(-10,10)}));
const shards=Array.from({length:100},(_,i)=>{const col=i%10,row=Math.floor(i/10);return{x:(col-4.5)*9,y:(row-4.5)*13,vx:rand(-190,190),vy:rand(-200,80),spin:rand(-9,9),sz:rand(5,15)}});
const glow=(x,y,r,color)=>{if(r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
const ring=(x,y,r,alpha,color)=>{ctx.globalAlpha=clamp(alpha);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,Math.max(1,r),Math.max(1,r*.4),0,0,Math.PI*2);ctx.stroke()};
const started=performance.now();const state={layer,raf:0};active.set(slot,state);
function frame(now){if(!layer.isConnected)return;const t=(now-started)/1000,duration=type==='damage'?2.8:3.5;if(t>duration){layer.remove();active.delete(slot);return}if(Math.abs(w-target.clientWidth)>2||Math.abs(h-target.clientHeight)>2)rect();ctx.clearRect(0,0,w,h);const x=w/2,y=h/2;ctx.save();ctx.globalCompositeOperation='screen';
if(type==='win'){const charge=ease(t/.75),release=ease((t-.55)/.85),fade=1-clamp((t-2.5)/1);glow(x,y,Math.max(1,w*.46*charge),`rgba(232,165,44,${.35*fade})`);glow(x,y,Math.max(1,70*charge),`rgba(255,246,198,${.9*fade})`);for(let i=0;i<22;i++){const a=i*Math.PI/11+t*.13,len=Math.max(1,(w*.38+30*Math.sin(i*3))*charge);ctx.save();ctx.translate(x,y);ctx.rotate(a);const g=ctx.createLinearGradient(0,0,len,0);g.addColorStop(0,`rgba(255,246,197,${.5*fade})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,-7);ctx.lineTo(len,7);ctx.fill();ctx.restore()}for(let i=0;i<4;i++)ring(x,y,(30+i*23)*charge+release*45,fade*(.8-i*.15),'#ffe3a0');for(const p of particles){const life=clamp((t-.35-p.delay)/2);if(!life)continue;ctx.globalAlpha=fade*(1-life);ctx.fillStyle=p.v>.6?'#fffce5':'#e9ad3e';ctx.fillRect(x+Math.cos(p.a)*p.r*ease(life),y+Math.sin(p.a)*p.r*.65*ease(life)-life*35,p.s,p.s)}}
else if(type==='lose'){const blast=ease((t-.25)/.75),fade=1-clamp((t-2.35)/1);glow(x,y,Math.max(1,w*.5*blast),`rgba(244,78,21,${.68*fade})`);glow(x,y,Math.max(1,75*blast),`rgba(255,241,160,${.95*fade})`);for(let i=0;i<16;i++){const a=i*Math.PI/8,len=(w*.3+30*Math.sin(i*7))*blast;ctx.save();ctx.translate(x,y);ctx.rotate(a);const g=ctx.createLinearGradient(0,0,Math.max(1,len),0);g.addColorStop(0,'#fff3bd');g.addColorStop(.3,'#ff8d25');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(len,0);ctx.lineTo(0,9);ctx.fill();ctx.restore()}for(let i=0;i<3;i++){const v=clamp((t-.3-i*.16)/.8);ring(x,y,ease(v)*w*.55,(1-v)*fade,'#ffb050')}for(const p of particles){const v=clamp((t-.3-p.delay*.4)/2);if(!v)continue;ctx.globalAlpha=fade*(1-v);ctx.fillStyle=p.v>.5?'#ffe38b':'#f45d22';ctx.fillRect(x+Math.cos(p.a)*p.r*ease(v),y+Math.sin(p.a)*p.r*.65*ease(v)+v*v*65,p.s*1.5,p.s*1.5)}}
else{const appear=ease(t/.35),crack=clamp((t-.42)/.32),broken=clamp((t-.85)/1.2),fade=1-clamp((t-2.15)/.65);glow(x,y,125*appear*(1-broken*.8),'rgba(76,218,251,.55)');if(t<.96){ctx.save();ctx.translate(x,y);ctx.scale(appear,appear);const g=ctx.createLinearGradient(-48,-65,48,65);g.addColorStop(0,'#d9ffffb9');g.addColorStop(.55,'#49c9ed85');g.addColorStop(1,'#a9f7ffae');ctx.fillStyle=g;ctx.strokeStyle='#e4ffff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-46,-64,92,128,5);ctx.fill();ctx.stroke();ctx.globalAlpha=crack;ctx.strokeStyle='#fff';for(let i=0;i<16;i++){const a=i*Math.PI/8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*25,Math.sin(a)*25);ctx.lineTo(Math.cos(a+.25)*58,Math.sin(a+.25)*60);ctx.stroke()}ctx.restore()}if(t>.8){for(const p of shards){const v=clamp((t-.8)/1.3);ctx.save();ctx.translate(x+p.x+p.vx*v,y+p.y+p.vy*v+v*v*110);ctx.rotate(p.spin*v);ctx.globalAlpha=fade*(1-v*.7);ctx.fillStyle='#9deeffaa';ctx.strokeStyle='#e5ffff';ctx.beginPath();ctx.moveTo(-p.sz,-p.sz);ctx.lineTo(p.sz*.8,-p.sz*.3);ctx.lineTo(p.sz*.2,p.sz);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}ring(x,y,ease(clamp((t-.8)/.75))*w*.43,(1-clamp((t-.8)/.75))*fade,'#a5f4ff')}}ctx.restore();state.raf=requestAnimationFrame(frame)}state.raf=requestAnimationFrame(frame)}
// Supabase Realtime: cosmetic events only. Room-scoped topic; no game state is transmitted.
const remoteFx={client:null,channel:null,key:'',ready:false,loading:null,seen:new Set()};
function fxRemoteRoom(){try{return typeof onlineUsingRemoteProvider==='function'&&onlineUsingRemoteProvider()&&onlineSessionState?.connection==='connected'&&onlineSessionState?.joinCode?String(onlineSessionState.joinCode):''}catch(_){return ''}}
async function fxLoadClient(){
 if(remoteFx.client)return remoteFx.client;
 if(!remoteFx.loading)remoteFx.loading=new Promise((resolve,reject)=>{
  if(window.supabase?.createClient){resolve(window.supabase);return}
  const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/dist/umd/supabase.min.js';el.async=true;
  el.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Supabase client unavailable'));
  el.onerror=()=>reject(new Error('Supabase client could not load'));document.head.appendChild(el);
 }).catch(e=>{remoteFx.loading=null;throw e});
 const lib=await remoteFx.loading;
 remoteFx.client=lib.createClient('https://kxwsrzpaewhnvirfgxpz.supabase.co','sb_publishable_P7uwfrXzWraD4zdt1V52YA_i8dDvVS_',{auth:{persistSession:false,autoRefreshToken:false},realtime:{params:{eventsPerSecond:10}}});
 return remoteFx.client;
}
async function fxEnsureChannel(){
 const code=fxRemoteRoom();const key=code?`minkai-battle-fx-v1:${code}`:'';
 if(remoteFx.key===key&&remoteFx.channel)return remoteFx.channel;
 if(remoteFx.channel){try{await remoteFx.client.removeChannel(remoteFx.channel)}catch(_){}remoteFx.channel=null}
 remoteFx.key=key;remoteFx.ready=false;if(!key)return null;
 try{const client=await fxLoadClient();if(remoteFx.key!==key)return null;
 const channel=client.channel(key,{config:{broadcast:{self:false,ack:true}}});remoteFx.channel=channel;
 channel.on('broadcast',{event:'presentation-fx'},({payload})=>{
  if(remoteFx.key!==key||!payload||payload.code!==code)return;
  if(payload.from===onlineSessionState.clientId||!['win','lose','damage'].includes(payload.kind)||![1,2].includes(Number(payload.slot)))return;
  if(typeof payload.eventId!=='string'||payload.eventId.length>100||remoteFx.seen.has(payload.eventId))return;
  remoteFx.seen.add(payload.eventId);if(remoteFx.seen.size>120)remoteFx.seen.clear();
  paint(Number(payload.slot),payload.kind);
 });channel.subscribe(status=>{remoteFx.ready=status==='SUBSCRIBED'});return channel;
 }catch(e){console.warn('Battle FX realtime connection failed',e);return null}
}
async function fxSendRemote(slot,kind){const channel=await fxEnsureChannel();if(!channel||!remoteFx.ready){console.warn('Battle FX realtime not connected');return}try{const result=await channel.send({type:'broadcast',event:'presentation-fx',payload:{code:fxRemoteRoom(),slot,kind,from:onlineSessionState.clientId,eventId:onlineSessionState.clientId+'-'+Date.now()+'-'+Math.random().toString(36).slice(2)}});if(result!=='ok')console.warn('Battle FX send',result)}catch(e){console.warn('Battle FX send failed',e)}}
setInterval(()=>{const key=fxRemoteRoom();if(key){if(remoteFx.key!==`minkai-battle-fx-v1:${key}`||!remoteFx.channel)fxEnsureChannel()}else if(remoteFx.channel)fxEnsureChannel()},1200);
function install(){
 const host=document.querySelector('#online-duel-main');if(!host)return;
 const ownSection=host.querySelector(':scope > .online-player-section:not(.online-duel-opponent)');
 const own=ownSection?([...host.querySelectorAll(':scope > .online-player-section')].indexOf(ownSection)===0?2:1):0;
 host.querySelectorAll(':scope > .online-player-section').forEach((section,index)=>{
  const slot=index===0?2:1;
  const toolbar=section.querySelector('.online-player-toolbar')||section;
  let bar=section.querySelector('.mk-battle-fx-controls');
  if(!bar){bar=document.createElement('div');bar.className='mk-battle-fx-controls';bar.setAttribute('data-fx-slot',String(slot));
   for(const [kind,symbol,title] of [['win','✦','勝利エフェクト'],['lose','✹','敗北エフェクト'],['damage','◇','ダメージエフェクト']]){
    const btn=document.createElement('button');btn.type='button';btn.textContent=symbol;btn.title=title;btn.setAttribute('aria-label',title);btn.dataset.battleFx=kind;
    bar.append(btn);
   }toolbar.append(bar);
  }
  bar.querySelectorAll('button').forEach(btn=>{btn.disabled=own!==slot;btn.style.pointerEvents=own===slot?'auto':'none'});
 });
}
// Event delegation survives board redraws and prevents stale listeners.
document.addEventListener('click',event=>{
 const btn=event.target.closest?.('button[data-battle-fx]');if(!btn)return;
 event.preventDefault();event.stopPropagation();
 const bar=btn.closest('[data-fx-slot]');const slot=Number(bar?.dataset.fxSlot),kind=btn.dataset.battleFx;
 if(btn.closest('.online-duel-opponent'))return;
 if(btn.disabled){btn.disabled=false;btn.style.pointerEvents='auto'}
 if(!['win','lose','damage'].includes(kind))return;
 paint(slot,kind);
 if(fxRemoteRoom())fxSendRemote(slot,kind);
 else try{onlineBroadcast('battle-presentation-fx',{slot,kind,eventId:Date.now()+'-'+Math.random()})}catch(e){console.warn('FX broadcast',e)}
},true);
let installing=false;
const observer=new MutationObserver(()=>{
 if(installing)return;
 if(!document.querySelector('#online-duel-main > .online-player-section'))return;
 installing=true;try{install()}finally{installing=false}
});
observer.observe(document.querySelector('#online-duel-main')||document.body,{childList:true,subtree:true});
if(typeof onlineHandleRoomMessage==='function'){
 const original=onlineHandleRoomMessage;
 onlineHandleRoomMessage=function(msg){
  if(msg?.type==='battle-presentation-fx'&&msg.code===onlineSessionState.joinCode&&msg.from!==onlineSessionState.clientId){
   const p=msg.payload;if([1,2].includes(Number(p?.slot))&&['win','lose','damage'].includes(p?.kind))paint(Number(p.slot),p.kind);return;
  }return original.apply(this,arguments)
 }
}
install();setInterval(install,350);
})();
