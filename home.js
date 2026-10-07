/* ===========================================================================
   Accueil narratif : trois scènes pilotées par la position de défilement + apparitions jouées une fois.
   Un seul écouteur de défilement (rAF), aucune dépendance. Mouvement réduit : rien n'est activé,
   le HTML reste lisible tel quel (grille, étapes, avant/après empilés).
   Idée reprise d'Apple : des plages de défilement déclarées (début, fin) et des valeurs qui en découlent.
   =========================================================================== */
(function(){
'use strict';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function clamp(x,a,b){return Math.min(b,Math.max(a,x))}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
var scenes=[];

/* progression d'une section haute dont l'enfant est collant : 0 quand elle touche le haut, 1 quand elle le quitte */
function progress(el){
  var r=el.getBoundingClientRect(),total=el.offsetHeight-innerHeight;
  return total>0?clamp(-r.top/total,0,1):0;
}

/* ---------- 1. manifeste : chaque mot s'allume à son tour ---------- */
(function(){
  var p=document.getElementById('hsManif');if(!p||reduce)return;
  var sec=p.closest('.hs-manif');if(!sec)return;
  var txt=p.textContent.replace(/\s+/g,' ').trim().split(' ');
  p.setAttribute('aria-label',p.textContent.replace(/\s+/g,' ').trim());
  p.innerHTML=txt.map(function(w){return '<span class="hs-w" aria-hidden="true">'+w+'</span>'}).join(' ');
  var ws=[].slice.call(p.querySelectorAll('.hs-w')),N=ws.length;
  sec.classList.add('hs-live');
  scenes.push(function(){
    var t=progress(sec),k=(t-.1)/.74*(N+3),i,o;
    sec.style.setProperty('--bo',(.27*(1-clamp((t-.04)/.8,0,1))).toFixed(3));
    for(i=0;i<N;i++){
      o=.16+.84*clamp((k-i)/3,0,1);
      var s=o.toFixed(2);if(ws[i]._o!==s){ws[i]._o=s;ws[i].style.opacity=s}
    }
  });
})();

/* ---------- 3. avant / après : l'avant se retire comme un rideau, une paire après l'autre ---------- */
(function(){
  var sec=document.getElementById('cles');if(!sec||!sec.classList.contains('hs-cine')||reduce)return;
  var track=sec.querySelector('.hs-cine-track'),stage=sec.querySelector('.hs-cine-stage');
  var pairs=[].slice.call(sec.querySelectorAll('.hs-pair')),N=pairs.length;if(!track||N<2)return;
  var lab=sec.querySelector('.hs-cine-lab'),cnt=sec.querySelector('.hs-cine-cnt'),bar=sec.querySelector('.hs-cine-bar');
  var cur=-1;
  sec.classList.add('hs-live');pairs[0].classList.add('cur');
  function pad(n){return n<10?'0'+n:''+n}
  scenes.push(function(){
    var p=progress(track),x=p*N,i=Math.min(N-1,Math.floor(x)),t=x-i;
    /* 0 à .16 : l'avant seul · .16 à .74 : le rideau · .74 à 1 : l'après seul */
    var w=ease(clamp((t-.16)/.58,0,1))*100;
    stage.style.setProperty('--wipe',w.toFixed(2)+'%');
    stage.style.setProperty('--lo',(w>1.5&&w<98.5)?'1':'0');
    stage.style.setProperty('--pp',p.toFixed(4));
    sec.classList.toggle('is-after',w>50);
    if(i!==cur){
      if(cur>=0)pairs[cur].classList.remove('cur');
      pairs[i].classList.add('cur');cur=i;
      lab.textContent=pairs[i].getAttribute('data-label');cnt.textContent=pad(i+1)+' / '+pad(N);
    }
  });
})();

/* ---------- 7. méthode : l'étape au centre de l'écran s'allume ---------- */
(function(){
  var sec=document.getElementById('methode');if(!sec||!sec.classList.contains('hs-meth')||reduce||!('IntersectionObserver' in window))return;
  var steps=[].slice.call(sec.querySelectorAll('.hs-step'));if(!steps.length)return;
  var photos=[].slice.call(sec.querySelectorAll('.hs-meth-photo img')),cntEl=sec.querySelector('.hs-meth-cnt');
  sec.classList.add('hs-live');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){
      steps.forEach(function(s){s.classList.remove('on')});e.target.classList.add('on');
      var n=steps.indexOf(e.target);
      photos.forEach(function(im,k){im.classList.toggle('on',k===n)});
      if(cntEl)cntEl.textContent='0'+(n+1)+' / 0'+steps.length;
    }});
  },{rootMargin:'-46% 0px -46% 0px',threshold:0});
  steps.forEach(function(s){io.observe(s)});
  steps[0].classList.add('on');
})();

/* ---------- apparitions : un titre, un texte, une grille, puis rien ne bouge ---------- */
(function(){
  var items=[].slice.call(document.querySelectorAll('.hs-sit .hs-eyebrow,.hs-sit .hs-h2,.hs-sit .hs-lead,.hs-tile,.hs-meth-head>*,.hs-cine-intro>*'));
  if(reduce||!('IntersectionObserver' in window)){return}
  items.forEach(function(e,k){e.classList.add('hs-rv');e.style.transitionDelay=((k%4)*90)+'ms'});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
  items.forEach(function(e){io.observe(e)});
})();

/* ---------- carte : le territoire se dessine une fois, puis les villes apparaissent ---------- */
(function(){
  var map=document.querySelector('.hs-map');if(!map)return;
  if(reduce||!('IntersectionObserver' in window)){map.classList.add('in');return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){map.classList.add('in');io.disconnect()}})},{threshold:.3});
  io.observe(map);
})();

/* ---------- boucle unique ---------- */
if(scenes.length){
  var tick=false;
  function run(){tick=false;for(var i=0;i<scenes.length;i++)scenes[i]()}
  function on(){if(!tick){tick=true;requestAnimationFrame(run)}}
  addEventListener('scroll',on,{passive:true});addEventListener('resize',on);addEventListener('load',on);
  run();
}
})();
