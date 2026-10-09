(function(){
var CR=window.CR,P=window.CR_PLAYER,B=window.CR_BATTLES||[],M=window.CR_PLAYER_META||{};
var root=document.getElementById('statsRoot');
var TROPHY='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 6h32v8h10v8c0 9-7 15-14 16-2 5-6 8-10 9v7h10v6H20v-6h10v-7c-4-1-8-4-10-9C13 37 6 31 6 22v-8h10z" fill="#ffcf3f" stroke="#000" stroke-width="3.5" stroke-linejoin="round"/><path d="M12 18v4c0 5 3 9 7 10M52 18v4c0 5-3 9-7 10" fill="none" stroke="#000" stroke-width="3"/></svg>';
function fmt(n){return n==null?'–':Number(n).toLocaleString('en-IN');}
function parseT(s){if(!s)return null;var m=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(s);return m?new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5],+m[6])):new Date(s);}
function ago(d){if(!d)return '';var s=(Date.now()-d.getTime())/1000;if(s<90)return 'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';return Math.round(s/86400)+' d ago';}
function stat(v,l){return '<div class="stat"><div class="v">'+v+'</div><div class="l">'+l+'</div></div>';}
if(!P){
  root.innerHTML='<section class="panel"><div class="notice"><h2>Stats are almost live</h2>'+
  '<p>This page reads <b>'+CR.esc(M.tag||'#88GUYV9J9')+'</b> from Supercell’s official Clash Royale API. A GitHub Action in this repo fetches it every few hours and saves it here — it just needs an API key first.</p>'+
  '<ol><li>Create a free key at <a href="https://developer.clashroyale.com" rel="noopener">developer.clashroyale.com</a> with allowed IP <code>45.79.218.79</code> (the RoyaleAPI proxy the Action uses).</li>'+
  '<li>In this repo: Settings → Secrets and variables → Actions → New secret named <code>CR_API_TOKEN</code>, paste the key.</li>'+
  '<li>Actions → “Update Clash stats” → Run workflow. Done.</li></ol></div></section>';
  return;
}
var deckIds=(P.currentDeck||[]).map(function(c){return c.id;});
var w=P.wins||0,l=P.losses||0,wr=w+l?Math.round(w*100/(w+l)):0;
var html='';
html+='<section class="panel" aria-labelledby="pn"><div class="hero-card"><div class="lvl" title="King level"><span>'+fmt(P.expLevel)+'</span></div><div><h1 class="pname" id="pn">'+CR.esc(P.name)+'</h1><div class="ptag">'+CR.esc(P.tag)+'</div>'+
  (P.clan?'<div class="clanline">🛡️ '+CR.esc(P.clan.name)+(P.role?' <span class="muted">· '+CR.esc(P.role.replace(/([A-Z])/g,' $1').toLowerCase())+'</span>':'')+'</div>':'<div class="clanline muted">No clan</div>')+'</div></div>'+
  '<div class="trophybig">'+TROPHY+fmt(P.trophies)+'</div><div class="arena">'+CR.esc(P.arena&&P.arena.name||'')+'</div>'+
  '<div class="kv">'+stat(fmt(P.bestTrophies),'Best trophies')+stat(fmt(w),'Wins')+stat(fmt(l),'Losses')+stat(fmt(P.threeCrownWins),'3-crown wins')+'</div>'+
  '<div class="wr" role="img" aria-label="Win rate '+wr+'%"><i style="width:'+wr+'%"></i></div><p class="small muted" style="margin:6px 0 0">'+wr+'% win rate over '+fmt(P.battleCount)+' battles'+(M.updated?' · updated '+ago(new Date(M.updated)):'')+'</p></section>';
if(deckIds.length){
  var cards=(P.currentDeck||[]).map(function(pc){return CR.card(pc.id)||{elixir:pc.elixirCost};});
  html+='<section class="panel" aria-labelledby="cd"><div class="panel-h"><h2 id="cd">Current Deck</h2><span class="muted small">'+CR.avg(cards).toFixed(1)+' avg ⚡ · cycle '+CR.cycle(cards)+'</span></div><div class="deck">'+
   (P.currentDeck||[]).map(function(pc,i){var c=CR.card(pc.id);if(!c)return '<div class="slot filled"><span class="card"><img src="'+CR.esc(pc.iconUrls&&pc.iconUrls.medium||'')+'" alt="'+CR.esc(pc.name)+'"><span class="elixir">'+(pc.elixirCost==null?'?':pc.elixirCost)+'</span></span></div>';var v=(i<2&&pc.evolutionLevel&&c.evo)?'evo':'cards';
     return '<div class="slot filled">'+(v==='evo'?'<span class="tag">EVO</span>':'')+'<span class="card"><img src="'+CR.img(c,v)+'" alt="'+CR.esc(c.name)+'"><span class="elixir">'+(c.elixir==null?'?':c.elixir)+'</span>'+(pc.level&&pc.maxLevel?'<span class="badge">Lv '+(pc.level+16-pc.maxLevel)+'</span>':'')+'</span></div>';}).join('')+
   '</div><div class="actions"><a class="btn" href="'+CR.builderLink(deckIds)+'">🛠️ Open in builder</a><a class="btn gold" href="'+CR.gameLink(deckIds)+'">⚔️ Copy to game</a></div></section>';
}
if(B.length){
  html+='<section class="panel" aria-labelledby="rb"><div class="panel-h"><h2 id="rb">Recent Battles</h2><span class="muted small">last '+Math.min(B.length,15)+'</span></div><ul class="battles">'+
  B.slice(0,15).map(function(b){var me=(b.team||[])[0]||{},op=(b.opponent||[])[0]||{};var mc=me.crowns||0,oc=op.crowns||0;var r=mc>oc?'win':mc<oc?'loss':'draw';
    var mode=(b.gameMode&&b.gameMode.name||b.type||'').replace(/_/g,' ');var tc=me.trophyChange;
    return '<li class="battle '+r+'"><span class="bar"></span><div><div class="res">'+(r==='win'?'Victory':r==='loss'?'Defeat':'Draw')+'</div><div class="meta">vs '+CR.esc(op.name||'?')+' · '+CR.esc(mode)+' · '+ago(parseT(b.battleTime))+'</div></div><div><div class="crowns">'+mc+' – '+oc+'</div>'+(tc!=null?'<div class="delta" style="color:'+(tc>=0?'var(--green)':'var(--red)')+'">'+(tc>0?'+':'')+tc+' 🏆</div>':'')+'</div></li>';}).join('')+'</ul></section>';
}
root.innerHTML=html;
})();
