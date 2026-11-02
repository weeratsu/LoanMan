/* ช่องค้นหาทุกตาราง (ใน .tw ที่มี id) — หลายคำ = AND, Esc = ล้าง, แถวรวม (tot) ไม่ถูกซ่อน */
var TSQ={};
function tsApply(c){var q=(TSQ[c.id]||'').toLowerCase().trim().split(/\s+/).filter(Boolean),n=0,all=0;
  c.querySelectorAll('tr').forEach(function(r,i){if(r.querySelector('th')||r.classList.contains('tot'))return;all++;
    var t=r.textContent.toLowerCase(),ok=q.every(function(w){return t.indexOf(w)>=0});r.style.display=ok?'':'none';if(ok)n++;});
  var cnt=document.getElementById('tsc_'+c.id);if(cnt)cnt.textContent=q.length?n+' / '+all:'';}
function tsInit(){document.querySelectorAll('.tw[id]').forEach(function(c){if(c.id==='pTbl')return;
  if(!document.getElementById('ts_'+c.id)){var w=document.createElement('div');w.className='tsbar';
    w.innerHTML='<input id="ts_'+c.id+'" placeholder="🔍 ค้นหาในตารางนี้…"><span class="muted" id="tsc_'+c.id+'"></span>';
    c.parentNode.insertBefore(w,c);var i=w.firstChild;
    i.oninput=function(){TSQ[c.id]=i.value;tsApply(c);};
    i.onkeydown=function(e){if(e.key==='Escape'){i.value='';TSQ[c.id]='';tsApply(c);e.stopPropagation();}};}
  tsApply(c);});}
