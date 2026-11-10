/* แชร์เงิน (Splitwise): DB.shares=[{id,date,title,amt,payer,mode:'eq'|'cu',split:{pid:amt},settle?}] · ME = ตัวเรา */
var ME={id:'me',name:'ฉัน'};
function shPeople(){ME.name=(DB.meName||'').trim()||'ฉัน';return [ME].concat(DB.people||[]);}
function shName(id){var p=shPeople().find(function(x){return x.id===id});return p?p.name:id;}
function r2(x){return Math.round(x*100)/100;}
function shSel(v){$('sPayer').innerHTML=opts(shPeople().map(function(p){return [p.id,p.name]}),v||'me');}
function shParts(){var box=$('sParts'),v=box._v||{};
  box.innerHTML=shPeople().map(function(p){var on=p.id in v;return '<label class="shp"><input type="checkbox" data-id="'+p.id+'"'+(on?' checked':'')+' onchange="shCalc()"> '+p.name+'<input type="number" step="0.01" data-amt="'+p.id+'" value="'+(on&&v[p.id]!==''?v[p.id]:'')+'" oninput="shCalc()" placeholder="0"></label>'}).join('');shCalc();}
function shCalc(){var box=$('sParts');if(!box||!$('sMode'))return;var amt=+$('sAmt').value||0,eq=$('sMode').value==='eq';
  var cbs=[].slice.call(box.querySelectorAll('input[data-id]')),on=cbs.filter(function(c){return c.checked}),per=on.length?r2(amt/on.length):0,sum=0;
  cbs.forEach(function(c){var a=box.querySelector('input[data-amt="'+c.dataset.id+'"]');a.disabled=!c.checked||eq;if(!c.checked){a.value='';return;}if(eq)a.value=per;});
  
  on.forEach(function(c){sum+=+box.querySelector('input[data-amt="'+c.dataset.id+'"]').value||0;});
  var rem=r2(amt-sum);$('sSum').innerHTML='แชร์ '+on.length+' คน · รวม '+f(sum)+(!eq&&Math.abs(rem)>0.005?' · <b class="pos">ยังขาด/เกิน '+f(rem)+'</b>':(on.length?' ✓':''));}
function saveS(){if($('sNewP')&&$('sNewP').value.trim())shAddP();var amt=+$('sAmt').value,dt=$('sDate').value,py=$('sPayer').value;if(!amt||!dt)return alert('ใส่วันที่และยอดรวม');shCalc();
  var sp={},sum=0,box=$('sParts');[].forEach.call(box.querySelectorAll('input[data-id]'),function(c){if(c.checked){var v=+box.querySelector('input[data-amt="'+c.dataset.id+'"]').value||0;sp[c.dataset.id]=v;sum+=v;}});
  if(!Object.keys(sp).length)return alert('เลือกคนที่แชร์');if($('sMode').value!=='eq'&&Math.abs(sum-amt)>0.01)return alert('ยอดแบ่งรวม '+f(sum)+' ไม่เท่ากับยอดรวม '+f(amt));
  DB.shares=DB.shares||[];var id=$('sId').value||nextId('s',DB.shares),x=DB.shares.find(function(s){return s.id===id}),o={id:id,date:dt,title:$('sTitle').value.trim(),amt:amt,payer:py,mode:$('sMode').value,split:sp,rec:$('sRec').value,until:$('sRec').value?$('sUntil').value:'',ts:(x&&x.ts)||Date.now()};
  if(x)Object.assign(x,o);else DB.shares.push(o);save();clearS();safeRender();}
function editS(id){var s=DB.shares.find(function(x){return x.id===id});$('sId').value=s.id;$('sDate').value=s.date;$('sTitle').value=s.title||'';$('sAmt').value=s.amt;shSel(s.payer);$('sMode').value=s.mode||'cu';$('sRec').value=s.rec||'';$('sUntil').value=s.until||'';$('sParts')._v=s.split;shParts();}
function clearS(){$('sId').value='';$('sTitle').value='';$('sAmt').value='';$('sDate').value=today();$('sMode').value='eq';$('sRec').value='';$('sUntil').value='';if($('sNewP'))$('sNewP').value='';$('sParts')._v={me:''};shSel('me');shParts();}
function delS(id){if(!confirm('ลบรายการแชร์?'))return;DB.shares=DB.shares.filter(function(x){return x.id!==id});save();safeRender();}
/* ยอดสุทธิ: จ่ายไป − ส่วนของตัวเอง (+ = ได้คืน, − = ต้องจ่าย) */
function shNet(){var P={},O={};shOcc().forEach(function(s){P[s.payer]=(P[s.payer]||0)+s.amt;Object.keys(s.split).forEach(function(k){O[k]=(O[k]||0)+s.split[k];});});
  var ids={};Object.keys(P).concat(Object.keys(O)).forEach(function(k){ids[k]=1;});return Object.keys(ids).map(function(k){return {id:k,paid:r2(P[k]||0),own:r2(O[k]||0),net:r2((P[k]||0)-(O[k]||0))}});}
/* จับคู่ใครจ่ายใคร (greedy: ลูกหนี้มากสุด → เจ้าหนี้มากสุด) */
function shSettleList(N){var cr=N.filter(function(x){return x.net>0.005}).map(function(x){return {id:x.id,v:x.net}}).sort(function(a,b){return b.v-a.v}),db=N.filter(function(x){return x.net<-0.005}).map(function(x){return {id:x.id,v:-x.net}}).sort(function(a,b){return b.v-a.v}),out=[],i=0,j=0;
  while(i<db.length&&j<cr.length){var m=r2(Math.min(db[i].v,cr[j].v));if(m>0)out.push({from:db[i].id,to:cr[j].id,amt:m});db[i].v=r2(db[i].v-m);cr[j].v=r2(cr[j].v-m);if(db[i].v<=0.005)i++;if(cr[j].v<=0.005)j++;}return out;}
function shPaid(a,b,m){DB.shares=DB.shares||[];var sp={};sp[b]=m;DB.shares.push({id:nextId('s',DB.shares),date:today(),title:'💸 โอนคืน',amt:m,payer:a,mode:'cu',split:sp,settle:1,ts:Date.now()});save();safeRender();}
function renderShare(){DB.shares=DB.shares||[];shSel($('sPayer').value||'me');if(!$('sParts').innerHTML)clearS();
  var N=shNet().sort(function(a,b){return b.net-a.net}),L=shSettleList(N);
  $('shSettle').innerHTML=L.length?'<table><tr><th class="l">ใครจ่าย</th><th class="l">ให้ใคร</th><th>ยอด</th><th></th></tr>'+L.map(function(x){return '<tr><td class="l"><b>'+shName(x.from)+'</b></td><td class="l">→ <b>'+shName(x.to)+'</b></td><td class="pos"><b>'+f(x.amt)+'</b></td><td><button class="btn s" onclick="shPaid(\''+x.from+'\',\''+x.to+'\','+x.amt+')">✓ จ่ายแล้ว</button></td></tr>'}).join('')+'</table>':'<p class="muted">✅ เคลียร์หมดแล้ว ไม่มีใครค้างใคร</p>';
  $('shBal').innerHTML='<table><tr><th class="l">คน</th><th>จ่ายไป</th><th>ส่วนของตัวเอง</th><th>สุทธิ</th><th class="l">สถานะ</th></tr>'+N.map(function(x){return '<tr><td class="l"><b>'+shName(x.id)+'</b></td><td>'+f(x.paid)+'</td><td>'+f(x.own)+'</td><td class="'+(x.net<0?'pos':'neg')+'"><b>'+f(x.net)+'</b></td><td class="l">'+(x.net>0.005?'ได้คืน':x.net<-0.005?'ต้องจ่าย':'เคลียร์แล้ว')+'</td></tr>'}).join('')+'</table>';
  var S=shOcc().slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0)});
  $('shTbl').innerHTML='<table><tr><th class="l">วันที่</th><th class="l">รายการ</th><th class="l">ใครจ่าย</th><th>ยอด</th><th class="l">แชร์</th><th></th></tr>'+S.map(function(s){return '<tr'+(s.settle?' class="closed"':'')+'><td class="l">'+s.date+'</td><td class="l">'+(s.title||'-')+(s.rec?' <span class="tag" style="background:#8e44ad">🔁 '+(s.rec==='m'?'ทุกเดือน':'ทุกปี')+'</span>':'')+'</td><td class="l">'+shName(s.payer)+'</td><td>'+f(s.amt)+'</td><td class="l">'+Object.keys(s.split).map(function(k){return shName(k)+' '+f(s.split[k])}).join(' · ')+'</td><td><button class="btn s" onclick="editS(\''+(s.src||s.id)+'\')">แก้</button> <button class="btn s r" onclick="delS(\''+(s.src||s.id)+'\')">ลบ</button></td></tr>'}).join('')+'</table>';}

/* ทำซ้ำ: แตกรายการทุกเดือน/ทุกปี ตั้งแต่วันแรกถึงวันนี้ (หรือ until) */
function shOcc(){var td=today(),out=[];(DB.shares||[]).forEach(function(s){if(!s.rec){out.push(s);return;}var end=s.until&&s.until<td?s.until:td,d=D(s.date),k=0,day=d.getDate();
  while(k<600){var x=new Date(d.getFullYear()+(s.rec==='y'?k:0),d.getMonth()+(s.rec==='m'?k:0),1),last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,last));var iso=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    if(iso>end)break;out.push(Object.assign({},s,{id:s.id+'_'+k,src:s.id,date:iso}));k++;}});return out;}
function shAddP(){var nm=$('sNewP').value.trim();if(!nm)return;var p=DB.people.find(function(x){return x.name===nm});if(!p){p={id:nextId('p',DB.people),name:nm};DB.people.push(p);}if(!DB.debtors.some(function(d){return d.pid===p.id})){var dt=$('sDate').value||today();DB.debtors.push({id:nextId('c',DB.debtors),pid:p.id,name:'Cash',kind:'daily',status:'active',rate:0,rateU:'y',inst:0,day:+dt.slice(8,10)||1,start:dt,openP:0,note:''});}save();
  var box=$('sParts'),v={};[].forEach.call(box.querySelectorAll('input[data-id]'),function(c){if(c.checked)v[c.dataset.id]=box.querySelector('input[data-amt="'+c.dataset.id+'"]').value;});v[p.id]='';box._v=v;shSel($('sPayer').value);shParts();$('sNewP').value='';}

/* ยอดแชร์ที่ลูกหนี้ค้างเรา (+) / เราค้างเขา (−) แบบตัวต่อตัว */
function shOwe(pid){var v=0;if(typeof shOcc!=='function')return 0;shOcc().forEach(function(s){if(s.payer===ME.id&&s.split[pid])v+=s.split[pid];if(s.payer===pid&&s.split[ME.id])v-=s.split[ME.id];});return r2(v);}
