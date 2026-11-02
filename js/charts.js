/* ---- UI ---- */
function chart(id,cfg){if(typeof Chart==='undefined')return;try{if(CH[id])CH[id].destroy();CH[id]=new Chart($(id),cfg);}catch(e){console.error(e);}}
var COL=['#2a64b8','#e67e22','#27ae60','#8e44ad','#c0392b','#16a085','#d35400','#2c3e50'];
