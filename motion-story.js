/* =====================================================================
   MOTION STORY · scènes pilotées par le défilement (GSAP ScrollTrigger scrub)
   A. La pièce se vide   B. Galerie avant / après   C. Les étapes (filet or)
   Jamais de pin : section haute + enfant sticky (voir motion-story.css).
   Mouvement réduit ou bibliothèques absentes : rien ne s'anime, état final.
   ===================================================================== */
(function(){
'use strict';
if(!window.MK)return;
MK.ready.then(function(M){
if(!M)return;
var g=M.gsap,ST=M.ST,d=document;
function q(s,r){return (r||d).querySelector(s)}
function qa(s,r){return [].slice.call((r||d).querySelectorAll(s))}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t)}
function pad(n){return n<10?'0'+n:''+n}
function scrollToY(y){
  if(M.lenis)M.lenis.scrollTo(y,{duration:1.1});else window.scrollTo({top:y,behavior:'smooth'});
}

/* ------------------------------------------------------------------
   A. LA PIÈCE SE VIDE
   Une seule ligne de temps de 0 à 1 liée à la progression du défilement
   de la section haute (le stage sticky reste plein cadre).
     0.00 - 0.62  la photo « avant » pousse lentement (zoom)
     0.05 / 0.15  « Rien à organiser. » puis « Rien à porter. » se lèvent
     0.34 - 0.66  le rideau balaie vers l'après, la bande de lumière dorée suit
     0.64 - 0.97  la pièce vide se révèle en recul
     0.66         « Rien à préparer. » s'allume
   Le compteur de progression monte de 0 à 100 % sur toute la scène.
   ------------------------------------------------------------------ */
function scene(){
  /* L'accueil en sept blocs n'a plus cette scene (sa triade « Rien a organiser » vit dans le hero, le film la remplace) :
     sans section .sc la fonction ne fait rien. Elle reste pour un eventuel retour de la scene. */
  var sec=q('.sc');if(!sec)return;
  var room=q('.sc-room',sec),lines=qa('.cl-t',sec),n=q('.sc-n',sec),bar=q('.sc-bar u',sec);
  if(!room||lines.length<3)return;
  var SW=1200,SH=800,NF=7;
  /* sept vraies étapes de la même pièce (f0 = la photo d'origine, f6 = la pièce vide) : chaque meuble qui part
     est un fondu entre deux images au cadrage identique, donc rien d'autre ne bouge */
  var zoom=d.createElement('div');zoom.className='sc-zoom';zoom.setAttribute('aria-hidden','true');
  var frames=[];
  for(var i=0;i<NF;i++){var f=d.createElement('div');f.className='sc-zl sc-zf';frames.push(f);zoom.appendChild(f)}
  room.appendChild(zoom);
  sec.classList.add('sc-live');
  /* les images ne se chargent qu'à l'approche de la scène (version allégée sur mobile) */
  var loaded=false;
  function load(){
    if(loaded)return;loaded=true;
    var sfx=matchMedia('(max-width:700px)').matches?'-m':'';
    frames.forEach(function(f,i){f.style.setProperty('--bg','url('+((window.MK&&MK.base)||'')+'medias/scene-f'+i+sfx+'.webp)')});
  }
  ST.create({trigger:sec,start:'top bottom+=1600',once:true,onEnter:load});
  /* la photo est dimensionnée comme un object-fit:cover, puis déplacée en transform (aucun repaint) */
  var sw=0,sh=0,W=0,H=0;
  function size(){
    sw=room.clientWidth||innerWidth;sh=room.clientHeight||innerHeight;
    var k=Math.max(sw/SW,sh/SH);W=SW*k;H=SH*k;
    zoom.style.width=W+'px';zoom.style.height=H+'px';zoom.style.top=(-(H-sh)*.45)+'px';
  }
  function panX(f){return -Math.max(0,W-sw)*f}
  var narrow=function(){return W-sw>80};
  size();ST.addEventListener('refreshInit',size);
  var prog={v:0};
  function show(){var v=prog.v;
    /* étiquettes d'étape à la place d'un pourcentage ambigu */
    if(n)n.textContent=v<12?'Tout est encore en place':v<42?'Les petits objets partent':v<70?'Les gros meubles partent':v<94?'Il ne reste presque rien':'Maison vide'}
  g.set(frames.slice(1),{opacity:0});
  g.set(lines,{yPercent:118,opacity:0});
  if(bar)g.set(bar,{scaleX:0});
  if(n)n.textContent='Tout est encore en place';
  var tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:M.touch?.5:true,invalidateOnRefresh:true}});
  /* la caméra avance dans la pièce pleine, puis recule quand elle est vide ; sur mobile elle glisse de gauche à droite */
  tl.fromTo(zoom,{scale:1,x:function(){return panX(narrow()?.30:.5)}},
                 {scale:1.12,x:function(){return panX(narrow()?.52:.5)},duration:.55,ease:'sine.inOut'},0)
    .to(zoom,{scale:1,x:function(){return panX(narrow()?.70:.5)},duration:.42,ease:'sine.inOut'},.55);
  /* petits objets, établi, armoire, table de ping-pong, étagère, tapis : une étape après l'autre */
  var order=[[.07,.19],[.19,.31],[.31,.43],[.43,.58],[.58,.74],[.74,.92]];
  for(var k=1;k<NF;k++){tl.to(frames[k],{opacity:1,duration:order[k-1][1]-order[k-1][0],ease:'power2.inOut'},order[k-1][0])}
  var shade=q('.sc-shade',sec);
  if(shade)tl.to(shade,{opacity:.55,duration:.16,ease:'power1.inOut'},.80);   /* la pièce vide se remplit de lumière */
  tl.to(lines[0],{yPercent:0,opacity:1,duration:.09,ease:'power3.out'},.05)
    .to(lines[1],{yPercent:0,opacity:1,duration:.09,ease:'power3.out'},.15)
    .to(lines[2],{yPercent:0,opacity:1,duration:.1,ease:'power3.out'},.76)
    .to(prog,{v:100,duration:.94,ease:'none',onUpdate:show},.02);
  if(bar)tl.to(bar,{scaleX:1,duration:.94,ease:'none'},.02);
  tl.to({},{duration:.04},.96);
}

/* ------------------------------------------------------------------
   B. GALERIE AVANT / APRÈS
   Ordinateur (>= 900 px) : le défilement vertical déplace les cartes
   horizontalement (sticky + translation scrub). Sur chaque carte, un voile
   révèle l'après au passage au centre.
   Mobile : rail natif avec scroll-snap, le voile balaie quand la carte
   arrive au centre (IntersectionObserver, aucune écoute du défilement).
   Le tap « voir l'état de départ » de site.js reste intact.
   ------------------------------------------------------------------ */
function gallery(){
  if(d.documentElement.classList.contains('bx-on'))return;   /* le comparateur à poignée (site.js) remplace la galerie défilante */
  var sec=q('#cartes'),stage=sec&&q('.cg-stage',sec),grid=sec&&q('.rea-grid',sec);
  if(!sec||!stage||!grid)return;
  var cards=qa('.rea',grid);if(cards.length<2)return;
  var N=cards.length,mm=g.matchMedia();

  function makeProg(){
    var p=d.createElement('div');p.className='cg-prog';p.setAttribute('aria-hidden','true');
    p.innerHTML='<span class="cg-i">01</span><span class="cg-b"><u></u></span><span class="cg-t">'+pad(N)+'</span>';
    return p;
  }
  function paint(c,p){
    var win=c._w,img=c._i;
    win.style.transform='translate3d('+(-(1-p)*101).toFixed(3)+'%,0,0)';
    img.style.transform='translate3d('+((1-p)*101).toFixed(3)+'%,0,0)';
    win.style.setProperty('--sv',(Math.sin(Math.PI*p)*1).toFixed(3));
    var on=p>.97;if(on!==c._on){c._on=on;c.classList.toggle('cg-on',on)}
  }
  /* un tap sur une carte encore à l'état de départ révèle d'abord l'après (puis le comportement de site.js reprend) */
  function tapGuard(e){
    var c=e.target.closest&&e.target.closest('.rea');if(!c||c.classList.contains('cg-on'))return;
    e.stopPropagation();e.preventDefault();
    if(sec.classList.contains('cg-scrub')){
      c._force=true;c.classList.add('cg-tr');paint(c,1);
      setTimeout(function(){c.classList.remove('cg-tr')},1000);
    }else c.classList.add('cg-on');
  }

  /* ---------- ordinateur ---------- */
  mm.add('(min-width:900px)',function(){
    var travel=0,gap=0,centers=[],vw=innerWidth,last=[],cur=-1,stageH=0;
    var prog=makeProg(),pi=q('.cg-i',prog),pb=q('.cg-b u',prog);
    sec.classList.add('cg-live','cg-scrub');
    stage.appendChild(prog);
    cards.forEach(function(c){
      c._w=q('.rea-win',c);c._i=q('img',c._w);c._on=false;c._force=false;
      qa('img',c).forEach(function(i){i.loading='eager'});
    });
    function measure(){
      vw=innerWidth;
      travel=Math.max(0,grid.offsetWidth-vw);
      stageH=stage.offsetHeight||innerHeight;
      centers=cards.map(function(c){return c.offsetLeft+c.offsetWidth/2});
      sec.style.setProperty('--cg-h',Math.round(stageH+travel*.75)+'px');
    }
    measure();
    function update(self){
      var x=self.progress*travel,i,best=0,bd=9;
      for(i=0;i<N;i++){
        var dd=(centers[i]-x-vw/2)/vw,ad=Math.abs(dd);
        var rev=cards[i]._force?1:sm((.3-dd)/.3);
        var s=1-.1*sm(ad/.62),o=1-.42*sm(ad/.75);
        var key=rev.toFixed(3)+'|'+s.toFixed(3)+'|'+o.toFixed(2);
        if(last[i]!==key){
          last[i]=key;paint(cards[i],rev);
          cards[i].style.transform='scale('+s.toFixed(4)+')';
          cards[i].style.opacity=o.toFixed(3);
        }
        if(ad<bd){bd=ad;best=i}
      }
      if(best!==cur){cur=best;if(pi)pi.textContent=pad(best+1)}
      if(pb)pb.style.transform='scaleX('+self.progress.toFixed(4)+')';
    }
    var tw=g.to(grid,{x:function(){return -travel},ease:'none',scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,onUpdate:update,onRefresh:update}});
    var st=tw.scrollTrigger;
    function onRefreshInit(){measure()}
    ST.addEventListener('refreshInit',onRefreshInit);
    /* une carte atteinte au clavier vient se placer au centre */
    function onFocus(e){
      var c=e.target.closest&&e.target.closest('.rea');if(!c)return;
      var i=cards.indexOf(c);if(i<0)return;
      var x=st.progress*travel;
      if(Math.abs(centers[i]-x-vw/2)<vw*.28)return;
      var y=st.start+clamp((centers[i]-vw/2)/Math.max(1,travel),0,1)*(st.end-st.start);
      scrollToY(y);
    }
    grid.addEventListener('focusin',onFocus);
    grid.addEventListener('click',tapGuard,true);
    update(st);
    ST.refresh();
    return function(){
      ST.removeEventListener('refreshInit',onRefreshInit);
      grid.removeEventListener('focusin',onFocus);grid.removeEventListener('click',tapGuard,true);
      sec.classList.remove('cg-live','cg-scrub');sec.style.removeProperty('--cg-h');
      if(prog.parentNode)prog.parentNode.removeChild(prog);
      cards.forEach(function(c){
        c.style.transform='';c.style.opacity='';c._w.style.transform='';c._i.style.transform='';
        c._w.style.removeProperty('--sv');c.classList.remove('cg-on','cg-tr');c._force=false;
      });
      grid.style.transform='';
    };
  });

  /* ---------- mobile : rail natif ---------- */
  mm.add('(max-width:899px)',function(){
    var prog=makeProg(),pi=q('.cg-i',prog),pb=q('.cg-b u',prog);
    sec.classList.add('cg-live','cg-rail');
    var view=q('.cg-view',sec);(view||grid.parentNode).appendChild(prog);
    cards.forEach(function(c){c._w=q('.rea-win',c);c._i=q('img',c._w);c._on=false});
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var c=e.target,i=cards.indexOf(c);
        c.classList.add('cg-on');
        if(pi)pi.textContent=pad(i+1);
        if(pb)pb.style.transform='scaleX('+(N>1?i/(N-1):1).toFixed(3)+')';
      });
    },{root:null,rootMargin:'0px -32% 0px -32%',threshold:0});
    cards.forEach(function(c){io.observe(c)});
    if(pb)pb.style.transform='scaleX(0)';
    grid.addEventListener('click',tapGuard,true);
    return function(){
      io.disconnect();grid.removeEventListener('click',tapGuard,true);
      sec.classList.remove('cg-live','cg-rail');
      if(prog.parentNode)prog.parentNode.removeChild(prog);
      cards.forEach(function(c){c.classList.remove('cg-on','cg-tr')});
    };
  });
}

/* ------------------------------------------------------------------
   C. LES ÉTAPES : un filet or vertical qui se dessine au scroll (scrub).
   Chaque étape s'allume et entre en cascade quand le filet l'atteint.
   Le filet est collant à gauche pendant que les cartes s'empilent.
   ------------------------------------------------------------------ */
function steps(){
  var sec=q('.steps-sec'),stack=sec&&q('.stack',sec),cards=sec&&qa('.stack-card',stack);
  if(!sec||!stack||!cards||cards.length<2)return;
  var N=cards.length,rail=d.createElement('div');
  var nodes='';for(var k=0;k<N;k++)nodes+='<i class="st-node"></i>';
  rail.className='st-rail';rail.setAttribute('aria-hidden','true');
  rail.innerHTML='<div class="st-in"><i class="st-track"></i><i class="st-line"></i><i class="st-tip"></i>'+nodes+'</div>';
  stack.appendChild(rail);   /* en dernier : les :nth-child des cartes restent intacts */
  var inner=q('.st-in',rail),line=q('.st-line',rail),tip=q('.st-tip',rail),dots=qa('.st-node',rail);
  sec.classList.add('st-live');
  var H=320,stepLen=400;
  function measure(){
    var h=cards[0].offsetHeight,mb=parseFloat(getComputedStyle(cards[0]).marginBottom)||0;
    var topA=parseFloat(getComputedStyle(cards[0]).top)||112,topB=parseFloat(getComputedStyle(cards[N-1]).top)||topA+26*(N-1);
    H=Math.round(h+(topB-topA));
    stepLen=h+mb;
    inner.style.top=topA+'px';
    rail.style.setProperty('--st-h',H+'px');
    inner.style.setProperty('--st-h',H+'px');
    dots.forEach(function(dt,i){dt.style.top=(N>1?i/(N-1)*H:0)-5+'px'});
  }
  measure();
  /* chaque carte : état éteint, puis cascade quand le filet l'atteint */
  var tls=cards.map(function(c,i){
    var h3=q('h3,h4',c),p=q('p',c),big=q('.bignum',c);
    var bn=parseFloat(getComputedStyle(big||c).opacity)||.09;
    g.set([h3,p],{opacity:.7,y:22});   /* etat eteint : la couleur finale, un peu moins opaque (contraste 4,5 pour 1 conserve) */
    if(big)g.set(big,{opacity:0,scale:.86,transformOrigin:'80% 50%'});
    var tl=g.timeline({paused:true,defaults:{ease:'power3.out'}});
    tl.to(h3,{opacity:1,y:0,duration:.7},0).to(p,{opacity:1,y:0,duration:.8},.14);
    if(big)tl.to(big,{opacity:bn,scale:1,duration:1.1},.05);
    c._tl=tl;c._lit=false;
    return tl;
  });
  g.set(line,{scaleY:0});g.set(tip,{y:0});
  function setLit(i,on){
    var c=cards[i];if(c._lit===on)return;c._lit=on;
    c.classList.toggle('st-lit',on);dots[i].classList.toggle('on',on);
    if(on)c._tl.timeScale(1).play();else c._tl.timeScale(1.6).reverse();
  }
  ST.create({
    trigger:stack,start:'top 62%',
    end:function(){return '+='+Math.max(200,(N-1)*stepLen)},
    scrub:true,invalidateOnRefresh:true,
    onRefreshInit:measure,
    onUpdate:function(self){
      var p=self.progress;
      g.set(line,{scaleY:p});g.set(tip,{y:p*H});
      for(var i=0;i<N;i++)setLit(i,p*(N-1)>=i-.02);
    },
    onRefresh:function(self){
      var p=self.progress;
      g.set(line,{scaleY:p});g.set(tip,{y:p*H});
      for(var i=0;i<N;i++)setLit(i,p*(N-1)>=i-.02);
    }
  });
  addEventListener('load',function(){setTimeout(function(){measure();ST.refresh()},300)});
}

try{scene()}catch(e){var s=q('.sc');if(s)s.classList.remove('sc-live');if(window.console)console.warn('story scene',e)}
try{gallery()}catch(e){var c=q('#cartes');if(c)c.classList.remove('cg-live','cg-scrub','cg-rail');if(window.console)console.warn('story gallery',e)}
try{steps()}catch(e){var t=q('.steps-sec');if(t)t.classList.remove('st-live');if(window.console)console.warn('story steps',e)}
function fix(){ST.refresh()}
/* Lien avec ancre (#zones, #faq, #garanties...) : les hauteurs des scenes (galerie, etapes) ne sont posees qu'apres le
   chargement, le navigateur a donc place l'ancre trop tot. On la recale deux fois, sauf si la visiteuse a deja bouge. */
(function(){
  var id=(location.hash||'').slice(1),moved=false;if(!id)return;
  ['wheel','touchstart','keydown','mousedown'].forEach(function(e){addEventListener(e,function(){moved=true},{once:true,passive:true})});
  function recale(){
    if(moved)return;var el=d.getElementById(id);if(!el)return;
    var top=el.getBoundingClientRect().top;if(Math.abs(top)<=24)return;
    var y=top+(window.scrollY||0);
    window.__ldfRecale=true;setTimeout(function(){window.__ldfRecale=false},250);   /* l'en-tete ne reagit pas a ce petit saut vers le haut */
    if(M.lenis)M.lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y);
  }
  addEventListener('load',function(){setTimeout(recale,1000);setTimeout(recale,2400)});
})();
addEventListener('load',function(){setTimeout(fix,400)});
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){setTimeout(fix,50)});
});
})();
