/* Le Débarras Français · accueil v3
   Hero « porte coulissante », moments de mouvement joués une fois, devis en 3 étapes.
   Lois : transform et opacity seulement, état final = CSS par défaut, mouvement réduit = état final. */
(function(){
  'use strict';
  var d=document,root=d.documentElement;
  var REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MK=root.classList.contains('mk');
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  function ev(name,p){try{if(window.gtag)gtag('event',name,p||{})}catch(e){}}

  /* ================= HERO : la porte coulissante ================= */
  var LIEUX=[
    {f:'succession',w:'une maison après un décès',c:'Maison de famille, vidée et balayée',a:'Une maison pleine, avant le débarras',b:'La même maison, vidée et balayée'},
    {f:'encombre',w:'un logement très encombré',c:'Garage entièrement rempli, pris en charge avec discrétion',a:'Un garage rempli jusqu’au plafond, avant le débarras',b:'Le même garage, vidé'},
    {f:'industriel',w:'un local professionnel',c:'Local de stockage, grosses caisses et palettes évacuées',a:'Un local de stockage plein de caisses et de palettes',b:'Le même local, vidé'}
  ];
  var stage=$('#stage'),panel=$('#scPanel'),before=$('#scBefore'),after=$('#scAfter'),
      badge=$('#scBadge'),slider=$('#scSlider'),cap=$('#scCap'),stopBtn=$('#scStop'),word=$('#h1Word'),
      tabs=$$('.sc-tabs [data-i]');
  if(stage&&panel){
    var p=0,cur=0,tween=null,touring=false,busy=false;

    /* p = part ouverte : 0 la pièce pleine, 1 la pièce vide */
    function setP(v){
      p=Math.max(0,Math.min(1,v));
      panel.style.transform='translate3d('+(-p*100)+'%,0,0)';
      var n=Math.round(p*100);
      slider.setAttribute('aria-valuenow',n);
      slider.setAttribute('aria-valuetext',p<.5?'Avant':'Après');
      badge.textContent=p<.5?'Avant':'Après';
    }
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    function animate(to,ms){
      if(tween)tween.cancel();
      if(REDUCED||!ms){setP(to);return Promise.resolve(true)}
      var from=p,t0=null,dead=false;
      return new Promise(function(res){
        tween={cancel:function(){dead=true;res(false)}};
        (function step(t){
          if(dead)return;
          if(t0===null)t0=t;
          var k=Math.min(1,(t-t0)/ms);
          setP(from+(to-from)*ease(k));
          if(k<1)requestAnimationFrame(step);else{tween=null;res(true)}
        })(performance.now());
      });
    }
    function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
    function load(img,f,kind){
      var m='/medias/hero-'+f+'-'+kind;
      img.srcset=m+'-m.webp 800w, '+m+'.webp 1280w';
      img.src=m+'-m.webp';
      return img.decode?img.decode().catch(function(){}):Promise.resolve();
    }
    function setWord(i){
      if(!word)return;
      if(REDUCED||!MK){word.textContent=LIEUX[i].w;return}
      word.classList.add('swap');
      setTimeout(function(){word.textContent=LIEUX[i].w;word.classList.remove('swap')},250);
    }
    function setTabs(i){tabs.forEach(function(b){b.setAttribute('aria-selected',String(+b.dataset.i===i))})}

    /* Changer de lieu : la porte se referme avec la pièce pleine suivante, puis s'ouvre sur la pièce vide */
    function goTo(i,openAfter){
      if(busy&&!touring)return Promise.resolve();
      busy=true;setTabs(i);
      var L=LIEUX[i],chain;
      if(i===cur){chain=Promise.resolve()}
      else{
        /* porte ouverte : la pièce pleine suivante arrive avec la porte ; sinon on referme d'abord */
        var open=p>.98;
        chain=(open?load(before,L.f,'avant'):Promise.resolve())
          .then(function(){return animate(0,p>0?900:0)})
          .then(function(){return Promise.all([load(before,L.f,'avant'),load(after,L.f,'apres')])})
          .then(function(){
            after.alt=L.b;before.alt=L.a;cap.textContent=L.c;
            d.querySelector('#scene').dataset.lieu=i;cur=i;setWord(i);
          });
      }
      return chain.then(function(){return openAfter?animate(1,1600):true}).then(function(r){busy=false;return r});
    }

    /* Le tour automatique : joué une seule fois, arrêtable */
    function endTour(){touring=false;stopBtn.hidden=true}
    function tour(){
      if(touring||REDUCED)return;
      touring=true;stopBtn.hidden=false;ev('hero_tour_start');
      var seq=[1,2,0],k=0;
      animate(1,1700).then(function next(ok){
        if(!touring||ok===false)return;
        if(k>=seq.length){endTour();return}
        return wait(1900).then(function(){
          if(!touring)return;
          return goTo(seq[k++],true).then(next);
        });
      });
    }
    function stopTour(){if(!touring)return;touring=false;if(tween)tween.cancel();busy=false;stopBtn.hidden=true}
    stopBtn.addEventListener('click',function(){stopTour();ev('hero_tour_stop')});

    /* Glisser, toucher, clavier */
    var drag=null;
    function pFromX(x){var r=stage.getBoundingClientRect();return 1-(x-r.left)/r.width}
    slider.addEventListener('pointerdown',function(e){
      stopTour();if(tween)tween.cancel();
      drag={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};
    });
    slider.addEventListener('pointermove',function(e){
      if(!drag||e.pointerId!==drag.id)return;
      var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved){
        if(Math.abs(dx)<6)return;
        if(Math.abs(dy)>Math.abs(dx)){drag=null;return}   /* l'internaute fait défiler la page */
        drag.moved=true;try{slider.setPointerCapture(e.pointerId)}catch(_){}
        ev('hero_drag');
      }
      setP(pFromX(e.clientX));
    });
    function up(e){
      if(!drag)return;
      var tap=!drag.moved;drag=null;
      if(tap){animate(p<.5?1:0,900);ev('hero_tap')}
    }
    slider.addEventListener('pointerup',up);
    slider.addEventListener('pointercancel',function(){drag=null});
    slider.addEventListener('keydown',function(e){
      var k=e.key,v=null;
      if(k==='ArrowRight'||k==='ArrowUp')v=p+.1;
      else if(k==='ArrowLeft'||k==='ArrowDown')v=p-.1;
      else if(k==='Home')v=0;else if(k==='End')v=1;
      else if(k==='Enter'||k===' ')v=p<.5?1:0;
      if(v===null)return;
      e.preventDefault();stopTour();
      if(k==='Enter'||k===' ')animate(v,700);else setP(v);
    });
    tabs.forEach(function(b){
      b.addEventListener('click',function(){
        var i=+b.dataset.i;stopTour();
        goTo(i,true);ev('hero_tab',{lieu:LIEUX[i].f});
      });
    });

    /* Départ : mouvement réduit = la pièce vide tout de suite. Sinon le tour démarre
       une fois l'image chargée, le bandeau cookies fermé et la scène visible. */
    if(REDUCED||!MK){setP(1)}
    else{
      setP(0);
      var ready=(before.decode?before.decode():Promise.resolve()).catch(function(){});
      ready.then(function(){
        var waited=0;
        (function check(){
          var banner=d.getElementById('ldf-cookie');
          var r=stage.getBoundingClientRect(),seen=r.bottom>0&&r.top<innerHeight;
          if(touring||p>0||drag)return;          /* l'internaute a déjà pris la main */
          if((banner&&waited<6000)||!seen||d.hidden){waited+=300;setTimeout(check,300);return}
          tour();
        })();
      });
    }
  }

  /* ================= Moments joués une fois (classe mk-in) ================= */
  function stagger(sel,step){$$(sel).forEach(function(el,i){el.style.setProperty('--d',(i*step).toFixed(2)+'s')})}
  stagger('.ba',.12);stagger('.rev',.15);stagger('.steps li',.18);
  $$('.fin-num .p span').forEach(function(s,i){s.style.setProperty('--i',i)});

  var MOMENTS=[['.claims',.4],['.ba',.25],['.steps',.3],['.rev',.4],['#cert',.7],['#map',.5],['#final',.2],['.rv',.15]];
  if(MK&&'IntersectionObserver'in window){
    MOMENTS.forEach(function(m){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('mk-in');io.unobserve(e.target)}});
      },{threshold:m[1]});
      $$(m[0]).forEach(function(el){io.observe(el)});
    });
  }else{
    MOMENTS.forEach(function(m){$$(m[0]).forEach(function(el){el.classList.add('mk-in')})});
  }

  /* ================= Galerie avant / après ================= */
  $$('.ba input[type=range]').forEach(function(r){
    var f=r.parentNode,once=false;
    r.addEventListener('input',function(){
      f.style.setProperty('--p',r.value+'%');
      if(!once){once=true;ev('gallery_slide')}
    });
  });

  /* ================= Devis en 3 étapes ================= */
  var form=$('#qf');
  if(form){
    var steps=$$('.qf-step',form),count=$('#qfCount'),bar=$('#qfBar'),back=$('#qfBack'),
        err=$('#qfErr'),done=$('#qfDone'),at=0,started=false;
    function show(i,focus){
      at=i;
      steps.forEach(function(s,k){s.classList.toggle('on',k===i)});
      count.textContent=(i+1)+' / 3';
      bar.style.width=((i+1)/3*100).toFixed(1)+'%';
      back.hidden=i===0;
      if(focus){var f=steps[i].querySelector('legend,input:not([type=hidden])');if(f){if(f.tagName==='LEGEND'){f.tabIndex=-1}f.focus({preventScroll:true})}}
    }
    $$('input[name=Lieu],input[name=Situation]',form).forEach(function(r){
      r.addEventListener('change',function(){
        if(!started){started=true;ev('form_start')}
        var s=+r.closest('.qf-step').dataset.step;
        setTimeout(function(){show(s+1,true)},REDUCED?0:220);
      });
    });
    back.addEventListener('click',function(){if(at>0)show(at-1,true)});
    function fail(msg,el){
      err.textContent=msg;err.hidden=false;
      if(el){el.classList.add('bad');el.focus()}
    }
    $$('.field input',form).forEach(function(i){i.addEventListener('input',function(){i.classList.remove('bad');err.hidden=true})});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(form.botcheck&&form.botcheck.checked)return;
      var nom=form.Nom,tel=form.Telephone,digits=tel.value.replace(/\D/g,'');
      err.hidden=true;
      if(!form.querySelector('input[name=Lieu]:checked')){show(0,true);return}
      if(!form.querySelector('input[name=Situation]:checked')){show(1,true);return}
      if(nom.value.trim().length<2)return fail('Indiquez votre nom pour qu’on sache qui rappeler.',nom);
      if(digits.length<9||digits.length>13)return fail('Ce numéro semble incomplet. Vérifiez-le, ou appelez-nous au 06 49 02 42 14.',tel);
      var btn=form.querySelector('[type=submit]'),label=btn.textContent;
      btn.disabled=true;btn.textContent='Envoi en cours…';
      fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}})
        .then(function(r){return r.json().catch(function(){return{success:r.ok}})})
        .then(function(j){
          if(!j||!j.success)throw new Error('refus');
          try{window.LDF_TRACK&&LDF_TRACK.fire(LDF_TRACK.CONV.lead)}catch(_){}
          ev('generate_lead',{form:'accueil_3_etapes'});
          steps.forEach(function(s){s.classList.remove('on')});
          $('.qf-top',form).hidden=true;done.hidden=false;done.focus({preventScroll:true});
          done.scrollIntoView({block:'center',behavior:REDUCED?'auto':'smooth'});
        })
        .catch(function(){
          btn.disabled=false;btn.textContent=label;
          err.innerHTML='L’envoi n’a pas abouti. Appelez-nous au <a href="tel:+33649024214">06 49 02 42 14</a>, on répond 7 j/7.';
          err.hidden=false;
        });
    });
  }

  /* Liens « Mon devis » : on descend au formulaire et on place le focus */
  $$('[data-goto-form]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=$('#devis');if(!t)return;
      e.preventDefault();
      t.scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'});
      var f=$('.qf-step.on input:not([type=hidden])');
      if(f)setTimeout(function(){f.focus({preventScroll:true})},REDUCED?0:600);
      ev('goto_form',{from:a.closest('section,nav,header')?(a.closest('section,nav,header').id||a.closest('section,nav,header').className):''});
    });
  });

  /* Événements nommés */
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-ev]');
    if(a)ev(a.getAttribute('data-ev'));
  });

  /* ================= Barre fixe mobile ================= */
  var mbar=$('#mbar'),hero=$('.hero'),devis=$('#devis');
  if(mbar&&hero&&'IntersectionObserver'in window){
    var pastHero=false,onForm=false;
    function upd(){mbar.classList.toggle('show',pastHero&&!onForm)}
    new IntersectionObserver(function(es){pastHero=!es[0].isIntersecting;upd()}).observe(hero);
    if(devis)new IntersectionObserver(function(es){onForm=es[0].isIntersecting;upd()},{threshold:.15}).observe(devis);
  }
})();
