/* motion-art.js : barre fixe mobile. Elle ne recouvre jamais le bouton Appeler du hero :
   tant qu'une partie de ce bouton est a l'ecran, la barre reste retiree (classe fab-hold).
   Sans JS ou sans IntersectionObserver : rien ne change. */
(function(){
'use strict';
var bar=document.querySelector('.wa-fab'),btn=document.querySelector('.hero-cta a,.hero-cta button');
if(!bar||!btn||!('IntersectionObserver' in window))return;
new IntersectionObserver(function(es){
  es.forEach(function(e){bar.classList.toggle('fab-hold',e.isIntersecting)});
},{threshold:[0]}).observe(btn);
})();
