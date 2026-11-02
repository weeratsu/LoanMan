/* Popup: ฟอร์มเพิ่ม/แก้ไข + alert/confirm (Enter=บันทึก, Esc=ยกเลิก, คลิกนอก popup ไม่ปิด) */
var FORMS=[{id:'pId',t:'ลูกหนี้',e:'editPerson',s:'savePerson',c:'clearPerson'},{id:'dId',t:'สัญญา',e:'editDebtor',s:'saveDebtor',c:'clearDebtor'},
 {id:'xId',t:'รายการยืม/คืน',e:'editTxn',s:'saveTxn',c:'clearTxn'},{id:'bId',t:'ธนาคาร',e:'editB',s:'saveB',c:'clearB'},{id:'mId',t:'วิธีจ่าย',e:'editM',s:'saveM',c:'clearM'}];
var MOD=null;
function mkBg(){var bg=document.createElement('div');bg.className='mbg';bg.style.display='none';document.body.appendChild(bg);return bg;}
function openM(bg){bg.style.display='flex';MOD=bg;var i=bg.querySelector('input:not([type=hidden]),select');if(i)setTimeout(function(){i.focus()},30);}
function closeM(bg){bg=bg||MOD;if(bg&&bg.back){var bk=bg.back;bg.style.display='none';if(bg.tmp)bg.remove();MOD=bk;return;}if(bg){bg.style.display='none';if(bg.tmp)bg.remove();}MOD=null;}
FORMS.forEach(function(F){var inp=$(F.id);if(!inp)return;var card=inp.closest('.card'),sec=card.closest('section'),h3=card.querySelector('h3');
  card.querySelectorAll('button').forEach(function(b){b.remove()});
  var bg=mkBg(),box=document.createElement('div');box.className='mbox';bg.appendChild(box);
  var hd=document.createElement('h3');box.appendChild(hd);[].slice.call(card.children).forEach(function(c){if(c!==h3)box.appendChild(c)});card.remove();
  var ft=document.createElement('div');ft.className='mft';ft.innerHTML='<button class="btn g">ยกเลิก</button><button class="btn">✓ บันทึก</button>';box.appendChild(ft);
  ft.children[0].onclick=function(){window[F.c]();};ft.children[1].onclick=function(){window[F.s]();};
  bg.F=F;bg.hd=hd;
  var add=document.createElement('div');add.className='addbar';add.innerHTML='<button class="btn">+ เพิ่ม'+F.t+'</button>';
  var anchor=sec.querySelector('.card');sec.insertBefore(add,anchor);
  add.firstChild.onclick=function(){window[F.c]();hd.textContent='เพิ่ม'+F.t;openM(bg);};
  var oe=window[F.e];window[F.e]=function(){oe.apply(this,arguments);hd.textContent='แก้ไข'+F.t+' ('+$(F.id).value+')';openM(bg);};
  var oc=window[F.c];window[F.c]=function(){oc.apply(this,arguments);if(MOD===bg)closeM(bg);};});
function popMsg(msg,ok){var bg=mkBg();bg.tmp=1;bg.innerHTML='<div class="mbox sm"><p>'+String(msg).replace(/</g,'&lt;')+'</p><div class="mft">'+(ok?'<button class="btn g">ยกเลิก</button><button class="btn r">✓ ยืนยัน</button>':'<button class="btn">ตกลง</button>')+'</div></div>';
  var bs=bg.querySelectorAll('.mft button');bg.okFn=ok;bs[bs.length-1].onclick=function(){closeM(bg);if(ok)ok();};if(ok)bs[0].onclick=function(){closeM(bg);};openM(bg);bg.style.zIndex=1001;}
window.alert=function(m){var prev=MOD;popMsg(m);if(prev)MOD.back=prev;};
var __ok=false;
window.confirm=function cf(m){if(__ok){__ok=false;return true;}var c=cf.caller,a=c?[].slice.call(c.arguments):[];popMsg(m,function(){__ok=true;try{c&&c.apply(null,a);}finally{__ok=false;}});return false;};
document.addEventListener('keydown',function(e){if(!MOD)return;if(e.key==='Escape'){var b=MOD;if(b.F)window[b.F.c]();else{var bk=b.back;closeM(b);MOD=bk||null;}e.preventDefault();}
  else if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'){var b2=MOD;if(b2.F)window[b2.F.s]();else{var bt=b2.querySelectorAll('.mft button');bt[bt.length-1].click();}e.preventDefault();}});
