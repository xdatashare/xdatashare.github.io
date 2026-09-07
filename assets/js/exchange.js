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
    const phaseStates=[
      {active:['authority','provider','consumer'], cls:['issuing','t-cred']},
      {active:['provider'], cls:['creds','cat-on','w-pc','publish','t-publish']},
      {active:['consumer'], cls:['creds','cat-on','w-cc','browse','t-browse']},
      {active:['provider','consumer'], cls:['creds','w-direct','t-nego']},
      {active:['provider','consumer'], cls:['creds','w-direct']},
      {active:['provider','consumer'], cls:['creds','w-direct','t-data']}
    ];
    const phases=phaseStates.map((phase,index)=>({
      ...phase,
      label:steps[index]?.dataset.phaseLabel||steps[index]?.textContent.trim()||''
    }));
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
