var LS=(function(){var m={};try{localStorage.setItem('_t','1');localStorage.removeItem('_t');return localStorage;}catch(e){return {getItem:function(k){return k in m?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]}};}})();
var DB;try{DB=JSON.parse(LS.getItem('loanman')||'null')}catch(e){}if(!DB||!DB.debtors)DB={debtors:[],txns:[]};var cur=LS.getItem('loanman_cur')||'',CH={};
function save(){LS.setItem('loanman',JSON.stringify(DB));}
