/* Le Débarras Français · accueil v2
   Formulaire en 3 étapes, curseurs avant/après, barre mobile, apparitions. Sans dépendance. */
(function(){
  var d=document;d.documentElement.classList.add('js');

  /* ---------- Formulaire 3 étapes ---------- */
  var f=d.getElementById('qf');
  if(f){
    var steps=[].slice.call(f.querySelectorAll('.qf-step')),cur=0,
        bar=d.getElementById('qf-bar'),count=d.getElementById('qf-count'),
        back=d.getElementById('qf-back'),err=d.getElementById('qf-err'),done=d.getElementById('qf-done'),started=false;

    function show(i){
      steps[cur].classList.remove('is-active');cur=i;steps[cur].classList.add('is-active');
      bar.style.width=((cur+1)/steps.length*100)+'%';
      count.textContent='Étape '+(cur+1)+' sur '+steps.length;
      back.hidden=cur===0;
      var first=steps[cur].querySelector('input:not([type=radio]),input:checked')||steps[cur].querySelector('input');
      if(cur===2&&first)setTimeout(function(){first.focus({preventScroll:true})},60);
    }
    function track(name,extra){try{if(window.gtag)gtag('event',name,extra||{})}catch(e){}}

    f.addEventListener('change',function(e){
      var t=e.target;
      if(!started){started=true;track('devis_debut')}
      if(t.name==='type_de_bien'){setTimeout(function(){show(1)},180)}
      if(t.name==='situation'){steps[1].querySelector('.qf-next').classList.add('ready')}
    });
    f.querySelector('.qf-next').addEventListener('click',function(){
      if(!f.querySelector('input[name=situation]:checked')){
        steps[1].querySelector('.choices').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:260});
        return;
      }
      show(2);
    });
    back.addEventListener('click',function(){if(cur>0)show(cur-1)});

    f.addEventListener('submit',function(e){
      e.preventDefault();
      var nom=f.elements.nom,tel=f.elements.telephone,ok=true;
      [nom,tel].forEach(function(i){i.classList.remove('bad')});
      if(!nom.value.trim()){nom.classList.add('bad');ok=false}
      if(tel.value.replace(/\D/g,'').length<10){tel.classList.add('bad');ok=false}
      if(!ok){err.textContent='Indiquez votre nom et un numéro de téléphone à 10 chiffres.';err.hidden=false;return}
      err.hidden=true;
      var btn=f.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Envoi…';
      fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}})
        .then(function(r){return r.json()})
        .then(function(j){
          if(!j.success)throw new Error(j.message||'envoi');
          steps.forEach(function(s){s.classList.remove('is-active')});
          back.hidden=true;count.textContent='Demande envoyée';bar.style.width='100%';
          done.hidden=false;done.focus();
          if(window.LDF_TRACK)LDF_TRACK.fire(LDF_TRACK.CONV.lead);
          track('generate_lead',{form:'accueil_3_etapes'});
        })
        .catch(function(){
          btn.disabled=false;btn.textContent='Recevoir mon rappel gratuit';
          err.innerHTML='L’envoi a échoué. Appelez-nous au <a href="tel:+33649024214">06 49 02 42 14</a>, on répond 7 j/7.';err.hidden=false;
        });
    });
  }

  /* Les boutons « Devis gratuit » amènent au formulaire et posent le focus sur la première question */
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-goto-form]');if(!a||!f)return;
    e.preventDefault();
    d.getElementById('devis').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    var i=f.querySelector('.qf-step.is-active input');if(i)setTimeout(function(){i.focus({preventScroll:true})},500);
  });

  /* ---------- Curseurs avant / après ---------- */
  [].forEach.call(d.querySelectorAll('.ba input[type=range]'),function(r){
    var fr=r.parentNode;
    r.addEventListener('input',function(){fr.style.setProperty('--pos',r.value+'%')});
  });

  /* ---------- Barre mobile : visible après le hero, masquée sur le formulaire ---------- */
  var mbar=d.querySelector('.mbar'),hero=d.querySelector('.hero'),form=d.getElementById('devis');
  if(mbar&&'IntersectionObserver'in window){
    var heroIn=true,formIn=false;
    function upd(){mbar.classList.toggle('show',!heroIn&&!formIn)}
    new IntersectionObserver(function(es){heroIn=es[0].isIntersecting;upd()}).observe(hero);
    new IntersectionObserver(function(es){formIn=es[0].isIntersecting;upd()},{threshold:.25}).observe(form);
  }

  /* ---------- Apparitions douces ---------- */
  if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var els=d.querySelectorAll('.sec-head,.ba,.tile,.steps li,.review,.g,.faq details');
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
    [].forEach.call(els,function(el){el.classList.add('rv');io.observe(el)});
  }
})();
