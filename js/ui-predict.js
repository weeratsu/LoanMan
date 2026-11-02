function renderPred(){var d=getD(cur);if(!d)return;var c0=calc(d,0,0),R=real(c0).slice(-3),avg=R.length?R.reduce(function(s,p){return s+Math.max(p.net,0)},0)/R.length:0;
  $('pHint').textContent='ค่างวด '+f(+d.inst)+' · เฉลี่ยสุทธิ 3 งวดล่าสุด '+f(avg);
  if(!$('pAmt').value)$('pAmt').value=(+d.inst||avg).toFixed(2);var pay=+$('pAmt').value;
  var c=calc(d,pay),F=c.per.filter(function(p){return p.fc}),lp=F[F.length-1];
  if(!F.length){$('pK').innerHTML='<div class="kpi"><b class="neg">ไม่มียอดคงค้าง ✅</b></div>';$('pTbl').innerHTML='';return;}
  var never=lp.never||lp.cP>0.005,tI=F.reduce(function(s,p){return s+p.int},0),tP=F.reduce(function(s,p){return s+p.paid},0);
  $('pK').innerHTML=(never?'<div class="kpi"><b class="pos">ปิดหนี้ไม่ได้ — จ่ายไม่พอดอก ('+f(F[0].int)+'/งวด)</b></div>':
   [['คงเหลือ ณ งวดล่าสุด',f(c.P)],['เหลืออีก',F.length+' งวด'],['คาดปิดหนี้',lp.b],['งวดสุดท้าย',f(lp.paid)],['ดอกเบี้ยที่จะได้อีก',f(tI)],['รวมรับคืนอีก',f(tP)]].map(function(k){return '<div class="kpi"><small>'+k[0]+'</small><b>'+k[1]+'</b></div>'}).join(''));
  var cf={per:F};perChart('cPred',cf);$('pTbl').innerHTML=perRows({per:F,P:lp.cP},d);}
