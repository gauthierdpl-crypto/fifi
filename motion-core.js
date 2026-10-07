/* =====================================================================
   MOTION CORE : charge GSAP + ScrollTrigger + SplitText + Lenis (auto-hébergés)
   et expose window.MK. Les autres fichiers motion-*.js attendent MK.ready.
   Mouvement réduit : rien n'est chargé, MK.ready vaut null.
   Règle iOS : jamais de pin ScrollTrigger. Pour une scène épinglée, utiliser
   une section haute + un enfant en position:sticky, et un ScrollTrigger scrub SANS pin.
   ===================================================================== */
(function(){
'use strict';
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* dossier racine du site, deduit de l'adresse de ce script : les pages de villes et de services vivent dans un sous-dossier */
var BASE=(document.currentScript&&document.currentScript.src||'').replace(/[?#].*$/,'').replace(/[^\/]*$/,'');
var MK=window.MK={
  base:BASE,
  RM:RM,
  touch:matchMedia('(pointer:coarse)').matches,
  fine:matchMedia('(hover:hover) and (pointer:fine)').matches,
  wide:matchMedia('(min-width:900px)').matches,
  ease:'power3.out', easeInOut:'power3.inOut'
};
MK.ready=new Promise(function(res){
  if(RM){res(null);return;}
  function load(src){return new Promise(function(ok,ko){
    var s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
  /* tout part en parallele (async=false : l'execution garde l'ordre), plus de cascade de requetes ;
     Lenis n'est jamais telecharge au tactile (il n'y est pas instancie) */
  var jobs=[load(BASE+'vendor/gsap.min.js'),load(BASE+'vendor/ScrollTrigger.min.js'),load(BASE+'vendor/SplitText.min.js')];
  if(!MK.touch)jobs.push(load(BASE+'vendor/lenis.min.js'));
  Promise.all(jobs).then(function(){
    var g=window.gsap;
    g.registerPlugin(window.ScrollTrigger,window.SplitText);
    window.ScrollTrigger.config({ignoreMobileResize:true});
    if(!MK.touch&&window.Lenis){
      var l=new window.Lenis({lerp:.09,smoothWheel:true});
      MK.lenis=l;l.on('scroll',window.ScrollTrigger.update);
      g.ticker.add(function(t){l.raf(t*1000)});g.ticker.lagSmoothing(0);
      /* menu plein ecran : il defile seul (data-lenis-prevent) et la page se fige derriere (stop/start) */
      var nm=document.getElementById('navmenu'),bg=document.getElementById('burger');
      if(nm)nm.setAttribute('data-lenis-prevent','');
      if(bg&&window.MutationObserver){
        var sync=function(){if(bg.getAttribute('aria-expanded')==='true')l.stop();else l.start()};
        new MutationObserver(sync).observe(bg,{attributes:true,attributeFilter:['aria-expanded']});
        sync();
      }
    }
    /* la hauteur du document change sans resize (bandeau cookies retire, accordeon, simulateur) :
       ScrollTrigger remesure toutes les scenes apres 200 ms de calme */
    if(window.ResizeObserver&&document.body){
      var lastH=document.documentElement.scrollHeight,rt=0;
      new ResizeObserver(function(){
        clearTimeout(rt);
        rt=setTimeout(function(){
          var hh=document.documentElement.scrollHeight;
          if(Math.abs(hh-lastH)<2)return;
          lastH=hh;window.ScrollTrigger.refresh();
        },200);
      }).observe(document.body);
    }
    MK.gsap=g;MK.ST=window.ScrollTrigger;
    document.documentElement.classList.add('mk-gsap');
    res(MK);
  }).catch(function(){res(null)});
});
})();
