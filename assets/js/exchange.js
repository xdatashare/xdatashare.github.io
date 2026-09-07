// ---- Data-exchange animation ----
(function () {
  function initDataExchangeAnimation() {
    const svg=document.querySelector('.ex-svg');
    if(!svg)return;
    const label=document.getElementById('exLabel');
    const steps=[...document.querySelectorAll('.ex-step')];
    const authority=document.querySelector('.node-authority');
    const provider=document.querySelector('.node-provider');
    const consumer=document.querySelector('.node-consumer');

    // each phase: label, which nodes are active, and which CSS state classes apply
    const phases=[
      {label:'La Autoridad emite credenciales verificables (VC) a los participantes',
       active:['authority','provider','consumer'], cls:['issuing','t-cred']},
      {label:'El proveedor publica un activo de datos en el catálogo (DCAT)',
       active:['provider'], cls:['creds','cat-on','w-pc','publish','t-publish']},
      {label:'El consumidor explora el catálogo y localiza la oferta',
       active:['consumer'], cls:['creds','cat-on','w-cc','browse','t-browse']},
      {label:'Negociación del contrato vía DSP, validando las credenciales',
       active:['provider','consumer'], cls:['creds','w-direct','t-nego']},
      {label:'Acuerdo de contrato firmado entre ambas partes',
       active:['provider','consumer'], cls:['creds','w-direct']},
      {label:'Transferencia de datos (Push / Pull · EDR), supervisada en tiempo real',
       active:['provider','consumer'], cls:['creds','w-direct','t-data']}
    ];
    const allCls=['issuing','t-cred','creds','cat-on','w-pc','publish','t-publish',
                  'w-cc','browse','t-browse','w-direct','t-nego','t-data'];
    let i=0, running=false;

    function renderPhase(p){
      label.style.opacity=0;
      setTimeout(()=>{label.textContent=p.label;label.style.opacity=1;},180);
      authority.classList.toggle('active',p.active.includes('authority'));
      provider.classList.toggle('active',p.active.includes('provider'));
      consumer.classList.toggle('active',p.active.includes('consumer'));
      // reset all state classes, force reflow so animations restart, then apply
      allCls.forEach(c=>svg.classList.remove(c));
      void svg.offsetWidth;
      p.cls.forEach(c=>svg.classList.add(c));
      steps.forEach((s,idx)=>s.classList.toggle('on',idx===i));
    }
    function advancePhase(){renderPhase(phases[i]);i=(i+1)%phases.length;}

    const startIO=new IntersectionObserver((es)=>{
      es.forEach(e=>{
        if(e.isIntersecting&&!running){running=true;advancePhase();setInterval(advancePhase,2900);}
      });
    },{threshold:.3});
    startIO.observe(svg);
  }

  initDataExchangeAnimation();
})();
