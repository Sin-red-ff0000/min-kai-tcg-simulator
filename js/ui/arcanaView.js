'use strict';
(function(){
  const BL=window.BuildLab,D=BL.Data; BL.UI=BL.UI||{};
  function renderArcana(){
    const s=BL.Store.state,area=document.getElementById('arcanaPool'),summary=document.getElementById('arcanaSelected');if(!area||!summary)return;
    const enabled=BL.Unlock.hasSystem(s,'arcana'),selected=s.arcana?.id,orientation=s.arcana?.orientation==='reversed'?'reversed':'upright';
    summary.textContent=selected?`${D.ARCANA[selected]?.name||selected} / ${orientation==='upright'?'正位置':'逆位置'}`:'なし';
    const search=document.getElementById('arcanaSearch'),stateFilter=document.getElementById('arcanaStateFilter');search.value=s.ui.arcanaSearch||'';stateFilter.value=s.ui.arcanaState||'unlocked';search.oninput=()=>{s.ui.arcanaSearch=search.value;BL.Store.save();renderArcana();};stateFilter.onchange=()=>{s.ui.arcanaState=stateFilter.value;BL.Store.save();renderArcana();};
    if(!enabled){area.innerHTML='<div class="hint-box">アルカナは第4ボス撃破で解放されます。</div>';document.getElementById('arcanaResultCount').textContent='未解放';return;}
    const q=(s.ui.arcanaSearch||'').trim().toLowerCase();const entries=Object.entries(D.ARCANA||{}).filter(([id,a])=>{const unlocked=!!s.unlockedArcana?.[id],sel=selected===id;if(q&&!`${a.name} ${a.tags.join(' ')} ${a.upright.desc} ${a.reversed.desc}`.toLowerCase().includes(q))return false;if(s.ui.arcanaState==='unlocked'&&!unlocked)return false;if(s.ui.arcanaState==='locked'&&unlocked)return false;if(s.ui.arcanaState==='selected'&&!sel)return false;return true;}).sort((a,b)=>(a[1].number??999)-(b[1].number??999)||a[1].name.localeCompare(b[1].name,'ja'));
    document.getElementById('arcanaResultCount').textContent=`${entries.length}件 / 全${Object.keys(D.ARCANA||{}).length}種`;area.innerHTML='';
    entries.forEach(([id,a])=>{const unlocked=!!s.unlockedArcana?.[id],sel=selected===id,el=document.createElement('div');el.className='relic-card arcana-card'+(sel?' selected':'')+(!unlocked?' locked':'');el.innerHTML=`<div class="title">${String(a.number??'').padStart(2,'0')} ${a.name}</div><div class="tags">${a.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="arcana-side ${sel&&orientation==='upright'?'active':''}"><strong>正位置</strong><span>${a.upright.desc}</span></div><div class="arcana-side ${sel&&orientation==='reversed'?'active':''}"><strong>逆位置</strong><span>${a.reversed.desc}</span></div><div class="condition">解放条件：${D.arcanaConditionText?D.arcanaConditionText(id):(unlocked?'解放済み':'アンロックタブで確認')}</div><div class="arcana-actions"><button data-side="upright" ${!unlocked?'disabled':''}>正位置で装備</button><button data-side="reversed" ${!unlocked?'disabled':''}>逆位置で装備</button></div>`;el.querySelectorAll('[data-side]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();if(!unlocked)return BL.UI.toast('このアルカナはまだ未解放です');s.arcana={id,orientation:btn.dataset.side};BL.Store.save();BL.UI.renderAll();});area.appendChild(el);});
  }
  BL.UI.renderArcana=renderArcana;
})();
