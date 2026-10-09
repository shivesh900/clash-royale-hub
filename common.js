(function(){
var byId={};
(window.CR_CARDS||[]).forEach(function(c){byId[c.id]=c;});
var alias=window.CR_ALIAS||{};
function card(id){id=Number(id);return byId[id]||byId[alias[id]]||null;}
function img(c,variant){
  var dir=variant==='evo'&&c.evo?'evo':variant==='hero'&&c.hero?'hero':'cards';
  return 'img/'+dir+'/'+c.id+'.webp';
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
function avg(cards){var e=cards.filter(function(c){return typeof c.elixir==='number';});if(!e.length)return 0;return e.reduce(function(s,c){return s+c.elixir;},0)/e.length;}
function cycle(cards){var e=cards.filter(function(c){return typeof c.elixir==='number';}).map(function(c){return c.elixir;}).sort(function(a,b){return a-b;});return e.slice(0,4).reduce(function(s,x){return s+x;},0);}
// Official in-game deck import link (same format RoyaleAPI and the game's own share button use).
function gameLink(ids,tower){return 'https://link.clashroyale.com/en/?clashroyale://copyDeck?deck='+ids.join(';')+'&l=Royals&tt='+(tower||159000000);}
function builderLink(ids,tower){var u='./?deck='+ids.join(';');if(tower&&Number(tower)!==159000000)u+='&tt='+tower;return u;}
function toast(msg){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('show');},1800);}
window.CR={card:card,img:img,esc:esc,avg:avg,cycle:cycle,gameLink:gameLink,builderLink:builderLink,toast:toast,byId:byId};
})();
