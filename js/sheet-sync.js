/* sheet-sync.js - LoanMan <-> Google Sheet (LOCAL-FIRST + MERGE)
   ทุกแถวมี u (เวลาแก้ล่าสุด) · ลบ = tombstone ใน DB.deleted · push/pull = รวมกันรายแถว (ใหม่กว่าชนะ)
   -> แก้คนละเครื่องได้ ไม่ทับกันทั้งก้อน · ดึงใหม่ทุก 60 วิ และตอนกลับมาที่หน้าต่าง */
(function(){
  var cfg=window.LM_SHEET_CFG;if(!cfg||!/^https:/.test(cfg.endpoint||'')){try{cfg=JSON.parse(LS.getItem('lm_sheet_cfg')||'null');}catch(e){cfg=null;}if(cfg)window.LM_SHEET_CFG=cfg;}
  if(!cfg||!/^https:/.test(cfg.endpoint||'')){window.LM_SYNC_ON=false;
    if(/^https?:$/.test(location.protocol)){var _p=function(){var a=document.createElement('a');a.href='login.html';a.textContent='🔐 Login sync';a.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;background:#2a64b8;color:#fff;padding:8px 14px;border-radius:20px;font-size:13px;text-decoration:none;box-shadow:0 2px 8px #0003';document.body.appendChild(a);};if(document.body)_p();else window.addEventListener('DOMContentLoaded',_p);}
    return;}
  window.LM_SYNC_ON=true;
  var TBL=['people','debtors','txns','banks','methods'],DIRTY='loanman_dirty',timer=null,busy=false,again=false;
  function paused(){return LS.getItem('loanman_sync_off')==='1';}
  function badge(t,c){var b=document.getElementById('syncBadge');if(!b){b=document.createElement('div');b.id='syncBadge';b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;background:#1f3b63;padding:6px 12px;border-radius:16px;font-size:12px;box-shadow:0 2px 8px #0003;transition:opacity .4s';(document.body||document.documentElement).appendChild(b);}clearTimeout(b._h);b.style.opacity='1';b.textContent=t;b.style.color=c||'#cfe0ff';if(/^☁/.test(t))b._h=setTimeout(function(){b.style.opacity='.55'},4000);}
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)});}
  async function fetchJson(url,opt){var w=[0,2500,6000],last;for(var i=0;i<w.length;i++){if(w[i]){badge('⏳ กำลังปลุก Google…');await sleep(w[i]);}try{var r=await fetch(url,opt);return JSON.parse(await r.text());}catch(e){last=e;}}throw last||new Error('fetch failed');}
  function real(d){return d&&Array.isArray(d.debtors)&&d.debtors.length>0;}
  /* ---- stamp: แถวไหนเปลี่ยนตั้งแต่ครั้งก่อน -> u=now · แถวที่หาย -> tombstone ---- */
  function key(t,id){return t+':'+id;}
  function snap(){var m={};TBL.forEach(function(t){(DB[t]||[]).forEach(function(r){var c=Object.assign({},r);delete c.u;m[key(t,r.id)]=JSON.stringify(c);});});return m;}
  var SN=snap();
  function stamp(){var now=Date.now(),m=snap(),n=0;DB.deleted=DB.deleted||[];
    Object.keys(m).forEach(function(k){if(SN[k]!==m[k]){var i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1),r=(DB[t]||[]).find(function(x){return x.id===id});if(r){r.u=now;n++;}}});
    Object.keys(SN).forEach(function(k){if(!(k in m)){DB.deleted.push({k:k,u:now});n++;}});SN=snap();return n;}
  function merge(a,b){var o={};TBL.forEach(function(t){var m={};(a[t]||[]).forEach(function(r){m[r.id]=r});(b[t]||[]).forEach(function(r){var x=m[r.id];if(!x||(r.u||0)>(x.u||0))m[r.id]=r;});o[t]=Object.keys(m).map(function(k){return m[k]});});
    var del={};(a.deleted||[]).concat(b.deleted||[]).forEach(function(d){if(d&&d.k&&(!del[d.k]||d.u>del[d.k]))del[d.k]=d.u;});
    Object.keys(del).forEach(function(k){var i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1);if(o[t])o[t]=o[t].filter(function(r){return !(r.id===id&&(r.u||0)<=del[k])});});
    o.deleted=Object.keys(del).map(function(k){return {k:k,u:del[k]}});return o;}
  function sig(d){return JSON.stringify(TBL.map(function(t){return (d[t]||[]).map(function(r){return r.id+'@'+(r.u||0)}).sort()}))+(d.deleted||[]).length;}
  function adopt(m){var before=sig(DB);TBL.concat(['deleted']).forEach(function(t){DB[t]=m[t];});_save();SN=snap();
    if(sig(DB)!==before){if(typeof migrate==='function')migrate();if(typeof safeRender==='function')safeRender();return true;}return false;}
  async function getSheet(){var r=await fetchJson(cfg.endpoint+'?token='+encodeURIComponent(cfg.readToken)+'&t='+Date.now());if(!r||!r.ok)throw new Error(r&&r.error||'pull failed');return r.data||{};}
  async function pubItems(){if(typeof lmEnc!=='function'||typeof pubPayload!=='function'||!window.crypto||!crypto.subtle)return null;var out=[],ps=(DB.people||[]).filter(function(p){return p.pin});for(var i=0;i<ps.length;i++)out.push(await lmEnc(ps[i].pin,pubPayload(ps[i])));return out.sort(function(){return Math.random()-.5});}
  async function push(force){
    if(paused()&&!force)return;if(busy){again=true;return;}busy=true;badge('↑ syncing…');
    try{var sv=await getSheet(),m=merge(sv,DB);adopt(m);
      if(!real(DB)){badge('⚠ ข้อมูลว่าง ไม่ push','#ffb4a8');busy=false;return;}
      var pub=await pubItems(),body={token:cfg.writeToken,mod:Date.now(),data:{deleted:DB.deleted||[]},pub:pub};TBL.forEach(function(t){body.data[t]=DB[t]||[];});
      var res=await fetchJson(cfg.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
      if(!res||!res.ok)throw new Error(res&&res.error||'push failed');
      LS.removeItem(DIRTY);badge('☁ synced '+new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'#9fe3b4');
    }catch(e){badge('⚠ offline: '+String(e.message||e).slice(0,50),'#ffb4a8');console.warn('LoanMan push',e);}
    busy=false;if(again){again=false;push();}}
  async function pull(){if(paused()){badge('⏸ sync หยุดอยู่ (local)');return;}if(busy)return;
    try{var sv=await getSheet();if(!real(sv)&&real(DB)){push();return;}
      var ch=adopt(merge(DB,sv));if(LS.getItem(DIRTY)==='1')push();else badge(ch?'☁ อัปเดตจาก Sheet แล้ว':'☁ synced','#9fe3b4');
    }catch(e){badge('⚠ offline: '+String(e.message||e).slice(0,50),'#ffb4a8');}}
  var _save=window.save;
  window.save=function(){var n=stamp();_save();if(!n)return;LS.setItem(DIRTY,'1');if(paused()){badge('⏸ sync หยุดอยู่ (local)');return;}badge('✎ รอ sync…','#ffd98a');clearTimeout(timer);timer=setTimeout(push,1500);};
  window.lmSyncPush=function(){push(true);};
  window.lmSyncSet=function(off){if(off)LS.setItem('loanman_sync_off','1');else{LS.removeItem('loanman_sync_off');push(true);}badge(off?'⏸ sync หยุดอยู่ (local)':'▶ sync');};
  window.lmConnCode=function(){return btoa(unescape(encodeURIComponent(JSON.stringify({endpoint:cfg.endpoint,writeToken:cfg.writeToken,readToken:cfg.readToken}))));};
  window.lmLogout=function(){LS.removeItem('lm_sheet_cfg');location.reload();};
  window.addEventListener('beforeunload',function(e){if(LS.getItem(DIRTY)==='1'&&!paused()){e.preventDefault();e.returnValue='';}});
  window.addEventListener('focus',function(){pull();});setInterval(function(){if(!document.hidden)pull();},60000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pull);else setTimeout(pull,0);
})();
