/* Timeline: แต่ละงวด = แถบวัน (ตัดรอบก่อน → วันตัดยอด) · ช่วงสี = ต้นคงค้างแต่ละช่วง + ดอกของช่วงนั้น · หมุด = trx · เส้นแดง = วันตัดยอด */
var TLN=6;
function dm(s){return s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(2,4);}
function tlPeriod(d,p,prev,r){var tx=txOf(d.id).filter(function(t){return t.date>prev&&t.date<=p.b}),n=Math.max(days(prev,p.b),1),P=p.oP,A=0,lt=prev,seg=[],mk=[];
  function cut(t){var dd=days(lt,t);if(dd>0){var x=P>0?P*r*dd/365:0;seg.push({a:lt,z:t,dd:dd,P:P,x:x});A+=x;}lt=t;}
  tx.forEach(function(t){cut(addDay(t.date,-1));var pi=0;if(t.type==='borrow')P+=t.amt;else{pi=Math.min(t.amt,Math.max(A,0));A-=pi;P-=t.amt-pi;}mk.push({t:t,pos:days(prev,t.date)/n*100,pi:pi});});cut(p.b);
  var S=seg.map(function(s,i){var L=days(prev,s.a)/n*100,Wd=s.dd/n*100;return '<div class="tls'+(i%2?' alt':'')+'" style="left:'+L+'%;width:'+Wd+'%" title="'+dm(addDay(s.a,1))+' → '+dm(s.z)+' · ต้น '+f(s.P)+' × '+r*100+'% × '+s.dd+' วัน ÷ 365 = ดอก '+f(s.x)+'">'+(Wd>9?'<b>'+f(s.x)+'</b><small>'+s.dd+' วัน · ต้น '+f(s.P)+'</small>':'')+'</div>';}).join('');
  var M=mk.map(function(m,i){var t=m.t,b=t.type==='borrow';return '<div class="tlm '+(b?'b':'r')+'" style="left:'+m.pos+'%;--lv:'+(i%3)+'" title="'+t.date+' · '+(b?'ยืม ':'คืน ')+f(t.amt)+(m.pi?' (ตัดดอก '+f(m.pi)+')':'')+(t.note?' · '+t.note:'')+'"><span>'+(b?'▼ ยืม ':'▲ คืน ')+f(t.amt)+'<br><i>'+dm(t.date)+'</i></span></div>';}).join('');
  return '<div class="tlp'+(p.fc?' fc':'')+'"><div class="tlh"><b>งวด #'+p.idx+'</b> '+dm(addDay(prev,1))+' → <b>'+dm(p.b)+' ตัดยอด</b>'+(p.fc?' 🔮':'')+'<span>ดอกงวดนี้ <b>'+f(p.int)+'</b> · คืน '+f(p.paid)+' · ยืม '+f(p.borrow)+' · คงเหลือ <b class="pos">'+f(p.cP)+'</b></span></div>'+
    '<div class="tlw"><div class="tlmk">'+M+'</div><div class="tlbar"><div class="tlint">ดอกคิด '+dm(addDay(prev,1))+' → '+dm(p.b)+' ('+n+' วัน)</div>'+S+'<div class="tlcut" title="วันตัดยอด '+p.b+'"></div>'+(today()>prev&&today()<=p.b?'<div class="tltd" style="left:'+days(prev,today())/n*100+'%" title="วันนี้"></div>':'')+'</div>'+
    '<div class="tlax"><span>'+dm(prev)+' (ตัดรอบก่อน)</span><span>'+dm(p.b)+'</span></div></div></div>';}
function renderTL(){var d=getD(cur),el=$('tlBox');if(!d){el.innerHTML='';return;}
  if(d.kind!=='daily'){el.innerHTML='<p class="muted">Timeline ใช้กับสัญญาเงินสด ดอกรายวันเท่านั้น</p>';return;}
  var c=calc(d,0,0),r=yr(d),L=c.per.slice(),out=[];
  var td=today(),nx=L.find(function(p){return p.b>=td});if(!nx){var c2=calc(d);nx=c2.per.find(function(p){return p.fc});if(nx)L.push(nx);}
  for(var i=L.length-1;i>=0&&out.length<TLN;i--){var prev=i?L[i-1].b:addDay(d.start,-1);out.push(tlPeriod(d,L[i],prev,r));}
  el.innerHTML='<p class="muted">ใหม่ → เก่า · ชี้ที่ช่วงสี/หมุด เพื่อดูวิธีคิด · 🔴 วันตัดยอด · 🔵 วันนี้</p>'+out.join('')+(L.length>TLN?'<p style="text-align:center"><button class="btn g" onclick="TLN+=6;renderTL()">แสดงงวดก่อนหน้า</button></p>':'');}
