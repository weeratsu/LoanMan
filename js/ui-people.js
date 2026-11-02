function renderPeople(){
  $('peopleTbl').innerHTML='<table><tr><th class="l">ID</th><th class="l">ชื่อลูกหนี้</th><th class="l">ติดต่อ</th><th>PIN</th><th>สัญญาทั้งหมด</th><th>ใช้งาน</th><th>คงค้าง</th><th class="l">หมายเหตุ</th><th></th></tr>'+
  DB.people.map(function(p){var cs=DB.debtors.filter(function(d){return d.pid===p.id}),act=0,bal=0;
    cs.forEach(function(d){var c=calc(d,0,0);if(!isClosed(d,c))act++;bal+=c.P;});
    return '<tr><td class="l muted">'+p.id+'</td><td class="l"><b>'+p.name+'</b></td><td class="l">'+(p.phone||'')+'</td><td>'+(p.pin?'🔒':'-')+'</td><td>'+cs.length+'</td><td>'+act+'</td><td class="pos">'+f(bal)+'</td><td class="l">'+(p.note||'')+'</td><td><button class="btn s" onclick="editPerson(\''+p.id+'\')">แก้</button> <button class="btn s r" onclick="delPerson(\''+p.id+'\')">ลบ</button></td></tr>';}).join('')+'</table>';}
function savePerson(){var n=$('pName').value.trim();if(!n)return alert('ใส่ชื่อ');var id=$('pId').value||nextId('p',DB.people),p=getP(id),o={id:id,name:n,phone:$('pPhone').value,pin:$('pPin').value.trim(),note:$('pNote').value};
  if(p)Object.assign(p,o);else DB.people.push(o);save();clearPerson();safeRender();}
function editPerson(id){var p=getP(id);$('pId').value=p.id;$('pName').value=p.name;$('pPhone').value=p.phone||'';$('pPin').value=p.pin||'';$('pNote').value=p.note||'';window.scrollTo(0,0);}
function clearPerson(){['pId','pName','pPhone','pNote','pPin'].forEach(function(i){$(i).value=''});}
function delPerson(id){if(DB.debtors.some(function(d){return d.pid===id}))return alert('มีสัญญาผูกอยู่ ลบสัญญาก่อน');if(!confirm('ลบลูกหนี้?'))return;DB.people=DB.people.filter(function(x){return x.id!==id});save();safeRender();}
