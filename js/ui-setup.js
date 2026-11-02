/* Setup: master วิธีจ่าย (id m1,m2...) — รายการยืม/คืนเก็บ mid */
var MTYPE={cash:'เงินสด',transfer:'โอน',card:'บัตรเครดิต',other:'อื่น ๆ'};
function getM(id){return (DB.methods||[]).find(function(x){return x.id===id});}
function mName(id){var m=getM(id);return m?m.name:'';}
function mOpts(sel){return opts(DB.methods.filter(function(m){return m.active!==false||m.id===sel}).map(function(m){return [m.id,m.id+' · '+m.name]}),sel,'— ไม่ระบุ —');}
function renderSetup(){renderBanks();
  $('mTblW').innerHTML='<table><tr><th class="l">ID</th><th class="l">ชื่อ</th><th class="l">ประเภท</th><th class="l">ธนาคาร</th><th class="l">เลขท้าย</th><th>ใช้ในรายการ</th><th class="l">สถานะ</th><th class="l">หมายเหตุ</th><th></th></tr>'+
  DB.methods.map(function(m){var n=DB.txns.filter(function(t){return t.mid===m.id}).length+DB.debtors.filter(function(d){return d.mid===m.id}).length;
    return '<tr><td class="l muted">'+m.id+'</td><td class="l"><b>'+m.name+'</b></td><td class="l">'+(MTYPE[m.type]||'')+'</td><td class="l">'+bName(m.bid)+'</td><td class="l">'+(m.last4||'')+'</td><td>'+n+'</td><td class="l">'+(m.active===false?'⏸ ปิดใช้':'🟢 ใช้งาน')+'</td><td class="l">'+(m.note||'')+'</td><td><button class="btn s" onclick="editM(\''+m.id+'\')">แก้</button> <button class="btn s r" onclick="delM(\''+m.id+'\')">ลบ</button></td></tr>';}).join('')+'</table>';}
function saveM(){var n=$('mName').value.trim();if(!n)return alert('ใส่ชื่อ');var id=$('mId').value||nextId('m',DB.methods),m=getM(id),
  o={id:id,name:n,type:$('mType').value,bid:$('mBid').value,last4:$('mLast4').value,active:$('mActive').value!=='0',note:$('mNote').value};
  if(m)Object.assign(m,o);else DB.methods.push(o);save();clearM();safeRender();}
function editM(id){var m=getM(id);$('mId').value=m.id;$('mName').value=m.name;$('mType').value=m.type||'cash';$('mBid').value=m.bid||'';$('mLast4').value=m.last4||'';$('mActive').value=m.active===false?'0':'1';$('mNote').value=m.note||'';window.scrollTo(0,0);}
function clearM(){['mId','mName','mBid','mLast4','mNote'].forEach(function(i){$(i).value=''});$('mType').value='cash';$('mActive').value='1';}
function delM(id){if(DB.txns.some(function(t){return t.mid===id})||DB.debtors.some(function(d){return d.mid===id}))return alert('มีรายการใช้วิธีจ่ายนี้อยู่ — ตั้งเป็น "ปิดใช้" แทน');if(!confirm('ลบ?'))return;DB.methods=DB.methods.filter(function(x){return x.id!==id});save();safeRender();}

/* Master: ธนาคาร (id b1,b2...) — วิธีจ่ายเก็บ bid */
function getB(id){return (DB.banks||[]).find(function(x){return x.id===id});}
function bName(id){var b=getB(id);return b?b.name:'';}
function renderBanks(){$('mBid').innerHTML=opts(DB.banks.slice().sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(b){return [b.id,b.id+' · '+b.name]}),$('mBid').value,'— ไม่ระบุ —');
  $('bTblW').innerHTML='<table><tr><th class="l">ID</th><th class="l">ชื่อย่อ</th><th class="l">ชื่อเต็ม</th><th>ใช้ในวิธีจ่าย</th><th class="l">หมายเหตุ</th><th></th></tr>'+
  DB.banks.map(function(b){var n=DB.methods.filter(function(m){return m.bid===b.id}).length;return '<tr><td class="l muted">'+b.id+'</td><td class="l"><b>'+b.name+'</b></td><td class="l">'+(b.full||'')+'</td><td>'+n+'</td><td class="l">'+(b.note||'')+'</td><td><button class="btn s" onclick="editB(\''+b.id+'\')">แก้</button> <button class="btn s r" onclick="delB(\''+b.id+'\')">ลบ</button></td></tr>'}).join('')+'</table>';}
function saveB(){var n=$('bName').value.trim();if(!n)return alert('ใส่ชื่อ');var id=$('bId').value||nextId('b',DB.banks),b=getB(id),o={id:id,name:n,full:$('bFull').value,note:$('bNote').value};
  if(b)Object.assign(b,o);else DB.banks.push(o);save();clearB();safeRender();}
function editB(id){var b=getB(id);$('bId').value=b.id;$('bName').value=b.name;$('bFull').value=b.full||'';$('bNote').value=b.note||'';}
function clearB(){['bId','bName','bFull','bNote'].forEach(function(i){$(i).value=''});}
function delB(id){if(DB.methods.some(function(m){return m.bid===id}))return alert('มีวิธีจ่ายใช้ธนาคารนี้อยู่');if(!confirm('ลบ?'))return;DB.banks=DB.banks.filter(function(x){return x.id!==id});save();safeRender();}
