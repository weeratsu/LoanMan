function perRows(c,d){var h='',S={i:0,b:0,p:0,pi:0,pp:0,due:0};
  c.per.forEach(function(p){if(!p.fc){S.i+=p.int;S.b+=p.borrow;S.p+=p.paid;S.pi+=p.pI;S.pp+=p.pP;S.due+=p.due;}
    h+='<tr'+(p.fc?' class="fc"':'')+'><td>'+p.idx+'</td><td class="l">'+p.b+(p.fc?' 🔮':'')+'</td><td>'+p.days+'</td><td>'+f(p.oP)+'</td><td>'+f(p.int)+'</td><td>'+f(p.dP)+'</td><td>'+f(p.dI)+'</td><td><b>'+f(p.due)+'</b></td><td class="neg">'+(p.paid?f(p.paid):'')+'</td><td class="pos">'+(p.borrow?f(p.borrow):'')+'</td><td>'+f(p.pP)+'</td><td>'+f(p.pI)+'</td><td class="'+(p.net<0?'pos':'neg')+'">'+f(p.net)+'</td><td class="'+(p.diff<-0.005?'pos':'neg')+'">'+f(p.diff)+'</td><td><b>'+f(p.cP)+'</b></td><td>'+(p.fc?'คาดการณ์':p.n+' รายการ')+'</td></tr>';});
  return '<table><tr><th>#</th><th class="l">วันตัดรอบ</th><th>วัน</th><th>ต้นยกมา</th><th>ดอกงวดนี้</th><th>ดิว:ต้น</th><th>ดิว:ดอก</th><th>ยอดดิว</th><th>คืน</th><th>ยืมเพิ่ม</th><th>คืน:ต้น</th><th>คืน:ดอก</th><th>สุทธิ</th><th>ขาด/เกิน</th><th>คงเหลือ</th><th>สถานะ</th></tr>'+h+
  '<tr class="tot"><td></td><td class="l">รวม (จริง)</td><td></td><td></td><td>'+f(S.i)+'</td><td></td><td></td><td>'+f(S.due)+'</td><td>'+f(S.p)+'</td><td>'+f(S.b)+'</td><td>'+f(S.pp)+'</td><td>'+f(S.pi)+'</td><td>'+f(S.p-S.b)+'</td><td></td><td>'+f(c.P)+'</td><td></td></tr></table>';}
function perChart(id,c){var L=c.per.map(function(p){return p.b});
  chart(id,{plugins:[todayLine(L)],data:{labels:L,datasets:[{type:'line',label:'คงเหลือ',data:c.per.map(function(p){return +p.cP.toFixed(2)}),borderColor:'#c0392b',backgroundColor:'#c0392b22',fill:true,pointRadius:0,segment:{borderDash:function(x){return c.per[x.p1DataIndex].fc?[6,4]:undefined}}},
   {type:'bar',label:'คืน:ต้น',data:c.per.map(function(p){return +p.pP.toFixed(2)}),backgroundColor:c.per.map(function(p){return p.fc?'#2a64b866':'#2a64b8'}),stack:'a'},
   {type:'bar',label:'คืน:ดอก',data:c.per.map(function(p){return +p.pI.toFixed(2)}),backgroundColor:c.per.map(function(p){return p.fc?'#e67e2266':'#e67e22'}),stack:'a'},
   {type:'bar',label:'ยืมเพิ่ม',data:c.per.map(function(p){return -p.borrow}),backgroundColor:'#c0392b99',stack:'a'}]},options:{scales:{x:{stacked:true},y:{stacked:true}}}});}
function renderPeriod(){var d=getD(cur);if(!d){$('perTbl').innerHTML='';return;}var c=calc(d);
  $('perTbl').innerHTML=perRows(c,d);perChart('cPer',c);
  var t=$('perTbl'),r=t.querySelector('tr.fc');if(r)t.scrollTop=Math.max(r.offsetTop-200,0);}
