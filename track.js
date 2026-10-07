
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
