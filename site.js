
/* ===== Suivi des conversions Google Ads + Consent Mode v2 (toutes les pages, y compris devis.html) =====
   PREMIER bloc du fichier : aucune erreur des animations ne peut couper le tracking. */
(function(){
  var GTAG_ID='AW-16936738143';

  /* Consent Mode v2 (RGPD) : tout refusé par défaut tant que l'internaute n'a pas choisi.
     La balise Google se charge en mode "consentement refusé" (Google modélise les conversions),
     puis on met à jour si l'internaute accepte. Choix mémorisé dans localStorage. */
  window.dataLayer=window.dataLayer||[];
  if(!window.gtag){window.gtag=function(){dataLayer.push(arguments);};}
  var CKEY='ldf_consent',stored=null;
  try{stored=localStorage.getItem(CKEY);}catch(e){}
  gtag('consent','default',{
    'ad_storage':'denied','ad_user_data':'denied',
    'ad_personalization':'denied','analytics_storage':'denied'
  });
  /* Sans cookies : le gclid suit la navigation via l'URL et les données publicitaires sont expurgées */
  gtag('set','url_passthrough',true);
  gtag('set','ads_data_redaction',true);
  if(stored==='granted'){
    gtag('consent','update',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});
  }

  /* Chargement de la balise Google APRÈS avoir posé l'état de consentement */
  gtag('js',new Date());gtag('config',GTAG_ID);
  var gtagLoaded=false;
  function loadGtag(){
    if(gtagLoaded||document.getElementById('ldf-gtag'))return;gtagLoaded=true;
    var gs=document.createElement('script');gs.async=true;gs.id='ldf-gtag';
    gs.src='https://www.googletagmanager.com/gtag/js?id='+GTAG_ID;
    document.head.appendChild(gs);
  }
  /* hors du chemin critique : premier geste OU inactivité après le chargement */
  ['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){addEventListener(ev,loadGtag,{once:true,passive:true});});
  addEventListener('load',function(){if(window.requestIdleCallback){requestIdleCallback(loadGtag,{timeout:3000});}else{setTimeout(loadGtag,2500);}},{once:true});

  /* ===== Bandeau cookies (Tout accepter / Tout refuser, refus aussi simple qu'accepter) =====
     Styles injectés ici : la bannière est identique sur toutes les pages, même sans site.css (devis.html). */
  function setConsent(v){
    try{localStorage.setItem(CKEY,v);}catch(e){}
    var g=(v==='granted')?'granted':'denied';
    gtag('consent','update',{'ad_storage':g,'ad_user_data':g,'ad_personalization':g,'analytics_storage':g});
  }
  function showCookieBanner(){
    if(stored||document.getElementById('ldf-cookie'))return;
    if(!document.getElementById('ldf-cookie-css')){
      var st=document.createElement('style');st.id='ldf-cookie-css';
      st.textContent='#ldf-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:99998;max-width:880px;margin:0 auto;background:#fff;color:var(--ink2,#332b22);border:1px solid var(--line,rgba(31,25,17,.12));border-radius:18px;box-shadow:var(--shadow-soft,0 18px 46px -26px rgba(43,34,20,.28));padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;font-size:14px;line-height:1.5;animation:ldfck .35s ease}'
        +'@keyframes ldfck{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
        +'#ldf-cookie .ldf-ck-txt{flex:1 1 340px}'
        +'#ldf-cookie .ldf-ck-txt a{color:var(--green-d,#6f5834);text-decoration:underline}'
        +'#ldf-cookie .ldf-ck-btns{display:flex;gap:10px;flex:0 0 auto}'
        +'#ldf-cookie button{cursor:pointer;border-radius:50px;padding:11px 20px;font-size:14px;font-weight:700;border:1px solid var(--steel,#cfc8bc);background:#fff;color:var(--ink,#1c1610);transition:transform .18s}'
        +'#ldf-cookie button:hover{transform:translateY(-1px)}'
        +'#ldf-cookie .ldf-ck-accept{background:var(--green,#8a6f46);border-color:var(--green,#8a6f46);color:#fff}'
        +'@media(min-width:561px) and (max-width:1112px){#ldf-cookie{top:16px;bottom:auto}}'
          +'@media(max-width:560px){#ldf-cookie{flex-direction:column;align-items:stretch;gap:10px;padding:12px 14px 14px;border-radius:0;left:0;right:0;top:0;bottom:auto;max-width:none;font-size:13px}#ldf-cookie .ldf-ck-txt{flex:0 0 auto}#ldf-cookie .ldf-ck-btns button{flex:1;padding:9px 14px;font-size:13px}}';
      document.head.appendChild(st);
    }
    var b=document.createElement('div');b.id='ldf-cookie';
    b.setAttribute('role','region');b.setAttribute('aria-label','Cookies');
    b.innerHTML='<div class="ldf-ck-txt">Cookies de mesure d\'audience et de publicité. <a href="/confidentialite.html">En savoir plus</a>.</div>'
      +'<div class="ldf-ck-btns"><button type="button" class="ldf-ck-refuse">Tout refuser</button><button type="button" class="ldf-ck-accept">Tout accepter</button></div>';
    document.body.insertBefore(b,document.body.firstChild);   /* en tete : au clavier c'est le premier arret, pas le 81e */
    document.body.classList.add('ldf-ck-open');
    /* le bandeau reserve sa place dans le hero (padding) : en le fermant, tout ce qui est dessous remonte d'un coup.
       Si la visiteuse est deja plus bas que le hero, on retire ce meme ecart du defilement : rien ne bouge sous ses yeux. */
    function fermer(v){
      var hero=document.querySelector('.hero'),avant=hero?hero.getBoundingClientRect().bottom+scrollY:0;
      setConsent(v);b.remove();document.body.classList.remove('ldf-ck-open');
      if(!hero)return;
      var apres=hero.getBoundingClientRect().bottom+scrollY;
      if(scrollY>apres&&avant-apres>1){try{scrollBy({top:apres-avant,left:0,behavior:'instant'})}catch(e){scrollBy(0,apres-avant)}}
    }
    b.querySelector('.ldf-ck-accept').onclick=function(){fermer('granted')};
    b.querySelector('.ldf-ck-refuse').onclick=function(){fermer('denied')};
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',showCookieBanner);}else{showCookieBanner();}

  /* ===== Conversions Google Ads =====
     fire(label) n'envoie QUE la conversion Ads, dédoublonnée par page vue (flag sessionStorage). */
  var CONV={
    appel: 'AW-16936738143/6zNHCOnx-cQcEN-6iIw_',
    wa:    'AW-16936738143/CMXUCOzx-cQcEN-6iIw_',
    lead:  'AW-16936738143/BI1ICO_x-cQcEN-6iIw_'   /* rappel + devis envoyé */
  };
  function fire(label){
    if(!label||!window.gtag)return;
    try{
      var k='ldf_cv_'+label;
      if(sessionStorage.getItem(k))return;
      sessionStorage.setItem(k,'1');
    }catch(e){}
    gtag('event','conversion',{'send_to':label});
  }
  window.fire=fire;window.CONV=CONV;  /* utilisables par le formulaire de l'estimateur */
  window.LDF_TRACK={fire:fire,CONV:CONV};

  /* Clics suivis : tel: sur MOBILE uniquement (sur desktop le clic copie le numéro, pas d'appel réel), WhatsApp partout. */
  var IS_MOBILE=matchMedia('(pointer:coarse)').matches||'ontouchstart'in window;
  document.addEventListener('click',function(e){
    var a=(e.target&&e.target.closest)?e.target.closest('a[href]'):null;if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('tel:')===0){if(IS_MOBILE)fire(CONV.appel);}
    else if(h.indexOf('wa.me')>-1||h.indexOf('whatsapp')>-1){fire(CONV.wa);}
    else if(h.indexOf('mailto:')===0){try{gtag('event','contact_email');}catch(e){}}
  },true);
})();

try{document.documentElement.classList.add('js-on','site-ok');}catch(e){}

  var hdr=document.getElementById('hdr')||document.createElement('div');
  var lastY=0;
  addEventListener('scroll',function(){
    var y=scrollY;
    hdr.classList.toggle('scrolled',y>30);
    if(window.__ldfRecale){lastY=y;return}     // recalage d'ancre fait par le script (motion-story.js) : pas un geste de la visiteuse
    if(y>140&&y>lastY+4){hdr.classList.add('hdr-hidden');}      // on descend -> disparait
    else if(y<lastY-4||y<140){hdr.classList.remove('hdr-hidden');} // on remonte -> apparait
    lastY=y;
  },{passive:true});

  // HERO : l'image fixe (medias/hero-poster*.webp) s'affiche seule d'abord (Chrome ne la retient pas comme LCP, car elle
  // couvre tout l'ecran : le LCP est le titre, qui ne change plus d'element apres le premier affichage, voir motion-hero.js).
  // Quand la page est chargee, le film demarre (sans son, UNE seule lecture) et s'arrete sur son dernier plan. Jamais de film si :
  // mouvement reduit, economie de donnees, connexion lente, lecture refusee (economie d'energie iOS), fichier absent
  // ou trop lent. Dans tous ces cas l'image fixe reste, sans erreur. Le film n'est demande que si bump_version.py a
  // pose data-film (fichiers presents), donc aucune requete 404 tant qu'il n'existe pas.
  // Les anciennes pages generees (partenaires.html) gardent leur <video class="hero-vid"> : meme chargeur, timelapse en boucle.
  (function(){
    var v=document.querySelector('.hero-film')||document.querySelector('.hero-vid');if(!v)return;
    var film=v.getAttribute('data-film'),legacy=!v.classList.contains('hero-film');
    if(!film&&!legacy)return;                                   // film non branche : image fixe seule
    v.muted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');
    if(!legacy)v.removeAttribute('loop');                       // le film joue une fois puis garde son dernier plan
    var mq=function(q){return matchMedia(q).matches};
    if(mq('(prefers-reduced-motion: reduce)')){try{v.pause()}catch(e){}return;}
    var cn=navigator.connection||{};
    if(cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'')||mq('(prefers-reduced-data: reduce)'))return;
    var VMB=/\/(villes|services)\//.test(location.pathname)?'../':'';
    var base=VMB+'medias/'+(legacy?'timelapse':film+(mq('(max-width:700px)')?'-m':''));
    var qv=v.getAttribute('data-v'),vq=qv?'?v='+qv:'';                 // empreinte du fichier : cache immuable d'un an
    var types=legacy?[['.mp4','video/mp4']]:(v.hasAttribute('data-webm')?[['.webm','video/webm'],['.mp4','video/mp4']]:[['.mp4','video/mp4']]);
    var box=v.parentNode,over=false,timer=0;
    function stop(){                                            // retombe sur l'image fixe
      if(over)return;over=true;clearTimeout(timer);
      box.classList.remove('film-on');
      v.setAttribute('aria-hidden','true');                     // sans source, le navigateur le nommerait « Impossible de lire les contenus multimedias »
      try{v.pause()}catch(e){}
      while(v.firstChild)v.removeChild(v.firstChild);
      v.removeAttribute('src');try{v.load()}catch(e){}
    }
    function play(){
      if(over)return;clearTimeout(timer);
      var p;try{p=v.play()}catch(e){stop();return}
      if(p&&p.catch)p.catch(stop);                              // autoplay refuse : image fixe
    }
    function start(){
      if(over)return;
      types.forEach(function(t){var s=document.createElement('source');s.src=base+t[0]+vq;s.type=t[1];v.appendChild(s)});
      v.lastChild.addEventListener('error',stop);               // la derniere source a echoue : plus rien a essayer
      v.addEventListener('error',stop);
      v.addEventListener('playing',function(){box.classList.add('film-on');if(!legacy)v.removeAttribute('aria-hidden')},{once:true});   // il joue : son libelle est lu
      // le film joue une fois : safari peut remettre la lecture a 0 quand la video sort de l'ecran, on reaffiche son dernier plan au retour
      var fini=false;
      v.addEventListener('ended',function(){fini=true});
      // safari remet la lecture a 0 un peu APRES le retour dans l'ecran, sans aucun evenement : on reverifie pendant 1,5 s
      function gardeFin(){
        if(over||!fini||!isFinite(v.duration))return;
        if(v.currentTime<v.duration-.1){try{v.currentTime=v.duration}catch(_){}}
      }
      if('IntersectionObserver' in window&&box){
        new IntersectionObserver(function(es){es.forEach(function(e){
          if(e.isIntersecting&&fini)[0,100,300,700,1500].forEach(function(ms){setTimeout(gardeFin,ms)});
        })},{threshold:0}).observe(box);
      }
      v.addEventListener('canplay',play,{once:true});
      timer=setTimeout(stop,legacy?15000:9000);                 // pas pret a temps : on ne lance jamais un film en retard
      v.preload='auto';try{v.load()}catch(e){stop()}
    }
    // onglet ouvert en arriere-plan : Chrome ne charge pas les videos tant que l'onglet est cache, et le delai de 9 s expirerait.
    // On attend donc que la page soit visible pour demander le film.
    function go(){
      if(!document.hidden){setTimeout(start,250);return}
      document.addEventListener('visibilitychange',function f(){
        if(document.hidden)return;document.removeEventListener('visibilitychange',f);setTimeout(start,250)});
    }
    if(document.readyState==='complete')go();
    else addEventListener('load',go,{once:true});
    // retour dans l'onglet : si le navigateur a mis le film en pause tout seul, il reprend (sauf pause demandee par la visiteuse)
    document.addEventListener('visibilitychange',function(){
      if(document.hidden||over||!v.currentTime||v.ended)return;
      var h=v.closest('.hero');if(h&&h.classList.contains('film-paused'))return;
      if(v.paused){var p;try{p=v.play()}catch(e){}if(p&&p.catch)p.catch(function(){})}
    });
  })();

  // TITRES KINÉTIQUES : montent derrière un masque
  document.querySelectorAll('section h2').forEach(function(h){
    h.classList.remove('reveal','d1','d2','d3','d4','d5');
    h.innerHTML='<span class="kin"><span>'+h.innerHTML+'</span></span>';
  });
  var kio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');kio.unobserve(e.target)}})},{threshold:.12,rootMargin:'3000px 0px 0px 0px'});
  document.querySelectorAll('.kin').forEach(function(el){kio.observe(el)});


  ['.cards','.steps-grid','.why-grid','.testi-grid','.gar-grid','.gal-grid','.zone-tags','.stats .wrap','.svc-cards','.situ-grid'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(grid){
      Array.prototype.forEach.call(grid.children,function(ch,i){ch.classList.add('reveal');ch.style.animationDelay=Math.min(i*0.06,0.3)+'s'});
    });
  });
  // Révélation "ballon" : apparition progressive harmonieuse, puis on retire les classes pour libérer le hover.
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){var t=e.target;t.classList.add('in');io.unobserve(t);
      t.addEventListener('animationend',function(){t.classList.remove('reveal','in','d1','d2','d3','d4','d5');t.style.animationDelay='';},{once:true});}
  })},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  function fmtNum(v,dec){return dec?v.toFixed(1).replace('.',','):Math.round(v).toLocaleString('fr-FR');}
  function animNum(el){
    var down=el.hasAttribute('data-countdown');
    var from=down?parseFloat(el.dataset.countdown):0;
    var to=down?0:parseFloat(el.dataset.count);
    var s=el.dataset.suffix||'';var dec=/[.,]/.test(String(down?el.dataset.countdown:el.dataset.count))?1:0;
    var st=null,dur=down?1600:1700;
    function step(ts){if(!st)st=ts;var p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3);
      el.textContent=fmtNum(from+(to-from)*e,dec)+s;if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }
  function cycleRegion(el){
    var regions=['Bretagne','Hauts-de-France','Île-de-France','Pays de la Loire','Grand Est','Occitanie','Nouvelle-Aquitaine'];
    var i=0,n=20;
    var iv=setInterval(function(){
      el.textContent=regions[i%regions.length];i++;
      if(i>=n){clearInterval(iv);el.textContent='Normandie';}
    },85);
  }
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      var t=e.target;
      if(t.hasAttribute('data-region'))cycleRegion(t);else animNum(t);
      cio.unobserve(t);
    }})},{threshold:.5});
  document.querySelectorAll('[data-count],[data-countdown],[data-region]').forEach(function(el){cio.observe(el)});

  // SCRUB : la maison se vide au défilement
  (function(){
    var sec=document.getElementById('avantapres'),b=document.getElementById('baBefore'),d=document.getElementById('baDiv'),h=document.getElementById('baHandle');
    if(!sec||!b||!d||!h)return;
    function upd(){var r=sec.getBoundingClientRect();var total=sec.offsetHeight-innerHeight;var p=total>0?(-r.top)/total:0;
      var p2=Math.min(1,Math.max(0,(p-0.06)/0.74));var v=p2*100;
      b.style.clipPath='inset(0 '+v+'% 0 0)';d.style.left=(100-v)+'%';h.style.left=(100-v)+'%';}
    var tick=false;addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){upd();tick=false})}},{passive:true});addEventListener('resize',upd);upd();
  })();

  // ===== ESTIMATEUR : 9 questions, un volume, une durée, jamais un prix =====
  (function(){
    var est=document.getElementById('estim');if(!est)return;
    var volEl=document.getElementById('estVol'),msgEl=document.getElementById('estMsg'),liveEl=document.getElementById('estLive');
    if(!volEl)return;
    var LBL={
      type:{maison:'Maison',appart:'Appartement',cave:'Cave, garage ou grenier',hangar:'Hangar, ferme, dépendance',pro:'Local professionnel',bricole:'Quelques meubles (tournée)'},
      surf:{s1:'moins de 60 m²',s2:'60 à 80 m²',s3:'80 à 140 m²',s4:'140 à 180 m²',s5:'plus de 180 m²'},
      etat:{bon:'bon état',normal:'habité normalement',tres:'très encombré',accu:'accumulation importante'},
      vol:{peu:'quelques meubles et objets',pieces:'une ou deux pièces',grande:'une grande partie du logement',tout:'tout le logement, très rempli'},
      tri:{fait:'déjà trié',partiel:'quelques affaires à mettre de côté',beaucoup:'beaucoup à trier',tout:'tout à trier'},
      acces:{direct:'plain-pied ou accès direct',asc:'étages avec ascenseur',sansasc:'étages sans ascenseur',difficile:'accès difficile'},
      valo:{oui:'oui, probablement',peutetre:'peut-être',non:'non',nsp:'ne sait pas'},
      situ:{deces:'après un décès',succession:'succession ou vente',ehpad:'départ en maison de retraite',demenagement:'déménagement ou fin de bail',autre:'autre'},
      delai:{'7j':'moins de 7 jours','3s':'2 à 3 semaines','2m':'1 à 2 mois',libre:'pas de contrainte'}
    };
    /* volume de base en m³ selon le type et la surface, puis ce qu'il y a a vider et l'etat */
    var BASE={maison:[22,32,48,68,90],appart:[8,16,28,40,52],cave:[8,12,16,22,28],hangar:[30,45,70,100,140],pro:[15,30,55,80,110]};
    var F_VOL={peu:.35,pieces:.6,grande:1,tout:1.35},F_ETAT={bon:.9,normal:1,tres:1.2,accu:1.45};
    var DUREE=[['Une demi-journée','sur place, 2 personnes'],['Une journée','sur place, 2 personnes'],['1 à 2 jours','sur place, 3 personnes'],['2 à 3 jours','sur place, 3 personnes']];
    var sel={type:'maison',surf:'s3',etat:'normal',vol:'grande',tri:'partiel',acces:'direct',valo:'nsp',situ:'autre',delai:'libre'};
    function calc(){
      var briq=(sel.type==='bricole');
      var IDX={s1:0,s2:1,s3:2,s4:3,s5:4};var idx=(sel.surf in IDX)?IDX[sel.surf]:2;
      var vol=briq?2:Math.min(160,Math.max(3,(BASE[sel.type]||BASE.maison)[idx]*F_VOL[sel.vol]*F_ETAT[sel.etat]));
      var vm=Math.round(vol);
      var niv=vm<=12?0:vm<=35?1:vm<=70?2:3;
      if(sel.tri==='tout'||sel.acces==='difficile')niv=Math.min(3,niv+1);
      var d=DUREE[niv];
      var valoOk=(sel.valo==='oui'||sel.valo==='peutetre');
      if(briq){
        volEl.innerHTML='<b>Quelques meubles</b><span>sur notre tournée, sur rendez-vous</span>';
        if(msgEl)msgEl.textContent='Laissez vos coordonnées, on vous rappelle pour convenir du passage.';
      }else{
        volEl.innerHTML='<b>~'+vm+'&nbsp;m³</b><span>de volume à débarrasser</span>';
        if(msgEl)msgEl.textContent=(valoOk?'Les objets de valeur sont mis de côté pour vous. ':'')+'Le devis est établi sur place, par écrit.';
      }
      if(liveEl){liveEl.textContent=briq?'Enlèvement à l\'unité. Laissez vos nom et téléphone : on vous rappelle.':'Volume estimé, environ '+vm+' mètres cubes, '+d[0].toLowerCase()+' sur place. Laissez vos nom et téléphone : on vous recontacte pour convenir de la visite.';}
      function put(id,v){var e=document.getElementById(id);if(e)e.value=v;}
      put('elBien',LBL.type[sel.type]||'');
      put('elSurf',briq?'sans objet':(LBL.surf[sel.surf]||''));
      put('elEtat',briq?'sans objet':(LBL.etat[sel.etat]||''));
      put('elAvider',briq?'quelques meubles':(LBL.vol[sel.vol]||''));
      put('elVol',briq?'quelques meubles':vm+' m³');
      put('elTri',briq?'sans objet':(LBL.tri[sel.tri]||''));
      put('elAcces',briq?'sans objet':(LBL.acces[sel.acces]||''));
      put('elValo',briq?'sans objet':(LBL.valo[sel.valo]||''));
      put('elSitu',briq?'':(LBL.situ[sel.situ]||''));
      put('elDelai',briq?'':(LBL.delai[sel.delai]||''));
      put('elDuree',briq?'tournée':(d[0]+', '+d[1]));
      var _i=document.getElementById('elIntent');if(_i)_i.value='';
    }
    /* intention de recontact : un choix, pas une porte fermee (le formulaire reste ouvert) */
    (function(){
      var box=document.getElementById('estIntent');if(!box)return;
      var btn=document.getElementById('elBtn'),note=document.getElementById('elNote'),jour=document.getElementById('elJour'),champ=document.getElementById('elIntent');
      var NOTE0=note?note.textContent:'';
      box.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click',function(){
          box.querySelectorAll('button').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});
          b.classList.add('on');b.setAttribute('aria-pressed','true');
          var i=b.dataset.i;if(champ)champ.value=i;
          if(i==='rapidement'){if(jour)jour.value='Aujourd’hui';if(btn)btn.textContent='Être recontacté(e) rapidement';if(note){note.className='er-lead-n';note.textContent=NOTE0;}}
          else if(i==='sans urgence'){if(jour)jour.value='Demain';if(btn)btn.textContent='Être recontacté(e)';if(note){note.className='er-lead-n';note.textContent=NOTE0;}}
          else{if(btn)btn.textContent='Être recontacté(e)';if(note){note.className='er-lead-n';note.textContent='Très bien. Rien n’est envoyé sans votre accord. Si vous souhaitez une visite plus tard, le 06 49 02 42 14 reste à votre disposition.';}}
          try{if(window.gtag)gtag('event','estimation_intention',{'event_category':'estimateur','event_label':i});}catch(e){}
        });
      });
    })();
    est.querySelectorAll('.ef-opts').forEach(function(g){g.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){g.parentElement.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');sel[g.parentElement.dataset.g]=b.dataset.v;calc();});});});
      calc();

      /* Agenda : le lead part aussi vers Google Agenda, qui pose le rappel
         a l'heure demandee par le client. Envoi sans attente : si l'agenda
         ne repond pas, le formulaire part quand meme sur Web3Forms. */
      var AGENDA_HOOK='https://script.google.com/macros/s/AKfycbx1soaYJvrQto7uv_c03sMLS-2HV28eLh5koBAkNF1df8Yx8_tR5qAk7294vDh24-7P/exec';               /* coller ici l'URL /exec du script Agenda LDF */
      var AGENDA_JETON='ldf-agenda-2026';
      function versAgenda(form,source){
        try{
          if(!AGENDA_HOOK||AGENDA_HOOK.indexOf('script.google')<0)return;
          var o={jeton:AGENDA_JETON,source:source};
          new FormData(form).forEach(function(v,k){
            if(k==='access_key'||k==='botcheck'||k==='from_name'||k==='subject')return;
            if(typeof v==='string'&&v.trim())o[k]=v.trim();
          });
          fetch(AGENDA_HOOK,{method:'POST',mode:'no-cors',keepalive:true,
            headers:{'content-type':'text/plain;charset=utf-8'},body:JSON.stringify(o)});
        }catch(e){}
      }

      /* Capture de contact */
      /* Tout formulaire .er-lead passe par le meme envoi : celui de
         l'estimateur et celui du bas de page. Les identifiants different,
         on travaille donc en relatif a l'interieur du formulaire. */
      document.querySelectorAll('form.er-lead').forEach(function(lead){
        lead.addEventListener('submit',function(ev){
          ev.preventDefault();
          var nom=lead.querySelector('input[name="Nom"]'),
              tel=lead.querySelector('input[name="Telephone"]'),
              btn=lead.querySelector('button[type="submit"]'),
              note=lead.querySelector('.er-lead-n');
          if(!nom||!tel||!btn||!note)return;
          var okNom=(nom.value||'').trim().length>=2;
          var chiffres=(tel.value||'').replace(/\D/g,'');
          var okTel=chiffres.length>=9;
          /* telephone OU e-mail : celui qui ne laisse que son adresse prefere l'ecrit */
          var mail=lead.querySelector('input[type="email"]'),adr=mail?(mail.value||'').trim():'';
          var mailValide=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adr);
          var veutMail=!!(mail&&adr&&chiffres.length===0);
          var okMail=!adr||mailValide;
          var okContact=okTel||(adr&&mailValide);
          nom.setAttribute('aria-invalid',okNom?'false':'true');
          tel.setAttribute('aria-invalid',(okTel||(chiffres.length===0&&okContact))?'false':'true');
          if(mail)mail.setAttribute('aria-invalid',okMail?'false':'true');
          var canal=lead.querySelector('#elCanal');if(canal)canal.value=veutMail?'e-mail':'téléphone';
          if(!okNom||!okMail||!okContact){
            note.className='er-lead-n err';
            note.textContent=!okNom?'Merci d\'indiquer vos nom et pr\u00e9nom.':!okMail?'Merci d\'indiquer une adresse e-mail valide.':(chiffres.length?'Merci d\'indiquer un num\u00e9ro de t\u00e9l\u00e9phone valide.':'Merci d\'indiquer un t\u00e9l\u00e9phone ou un e-mail.');
            (!okNom?nom:!okMail?mail:tel).focus();
            return;
          }
          note.className='er-lead-n';note.textContent='Envoi en cours\u2026';btn.disabled=true;
          versAgenda(lead, lead.id==='finLead'?'bas de page':(lead.id==='cbLead'?'en-tête':'estimateur'));
          fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(lead)})
            .then(function(r){return r.json()})
            .then(function(j){
              if(!j||!j.success)throw new Error('refus');
              try{if(window.fire&&window.CONV)window.fire(window.CONV.lead);}catch(e){}
              lead.classList.add('done');
              lead.innerHTML='<div class="er-lead-h">C\'est not\u00e9.</div>'
                +'<p class="er-lead-n">'+(veutMail?'On vous \u00e9crit au moment que vous avez choisi.':'On vous recontacte au moment que vous avez choisi.')+' Si c\'est urgent, appelez le '
                +'<a href="tel:+33649024214" style="color:inherit;text-decoration:underline">06 49 02 42 14</a>.</p>';
            })
            .catch(function(){
              btn.disabled=false;
              note.className='er-lead-n err';
              note.innerHTML='L\'envoi a \u00e9chou\u00e9. Appelez-nous au <a href="tel:+33649024214" style="color:inherit;text-decoration:underline">06 49 02 42 14</a>.';
            });
        });
      });
  })();


  /* ===== Rappel : le client choisit son jour, son heure, et sa date au calendrier ===== */
  (function(){
    function pad(n){return (n<10?'0':'')+n;}
    function loc(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
    function brancher(selJour,champDate,enveloppe){
      var j=document.getElementById(selJour),d=document.getElementById(champDate);
      if(!j||!d)return;
      var env=enveloppe?document.getElementById(enveloppe):d;
      var au=new Date(); d.min=loc(au);
      var max=new Date(); max.setDate(max.getDate()+120); d.max=loc(max);
      function maj(){
        var ouvert=(j.value==='Une autre date');
        if(env)env.hidden=!ouvert;
        d.required=ouvert;
        if(ouvert&&!d.value){var x=new Date();x.setDate(x.getDate()+3);d.value=loc(x);}
        if(ouvert){try{d.focus({preventScroll:true});}catch(e){}}
      }
      j.addEventListener('change',maj); maj();
    }
    brancher('elJour','elDate',null);
    brancher('rjour','rdate','rdateWrap');
    brancher('fbJour','fbDate',null);
  })();


  /* ===== Section equipe : la vraie video de chantier, en boucle douce ===== */
  (function(){
    var v=document.querySelector('.preuve-vid'); if(!v) return;
    var REDUIT=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(REDUIT) return;                       // mouvement reduit : l'affiche suffit
    var deb=parseFloat(v.dataset.deb||'0'), fin=parseFloat(v.dataset.fin||'0');
    var arme=false;
    function armer(){
      if(arme) return; arme=true;
      v.src=v.dataset.src+'#t='+deb; v.muted=true; v.load();
      if(fin>deb){ v.addEventListener('timeupdate',function(){ if(v.currentTime>=fin||v.currentTime<deb-0.1) v.currentTime=deb; }); }
    }
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){ armer(); var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
      else { v.pause(); }
    })},{threshold:.35});
    io.observe(v);
  })();

  /* ===== ESTIMATEUR : le besoin choisi (page dediee) pre-remplit ce qui va de soi ===== */
  (function(){
    var wrap=document.getElementById('estim');if(!wrap)return;
    var need=wrap.getAttribute('data-need');
    var LAB={'debarras-apres-deces':'Après un décès','debarras-succession':'Succession','debarras-depart-ehpad':'Départ en EHPAD','debarras-vente-immobiliere':'Vente immobilière','debarras-logement-encombre':'Logement encombré','debarras-diogene-insalubre':'Diogène ou insalubre','debarras-local-commercial':'Local commercial','debarras-site-industriel':'Site industriel','debarras-bureaux':'Bureaux','debarras-copropriete':'Copropriété'};
    var PRE={'debarras-apres-deces':{situ:'deces'},'debarras-succession':{situ:'succession'},'debarras-depart-ehpad':{situ:'ehpad'},'debarras-vente-immobiliere':{situ:'succession'},'debarras-logement-encombre':{etat:'tres'},'debarras-diogene-insalubre':{etat:'accu',vol:'tout'},'debarras-local-commercial':{type:'pro'},'debarras-site-industriel':{type:'pro'},'debarras-bureaux':{type:'pro'},'debarras-copropriete':{type:'pro'}};
    var champ=document.getElementById('elBesoin');
    if(champ)champ.value=need?(LAB[need]||''):'Autre besoin (choisi sur l’accueil)';
    if(!need||!PRE[need])return;
    var p=PRE[need];
    Object.keys(p).forEach(function(g){var b=wrap.querySelector('.ef-group[data-g="'+g+'"] button[data-v="'+p[g]+'"]');if(b)b.click();});
  })();

  /* ===== ESTIMATEUR : une question par écran ===== */
  (function(){
    var wrap=document.getElementById('estim');if(!wrap)return;
    var form=wrap.querySelector('.estim2-form'),res=wrap.querySelector('.estim2-res');
    var groups=[].slice.call(wrap.querySelectorAll('.ef-group'));
    if(!form||!res||!groups.length)return;
    wrap.classList.add('est-wiz');
    var total=groups.length+1,cur=0;
    var head=document.createElement('div');head.className='est-head';
    /* un chevron rond pour revenir (absent a l'etape 1, sans reserver de place),
       une barre en segments, un par etape, et le compteur */
    var segs='';for(var q=0;q<total;q++)segs+='<i></i>';
    head.innerHTML='<button type="button" class="est-back" aria-label="Retour" hidden>'
      +'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      +'<div class="est-bar" role="progressbar" aria-label="Progression du simulateur" aria-valuemin="1" aria-valuemax="'+total+'" aria-valuenow="1">'+segs+'</div><span class="est-cnt"></span>';
    form.insertBefore(head,form.firstChild);
    var bar=head.querySelector('.est-bar'),segEls=[].slice.call(bar.children),cnt=head.querySelector('.est-cnt'),back=head.querySelector('.est-back');
    function show(i,focus){
      cur=Math.max(0,Math.min(i,total-1));
      groups.forEach(function(g,k){g.hidden=(k!==cur)});
      res.hidden=(cur!==total-1);
      wrap.classList.toggle('est-fin',cur===total-1);
      segEls.forEach(function(sg,q){sg.classList.toggle('done',q<=cur)});
      bar.setAttribute('aria-valuenow',cur+1);
      /* l'etape « besoin » n'est pas une question : on ne la compte pas (« Étape 1 sur 11 » faisait peur) */
      var q0=(groups[0]&&groups[0].dataset.g==='besoin')?1:0;
      cnt.textContent=cur===total-1?'Dernière étape':(q0&&cur===0)?'Pour commencer':'Question '+(cur+1-q0)+' sur '+(total-1-q0);
      back.hidden=(cur===0);
      if(focus){
        if(cur===total-1){
          /* le panneau final doit se voir en entier ; scroll-margin-bottom tient compte
             de la barre d'action et du bandeau cookies quand ils sont la */
          var doux=!matchMedia('(prefers-reduced-motion: reduce)').matches;
          try{res.scrollIntoView({block:'nearest',behavior:doux?'smooth':'auto'})}catch(e){res.scrollIntoView(false)}
          /* au clavier physique on place le curseur dans le nom ; au doigt, jamais :
             le clavier virtuel masquerait la moitie de l'ecran avant meme la lecture */
          if(!matchMedia('(pointer:coarse)').matches){var nom=res.querySelector('#elNom');if(nom){try{nom.focus({preventScroll:true})}catch(e){}}}
        }
      }
    }
    back.addEventListener('click',function(){show(cur-1,false)});
    groups.forEach(function(g,k){
      g.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click',function(){var saut=(g.dataset.g==='type'&&b.dataset.v==='bricole')?total-1:k+1;setTimeout(function(){show(saut,true)},150)});
      });
    });
    /* Page d'un besoin (services/...) : l'etape « Quel est votre besoin ? » est deja repondue, on demarre a l'etape 2.
       Le chevron Retour ramene a l'etape 1, ou le besoin choisi est marque et les autres restent atteignables. */
    var cur0=wrap.getAttribute('data-need');
    if(cur0){
      var ga=wrap.querySelector('[data-need="'+cur0+'"]');
      if(ga){ga.classList.add('on');ga.setAttribute('aria-current','true');ga.addEventListener('click',function(e){e.preventDefault();show(1,false)});}
    }
    show(cur0?1:0,false);
  })();

  /* Garde en place la ligne tapee. Safari iOS n'a pas d'ancrage de defilement : quand la ligne ouverte AU-DESSUS se
     referme, celle qu'on vient de toucher saute hors de l'ecran. On recale pendant la fermeture (animee, 800 ms au plus)
     et on s'arrete des que la visiteuse defile elle-meme. Sans effet la ou le navigateur ancre deja (Chrome). */
  function keepTop(el){
    if(!el||!el.getBoundingClientRect)return;
    var top=el.getBoundingClientRect().top,t0=performance.now(),stop=false,evs=['wheel','touchstart','keydown'];
    function quit(){stop=true}
    evs.forEach(function(ev){addEventListener(ev,quit,{passive:true})});
    (function f(){requestAnimationFrame(function(){
      if(!stop){
        var dy=el.getBoundingClientRect().top-top;
        if(Math.abs(dy)>.5){try{scrollBy({top:dy,left:0,behavior:'instant'})}catch(e){scrollBy(0,dy)}}
      }
      if(!stop&&performance.now()-t0<800)f();
      else evs.forEach(function(ev){removeEventListener(ev,quit)});
    })})();
  }

  /* Situations : une seule ligne ouverte a la fois. Le titre porte un vrai <button> (modele accordeon) : les liens
     « Tout savoir » restent des liens atteignables, Entree sur un lien le suit au lieu de refermer la ligne. */
  document.querySelectorAll('[data-situ]').forEach(function(c,n){
    var h=c.querySelector('h3'),d=c.querySelector('.si-detail'),more=c.querySelector('.si-more');
    if(!h||!d)return;
    var id='si-d'+(n+1);d.id=id;d.setAttribute('aria-hidden','true');
    if(more)more.setAttribute('aria-hidden','true');
    var b=document.createElement('button');b.type='button';b.className='si-btn';
    b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',id);
    while(h.firstChild)b.appendChild(h.firstChild);
    h.appendChild(b);
    /* anneau de focus clavier : pose sur la ligne (voir motion-art.css), jamais au clic ni au toucher */
    b.addEventListener('focus',function(){try{if(b.matches(':focus-visible'))c.classList.add('kf')}catch(e){}});
    b.addEventListener('blur',function(){c.classList.remove('kf')});
    function tg(){
      var was=c.classList.contains('open');
      document.querySelectorAll('[data-situ]').forEach(function(x){
        x.classList.remove('open');
        var xb=x.querySelector('.si-btn'),xd=x.querySelector('.si-detail');
        if(xb)xb.setAttribute('aria-expanded','false');
        if(xd)xd.setAttribute('aria-hidden','true');
      });
      if(!was){c.classList.add('open');b.setAttribute('aria-expanded','true');d.setAttribute('aria-hidden','false')}
    }
    c.addEventListener('click',function(e){
      if(e.target.closest&&e.target.closest('a'))return;   /* un lien de la ligne ouverte suit son adresse, il ne la referme pas */
      keepTop(h);tg();
    });
  });

  // FAQ : accordéon exclusif (ouvrir une question ferme l'autre)
  document.querySelectorAll('#faq details').forEach(function(d){d.addEventListener('toggle',function(){if(d.open){document.querySelectorAll('#faq details').forEach(function(o){if(o!==d)o.open=false})}})});
  document.querySelectorAll('#faq summary').forEach(function(s){s.addEventListener('click',function(){keepTop(s)})});

  // Statut : toujours en ligne (pastille verte permanente)

  // ROTATEUR : le type de débarras change + la preuve sociale s'adapte au titre
  (function(){
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    // MODE COMMUNE : ville cible affichée 5s, puis défilé rapide de toutes les communes
    if(window.HERO_TOWN){
      var croll=document.querySelector('.rot-roll'),ccur=document.getElementById('rotw');
      if(!croll||!ccur)return;
      croll.setAttribute('aria-live','off');
      var clist=(window.NORMANDIE_COMMUNES||[]).slice();
      if(!clist.length)return;
      // taille adaptée à la longueur du nom (jamais écrêté)
      function fsz(t){var n=t.length;return n>30?'.46em':n>24?'.56em':n>19?'.68em':n>14?'.8em':n>10?'.9em':'1em';}
      // le rouleau accueille des noms longs : hauteur auto, pas de clipping
      croll.style.setProperty('height','auto','important');croll.style.setProperty('min-height','1.3em','important');croll.style.setProperty('overflow','visible','important');croll.style.lineHeight='1.08';
      ccur.style.display='inline-block';ccur.style.whiteSpace='normal';
      ccur.style.transition='opacity .26s ease,transform .26s ease';
      ccur.textContent=window.HERO_TOWN;ccur.style.fontSize=fsz(window.HERO_TOWN);
      if(reduce)return; // mouvement réduit : la ville cible reste affichée, pas de défilé
      var ci=clist.indexOf(window.HERO_TOWN);if(ci<0)ci=0;
      var cvis=true;
      var cvio=new IntersectionObserver(function(es){es.forEach(function(e){cvis=e.isIntersecting;})});
      cvio.observe(croll);
      function cspin(){
        if(!cvis||document.hidden)return; // hors viewport ou onglet caché : on suspend
        ci=(ci+1)%clist.length;
        ccur.style.opacity='0';ccur.style.transform='translateY(-10px)';
        setTimeout(function(){
          ccur.textContent=clist[ci];ccur.style.fontSize=fsz(clist[ci]);
          ccur.style.transition='none';ccur.style.transform='translateY(10px)';void ccur.offsetWidth;
          ccur.style.transition='opacity .26s ease,transform .26s ease';
          ccur.style.opacity='1';ccur.style.transform='translateY(0)';
        },230);
      }
      
      return;
    }
    var words=[
      {w:'une maison après un décès', n:'64', l:'avis Google'},
      {w:'une succession',            n:'64', l:'avis Google'},
      {w:'un départ en EHPAD',        n:'64', l:'avis Google'},
      {w:'une vente immobilière',     n:'64', l:'avis Google'},
      {w:'un logement encombré',      n:'64', l:'avis Google'},
      {w:'un local professionnel',    n:'64', l:'avis Google'}
    ];
    var roll=document.querySelector('.rot-roll'),cur=document.getElementById('rotw'),sub=document.querySelector('.hp-sub');
    if(!roll||!cur)return;
    // la phrase doit tenir sur UNE ligne : on reduit le corps quand elle est longue
    function wsz(t){var n=(t||'').length;return n>26?'.74em':n>22?'.80em':n>18?'.88em':n>15?'.94em':'1em';}
    cur.style.fontSize=wsz(cur.textContent.trim());
    // correspondance annonce -> page : index.html?s=deces|succession|ehpad|vente|encombre
    var i=0,MAP={deces:0,succession:1,ehpad:2,vente:3,encombre:4,pro:5},sp=null;try{sp=new URLSearchParams(location.search).get('s');
      if(sp&&Object.prototype.hasOwnProperty.call(MAP,sp)){i=MAP[sp];cur.textContent=words[i].w;cur.style.fontSize=wsz(words[i].w);}}catch(e){}
    roll.setAttribute('aria-live','off');
    if(reduce)return; // mouvement réduit : le premier mot reste affiché
    var wvis=true;
    var wvio=new IntersectionObserver(function(es){es.forEach(function(e){wvis=e.isIntersecting;})});
    wvio.observe(roll);
    function show(k){
      i=k%words.length;var it=words[i];
      var nw=document.createElement('span');nw.className='rotw';nw.textContent=it.w;nw.style.fontSize=wsz(it.w);
      nw.style.transform='translateY(-115%)';nw.style.opacity='0';
      roll.appendChild(nw);void nw.offsetWidth;
      nw.style.transform='translateY(0)';nw.style.opacity='1';
      cur.style.transform='translateY(115%)';cur.style.opacity='0';
      var old=cur;cur=nw;
      setTimeout(function(){if(old&&old.parentNode)old.parentNode.removeChild(old);},600);
    }
    // le film du hero (motion-film.js) pilote la phrase pendant sa lecture, pour que le titre suive l'image ;
    // un visiteur arrivé d'une annonce (?s=) garde la phrase de son annonce : le film ne la touche pas
    var fromAd=false;try{fromAd=!!(sp&&Object.prototype.hasOwnProperty.call(MAP,sp))}catch(e){}
    window.__heroRot={lock:false,show:function(k){if(!fromAd&&k!==i)show(k)},ad:fromAd};
    setInterval(function(){
      if(window.__heroRot.lock||!wvis||document.hidden)return; // film en cours, hors viewport ou onglet caché : on suspend
      show(i+1);
    },3800);
  })();

  // (parallaxe du visuel hero retire : il ecrivait un translateY a chaque frame
  //  de defilement sur .hero-visual, qui est en display:none depuis la refonte)

  // ===== Telephone : copie sur ordinateur (un clic tel: ne lance rien sur desktop, et ne compte PAS de conversion) =====
  (function(){
    if(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window)return; // mobile : tel: compose normalement
    var disp='06 49 02 42 14';
    function toast(m){var t=document.createElement('div');t.className='copy-toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);requestAnimationFrame(function(){t.classList.add('show');});setTimeout(function(){t.classList.remove('show');setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},350);},2400);}
    document.addEventListener('click',function(e){
      var el=e.target,a=(el&&el.closest)?el.closest('a[href^="tel:"]'):null;if(!a)return;
      e.preventDefault();
      var num=a.getAttribute('data-copy')||a.getAttribute('href').replace('tel:','');
      try{if(window.gtag)gtag('event','copie_numero',{'event_category':'contact','event_label':'desktop'});}catch(e){}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(num).then(function(){toast('Numéro copié : '+disp);}).catch(function(){toast('Appelez le '+disp);});}
      else{toast('Appelez le '+disp);}
    });
  })();

  // Vidéos : carrousel généré + chargement différé (src posé à la première visibilité) + lecture seulement quand visibles
  (function(){
    var track=document.getElementById('vidsTrack');if(!track)return;
    var REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COARSE=matchMedia('(pointer:coarse)').matches; // tactile : rail natif, plus de convoyeur
    var MB=/\/(villes|services)\//.test(location.pathname)?'../':'';
    var reels=[1,2,3,5,6]; // la 4 est passee dans la section equipe
    var FIN={1:8,5:13.6};   // on coupe avant les fins au noir
    var SOMBRE={3:1};       // le plan de cave a la lampe frontale est tres sombre
    function jouer(v){
      if(REDUCE)return;
      var p=v.play();
      if(p&&p.catch)p.catch(function(){
        // Safari refuse parfois le premier play() : on retente des que la video a des images
        v.addEventListener('loadeddata',function(){var q=v.play();if(q&&q.catch)q.catch(function(){});},{once:true});
      });
    }
    function armer(v){
      if(v.dataset.src){
        v.src=v.dataset.src;v.removeAttribute('data-src');v.muted=true;
        var fin=parseFloat(v.dataset.fin||'0');
        if(fin>0)v.addEventListener('timeupdate',function(){if(v.currentTime>=fin)v.currentTime=0.1;});
        v.addEventListener('canplay',function(){jouer(v)},{once:true});
        v.load();
      }
      jouer(v);
    }
    // le convoyeur fait glisser les cartes en permanence : on ne coupe que ce qui sort vraiment
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
      if(e.isIntersecting){armer(v);}
      else{v.pause();}})},COARSE?{rootMargin:'0px -34% 0px -34%',threshold:0}:{threshold:.01});
    // Construction différée : les posters (~1 Mo) ne sont téléchargés qu'à l'approche de la section
    var built=false;
    function build(){
      if(built)return;built=true;
      track.innerHTML=reels.map(function(n){
        return '<div class="vid'+(SOMBRE[n]?' vid-eclairci':'')+'">'
          +'<video data-src="'+MB+'medias/reel-'+n+'.mp4#t=0.1"'+(FIN[n]?' data-fin="'+FIN[n]+'"':'')
          +' poster="'+MB+'medias/reel-'+n+'-poster.webp" muted loop playsinline preload="none"></video></div>';
      }).join('');
      track.querySelectorAll('video').forEach(function(v){vio.observe(v)});
      // demarrage immediat : la section est deja proche quand build() est appele
      if(!COARSE)track.querySelectorAll('video').forEach(armer);
    }
    var loaded=false;
    function loadSrcs(){
      if(loaded)return;loaded=true;
      track.querySelectorAll('video').forEach(function(v){
        if(v.dataset.src){v.src=v.dataset.src;v.removeAttribute('data-src');v.muted=true;v.load();vio.unobserve(v);vio.observe(v);}
      });
    }
    // convoyeur CONTINU : défile sans arrêt, la carte de gauche chute en sortant
    var offset=0,step=0,raf=null,last=null;
    function frame(ts){
      if(last==null)last=ts;var dt=Math.min((ts-last)/1000,.05);last=ts;
      if(!step){var fc=track.firstElementChild;step=fc?fc.offsetWidth+16:248;}
      offset-=34*dt;
      var f=track.firstElementChild;
      if(f){
      }
      if(-offset>=step&&f){f.style.transform='';f.style.opacity='';track.appendChild(f);offset+=step;step=0;}
      track.style.transform='translate3d('+offset+'px,0,0)';
      raf=requestAnimationFrame(frame);
    }
    var runo=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){build();if(!raf&&!REDUCE&&!COARSE){last=null;raf=requestAnimationFrame(frame);}}
      else if(raf){cancelAnimationFrame(raf);raf=null;}
    })},{rootMargin:'600px 0px',threshold:0});
    runo.observe(track.parentNode||track);
    if(matchMedia('(hover:hover)').matches){var zone=track.parentNode||track;zone.addEventListener('mouseenter',function(){if(raf){cancelAnimationFrame(raf);raf=null;}});zone.addEventListener('mouseleave',function(){if(!raf&&!REDUCE){last=null;raf=requestAnimationFrame(frame);}});}
  })();

  // Galerie avant/après : tap pour révéler l'après
  document.querySelectorAll('.rea').forEach(function(f,i,arr){f.setAttribute('tabindex','0');f.setAttribute('role','button');f.setAttribute('aria-label','Comparer avant et après, photo '+(i+1)+' sur '+arr.length);f.setAttribute('aria-pressed','false');var cap=f.querySelector('.rea-cap');function tg(){f.classList.toggle('show');var on=f.classList.contains('show');f.setAttribute('aria-pressed',on?'true':'false');if(cap)cap.textContent=on?'Avant · voir l’après':'Après · voir l’avant';}f.addEventListener('click',tg);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg();}})});


/* ===== Fond de la section équipe : chargé à l'approche seulement ===== */
(function(){var bg=document.querySelector('.preuve-bg');if(!bg)return;
  if(!('IntersectionObserver'in window)){bg.classList.add('bgin');return;}
  var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){bg.classList.add('bgin');o.disconnect();}});},{rootMargin:'900px 0px'});
  o.observe(bg);})();

/* ===== Menu burger (en-tête) ===== */
(function(){
  var b=document.getElementById('burger'),m=document.getElementById('navmenu');
  if(!b||!m)return;
  var main=document.getElementById('main'),foot=document.querySelector('footer');
  function setInert(on){try{if(main)main.inert=on;if(foot)foot.inert=on;}catch(e){}}
  function close(){b.classList.remove('open');m.classList.remove('open');document.body.classList.remove('menu-open');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Ouvrir le menu');setInert(false);}
  b.addEventListener('click',function(e){e.stopPropagation();var o=!m.classList.contains('open');m.classList.toggle('open',o);b.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');setInert(o);if(o){var fl=m.querySelector('a[href]');if(fl)setTimeout(function(){fl.focus();},60);}});
  document.addEventListener('keydown',function(e){if(e.key!=='Tab'||!m.classList.contains('open'))return;var f=[b].concat([].slice.call(m.querySelectorAll('a[href]')));if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  document.addEventListener('click',function(e){if(m.classList.contains('open')&&!m.contains(e.target)&&!b.contains(e.target))close();});
  m.addEventListener('click',function(e){if(e.target.closest('a'))close();});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open')){close();b.focus();}});
  addEventListener('scroll',function(){if(m.classList.contains('open'))close();},{passive:true});
})();

/* ===== Bulle d'appel : numéro masqué pendant le scroll, ressort à l'arrêt ===== */
(function(){
  var fab=document.querySelector('.wa-fab');if(!fab)return;
  var t;
  addEventListener('scroll',function(){
    fab.classList.add('scrolling');
    clearTimeout(t);
    t=setTimeout(function(){fab.classList.remove('scrolling');},650);
  },{passive:true});
})();

/* ===== Header adaptatif : sa couleur suit la section sous le header (IntersectionObserver, zéro travail par frame) ===== */
(function(){
  var hdr=document.getElementById('hdr');if(!hdr)return;
  var darks=[].slice.call(document.querySelectorAll('.dark,.cta-band,.hero,.statband'));
  if(!darks.length)return;
  var io=null,vis=[];
  function build(){
    if(io)io.disconnect();vis=[];
    var hh=hdr.offsetHeight||64;
    // le root est réduit à la bande sous le header : intersecte = section sombre sous le header
    io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var i=vis.indexOf(e.target);
        if(e.isIntersecting){if(i<0)vis.push(e.target);}
        else if(i>-1){vis.splice(i,1);}
      });
      hdr.classList.toggle('over-dark',vis.length>0);
    },{rootMargin:'-1px 0px '+(hh-innerHeight)+'px 0px',threshold:0});   /* -1 px : une section dont le bord bas touche juste le haut de l'ecran ne compte plus */
    darks.forEach(function(el){io.observe(el)});
  }
  build();
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,180);});
})();

/* ===== a11y : états des boutons de l'estimateur ===== */
(function(){var bs=document.querySelectorAll('.ef-opts button');if(!bs.length)return;function sync(){bs.forEach(function(x){x.setAttribute('aria-pressed',x.classList.contains('on')?'true':'false')});}bs.forEach(function(x){x.addEventListener('click',function(){setTimeout(sync,0);});});sync();})();

/* ===== Rappel sous 1 h : message adapté aux horaires ===== */
(function(){var t=document.getElementById('dispoTxt');if(!t)return;var h=new Date().getHours();if(h>=20||h<8){t.textContent='Une urgence cette nuit\u2009? Appelez. Sinon, laissez vos coordonn\u00e9es';}})();

/* ===== secours reveals : jamais de section vide, même en cas de saut ===== */
(function(){function sweep(){document.querySelectorAll('.reveal:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight+40&&r.bottom>-40)el.classList.add('in');});}addEventListener('load',function(){setTimeout(sweep,900);});var t;addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sweep,450);},{passive:true});})();

/* ===== FILETS DORES : les deux traits de chaque intitule se tracent une fois =====
   .anim n'est pose que si le script tourne, pour que les filets restent visibles
   si le JavaScript echoue. Le marqueur .trace n'est jamais retire, contrairement
   a .reveal que le script nettoie apres l'animation. */
(function(){
  var r=document.documentElement;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){return;}
  r.classList.add('anim');
  var els=document.querySelectorAll('.eyebrow,.cl-band,.sl-ledger>*,.steps-sec .stack-card');
  if(!els.length)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('trace');io.unobserve(e.target);}
  })},{threshold:.6});
  els.forEach(function(el){io.observe(el)});
  // secours : si un intitule est deja a l'ecran au chargement, ou en cas de saut
  addEventListener('load',function(){setTimeout(function(){
    els.forEach(function(el){var b=el.getBoundingClientRect();
      if(b.top<innerHeight&&b.bottom>0)el.classList.add('trace');});},700);});
})();

/* ===== APPUI RECONNU =========================================================
   Constat mesure sur site.css : zero occurrence de ':active' dans tout le
   fichier. Sur iPhone, quand on appuie sur une carte ou sur un bouton de
   l'estimateur, rien ne confirme que le doigt a ete vu. C'est le defaut qui
   touche toutes les visiteuses, sur le chemin qui mene au formulaire.
   Un seul ecouteur delegue, passif, transform seul (reste sur le compositeur).
   ============================================================================ */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var CIBLES='#simulateur .ef-opts button,.situ,.rea,#faq summary,.si-links a,.nm-grid a,.est-nav button';
  // on ne touche JAMAIS a ce qui declenche un appel, un WhatsApp ou un envoi
  var SANCTUAIRE='a[href^="tel:"],a[href*="wa.me"],button[type="submit"],form,.btn';
  var courant=null;
  function lacher(){if(courant){courant.classList.remove('press');courant=null;}}
  document.addEventListener('pointerdown',function(e){
    if(e.target.closest(SANCTUAIRE))return;      // d'abord le sanctuaire
    var t=e.target.closest(CIBLES);              // ensuite seulement la cible
    if(!t)return;
    lacher();courant=t;t.classList.add('press');
  },{passive:true});
  ['pointerup','pointercancel','pointerleave','dragstart'].forEach(function(ev){
    document.addEventListener(ev,lacher,{passive:true});
  });
  // sans ceci la carte reste enfoncee pendant qu'elle fait defiler avec le doigt
  addEventListener('scroll',lacher,{passive:true});
})();

/* ===== BARRE DE LECTURE + PASTILLES DE SECTION ================================
   Deux reperes discrets, comme sur les pages de reference : un trait de 2 px
   en haut qui dit ou on en est, et une colonne de pastilles a droite qui
   nomme la section en cours. Rien ne bouge tout seul : les deux ne font que
   refleter la position de la visiteuse. Masques sous 1100 px.
   ============================================================================ */
(function(){
  if(innerWidth<1100)return;
  /* Accueil, services et villes : une section par sujet, un point chacun. Autres pages (partenaires) : leurs propres sections. */
  var HOME=!!document.getElementById('cles');
  var SECTIONS=HOME
    ?[['.hero','Accueil'],['#votre-situation','Votre situation'],['#prise-en-charge','Prise en charge'],['#simulateur','Avant la visite'],['#cles','Avant / après'],['#avis','Avis'],
      ['#situations','Situations'],['#methode','Méthode'],['#garanties','Garanties'],['#zones','Territoire'],['#questions','Questions'],['.final','Nous contacter']]
    :[['#simulateur','Avant la visite'],['#prise-en-charge','Prise en charge'],['#votre-dossier','Votre dossier'],['#metiers','Votre métier'],
      ['.steps-sec','Étapes'],['#garanties','Garanties'],['#zones','Territoire'],['#faq','Questions']];
  var barre=document.createElement('div');barre.className='lect-barre';document.body.appendChild(barre);
  var nav=document.createElement('aside');nav.className='sec-nav';nav.setAttribute('aria-hidden','true');
  var pts=[],found=[];
  SECTIONS.forEach(function(s){var el=document.querySelector(s[0]);if(el)found.push([el,s[1]])});
  found.sort(function(x,y){return x[0]===y[0]?0:(x[0].compareDocumentPosition(y[0])&4)?-1:1});
  found.forEach(function(f){
    var el=f[0],a=document.createElement('a');a.href='#';a.className='sec-pt';a.setAttribute('tabindex','-1');   /* rail decoratif (aria-hidden) : hors de l'ordre de tabulation */
    a.innerHTML='<span class="sec-lbl">'+f[1]+'</span><span class="sec-dot"></span>';
    a.addEventListener('click',function(e){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});});
    nav.appendChild(a);pts.push({a:a,el:el});
  });
  if(!pts.length)return;
  document.body.appendChild(nav);
  var tick=false,prev=null;
  function maj(){
    var h=document.documentElement.scrollHeight-innerHeight;
    barre.style.transform='scaleX('+(h>0?Math.min(1,Math.max(0,scrollY/h)):0)+')';
    nav.classList.toggle('vu',scrollY>innerHeight*0.75);
    var actif=null;
    pts.forEach(function(p){var r=p.el.getBoundingClientRect();
      if(r.top<=innerHeight*0.45&&r.bottom>innerHeight*0.2)actif=p;});
    pts.forEach(function(p){p.a.classList.toggle('ici',p===actif)});
    /* le libelle de la section active ne s'affiche que 2 s apres un changement (ou au survol) : il ne reste pas
       en permanence sur la photo de la galerie */
    if(actif!==prev){prev=actif;if(actif){var ea=actif.a;ea.classList.add('chg');clearTimeout(actif.t);actif.t=setTimeout(function(){ea.classList.remove('chg')},2000);}}
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(maj)}},{passive:true});
  addEventListener('resize',maj,{passive:true});maj();
})();



/* ===== MAQUETTE DE DEVIS DU HERO : se pose une fois, puis l'observateur se coupe =====
   Le CSS ne cache la feuille que si <html> porte .anim (pose par le bloc « filets dores »
   plus haut dans ce fichier, jamais en mouvement reduit). A coller a la FIN de site.js,
   apres ce bloc. Seuil bas (.12) pour que la feuille ne reste jamais vide a l'ecran,
   et secours au chargement comme pour les .reveal. */
(function(){
  var d=document.getElementById('heroDoc');if(!d)return;
  function pose(){d.classList.add('is-in');}
  function visible(){var b=d.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0;}
  if(!document.documentElement.classList.contains('anim')||!('IntersectionObserver' in window)){pose();return;}
  if(visible()){pose();return;}                       /* deja a l'ecran au chargement : pas d'attente */
  var o=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){pose();o.disconnect();}});
  },{threshold:.12,rootMargin:'0px 0px -4% 0px'});
  o.observe(d);
  addEventListener('load',function(){setTimeout(function(){if(visible())pose();},900);});
})();

/* ===== #cartes : la piece qui se vide. Pointer events, sans jamais voler le defilement. =====
   Souris : la coupure suit des l'appui. Tactile : on attend soit un geste horizontal
   (alors on capture et la coupure suit), soit un relachement sans mouvement (un tap
   place la coupure la). Un defilement vertical commence sur la photo n'y touche pas.
   A coller a la FIN de site.js. */
(function(){
  var fig=document.getElementById('cmp-piece');if(!fig)return;
  var handle=fig.querySelector('.cmp-handle');
  var x=50,pid=null,rect=null,drag=false,sx=0,sy=0,moved=false,scrolling=false;
  /* pourcentage vide = partie a droite de la coupure (l'apres) */
  function label(v){var e=100-v;return e>=98?'Tout est vidé':e<=2?'Rien n’est encore vidé':Math.round(e)+' % de la pièce vidée';}
  function set(v){x=Math.max(0,Math.min(100,v));fig.style.setProperty('--x',x+'%');fig.style.setProperty('--p',(x/100).toFixed(3));
    handle.setAttribute('aria-valuenow',Math.round(x));handle.setAttribute('aria-valuetext',label(x));}
  function pos(e){if(!rect)rect=fig.getBoundingClientRect();return (e.clientX-rect.left)/rect.width*100;}
  function start(e){drag=true;fig.classList.add('touched','dragging');try{fig.setPointerCapture(pid)}catch(_){}}
  function stop(){drag=false;scrolling=false;moved=false;fig.classList.remove('dragging');
    if(pid!==null){try{fig.releasePointerCapture(pid)}catch(_){}}pid=null;rect=null;}
  fig.addEventListener('pointerdown',function(e){
    if(pid!==null)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    pid=e.pointerId;rect=fig.getBoundingClientRect();sx=e.clientX;sy=e.clientY;moved=false;scrolling=false;
    if(e.pointerType==='mouse'){start(e);set(pos(e));e.preventDefault();}
  });
  fig.addEventListener('pointermove',function(e){
    if(e.pointerId!==pid||scrolling)return;
    if(!drag){
      var dx=Math.abs(e.clientX-sx),dy=Math.abs(e.clientY-sy);
      if(dx<6&&dy<6)return;
      if(dy>dx){scrolling=true;return;}      /* la visiteuse fait defiler : on ne touche a rien */
      start(e);
    }
    moved=true;set(pos(e));
  });
  fig.addEventListener('pointerup',function(e){
    if(e.pointerId!==pid)return;
    if(!drag&&!scrolling&&!moved){fig.classList.add('touched');set(pos(e));}   /* le tap */
    stop();
  });
  fig.addEventListener('pointercancel',function(e){if(e.pointerId===pid)stop();});
  /* clavier : fleches 2 %, Maj + fleches 10 %, Debut / Fin */
  handle.addEventListener('keydown',function(e){var s=e.shiftKey?10:2;
    if(e.key==='ArrowRight'||e.key==='ArrowUp')set(x+s);else if(e.key==='ArrowLeft'||e.key==='ArrowDown')set(x-s);
    else if(e.key==='Home')set(0);else if(e.key==='End')set(100);else return;
    e.preventDefault();fig.classList.add('touched');});
  /* la pastille « Faites glisser » bouge une fois a l'arrivee, puis l'observateur se desabonne */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){fig.classList.add('nudge');io.unobserve(fig);}})},{threshold:.5});
    io.observe(fig);
  }
  set(50);
})();

/* ===== #garanties : chaque carte entre une fois (observateur qui se desabonne) =====
   L'echelonnement se calcule sur l'ordre d'arrivee dans le lot, pas sur un modulo
   de colonnes. En mouvement reduit, .gb-js n'est pas pose : tout est visible d'emblee.
   A coller a la FIN de site.js. */
(function(){
  var g=document.querySelector('#garanties .gb-grid');if(!g)return;
  var cards=Array.prototype.slice.call(g.querySelectorAll('.gb-card'));
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  g.classList.add('gb-js');
  var io=new IntersectionObserver(function(es){
    var k=0;
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      var c=e.target;
      c.style.setProperty('--gbd',(k*90)+'ms');k++;
      c.classList.add('is-in');io.unobserve(c);
    });
  },{threshold:.15,rootMargin:'0px 0px -8% 0px'});
  cards.forEach(function(c){io.observe(c);});
  /* secours : cartes deja a l'ecran au chargement, ou sautees par une ancre */
  addEventListener('load',function(){setTimeout(function(){
    cards.forEach(function(c){var b=c.getBoundingClientRect();if(b.top<innerHeight&&b.bottom>0)c.classList.add('is-in');});
  },900);});
})();

/* ===== ETAPES : les 4 cartes collantes prennent toutes la hauteur de la plus haute.
   Sinon, en fin de section, chacune s'arrete a sa propre hauteur et l'empilement
   se defait (la 3e depassait de 120 px au-dessus de la 4e). ===== */
(function(){
  var cartes=document.querySelectorAll('.steps-sec .stack-card');if(cartes.length<2)return;
  var t;function egaliser(){
    var max=0;cartes.forEach(function(c){c.style.minHeight='';});
    cartes.forEach(function(c){max=Math.max(max,c.offsetHeight);});
    cartes.forEach(function(c){c.style.minHeight=max+'px';});
  }
  addEventListener('load',egaliser);addEventListener('resize',function(){clearTimeout(t);t=setTimeout(egaliser,120);});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(egaliser);egaliser();
})();
  /* ===== Arrivee depuis le simulateur : pastille « votre simulation continue » dans le hero ===== */
  (function(){
    var flag=null;try{flag=sessionStorage.getItem('ldf_besoin')}catch(e){}
    var wrap=document.getElementById('estim');
    /* un clic sur une tuile du besoin se souvient du choix, la page suivante fait son entree */
    if(wrap){wrap.querySelectorAll('a.ef-need-a').forEach(function(a){a.addEventListener('click',function(){try{sessionStorage.setItem('ldf_besoin',a.getAttribute('data-need'))}catch(e){}})})}
    if(!flag||!wrap||wrap.getAttribute('data-need')!==flag)return;
    try{sessionStorage.removeItem('ldf_besoin')}catch(e){}
    var hero=document.querySelector('.svc-hero .hero-grid>div');if(!hero)return;
    var a=document.createElement('a');a.className='arr-chip';a.href='#simulateur';
    a.innerHTML='<b>✓</b> Besoin choisi · Votre simulation continue à l’étape 2';
    hero.insertBefore(a,hero.firstChild);
  })();

/* ===== Avant / après : un comparateur à poignée, une paire à la fois, 13 vraies photos de chantier =====
   Les <figure class="rea"> du HTML servent de source (et de repli sans JavaScript, en grille).
   Un seul mouvement joué : à l'arrivée, la coupure balaie de l'avant vers le milieu. Rien de continu. */
(function(){
  var sec=document.getElementById('cartes');var grid=sec&&sec.querySelector('.rea-grid');if(!grid)return;
  var figs=[].slice.call(grid.querySelectorAll('.rea'));if(figs.length<2)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items=figs.map(function(f){
    var b=f.querySelector('.rea-b'),a=f.querySelector('.rea-a'),tg=f.querySelector('.rea-tag');
    if(!b||!a)return null;
    var label=tg?tg.textContent.replace(/\s+/g,' ').trim():'Chantier';
    return {label:label,tb:b.getAttribute('src'),ta:a.getAttribute('src')};
  }).filter(Boolean);
  if(items.length<2)return;
  function big(s){return s.replace('-g.webp','.webp')}
  function pad(n){return n<10?'0'+n:''+n}
  var N=items.length,cur=0,x=50,raf=0,touched=false,played=false;

  var root=document.createElement('div');root.className='bx';
  root.innerHTML=
    '<div class="bx-stage" style="--x:100%;--p:1">'
    +'<img class="bx-i bx-after" alt="" width="1280" height="853" decoding="async">'
    +'<img class="bx-i bx-before" alt="" width="1280" height="853" decoding="async">'
    +'<span class="bx-tag bx-tag-b" aria-hidden="true">Avant</span><span class="bx-tag bx-tag-a" aria-hidden="true">Après</span>'
    +'<span class="bx-line" aria-hidden="true"><i class="bx-knob"><svg viewBox="0 0 24 24" fill="none"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></i></span>'
    +'<input class="bx-range" type="range" min="0" max="100" step="0.1" value="100" aria-label="Faire glisser pour comparer l’avant et l’après">'
    +'<button type="button" class="bx-flip" aria-pressed="false">Voir l’avant</button>'
    +'</div>'
    +'<div class="bx-bar"><button type="button" class="bx-nav bx-prev" aria-label="Photo précédente"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
    +'<p class="bx-cap" aria-live="polite"><b class="bx-lab"></b><span class="bx-cnt"></span></p>'
    +'<button type="button" class="bx-nav bx-next" aria-label="Photo suivante"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>'
    +'<div class="bx-rail" aria-label="Choisir un chantier"></div>'
    +'<p class="bx-hint"><span class="bx-h-d">Faites glisser la poignée pour passer de l’avant à l’après.</span><span class="bx-h-m">Touchez le bouton pour voir l’état de départ.</span></p>';
  var stage=root.querySelector('.bx-stage'),iB=root.querySelector('.bx-before'),iA=root.querySelector('.bx-after'),rng=root.querySelector('.bx-range'),
      lab=root.querySelector('.bx-lab'),cnt=root.querySelector('.bx-cnt'),rail=root.querySelector('.bx-rail');
  var ths=items.map(function(it,i){
    var b=document.createElement('button');b.type='button';b.className='bx-th';b.setAttribute('aria-label','Voir : '+it.label);
    b.innerHTML='<img loading="lazy" decoding="async" alt="" width="152" height="101" src="'+it.tb+'"><span>'+it.label+'</span>';
    b.addEventListener('click',function(){go(i,true)});
    rail.appendChild(b);return b;
  });

  /* Téléphone : pas de poignée (chaque demi-photo ferait moins de 200 px). L'après s'affiche en entier, un grand bouton montre l'avant. */
  var mq=matchMedia('(max-width:700px)'),tg=mq.matches,flip=root.querySelector('.bx-flip');
  function showBefore(on){root.classList.toggle('is-before',on);flip.textContent=on?'Voir l’après':'Voir l’avant';flip.setAttribute('aria-pressed',on?'true':'false')}
  function applyMode(){tg=mq.matches;root.classList.toggle('bx-tg',tg);showBefore(false);if(!tg){touched=false;setX(50)}}
  flip.addEventListener('click',function(e){e.stopPropagation();showBefore(!root.classList.contains('is-before'))});
  if(mq.addEventListener)mq.addEventListener('change',applyMode);
  function setX(v){x=Math.max(0,Math.min(100,v));stage.style.setProperty('--x',x+'%');stage.style.setProperty('--p',(x/100).toFixed(3));rng.value=x;}
  function sweep(from,to,ms){
    cancelAnimationFrame(raf);
    if(tg){return}
    if(reduce||touched){setX(to);return;}
    var t0=null;setX(from);
    (function f(t){if(touched)return;if(t0===null)t0=t;var k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);setX(from+(to-from)*e);if(k<1)raf=requestAnimationFrame(f)})(performance.now());
  }
  function loadPair(i,done){
    var it=items[i],a=new Image(),b=new Image(),n=0;
    function ok(){if(++n===2)done()}
    a.onload=a.onerror=b.onload=b.onerror=ok;
    b.src=big(it.tb);a.src=big(it.ta);
    iB.dataset.next=b.src;iA.dataset.next=a.src;
  }
  function paint(i){
    var it=items[i];
    iB.src=big(it.tb);iA.src=big(it.ta);
    iB.alt='Avant débarras : '+it.label.toLowerCase();iA.alt='Après débarras : '+it.label.toLowerCase();
    lab.textContent=it.label;cnt.textContent=pad(i+1)+' / '+pad(N);
    ths.forEach(function(b,k){var on=k===i;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
    var th=ths[i];rail.scrollTo({left:th.offsetLeft-(rail.clientWidth-th.offsetWidth)/2,behavior:reduce?'auto':'smooth'});
  }
  function go(i,anim){
    i=(i+N)%N;if(i===cur&&played&&anim!==true)return;
    cur=i;
    if(!played){paint(i);return}
    stage.classList.add('is-sw');
    loadPair(i,function(){
      setTimeout(function(){paint(i);if(tg)showBefore(false);stage.classList.remove('is-sw');sweep(touched?x:88,50,900)},reduce?0:140);
    });
    setTimeout(function(){loadPair((i+1)%N,function(){})},900);
  }
  root.querySelector('.bx-prev').addEventListener('click',function(){go(cur-1,true)});
  root.querySelector('.bx-next').addEventListener('click',function(){go(cur+1,true)});
  rng.addEventListener('input',function(){touched=true;cancelAnimationFrame(raf);stage.classList.add('touched');setX(parseFloat(rng.value))});
  rng.addEventListener('keydown',function(e){if(e.key==='Home'){e.preventDefault();touched=true;setX(0)}else if(e.key==='End'){e.preventDefault();touched=true;setX(100)}});
  rail.addEventListener('keydown',function(e){
    var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!k)return;
    e.preventDefault();go(cur+k,true);ths[cur].focus({preventScroll:true});
  });

  grid.parentNode.insertBefore(root,grid);
  sec.classList.add('bx-live');document.documentElement.classList.add('bx-on');
  root.classList.toggle('bx-tg',tg);
  paint(0);
  /* une seule fois, quand le comparateur est à l'écran : la coupure balaie de l'avant vers le milieu */
  function start(){if(played)return;played=true;if(!tg)sweep(100,50,1500);setTimeout(function(){loadPair(1,function(){})},1200)}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.disconnect();start()}})},{threshold:.45});io.observe(stage);
  }else start();
})();
