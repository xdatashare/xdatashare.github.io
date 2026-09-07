  // nav shadow on scroll
  const nav=document.getElementById('nav');
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>40);
  window.addEventListener('scroll',onScroll);onScroll();

  // staggered hero reveal on load
  window.addEventListener('load',()=>{
    document.querySelectorAll('.hero .rv').forEach(el=>el.classList.add('in'));
  });

  // scroll reveal
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.14});
  document.querySelectorAll('section .rv').forEach(el=>io.observe(el));

  // ---- Data-exchange animation ----
  (function(){
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

    function render(p){
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
    function tick(){render(phases[i]);i=(i+1)%phases.length;}

    const startIO=new IntersectionObserver((es)=>{
      es.forEach(e=>{
        if(e.isIntersecting&&!running){running=true;tick();setInterval(tick,2900);}
      });
    },{threshold:.3});
    startIO.observe(svg);
  })();

  // ---- Hero: secure data-sharing network (refined) ----
  (function(){
    const canvas=document.getElementById('heroCanvas');
    if(!canvas)return;
    const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx=canvas.getContext('2d');
    const RED='235,32,38';
    let W,H,dpr,nodes=[],edges=[],packets=[],raf=null,running=false,t0=0;
    const isMobile=()=>window.innerWidth<760;

    function size(){
      const r=canvas.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,2);
      W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function build(){
      const count=isMobile()?9:16;
      nodes=[];
      for(let i=0;i<count;i++){
        nodes.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-.5)*0.10, vy:(Math.random()-.5)*0.10,
          r:1.8+Math.random()*1.8, glow:0,
          tw:Math.random()*Math.PI*2, tws:0.4+Math.random()*0.8
        });
      }
      edges=[];
      const maxDist=isMobile()?280:330;
      for(let i=0;i<nodes.length;i++){
        const d=nodes.map((n,j)=>({j,dist:Math.hypot(n.x-nodes[i].x,n.y-nodes[i].y)}))
          .filter(o=>o.j!==i).sort((a,b)=>a.dist-b.dist);
        for(let k=0;k<2;k++){
          if(d[k]&&d[k].dist<maxDist){
            const a=Math.min(i,d[k].j),b=Math.max(i,d[k].j);
            if(!edges.some(e=>e.a===a&&e.b===b))edges.push({a,b,maxDist});
          }
        }
      }
    }

    function spawnPacket(){
      if(!edges.length)return;
      const e=edges[Math.floor(Math.random()*edges.length)];
      const dir=Math.random()<.5;
      packets.push({a:dir?e.a:e.b,b:dir?e.b:e.a,t:0,speed:0.005+Math.random()*0.004});
    }

    let lastSpawn=0;
    function frame(ts){
      if(!t0)t0=ts;
      const time=(ts-t0)*0.001;
      ctx.clearRect(0,0,W,H);

      for(const n of nodes){
        n.x+=n.vx;n.y+=n.vy;
        if(n.x<0||n.x>W)n.vx*=-1;
        if(n.y<0||n.y>H)n.vy*=-1;
        if(n.glow>0)n.glow-=0.015;
      }

      for(const e of edges){
        const a=nodes[e.a],b=nodes[e.b];
        if(!a||!b)continue;
        const dist=Math.hypot(a.x-b.x,a.y-b.y);
        const fade=Math.max(0,1-dist/e.maxDist);
        const alpha=0.04+fade*0.06;
        const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        grad.addColorStop(0,'rgba(255,255,255,'+(alpha*0.6).toFixed(3)+')');
        grad.addColorStop(0.5,'rgba(255,255,255,'+alpha.toFixed(3)+')');
        grad.addColorStop(1,'rgba(255,255,255,'+(alpha*0.6).toFixed(3)+')');
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=grad;ctx.lineWidth=1;ctx.stroke();
      }

      if(ts-lastSpawn>(isMobile()?1900:1100)){lastSpawn=ts;spawnPacket();}
      for(let i=packets.length-1;i>=0;i--){
        const p=packets[i];p.t+=p.speed;
        const a=nodes[p.a],b=nodes[p.b];
        if(!a||!b){packets.splice(i,1);continue;}
        if(p.t>=1){nodes[p.b].glow=1;packets.splice(i,1);continue;}
        for(let j=0;j<8;j++){
          const tt=p.t-j*0.02; if(tt<0)continue;
          const x=a.x+(b.x-a.x)*tt, y=a.y+(b.y-a.y)*tt;
          const al=(1-j/8)*0.5, rad=(1-j/8)*2.6+0.5;
          ctx.fillStyle='rgba('+RED+','+al.toFixed(3)+')';
          ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
        }
        const x=a.x+(b.x-a.x)*p.t, y=a.y+(b.y-a.y)*p.t;
        const g=ctx.createRadialGradient(x,y,0,x,y,9);
        g.addColorStop(0,'rgba('+RED+',0.8)');g.addColorStop(1,'rgba('+RED+',0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,210,210,1)';ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();
      }

      for(const n of nodes){
        const tw=0.5+0.5*Math.sin(time*n.tws+n.tw);
        const baseA=0.30+tw*0.20;
        const hg=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*4);
        hg.addColorStop(0,'rgba(255,255,255,'+(0.10+tw*0.06).toFixed(3)+')');
        hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;ctx.beginPath();ctx.arc(n.x,n.y,n.r*4,0,Math.PI*2);ctx.fill();
        if(n.glow>0){
          ctx.strokeStyle='rgba('+RED+','+(n.glow*0.7)+')';
          ctx.lineWidth=1.1;ctx.beginPath();
          ctx.arc(n.x,n.y,n.r+3+7*(1-n.glow),0,Math.PI*2);ctx.stroke();
        }
        ctx.fillStyle='rgba(255,255,255,'+baseA.toFixed(3)+')';
        ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();
      }

      raf=requestAnimationFrame(frame);
    }

    function start(){if(running)return;running=true;lastSpawn=0;t0=0;raf=requestAnimationFrame(frame);}
    function stop(){running=false;if(raf)cancelAnimationFrame(raf);}
    function init(){size();build();packets=[];}
    init();

    if(reduce){
      for(const e of edges){const a=nodes[e.a],b=nodes[e.b];
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;ctx.stroke();}
      for(const n of nodes){
        const hg=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*4);
        hg.addColorStop(0,'rgba(255,255,255,0.10)');hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;ctx.beginPath();ctx.arc(n.x,n.y,n.r*4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.4)';
        ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();}
      return;
    }

    const heroEl=document.getElementById('top');
    const vis=new IntersectionObserver((es)=>{es.forEach(e=>{e.isIntersecting?start():stop();});},{threshold:0});
    vis.observe(heroEl);

    let rt;
    window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{
      const wasRunning=running;stop();init();if(wasRunning)start();
    },200);});
  })();
