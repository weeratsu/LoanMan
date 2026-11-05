/* sheet-sync.js - LoanMan <-> Google Sheet (LOCAL-FIRST)
   - save() ทุกครั้ง -> push ทั้ง DB + ข้อมูล public (เข้ารหัสด้วย PIN) ขึ้น Sheet แบบ background (debounce 1.5s)
   - เปิดหน้า -> แสดง localStorage ทันที แล้ว pull Sheet; ถ้า Sheet ใหม่กว่า และไม่มี edit ค้าง -> ใช้ของ Sheet
   - ไม่มี config / endpoint ว่าง = ไม่ทำอะไร · Setup มีปุ่มหยุด sync / push ตอนนี้ */
(function(){
  var cfg=window.LM_SHEET_CFG; if(!cfg||!/^https:/.test(cfg.endpoint||'')){try{cfg=JSON.parse(LS.getItem('lm_sheet_cfg')||'null');}catch(e){cfg=null;}if(cfg)window.LM_SHEET_CFG=cfg;}
  if(!cfg||!/^https:/.test(cfg.endpoint||'')){window.LM_SYNC_ON=false;
    if(/^https?:$/.test(location.protocol)){var _p=function(){var a=document.createElement('a');a.href='login.html';a.textContent='🔐 Login sync';a.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;background:#2a64b8;color:#fff;padding:8px 14px;border-radius:20px;font-size:13px;text-decoration:none;box-shadow:0 2px 8px #0003';document.body.appendChild(a);};if(document.body)_p();else window.addEventListener('DOMContentLoaded',_p);}
    return;}
  window.LM_SYNC_ON=true;
  var DIRTY='loanman_dirty',MOD='loanman_mod',timer=null,busy=false,again=false;
  function paused(){return LS.getItem('loanman_sync_off')==='1';}
  function badge(t,c){var b=document.getElementById('syncBadge');if(!b){b=document.createElement('span');b.id='syncBadge';b.style.cssText='font-size:12px;margin-left:10px;opacity:.9';var h=document.querySelector('header');if(h)h.appendChild(b);}b.textContent=t;b.style.color=c||'#cfe0ff';}
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)});}
  async function fetchJson(url,opt){var w=[0,2500,6000],last;for(var i=0;i<w.length;i++){if(w[i]){badge('⏳ กำลังปลุก Google…');await sleep(w[i]);}
    try{var r=await fetch(url,opt),t=await r.text();return JSON.parse(t);}catch(e){last=e;}}throw last||new Error('fetch failed');}
  function real(d){return d&&Array.isArray(d.debtors)&&d.debtors.length>0;}
  async function pubItems(){var out=[];if(typeof lmEnc!=='function'||typeof pubPayload!=='function'||!window.crypto||!crypto.subtle)return null;
    var ps=(DB.people||[]).filter(function(p){return p.pin});for(var i=0;i<ps.length;i++)out.push(await lmEnc(ps[i].pin,pubPayload(ps[i])));
    return out.sort(function(){return Math.random()-.5});}
  async function push(force){
    if(paused()&&!force)return;if(!real(DB)){badge('⚠ ข้อมูลว่าง ไม่ push','#ffb4a8');return;}
    if(busy){again=true;return;}busy=true;badge('↑ syncing…');
    try{var mod=+LS.getItem(MOD)||Date.now(),pub=await pubItems();
      var res=await fetchJson(cfg.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token:cfg.writeToken,mod:mod,data:{people:DB.people,debtors:DB.debtors,txns:DB.txns,banks:DB.banks||[],methods:DB.methods||[]},pub:pub})});
      if(!res||!res.ok)throw new Error(res&&res.error||'push failed');
      LS.removeItem(DIRTY);badge('☁ synced '+new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'#9fe3b4');
    }catch(e){badge('⚠ offline: '+String(e.message||e).slice(0,50),'#ffb4a8');console.warn('LoanMan push',e);}
    busy=false;if(again){again=false;push();}}
  var _save=window.save;
  window.save=function(){LS.setItem(MOD,String(Date.now()));LS.setItem(DIRTY,'1');_save();if(paused()){badge('⏸ sync หยุดอยู่ (local)');return;}clearTimeout(timer);timer=setTimeout(push,1500);};
  window.lmSyncPush=function(){push(true);};
  window.lmConnCode=function(){return btoa(unescape(encodeURIComponent(JSON.stringify({endpoint:cfg.endpoint,writeToken:cfg.writeToken,readToken:cfg.readToken}))));};
  window.lmLogout=function(){LS.removeItem('lm_sheet_cfg');location.reload();};
  window.lmSyncSet=function(off){if(off)LS.setItem('loanman_sync_off','1');else{LS.removeItem('loanman_sync_off');push(true);}badge(off?'⏸ sync หยุดอยู่ (local)':'▶ sync');};
  async function pull(){if(paused()){badge('⏸ sync หยุดอยู่ (local)');return;}badge('↓ checking Sheet…');
    try{var res=await fetchJson(cfg.endpoint+'?token='+encodeURIComponent(cfg.readToken)+'&t='+Date.now());
      if(!res||!res.ok)throw new Error(res&&res.error||'pull failed');
      var lm=+LS.getItem(MOD)||0,dirty=LS.getItem(DIRTY)==='1',fresh=!real(DB);
      if(real(res.data)&&(fresh||(!dirty&&+res.mod>lm))){Object.assign(DB,res.data);LS.setItem('loanman',JSON.stringify(DB));LS.setItem(MOD,String(res.mod));if(typeof migrate==='function')migrate();if(typeof safeRender==='function')safeRender();badge('☁ โหลดจาก Sheet แล้ว','#9fe3b4');}
      else if(dirty||(real(DB)&&!real(res.data))){push();}
      else badge('☁ synced','#9fe3b4');
    }catch(e){badge('⚠ offline: '+String(e.message||e).slice(0,50),'#ffb4a8');}}
  window.addEventListener('beforeunload',function(e){if(LS.getItem(DIRTY)==='1'&&!paused()){e.preventDefault();e.returnValue='';}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pull);else setTimeout(pull,0);
})();
