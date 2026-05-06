/* Meetzy Widget v1.0 — https://meetzy.ai */
"use strict";(()=>{function q(t,n=50){let i=parseInt(t.slice(1,3),16),e=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgb(${Math.min(255,i+n)},${Math.min(255,e+n)},${Math.min(255,a+n)})`}function z(t,n,i,e,a,o){let r=o.subtype==="female",s=r?"#f5c5a0":"#e8b88a",d=r?"#4a2c0a":"#2c1a0a";t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.fillStyle=o.brandColor,t.beginPath(),t.roundRect(-28*e,30*e,56*e,55*e,8*e),t.fill(),t.fillStyle="rgba(255,255,255,0.8)",t.font=`bold ${13*e}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("M",n,i+55*e),t.fillStyle=o.brandColor,t.beginPath(),t.roundRect(-44*e,32*e,17*e,42*e,6*e),t.fill(),t.beginPath(),t.roundRect(27*e,32*e,17*e,42*e,6*e),t.fill(),t.fillStyle=s,t.beginPath(),t.roundRect(-8*e,8*e,16*e,22*e,4*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle=d,r?(t.beginPath(),t.ellipse(n,i-32*e,34*e,38*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.roundRect(n-33*e,i-35*e,11*e,55*e,6*e),t.fill(),t.beginPath(),t.roundRect(n+22*e,i-35*e,11*e,55*e,6*e),t.fill()):(t.beginPath(),t.ellipse(n,i-34*e,29*e,22*e,0,0,Math.PI),t.fill()),t.fillStyle=s,t.beginPath(),t.ellipse(n,i-20*e,29*e,33*e,0,0,Math.PI*2),t.fill();let c=i-26*e,g=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,c,8*e,8*g*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,c,8*e,8*g*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-10*e,c,5*e,5*g*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,c,5*e,5*g*e,0,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255,255,255,0.6)",t.beginPath(),t.ellipse(n-8*e,c-2*e,2*e,2*g*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+12*e,c-2*e,2*e,2*g*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#c0392b",t.beginPath(),t.ellipse(n,i-5*e,10*e,(3+a.mouthOpen*5)*e,0,0,Math.PI),t.fill(),t.restore(),t.restore()}function U(t,n,i,e,a,o){t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.fillStyle=o.brandColor,t.beginPath(),t.roundRect(-30*e,20*e,60*e,65*e,10*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle="#8B5E3C",t.beginPath(),t.ellipse(n-28*e,i-18*e,13*e,20*e,-.4,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+28*e,i-18*e,13*e,20*e,.4,0,Math.PI*2),t.fill(),t.fillStyle="#c4895f",t.beginPath(),t.ellipse(n,i-15*e,33*e,30*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#e0b080",t.beginPath(),t.ellipse(n,i,16*e,13*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n,i-4*e,6*e,5*e,0,0,Math.PI*2),t.fill();let r=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-14*e,i-22*e,8*e,8*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,8*e,8*r*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-14*e,i-22*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#6b3a1f",t.lineWidth=2*e,t.beginPath(),t.moveTo(n-8*e,i+6*e),t.quadraticCurveTo(n,i+(10+a.mouthOpen*8)*e,n+8*e,i+6*e),t.stroke(),t.restore(),t.restore()}function Y(t,n,i,e,a){let o=a.isTalking?Math.abs(Math.sin(a.frame*.3))*5:0;t.save(),t.translate(n,i-o*e+a.breathePhase*1.5*e);let r=t.createRadialGradient(-14*e,i-20*e,4*e,0,i+10*e,52*e);r.addColorStop(0,"#ffa030"),r.addColorStop(1,"#e05800"),t.fillStyle=r,t.beginPath(),t.arc(0,i+10*e,52*e,0,Math.PI*2),t.fill(),t.fillStyle="#2ea032",t.beginPath(),t.ellipse(5*e,i-46*e,7*e,17*e,.5,0,Math.PI*2),t.fill(),t.strokeStyle="#4a2c0a",t.lineWidth=3*e,t.beginPath(),t.moveTo(0,i-42*e),t.quadraticCurveTo(5*e,i-56*e,0,i-62*e),t.stroke();let s=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(-16*e,i-5*e,9*e,9*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,9*e,9*s*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(-16*e,i-5*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#c05000",t.lineWidth=3*e,t.beginPath(),t.arc(0,i+10*e,15*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="#c05000",t.beginPath(),t.ellipse(0,i+20*e,10*e,(3+a.mouthOpen*7)*e,0,0,Math.PI),t.fill()),t.restore()}function F(t,n,i,e,a,o){t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.strokeStyle=o.brandColor,t.lineWidth=7*e,t.beginPath(),t.arc(n+40*e,i+15*e,17*e,-.8,.8),t.stroke(),t.fillStyle=o.brandColor,t.beginPath(),t.moveTo(n-28*e,i-30*e),t.lineTo(n-33*e,i+48*e),t.quadraticCurveTo(n,i+60*e,n+33*e,i+48*e),t.lineTo(n+28*e,i-30*e),t.closePath(),t.fill(),t.fillStyle=q(o.brandColor,40),t.beginPath(),t.ellipse(n,i-30*e,28*e,7*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.25)",t.lineWidth=2.5*e;let r=a.frame*2%20;for(let d=-1;d<=1;d++)t.beginPath(),t.moveTo(n+d*9*e,i-38*e-r*e),t.quadraticCurveTo(n+(d+1)*7*e,i-52*e-r*e,n+d*7*e,i-65*e-r*e),t.stroke();let s=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,i-5*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n-10*e,i-5*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.8)",t.lineWidth=2.5*e,t.beginPath(),t.arc(n,i+15*e,11*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="rgba(0,0,0,0.35)",t.beginPath(),t.ellipse(n,i+22*e,8*e,(2+a.mouthOpen*6)*e,0,0,Math.PI),t.fill()),t.restore()}var w=class{constructor(n,i){this.raf=0;this.canvas=n,this.ctx=n.getContext("2d"),this.config=i,this.state={blinkTimer:150+Math.random()*100,blinkProgress:1,breathePhase:0,mouthOpen:0,headWobble:0,wobbleDir:1,frame:0,isTalking:!1}}setTalking(n){this.state.isTalking=n}updateConfig(n){this.config={...this.config,...n}}start(){let n=()=>{var r,s;let i=this.state,e=this.canvas.width/200,a=this.canvas.width/2,o=this.canvas.height/2;switch(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),i.frame++,i.breathePhase=Math.sin(i.frame*.02),i.blinkTimer--,i.blinkTimer<=0&&(i.blinkTimer=180+Math.random()*120),i.blinkTimer<10?i.blinkProgress=i.blinkTimer<5?i.blinkTimer/5:(10-i.blinkTimer)/5:i.blinkProgress=1,i.headWobble+=i.wobbleDir*.04,Math.abs(i.headWobble)>1.5&&(i.wobbleDir*=-1),i.isTalking?i.mouthOpen=.3+Math.sin(i.frame*.25)*.4:i.mouthOpen=Math.max(0,i.mouthOpen-.08),this.config.type){case"human":z(this.ctx,a,o,e,i,this.config);break;case"animal":U(this.ctx,a,o,e,i,this.config);break;case"object":(r=this.config.subtype)!=null&&r.includes("taza")||(s=this.config.subtype)!=null&&s.includes("cup")?F(this.ctx,a,o,e,i,this.config):Y(this.ctx,a,o,e,i);break;default:z(this.ctx,a,o,e,i,this.config)}this.raf=requestAnimationFrame(n)};this.raf=requestAnimationFrame(n)}stop(){cancelAnimationFrame(this.raf)}};function $(t,n){let i=t.data;switch(t.type){case"card":return B(i,n);case"gallery":return j(i);case"booking":return V(i,n);case"pricing":return W(i,n);case"contact":return G(i,n);default:return document.createElement("div")}}function B(t,n){var r;let i=document.createElement("div");if(i.className="mz-ui-card",i.style.cssText=`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    margin: 8px 0;
    max-width: 280px;
  `,t.imageUrl){let s=document.createElement("img");s.src=t.imageUrl,s.alt=t.title,s.style.cssText="width:100%; height:140px; object-fit:cover;",i.appendChild(s)}else{let s=document.createElement("div");s.style.cssText=`width:100%; height:80px; background: linear-gradient(135deg, ${n}20, ${n}40); display:flex; align-items:center; justify-content:center;`,s.textContent="\u{1F6CD}\uFE0F",s.style.fontSize="2rem",i.appendChild(s)}let e=document.createElement("div");e.style.cssText="padding: 14px;";let a=document.createElement("p");if(a.style.cssText="color: #F0EDE8; font-weight: 700; font-size: 14px; margin: 0 0 6px;",a.textContent=t.title,e.appendChild(a),t.description){let s=document.createElement("p");s.style.cssText="color: #6b6b6b; font-size: 12px; margin: 0 0 8px; line-height: 1.5;",s.textContent=t.description,e.appendChild(s)}if(t.price){let s=document.createElement("p");s.style.cssText=`color: ${n}; font-weight: 700; font-size: 18px; margin: 0 0 10px;`,s.textContent=t.price,e.appendChild(s)}let o=document.createElement("a");return o.href=(r=t.ctaUrl)!=null?r:"#",o.target="_blank",o.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; text-decoration: none;
    transition: opacity 0.15s;
  `,o.textContent=t.ctaText,o.onmouseenter=()=>o.style.opacity="0.85",o.onmouseleave=()=>o.style.opacity="1",e.appendChild(o),i.appendChild(e),i}function j(t){let n=document.createElement("div");n.style.cssText="margin: 8px 0;";let i=document.createElement("div");if(i.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;",t.images.slice(0,6).forEach(e=>{var r;let a=document.createElement("div");a.style.cssText="flex-shrink:0; width:110px;";let o=document.createElement("img");o.src=e.url,o.alt=(r=e.alt)!=null?r:"",o.style.cssText="width:110px; height:80px; object-fit:cover; border-radius:10px;",a.appendChild(o),i.appendChild(a)}),t.caption){let e=document.createElement("p");e.style.cssText="color: #6b6b6b; font-size: 11px; margin: 6px 0 0;",e.textContent=t.caption,n.appendChild(e)}return n.appendChild(i),n}function V(t,n){var o;let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let a=document.createElement("a");return a.href=(o=t.calUrl)!=null?o:"#",a.target="_blank",a.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
  `,a.textContent="\u{1F4C5} Reservar reuni\xF3n",i.appendChild(a),i}function W(t,n){let i=document.createElement("div");i.style.cssText="margin: 8px 0;";let e=document.createElement("div");return e.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px;",t.plans.forEach(a=>{let o=document.createElement("div");o.style.cssText=`
      flex-shrink:0; width:160px;
      background: ${a.highlighted?n+"15":"#1a1a1a"};
      border: 1px solid ${a.highlighted?n+"50":"#2a2a2a"};
      border-radius: 14px; padding: 14px;
    `;let r=document.createElement("p");r.style.cssText="color: #6b6b6b; font-size: 11px; font-weight: 700; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;",r.textContent=a.name,o.appendChild(r);let s=document.createElement("p");s.style.cssText=`color: ${a.highlighted?n:"#F0EDE8"}; font-weight: 700; font-size: 20px; margin: 0 0 10px;`,s.textContent=a.price,o.appendChild(s);let d=document.createElement("ul");if(d.style.cssText="margin:0 0 12px; padding: 0 0 0 14px;",a.features.slice(0,4).forEach(c=>{let g=document.createElement("li");g.style.cssText="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;",g.textContent=c,d.appendChild(g)}),o.appendChild(d),a.ctaUrl){let c=document.createElement("a");c.href=a.ctaUrl,c.target="_blank",c.style.cssText=`
        display:block; text-align:center; padding: 7px;
        background: ${a.highlighted?n:"transparent"};
        border: 1px solid ${a.highlighted?"transparent":"#333"};
        color: ${a.highlighted?"#fff":"#F0EDE8"};
        border-radius: 8px; font-size: 11px; font-weight:600; text-decoration:none;
      `,c.textContent="Elegir plan",o.appendChild(c)}e.appendChild(o)}),i.appendChild(e),i}function G(t,n){let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let a=document.createElement("form");a.style.cssText="display:flex; flex-direction:column; gap:8px;",a.addEventListener("submit",r=>r.preventDefault()),t.fields.forEach(r=>{var d,c;let s=document.createElement("input");s.type=(d=r.type)!=null?d:"text",s.placeholder=r.label,s.required=(c=r.required)!=null?c:!1,s.style.cssText=`
      background: #0e0e0e; border: 1px solid #222; color: #F0EDE8;
      border-radius: 10px; padding: 8px 12px; font-size: 12px; outline:none;
    `,s.onfocus=()=>s.style.borderColor=n,s.onblur=()=>s.style.borderColor="#222",a.appendChild(s)});let o=document.createElement("button");return o.type="submit",o.style.cssText=`
    background: ${n}; color: #fff;
    border: none; border-radius: 10px; padding: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
  `,o.textContent="Enviar",a.appendChild(o),i.appendChild(a),i}var P="https://app.meetzy.ai",N={vendedor:"Sos un vendedor experto y entusiasta. Tu objetivo es ayudar al visitante a tomar una decisi\xF3n de compra. Detect\xE1s se\xF1ales de inter\xE9s y actu\xE1s. Sos directo pero nunca presion\xE1s \u2014 ofrec\xE9s valor antes de pedir la venta. Us\xE1s espa\xF1ol rioplatense. M\xE1ximo 2-3 l\xEDneas por respuesta.",guia:"Sos una gu\xEDa amigable y paciente. Tu trabajo es acompa\xF1ar al visitante y ayudarlo a entender el producto o servicio. Explic\xE1s con claridad, us\xE1s ejemplos, y nunca apur\xE1s. El visitante siempre se tiene que sentir acompa\xF1ado. Us\xE1s espa\xF1ol rioplatense. M\xE1ximo 2-3 l\xEDneas por respuesta.",soporte:"Sos un agente de soporte eficiente y confiable. Resolv\xE9s problemas con precisi\xF3n. Cuando no sab\xE9s algo, lo dec\xEDs y deriv\xE1s correctamente. Nunca invent\xE1s informaci\xF3n. Sos directo y \xFAtil. Us\xE1s espa\xF1ol rioplatense. M\xE1ximo 2-3 l\xEDneas por respuesta.",recepcionista:"Sos una recepcionista cordial y organizada. Tu objetivo es entender qu\xE9 necesita el visitante y derivarlo correctamente \u2014 ya sea agendando un turno, conect\xE1ndolo con el \xE1rea correcta, o respondiendo consultas generales. Sos el primer punto de contacto. Us\xE1s espa\xF1ol rioplatense. M\xE1ximo 2-3 l\xEDneas por respuesta."},Q=[{id:"return_visitor",priority:1,condition:t=>t.isReturnVisitor&&t.timeOnSite<20,messages:{vendedor:"\xA1Volviste! \xBFQuer\xE9s que continuemos donde quedamos?",guia:"\xA1Bienvenido de vuelta! \xBFSegu\xEDs explorando o ya ten\xE9s algo en mente?",soporte:"Hola de nuevo. \xBFPudiste resolver lo de la \xFAltima vez?",recepcionista:"\xA1Hola de nuevo! \xBFEn qu\xE9 te puedo ayudar hoy?"}},{id:"pricing_hover",priority:2,condition:t=>{var n,i;return((i=(n=t.sectionsViewed.pricing)==null?void 0:n.time)!=null?i:0)>30},messages:{vendedor:"Los precios tienen sentido para tu caso. \xBFTe ayudo a elegir el mejor?",guia:"\xBFTen\xE9s dudas sobre los planes? Te los explico.",soporte:"\xBFAlguna pregunta sobre los precios o qu\xE9 incluye cada plan?",recepcionista:"\xBFQuer\xE9s que te contacte con alguien del equipo para hablar de precios?"}},{id:"long_idle",priority:3,condition:t=>t.timeOnSite>120&&t.lastInteraction>60,messages:{vendedor:"\xBFEncontraste lo que buscabas? Puedo ayudarte a decidir.",guia:"Llev\xE1s un rato explorando. \xBFTe puedo orientar?",soporte:"\xBFNecesit\xE1s ayuda con algo?",recepcionista:"\xBFPuedo ayudarte a encontrar algo?"}},{id:"exit_intent",priority:4,condition:t=>t.mouseY<60&&t.timeOnSite>30,messages:{vendedor:"Antes de que te vayas \u2014 \xBFhay algo que no encontraste?",guia:"\xBFYa encontraste todo lo que buscabas?",soporte:"\xBFPudiste resolver tu consulta?",recepcionista:"\xBFTe puedo ayudar con algo antes de que te vayas?"}},{id:"scroll_stop",priority:5,condition:t=>t.scrollSpeed==="stopped"&&t.timeOnCurrentSection>45,messages:{vendedor:"\xBFAlgo de esto te interes\xF3? Puedo contarte m\xE1s.",guia:"\xBFQuer\xE9s que te explique m\xE1s sobre esto?",soporte:"\xBFTen\xE9s alguna pregunta sobre esta secci\xF3n?",recepcionista:"\xBFPuedo ayudarte con algo de esto?"}}],S=class{constructor(){this.ctx={timeOnSite:0,isReturnVisitor:!1,sectionsViewed:{},scrollSpeed:"normal",mouseY:window.innerHeight/2,currentSection:"",lastInteraction:0,timeOnCurrentSection:0};this.startTime=Date.now();this.lastScrollY=window.scrollY;this.lastScrollTime=Date.now();this.lastInteractionTime=Date.now();this.currentSectionEntry=Date.now();this.observer=null}init(){this.ctx.isReturnVisitor=!!localStorage.getItem("mz_visited"),localStorage.setItem("mz_visited","true"),setInterval(()=>{let n=Date.now();this.ctx.timeOnSite=Math.round((n-this.startTime)/1e3),this.ctx.lastInteraction=Math.round((n-this.lastInteractionTime)/1e3),this.ctx.timeOnCurrentSection=Math.round((n-this.currentSectionEntry)/1e3)},1e3),window.addEventListener("scroll",()=>{let n=Date.now(),i=Math.abs(window.scrollY-this.lastScrollY),e=Math.max(n-this.lastScrollTime,16),a=i/e;this.ctx.scrollSpeed=a>1.5?"fast":a<.1?"stopped":"normal",this.lastScrollY=window.scrollY,this.lastScrollTime=n,this.lastInteractionTime=n},{passive:!0}),window.addEventListener("mousemove",n=>{this.ctx.mouseY=n.clientY,this.lastInteractionTime=Date.now()},{passive:!0}),window.addEventListener("click",()=>{this.lastInteractionTime=Date.now()},{passive:!0}),this.observer=new IntersectionObserver(n=>{for(let i of n){let e=i.target.id||i.target.dataset.section||"unknown";i.isIntersecting&&(this.ctx.currentSection=e,this.currentSectionEntry=Date.now(),this.ctx.sectionsViewed[e]?this.ctx.sectionsViewed[e].revisits++:this.ctx.sectionsViewed[e]={time:0,revisits:0})}},{threshold:.4}),document.querySelectorAll("[data-section], section[id]").forEach(n=>this.observer.observe(n)),new MutationObserver(n=>{for(let i of n)for(let e of i.addedNodes)e instanceof Element&&e.matches("[data-section], section[id]")&&this.observer.observe(e)}).observe(document.body,{childList:!0,subtree:!0})}getContext(){return{...this.ctx}}},M=class{constructor(n){this.state="idle";this.lastProactiveAt=0;this.triggeredIds=new Set;this.messageTimeout=null;this.isStreaming=!1;this.avatarRenderer=null;var i;this.config=n,this.tracker=new S,this.visitorId=this.getOrCreate("mz_uid"),this.conversationId=(i=sessionStorage.getItem(`mz_c_${n.agentType}`))!=null?i:void 0}getOrCreate(n){let i=localStorage.getItem(n);return i||(i=Math.random().toString(36).slice(2)+Date.now().toString(36),localStorage.setItem(n,i)),i}init(){let n=document.createElement("div");n.id="meetzy-widget";let i=this.config.widgetPosition==="bottom-left";n.style.cssText=`position:fixed;z-index:2147483647;bottom:28px;${i?"left:28px":"right:28px"};`,document.body.appendChild(n),this.shadow=n.attachShadow({mode:"open"}),this.shadow.innerHTML=`<style>${this.getStyles()}</style>`,this.buildBubble(),this.buildSpeech(),this.buildChat(),this.tracker.init(),this.config.proactiveEnabled&&this.startProactiveLoop()}buildBubble(){let n=document.createElement("div");n.className="bubble-wrap";let i=document.createElement("div");i.className="bubble-ring",n.appendChild(i);let e=document.createElement("div");e.className="bubble",e.title=`Hablame con ${this.config.agentName}`,(this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType?(this.bubbleCanvas=document.createElement("canvas"),this.bubbleCanvas.width=128,this.bubbleCanvas.height=128,this.bubbleCanvas.style.cssText="width:56px;height:56px;border-radius:50%;",e.appendChild(this.bubbleCanvas),setTimeout(()=>{var r;this.avatarRenderer=new w(this.bubbleCanvas,{type:this.config.avatarType,subtype:(r=this.config.avatarSubtype)!=null?r:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}),this.avatarRenderer.start()},50)):e.innerHTML=`<div class="bubble-initials">${this.config.agentName.slice(0,2).toUpperCase()}</div>`,e.addEventListener("click",()=>this.toggleChat());let o=null;e.addEventListener("mouseenter",()=>{e.classList.add("hovering"),o=setTimeout(()=>{this.state==="idle"&&this.showTooltip()},500)}),e.addEventListener("mouseleave",()=>{e.classList.remove("hovering"),o&&clearTimeout(o),this.hideTooltip()}),n.appendChild(e),this.bubbleEl=n,this.shadow.appendChild(n)}showTooltip(){let n=this.shadow.querySelector(".bubble-tooltip");n||(n=document.createElement("div"),n.className="bubble-tooltip",n.textContent=`Hablame con ${this.config.agentName}`,this.bubbleEl.appendChild(n)),n.style.opacity="1"}hideTooltip(){let n=this.shadow.querySelector(".bubble-tooltip");n&&(n.style.opacity="0")}buildSpeech(){let n=document.createElement("div");n.className="speech hidden",this.speechEl=n,this.shadow.appendChild(n)}showMessage(n){let i=Date.now(),e=this.config.proactiveFrequency==="conservador"?6e5:this.config.proactiveFrequency==="proactivo"?6e4:18e4;i-this.lastProactiveAt<e||this.state!=="chat"&&(this.lastProactiveAt=i,this.state="message",this.speechEl.className="speech visible",this.speechEl.innerHTML=`
      <p class="speech-text">${n}</p>
      <div class="speech-actions">
        <button class="speech-btn-primary">Contame m\xE1s</button>
        <button class="speech-btn-close">\xD7</button>
      </div>
      <div class="speech-tail"></div>
    `,this.speechEl.querySelector(".speech-btn-primary").addEventListener("click",()=>{this.closeMessage(),this.openChat(n)}),this.speechEl.querySelector(".speech-btn-close").addEventListener("click",()=>{this.closeMessage()}),this.messageTimeout&&clearTimeout(this.messageTimeout),this.messageTimeout=setTimeout(()=>this.closeMessage(),8e3))}closeMessage(){this.speechEl.className="speech hidden",this.state==="message"&&(this.state="idle"),this.messageTimeout&&(clearTimeout(this.messageTimeout),this.messageTimeout=null)}buildChat(){let n=document.createElement("div");n.className="chat";let i=document.createElement("div");i.className="chat-header";let e=document.createElement("div");if(e.className="chat-avatar",(this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType){let p=document.createElement("canvas");p.width=80,p.height=80,p.style.cssText="width:38px;height:38px;border-radius:50%;",e.appendChild(p),setTimeout(()=>{var m;new w(p,{type:this.config.avatarType,subtype:(m=this.config.avatarSubtype)!=null?m:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}).start()},80)}else e.innerHTML=`<div class="chat-av-initials">${this.config.agentName.slice(0,2).toUpperCase()}</div>`;i.appendChild(e);let o=document.createElement("div");o.className="chat-info",o.innerHTML=`<p class="chat-name">${this.config.agentName}</p><p class="chat-role"><span class="dot-green"></span>${this.config.agentRole}</p>`,i.appendChild(o);let r=document.createElement("button");r.className="chat-close-btn",r.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',r.addEventListener("click",()=>this.closeChat()),i.appendChild(r),n.appendChild(i);let s=document.createElement("div");s.className="chat-msgs",this.msgsEl=s,n.appendChild(s);let d=document.createElement("div");d.className="chat-suggs",d.id="mz-suggs",this.getDefaultChips().forEach(p=>{let m=document.createElement("button");m.className="chip",m.textContent=p,m.addEventListener("click",()=>{d.style.display="none",this.sendMessage(p)}),d.appendChild(m)}),n.appendChild(d);let g=document.createElement("div");g.className="chat-input-area";let h=document.createElement("textarea");h.className="chat-textarea",h.placeholder=`Preguntale a ${this.config.agentName}\u2026`,h.rows=1,h.addEventListener("input",()=>{h.style.height="auto",h.style.height=Math.min(h.scrollHeight,88)+"px"}),h.addEventListener("keydown",p=>{if(p.key==="Enter"&&!p.shiftKey){p.preventDefault();let m=h.value.trim();m&&!this.isStreaming&&this.sendMessage(m)}}),g.appendChild(h);let b=document.createElement("button");if(b.className="chat-send-btn",b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',b.addEventListener("click",()=>{let p=h.value.trim();p&&!this.isStreaming&&this.sendMessage(p)}),g.appendChild(b),n.appendChild(g),this.config.plan!=="elite"){let p=document.createElement("div");p.className="chat-footer",p.innerHTML='Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a>',n.appendChild(p)}this.chatEl=n,this.shadow.appendChild(n)}getDefaultChips(){var i;let n={vendedor:["\xBFQu\xE9 ofrecen?","\xBFCu\xE1les son los precios?","Quiero comprar"],guia:["\xBFQu\xE9 es esto?","\xBFC\xF3mo funciona?","Mostr\xE1melo paso a paso"],soporte:["Tengo un problema","\xBFC\xF3mo lo hago?","No me funciona algo"],recepcionista:["Quiero un turno","Tengo una consulta","\xBFCon qui\xE9n hablo?"]};return(i=n[this.config.agentType])!=null?i:n.guia}toggleChat(){this.state==="chat"?this.closeChat():(this.closeMessage(),this.openChat())}openChat(n){if(this.state="chat",this.chatEl.classList.add("open"),this.msgsEl.children.length===0){let i=n!=null?n:this.config.welcomeMessage;this.addAgentMsg(i)}setTimeout(()=>{let i=this.chatEl.querySelector(".chat-textarea");i==null||i.focus()},350)}closeChat(){this.state="idle",this.chatEl.classList.remove("open")}addAgentMsg(n){let i=document.createElement("div");i.className="msg-wrap msg-agent";let e=document.createElement("div");return e.className="msg-bubble msg-bubble-agent",e.textContent=n,i.appendChild(e),this.msgsEl.appendChild(i),this.msgsEl.scrollTop=this.msgsEl.scrollHeight,e}addUserMsg(n){let i=document.createElement("div");i.className="msg-wrap msg-user";let e=document.createElement("div");e.className="msg-bubble msg-bubble-user",e.textContent=n,i.appendChild(e),this.msgsEl.appendChild(i),this.msgsEl.scrollTop=this.msgsEl.scrollHeight}addStreamBubble(){let n=document.createElement("div");n.className="msg-wrap msg-agent";let i=document.createElement("div");return i.className="msg-bubble msg-bubble-agent",i.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',n.appendChild(i),this.msgsEl.appendChild(n),this.msgsEl.scrollTop=this.msgsEl.scrollHeight,i}async sendMessage(n){var d,c,g;if(this.isStreaming)return;let i=this.chatEl.querySelector(".chat-textarea");i&&(i.value="",i.style.height="auto");let e=this.chatEl.querySelector("#mz-suggs");e&&(e.style.display="none"),this.addUserMsg(n),this.isStreaming=!0,(d=this.avatarRenderer)==null||d.setTalking(!0);let a=this.addStreamBubble(),o=this.tracker.getContext(),r=(c=N[this.config.agentType])!=null?c:N.guia,s=`
CONTEXTO: tiempo en sitio ${o.timeOnSite}s, secci\xF3n actual: ${o.currentSection}, return visitor: ${o.isReturnVisitor}`;try{let h=await fetch(`${P}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:window.MEETZYCONFIG.siteId,message:n,conversationId:this.conversationId,visitorId:this.visitorId,plan:this.config.plan,visitorContextPrompt:r+s})});if(!h.ok||!h.body){a.textContent="Error al procesar.";return}let b=h.headers.get("X-Conversation-Id");b&&(this.conversationId=b,sessionStorage.setItem(`mz_c_${this.config.agentType}`,b));let p=h.body.getReader(),m=new TextDecoder,f="";for(a.textContent="";;){let{done:E,value:T}=await p.read();if(E)break;for(let C of m.decode(T).split(`
`))if(C.startsWith("data: "))try{let l=JSON.parse(C.slice(6));if(l.type==="text"&&l.content&&(f+=l.content,a.textContent=f,this.msgsEl.scrollTop=this.msgsEl.scrollHeight),l.type==="ui_component"&&l.component&&(this.config.plan==="pro"||this.config.plan==="elite")){let u=$(l.component,this.config.brandColor);this.msgsEl.appendChild(u),this.msgsEl.scrollTop=this.msgsEl.scrollHeight}}catch(l){}}}catch(h){a.textContent="Error de conexi\xF3n."}finally{this.isStreaming=!1,(g=this.avatarRenderer)==null||g.setTalking(!1)}}startProactiveLoop(){setInterval(()=>{var e,a;if(this.state==="chat")return;let n=this.tracker.getContext(),i=[...Q].sort((o,r)=>o.priority-r.priority);for(let o of i){if(this.triggeredIds.has(o.id)||!o.condition(n)||this.config.exitIntentEnabled===!1&&o.id==="exit_intent")continue;this.triggeredIds.add(o.id);let r=(a=(e=o.messages[this.config.agentType])!=null?e:o.messages.guia)!=null?a:"";this.showMessage(r);break}},3e3)}getStyles(){let n=this.config.brandColor,i=this.config.widgetPosition==="bottom-left";return`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* \u2500\u2500 BUBBLE \u2500\u2500 */
      .bubble-wrap {
        position: relative;
        width: 64px; height: 64px;
      }
      .bubble {
        width: 64px; height: 64px; border-radius: 50%;
        background: ${n};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; z-index: 2;
        box-shadow: 0 8px 32px rgba(0,0,0,0.28);
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
      }
      .bubble:hover, .bubble.hovering { transform: scale(1.1); }
      .bubble-ring {
        position: absolute; inset: -5px; border-radius: 50%;
        border: 2px solid ${n}; opacity: 0.35;
        animation: mz-ring 3s ease-out infinite;
        z-index: 1; pointer-events: none;
      }
      .bubble-initials {
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: 20px; color: #fff;
      }
      .bubble-tooltip {
        position: absolute;
        ${i?"left: 72px;":"right: 72px;"}
        top: 50%; transform: translateY(-50%);
        background: #111; border: 1px solid rgba(255,255,255,0.09);
        color: #F0EDE8; font-family: 'DM Sans', sans-serif;
        font-size: 12px; padding: 6px 12px; border-radius: 10px;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 0.2s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }

      /* \u2500\u2500 SPEECH BUBBLE \u2500\u2500 */
      .speech {
        position: absolute;
        ${i?"left: 0;":"right: 0;"}
        bottom: 72px;
        width: 260px;
        font-family: 'DM Sans', sans-serif;
        pointer-events: none; opacity: 0;
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.4,.64,1);
        transform: translateY(8px) scale(0.95);
      }
      .speech.visible {
        pointer-events: all; opacity: 1;
        transform: translateY(0) scale(1);
      }
      .speech.hidden {
        pointer-events: none; opacity: 0;
        transform: translateY(8px) scale(0.95);
      }
      .speech-text {
        background: #111; border: 1px solid rgba(255,255,255,0.08);
        border-radius: ${i?"16px 16px 16px 4px":"16px 16px 4px 16px"};
        padding: 14px 16px; font-size: 13px; color: #F0EDE8;
        line-height: 1.55; margin-bottom: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      .speech-actions { display: flex; gap: 6px; }
      .speech-btn-primary {
        flex: 1; padding: 7px 10px; background: ${n};
        border: none; border-radius: 9px; color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: 12px;
        font-weight: 600; cursor: pointer;
        transition: opacity 0.15s;
      }
      .speech-btn-primary:hover { opacity: 0.85; }
      .speech-btn-close {
        width: 30px; height: 30px;
        background: rgba(255,255,255,0.06); border: none; border-radius: 9px;
        color: rgba(255,255,255,0.4); cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
      }
      .speech-btn-close:hover { background: rgba(255,255,255,0.1); }

      /* \u2500\u2500 CHAT PANEL \u2500\u2500 */
      .chat {
        position: absolute;
        ${i?"left: 0;":"right: 0;"}
        bottom: 76px;
        width: 380px; height: 520px;
        background: #0e0e0e; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        display: flex; flex-direction: column; overflow: hidden;
        transform-origin: ${i?"bottom left":"bottom right"};
        transform: scale(0.88) translateY(8px); opacity: 0;
        transition: transform 0.35s cubic-bezier(.34,1.2,.64,1), opacity 0.3s ease;
        pointer-events: none;
      }
      .chat.open {
        transform: scale(1) translateY(0); opacity: 1;
        pointer-events: all;
      }

      .chat-header {
        display: flex; align-items: center; gap: 11px;
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
      }
      .chat-avatar { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
      .chat-av-initials {
        width: 38px; height: 38px; border-radius: 50%;
        background: ${n}; color: #fff;
        font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px;
        display: flex; align-items: center; justify-content: center;
      }
      .chat-info { flex: 1; min-width: 0; }
      .chat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #F0EDE8; }
      .chat-role { font-size: 10px; color: rgba(240,237,232,0.4); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
      .dot-green { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
      .chat-close-btn {
        background: none; border: none; color: rgba(240,237,232,0.35); cursor: pointer;
        padding: 6px; border-radius: 8px; display: flex; transition: color 0.15s, background 0.15s;
      }
      .chat-close-btn:hover { color: #F0EDE8; background: rgba(255,255,255,0.06); }

      .chat-msgs {
        flex: 1; overflow-y: auto; padding: 14px;
        display: flex; flex-direction: column; gap: 9px;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent;
      }
      .msg-wrap { display: flex; }
      .msg-agent { justify-content: flex-start; }
      .msg-user  { justify-content: flex-end; }
      .msg-bubble {
        max-width: 83%; padding: 10px 13px; border-radius: 18px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.5;
        word-wrap: break-word; animation: mz-fade-in 0.25s ease;
      }
      .msg-bubble-agent { background: #1a1a1a; color: #F0EDE8; border-bottom-left-radius: 3px; }
      .msg-bubble-user  { background: ${n}; color: #fff; border-bottom-right-radius: 3px; }

      .typing { display: flex; gap: 4px; padding: 2px 0; }
      .typing span { width: 6px; height: 6px; background: ${n}; border-radius: 50%; animation: mz-bounce 1.2s ease infinite; }
      .typing span:nth-child(2) { animation-delay: 0.15s; }
      .typing span:nth-child(3) { animation-delay: 0.3s; }

      .chat-suggs { padding: 0 14px 10px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
      .chip {
        background: transparent; border: 1px solid ${n}45; color: ${n};
        padding: 5px 11px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
        font-size: 11px; cursor: pointer; transition: all 0.15s;
      }
      .chip:hover { background: ${n}12; }

      .chat-input-area {
        display: flex; align-items: flex-end; gap: 8px;
        padding: 10px 14px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
      }
      .chat-textarea {
        flex: 1; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);
        color: #F0EDE8; border-radius: 13px; padding: 9px 13px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; resize: none;
        outline: none; max-height: 88px; line-height: 1.5; transition: border-color 0.15s;
      }
      .chat-textarea:focus { border-color: ${n}; }
      .chat-textarea::placeholder { color: rgba(240,237,232,0.22); }
      .chat-send-btn {
        width: 36px; height: 36px; border-radius: 50%; background: ${n}; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      }
      .chat-send-btn:hover { opacity: 0.85; transform: scale(1.06); }
      .chat-footer { text-align: center; padding: 7px; font-size: 9px; color: rgba(240,237,232,0.2); font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
      .chat-footer a { color: ${n}; text-decoration: none; }

      /* \u2500\u2500 ANIMATIONS \u2500\u2500 */
      @keyframes mz-ring { 0% { transform: scale(1); opacity: 0.35; } 100% { transform: scale(1.7); opacity: 0; } }
      @keyframes mz-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      @keyframes mz-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      /* \u2500\u2500 MOBILE \u2500\u2500 */
      @media (max-width: 480px) {
        .chat {
          position: fixed; inset: 0; width: 100vw; height: 100dvh;
          border-radius: 0; bottom: auto; right: auto; left: auto;
          transform-origin: bottom center;
        }
        .speech { width: 220px; }
      }
    `}};function Z(t,n){Array.from(document.body.children).forEach(l=>{l.id!=="meetzy-fp-host"&&(l.style.display="none")}),document.body.style.cssText="margin:0;padding:0;overflow:hidden;";let i=document.createElement("div");i.id="meetzy-fp-host",i.style.cssText="position:fixed;inset:0;z-index:2147483647;",document.body.appendChild(i);let e=i.attachShadow({mode:"open"}),a=n.brandColor,o=document.createElement("style");o.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .fp-wrap{display:flex;width:100vw;height:100vh;background:#080808;font-family:'DM Sans',sans-serif;color:#F0EDE8;}
    .fp-sidebar{width:260px;flex-shrink:0;background:#0d0d0d;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;padding:40px 24px;gap:16px;}
    .fp-av-init{width:96px;height:96px;border-radius:50%;background:${a};color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:34px;display:flex;align-items:center;justify-content:center;}
    .fp-name{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#F0EDE8;}
    .fp-role{font-size:12px;color:rgba(240,237,232,0.4);display:flex;align-items:center;gap:5px;margin-top:4px;}
    .fp-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;}
    .fp-powered{font-size:10px;color:rgba(240,237,232,0.18);}
    .fp-powered a{color:${a};text-decoration:none;}
    .fp-chat{flex:1;display:flex;flex-direction:column;min-width:0;}
    .fp-msgs{flex:1;overflow-y:auto;padding:32px 48px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;}
    .fp-msg-wrap{display:flex;}.fp-agent{justify-content:flex-start;}.fp-user{justify-content:flex-end;}
    .fp-bubble{max-width:72%;padding:13px 17px;border-radius:20px;font-size:15px;line-height:1.6;word-wrap:break-word;}
    .fp-bubble-agent{background:#111;color:#F0EDE8;border:1px solid rgba(255,255,255,0.06);border-bottom-left-radius:4px;}
    .fp-bubble-user{background:${a};color:#fff;border-bottom-right-radius:4px;}
    .fp-typing{display:flex;gap:5px;padding:3px 0;}
    .fp-typing span{width:8px;height:8px;background:${a};border-radius:50%;animation:mz-bounce 1.2s ease infinite;}
    .fp-typing span:nth-child(2){animation-delay:0.15s;}.fp-typing span:nth-child(3){animation-delay:0.3s;}
    .fp-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 48px 16px;}
    .fp-chip{background:transparent;border:1px solid ${a}40;color:${a};padding:7px 16px;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.15s;}
    .fp-chip:hover{background:${a}12;}
    .fp-input-area{display:flex;align-items:flex-end;gap:12px;padding:16px 48px 32px;border-top:1px solid rgba(255,255,255,0.05);}
    .fp-textarea{flex:1;background:#111;border:1px solid rgba(255,255,255,0.08);color:#F0EDE8;border-radius:16px;padding:13px 18px;font-family:'DM Sans',sans-serif;font-size:15px;resize:none;outline:none;max-height:120px;line-height:1.5;transition:border-color 0.15s;}
    .fp-textarea:focus{border-color:${a};}
    .fp-textarea::placeholder{color:rgba(240,237,232,0.2);}
    .fp-send-btn{width:48px;height:48px;border-radius:50%;background:${a};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:opacity 0.15s,transform 0.15s;}
    .fp-send-btn:hover{opacity:0.85;transform:scale(1.05);}
    @keyframes mz-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @media(max-width:640px){.fp-sidebar{display:none;}.fp-msgs,.fp-chips,.fp-input-area{padding-left:16px;padding-right:16px;}}
  `,e.appendChild(o);let r=(()=>{let l=localStorage.getItem("mz_uid");return l||(l=Math.random().toString(36).slice(2),localStorage.setItem("mz_uid",l)),l})(),s,d=!1,c=document.createElement("div");c.className="fp-wrap",e.appendChild(c);let g=document.createElement("div");g.className="fp-sidebar",g.innerHTML=`<div class="fp-av-init">${n.agentName.slice(0,2).toUpperCase()}</div><div><p class="fp-name">${n.agentName}</p><p class="fp-role"><span class="fp-dot"></span>${n.agentRole}</p></div><div style="flex:1"></div><p class="fp-powered">Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a></p>`,c.appendChild(g);let h=document.createElement("div");h.className="fp-chat";let b=document.createElement("div");b.className="fp-msgs",b.id="fp-msgs",h.appendChild(b);let p=document.createElement("div");p.className="fp-chips",["\xBFQu\xE9 ofrecen?","\xBFCu\xE1les son los precios?","Quiero m\xE1s info"].forEach(l=>{let u=document.createElement("button");u.className="fp-chip",u.textContent=l,u.onclick=()=>{p.style.display="none",C(l)},p.appendChild(u)}),h.appendChild(p);let m=document.createElement("div");m.className="fp-input-area";let f=document.createElement("textarea");f.className="fp-textarea",f.placeholder="Contame qu\xE9 necesit\xE1s\u2026",f.rows=1,f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(f.scrollHeight,120)+"px"}),f.addEventListener("keydown",l=>{if(l.key==="Enter"&&!l.shiftKey){l.preventDefault();let u=f.value.trim();u&&!d&&C(u)}}),m.appendChild(f);let E=document.createElement("button");E.className="fp-send-btn",E.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',E.onclick=()=>{let l=f.value.trim();l&&!d&&C(l)},m.appendChild(E),h.appendChild(m),c.appendChild(h),T("agent",n.welcomeMessage);function T(l,u){let x=e.getElementById("fp-msgs"),v=document.createElement("div");v.className=`fp-msg-wrap fp-${l}`;let y=document.createElement("div");return y.className=`fp-bubble fp-bubble-${l}`,y.textContent=u,v.appendChild(y),x.appendChild(v),x.scrollTop=x.scrollHeight,y}async function C(l){if(d)return;f.value="",f.style.height="auto",p.style.display="none",T("user",l),d=!0;let u=e.getElementById("fp-msgs"),x=document.createElement("div");x.className="fp-msg-wrap fp-agent";let v=document.createElement("div");v.className="fp-bubble fp-bubble-agent",v.innerHTML='<span class="fp-typing"><span></span><span></span><span></span></span>',x.appendChild(v),u.appendChild(x),u.scrollTop=u.scrollHeight;try{let y=await fetch(`${P}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:t,message:l,conversationId:s,visitorId:r,plan:n.plan})});if(!y.ok||!y.body){v.textContent="Error.";return}let I=y.headers.get("X-Conversation-Id");I&&(s=I);let R=y.body.getReader(),O=new TextDecoder,D="";for(v.textContent="";;){let{done:_,value:A}=await R.read();if(_)break;for(let L of O.decode(A).split(`
`))if(L.startsWith("data: "))try{let k=JSON.parse(L.slice(6));k.type==="text"&&k.content&&(D+=k.content,v.textContent=D,u.scrollTop=u.scrollHeight)}catch(k){}}}catch(y){v.textContent="Error."}finally{d=!1}}}async function H(){var e;let t=(e=window.MEETZYCONFIG)==null?void 0:e.siteId;if(!t)return;let n;try{let a=await fetch(`${P}/api/sites/${t}/config`);if(!a.ok||(n=await a.json(),!n.isActive))return}catch(a){return}if(n.embedMode==="fullpage"){Z(t,n);return}new M(n).init()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();})();
