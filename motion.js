/* =====================================================================
   MOTION · motion.js · chargé en defer après site.js (accueil uniquement)
   Un seul rôle : poser une classe .mk-in, une fois, quand un élément
   entre à l'écran. Tout le dessin est dans motion.css. Aucun écouteur de
   défilement lié à un effet, aucune boucle requestAnimationFrame.
   ===================================================================== */
(function(){
'use strict';
var d=document,h=d.documentElement;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function nop(){}

/* ---- A. Utile même en mouvement réduit (ce n'est pas du mouvement) ---- */

/* A1. Simulateur : la carte garde la hauteur de la question la plus haute,
       le contenu sous le pouce ne saute plus. Mesure sur un clone hors champ,
       sans jamais basculer l'attribut hidden des vrais groupes. */
(function(){
  var est=d.getElementById('estim');if(!est)return;
  var t;
  function lock(){
    if(!est.classList.contains('est-wiz')||est.classList.contains('est-fin'))return;
    var f=est.querySelector('.estim2-form');if(!f)return;
    var c=f.cloneNode(true);c.setAttribute('aria-hidden','true');c.setAttribute('inert','');
    c.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;min-height:0;width:'+f.offsetWidth+'px';
    var gs=[].slice.call(c.querySelectorAll('.ef-group')),bk=c.querySelector('.est-back');
    if(bk)bk.hidden=false;   /* le chevron Retour agrandit l'en-tête dès l'étape 2 : on le mesure présent */
    est.appendChild(c);
    var max=0;
    gs.forEach(function(g,k){gs.forEach(function(o,j){o.hidden=(j!==k)});max=Math.max(max,c.offsetHeight)});
    est.removeChild(c);
    est.style.setProperty('--mk-est-h',max+'px');
  }
  function later(){clearTimeout(t);t=setTimeout(lock,150)}
  addEventListener('load',lock);addEventListener('resize',later);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(lock);
  lock();
})();

/* A2. Situations : le panneau s'ouvre à sa hauteur réelle (plus de plafond à 1400 px,
       donc plus d'ouverture trop vive ni de fermeture en retard). */
(function(){
  var rows=[].slice.call(d.querySelectorAll('[data-situ]'));if(!rows.length)return;
  function fit(){rows.forEach(function(r){var s=r.querySelector('.si-detail');if(s)s.style.maxHeight=r.classList.contains('open')?s.scrollHeight+'px':''})}
  d.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-situ]'))fit()});
  d.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest&&e.target.closest('[data-situ]'))fit()});
  addEventListener('resize',fit);
})();


/* A3. Tiroir de rappel : s'ouvre depuis le hero, se ferme à Échap ou au fond, rend le focus ; le défilement Lenis est suspendu */
(function(){
  var cb=d.getElementById('cb');if(!cb)return;
  var card=cb.querySelector('.cb-card'),last=null;
  card.setAttribute('data-lenis-prevent','');
  function lenis(a){try{if(window.MK&&MK.lenis)MK.lenis[a]()}catch(e){}}
  function open(){last=d.activeElement;cb.hidden=false;h.classList.add('cb-open');lenis('stop');
    var f=cb.querySelector('input[name="Nom"]');setTimeout(function(){if(f)f.focus()},80)}
  function close(){cb.hidden=true;h.classList.remove('cb-open');lenis('start');if(last&&last.focus)last.focus()}
  d.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-cb-open],[data-cb-close]');if(!t)return;
    if(t.hasAttribute('data-cb-open')){e.preventDefault();open()}else close();
  });
  /* lien « /#rappel » : ouvre directement le tiroir (utilisable comme lien de prise de rendez-vous sur la fiche Google) */
  function viaHash(){if(location.hash==='#rappel'&&cb.hidden)open()}
  addEventListener('hashchange',viaHash);
  if(d.readyState==='complete')viaHash();else addEventListener('load',viaHash);
  d.addEventListener('keydown',function(e){
    if(cb.hidden)return;
    if(e.key==='Escape'){close();return}
    if(e.key==='Tab'){
      var f=[].slice.call(card.querySelectorAll('button,input:not([type=hidden]):not(.hp),select,a[href]')).filter(function(x){return x.offsetParent});
      if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}
    }
  });
})();

/* A4. Mesure des intentions (hero_call, hero_whatsapp, callback_open, callback_submit) : événements Google, sans effet si gtag est absent */
d.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('[data-ev]');
  if(a&&window.gtag){try{gtag('event',a.getAttribute('data-ev'))}catch(x){}}
},true);

/* ---- B. Mouvement : seulement si permis et si IntersectionObserver existe ---- */
if(RM||!('IntersectionObserver' in window))return;
h.classList.add('mk','mk-ok');

/* B1. Simulateur : sens du glissement (avancer ou revenir) */
var est=d.getElementById('estim');
if(est)est.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('button');if(!b)return;
  est.setAttribute('data-dir',b.classList.contains('est-back')?'b':'f');
},true);

/* B2. Les entrées : sélecteur, seuil de visibilité. Un observateur par seuil. */
var T=[
  ['#temoignages .rev-card',.5], /* les étoiles */
  ['#garanties .gb-cert',.7],    /* le tampon */
  ['#zones .map-wrap',.5],       /* la lumière part de l'Eure */
  ['.final',.2]                  /* la pièce vide, le numéro */
];

/* la scène attend que ses deux photos soient décodées (800 ms au plus), sinon le balayage saccade */
function ready(el){
  var jobs=[].map.call(el.querySelectorAll('img'),function(i){
    function dec(){return i.decode?i.decode().catch(nop):Promise.resolve()}
    return (i.complete&&i.naturalWidth)?dec():new Promise(function(r){
      i.addEventListener('load',function(){dec().then(r)},{once:true});i.addEventListener('error',r,{once:true})});
  });
  return Promise.race([Promise.all(jobs).then(function(){return true}),new Promise(function(r){setTimeout(function(){r(false)},800)})]);
}
function enter(el){
  if(el.classList.contains('mk-in')||el.__mk)return;el.__mk=1;
  (el.classList.contains('sc')?ready(el):Promise.resolve(true)).then(function(ok){el.classList.add('mk-in');if(ok===false)el.classList.add('mk-late')});
}
var obs={};
function watch(el,th){
  var o=obs[th]||(obs[th]=new IntersectionObserver(function(es){
    var k=0;
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      o.unobserve(e.target);
      e.target.style.setProperty('--i',k++);   /* décalage par lot : l'ordre d'arrivée, pas un modulo de colonnes */
      enter(e.target);
    });
  },{threshold:th,rootMargin:'0px 0px -6% 0px'}));
  o.observe(el);
}
T.forEach(function(t){d.querySelectorAll(t[0]).forEach(function(el){watch(el,t[1])})});

/* B3. La scène charge ses photos en avance (elles sont en loading="lazy") */
var pre=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;pre.unobserve(e.target);
  e.target.loading='eager';if(e.target.decode)e.target.decode().catch(nop);
})},{rootMargin:'600px 0px'});
d.querySelectorAll('.sc img').forEach(function(i){pre.observe(i)});

/* B4. Filet de sécurité : jamais un élément resté à l'état de départ sous les yeux */
function sweep(){
  T.forEach(function(t){d.querySelectorAll(t[0]).forEach(function(el){
    var r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)enter(el);
  })});
}
addEventListener('load',function(){setTimeout(sweep,1200)});
var st;addEventListener('scroll',function(){clearTimeout(st);st=setTimeout(sweep,500)},{passive:true});
})();
