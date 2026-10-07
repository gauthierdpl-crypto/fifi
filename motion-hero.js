/* =====================================================================
   MOTION HERO : ouverture (rideau), titre par masques, video qui respire,
   parallaxe souris, balayage de lumiere, sortie scrubbee, curseur or,
   boutons magnetiques, filet de progression.
   Regles : jamais de pin, transform et opacity seulement, rien ne capte un tap,
   mouvement reduit = rien (MK.ready vaut null). Sans GSAP : page statique complete.
   ===================================================================== */
(function(){
'use strict';
var d=document,h=d.documentElement,MK=window.MK;
if(!MK)return;
var hero=d.querySelector('.hero');
var now=function(){return(window.performance&&performance.now)?performance.now():Date.now()};
var T0=now();

/* ------------------------------------------------------------------
   A. Rideau d'ouverture : WAAPI pur (ne depend pas de GSAP), 1,1 s,
      une seule fois par session, jamais un tap capte.
   ------------------------------------------------------------------ */
var curtain=null,REVEAL_AT=0; /* instant (ms depuis T0) ou le hero commence a se reveler */
(function(){
  if(MK.RM||!hero||!d.body||!('animate' in Element.prototype))return;
  var first=false;
  try{
    if(!sessionStorage.getItem('ldf_mk_open')){first=true;sessionStorage.setItem('ldf_mk_open','1')}
  }catch(e){first=false}
  if(!first||location.hash||(window.scrollY||0)>40)return;
  var c=d.createElement('div');c.className='mkh-cv';c.setAttribute('aria-hidden','true');
  c.style.pointerEvents='none';
  c.innerHTML='<div class="mkh-cv-t"></div><div class="mkh-cv-b"></div>'
    +'<div class="mkh-cv-mid"><img src="'+((window.MK&&MK.base)||'')+'medias/logo-ldf-emblem-white-s.webp" alt="" width="72" height="85" decoding="async"><i class="mkh-cv-line"></i></div>';
  d.body.appendChild(c);curtain=c;
  var q=function(s){return c.querySelector(s)};
  var t=q('.mkh-cv-t'),b=q('.mkh-cv-b'),mid=q('.mkh-cv-mid'),ln=q('.mkh-cv-line'),im=q('img');
  var open='cubic-bezier(.76,0,.24,1)',out='cubic-bezier(.16,1,.3,1)',F='both';
  ln.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:480,delay:40,easing:out,fill:F});
  im.animate([{opacity:0,transform:'translateY(10px) scale(.94)'},{opacity:1,transform:'none'}],{duration:460,delay:40,easing:out,fill:F});
  t.animate([{transform:'translateY(0)'},{transform:'translateY(-101%)'}],{duration:560,delay:520,easing:open,fill:F});
  b.animate([{transform:'translateY(0)'},{transform:'translateY(101%)'}],{duration:560,delay:520,easing:open,fill:F});
  mid.animate([{opacity:1},{opacity:0}],{duration:300,delay:500,easing:'ease-in',fill:F});
  REVEAL_AT=700;
  var gone=false;
  function rm(){if(gone)return;gone=true;if(c.parentNode)c.parentNode.removeChild(c);curtain=null}
  setTimeout(rm,1130);      /* fin normale */
  setTimeout(rm,1500);      /* filet de securite absolu */
})();

/* ------------------------------------------------------------------
   D. Filet de progression (fin, or, 2 px) : pilote par GSAP ScrollTrigger
   ------------------------------------------------------------------ */
function progressBar(M){
  var bar=d.createElement('div');bar.className='mkh-bar';bar.setAttribute('aria-hidden','true');
  d.body.appendChild(bar);
  M.ST.create({start:0,end:'max',onUpdate:function(s){bar.style.transform='scaleX('+s.progress.toFixed(4)+')'}});
}

/* ------------------------------------------------------------------
   C1. Curseur (pointeur fin uniquement)
   ------------------------------------------------------------------ */
function cursor(M){
  if(!MK.fine)return;
  var g=M.gsap,c=d.createElement('div');c.className='mkh-cur is-off';c.setAttribute('aria-hidden','true');
  c.innerHTML='<i class="mkh-cur-r"></i><span class="mkh-cur-t">Appeler</span>';
  d.body.appendChild(c);
  var xTo=g.quickTo(c,'x',{duration:.5,ease:'power3.out'}),yTo=g.quickTo(c,'y',{duration:.5,ease:'power3.out'});
  var seen=false,SEL='a[href],button,[role="button"],summary,label[for],select,.btn,.fab-call,.fab-wa';
  addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse')return;
    if(!seen){seen=true;g.set(c,{x:e.clientX,y:e.clientY});c.classList.remove('is-off')}
    xTo(e.clientX);yTo(e.clientY);
  },{passive:true});
  d.addEventListener('pointerover',function(e){
    var t=e.target&&e.target.closest?e.target:null;if(!t)return;
    var el=t.closest(SEL),txt=t.closest('input,textarea');
    c.classList.toggle('is-txt',!!txt);
    c.classList.toggle('is-link',!!el&&!txt);
    var tel=el&&el.getAttribute&&/^tel:/i.test(el.getAttribute('href')||'');
    c.classList.toggle('is-tel',!!tel);
  },{passive:true});
  d.documentElement.addEventListener('mouseleave',function(){c.classList.add('is-off')});
  d.documentElement.addEventListener('mouseenter',function(){if(seen)c.classList.remove('is-off')});
  addEventListener('pointerdown',function(){c.classList.add('is-dn')},{passive:true});
  addEventListener('pointerup',function(){c.classList.remove('is-dn')},{passive:true});
  addEventListener('blur',function(){c.classList.add('is-off')});
  h.classList.add('mkh-cursor');
}

/* ------------------------------------------------------------------
   C2. Boutons magnetiques (6 px maximum, zone cliquable intacte au repos)
   ------------------------------------------------------------------ */
function magnets(M){
  if(!MK.fine)return;
  var g=M.gsap,list=[].slice.call(d.querySelectorAll('.btn-lg,.hero .btn,.final .btn,.cta-band .btn'));
  list=list.filter(function(el,i){return list.indexOf(el)===i&&!el.closest('header,.navmenu,.fab-bar,#ldf-cookie')});
  if(!list.length)return;
  list.forEach(function(el){el.classList.add('mkh-mag');el._mx=0;el._my=0;el._on=false});
  var MAXD=6,PAD=34;
  function park(el){
    if(!el._on)return;el._on=false;
    g.to(el,{x:0,y:0,duration:.6,ease:'elastic.out(1,.55)',overwrite:true,onComplete:function(){if(!el._on)g.set(el,{clearProps:'transform'})}});
  }
  addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse')return;
    for(var i=0;i<list.length;i++){
      var el=list[i],r=el.getBoundingClientRect();
      if(r.bottom<-PAD||r.top>innerHeight+PAD){park(el);continue}
      var cx=r.left+r.width/2-(el._mx||0),cy=r.top+r.height/2-(el._my||0);
      var inside=e.clientX>r.left-PAD&&e.clientX<r.right+PAD&&e.clientY>r.top-PAD&&e.clientY<r.bottom+PAD;
      if(inside){
        var tx=Math.max(-MAXD,Math.min(MAXD,(e.clientX-cx)*.2)),ty=Math.max(-MAXD,Math.min(MAXD,(e.clientY-cy)*.26));
        el._on=true;el._mx=tx;el._my=ty;
        g.to(el,{x:tx,y:ty,duration:.35,ease:'power3.out',overwrite:true});
      }else{el._mx=0;el._my=0;park(el)}
    }
  },{passive:true});
  d.documentElement.addEventListener('mouseleave',function(){list.forEach(park)});
  list.forEach(function(el){
    el.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')g.to(el,{scale:.975,duration:.12,overwrite:'auto'})});
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){
      el.addEventListener(ev,function(){if(el._on||el._sc){g.to(el,{scale:1,duration:.3,ease:'power3.out',overwrite:'auto'})}});
    });
  });
}

/* ------------------------------------------------------------------
   B. Hero
   ------------------------------------------------------------------ */
function heroScene(M){
  var g=M.gsap,ST=M.ST;
  var vid=hero.querySelector('.hero-media')||hero.querySelector('.hero-vid'),bg=hero.querySelector('.hero-bg'),grid=hero.querySelector('.hero-grid'),
      col=grid&&grid.querySelector(':scope>div'),h1=hero.querySelector('h1'),sub=hero.querySelector('.hero-sub'),
      proof=hero.querySelector('.hero-proof'),cta=hero.querySelector('.hero-cta'),dispo=hero.querySelector('.dispo'),
      photo=hero.querySelector('.hero-photo'),triade=hero.querySelector('.hero-triade'),roll=h1&&h1.querySelector('.rot-roll'),stars=hero.querySelector('.hp-stars');
  if(!h1||!col||!grid){h.classList.add('mkh-live');return}
  var dawn=hero.querySelector('.mkh-dawn');
  var small=!MK.wide;
  /* connexion lente : si GSAP arrive apres le filet de securite CSS, la page est deja affichee, on ne la recache pas
     pour la rejouer. La mise en scene n'a lieu que si le rideau couvre encore la page (premiere visite, rideau
     encore ferme) ou si le CSS cache encore le hero. */
  function safeDone(el){try{return !!el&&el.getAnimations().some(function(a){return a.animationName==='mkhSafe'&&a.playState==='finished'})}catch(e){return false}}
  var staged=(curtain&&(now()-T0)<450)||(!h.classList.contains('mk-first')&&!safeDone(sub));
  var titleLate=!staged,allLate=!staged;
  var scrolled=(window.scrollY||0)>innerHeight*.5||allLate;

  /* echelle de base de la video (selon site.css : 1.04 ou 1) */
  var base=1;
  if(vid){var m=/matrix\(([-\d.e]+)/.exec(getComputedStyle(vid).transform||'');if(m)base=parseFloat(m[1])||1;
    if(base>1.1)base=1.04}

  /* --- Titre : premiere ligne en masques ; le bloc #rotw n'est jamais clone, seul un emballage est anime --- */
  var split=null,l1=null;
  /* la colonne garde sa largeur : une fois le titre decoupe en lignes, sa largeur naturelle rétrécirait */
  var colW=col.getBoundingClientRect().width;
  if(colW>0)col.style.width=colW+'px';
  /* La premiere ligne est deja enveloppee dans le HTML (span.mkh-l1) : c'est le meme element avant, pendant et apres le
     decoupage, donc le navigateur ne retient pas un nouveau candidat LCP au moment ou on le remet en etat. Repli : on
     l'enveloppe ici si une page ancienne ne l'a pas. */
  var tn=h1.firstChild,pre=h1.querySelector(':scope>.mkh-l1');
  if(!titleLate&&pre){
    l1=pre;h1.classList.add('mkh-split');
  }else if(!titleLate&&tn&&tn.nodeType===3&&tn.nodeValue.trim()){
    l1=d.createElement('span');l1.className='mkh-l1';h1.insertBefore(l1,tn);l1.appendChild(tn);
    h1.classList.add('mkh-split');
  }
  var rw=null;
  if(!titleLate&&roll&&roll.parentNode===h1){
    rw=d.createElement('span');rw.className='mkh-rw';h1.insertBefore(rw,roll);rw.appendChild(roll);
  }
  if(l1&&window.SplitText){
    try{
      split=window.SplitText.create(l1,{type:'lines',mask:'lines',linesClass:'mkh-line'});
      (split.masks||[]).forEach(function(mk){mk.style.padding='.1em .12em .2em';mk.style.margin='-.1em -.12em -.2em'});
    }catch(e){split=null}
  }
  var lines=split?split.lines:(l1?[l1]:[]);

  /* --- Etoiles : chacune se pose a son tour --- */
  var starSplit=null,starChars=[];
  if(stars&&window.SplitText){
    try{starSplit=window.SplitText.create(stars,{type:'chars',charsClass:'mkh-star'});starChars=starSplit.chars}catch(e){starSplit=null}
  }

  var rest=[sub,proof,cta,dispo,photo,triade].filter(Boolean);
  var kill=function(){
    try{if(split)split.revert()}catch(e){}
    try{if(starSplit)starSplit.revert()}catch(e){}
    if(dawn&&dawn.parentNode)dawn.parentNode.removeChild(dawn);
    col.style.width='';
    var sw=hero.querySelector('.mkh-sweep');if(sw&&sw.parentNode)sw.parentNode.removeChild(sw);
    g.set([h1,rw,sub,proof,cta,dispo,photo,triade].filter(Boolean),{clearProps:'transform,opacity'});
    if(photo)photo.style.opacity='';
  };

  function exitScrub(){
    /* Sortie du hero : le contenu monte et s'estompe, la video se dilate. Aucun pin. */
    var st={trigger:hero,start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true};
    g.to(grid,{y:small?-40:-90,opacity:.28,ease:'none',scrollTrigger:st});
    if(vid)g.to(vid,{scale:base*(small?1.1:1.22),ease:'none',scrollTrigger:st});
    if(bg){
      var dk=bg.querySelector('.mkh-dusk');
      if(dk)g.to(dk,{opacity:.55,ease:'none',scrollTrigger:st});
    }
  }

  /* --- Parallaxe de profondeur a la souris (pointeur fin, ecran large) --- */
  function parallax(){
    if(!MK.fine||!MK.wide||!vid)return;
    var vx=g.quickTo(vid,'x',{duration:1.3,ease:'power3.out'}),vy=g.quickTo(vid,'y',{duration:1.3,ease:'power3.out'});
    var cx=g.quickTo(col,'x',{duration:1.1,ease:'power3.out'}),cy=g.quickTo(col,'y',{duration:1.1,ease:'power3.out'});
    var raf=0,nx=0,ny=0;
    function apply(){raf=0;vx(-nx*11);vy(-ny*7);cx(nx*5);cy(ny*3.5)}
    addEventListener('pointermove',function(e){
      if(e.pointerType&&e.pointerType!=='mouse')return;
      if((window.scrollY||0)>innerHeight)return;
      nx=(e.clientX/innerWidth-.5)*2;ny=(e.clientY/innerHeight-.5)*2;
      if(!raf)raf=requestAnimationFrame(apply);
    },{passive:true});
  }

  /* --- Etat de depart pose AVANT de rendre la main au CSS (meme tache : aucun flash) --- */
  if(scrolled){
    /* rechargement au milieu de la page : pas de mise en scene, juste les effets de sortie */
    try{if(split)split.revert()}catch(e){}
    try{if(starSplit)starSplit.revert()}catch(e){}
    if(dawn&&dawn.parentNode)dawn.parentNode.removeChild(dawn);
    col.style.width='';
    h.classList.add('mkh-live');
    exitScrub();parallax();return;
  }
  g.set(lines,{yPercent:112,skewY:3.5,transformOrigin:'0% 100%'});
  if(rw)g.set(rw,{opacity:0,y:34});
  g.set(sub,{opacity:0,y:28});
  g.set(proof,{opacity:0,y:24});
  if(cta)g.set(cta,{opacity:0,y:34});
  if(dispo)g.set(dispo,{opacity:0,y:18});
  if(photo)g.set(photo,{opacity:0,y:18});
  if(triade)g.set(triade,{opacity:0,y:16});
  if(starChars.length)g.set(starChars,{opacity:0,scale:.2,y:8,transformOrigin:'50% 60%'});
  if(vid)g.set(vid,{scale:1.12});
  if(dawn)g.set(dawn,{opacity:.78});
  h.classList.add('mkh-live');

  /* balayage de lumiere (une seule fois) */
  var sweep=null;
  if(bg){sweep=d.createElement('div');sweep.className='mkh-sweep';bg.appendChild(sweep);g.set(sweep,{xPercent:-130,opacity:0})}
  var dusk=null;
  if(bg){dusk=d.createElement('div');dusk.className='mkh-dusk';bg.appendChild(dusk);g.set(dusk,{opacity:0})}

  var wait=Math.max(0,(REVEAL_AT-(now()-T0))/1000);
  var tl=g.timeline({delay:wait,defaults:{ease:'power4.out'},onComplete:function(){
    kill();exitScrub();parallax();
  }});
  if(vid)tl.to(vid,{scale:base,duration:2.8,ease:'power2.out'},0);
  if(dawn)tl.to(dawn,{opacity:0,duration:1.7,ease:'power2.inOut'},0);
  if(lines.length)tl.to(lines,{yPercent:0,skewY:0,duration:1.15,stagger:.14},.05);
  if(rw)tl.to(rw,{opacity:1,y:0,duration:1.0},.4);
  tl.to(sub,{opacity:1,y:0,duration:1.0},.72);
  tl.to(proof,{opacity:1,y:0,duration:.9},.95);
  if(starChars.length)tl.to(starChars,{opacity:1,scale:1,y:0,duration:.7,ease:'back.out(2.2)',stagger:.08},1.1);
  if(cta)tl.to(cta,{opacity:1,y:0,duration:1.0},1.1);
  if(triade)tl.to(triade,{opacity:1,y:0,duration:.9},1.3);   /* la triade suit les boutons, puis la disponibilite, puis le rappel */
  if(dispo)tl.to(dispo,{opacity:1,y:0,duration:.9},1.42);
  if(photo)tl.to(photo,{opacity:.92,y:0,duration:.9},1.54);
  if(sweep){
    tl.set(sweep,{opacity:1},1.0);
    tl.to(sweep,{xPercent:420,duration:2.0,ease:'power2.inOut'},1.0);
    tl.set(sweep,{opacity:0},3.0);
  }
}

/* ------------------------------------------------------------------
   Demarrage
   ------------------------------------------------------------------ */
/* voile de lever de jour, pose tout de suite pour qu'aucune image nue ne passe sous le rideau */
(function(){
  if(MK.RM||!hero)return;
  var bg=hero.querySelector('.hero-bg');if(!bg)return;
  var dw=d.createElement('div');dw.className='mkh-dawn';dw.setAttribute('aria-hidden','true');bg.appendChild(dw);
})();

MK.ready.then(function(M){
  if(!M){
    h.classList.add('mkh-live');
    var dw=hero&&hero.querySelector('.mkh-dawn');if(dw&&dw.parentNode)dw.parentNode.removeChild(dw);
    return;
  }
  try{progressBar(M)}catch(e){}
  try{cursor(M)}catch(e){}
  try{magnets(M)}catch(e){}
  if(hero){
    /* SplitText mesure les lignes : on attend les polices (900 ms au plus) pour ne pas decouper sur la police de secours */
    var fr=(d.fonts&&d.fonts.ready)?Promise.race([d.fonts.ready,new Promise(function(r){setTimeout(r,900)})]):Promise.resolve();
    fr.then(function(){
      try{heroScene(M)}catch(e){
        h.classList.add('mkh-live');
        var dw2=hero.querySelector('.mkh-dawn');if(dw2&&dw2.parentNode)dw2.parentNode.removeChild(dw2);
      }
    });
  }
}).catch(function(){h.classList.add('mkh-live')});
})();
