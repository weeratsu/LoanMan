function exportJ(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(DB,null,1)],{type:'application/json'}));a.download='loanman_'+today()+'.json';a.click();}
function importJ(el){var r=new FileReader();r.onload=function(){try{var j=JSON.parse(r.result);if(j.patch){var M=j.match,hit=DB.debtors.filter(function(d){return Object.keys(M).every(function(k){return d[k]===M[k]})});if(hit.length!==1)return alert('พบสัญญาที่ตรง '+hit.length+' รายการ — ไม่ได้แก้');Object.assign(hit[0],j.set);save();safeRender();alert('แก้ไขสัญญา '+hit[0].id+' · '+hit[0].name+' แล้ว');return;}if(!j.debtors)throw 0;if(j.merge){var n=0;j.debtors.forEach(function(d){if(DB.debtors.some(function(x){return x.name===d.name&&x.start===d.start}))return;d.id=nextId('c',DB.debtors);DB.debtors.push(d);n++;});migrate();save();safeRender();alert('เพิ่ม '+n+' สัญญา');return;}DB=j;migrate();save();render();alert('นำเข้าแล้ว');}catch(e){alert('ไฟล์ไม่ถูกต้อง')}};r.readAsText(el.files[0]);}

/* Export Public: เข้ารหัสข้อมูลลูกหนี้แต่ละคนด้วย PIN → data.js สำหรับ LoanManPublic (ไม่มีชื่อ/Remarks ภายใน/PIN ในไฟล์) */
function pubPayload(p){var ds=DB.debtors.filter(function(d){return d.pid===p.id}).map(function(d){var o=JSON.parse(JSON.stringify(d));delete o.note;o.mname=d.mid?mName(d.mid):'';
  if(o.rows)o.rows.forEach(function(r){delete r.rm});return o;}),ids=ds.map(function(d){return d.id});
  var tx=DB.txns.filter(function(t){return ids.indexOf(t.did)>=0}).map(function(t){return {id:t.id,did:t.did,date:t.date,type:t.type,amt:t.amt,note:t.note||'',m:t.mid?mName(t.mid):''}});
  return {people:[{id:p.id,name:p.name}],debtors:ds,txns:tx,at:new Date().toISOString()};}
async function exportPublic(){var ps=DB.people.filter(function(p){return p.pin});if(!ps.length)return alert('ยังไม่มีลูกหนี้ที่ตั้ง PIN (หน้าลูกหนี้)');
  var weak=ps.filter(function(p){return p.pin.length<6}).map(function(p){return p.name});
  var items=[];for(var i=0;i<ps.length;i++)items.push(await lmEnc(ps[i].pin,pubPayload(ps[i])));
  items.sort(function(){return Math.random()-.5});
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['window.LMP_DATA='+JSON.stringify({v:1,items:items})+';\n'],{type:'text/javascript'}));a.download='data.js';a.click();
  alert('Export '+ps.length+' คน → data.js\nวางไฟล์ไว้ที่ LoanManPublic/data.js แล้ว push'+(weak.length?'\n⚠ PIN สั้นกว่า 6 ตัว: '+weak.join(', '):''));}
