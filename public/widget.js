/* Meetzy Widget v1.0 — https://meetzy.ai */
"use strict";(()=>{var V=class{constructor(n){this.startTime=Date.now();this.sectionTimers={};this.activeSections=new Set;this.triggered=new Set;this.sectionObserver=null;this.intentTimer=null;this.lastScrollY=0;this.lastScrollTime=Date.now();this.onTrigger=n,this.ctx={timeOnSite:0,currentPage:window.location.pathname,pagesVisited:[window.location.pathname],sectionsViewed:{},hoveredElements:[],scrollDepth:{},referrer:document.referrer,searchQuery:this.extractSearchQuery(),localHour:new Date().getHours(),isReturnVisitor:!!localStorage.getItem("mz_visited"),device:window.innerWidth<768?"mobile":"desktop",scrollSpeed:"normal",inferredIntent:"exploring"}}extractSearchQuery(){var n,i;try{let e=new URL(document.referrer);return(i=(n=e.searchParams.get("q"))!=null?n:e.searchParams.get("query"))!=null?i:""}catch(e){return""}}init(){localStorage.setItem("mz_visited","true"),this.trackTime(),this.trackSections(),this.trackHover(),this.trackScroll(),this.inferIntentLoop(),this.triggerLoop(),window.__mzSections={}}trackTime(){setInterval(()=>{this.ctx.timeOnSite=Math.round((Date.now()-this.startTime)/1e3);for(let i of this.activeSections)this.ctx.sectionsViewed[i]||(this.ctx.sectionsViewed[i]={time:0,revisits:0}),this.ctx.sectionsViewed[i].time+=2;let n=window;if(n.__mzSections!==void 0)for(let[i,e]of Object.entries(this.ctx.sectionsViewed))n.__mzSections[i]=e.time;n.__mzIntent!==void 0&&(n.__mzIntent=this.ctx.inferredIntent)},2e3)}trackSections(){this.sectionObserver=new IntersectionObserver(i=>{for(let e of i){let r=e.target,a=r.id||r.dataset.section||r.className.split(" ")[0]||`section-${Math.random().toString(36).slice(2,6)}`;r.id||(r.id=`mz-s-${a}`),e.isIntersecting?(this.activeSections.add(a),this.ctx.sectionsViewed[a]?this.ctx.sectionsViewed[a].revisits++:this.ctx.sectionsViewed[a]={time:0,revisits:0}):this.activeSections.delete(a)}},{threshold:.4});let n=i=>{this.sectionObserver&&this.sectionObserver.observe(i)};document.querySelectorAll("section, [data-section], main > div").forEach(n),new MutationObserver(i=>{for(let e of i)for(let r of e.addedNodes)r instanceof Element&&r.matches("section, [data-section]")&&n(r)}).observe(document.body,{childList:!0,subtree:!0})}trackHover(){let n=null;document.addEventListener("mousemove",i=>{n&&clearTimeout(n),n=setTimeout(()=>{let e=document.elementFromPoint(i.clientX,i.clientY);if(!e)return;let r=e.id||e.className.split(" ")[0]||e.tagName.toLowerCase();r&&!this.ctx.hoveredElements.includes(r)&&(this.ctx.hoveredElements.push(r),this.ctx.hoveredElements.length>20&&this.ctx.hoveredElements.shift())},3e3)},{passive:!0})}trackScroll(){window.addEventListener("scroll",()=>{let n=Date.now(),i=Math.abs(window.scrollY-this.lastScrollY),e=n-this.lastScrollTime,r=i/Math.max(e,1);this.ctx.scrollSpeed=r>2?"fast":r<.5?"slow":"normal",this.ctx.scrollDepth[this.ctx.currentPage]=Math.round(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100),this.lastScrollY=window.scrollY,this.lastScrollTime=n},{passive:!0})}inferIntentLoop(){this.intentTimer=setInterval(()=>{var o,d;let{sectionsViewed:n,isReturnVisitor:i,timeOnSite:e,pagesVisited:r}=this.ctx,a=(d=(o=n.pricing)!=null?o:n.precios)!=null?d:{time:0,revisits:0};r.filter(m=>m.includes("pric")).length>=3||a.revisits>=3?this.ctx.inferredIntent="ready_to_act":a.revisits>=2?this.ctx.inferredIntent="comparing_plans":a.time>45?this.ctx.inferredIntent="evaluating_pricing":i?this.ctx.inferredIntent="returning_interested":e>120?this.ctx.inferredIntent="deeply_exploring":this.ctx.inferredIntent="exploring"},2e3)}triggerLoop(){setInterval(()=>{let n=this.checkTriggers();n&&this.onTrigger(n)},3e3)}checkTriggers(){var s,o;let{sectionsViewed:n,inferredIntent:i,isReturnVisitor:e,timeOnSite:r}=this.ctx,a=(o=(s=n.pricing)!=null?s:n.precios)!=null?o:{time:0,revisits:0};return e&&r>8&&!this.triggered.has("return")?(this.triggered.add("return"),"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?"):a.time>45&&!this.triggered.has("pricing")?(this.triggered.add("pricing"),"Vi que estuviste un rato mirando los planes. \xBFQuer\xE9s que te ayude a entender cu\xE1l tiene m\xE1s sentido para vos?"):a.revisits>=2&&!this.triggered.has("pricing_revisit")?(this.triggered.add("pricing_revisit"),"Volviste a los precios. \xBFHay algo que no qued\xF3 claro?"):i==="ready_to_act"&&!this.triggered.has("ready")?(this.triggered.add("ready"),"Llev\xE1s un rato evaluando. \xBFQuer\xE9s que te cuente c\xF3mo ser\xEDa para tu negocio espec\xEDfico?"):r>180&&!this.triggered.has("long_session")?(this.triggered.add("long_session"),"Llev\xE1s un rato explorando. \xBFEncontraste lo que buscabas?"):null}getContext(){return{...this.ctx}}getContextPrompt(){let n=this.ctx;return`
CONTEXTO DEL VISITANTE EN TIEMPO REAL:
- Tiempo en el sitio: ${n.timeOnSite} segundos
- P\xE1gina actual: ${n.currentPage}
- P\xE1ginas visitadas: ${n.pagesVisited.join(" \u2192 ")}
- Secciones y tiempo: ${JSON.stringify(n.sectionsViewed)}
- Elementos donde se detuvo: ${n.hoveredElements.slice(-8).join(", ")}
- Vino de: ${n.referrer||"directo"}
- Busc\xF3: ${n.searchQuery||"no disponible"}
- Hora local: ${n.localHour}hs
- Visita anterior: ${n.isReturnVisitor?"s\xED":"no"}
- Velocidad de scroll: ${n.scrollSpeed}
- Intenci\xF3n inferida: ${n.inferredIntent}

INSTRUCCI\xD3N CR\xCDTICA: Us\xE1 este contexto para responder con precisi\xF3n quir\xFArgica.
No preguntes lo que ya sab\xE9s. No expliques desde cero si ya explor\xF3.
Si la intenci\xF3n es evaluating_pricing, habl\xE1 de pricing.
Si la intenci\xF3n es comparing_plans, ayudalo a decidir entre planes.
Si son m\xE1s de las 22hs o menos de las 7hs, s\xE9 muy conciso.
Si es return visitor, asum\xED que ya conoce el producto b\xE1sico.
Si el scroll speed fue lento, la persona est\xE1 leyendo con atenci\xF3n.`.trim()}destroy(){this.sectionObserver&&this.sectionObserver.disconnect(),this.intentTimer&&clearInterval(this.intentTimer)}};function J(t,n=50){let i=parseInt(t.slice(1,3),16),e=parseInt(t.slice(3,5),16),r=parseInt(t.slice(5,7),16);return`rgb(${Math.min(255,i+n)},${Math.min(255,e+n)},${Math.min(255,r+n)})`}function W(t,n,i,e,r,a){let s=a.subtype==="female",o=s?"#f5c5a0":"#e8b88a",d=s?"#4a2c0a":"#2c1a0a";t.save(),t.translate(n,i+r.breathePhase*1.5*e),t.fillStyle=a.brandColor,t.beginPath(),t.roundRect(-28*e,30*e,56*e,55*e,8*e),t.fill(),t.fillStyle="rgba(255,255,255,0.8)",t.font=`bold ${13*e}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("M",n,i+55*e),t.fillStyle=a.brandColor,t.beginPath(),t.roundRect(-44*e,32*e,17*e,42*e,6*e),t.fill(),t.beginPath(),t.roundRect(27*e,32*e,17*e,42*e,6*e),t.fill(),t.fillStyle=o,t.beginPath(),t.roundRect(-8*e,8*e,16*e,22*e,4*e),t.fill(),t.save(),t.translate(r.headWobble*e,0),t.fillStyle=d,s?(t.beginPath(),t.ellipse(n,i-32*e,34*e,38*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.roundRect(n-33*e,i-35*e,11*e,55*e,6*e),t.fill(),t.beginPath(),t.roundRect(n+22*e,i-35*e,11*e,55*e,6*e),t.fill()):(t.beginPath(),t.ellipse(n,i-34*e,29*e,22*e,0,0,Math.PI),t.fill()),t.fillStyle=o,t.beginPath(),t.ellipse(n,i-20*e,29*e,33*e,0,0,Math.PI*2),t.fill();let m=i-26*e,x=r.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,m,8*e,8*x*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,m,8*e,8*x*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-10*e,m,5*e,5*x*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,m,5*e,5*x*e,0,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255,255,255,0.6)",t.beginPath(),t.ellipse(n-8*e,m-2*e,2*e,2*x*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+12*e,m-2*e,2*e,2*x*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#c0392b",t.beginPath(),t.ellipse(n,i-5*e,10*e,(3+r.mouthOpen*5)*e,0,0,Math.PI),t.fill(),t.restore(),t.restore()}function Z(t,n,i,e,r,a){t.save(),t.translate(n,i+r.breathePhase*1.5*e),t.fillStyle=a.brandColor,t.beginPath(),t.roundRect(-30*e,20*e,60*e,65*e,10*e),t.fill(),t.save(),t.translate(r.headWobble*e,0),t.fillStyle="#8B5E3C",t.beginPath(),t.ellipse(n-28*e,i-18*e,13*e,20*e,-.4,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+28*e,i-18*e,13*e,20*e,.4,0,Math.PI*2),t.fill(),t.fillStyle="#c4895f",t.beginPath(),t.ellipse(n,i-15*e,33*e,30*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#e0b080",t.beginPath(),t.ellipse(n,i,16*e,13*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n,i-4*e,6*e,5*e,0,0,Math.PI*2),t.fill();let s=r.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-14*e,i-22*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-14*e,i-22*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#6b3a1f",t.lineWidth=2*e,t.beginPath(),t.moveTo(n-8*e,i+6*e),t.quadraticCurveTo(n,i+(10+r.mouthOpen*8)*e,n+8*e,i+6*e),t.stroke(),t.restore(),t.restore()}function K(t,n,i,e,r){let a=r.isTalking?Math.abs(Math.sin(r.frame*.3))*5:0;t.save(),t.translate(n,i-a*e+r.breathePhase*1.5*e);let s=t.createRadialGradient(-14*e,i-20*e,4*e,0,i+10*e,52*e);s.addColorStop(0,"#ffa030"),s.addColorStop(1,"#e05800"),t.fillStyle=s,t.beginPath(),t.arc(0,i+10*e,52*e,0,Math.PI*2),t.fill(),t.fillStyle="#2ea032",t.beginPath(),t.ellipse(5*e,i-46*e,7*e,17*e,.5,0,Math.PI*2),t.fill(),t.strokeStyle="#4a2c0a",t.lineWidth=3*e,t.beginPath(),t.moveTo(0,i-42*e),t.quadraticCurveTo(5*e,i-56*e,0,i-62*e),t.stroke();let o=r.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(-16*e,i-5*e,9*e,9*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,9*e,9*o*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(-16*e,i-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#c05000",t.lineWidth=3*e,t.beginPath(),t.arc(0,i+10*e,15*e,.2,Math.PI-.2),t.stroke(),r.mouthOpen>.1&&(t.fillStyle="#c05000",t.beginPath(),t.ellipse(0,i+20*e,10*e,(3+r.mouthOpen*7)*e,0,0,Math.PI),t.fill()),t.restore()}function X(t,n,i,e,r,a){t.save(),t.translate(n,i+r.breathePhase*1.5*e),t.strokeStyle=a.brandColor,t.lineWidth=7*e,t.beginPath(),t.arc(n+40*e,i+15*e,17*e,-.8,.8),t.stroke(),t.fillStyle=a.brandColor,t.beginPath(),t.moveTo(n-28*e,i-30*e),t.lineTo(n-33*e,i+48*e),t.quadraticCurveTo(n,i+60*e,n+33*e,i+48*e),t.lineTo(n+28*e,i-30*e),t.closePath(),t.fill(),t.fillStyle=J(a.brandColor,40),t.beginPath(),t.ellipse(n,i-30*e,28*e,7*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.25)",t.lineWidth=2.5*e;let s=r.frame*2%20;for(let d=-1;d<=1;d++)t.beginPath(),t.moveTo(n+d*9*e,i-38*e-s*e),t.quadraticCurveTo(n+(d+1)*7*e,i-52*e-s*e,n+d*7*e,i-65*e-s*e),t.stroke();let o=r.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,i-5*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n-10*e,i-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.8)",t.lineWidth=2.5*e,t.beginPath(),t.arc(n,i+15*e,11*e,.2,Math.PI-.2),t.stroke(),r.mouthOpen>.1&&(t.fillStyle="rgba(0,0,0,0.35)",t.beginPath(),t.ellipse(n,i+22*e,8*e,(2+r.mouthOpen*6)*e,0,0,Math.PI),t.fill()),t.restore()}var A=class{constructor(n,i){this.raf=0;this.canvas=n,this.ctx=n.getContext("2d"),this.config=i,this.state={blinkTimer:150+Math.random()*100,blinkProgress:1,breathePhase:0,mouthOpen:0,headWobble:0,wobbleDir:1,frame:0,isTalking:!1}}setTalking(n){this.state.isTalking=n}updateConfig(n){this.config={...this.config,...n}}start(){let n=()=>{var s,o;let i=this.state,e=this.canvas.width/200,r=this.canvas.width/2,a=this.canvas.height/2;switch(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),i.frame++,i.breathePhase=Math.sin(i.frame*.02),i.blinkTimer--,i.blinkTimer<=0&&(i.blinkTimer=180+Math.random()*120),i.blinkTimer<10?i.blinkProgress=i.blinkTimer<5?i.blinkTimer/5:(10-i.blinkTimer)/5:i.blinkProgress=1,i.headWobble+=i.wobbleDir*.04,Math.abs(i.headWobble)>1.5&&(i.wobbleDir*=-1),i.isTalking?i.mouthOpen=.3+Math.sin(i.frame*.25)*.4:i.mouthOpen=Math.max(0,i.mouthOpen-.08),this.config.type){case"human":W(this.ctx,r,a,e,i,this.config);break;case"animal":Z(this.ctx,r,a,e,i,this.config);break;case"object":(s=this.config.subtype)!=null&&s.includes("taza")||(o=this.config.subtype)!=null&&o.includes("cup")?X(this.ctx,r,a,e,i,this.config):K(this.ctx,r,a,e,i);break;default:W(this.ctx,r,a,e,i,this.config)}this.raf=requestAnimationFrame(n)};this.raf=requestAnimationFrame(n)}stop(){cancelAnimationFrame(this.raf)}};function F(t,n){let i=t.data;switch(t.type){case"card":return ee(i,n);case"gallery":return te(i);case"booking":return ne(i,n);case"pricing":return ie(i,n);case"contact":return re(i,n);default:return document.createElement("div")}}function ee(t,n){var s;let i=document.createElement("div");if(i.className="mz-ui-card",i.style.cssText=`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    margin: 8px 0;
    max-width: 280px;
  `,t.imageUrl){let o=document.createElement("img");o.src=t.imageUrl,o.alt=t.title,o.style.cssText="width:100%; height:140px; object-fit:cover;",i.appendChild(o)}else{let o=document.createElement("div");o.style.cssText=`width:100%; height:80px; background: linear-gradient(135deg, ${n}20, ${n}40); display:flex; align-items:center; justify-content:center;`,o.textContent="\u{1F6CD}\uFE0F",o.style.fontSize="2rem",i.appendChild(o)}let e=document.createElement("div");e.style.cssText="padding: 14px;";let r=document.createElement("p");if(r.style.cssText="color: #F0EDE8; font-weight: 700; font-size: 14px; margin: 0 0 6px;",r.textContent=t.title,e.appendChild(r),t.description){let o=document.createElement("p");o.style.cssText="color: #6b6b6b; font-size: 12px; margin: 0 0 8px; line-height: 1.5;",o.textContent=t.description,e.appendChild(o)}if(t.price){let o=document.createElement("p");o.style.cssText=`color: ${n}; font-weight: 700; font-size: 18px; margin: 0 0 10px;`,o.textContent=t.price,e.appendChild(o)}let a=document.createElement("a");return a.href=(s=t.ctaUrl)!=null?s:"#",a.target="_blank",a.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; text-decoration: none;
    transition: opacity 0.15s;
  `,a.textContent=t.ctaText,a.onmouseenter=()=>a.style.opacity="0.85",a.onmouseleave=()=>a.style.opacity="1",e.appendChild(a),i.appendChild(e),i}function te(t){let n=document.createElement("div");n.style.cssText="margin: 8px 0;";let i=document.createElement("div");if(i.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;",t.images.slice(0,6).forEach(e=>{var s;let r=document.createElement("div");r.style.cssText="flex-shrink:0; width:110px;";let a=document.createElement("img");a.src=e.url,a.alt=(s=e.alt)!=null?s:"",a.style.cssText="width:110px; height:80px; object-fit:cover; border-radius:10px;",r.appendChild(a),i.appendChild(r)}),t.caption){let e=document.createElement("p");e.style.cssText="color: #6b6b6b; font-size: 11px; margin: 6px 0 0;",e.textContent=t.caption,n.appendChild(e)}return n.appendChild(i),n}function ne(t,n){var a;let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let r=document.createElement("a");return r.href=(a=t.calUrl)!=null?a:"#",r.target="_blank",r.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
  `,r.textContent="\u{1F4C5} Reservar reuni\xF3n",i.appendChild(r),i}function ie(t,n){let i=document.createElement("div");i.style.cssText="margin: 8px 0;";let e=document.createElement("div");return e.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px;",t.plans.forEach(r=>{let a=document.createElement("div");a.style.cssText=`
      flex-shrink:0; width:160px;
      background: ${r.highlighted?n+"15":"#1a1a1a"};
      border: 1px solid ${r.highlighted?n+"50":"#2a2a2a"};
      border-radius: 14px; padding: 14px;
    `;let s=document.createElement("p");s.style.cssText="color: #6b6b6b; font-size: 11px; font-weight: 700; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;",s.textContent=r.name,a.appendChild(s);let o=document.createElement("p");o.style.cssText=`color: ${r.highlighted?n:"#F0EDE8"}; font-weight: 700; font-size: 20px; margin: 0 0 10px;`,o.textContent=r.price,a.appendChild(o);let d=document.createElement("ul");if(d.style.cssText="margin:0 0 12px; padding: 0 0 0 14px;",r.features.slice(0,4).forEach(m=>{let x=document.createElement("li");x.style.cssText="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;",x.textContent=m,d.appendChild(x)}),a.appendChild(d),r.ctaUrl){let m=document.createElement("a");m.href=r.ctaUrl,m.target="_blank",m.style.cssText=`
        display:block; text-align:center; padding: 7px;
        background: ${r.highlighted?n:"transparent"};
        border: 1px solid ${r.highlighted?"transparent":"#333"};
        color: ${r.highlighted?"#fff":"#F0EDE8"};
        border-radius: 8px; font-size: 11px; font-weight:600; text-decoration:none;
      `,m.textContent="Elegir plan",a.appendChild(m)}e.appendChild(a)}),i.appendChild(e),i}function re(t,n){let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let r=document.createElement("form");r.style.cssText="display:flex; flex-direction:column; gap:8px;",r.addEventListener("submit",s=>s.preventDefault()),t.fields.forEach(s=>{var d,m;let o=document.createElement("input");o.type=(d=s.type)!=null?d:"text",o.placeholder=s.label,o.required=(m=s.required)!=null?m:!1,o.style.cssText=`
      background: #0e0e0e; border: 1px solid #222; color: #F0EDE8;
      border-radius: 10px; padding: 8px 12px; font-size: 12px; outline:none;
    `,o.onfocus=()=>o.style.borderColor=n,o.onblur=()=>o.style.borderColor="#222",r.appendChild(o)});let a=document.createElement("button");return a.type="submit",a.style.cssText=`
    background: ${n}; color: #fff;
    border: none; border-radius: 10px; padding: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
  `,a.textContent="Enviar",r.appendChild(a),i.appendChild(r),i}async function j(t){let n=new AudioContext,i=await n.decodeAudioData(t),e=n.createBufferSource();return e.buffer=i,e.connect(n.destination),new Promise(r=>{e.onended=()=>{n.close(),r()},e.start()})}var q="https://app.meetzy.ai";function Q(){let t=localStorage.getItem("mz_uid");return t||(t=Math.random().toString(36).slice(2)+Date.now().toString(36),localStorage.setItem("mz_uid",t)),t}async function Y(){var i;let t=(i=window.MEETZYCONFIG)==null?void 0:i.siteId;if(!t)return;let n;try{let e=await fetch(`${q}/api/sites/${t}/config`);if(!e.ok||(n=await e.json(),!n.isActive))return}catch(e){return}if(n.embedMode==="fullpage"){oe(t,n);return}ae(t,n)}function ae(t,n){var w;let i=document.createElement("div");i.id="meetzy-host",i.style.cssText="position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:'DM Sans',sans-serif;",document.body.appendChild(i);let e=i.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=se(n.brandColor,n.brandColor2),e.appendChild(r);let a=Q(),s=n.brandColor,o=n.plan==="pro"||n.plan==="elite",d=n.plan==="elite",m="observing",x=(w=sessionStorage.getItem(`mz_c_${t}`))!=null?w:void 0,S=!1,_=0,u=null,E=document.createElement("div");E.className="mz-dot-presence",e.appendChild(E);let k=document.createElement("div");k.className="mz-trigger mz-hidden",e.appendChild(k);let y=document.createElement("div");y.className="mz-panel mz-hidden",e.appendChild(y);let H=new V(l=>{m==="observing"&&(Date.now()<_||N(l))});H.init();function N(l){var p,g;m="triggering",E.classList.add("mz-hidden"),k.innerHTML=`
      <div class="mz-trigger-inner">
        <div class="mz-trigger-avatar">${(g=(p=n.agentName[0])==null?void 0:p.toUpperCase())!=null?g:"M"}</div>
        <div class="mz-trigger-body">
          <p class="mz-trigger-text">${l}</p>
          <div class="mz-trigger-actions">
            <button class="mz-trigger-yes">S\xED, contame</button>
            <button class="mz-trigger-no">Ahora no</button>
          </div>
        </div>
      </div>
    `,k.classList.remove("mz-hidden"),k.classList.add("mz-visible"),e.querySelector(".mz-trigger-yes").addEventListener("click",()=>{z(l)}),e.querySelector(".mz-trigger-no").addEventListener("click",()=>{k.classList.remove("mz-visible"),k.classList.add("mz-hidden"),E.classList.remove("mz-hidden"),m="observing",_=Date.now()+300*1e3})}function z(l){m="chatting",k.classList.remove("mz-visible"),k.classList.add("mz-hidden"),E.classList.add("mz-hidden"),B(),y.classList.remove("mz-hidden"),y.classList.add("mz-visible");let p=l!=null?l:G(H,n);O(p)}function R(){m="observing",y.classList.remove("mz-visible"),y.classList.add("mz-hidden"),E.classList.remove("mz-hidden"),u==null||u.stop(),u=null}E.addEventListener("click",()=>z());function B(){y.innerHTML="";let l=document.createElement("div");if(l.className="mz-header",o&&n.avatarType){let h=document.createElement("canvas");h.width=52,h.height=52,h.className="mz-avatar-canvas",l.appendChild(h),setTimeout(()=>{var P;u=new A(h,{type:n.avatarType,subtype:(P=n.avatarSubtype)!=null?P:"",brandColor:s,brandColor2:n.brandColor2}),u.start()},30)}else{let h=document.createElement("div");h.className="mz-avatar-initials",h.textContent=n.agentName.slice(0,2).toUpperCase(),l.appendChild(h)}let p=document.createElement("div");p.className="mz-header-info",p.innerHTML=`
      <p class="mz-agent-name">${n.agentName}</p>
      <p class="mz-agent-role"><span class="mz-online-dot"></span>${n.agentRole}</p>
    `,l.appendChild(p);let g=document.createElement("button");g.className="mz-close-btn",g.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',g.onclick=R,l.appendChild(g),y.appendChild(l);let b=document.createElement("div");b.className="mz-messages",b.id="mz-msgs",y.appendChild(b);let C=document.createElement("div");C.className="mz-input-area";let v=document.createElement("textarea");v.className="mz-textarea",v.placeholder=`Preguntale a ${n.agentName}\u2026`,v.rows=1,v.addEventListener("input",()=>{v.style.height="auto",v.style.height=Math.min(v.scrollHeight,96)+"px"}),v.addEventListener("keydown",h=>{if(h.key==="Enter"&&!h.shiftKey){h.preventDefault();let P=v.value.trim();P&&!S&&T(P)}}),C.appendChild(v);let D=document.createElement("button");if(D.className="mz-send-btn",D.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',D.onclick=()=>{let h=v.value.trim();h&&!S&&T(h)},C.appendChild(D),y.appendChild(C),n.plan!=="elite"){let h=document.createElement("div");h.className="mz-footer",h.innerHTML=`Powered by <a href="https://meetzy.ai" target="_blank" style="color:${s}">Meetzy</a>`,y.appendChild(h)}}function O(l){let p=e.getElementById("mz-msgs");if(!p)return;let g=document.createElement("div");g.className="mz-msg-wrap mz-msg-agent";let b=document.createElement("div");b.className="mz-bubble mz-bubble-agent",b.innerHTML='<span class="mz-typing"><span></span><span></span><span></span></span>',g.appendChild(b),p.appendChild(g),p.scrollTop=p.scrollHeight,setTimeout(()=>{b.textContent="";let C=0,v=setInterval(()=>{C++,b.textContent=l.slice(0,C),p.scrollTop=p.scrollHeight,C>=l.length&&clearInterval(v)},20)},600)}function c(l){let p=e.getElementById("mz-msgs");if(!p)return;let g=document.createElement("div");g.className="mz-msg-wrap mz-msg-user";let b=document.createElement("div");b.className="mz-bubble mz-bubble-user",b.textContent=l,g.appendChild(b),p.appendChild(g),p.scrollTop=p.scrollHeight}function f(){let l=e.getElementById("mz-msgs");if(!l)return document.createElement("div");let p=document.createElement("div");p.className="mz-msg-wrap mz-msg-agent";let g=document.createElement("div");return g.className="mz-bubble mz-bubble-agent",g.innerHTML='<span class="mz-typing"><span></span><span></span><span></span></span>',p.appendChild(g),l.appendChild(p),l.scrollTop=l.scrollHeight,g}async function T(l){if(S)return;let p=e.querySelector(".mz-textarea");p&&(p.value="",p.style.height="auto"),c(l),S=!0,u==null||u.setTalking(!0);let g=f();try{let b=await fetch(`${q}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:t,message:l,conversationId:x,visitorId:a,plan:n.plan,visitorContext:H.getContext(),visitorContextPrompt:H.getContextPrompt()})});if(!b.ok||!b.body){g.textContent="Error al procesar.";return}let C=b.headers.get("X-Conversation-Id");C&&(x=C,sessionStorage.setItem(`mz_c_${t}`,C));let v=b.body.getReader(),D=new TextDecoder,h="";for(g.textContent="";;){let{done:P,value:M}=await v.read();if(P)break;for(let L of D.decode(M).split(`
`))if(L.startsWith("data: "))try{let $=JSON.parse(L.slice(6));if($.type==="text"&&$.content){h+=$.content,g.textContent=h;let I=e.getElementById("mz-msgs");I&&(I.scrollTop=I.scrollHeight)}if($.type==="ui_component"&&$.component&&o){let I=F($.component,s),U=e.getElementById("mz-msgs");U&&(U.appendChild(I),U.scrollTop=U.scrollHeight)}$.type==="done"&&h&&d&&n.voiceEnabled&&fetch(`${q}/api/tts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:h,siteId:t})}).then(I=>I.arrayBuffer()).then(I=>(u==null||u.setTalking(!0),j(I))).then(()=>u==null?void 0:u.setTalking(!1)).catch(()=>{})}catch($){}}}catch(b){g.textContent="Error de conexi\xF3n."}finally{S=!1,u==null||u.setTalking(!1)}}}function oe(t,n){Array.from(document.body.children).forEach(c=>{c.id!=="meetzy-fp-host"&&(c.style.display="none")}),document.body.style.cssText="margin:0;padding:0;overflow:hidden;";let i=document.createElement("div");i.id="meetzy-fp-host",i.style.cssText="position:fixed;inset:0;z-index:2147483647;",document.body.appendChild(i);let e=i.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=le(n.brandColor),e.appendChild(r);let a=Q(),s,o=!1,d=null,m=n.plan==="pro"||n.plan==="elite",x=n.plan==="elite",S=new V(()=>{});S.init();let _=document.createElement("div");_.className="mz-fp-wrap",e.appendChild(_);let u=document.createElement("div");if(u.className="mz-fp-sidebar",u.innerHTML=`
    <div class="mz-fp-avatar-wrap" id="mz-fp-av"></div>
    <div class="mz-fp-agent-info">
      <p class="mz-fp-agent-name">${n.agentName}</p>
      <p class="mz-fp-agent-role"><span class="mz-fp-dot"></span>${n.agentRole}</p>
    </div>
    <div style="flex:1"></div>
    <p class="mz-fp-powered">Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a></p>
  `,_.appendChild(u),m&&n.avatarType){let c=document.createElement("canvas");c.width=110,c.height=110,c.style.borderRadius="50%",u.querySelector("#mz-fp-av").appendChild(c),setTimeout(()=>{var f;d=new A(c,{type:n.avatarType,subtype:(f=n.avatarSubtype)!=null?f:"",brandColor:n.brandColor,brandColor2:n.brandColor2}),d.start()},50)}else{let c=document.createElement("div");c.className="mz-fp-av-initials",c.textContent=n.agentName.slice(0,2).toUpperCase(),u.querySelector("#mz-fp-av").appendChild(c)}let E=document.createElement("div");E.className="mz-fp-chat";let k=document.createElement("div");k.className="mz-fp-messages",k.id="mz-fp-msgs",E.appendChild(k);let y=document.createElement("div");y.className="mz-fp-chips",y.id="mz-fp-chips",(n.primaryQuestion?[n.primaryQuestion,"\xBFCu\xE1les son los precios?","\xBFC\xF3mo funciona?"]:["\xBFQu\xE9 ofrecen?","\xBFCu\xE1les son los precios?","\xBFC\xF3mo empiezo?"]).forEach(c=>{let f=document.createElement("button");f.className="mz-fp-chip",f.textContent=c,f.onclick=()=>{y.style.display="none",O(c)},y.appendChild(f)}),E.appendChild(y);let N=document.createElement("div");N.className="mz-fp-input-area";let z=document.createElement("textarea");z.className="mz-fp-textarea",z.placeholder="Contame qu\xE9 necesit\xE1s\u2026",z.rows=1,z.addEventListener("input",()=>{z.style.height="auto",z.style.height=Math.min(z.scrollHeight,120)+"px"}),z.addEventListener("keydown",c=>{if(c.key==="Enter"&&!c.shiftKey){c.preventDefault();let f=z.value.trim();f&&!o&&O(f)}}),N.appendChild(z);let R=document.createElement("button");R.className="mz-fp-send-btn",R.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',R.onclick=()=>{let c=z.value.trim();c&&!o&&O(c)},N.appendChild(R),E.appendChild(N),_.appendChild(E),B("agent",G(S,n));function B(c,f){let T=e.getElementById("mz-fp-msgs"),w=document.createElement("div");w.className=`mz-fp-msg-wrap mz-fp-${c}`;let l=document.createElement("div");return l.className=`mz-fp-bubble mz-fp-bubble-${c}`,l.textContent=f,w.appendChild(l),T.appendChild(w),T.scrollTop=T.scrollHeight,l}async function O(c){var l;if(o)return;z.value="",z.style.height="auto",(l=e.getElementById("mz-fp-chips"))==null||l.style.setProperty("display","none"),B("user",c),o=!0,d==null||d.setTalking(!0);let f=e.getElementById("mz-fp-msgs"),T=document.createElement("div");T.className="mz-fp-msg-wrap mz-fp-agent";let w=document.createElement("div");w.className="mz-fp-bubble mz-fp-bubble-agent",w.innerHTML='<span class="mz-fp-typing"><span></span><span></span><span></span></span>',T.appendChild(w),f.appendChild(T),f.scrollTop=f.scrollHeight;try{let p=await fetch(`${q}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:t,message:c,conversationId:s,visitorId:a,plan:n.plan,visitorContext:S.getContext(),visitorContextPrompt:S.getContextPrompt()})});if(!p.ok||!p.body){w.textContent="Error.";return}let g=p.headers.get("X-Conversation-Id");g&&(s=g);let b=p.body.getReader(),C=new TextDecoder,v="";for(w.textContent="";;){let{done:D,value:h}=await b.read();if(D)break;for(let P of C.decode(h).split(`
`))if(P.startsWith("data: "))try{let M=JSON.parse(P.slice(6));if(M.type==="text"&&M.content&&(v+=M.content,w.textContent=v,f.scrollTop=f.scrollHeight),M.type==="ui_component"&&M.component&&m){let L=F(M.component,n.brandColor);f.appendChild(L),f.scrollTop=f.scrollHeight}M.type==="done"&&v&&x&&n.voiceEnabled&&fetch(`${q}/api/tts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:v,siteId:t})}).then(L=>L.arrayBuffer()).then(L=>(d==null||d.setTalking(!0),j(L))).then(()=>d==null?void 0:d.setTalking(!1)).catch(()=>{})}catch(M){}}}catch(p){w.textContent="Error."}finally{o=!1,d==null||d.setTalking(!1)}}}function G(t,n){var r,a;let i=t.getContext();return i.isReturnVisitor?"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?":((a=(r=i.sectionsViewed.pricing)!=null?r:i.sectionsViewed.precios)!=null?a:{time:0,revisits:0}).time>20?"Vi que pasaste un rato mirando los planes. \xBFQuer\xE9s que te ayude a entender cu\xE1l tiene m\xE1s sentido para vos?":i.timeOnSite>60?"Llev\xE1s un rato explorando. \xBFPuedo ayudarte a encontrar algo?":n.welcomeMessage}function se(t,n){return`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    /* \u2500\u2500 Dot presence \u2500\u2500 */
    .mz-dot-presence {
      width: 10px; height: 10px; border-radius: 50%;
      background: ${t}; cursor: pointer;
      animation: mz-pulse-dot 2.5s ease-in-out infinite;
      box-shadow: 0 0 0 0 ${t}60;
      transition: transform 0.2s;
    }
    .mz-dot-presence:hover { transform: scale(1.5); }

    /* \u2500\u2500 Trigger card \u2500\u2500 */
    .mz-trigger { position: absolute; bottom: 28px; right: 0; width: 280px; }
    .mz-trigger-inner {
      display: flex; align-items: flex-start; gap: 10px;
      background: #111; border: 1px solid rgba(255,255,255,0.09);
      border-radius: 18px; border-bottom-right-radius: 4px;
      padding: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    }
    .mz-trigger-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${t}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne',sans-serif; font-weight: 800; font-size: 14px;
      flex-shrink: 0;
    }
    .mz-trigger-body { flex: 1; min-width: 0; }
    .mz-trigger-text { font-size: 13px; color: #F0EDE8; line-height: 1.5; margin-bottom: 10px; }
    .mz-trigger-actions { display: flex; gap: 6px; }
    .mz-trigger-yes {
      background: ${t}; color: #fff; border: none; border-radius: 8px;
      padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer;
      font-family: 'DM Sans',sans-serif; transition: opacity 0.15s;
    }
    .mz-trigger-yes:hover { opacity: 0.85; }
    .mz-trigger-no {
      background: transparent; color: rgba(240,237,232,0.4); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 5px 12px; font-size: 11px; cursor: pointer;
      font-family: 'DM Sans',sans-serif; transition: color 0.15s;
    }
    .mz-trigger-no:hover { color: rgba(240,237,232,0.7); }

    /* \u2500\u2500 Panel \u2500\u2500 */
    .mz-panel {
      position: absolute; bottom: 28px; right: 0; width: 380px; height: 560px;
      background: #0e0e0e; border: 1px solid rgba(255,255,255,0.07); border-radius: 22px;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.65);
      opacity: 0; transform: translateY(16px) scale(0.97);
      transition: opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .mz-panel.mz-visible { opacity: 1; transform: translateY(0) scale(1); }

    .mz-header {
      display: flex; align-items: center; gap: 11px;
      padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
    }
    .mz-avatar-initials {
      width: 42px; height: 42px; border-radius: 50%; background: ${t};
      color: #fff; font-family:'Syne',sans-serif; font-weight:800; font-size:15px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .mz-avatar-canvas { border-radius: 50%; flex-shrink: 0; }
    .mz-header-info { flex: 1; min-width: 0; }
    .mz-agent-name { font-family:'Syne',sans-serif; font-weight:700; font-size:13px; color:#F0EDE8; }
    .mz-agent-role { font-size:10px; color:rgba(240,237,232,0.4); display:flex; align-items:center; gap:4px; margin-top:2px; }
    .mz-online-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; flex-shrink:0; }
    .mz-close-btn {
      background:none; border:none; color:rgba(240,237,232,0.35); cursor:pointer; padding:5px;
      border-radius:8px; display:flex; transition:color 0.15s, background 0.15s;
    }
    .mz-close-btn:hover { color:#F0EDE8; background:rgba(255,255,255,0.05); }

    .mz-messages {
      flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:9px;
      scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.05) transparent;
    }
    .mz-msg-wrap { display:flex; }
    .mz-msg-agent { justify-content:flex-start; }
    .mz-msg-user  { justify-content:flex-end; }
    .mz-bubble {
      max-width:82%; padding:9px 13px; border-radius:17px;
      font-size:13px; line-height:1.5; word-wrap:break-word;
    }
    .mz-bubble-agent { background:#1a1a1a; color:#F0EDE8; border-bottom-left-radius:3px; }
    .mz-bubble-user  { background:${t}; color:#fff; border-bottom-right-radius:3px; }

    .mz-typing { display:flex; gap:4px; padding:2px 0; }
    .mz-typing span { width:6px; height:6px; background:${t}; border-radius:50%; animation:mz-bounce 1.2s ease infinite; }
    .mz-typing span:nth-child(2) { animation-delay:0.15s; }
    .mz-typing span:nth-child(3) { animation-delay:0.3s; }

    .mz-input-area { display:flex; align-items:flex-end; gap:8px; padding:11px 14px; border-top:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
    .mz-textarea {
      flex:1; background:#1a1a1a; border:1px solid rgba(255,255,255,0.07);
      color:#F0EDE8; border-radius:13px; padding:9px 13px; font-size:13px; resize:none;
      font-family:'DM Sans',sans-serif; outline:none; max-height:96px; line-height:1.5;
      transition:border-color 0.15s;
    }
    .mz-textarea:focus { border-color:${t}; }
    .mz-textarea::placeholder { color:rgba(240,237,232,0.2); }
    .mz-send-btn {
      width:36px; height:36px; border-radius:50%; background:${t}; border:none;
      display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
      transition:opacity 0.15s, transform 0.15s;
    }
    .mz-send-btn:hover { opacity:0.85; transform:scale(1.06); }
    .mz-footer { text-align:center; padding:7px; font-size:9px; color:rgba(240,237,232,0.2); border-top:1px solid rgba(255,255,255,0.04); flex-shrink:0; }

    .mz-hidden { display:none !important; }
    .mz-visible { display:flex !important; }

    @keyframes mz-pulse-dot {
      0%,100% { box-shadow:0 0 0 0 ${t}60; }
      50%      { box-shadow:0 0 0 6px ${t}00; }
    }
    @keyframes mz-bounce {
      0%,80%,100% { transform:translateY(0); }
      40%          { transform:translateY(-5px); }
    }

    @media (max-width:480px) {
      .mz-panel { position:fixed; inset:0; width:100vw; height:100dvh; border-radius:0; bottom:0; right:0; }
    }
  `}function le(t){return`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    .mz-fp-wrap { display:flex; width:100vw; height:100vh; background:#080808; font-family:'DM Sans',sans-serif; color:#F0EDE8; }

    .mz-fp-sidebar {
      width:260px; flex-shrink:0; background:#0d0d0d; border-right:1px solid rgba(255,255,255,0.05);
      display:flex; flex-direction:column; align-items:center; padding:40px 24px; gap:16px;
    }
    .mz-fp-avatar-wrap { display:flex; justify-content:center; }
    .mz-fp-av-initials {
      width:100px; height:100px; border-radius:50%; background:${t}; color:#fff;
      font-family:'Syne',sans-serif; font-weight:800; font-size:36px;
      display:flex; align-items:center; justify-content:center;
    }
    .mz-fp-agent-info { text-align:center; }
    .mz-fp-agent-name { font-family:'Syne',sans-serif; font-weight:800; font-size:18px; color:#F0EDE8; }
    .mz-fp-agent-role { font-size:12px; color:rgba(240,237,232,0.4); display:flex; align-items:center; justify-content:center; gap:5px; margin-top:4px; }
    .mz-fp-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; display:inline-block; }
    .mz-fp-powered { font-size:10px; color:rgba(240,237,232,0.2); }
    .mz-fp-powered a { color:${t}; text-decoration:none; }

    .mz-fp-chat { flex:1; display:flex; flex-direction:column; min-width:0; }
    .mz-fp-messages {
      flex:1; overflow-y:auto; padding:32px 48px; display:flex; flex-direction:column; gap:14px;
      scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.05) transparent;
    }
    .mz-fp-msg-wrap { display:flex; }
    .mz-fp-agent { justify-content:flex-start; }
    .mz-fp-user  { justify-content:flex-end; }
    .mz-fp-bubble {
      max-width:72%; padding:13px 17px; border-radius:20px;
      font-size:15px; line-height:1.6; word-wrap:break-word;
    }
    .mz-fp-bubble-agent { background:#111; color:#F0EDE8; border:1px solid rgba(255,255,255,0.06); border-bottom-left-radius:4px; }
    .mz-fp-bubble-user  { background:${t}; color:#fff; border-bottom-right-radius:4px; }
    .mz-fp-typing { display:flex; gap:5px; padding:3px 0; }
    .mz-fp-typing span { width:8px; height:8px; background:${t}; border-radius:50%; animation:mz-bounce 1.2s ease infinite; }
    .mz-fp-typing span:nth-child(2) { animation-delay:0.15s; }
    .mz-fp-typing span:nth-child(3) { animation-delay:0.3s; }

    .mz-fp-chips { display:flex; flex-wrap:wrap; gap:8px; padding:0 48px 14px; }
    .mz-fp-chip {
      background:transparent; border:1px solid ${t}40; color:${t}; padding:7px 16px;
      border-radius:100px; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
    }
    .mz-fp-chip:hover { background:${t}12; }

    .mz-fp-input-area { display:flex; align-items:flex-end; gap:12px; padding:16px 48px 32px; border-top:1px solid rgba(255,255,255,0.05); }
    .mz-fp-textarea {
      flex:1; background:#111; border:1px solid rgba(255,255,255,0.07); color:#F0EDE8;
      border-radius:16px; padding:13px 18px; font-size:15px; resize:none;
      font-family:'DM Sans',sans-serif; outline:none; max-height:120px; line-height:1.5;
      transition:border-color 0.15s;
    }
    .mz-fp-textarea:focus { border-color:${t}; }
    .mz-fp-textarea::placeholder { color:rgba(240,237,232,0.2); }
    .mz-fp-send-btn {
      width:48px; height:48px; border-radius:50%; background:${t}; border:none;
      display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:opacity 0.15s,transform 0.15s;
    }
    .mz-fp-send-btn:hover { opacity:0.85; transform:scale(1.05); }

    @keyframes mz-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }
    @media (max-width:640px) {
      .mz-fp-sidebar { display:none; }
      .mz-fp-messages, .mz-fp-chips, .mz-fp-input-area { padding-left:16px; padding-right:16px; }
    }
  `}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Y):Y();})();
