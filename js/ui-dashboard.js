function renderSel(){var s=$('selD');s.innerHTML=opts(DB.debtors.map(function(d){return [d.id,cLabel(d)]}),cur)||'<option value="">-</option>';
  if(!getD(cur)&&DB.debtors[0])cur=DB.debtors[0].id;s.value=cur;var d=getD(cur);document.querySelectorAll('.dn').forEach(function(e){e.textContent=d?cLabel(d):'-'});}
function sumRow(lbl,c,extra){return '<td>'+f(c.lent)+'</td><td>'+f(c.paid)+'</td><td>'+f(c.pI)+'</td><td class="pos">'+f(c.P)+'</td><td>'+f(c.I)+'</td><td><b>'+f(c.P+c.I)+'</b></td>';}
function renderDash(){var C={},T={lent:0,paid:0,pI:0,P:0,I:0,n:0},PP={},ms={};
  DB.debtors.forEach(function(d){var c=C[d.id]=calc(d,0,0),cl=isClosed(d,c);if(!cl)T.n++;
    var a={lent:c.tot.lent,paid:c.tot.paid,pI:c.tot.paidI,P:c.P,I:cl?0:c.I};c.a=a;
    ['lent','paid','pI','P','I'].forEach(function(k){T[k]+=a[k];});
    var pp=PP[d.pid]||(PP[d.pid]={lent:0,paid:0,pI:0,P:0,I:0,n:0,act:0});pp.n++;if(!cl)pp.act++;['lent','paid','pI','P','I'].forEach(function(k){pp[k]+=a[k];});
    real(c).forEach(function(p){var o=ms[p.m]||(ms[p.m]={pI:0,pP:0,b:0});o.pI+=p.pI;o.pP+=p.pP;o.b+=p.borrow;});});
  $('kpis').innerHTML=[['เงินต้นคงค้าง',f(T.P),'pos'],['ดอกสะสมถึงวันนี้',f(T.I),''],['รวมต้องได้คืน',f(T.P+T.I),'pos'],['ปล่อยกู้สะสม',f(T.lent),''],['รับคืนสะสม',f(T.paid),'neg'],['ดอกที่รับแล้ว',f(T.pI),'neg'],['สัญญาใช้งาน',T.n+' / '+DB.debtors.length,'']].map(function(k){return '<div class="kpi"><small>'+k[0]+'</small><b class="'+k[2]+'">'+k[1]+'</b></div>'}).join('');
  var H='<th>ปล่อยกู้</th><th>รับคืน</th><th>ดอกรับแล้ว</th><th>ต้นคงค้าง</th><th>ดอกสะสม</th><th>รวม</th>';
  $('dashP').innerHTML='<table><tr><th class="l">ลูกหนี้</th><th>สัญญา</th><th>ใช้งาน</th>'+H+'</tr>'+DB.people.map(function(p){var a=PP[p.id]||{lent:0,paid:0,pI:0,P:0,I:0,n:0,act:0};return '<tr><td class="l"><b>'+p.name+'</b></td><td>'+a.n+'</td><td>'+a.act+'</td>'+sumRow('',a)+'</tr>'}).join('')+'<tr class="tot"><td class="l">รวม</td><td>'+DB.debtors.length+'</td><td>'+T.n+'</td>'+sumRow('',T)+'</tr></table>';
  $('dashTbl').innerHTML='<table><tr><th class="l">ลูกหนี้</th><th class="l">สัญญา</th><th class="l">สถานะ</th><th>ดอก</th>'+H+'</tr>'+DB.debtors.map(function(d){var c=C[d.id];return '<tr><td class="l">'+pName(d)+'</td><td class="l"><a href="#" onclick="cur=\''+d.id+'\';go(\'period\');return false">'+d.name+'</a></td><td class="l">'+(isClosed(d,c)?'✅ ปิด':'🟢 ใช้งาน')+'</td><td>'+d.rate+'%</td>'+sumRow('',c.a)+'</tr>'}).join('')+'<tr class="tot"><td class="l">รวม</td><td></td><td></td><td></td>'+sumRow('',T)+'</tr></table>';
  var all=Object.keys(ms).sort(),bal=all.map(function(m){var s=0;DB.debtors.forEach(function(d){var p=null;real(C[d.id]).forEach(function(x){if(x.m<=m)p=x});if(p)s+=p.cP;});return +s.toFixed(2)});
  chart('cBal',{type:'line',data:{labels:all,datasets:[{label:'คงค้างรวม',data:bal,borderColor:'#c0392b',fill:true,backgroundColor:'#c0392b22',tension:.2,pointRadius:0}]}});
  chart('cPay',{type:'bar',data:{labels:all,datasets:[{label:'คืน:ต้น',data:all.map(function(m){return +ms[m].pP.toFixed(2)}),backgroundColor:'#2a64b8'},{label:'คืน:ดอก',data:all.map(function(m){return +ms[m].pI.toFixed(2)}),backgroundColor:'#e67e22'},{label:'ยืมเพิ่ม',data:all.map(function(m){return -ms[m].b}),backgroundColor:'#c0392b99'}]},options:{scales:{x:{stacked:true},y:{stacked:true}}}});
  var pl=DB.people.filter(function(p){return PP[p.id]&&PP[p.id].P>0});
  chart('cPie',{type:'doughnut',data:{labels:pl.map(function(p){return p.name}),datasets:[{data:pl.map(function(p){return +PP[p.id].P.toFixed(2)}),backgroundColor:COL}]}});}
