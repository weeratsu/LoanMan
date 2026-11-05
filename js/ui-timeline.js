/* Timeline: แต่ละงวด = แถบวัน (ตัดรอบก่อน → วันตัดยอด) · ช่วงสี = ต้นคงค้างแต่ละช่วง + ดอกของช่วงนั้น · หมุด = trx · เส้นแดง = วันตัดยอด */
var TLN=6;
function dm(s){return s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(2,4);}
function tlPeriod(d,p,prev,r){/* แบบ Excel: ดอก = ยอดยกมา × อัตรา × วัน(ตัดรอบก่อน→ตัดรอบนี้) ÷ 365 · trx ตั้งแต่ตัดรอบนี้ ถึงก่อนตัดรอบถัดไป */
  var nb=p.nb||nextB(p.b,+d.day||1),N=Math.max(days(prev,nb),1),ci=days(prev,p.b)/N*100,tx=txOf(d.id).filter(function(t){return t.date>=p.b&&t.date<nb});
  /* รวม trx วันเดียวกันเป็น 1 ป้าย · จัดป้ายเป็นชั้น (lane) ไม่ให้ทับกัน */
  var G=[],gm={};tx.forEach(function(t){var g=gm[t.date];if(!g){g=gm[t.date]={date:t.date,pos:days(prev,t.date)/N*100,it:[]};G.push(g);}g.it.push(t);});
  var lanes=[],LW=13;G.forEach(function(g){var l=0;while(lanes[l]!=null&&g.pos-lanes[l]<LW)l++;lanes[l]=g.pos;g.lv=l;});
  var NL=Math.max(lanes.length,1),LH=34;
  var M=G.map(function(g){var tr=g.pos<7?'0':g.pos>93?'-100%':'-50%',net=g.it.reduce(function(s,t){return s+(t.type==='borrow'?-t.amt:t.amt)},0),cl=g.it.length>1?(net<0?'b':'r'):(g.it[0].type==='borrow'?'b':'r');
    var lab=g.it.length>1?'● '+g.it.length+' รายการ '+(net<0?'−':'+')+f(Math.abs(net)):(cl==='b'?'▼ ยืม ':'▲ คืน ')+f(g.it[0].amt);
    var tip=g.it.map(function(t){return (t.type==='borrow'?'ยืม ':'คืน ')+f(t.amt)+(t.note?' · '+t.note:'')}).join('\n');
    return '<div class="tlm '+cl+'" style="left:'+g.pos+'%;height:'+(10+g.lv*LH)+'px" title="'+g.date+'\n'+tip+'"><span style="transform:translateX('+tr+')">'+lab+'<br><i>'+dm(g.date)+'</i></span></div>';}).join('');
  var MH=NL*LH+20;
  var S='<div class="tls" style="left:0;width:'+ci+'%" title="ดอก = '+f(p.oP)+' × '+r*100+'% × '+p.days+' วัน ÷ 365 = '+f(p.int)+'"><b>ดอก '+f(p.int)+'</b><small>'+f(p.oP)+' × '+p.days+' วัน</small></div>'+
    '<div class="tls alt" style="left:'+ci+'%;width:'+(100-ci)+'%;background:#e3f2e8;color:#1e6b3a" title="trx ช่วงนี้ หักในงวด '+p.b+'"><small>trx '+dm(p.b)+' → '+dm(addDay(nb,-1))+'</small></div>';
  var td=today(),tdl=td>=prev&&td<nb?'<div class="tltd" style="left:'+days(prev,td)/N*100+'%" title="วันนี้"></div>':'';
  return '<div class="tlp'+(p.fc?' fc':'')+'"><div class="tlh"><b>งวด #'+p.idx+' · ตัดยอด '+dm(p.b)+'</b>'+(p.fc?' 🔮':'')+'<span>ดอก <b>'+f(p.int)+'</b> · สุทธิ '+f(p.paid-p.borrow)+' · คืนต้น '+f(p.pP)+' · คงเหลือ <b class="pos">'+f(p.cP)+'</b></span></div>'+
    '<div class="tlw"><div class="tlmk" style="height:'+MH+'px">'+M+'</div><div class="tlbar"><div class="tlint">ดอกคิด '+dm(prev)+' → '+dm(p.b)+' ('+p.days+' วัน)</div>'+S+'<div class="tlcut" style="left:calc('+ci+'% - 2px);right:auto" title="วันตัดยอด '+p.b+'"></div>'+tdl+'</div>'+
    '<div class="tlax"><span>'+dm(prev)+' ตัดรอบก่อน</span><span>'+dm(p.b)+' ตัดยอด</span><span>'+dm(addDay(nb,-1))+'</span></div></div></div>';}
function renderTL(){var d=getD(cur),el=$('tlBox');if(!d){el.innerHTML='';return;}
  if(d.kind!=='daily'){el.innerHTML='<p class="muted">Timeline ใช้กับสัญญาเงินสด ดอกรายวันเท่านั้น</p>';return;}
  var c=calc(d,0,0),r=yr(d),L=c.per.slice(),out=[];
  var td=today(),nx=L.find(function(p){return p.nb>td});if(!nx){var c2=calc(d);nx=c2.per.find(function(p){return p.fc});if(nx)L.push(nx);}
  for(var i=L.length-1;i>=0&&out.length<TLN;i--){var prev=i?L[i-1].b:addDay(d.start,-1);out.push(tlPeriod(d,L[i],prev,r));}
  el.innerHTML='<p class="muted">ใหม่ → เก่า · ส้ม = ช่วงคิดดอก · เขียว = trx ที่หักในงวดนี้ · 🔴 วันตัดยอด · 🔵 วันนี้</p>'+out.join('')+(L.length>TLN?'<p style="text-align:center"><button class="btn g" onclick="TLN+=6;renderTL()">แสดงงวดก่อนหน้า</button></p>':'');}
