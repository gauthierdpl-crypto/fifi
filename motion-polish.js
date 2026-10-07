/* =====================================================================
   MOTION POLISH · motion-polish.js
   A. titres de section : masque ligne par ligne (SplitText) + filet or
   B. parallaxe douce (fond du final, documents des garanties, orbes ; la galerie avant/apres est laissee a motion-story) (propriete CSS translate, sans conflit
      avec les transform/animations existants)
   C. vie des sections : avis 3D, garanties, compteur d'avis, carte, FAQ, final
   Tout joue UNE fois a l'entree, sauf la parallaxe (liee au defilement, douce)
   et l'inclinaison au survol des avis (pointeur fin). Mouvement reduit : M vaut
   null, rien ne s'execute et le contenu reste complet.
   ===================================================================== */
(function(){
'use strict';
if(!window.MK)return;
MK.ready.then(function(M){
if(!M)return;
var g=M.gsap,ST=M.ST,d=document,touch=M.touch,fine=M.fine&&!touch;
function $(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
function safe(fn){try{fn()}catch(e){if(window.console)console.warn('motion-polish',e)}}
var EASE_OUT='expo.out',SOFT='power3.out';
var pending=[];                       /* revelations en attente : filet de securite */
function once(el,start,fn){
  var done=false;
  function go(){if(done)return;done=true;safe(fn)}
  pending.push({el:el,go:go});
  ST.create({trigger:el,start:start,once:true,onEnter:go});
}
/* filet : tout ce qui est deja sous les yeux (saut d'ancre, rechargement a mi-page) se joue */
function sweep(){pending=pending.filter(function(p){
  var r=p.el.getBoundingClientRect();
  if(r.top<innerHeight*.95&&r.bottom>-200){p.go();return false}return true})}
ST.addEventListener('scrollEnd',sweep);
addEventListener('load',function(){setTimeout(sweep,900)});
setTimeout(function(){pending.forEach(function(p){var r=p.el.getBoundingClientRect();if(r.top<innerHeight)p.go()})},6000);

/* ---------- A. TITRES ---------- */
function fontsOk(){return d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()}
fontsOk().then(function(){safe(function(){
  $('section h2').forEach(function(h){
    if(h.closest('.hero'))return;
    var dark=!!h.closest('.dark,.final');
    var center=getComputedStyle(h).textAlign==='center';
    h.classList.add('mkp','mkp-pre');
    if(center)h.classList.add('mkp-c');
    if(dark)h.classList.add('mkp-dk');
    h.style.setProperty('--mkp-r',0);
    once(h,'top 88%',function(){
      var sp=null;
      try{sp=new SplitText(h,{type:'lines',mask:'lines',linesClass:'mkp-line',maskClass:'mkp-mask'})}catch(e){sp=null}
      if(sp&&sp.lines.length){
        g.set(sp.lines,{yPercent:118,skewY:4,transformOrigin:'0% 100%'});
        h.classList.remove('mkp-pre');
        g.to(sp.lines,{yPercent:0,skewY:0,duration:1.25,ease:EASE_OUT,stagger:.13,
          onComplete:function(){try{sp.revert()}catch(e){}}});
      }else{
        h.classList.remove('mkp-pre');
        g.fromTo(h,{opacity:0,y:24},{opacity:1,y:0,duration:1,ease:SOFT,clearProps:'opacity,transform'});
      }
      g.to(h,{'--mkp-r':1,duration:1.3,ease:'power3.inOut',delay:.5});
    });
  });
})});

/* ---------- B. PARALLAXE (translate individuel : compose avec transform et animations) ---------- */
function drift(el,trigger,amp,scale){
  /* amp : fraction de la hauteur du cadre (ou px si > 1) ; le cadre cache la marge de course grace a scale */
  var px=Math.abs(amp)>1,h=0;
  if(scale)el.style.setProperty('--mkp-s',scale);
  ST.create({trigger:trigger,start:'top bottom',end:'bottom top',invalidateOnRefresh:true,
    onRefresh:function(){h=px?amp:(el.parentElement||el).clientHeight*amp},
    onUpdate:function(s){el.style.translate='0 '+((s.progress-.5)*2*h).toFixed(1)+'px'}});
}
safe(function(){
  var k=touch?.5:1;
  var fr=d.querySelector('.fin-room img'),fin=d.querySelector('.final');
  if(fr&&fin)drift(fr,fin,.07*k,1+.14*k);
  /* les deux documents des garanties : deux profondeurs, derives en px */
  var cert=d.querySelector('#garanties .gb-cert'),att=d.querySelector('#garanties .gb-att');
  /* orbes decoratifs des sections sombres : un peu de profondeur (translate, compose avec leurs animations) */
  $('.dark .orb').forEach(function(o,i){drift(o,o.closest('section')||o,(i%2?-1:1)*(touch?18:46))});
  if(cert)drift(cert,cert,touch?5:12);
  if(att)drift(att,att,touch?-5:-18);
});

/* ---------- C1. AVIS : cascade 3D a l'entree, inclinaison au survol ---------- */
safe(function(){
  var cards=$('#temoignages .rev-card');if(!cards.length)return;
  var tilts={};
  g.set(cards,{opacity:0,y:64,scale:.95,rotationX:-26,rotationY:function(i){return(i%3-1)*9},
    transformPerspective:1100,transformOrigin:'50% 100%'});
  ST.batch(cards,{start:'top 90%',once:true,onEnter:function(b){
    g.to(b,{opacity:1,y:0,scale:1,rotationX:0,rotationY:0,duration:1.4,ease:EASE_OUT,stagger:.16,delay:.3,overwrite:true,
      onComplete:function(){b.forEach(function(c){c.__mkpReady=true})}});
  }});
  if(!fine)return;
  cards.forEach(function(c){
    var rx=g.quickTo(c,'rotationX',{duration:.5,ease:'power3.out'}),ry=g.quickTo(c,'rotationY',{duration:.5,ease:'power3.out'});
    c.addEventListener('pointermove',function(e){
      if(!c.__mkpReady)return;
      var r=c.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
      ry(nx*8);rx(-ny*7);
      c.style.setProperty('--mkp-gx',((nx+.5)*100).toFixed(0)+'%');c.style.setProperty('--mkp-gy',((ny+.5)*100).toFixed(0)+'%');
      c.style.setProperty('--mkp-ga',1);
    });
    c.addEventListener('pointerleave',function(){rx(0);ry(0);c.style.setProperty('--mkp-ga',0)});
  });
});

/* ---------- C2. GARANTIES : cascade, reflet qui traverse la carte ---------- */
safe(function(){
  var cards=$('#garanties .gb-card');if(!cards.length)return;
  g.set(cards,{opacity:0,y:80,scale:.94,rotationX:-12,transformPerspective:1200,transformOrigin:'50% 100%',transition:'none'});
  ST.batch(cards,{start:'top 90%',once:true,onEnter:function(b){
    g.to(b,{opacity:1,y:0,scale:1,rotationX:0,duration:1.3,ease:EASE_OUT,stagger:.14,overwrite:true,
      onStart:function(){},
      onComplete:function(){g.set(b,{clearProps:'transform,opacity,transition,perspective'})}});
    b.forEach(function(c,i){setTimeout(function(){c.classList.add('mkp-sheen')},300+i*140+250)});
  }});
});

/* ---------- C3. COMPTEUR D'AVIS : le nombre publie se compte jusqu'a sa valeur ---------- */
safe(function(){
  /* Compteur désactivé (équipe 04/10) : un chiffre de confiance qui monte de 0 à 64 se lit comme une incohérence (57 capturé en route). Le nombre reste fixe. */
  return;
  /* site.js ne compte que les [data-count] : il n'y en a pas sur l'accueil, donc pas de doublon */
  var p=d.querySelector('#temoignages .big-muted');if(!p)return;
  var m=/(\d{2,4})(\s+publi)/.exec(p.textContent||'');if(!m)return;
  var n=parseInt(m[1],10),tn=null;
  var w=d.createTreeWalker(p,NodeFilter.SHOW_TEXT,null);
  while(w.nextNode()){if(w.currentNode.nodeValue.indexOf(m[1])>-1){tn=w.currentNode;break}}
  if(!tn)return;
  var i=tn.nodeValue.indexOf(m[1]),span=d.createElement('span');
  var rest=tn.splitText(i);rest.nodeValue=rest.nodeValue.slice(m[1].length);
  span.textContent=m[1];span.style.cssText='display:inline-block;min-width:'+m[1].length+'ch;font-variant-numeric:tabular-nums';
  tn.parentNode.insertBefore(span,rest);
  var o={v:0};
  once(p,'top 88%',function(){
    g.to(o,{v:n,duration:2.2,ease:'power2.out',delay:.3,onUpdate:function(){span.textContent=Math.round(o.v)},
      onComplete:function(){span.textContent=n}});
  });
  span.textContent=0;
});

/* ---------- C4. CARTE : onde doree depuis l'Eure, pins qui tombent un a un ---------- */
safe(function(){
  var wrap=d.querySelector('#zones .map-wrap');if(!wrap)return;
  var rings=[0,1,2].map(function(){var r=d.createElement('i');r.className='mkp-ring';r.setAttribute('aria-hidden','true');wrap.appendChild(r);return r});
  /* Manche et Orne : leurs deux departements n'avaient pas d'epingle (positions en % de l'image) */
  var spots=[{x:41.5,y:68,t:1.35},{x:24.5,y:36,t:1.75}].map(function(s){
    var pt=d.createElement('span');pt.className='mkp-pt';pt.setAttribute('aria-hidden','true');
    pt.innerHTML='<svg viewBox="0 0 40 58" focusable="false"><path d="M20 58 L3.19 29.38 A19.5 19.5 0 1 1 36.81 29.38 Z" fill="#eeb22b"/><circle cx="20" cy="19.5" r="6.5" fill="#fff"/></svg>';
    pt.style.left=s.x+'%';pt.style.top=s.y+'%';
    var sh=d.createElement('i');sh.className='mkp-shadow';sh.setAttribute('aria-hidden','true');sh.style.left=s.x+'%';sh.style.top=s.y+'%';
    var gl=d.createElement('i');gl.className='mkp-glow';gl.setAttribute('aria-hidden','true');gl.style.left=s.x+'%';gl.style.top=(s.y-2.4)+'%';
    wrap.appendChild(gl);wrap.appendChild(sh);wrap.appendChild(pt);
    g.set(pt,{xPercent:-50,yPercent:-100});g.set(sh,{xPercent:-50,yPercent:-50});g.set(gl,{xPercent:-50,yPercent:-50});
    return {pt:pt,sh:sh,gl:gl,t:s.t};
  });
  var played=false;
  function play(){
    if(played)return;played=true;
    var tl=g.timeline();
    rings.forEach(function(r,i){
      tl.fromTo(r,{scale:.04,opacity:.95},{scale:1.7,opacity:0,duration:1.9,ease:'power2.out'},.15+i*.42);
    });
    spots.forEach(function(s){
      tl.fromTo(s.pt,{y:-70,scale:.8,opacity:0},{y:0,scale:1,opacity:1,duration:.75,ease:'bounce.out'},s.t);
      tl.to(s.pt,{opacity:1,duration:.01},s.t);
      tl.fromTo(s.sh,{scale:.3,opacity:0},{scale:1,opacity:1,duration:.5,ease:SOFT},s.t+.35);
      tl.fromTo(s.gl,{scale:.2,opacity:0},{scale:1,opacity:.85,duration:1.1,ease:SOFT},s.t+.4);
    });
  }
  /* meme depart que le voile de motion.css (.mk-in sur .map-wrap), sinon filet de defilement */
  if(wrap.classList.contains('mk-in'))play();
  else{
    var mo=new MutationObserver(function(){if(wrap.classList.contains('mk-in')){mo.disconnect();play()}});
    mo.observe(wrap,{attributes:true,attributeFilter:['class']});
  }
  once(wrap,'top 40%',function(){play()});
});

/* ---------- C5. FAQ : les questions arrivent en cascade ---------- */
safe(function(){
  var acc=d.querySelector('#faq .faq-acc');if(!acc)return;
  var rows=$('details',acc);if(!rows.length)return;
  g.set(rows,{opacity:0,y:36});
  once(acc,'top 85%',function(){
    g.to(rows,{opacity:1,y:0,duration:1,ease:EASE_OUT,stagger:.07,clearProps:'transform,opacity'});
  });
});

/* ---------- C6. FINAL : halo de lumiere qui s'ouvre, pulsation unique du bouton ---------- */
safe(function(){
  var fin=d.querySelector('.final'),nar=fin&&fin.querySelector('.narrow'),tel=nar&&nar.querySelector('.final-tel');
  if(!nar||!tel)return;
  var halo=d.createElement('div');halo.className='mkp-halo';halo.setAttribute('aria-hidden','true');
  nar.insertBefore(halo,nar.firstChild);
  g.set(halo,{xPercent:-50,yPercent:-50,scale:.15});
  function place(){halo.style.setProperty('--mkp-hy',(tel.offsetTop+tel.offsetHeight/2)+'px')}
  place();addEventListener('resize',place);ST.addEventListener('refresh',place);
  var btn=fin.querySelector('.final-cta .btn'),cta=btn&&btn.parentNode,pulse=null;
  if(btn){pulse=d.createElement('i');pulse.className='mkp-pulse';pulse.setAttribute('aria-hidden','true');cta.appendChild(pulse)}
  var played=false;
  function play(){
    if(played)return;played=true;place();
    /* le halo s'ouvre pendant que le numero se compose, puis se pose a une intensite lisible */
    var tl=g.timeline();
    tl.to(halo,{opacity:1,scale:1,duration:2.4,ease:EASE_OUT},.1);
    tl.to(halo,{opacity:.07,duration:2.6,ease:'sine.inOut'},2);
    if(pulse){
      var cs=getComputedStyle(btn);
      g.set(pulse,{left:btn.offsetLeft,top:btn.offsetTop,width:btn.offsetWidth,height:btn.offsetHeight,borderRadius:cs.borderRadius});
      tl.fromTo(pulse,{opacity:.85,boxShadow:'0 0 0 0 rgba(217,185,124,.75)'},
        {opacity:0,boxShadow:'0 0 0 26px rgba(217,185,124,0)',duration:1.5,ease:'power2.out'},1.7);
    }
  }
  if(fin.classList.contains('mk-in'))play();
  else{
    var mo=new MutationObserver(function(){if(fin.classList.contains('mk-in')){mo.disconnect();play()}});
    mo.observe(fin,{attributes:true,attributeFilter:['class']});
  }
  once(fin,'top 45%',function(){play()});
});

/* le contenu a bouge (polices, lignes remplacees) : on recale les declencheurs une fois */
addEventListener('load',function(){setTimeout(function(){ST.refresh()},700)});
});
})();

/* ---- Mobile : la barre d'appel fixe se retire quand elle ferait doublon : tant que le bouton Appeler du hero est entièrement visible, puis dès que l'appel final (numéro, bouton, formulaire) ou le pied de page est à l'écran. Sur petit écran le second bouton du hero peut être sous la ligne de flottaison : la barre ne doit jamais recouvrir le premier. ---- */
(function(){
'use strict';
var bar=document.querySelector('.wa-fab'),cta=document.querySelector('.hero-cta .btn')||document.querySelector('.hero-cta');
if(!bar||!cta||!('IntersectionObserver' in window))return;
var mq=matchMedia('(max-width:820px)'),seen={hero:false,fin:false,foot:false};
function apply(){bar.classList.toggle('fab-calm',mq.matches&&(seen.hero||seen.fin||seen.foot))}
function watch(el,key,th,mrg){if(!el)return;new IntersectionObserver(function(es){es.forEach(function(e){seen[key]=key==='hero'?e.intersectionRatio>=.85:e.isIntersecting;apply()})},{threshold:th,rootMargin:mrg||'0px'}).observe(el)}
watch(cta,'hero',[0,.5,.85,1]);
watch(document.querySelector('.final'),'fin',[0],'0px 0px -12% 0px');
watch(document.querySelector('footer'),'foot',[0]);
if(mq.addEventListener)mq.addEventListener('change',apply);
})();

/* ---- Hero : « Nous intervenons à <commune> ». Chaque commune est dans la zone d'intervention du site ; une autre à chaque chargement, puis un fondu doux toutes les 7 s tant que le hero est visible (aucun mouvement si l'utilisateur l'a refusé). Aucune date, aucun « dernier chantier » : seulement la zone couverte. ---- */
(function(){
'use strict';
var el=document.getElementById('whereTown');if(!el)return;
if(window.HERO_TOWN){var p=el.closest('.hero-where');if(p)p.remove();return}
var L=["Évreux", "Louviers", "Vernon", "Pont-Audemer", "Bernay", "Les Andelys", "Gisors", "Verneuil d'Avre et d'Iton", "Gaillon", "Le Neubourg", "Brionne", "Conches-en-Ouche", "Pacy-sur-Eure", "Val-de-Reuil", "Pont-de-l'Arche", "Beaumont-le-Roger", "Étrépagny", "Rouen", "Le Havre", "Elbeuf", "Dieppe", "Yvetot", "Fécamp", "Bolbec", "Barentin", "Mont-Saint-Aignan", "Sotteville-lès-Rouen", "Le Grand-Quevilly", "Canteleu", "Darnétal", "Montivilliers", "Harfleur", "Lillebonne", "Forges-les-Eaux", "Neufchâtel-en-Bray", "Eu", "Le Tréport", "Duclair", "Caen", "Lisieux", "Bayeux", "Deauville", "Hérouville-Saint-Clair", "Saint-Lô", "Granville", "Avranches", "Alençon", "Flers", "Argentan", "Acquigny", "Igoville", "Incarville", "Saint-Pierre-du-Vauvray", "Le Vaudreuil", "Saint-Aubin-lès-Elbeuf", "Maromme", "Déville-lès-Rouen", "Bois-Guillaume", "Bihorel", "Franqueville-Saint-Pierre", "Gonfreville-l'Orcher", "Sainte-Adresse", "Criquetot-l'Esneval", "Saint-Romain-de-Colbosc"],cur=-1;
function pick(){var i;do{i=Math.floor(Math.random()*L.length)}while(i===cur);cur=i;return L[i]}
el.textContent=pick();
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
var vis=true;new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(el);
setInterval(function(){if(!vis||document.hidden)return;el.style.opacity=0;setTimeout(function(){el.textContent=pick();el.style.opacity=1},460)},7000);
})();
