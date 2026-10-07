/* =====================================================================
   FILM DU HERO : libellés des trois cas, phrase finale, bouton pause.
   Aucun ecouteur timeupdate : tout est pilote par des animations CSS lancees une fois,
   a l'evenement « playing » du film (voir site.js pour le chargeur). Mouvement reduit,
   pas de film ou lecture refusee : ce fichier ne fait rien et l'image fixe reste.
   Repères du film (secondes) : voir _FILM_HERO/final/timeline.json.
   ===================================================================== */
(function(){
'use strict';
var v=document.querySelector('.hero-film');if(!v)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var hero=v.closest('.hero');if(!hero)return;
var built=false;
function build(){
  if(built)return;built=true;
  var d=document;
  var tags=d.createElement('div');tags.className='film-tags';tags.setAttribute('aria-hidden','true');
  tags.innerHTML='<span class="ft" data-k="classique">Succession</span>'
    +'<span class="ft" data-k="accumulation">Logement très encombré</span>'
    +'<span class="ft" data-k="industriel">Local professionnel</span>'
    +'<span class="ft-end">Vous nous confiez les clés. Nous vous rendons les lieux.</span>';
  hero.appendChild(tags);
  // les trois cas, lisibles par les lecteurs d'ecran (les libelles flottants leur sont caches)
  var sr=d.createElement('ul');sr.className='sr-only';
  sr.innerHTML='<li>Succession</li><li>Logement très encombré</li><li>Local professionnel</li>';
  hero.appendChild(sr);
  // WCAG 2.2.2 : un mouvement automatique de plus de 5 secondes doit pouvoir etre mis en pause
  var b=d.createElement('button');b.type='button';b.className='film-pause';b.setAttribute('aria-label','Mettre la vidéo en pause');
  b.innerHTML='<svg class="i-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'
    +'<svg class="i-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  hero.appendChild(b);
  b.addEventListener('click',function(){
    if(v.paused){var p;try{p=v.play()}catch(e){}if(p&&p.catch)p.catch(function(){});hero.classList.remove('film-paused');b.setAttribute('aria-label','Mettre la vidéo en pause')}
    else{v.pause();hero.classList.add('film-paused');b.setAttribute('aria-label','Reprendre la vidéo')}
  });
  v.addEventListener('ended',function(){b.hidden=true;hero.classList.remove('film-paused')});
  // scène courante d'après le temps de la vidéo (repères en secondes : voir _FILM_HERO/final/timeline.json)
  var MARKS=[['retour',13.4],['industriel',9.9],['accumulation',4.6],['classique',0.4]],seg='';
  function sync(){
    var t=v.currentTime,k='';
    for(var i=0;i<MARKS.length;i++){if(t>=MARKS[i][1]){k=MARKS[i][0];break}}
    if(k!==seg){seg=k;if(k)hero.setAttribute('data-seg',k);else hero.removeAttribute('data-seg')}
  }
  // le titre du hero reste FIXE pendant le film (une seule animation à la fois : les meubles) ; la rotation reprend à la fin
  var R=window.__heroRot;
  if(R&&!R.ad){R.lock=true;v.addEventListener('ended',function(){R.lock=false})}
  v.addEventListener('timeupdate',sync);v.addEventListener('seeked',sync);v.addEventListener('ended',sync);sync();
}
if(!v.paused&&v.currentTime>0)build();else v.addEventListener('playing',build,{once:true});
})();
