/* งวด = วันตัดรอบแรกที่ >= วันที่ทำรายการ (ตามวันตัดรอบของสัญญา) */
function perOf(dt,day){var x=D(dt),b=bdate(x.getFullYear(),x.getMonth(),day);if(iso(b)>dt)b=bdate(x.getFullYear(),x.getMonth()-1,day);return iso(b);}
var TF={p:'',c:''};
function renderTxns(){
  $('fP').innerHTML=opts(DB.people.map(function(p){return [p.id,p.name]}),TF.p,'ทุกลูกหนี้');
  var cs=DB.debtors.filter(function(d){return !TF.p||d.pid===TF.p});if(TF.c&&!cs.some(function(d){return d.id===TF.c}))TF.c='';
  $('fC').innerHTML='<option value="">ทุกสัญญา</option>'+cs.map(function(d){return {d:d,cl:isClosed(d,calc(d,0,0))}}).sort(function(a,b){return (a.cl-b.cl)||(b.d.start||'').localeCompare(a.d.start||'')}).map(function(o){return '<option value="'+o.d.id+'"'+(o.d.id===TF.c?' selected':'')+(o.cl?' style="color:#999"':'')+'>'+(TF.p?o.d.name:cLabel(o.d))+(o.cl?' (ปิดแล้ว)':'')+'</option>'}).join('');
  $('xMid').innerHTML=mOpts($('xMid').value);var xv=$('xDid').value||TF.c||cur;$('xDid').innerHTML=DB.debtors.filter(function(d){return d.kind!=='hist'}).map(function(d){return {d:d,cl:isClosed(d,calc(d,0,0))}}).sort(function(a,b){return (a.cl-b.cl)||(b.d.start||'').localeCompare(a.d.start||'')}).map(function(o){return '<option value="'+o.d.id+'"'+(o.d.id===xv?' selected':'')+(o.cl?' style="color:#999"':'')+'>'+cLabel(o.d)+(o.cl?' (ปิดแล้ว)':'')+'</option>'}).join('');$('xDid').insertAdjacentHTML('beforeend','<option value="__new">➕ ลูกหนี้ใหม่…</option>');xNewToggle();
  var scope=TF.c?cs.filter(function(d){return d.id===TF.c}):cs,C={},h='',inn=0,out=0,bal=0;
  scope.forEach(function(d){C[d.id]=calc(d,0,0);bal+=C[d.id].P;});
  var tx=DB.txns.filter(function(t){return C[t.did]}).sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0)});
  tx.forEach(function(t){var d=getD(t.did),pb=perOf(t.date,+d.day||1);if(d.start&&pb<d.start)pb=firstB(d.start,+d.day||1);
    if(t.type==='repay')inn+=t.amt;else out+=t.amt;
    h+='<tr><td class="l">'+t.date+'</td><td class="l">'+pName(d)+'</td><td class="l cn">'+d.name+'</td><td class="mob '+(t.type==='borrow'?'pos">−':'neg">+')+f(t.amt)+'</td><td class="l dk"><span class="tag '+(t.type==='borrow'?'tb">ยืม':'tr">คืน')+'</span></td><td class="neg dk">'+(t.type==='repay'?f(t.amt):'')+'</td><td class="pos dk">'+(t.type==='borrow'?f(t.amt):'')+'</td><td class="l dk">'+mName(t.mid)+'</td><td class="l dk">'+pb+'</td><td class="l dk">'+(t.note||'')+(t.due?' <span class="tag" style="background:'+(t.due<today()?'#c0392b':'#e67e22')+'">คืน '+dm(t.due)+'</span>':'')+'</td><td><button class="btn s" onclick="editTxn(\''+t.id+'\')">แก้</button> <button class="btn s r" onclick="delTxn(\''+t.id+'\')">ลบ</button></td></tr>';});
  $('txnTbl').innerHTML='<p>'+tx.length+' รายการ · รับคืนรวม <b class="neg">'+f(inn)+'</b> · ยืมออกรวม <b class="pos">'+f(out)+'</b> · คงค้าง ณ ตัดรอบล่าสุด <b class="pos">'+f(bal)+'</b></p><table><tr><th class="l">วันที่</th><th class="l">ลูกหนี้</th><th class="l cn">สัญญา</th><th class="mob">จำนวน</th><th class="l dk">ประเภท</th><th class="dk">รับคืน</th><th class="dk">ยืมออก</th><th class="l dk">วิธีจ่าย</th><th class="l dk">งวด</th><th class="l dk">หมายเหตุ</th><th></th></tr>'+h+
  '<tr class="tot"><td class="l">รวม</td><td></td><td></td><td></td><td>'+f(inn)+'</td><td>'+f(out)+'</td><td></td><td></td><td></td><td></td></tr></table>';}
function setTF(k,v){TF[k]=v;if(k==='p')TF.c='';if(k==='c'&&v)$('xDid').value=v;safeRender();}
function saveTxn(){if($('xDid').value==='__new'){var nm=$('xNewP').value.trim();if(!nm)return alert('ใส่ชื่อลูกหนี้ใหม่');if(!+$('xAmt').value||!$('xDate').value)return alert('ใส่วันที่และจำนวน');
  var p=DB.people.find(function(x){return x.name===nm});if(!p){p={id:nextId('p',DB.people),name:nm};DB.people.push(p);}
  var c={id:nextId('c',DB.debtors),pid:p.id,name:'Cash',kind:'daily',status:'active',rate:0,rateU:'y',inst:0,day:+$('xDate').value.slice(8,10)||1,start:$('xDate').value,openP:0,note:''};DB.debtors.push(c);
  var o=document.createElement('option');o.value=c.id;$('xDid').appendChild(o);$('xDid').value=c.id;}
  var did=$('xDid').value,a=+$('xAmt').value,dt=$('xDate').value;if(!did)return alert('เลือกสัญญา');if(!a||!dt)return alert('ใส่วันที่และจำนวน');
  var id=$('xId').value||uid(),t=DB.txns.find(function(x){return x.id===id}),o={id:id,did:did,date:dt,type:$('xType').value,amt:Math.abs(a),ts:(t&&t.ts)||Date.now(),mid:$('xMid').value,due:$('xType').value==='borrow'?$('xDue').value:'',note:$('xNote').value};
  if(t)Object.assign(t,o);else DB.txns.push(o);save();clearTxn();safeRender();askClose(did);}
function editTxn(id){var t=DB.txns.find(function(x){return x.id===id});$('xId').value=t.id;$('xDid').value=t.did;$('xDate').value=t.date;$('xType').value=t.type;$('xAmt').value=t.amt;$('xMid').value=t.mid||'';$('xDue').value=t.due||'';$('xNote').value=t.note||'';window.scrollTo(0,0);}
function clearTxn(){$('xId').value='';$('xAmt').value='';$('xNote').value='';$('xDue').value='';if($('xNewP'))$('xNewP').value='';$('xDate').value=today();}
function delTxn(id){if(!confirm('ลบรายการ?'))return;DB.txns=DB.txns.filter(function(x){return x.id!==id});save();safeRender();}

document.addEventListener('change',function(e){if(e.target&&e.target.id==='xType'){var w=$('xDueW');if(w)w.style.display=e.target.value==='borrow'?'':'none';}});

function xNewToggle(){var n=$('xDid')&&$('xDid').value==='__new',w=$('xNewW');if(w)w.style.display=n?'':'none';if(n&&$('xNewP'))setTimeout(function(){$('xNewP').focus()},30);}

function askClose(did){var d=getD(did);if(!d||d.status==='closed')return;var c=calc(d,0,0);if(c.P>0.005||!txOf(did).length)return;setTimeout(function(){if(confirm('ยอดคงค้างของ "'+d.name+'" เป็น 0 แล้ว\nปิดสัญญานี้เลยไหม?')){d.status='closed';save();safeRender();}},50);}
