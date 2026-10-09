(function(){
var CR=window.CR, CARDS=window.CR_CARDS||[], TOWERS=window.CR_TOWERS||[];
var state={deck:[],tower:159000000,q:'',elixir:'all',rarity:'all',type:'all'};
var $=function(id){return document.getElementById(id);};
var RAR=['common','rare','epic','legendary','champion'];
var RCOL={common:'#c9d6e8',rare:'#ff9f43',epic:'#c56cf0',legendary:'#4ff0e6',champion:'#ffd447'};

function readUrl(){
  var p=new URLSearchParams(location.search);
  var d=(p.get('deck')||'').split(/[;,]/).map(Number).filter(Boolean);
  var seen={};
  d.forEach(function(id){var c=CR.card(id);if(c&&!seen[c.id]&&state.deck.length<8){seen[c.id]=1;state.deck.push(c.id);}});
  var tt=Number(p.get('tt'));if(TOWERS.some(function(t){return t.id===tt;}))state.tower=tt;
}
function writeUrl(){
  var u=state.deck.length?CR.builderLink(state.deck,state.tower):'./';
  try{history.replaceState(null,'',u);}catch(e){}
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function chips(el,items,key){
  el.innerHTML='';
  items.forEach(function(it){
    var b=document.createElement('button');b.type='button';b.className='chip';
    b.innerHTML=(it.dot?'<span class="dot" style="background:'+it.dot+'"></span>':'')+CR.esc(it.label);
    b.setAttribute('aria-pressed',String(state[key]===it.v));
    b.addEventListener('click',function(){state[key]=it.v;chips(el,items,key);renderGrid();});
    el.appendChild(b);
  });
}
function filtered(){
  var q=state.q.trim().toLowerCase();
  return CARDS.filter(function(c){
    if(q&&c.name.toLowerCase().indexOf(q)<0)return false;
    if(state.elixir!=='all'){
      if(state.elixir==='7+'){if(!(c.elixir>=7))return false;}
      else if(state.elixir==='?'){if(c.elixir!=null)return false;}
      else if(c.elixir!==Number(state.elixir))return false;
    }
    if(state.rarity!=='all'&&c.rarity!==state.rarity)return false;
    if(state.type!=='all'){
      if(state.type==='win'||state.type==='air'){if(c.roles.indexOf(state.type)<0)return false;}
      else if(c.type!==state.type)return false;
    }
    return true;
  }).sort(function(a,b){return (a.elixir==null?99:a.elixir)-(b.elixir==null?99:b.elixir)||RAR.indexOf(a.rarity)-RAR.indexOf(b.rarity)||a.name.localeCompare(b.name);});
}
function renderGrid(){
  var list=filtered(), g=$('grid');
  $('shown').textContent=list.length+' of '+CARDS.length;
  if(!list.length){g.innerHTML='<p class="empty">No cards match. Try clearing a filter.</p>';return;}
  g.innerHTML=list.map(function(c){
    var on=state.deck.indexOf(c.id)>=0;
    return '<div class="pick r-'+c.rarity+'"><button type="button" class="card" data-id="'+c.id+'" aria-pressed="'+on+'" aria-label="'+CR.esc(c.name)+', '+(c.elixir==null?'?':c.elixir)+' elixir, '+c.rarity+'">'+
      '<img loading="lazy" src="'+CR.img(c)+'" alt="" width="150" height="221"><span class="elixir">'+(c.elixir==null?'?':c.elixir)+'</span>'+
      (c.evo?'<span class="badge">EVO</span>':c.hero?'<span class="badge hero">HERO</span>':'')+
      '</button><span class="rbar"></span><span class="name">'+CR.esc(c.name)+'</span></div>';
  }).join('');
}
function toggle(id){
  var i=state.deck.indexOf(id);
  if(i>=0)state.deck.splice(i,1);
  else{ if(state.deck.length>=8){CR.toast('Deck is full — tap a card in your deck to remove it');return;} state.deck.push(id);}
  renderAll();
}
function renderDeck(){
  var d=$('deck'),cards=state.deck.map(CR.card),html='';
  for(var i=0;i<8;i++){
    var c=cards[i];
    if(c){
      var v=(i<2&&c.evo)?'evo':'cards';
      html+='<div class="slot filled r-'+c.rarity+'">'+(v==='evo'?'<span class="tag">EVO</span>':'')+
        '<button type="button" class="card" data-remove="'+c.id+'" aria-label="Remove '+CR.esc(c.name)+'"><img src="'+CR.img(c,v)+'" alt="'+CR.esc(c.name)+'" width="150" height="221"><span class="elixir">'+(c.elixir==null?'?':c.elixir)+'</span></button>'+
        '<button type="button" class="x" data-remove="'+c.id+'" aria-label="Remove '+CR.esc(c.name)+'">×</button></div>';
    } else html+='<div class="slot"><span class="num">'+(i+1)+'</span></div>';
  }
  d.innerHTML=html;
  $('count').textContent=cards.length+'/8'+(cards.length<8?' · slots 1–2 show evolutions':'');
  var a=CR.avg(cards);$('avg').textContent=a.toFixed(1);$('dockAvg').textContent=a.toFixed(1)+' ⚡';
  $('cycle').textContent=cards.length>=4?CR.cycle(cards):'–';
  $('mini').innerHTML=Array.from({length:8},function(_,i){var c=cards[i];return c?'<img src="'+CR.img(c)+'" alt="'+CR.esc(c.name)+'">':'<i></i>';}).join('');
  // balance
  var n=function(f){return cards.filter(f).length;};
  var win=n(function(c){return c.roles.indexOf('win')>=0;}),
      spells=n(function(c){return c.type==='spell';}),
      small=n(function(c){return c.roles.indexOf('smallspell')>=0;}),
      big=n(function(c){return c.roles.indexOf('bigspell')>=0&&c.type==='spell';}),
      air=n(function(c){return c.roles.indexOf('air')>=0;}),
      bld=n(function(c){return c.type==='building';});
  var full=cards.length===8;
  var rows=[['👑','Win condition',win,win>=1],['🔥','Spells',spells,spells>=1&&spells<=3],['🛡️','Air defense',air,air>=2],['🏰','Buildings',bld,true]];
  $('balance').innerHTML=rows.map(function(r){var cls=!cards.length?'':(r[3]?'ok':(full?'warn':''));return '<div class="bal '+cls+'"><span class="ic" aria-hidden="true">'+r[0]+'</span>'+r[1]+'<span class="n">'+r[2]+'</span></div>';}).join('');
  var tips=[];
  if(full){
    if(!win)tips.push('No win condition — add something that hits towers (Hog Rider, Giant, Miner, Balloon…).');
    if(air<2)tips.push('Only '+air+' card'+(air===1?'':'s')+' that hit air. Balloon and Lava decks will hurt — aim for 2+.');
    if(!spells)tips.push('No spells. Most decks want at least one small spell (Zap, Log, Arrows…).');
    else if(!small)tips.push('No small spell for swarms — think Zap, The Log, Arrows or Snowball.');
    if(spells>3)tips.push(spells+' spells is a lot — you may lack defenders.');
    if(a>4.3)tips.push('Heavy deck ('+a.toFixed(1)+' avg). Expect slow cycles; play patient.');
    if(a<2.8)tips.push('Super fast cycle ('+a.toFixed(1)+' avg). Out-cycle their counters.');
    if(!tips.length)tips.push('Looks balanced. Go win some crowns. 👑');
  }
  $('tips').innerHTML=tips.map(function(t,i){return '<li class="'+(t.indexOf('Looks balanced')===0||t.indexOf('Super fast')===0?'good':'')+'">'+CR.esc(t)+'</li>';}).join('');
  var cg=$('copyGame');
  if(full){cg.href=CR.gameLink(state.deck,state.tower);cg.removeAttribute('aria-disabled');cg.textContent='⚔️ Copy to Clash Royale';}
  else{cg.href='#';cg.setAttribute('aria-disabled','true');cg.textContent='⚔️ Pick '+(8-cards.length)+' more card'+(8-cards.length===1?'':'s');}
}
function renderAll(){renderDeck();renderGrid();writeUrl();}

function init(){
  readUrl();
  var sel=$('tower');
  sel.innerHTML=TOWERS.map(function(t){return '<option value="'+t.id+'">'+CR.esc(t.name)+'</option>';}).join('');
  sel.value=String(state.tower);
  sel.addEventListener('change',function(){state.tower=Number(sel.value);renderAll();});
  chips($('elixirChips'),[{v:'all',label:'All elixir'}].concat([1,2,3,4,5,6].map(function(e){return {v:String(e),label:e+'⚡'};})).concat([{v:'7+',label:'7+⚡'}]),'elixir');
  chips($('rarityChips'),[{v:'all',label:'All rarities'}].concat(RAR.map(function(r){return {v:r,label:cap(r),dot:RCOL[r]};})),'rarity');
  chips($('typeChips'),[{v:'all',label:'All types'},{v:'troop',label:'Troops'},{v:'spell',label:'Spells'},{v:'building',label:'Buildings'},{v:'win',label:'Win conditions'},{v:'air',label:'Hits air'}],'type');
  $('q').addEventListener('input',function(e){state.q=e.target.value;renderGrid();});
  $('grid').addEventListener('click',function(e){var b=e.target.closest('[data-id]');if(b)toggle(Number(b.dataset.id));});
  $('deck').addEventListener('click',function(e){var b=e.target.closest('[data-remove]');if(b)toggle(Number(b.dataset.remove));});
  $('clear').addEventListener('click',function(){state.deck=[];renderAll();});
  $('random').addEventListener('click',function(){
    var pool=CARDS.slice(),pick=[],need={win:1,air:2,spell:1};
    function take(f){var opts=pool.filter(function(c){return pick.indexOf(c)<0&&f(c);});if(opts.length)pick.push(opts[Math.floor(Math.random()*opts.length)]);}
    take(function(c){return c.roles.indexOf('win')>=0&&c.type!=='spell';});
    take(function(c){return c.roles.indexOf('smallspell')>=0;});
    take(function(c){return c.roles.indexOf('bigspell')>=0&&c.type==='spell';});
    take(function(c){return c.roles.indexOf('air')>=0;});take(function(c){return c.roles.indexOf('air')>=0;});
    while(pick.length<8)take(function(c){return c.type!=='spell'&&c.roles.indexOf('win')<0&&c.rarity!=='champion';});
    state.deck=pick.map(function(c){return c.id;});renderAll();CR.toast('Random deck rolled 🎲');
  });
  $('share').addEventListener('click',function(){
    if(!state.deck.length){CR.toast('Add some cards first');return;}
    var url=new URL(CR.builderLink(state.deck,state.tower),location.href).href;
    var names=state.deck.map(function(id){return CR.card(id).name;}).join(', ');
    if(navigator.share){navigator.share({title:'My Clash Royale deck',text:names,url:url}).catch(function(){});}
    else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){CR.toast('Deck link copied');});}
    else prompt('Copy this link',url);
  });
  renderAll();
}
init();
})();
