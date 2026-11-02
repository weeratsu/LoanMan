try{if(typeof Chart!=='undefined'){Chart.defaults.font.family="'Noto Sans Thai','Inter','Segoe UI',Roboto,sans-serif";}}catch(e){}
var tab='dash';
function render(){LS.setItem('loanman_cur',cur);renderSel();({dash:renderDash,debtors:renderDebtors,txns:renderTxns,people:renderPeople,setup:renderSetup,period:renderPeriod,pred:function(){$('pAmt').value='';renderPred()},data:function(){}})[tab]();}
function go(t){tab=t;document.querySelectorAll('#nav button').forEach(function(x){x.classList.toggle('on',x.dataset.t===t)});document.querySelectorAll('main>section').forEach(function(s){s.classList.toggle('hide',s.id!=='t-'+t)});var w=$('selWrap');if(w)w.style.visibility=(t==='period'||t==='pred')?'visible':'hidden';safeRender();}
function safeRender(){try{render();reSort();tsInit();}catch(e){console.error(e);var b=document.getElementById('errbar');if(b){b.textContent='⚠ '+e.message;b.style.display='block';}}}
document.getElementById('nav').addEventListener('click',function(ev){var b=ev.target.closest('button[data-t]');if(b)go(b.dataset.t);});
$('selD').onchange=function(){cur=this.value;safeRender();};
migrate();save();try{clearTxn();}catch(e){}go(tab);
