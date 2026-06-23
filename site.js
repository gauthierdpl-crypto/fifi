
  var hdr=document.getElementById('hdr')||document.createElement('div');
  var lastY=0;
  addEventListener('scroll',function(){
    var y=scrollY;
    hdr.classList.toggle('scrolled',y>30);
    if(y>140&&y>lastY+4){hdr.classList.add('hdr-hidden');}      // on descend -> disparait
    else if(y<lastY-4||y<140){hdr.classList.remove('hdr-hidden');} // on remonte -> apparait
    lastY=y;
  },{passive:true});

  // Forcer la lecture du timelapse du hero (autoplay parfois bloqué sur mobile)
  (function(){var v=document.querySelector('.hero-vid');if(!v)return;
    v.muted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');
    function go(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    go();v.addEventListener('loadeddata',go);
    addEventListener('touchstart',go,{once:true,passive:true});
    addEventListener('click',go,{once:true});
  })();

  // TITRES KINÉTIQUES : montent derrière un masque
  document.querySelectorAll('section h2').forEach(function(h){
    h.classList.remove('reveal','d1','d2','d3','d4','d5');
    h.innerHTML='<span class="kin"><span>'+h.innerHTML+'</span></span>';
  });
  var kio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');kio.unobserve(e.target)}})},{threshold:.35});
  document.querySelectorAll('.kin').forEach(function(el){kio.observe(el)});

  // BOUTONS MAGNÉTIQUES
  if(!matchMedia('(hover:none)').matches){
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*0.25+'px,'+(e.clientY-r.top-r.height/2)*0.4+'px)'});
      b.addEventListener('mouseleave',function(){b.style.transform=''});
    });
  }

  ['.cards','.steps-grid','.why-grid','.testi-grid','.gar-grid','.gal-grid','.zone-tags','.stats .wrap','.svc-cards','.situ-grid'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(grid){
      Array.prototype.forEach.call(grid.children,function(ch,i){ch.classList.add('reveal');ch.style.animationDelay=(i*0.07)+'s'});
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
    var s=el.dataset.suffix||'';var dec=(((down?from:to)%1)!==0)?1:0;
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

  // Barre d'avancement (espace de suivi)
  var pio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.style.width=e.target.dataset.prog+'%';pio.unobserve(e.target)}})},{threshold:.4});
  document.querySelectorAll('[data-prog]').forEach(function(el){pio.observe(el)});

  // SCRUB : la maison se vide au défilement
  (function(){
    var sec=document.getElementById('avantapres'),b=document.getElementById('baBefore'),d=document.getElementById('baDiv'),h=document.getElementById('baHandle');
    if(!sec||!b)return;
    function upd(){var r=sec.getBoundingClientRect();var total=sec.offsetHeight-innerHeight;var p=total>0?(-r.top)/total:0;
      var v=Math.min(1,Math.max(0,(p-0.03)/0.94))*100;
      b.style.clipPath='inset(0 '+v+'% 0 0)';d.style.left=(100-v)+'%';h.style.left=(100-v)+'%';}
    var tick=false;addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){upd();tick=false})}},{passive:true});addEventListener('resize',upd);upd();
  })();

  // ===== ESTIMATEUR INSTANTANÉ (prix animé) =====
  (function(){
    var est=document.getElementById('estim');if(!est)return;
    var V={type:{studio:8,t2:16,t3:28,t4:40,maison:48,grande:72},acc:{studio:1,t2:1.02,t3:1.12,t4:1.2,maison:.72,grande:.8},enc:{peu:.55,normal:1,tres:1.5,extreme:2.2},valo:{aucun:0,quelques:.2,beaucoup:.55}};
    var sel={type:'t3',enc:'normal',valo:'quelques'};
    var rangeEl=document.getElementById('estRange'),volEl=document.getElementById('estVol'),msgEl=document.getElementById('estMsg');
    var curLo=0,curHi=0;
    function euro(n){return (Math.round(n/10)*10).toLocaleString('fr-FR')+' €';}
    function tween(tLo,tHi,free){var fLo=curLo,fHi=curHi,st=null,dur=520;
      function s(ts){if(!st)st=ts;var p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3);
        var lo=fLo+(tLo-fLo)*e,hi=fHi+(tHi-fHi)*e;
        rangeEl.innerHTML=(free?'<span class="nw">0 €</span> à <span class="nw">'+euro(hi)+'</span>':'<span class="nw">'+euro(lo)+'</span> à <span class="nw">'+euro(hi)+'</span>');
        if(p<1)requestAnimationFrame(s);}
      requestAnimationFrame(s);curLo=tLo;curHi=tHi;}
    function calc(){
      var vol=V.type[sel.type]*V.enc[sel.enc],acc=V.acc[sel.type],base=120;
      var lo=(base+vol*acc*22)*(1-V.valo[sel.valo]),hi=(base+vol*acc*33)*(1-V.valo[sel.valo]);
      volEl.textContent='Volume estimé : ~'+Math.round(vol)+' m³';
      msgEl.innerHTML=sel.valo==='beaucoup'?'💚 Avec autant d\'objets de valeur, votre débarras est souvent <b>gratuit</b>.':'Estimation indicative. Le devis exact est <b>gratuit et sans engagement</b>.';
      tween(lo,hi,sel.valo==='beaucoup');
    }
    est.querySelectorAll('.ef-opts').forEach(function(g){g.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){g.parentElement.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');sel[g.parentElement.dataset.g]=b.dataset.v;calc();});});});
    calc();
  })();

  document.querySelectorAll('[data-situ]').forEach(function(c){c.addEventListener('click',function(){var was=c.classList.contains('open');document.querySelectorAll('[data-situ]').forEach(function(x){x.classList.remove('open')});if(!was)c.classList.add('open')})});


  // ===== LUEUR VERTE AU SCROLL : chaque section noire s'illumine puis vire au vert =====
  (function(){
    var darks=[].slice.call(document.querySelectorAll('.dark:not(.no-glow), .cta-band'));
    if(!darks.length)return;
    function upd(){
      var vh=innerHeight;
      for(var i=0;i<darks.length;i++){
        var el=darks[i],r=el.getBoundingClientRect();
        var g;
        var isClaims=el.classList.contains('claims');
        // claims (« Rien à organiser… ») : montée rapide (peu progressive)
        var ramp=isClaims?3.1:1.4;
        if(r.top>vh){g=0;}
        else if(r.bottom<0){g=1;}
        else{var p=(vh-r.top)/(r.height+vh);p=p<0?0:p>1?1:p;g=p*ramp;g=g>1?1:g;}
        // intensité du vert : plus faible pour les grandes sections
        var gint=0.52*(vh*0.85)/Math.max(r.height,1);
        gint=gint<0.2?0.2:gint>0.55?0.55:gint;
        // claims : effet beaucoup moins important
        if(isClaims){gint*=0.42;if(g>0.6)g=0.6;}
        // section vidéo : vire beaucoup moins au vert, reste plus noire
        if(el.id==='videos'){gint*=0.32;if(g>0.5)g=0.5;}
        el.style.setProperty('--glow',g.toFixed(3));
        el.style.setProperty('--gint',gint.toFixed(3));
      }
    }
    var tick=false;
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){upd();tick=false;});}},{passive:true});
    addEventListener('resize',upd);upd();
  })();

  // FAQ : accordéon exclusif (ouvrir une question ferme l'autre)
  document.querySelectorAll('#faq details').forEach(function(d){d.addEventListener('toggle',function(){if(d.open){document.querySelectorAll('#faq details').forEach(function(o){if(o!==d)o.open=false})}})});

  // Statut : toujours en ligne (pastille verte permanente)

  (function(){var items=['Meubles','Électroménager','Literie & matelas','Vêtements','Vaisselle','Livres & papiers','Bibelots','Cartons','Encombrants','Gravats','Déchets verts','Outils','Cave & grenier','Cuisine équipée','Tapis & rideaux','Souvenirs'];
    var track=document.getElementById('track1');if(track){var html=items.map(function(t){return '<span class="chip"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#7fd3a3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'+t+'</span>'}).join('');track.innerHTML=html+html}})();

  // ROTATEUR : le type de débarras change + la preuve sociale s'adapte au titre
  (function(){
    // MODE COMMUNE : ville cible affichée 5s, puis défilé rapide de toutes les communes
    if(window.HERO_TOWN){
      var croll=document.querySelector('.rot-roll'),ccur=document.getElementById('rotw');
      if(!croll||!ccur)return;
      var clist=(window.NORMANDIE_COMMUNES||[]).slice();
      if(!clist.length)return;
      // taille adaptée à la longueur du nom (jamais écrêté)
      function fsz(t){var n=t.length;return n>30?'.46em':n>24?'.56em':n>19?'.68em':n>14?'.8em':n>10?'.9em':'1em';}
      // le rouleau accueille des noms longs : hauteur auto, pas de clipping
      croll.style.setProperty('height','auto','important');croll.style.setProperty('min-height','1.3em','important');croll.style.setProperty('overflow','visible','important');croll.style.lineHeight='1.08';
      ccur.style.display='inline-block';ccur.style.whiteSpace='normal';
      ccur.style.transition='opacity .26s ease,transform .26s ease';
      ccur.textContent=window.HERO_TOWN;ccur.style.fontSize=fsz(window.HERO_TOWN);
      var ci=clist.indexOf(window.HERO_TOWN);if(ci<0)ci=0;
      function cspin(){
        ci=(ci+1)%clist.length;
        ccur.style.opacity='0';ccur.style.transform='translateY(-10px)';
        setTimeout(function(){
          ccur.textContent=clist[ci];ccur.style.fontSize=fsz(clist[ci]);
          ccur.style.transition='none';ccur.style.transform='translateY(10px)';void ccur.offsetWidth;
          ccur.style.transition='opacity .26s ease,transform .26s ease';
          ccur.style.opacity='1';ccur.style.transform='translateY(0)';
        },230);
      }
      setTimeout(function(){setInterval(cspin,560);},5000);
      return;
    }
    var words=[
      {w:'une succession',        n:'1 200', l:'familles accompagnées'},
      {w:'un décès',              n:'1 200', l:'familles accompagnées'},
      {w:'un départ en EHPAD',    n:'1 200', l:'familles accompagnées'},
      {w:'une vente immobilière', n:'1 200', l:'familles accompagnées'},
      {w:'un logement encombré',  n:'1 200', l:'familles accompagnées'},
      {w:'un logement Diogène',    n:'1 200', l:'familles accompagnées'},
      {w:'un local commercial',   n:'300',   l:'locaux pros débarrassés'},
      {w:'un site industriel',    n:'300',   l:'locaux pros débarrassés'},
      {w:'des bureaux',           n:'300',   l:'locaux pros débarrassés'},
      {w:'une copropriété',       n:'300',   l:'locaux pros débarrassés'}
    ];
    var roll=document.querySelector('.rot-roll'),cur=document.getElementById('rotw'),sub=document.querySelector('.hp-sub');
    if(!roll||!cur)return;var i=0;
    setInterval(function(){
      i=(i+1)%words.length;var it=words[i];
      var nw=document.createElement('span');nw.className='rotw';nw.textContent=it.w;
      nw.style.transform='translateY(-115%)';nw.style.opacity='0';
      roll.appendChild(nw);void nw.offsetWidth;
      nw.style.transform='translateY(0)';nw.style.opacity='1';
      cur.style.transform='translateY(115%)';cur.style.opacity='0';
      var old=cur;cur=nw;
      if(sub){sub.style.opacity='0';setTimeout(function(){sub.textContent='· '+it.n+' '+it.l;sub.style.opacity='';},280);}
      setTimeout(function(){if(old&&old.parentNode)old.parentNode.removeChild(old);},600);
    },2600);
  })();

  // ===== Parallaxe légère du visuel hero (le reste du contenu est animé par la révélation "ballon") =====
  (function(){
    var hv=document.querySelector('.hero-visual');if(!hv)return;
    function fx(){hv.style.transform='translateY('+(scrollY*0.05).toFixed(1)+'px)';}
    var tick=false;addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){fx();tick=false})}},{passive:true});fx();
  })();

  // ===== PAQUET DE CARTES (style Tinder) =====
  (function(){
    var deck=document.getElementById('deck');if(!deck)return;
    var villes=['Caen','Rouen','Le Havre','Lisieux','Bayeux','Deauville'];
    // Pour vos vraies vidéos : remplacez .bf/.af par <video src="reelX.mp4" muted loop autoplay playsinline></video>
    var cards=[];
    villes.forEach(function(v){
      var el=document.createElement('div');el.className='swipe';
      el.innerHTML='<div class="bf"></div><div class="af"></div><div class="cardline"></div><span class="ctag av">AVANT</span><span class="ctag ap">APRÈS ✓</span><span class="ccity">'+v+'</span><div class="play"><i>▶</i></div>';
      deck.appendChild(el);cards.push(el);
    });
    function layout(){cards.forEach(function(c,i){c.style.zIndex=100-i;c.style.transform='translateY('+(i*12)+'px) scale('+(1-i*0.05)+')';c.style.opacity=i>3?'0':'1';});}
    var busy=false;
    function fly(card,dir){
      busy=true;card.style.transition='transform .7s cubic-bezier(.4,0,.6,1),opacity .7s';
      card.style.transform='translate('+(dir*150)+'%,75%) rotate('+(dir*30)+'deg)';card.style.opacity='0';
      setTimeout(function(){card.style.transition='';card.style.opacity='';card.style.transform='';cards.push(cards.shift());layout();bind();busy=false;},680);
    }
    function bind(){
      var top=cards[0];if(!top)return;var sx=0,dx=0,drag=false;
      top.onpointerdown=function(e){if(busy)return;drag=true;sx=e.clientX;top.classList.add('dragging');try{top.setPointerCapture(e.pointerId)}catch(x){}};
      top.onpointermove=function(e){if(!drag)return;dx=e.clientX-sx;top.style.transform='translate('+dx+'px,'+(Math.abs(dx)*0.12)+'px) rotate('+(dx*0.07)+'deg)';};
      top.onpointerup=top.onpointercancel=function(){if(!drag)return;drag=false;top.classList.remove('dragging');if(dx>70||dx<-70){fly(top,dx>0?1:-1)}else{top.style.transform='';layout()}dx=0;};
    }
    layout();bind();
    setInterval(function(){if(!busy&&!document.hidden){var t=cards[0];if(t&&!t.classList.contains('dragging'))fly(t,1)}},3600);
  })();

  // ===== FORMULAIRE RAPPEL (hero) -> WhatsApp =====
  window.heroRappel=function(e){e.preventDefault();
    var n=(document.getElementById('hfNom')||{}).value||'',t=(document.getElementById('hfTel')||{}).value||'';
    var msg="Bonjour, je souhaite être rappelé(e) pour un débarras.\n• Prénom : "+n+"\n• Téléphone : "+t;
    window.open("https://wa.me/33649024214?text="+encodeURIComponent(msg),"_blank");return false;};

  // Vidéos : carrousel généré + lecture seulement quand visibles
  (function(){
    var track=document.getElementById('vidsTrack');if(!track)return;
    var MB=/\/(villes|services)\//.test(location.pathname)?'../':'';
    var reels=[1,2,3,4,5,6,7,8,9,10];
    track.innerHTML=reels.map(function(n){return '<div class="vid"><video src="'+MB+'medias/reel-'+n+'.mp4#t=0.1" muted loop playsinline preload="metadata"></video></div>';}).join('');
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}else{v.pause();}})},{threshold:.3});
    track.querySelectorAll('video').forEach(function(v){vio.observe(v)});
    // convoyeur CONTINU : défile sans arrêt, la carte de gauche chute en sortant
    var offset=0,step=0;
    function frame(){
      if(!step){var fc=track.firstElementChild;step=fc?fc.offsetWidth+16:248;}
      offset-=1;
      var f=track.firstElementChild;
      if(f){
        var prog=Math.min(1,Math.max(0,(-offset)/step));
        if(prog>0.62){var fp=(prog-0.62)/0.38;f.style.transform='translate('+(-fp*24)+'px,'+(fp*fp*210)+'px) rotate('+(-fp*80)+'deg)';f.style.opacity=String(1-fp);}
        else{f.style.transform='';f.style.opacity='';}
      }
      if(-offset>=step&&f){f.style.transform='';f.style.opacity='';track.appendChild(f);offset+=step;step=0;}
      track.style.transform='translateX('+offset+'px)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  // Galerie avant/après : tap pour révéler l'après
  document.querySelectorAll('.rea').forEach(function(f){f.addEventListener('click',function(){f.classList.toggle('show')})});

  // ===== CURSEUR PERSONNALISÉ =====
  (function(){
    if(matchMedia('(hover:none)').matches)return;
    var cur=document.createElement('div');cur.className='cursor';document.body.appendChild(cur);
    addEventListener('mousemove',function(e){cur.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)'},{passive:true});
    var sel='a,button,.opt,.situ,.card,.btn,#play,summary,.zone-tags span,.gar,.quote';
    addEventListener('mouseover',function(e){if(e.target.closest&&e.target.closest(sel))cur.classList.add('big')});
    addEventListener('mouseout',function(e){if(e.target.closest&&e.target.closest(sel))cur.classList.remove('big')});
  })();

/* ===== Menu burger (en-tête) ===== */
(function(){
  var b=document.getElementById('burger'),m=document.getElementById('navmenu');
  if(!b||!m)return;
  function close(){b.classList.remove('open');m.classList.remove('open');document.body.classList.remove('menu-open');b.setAttribute('aria-expanded','false');}
  b.addEventListener('click',function(e){e.stopPropagation();var o=!m.classList.contains('open');m.classList.toggle('open',o);b.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o?'true':'false');});
  document.addEventListener('click',function(e){if(m.classList.contains('open')&&!m.contains(e.target)&&!b.contains(e.target))close();});
  m.addEventListener('click',function(e){if(e.target.closest('a'))close();});
  addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  addEventListener('scroll',function(){if(m.classList.contains('open'))close();},{passive:true});
})();

/* ===== Bulle d'appel : numéro masqué pendant le scroll, ressort à l'arrêt ===== */
(function(){
  var fab=document.querySelector('.wa-fab');if(!fab)return;
  var t;
  addEventListener('scroll',function(){
    fab.classList.add('scrolling');
    clearTimeout(t);
    t=setTimeout(function(){fab.classList.remove('scrolling');},650);
  },{passive:true});
})();

/* ===== Rappel sous 2h (mini-formulaire hero) ===== */
(function(){
  var f=document.getElementById('cbForm');if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=f.querySelector('button'),tel=f.querySelector('input[name=telephone]');
    if(!tel.value.trim())return;
    btn.disabled=true;btn.textContent='Envoi…';
    fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(f)})
      .then(function(r){return r.json();})
      .then(function(d){
        var wrap=f.closest('.hero-cb-wrap');
        if(wrap){wrap.innerHTML='<div class="hero-cb-ok">✅ Merci ! On vous rappelle sous 2h. (Urgent ? Appelez le 06 49 02 42 14)</div>';}
      })
      .catch(function(){btn.disabled=false;btn.textContent='Être rappelé(e) ›';alert('Une erreur est survenue, réessayez ou appelez le 06 49 02 42 14.');});
  });
})();
