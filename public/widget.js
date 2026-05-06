/* Meetzy Widget v1.0 — https://meetzy.ai */
"use strict";(()=>{function U(t,n=50){let i=parseInt(t.slice(1,3),16),e=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgb(${Math.min(255,i+n)},${Math.min(255,e+n)},${Math.min(255,a+n)})`}function N(t,n,i,e,a,s){let o=s.subtype==="female",r=o?"#f5c5a0":"#e8b88a",c=o?"#4a2c0a":"#2c1a0a";t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.fillStyle=s.brandColor,t.beginPath(),t.roundRect(-28*e,30*e,56*e,55*e,8*e),t.fill(),t.fillStyle="rgba(255,255,255,0.8)",t.font=`bold ${13*e}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("M",n,i+55*e),t.fillStyle=s.brandColor,t.beginPath(),t.roundRect(-44*e,32*e,17*e,42*e,6*e),t.fill(),t.beginPath(),t.roundRect(27*e,32*e,17*e,42*e,6*e),t.fill(),t.fillStyle=r,t.beginPath(),t.roundRect(-8*e,8*e,16*e,22*e,4*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle=c,o?(t.beginPath(),t.ellipse(n,i-32*e,34*e,38*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.roundRect(n-33*e,i-35*e,11*e,55*e,6*e),t.fill(),t.beginPath(),t.roundRect(n+22*e,i-35*e,11*e,55*e,6*e),t.fill()):(t.beginPath(),t.ellipse(n,i-34*e,29*e,22*e,0,0,Math.PI),t.fill()),t.fillStyle=r,t.beginPath(),t.ellipse(n,i-20*e,29*e,33*e,0,0,Math.PI*2),t.fill();let d=i-26*e,l=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,d,8*e,8*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,d,8*e,8*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-10*e,d,5*e,5*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,d,5*e,5*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255,255,255,0.6)",t.beginPath(),t.ellipse(n-8*e,d-2*e,2*e,2*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+12*e,d-2*e,2*e,2*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#c0392b",t.beginPath(),t.ellipse(n,i-5*e,10*e,(3+a.mouthOpen*5)*e,0,0,Math.PI),t.fill(),t.restore(),t.restore()}function F(t,n,i,e,a,s){t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.fillStyle=s.brandColor,t.beginPath(),t.roundRect(-30*e,20*e,60*e,65*e,10*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle="#8B5E3C",t.beginPath(),t.ellipse(n-28*e,i-18*e,13*e,20*e,-.4,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+28*e,i-18*e,13*e,20*e,.4,0,Math.PI*2),t.fill(),t.fillStyle="#c4895f",t.beginPath(),t.ellipse(n,i-15*e,33*e,30*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#e0b080",t.beginPath(),t.ellipse(n,i,16*e,13*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n,i-4*e,6*e,5*e,0,0,Math.PI*2),t.fill();let o=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-14*e,i-22*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(n-14*e,i-22*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+14*e,i-22*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#6b3a1f",t.lineWidth=2*e,t.beginPath(),t.moveTo(n-8*e,i+6*e),t.quadraticCurveTo(n,i+(10+a.mouthOpen*8)*e,n+8*e,i+6*e),t.stroke(),t.restore(),t.restore()}function B(t,n,i,e,a){let s=a.isTalking?Math.abs(Math.sin(a.frame*.3))*5:0;t.save(),t.translate(n,i-s*e+a.breathePhase*1.5*e);let o=t.createRadialGradient(-14*e,i-20*e,4*e,0,i+10*e,52*e);o.addColorStop(0,"#ffa030"),o.addColorStop(1,"#e05800"),t.fillStyle=o,t.beginPath(),t.arc(0,i+10*e,52*e,0,Math.PI*2),t.fill(),t.fillStyle="#2ea032",t.beginPath(),t.ellipse(5*e,i-46*e,7*e,17*e,.5,0,Math.PI*2),t.fill(),t.strokeStyle="#4a2c0a",t.lineWidth=3*e,t.beginPath(),t.moveTo(0,i-42*e),t.quadraticCurveTo(5*e,i-56*e,0,i-62*e),t.stroke();let r=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(-16*e,i-5*e,9*e,9*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,9*e,9*r*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(-16*e,i-5*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,i-5*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#c05000",t.lineWidth=3*e,t.beginPath(),t.arc(0,i+10*e,15*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="#c05000",t.beginPath(),t.ellipse(0,i+20*e,10*e,(3+a.mouthOpen*7)*e,0,0,Math.PI),t.fill()),t.restore()}function Y(t,n,i,e,a,s){t.save(),t.translate(n,i+a.breathePhase*1.5*e),t.strokeStyle=s.brandColor,t.lineWidth=7*e,t.beginPath(),t.arc(n+40*e,i+15*e,17*e,-.8,.8),t.stroke(),t.fillStyle=s.brandColor,t.beginPath(),t.moveTo(n-28*e,i-30*e),t.lineTo(n-33*e,i+48*e),t.quadraticCurveTo(n,i+60*e,n+33*e,i+48*e),t.lineTo(n+28*e,i-30*e),t.closePath(),t.fill(),t.fillStyle=U(s.brandColor,40),t.beginPath(),t.ellipse(n,i-30*e,28*e,7*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.25)",t.lineWidth=2.5*e;let o=a.frame*2%20;for(let c=-1;c<=1;c++)t.beginPath(),t.moveTo(n+c*9*e,i-38*e-o*e),t.quadraticCurveTo(n+(c+1)*7*e,i-52*e-o*e,n+c*7*e,i-65*e-o*e),t.stroke();let r=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(n-10*e,i-5*e,8*e,8*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,8*e,8*r*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(n-10*e,i-5*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(n+10*e,i-5*e,5*e,5*r*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.8)",t.lineWidth=2.5*e,t.beginPath(),t.arc(n,i+15*e,11*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="rgba(0,0,0,0.35)",t.beginPath(),t.ellipse(n,i+22*e,8*e,(2+a.mouthOpen*6)*e,0,0,Math.PI),t.fill()),t.restore()}var E=class{constructor(n,i){this.raf=0;this.canvas=n,this.ctx=n.getContext("2d"),this.config=i,this.state={blinkTimer:150+Math.random()*100,blinkProgress:1,breathePhase:0,mouthOpen:0,headWobble:0,wobbleDir:1,frame:0,isTalking:!1}}setTalking(n){this.state.isTalking=n}updateConfig(n){this.config={...this.config,...n}}start(){let n=()=>{var o,r;let i=this.state,e=this.canvas.width/200,a=this.canvas.width/2,s=this.canvas.height/2;switch(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),i.frame++,i.breathePhase=Math.sin(i.frame*.02),i.blinkTimer--,i.blinkTimer<=0&&(i.blinkTimer=180+Math.random()*120),i.blinkTimer<10?i.blinkProgress=i.blinkTimer<5?i.blinkTimer/5:(10-i.blinkTimer)/5:i.blinkProgress=1,i.headWobble+=i.wobbleDir*.04,Math.abs(i.headWobble)>1.5&&(i.wobbleDir*=-1),i.isTalking?i.mouthOpen=.3+Math.sin(i.frame*.25)*.4:i.mouthOpen=Math.max(0,i.mouthOpen-.08),this.config.type){case"human":N(this.ctx,a,s,e,i,this.config);break;case"animal":F(this.ctx,a,s,e,i,this.config);break;case"object":(o=this.config.subtype)!=null&&o.includes("taza")||(r=this.config.subtype)!=null&&r.includes("cup")?Y(this.ctx,a,s,e,i,this.config):B(this.ctx,a,s,e,i);break;default:N(this.ctx,a,s,e,i,this.config)}this.raf=requestAnimationFrame(n)};this.raf=requestAnimationFrame(n)}stop(){cancelAnimationFrame(this.raf)}};function R(t,n){let i=t.data;switch(t.type){case"card":return j(i,n);case"gallery":return G(i);case"booking":return Q(i,n);case"pricing":return X(i,n);case"contact":return J(i,n);default:return document.createElement("div")}}function j(t,n){var o;let i=document.createElement("div");if(i.className="mz-ui-card",i.style.cssText=`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    margin: 8px 0;
    max-width: 280px;
  `,t.imageUrl){let r=document.createElement("img");r.src=t.imageUrl,r.alt=t.title,r.style.cssText="width:100%; height:140px; object-fit:cover;",i.appendChild(r)}else{let r=document.createElement("div");r.style.cssText=`width:100%; height:80px; background: linear-gradient(135deg, ${n}20, ${n}40); display:flex; align-items:center; justify-content:center;`,r.textContent="\u{1F6CD}\uFE0F",r.style.fontSize="2rem",i.appendChild(r)}let e=document.createElement("div");e.style.cssText="padding: 14px;";let a=document.createElement("p");if(a.style.cssText="color: #F0EDE8; font-weight: 700; font-size: 14px; margin: 0 0 6px;",a.textContent=t.title,e.appendChild(a),t.description){let r=document.createElement("p");r.style.cssText="color: #6b6b6b; font-size: 12px; margin: 0 0 8px; line-height: 1.5;",r.textContent=t.description,e.appendChild(r)}if(t.price){let r=document.createElement("p");r.style.cssText=`color: ${n}; font-weight: 700; font-size: 18px; margin: 0 0 10px;`,r.textContent=t.price,e.appendChild(r)}let s=document.createElement("a");return s.href=(o=t.ctaUrl)!=null?o:"#",s.target="_blank",s.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; text-decoration: none;
    transition: opacity 0.15s;
  `,s.textContent=t.ctaText,s.onmouseenter=()=>s.style.opacity="0.85",s.onmouseleave=()=>s.style.opacity="1",e.appendChild(s),i.appendChild(e),i}function G(t){let n=document.createElement("div");n.style.cssText="margin: 8px 0;";let i=document.createElement("div");if(i.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;",t.images.slice(0,6).forEach(e=>{var o;let a=document.createElement("div");a.style.cssText="flex-shrink:0; width:110px;";let s=document.createElement("img");s.src=e.url,s.alt=(o=e.alt)!=null?o:"",s.style.cssText="width:110px; height:80px; object-fit:cover; border-radius:10px;",a.appendChild(s),i.appendChild(a)}),t.caption){let e=document.createElement("p");e.style.cssText="color: #6b6b6b; font-size: 11px; margin: 6px 0 0;",e.textContent=t.caption,n.appendChild(e)}return n.appendChild(i),n}function Q(t,n){var s;let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let a=document.createElement("a");return a.href=(s=t.calUrl)!=null?s:"#",a.target="_blank",a.style.cssText=`
    display: block; text-align: center; background: ${n};
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
  `,a.textContent="\u{1F4C5} Reservar reuni\xF3n",i.appendChild(a),i}function X(t,n){let i=document.createElement("div");i.style.cssText="margin: 8px 0;";let e=document.createElement("div");return e.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px;",t.plans.forEach(a=>{let s=document.createElement("div");s.style.cssText=`
      flex-shrink:0; width:160px;
      background: ${a.highlighted?n+"15":"#1a1a1a"};
      border: 1px solid ${a.highlighted?n+"50":"#2a2a2a"};
      border-radius: 14px; padding: 14px;
    `;let o=document.createElement("p");o.style.cssText="color: #6b6b6b; font-size: 11px; font-weight: 700; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;",o.textContent=a.name,s.appendChild(o);let r=document.createElement("p");r.style.cssText=`color: ${a.highlighted?n:"#F0EDE8"}; font-weight: 700; font-size: 20px; margin: 0 0 10px;`,r.textContent=a.price,s.appendChild(r);let c=document.createElement("ul");if(c.style.cssText="margin:0 0 12px; padding: 0 0 0 14px;",a.features.slice(0,4).forEach(d=>{let l=document.createElement("li");l.style.cssText="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;",l.textContent=d,c.appendChild(l)}),s.appendChild(c),a.ctaUrl){let d=document.createElement("a");d.href=a.ctaUrl,d.target="_blank",d.style.cssText=`
        display:block; text-align:center; padding: 7px;
        background: ${a.highlighted?n:"transparent"};
        border: 1px solid ${a.highlighted?"transparent":"#333"};
        color: ${a.highlighted?"#fff":"#F0EDE8"};
        border-radius: 8px; font-size: 11px; font-weight:600; text-decoration:none;
      `,d.textContent="Elegir plan",s.appendChild(d)}e.appendChild(s)}),i.appendChild(e),i}function J(t,n){let i=document.createElement("div");i.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,i.appendChild(e);let a=document.createElement("form");a.style.cssText="display:flex; flex-direction:column; gap:8px;",a.addEventListener("submit",o=>o.preventDefault()),t.fields.forEach(o=>{var c,d;let r=document.createElement("input");r.type=(c=o.type)!=null?c:"text",r.placeholder=o.label,r.required=(d=o.required)!=null?d:!1,r.style.cssText=`
      background: #0e0e0e; border: 1px solid #222; color: #F0EDE8;
      border-radius: 10px; padding: 8px 12px; font-size: 12px; outline:none;
    `,r.onfocus=()=>r.style.borderColor=n,r.onblur=()=>r.style.borderColor="#222",a.appendChild(r)});let s=document.createElement("button");return s.type="submit",s.style.cssText=`
    background: ${n}; color: #fff;
    border: none; border-radius: 10px; padding: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
  `,s.textContent="Enviar",a.appendChild(s),i.appendChild(a),i}var Z=[{id:"hero_idle",section:"hero",priority:1,condition:t=>{var n,i;return t.currentSection==="hero"&&((i=(n=t.sectionsViewed.hero)==null?void 0:n.time)!=null?i:0)>=20},message:"\xBFQuer\xE9s que te cuente en 30 segundos qu\xE9 es Meetzy?"},{id:"problem_engage",section:"problem",priority:2,condition:t=>{var n,i;return t.currentSection==="problem"&&((i=(n=t.sectionsViewed.problem)==null?void 0:n.time)!=null?i:0)>=30},message:"\xBFAlguno de estos casos se parece a tu negocio?"},{id:"features_data",section:"features",priority:3,condition:t=>{var n,i;return t.currentSection==="features"&&((i=(n=t.sectionsViewed.features)==null?void 0:n.time)!=null?i:0)>=25},message:t=>`Esos datos que ves \u2014 son los tuyos reales en esta p\xE1gina. Llev\xE1s ${t.timeOnSite}s ac\xE1.`},{id:"usecases_tabs",section:"use-cases",priority:4,condition:t=>{var n,i;return t.currentSection==="use-cases"&&((i=(n=t.sectionsViewed["use-cases"])==null?void 0:n.revisits)!=null?i:0)>=2},message:"\xBFCu\xE1l es tu tipo de negocio? Te muestro c\xF3mo quedar\xEDa exactamente."},{id:"usecases_idle",section:"use-cases",priority:5,condition:t=>{var n,i,e,a;return t.currentSection==="use-cases"&&((i=(n=t.sectionsViewed["use-cases"])==null?void 0:n.time)!=null?i:0)>=35&&((a=(e=t.sectionsViewed["use-cases"])==null?void 0:e.revisits)!=null?a:0)<2},message:"\xBFEn qu\xE9 rubro est\xE1s? Te armo c\xF3mo quedar\xEDa tu agente."},{id:"avatar_explore",section:"avatar",priority:6,condition:t=>{var n,i;return t.currentSection==="avatar"&&((i=(n=t.sectionsViewed.avatar)==null?void 0:n.time)!=null?i:0)>=20},message:"\xBFCu\xE1l de estos se parece m\xE1s a lo que imagin\xE1s para tu marca?"},{id:"how_step3",section:"how",priority:7,condition:t=>{var n,i;return t.currentSection==="how"&&((i=(n=t.sectionsViewed.how)==null?void 0:n.time)!=null?i:0)>=30},message:"\xBFTen\xE9s web propia o us\xE1s Webflow, WordPress o Shopify?"},{id:"pricing_first",section:"pricing",priority:0,condition:t=>{var n,i,e,a;return t.currentSection==="pricing"&&((i=(n=t.sectionsViewed.pricing)==null?void 0:n.time)!=null?i:0)>=30&&((a=(e=t.sectionsViewed.pricing)==null?void 0:e.revisits)!=null?a:0)===0},message:"\xBFQuer\xE9s que te ayude a entender cu\xE1l plan tiene m\xE1s sentido para lo que necesit\xE1s?"},{id:"pricing_long",section:"pricing",priority:0,condition:t=>{var n,i;return t.currentSection==="pricing"&&((i=(n=t.sectionsViewed.pricing)==null?void 0:n.time)!=null?i:0)>=60},message:"Antes de que te vayas \u2014 ten\xE9s 14 d\xEDas gratis para probarlo sin tarjeta."},{id:"pricing_revisit",section:"pricing",priority:0,condition:t=>{var n,i;return t.currentSection==="pricing"&&((i=(n=t.sectionsViewed.pricing)==null?void 0:n.revisits)!=null?i:0)>=2},message:"Volviste a los precios. \xBFQu\xE9 te est\xE1 frenando?"},{id:"faq_idle",section:"faq",priority:8,condition:t=>{var n,i,e,a;return(t.currentSection==="pricing"||t.currentSection==="faq")&&((i=(n=t.sectionsViewed.pricing)==null?void 0:n.time)!=null?i:0)>=20&&((a=(e=t.sectionsViewed.faq)==null?void 0:e.time)!=null?a:0)>=20},message:"\xBFNo encontraste lo que buscabas? Preguntame directamente."},{id:"return_visitor",section:"*",priority:-1,condition:t=>t.isReturnVisitor&&t.timeOnSite<15,message:"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?"},{id:"exit_intent",section:"*",priority:1,condition:t=>t.mouseY<60&&t.timeOnSite>30&&t.currentSection==="pricing",message:"Antes de que te vayas \u2014 el plan Starter arranca en $29/mes y tiene 14 d\xEDas gratis."}],x={hero:["\xBFC\xF3mo funciona exactamente?","\xBFPara qu\xE9 tipo de negocio?","Ver los planes"],problem:["Tengo una veterinaria","Tengo un ecommerce","Tengo una consultora"],features:["\xBFEsto no es invasivo?","\xBFC\xF3mo lo instalo?","Ver demo en vivo"],"use-cases":["Mi negocio es diferente","\xBFFunciona para pymes?","\xBFCu\xE1nto cuesta?"],avatar:["\xBFPuedo poner mi logo?","\xBFQu\xE9 es el Plan Pro?","Ver todos los tipos"],how:["\xBFTengo que saber programar?","\xBFCu\xE1nto tarda?","Probarlo gratis"],pricing:["\xBFQu\xE9 incluye el Pro?","\xBFHay descuento anual?","Empezar gratis"],faq:["\xBFPuedo cancelar cuando quiero?","\xBFFunciona en mi web?","Hablar con alguien"],demo:["\xBFEsto es el producto real?","\xBFC\xF3mo lo instalo yo?","Empezar gratis"]},P=class{constructor(){this.firedIds=new Set;this.lastTriggerAt=0;this.triggerCount=0;this.MAX_TRIGGERS=3;this.MIN_FIRST_TRIGGER_DELAY=15e3;this.COOLDOWN=18e4}evaluate(n){let i=Date.now();if(i-window._mzWidgetInit<this.MIN_FIRST_TRIGGER_DELAY||i-this.lastTriggerAt<this.COOLDOWN||this.triggerCount>=this.MAX_TRIGGERS)return null;let e=[...Z].sort((a,s)=>a.priority-s.priority);for(let a of e)if(!this.firedIds.has(a.id)&&!(a.section!=="*"&&a.section!==n.currentSection)&&a.condition(n))return this.firedIds.add(a.id),this.lastTriggerAt=i,this.triggerCount++,a;return null}getMessage(n,i){return typeof n.message=="function"?n.message(i):n.message}getChips(n){var i;return(i=x[n])!=null?i:x.hero}},H;typeof window!="undefined"&&(window._mzWidgetInit=(H=window._mzWidgetInit)!=null?H:Date.now());var C="http://localhost:3000",I=class{constructor(){this.ctx={timeOnSite:0,currentSection:"",sectionsViewed:{},referrer:document.referrer,searchQuery:null,localHour:new Date().getHours(),isReturnVisitor:!!localStorage.getItem("mz_visited"),inferredIntent:"exploring",scrollDepth:0,mouseY:window.innerHeight/2};this.startTime=Date.now();this.sectionTimers={};this.activeSections=new Set;this.observer=null;this.pagesVisited=[];this.lastActivityMs=Date.now();this.activeTimeSec=0;let n=new URLSearchParams(window.location.search);this.utm={utm_source:n.get("utm_source"),utm_medium:n.get("utm_medium"),utm_campaign:n.get("utm_campaign")},this.addPagePath(window.location.pathname),this.patchHistory()}addPagePath(n){let i=n||"/";(this.pagesVisited.length===0||this.pagesVisited[this.pagesVisited.length-1]!==i)&&this.pagesVisited.push(i)}patchHistory(){let n=this,i=e=>function(...a){let s=e.apply(this,a);return n.addPagePath(window.location.pathname),s};history.pushState=i(History.prototype.pushState),history.replaceState=i(History.prototype.replaceState),window.addEventListener("popstate",()=>this.addPagePath(window.location.pathname))}bumpActivity(){this.lastActivityMs=Date.now()}idleMs(){return Date.now()-this.lastActivityMs}init(){var e;localStorage.setItem("mz_visited","true");try{let a=new URL(document.referrer);this.ctx.searchQuery=(e=a.searchParams.get("q"))!=null?e:a.searchParams.get("query")}catch(a){}let n=()=>this.bumpActivity();["keydown","mousedown","scroll","touchstart"].forEach(a=>{window.addEventListener(a,n,{passive:!0})}),setInterval(()=>{var a;this.ctx.timeOnSite=Math.round((Date.now()-this.startTime)/1e3);for(let s of this.activeSections)this.ctx.sectionsViewed[s]||(this.ctx.sectionsViewed[s]={time:0,revisits:0}),this.ctx.sectionsViewed[s].time=Math.round((Date.now()-((a=this.sectionTimers[s])!=null?a:Date.now()))/1e3);document.visibilityState==="visible"&&Date.now()-this.lastActivityMs<45e3&&(this.activeTimeSec+=2),this.updateIntent()},2e3),this.observer=new IntersectionObserver(a=>{var s,o,r;for(let c of a){let d=c.target,l=(o=(s=d.dataset.section)!=null?s:d.id)!=null?o:"";l&&(c.isIntersecting?(this.activeSections.add(l),this.sectionTimers[l]=(r=this.sectionTimers[l])!=null?r:Date.now(),this.ctx.sectionsViewed[l]?this.ctx.sectionsViewed[l].revisits++:this.ctx.sectionsViewed[l]={time:0,revisits:0},this.ctx.currentSection=l):this.activeSections.delete(l))}},{threshold:.4});let i=a=>{var s;return(s=this.observer)==null?void 0:s.observe(a)};document.querySelectorAll("[data-section]").forEach(i),new MutationObserver(a=>{for(let s of a)for(let o of s.addedNodes)o instanceof Element&&o.hasAttribute("data-section")&&i(o)}).observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("scroll",()=>{let a=document.body.scrollHeight-window.innerHeight;this.ctx.scrollDepth=a>0?Math.round(window.scrollY/a*100):0,this.bumpActivity()},{passive:!0}),window.addEventListener("mousemove",a=>{this.ctx.mouseY=a.clientY},{passive:!0})}updateIntent(){var a,s,o,r;let n=this.ctx.sectionsViewed,i=(s=(a=n.pricing)==null?void 0:a.time)!=null?s:0;((r=(o=n.pricing)==null?void 0:o.revisits)!=null?r:0)>=2||i>60?this.ctx.inferredIntent="ready_to_act":i>30?this.ctx.inferredIntent="evaluating_pricing":this.ctx.isReturnVisitor?this.ctx.inferredIntent="returning_interested":this.ctx.timeOnSite>120?this.ctx.inferredIntent="deeply_exploring":this.ctx.inferredIntent="exploring"}get(){return{...this.ctx}}destroy(){var n;(n=this.observer)==null||n.disconnect()}},D=class{constructor(n,i){this.state="idle";this.isStreaming=!1;this.avatarRenderer=null;this.msgTimeout=null;this.sessionEndSent=!1;this.siteId=n,this.config=i,this.tracker=new I,this.triggers=new P,this.visitorId=(()=>{let a=localStorage.getItem("mz_uid");return a||(a=Math.random().toString(36).slice(2)+Date.now().toString(36),localStorage.setItem("mz_uid",a)),a})();let e=sessionStorage.getItem(`mz_c_${n}`);e&&(this.conversationId=e)}init(){let n=this.config.widgetPosition==="bottom-left",i=document.createElement("div");i.id="meetzy-widget",i.style.cssText=`position:fixed;z-index:2147483647;bottom:28px;${n?"left:28px":"right:28px"};`,document.body.appendChild(i),this.shadow=i.attachShadow({mode:"open"}),this.shadow.innerHTML=`<style>${this.css()}</style>`,this.buildBubble(),this.buildSpeech(),this.buildChat(),this.tracker.init(),this.config.proactiveEnabled&&setInterval(()=>this.evaluateTriggers(),2e3),window.addEventListener("pagehide",()=>{this.flushSession()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&this.flushSession()}),window.addEventListener("beforeunload",()=>{this.flushSession()}),setInterval(()=>{this.tracker.idleMs()>=1800*1e3&&this.flushSession()},6e4)}flushSession(){var o,r;if(this.sessionEndSent)return;let n=(r=(o=this.conversationId)!=null?o:sessionStorage.getItem(`mz_c_${this.siteId}`))!=null?r:void 0;if(!n)return;this.sessionEndSent=!0;let i=this.tracker.get(),e=this.tracker.utm,a=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),s={conversationId:n,visitorId:this.visitorId,siteId:this.siteId,sessionDuration:i.timeOnSite,activeTime:this.tracker.activeTimeSec,pagesVisited:[...this.tracker.pagesVisited],sectionsViewed:i.sectionsViewed,scrollDepth:i.scrollDepth,device:a?"mobile":"desktop",browser:navigator.userAgent.includes("Chrome")?"chrome":"other",referrer:document.referrer||null,searchQuery:i.searchQuery,utmSource:e.utm_source,utmMedium:e.utm_medium,utmCampaign:e.utm_campaign};fetch(`${C}/api/sessions/end`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s),keepalive:!0}).catch(()=>{})}buildBubble(){let n=document.createElement("div");n.className="bub-wrap";let i=document.createElement("div");i.className="bub-ring",n.appendChild(i);let e=document.createElement("div");e.className="bub-badge",e.innerHTML='<span class="bub-dot"></span><span>En vivo</span>',n.appendChild(e);let a=document.createElement("div");if(a.className="bub",a.title=`Hablame con ${this.config.agentName}`,(this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType){let r=document.createElement("canvas");r.width=128,r.height=128,r.style.cssText="width:52px;height:52px;border-radius:50%;",a.appendChild(r),setTimeout(()=>{var c;this.avatarRenderer=new E(r,{type:this.config.avatarType,subtype:(c=this.config.avatarSubtype)!=null?c:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}),this.avatarRenderer.start()},50)}else a.innerHTML=`<div class="bub-init">${this.config.agentName.slice(0,2).toUpperCase()}</div>`;a.addEventListener("click",()=>this.toggleChat());let o=null;a.addEventListener("mouseenter",()=>{o=setTimeout(()=>this.showTooltip(),400)}),a.addEventListener("mouseleave",()=>{o&&clearTimeout(o),this.hideTooltip()}),n.appendChild(a),this.bubbleWrap=n,this.shadow.appendChild(n)}showTooltip(){let n=this.shadow.querySelector(".bub-tip");n||(n=document.createElement("div"),n.className="bub-tip",n.textContent=`Hablame con ${this.config.agentName}`,this.bubbleWrap.appendChild(n)),n.style.opacity="1"}hideTooltip(){let n=this.shadow.querySelector(".bub-tip");n&&(n.style.opacity="0")}buildSpeech(){let n=document.createElement("div");n.className="speech speech-hidden",this.speechEl=n,this.shadow.appendChild(n)}showMessage(n){this.state!=="chat"&&(this.state="message",this.bubbleWrap.classList.add("bub-shake"),setTimeout(()=>this.bubbleWrap.classList.remove("bub-shake"),600),this.speechEl.className="speech speech-visible",this.speechEl.innerHTML=`
      <p class="speech-text">${n}</p>
      <div class="speech-btns">
        <button class="speech-yes">Contame m\xE1s</button>
        <button class="speech-no">\u2715</button>
      </div>
    `,this.speechEl.querySelector(".speech-yes").addEventListener("click",()=>{this.closeMessage(),this.openChat(n)}),this.speechEl.querySelector(".speech-no").addEventListener("click",()=>{this.closeMessage()}),this.msgTimeout&&clearTimeout(this.msgTimeout),this.msgTimeout=setTimeout(()=>this.closeMessage(),1e4))}closeMessage(){this.speechEl.className="speech speech-hidden",this.state==="message"&&(this.state="idle"),this.msgTimeout&&(clearTimeout(this.msgTimeout),this.msgTimeout=null)}buildChat(){let n=document.createElement("div");n.className="chat";let i=document.createElement("div");i.className="chat-header";let e=document.createElement("div");if(e.className="chat-av",(this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType){let h=document.createElement("canvas");h.width=80,h.height=80,h.style.cssText="width:38px;height:38px;border-radius:50%;",e.appendChild(h),setTimeout(()=>{var g;new E(h,{type:this.config.avatarType,subtype:(g=this.config.avatarSubtype)!=null?g:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}).start()},80)}else e.innerHTML=`<div class="chat-av-init">${this.config.agentName.slice(0,2).toUpperCase()}</div>`;i.appendChild(e);let s=document.createElement("div");s.className="chat-info",s.innerHTML=`<p class="chat-name">${this.config.agentName}</p><p class="chat-role"><span class="chat-dot"></span>${this.config.agentRole}</p>`,i.appendChild(s);let o=document.createElement("button");o.className="chat-close",o.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',o.addEventListener("click",()=>this.closeChat()),i.appendChild(o),n.appendChild(i);let r=document.createElement("div");r.className="chat-msgs",this.msgsEl=r,n.appendChild(r);let c=document.createElement("div");c.className="chat-chips",c.id="mz-chips",n.appendChild(c);let d=document.createElement("div");d.className="chat-input-area";let l=document.createElement("textarea");l.className="chat-ta",l.placeholder=`Preguntale a ${this.config.agentName}\u2026`,l.rows=1,l.addEventListener("input",()=>{l.style.height="auto",l.style.height=Math.min(l.scrollHeight,88)+"px"}),l.addEventListener("keydown",h=>{if(h.key==="Enter"&&!h.shiftKey){h.preventDefault();let g=l.value.trim();g&&!this.isStreaming&&this.send(g)}}),d.appendChild(l);let u=document.createElement("button");if(u.className="chat-send",u.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',u.addEventListener("click",()=>{let h=l.value.trim();h&&!this.isStreaming&&this.send(h)}),d.appendChild(u),n.appendChild(d),this.config.plan!=="elite"){let h=document.createElement("div");h.className="chat-footer",h.innerHTML='Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a>',n.appendChild(h)}this.chatEl=n,this.shadow.appendChild(n)}updateChips(n){var a;let i=this.shadow.getElementById("mz-chips");if(!i)return;i.innerHTML="",((a=x[n])!=null?a:x.hero).forEach(s=>{let o=document.createElement("button");o.className="chip",o.textContent=s,o.addEventListener("click",()=>{i.style.display="none",this.send(s)}),i.appendChild(o)}),i.style.display="flex"}toggleChat(){this.state==="chat"?this.closeChat():(this.closeMessage(),this.openChat())}openChat(n){this.state="chat",this.chatEl.classList.add("chat-open");let i=this.tracker.get();if(this.msgsEl.children.length===0){let e=n!=null?n:this.buildContextOpener(i);this.typeMessage(e),this.updateChips(i.currentSection)}setTimeout(()=>{var e;(e=this.chatEl.querySelector(".chat-ta"))==null||e.focus()},350)}closeChat(){this.state="idle",this.chatEl.classList.remove("chat-open")}buildContextOpener(n){var e,a;if(n.isReturnVisitor)return"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?";let i=(a=(e=n.sectionsViewed.pricing)==null?void 0:e.time)!=null?a:0;return i>20?`Vi que pasaste ${i}s en los precios. \xBFQuer\xE9s que te ayude a elegir?`:n.timeOnSite>60?`Llev\xE1s ${n.timeOnSite}s explorando. \xBFPuedo ayudarte?`:this.config.welcomeMessage}typeMessage(n){let i=document.createElement("div");i.className="msg-wrap msg-agent";let e=document.createElement("div");e.className="msg msg-a",e.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',i.appendChild(e),this.msgsEl.appendChild(i),this.msgsEl.scrollTop=9999,setTimeout(()=>{e.textContent="";let a=0,s=setInterval(()=>{a++,e.textContent=n.slice(0,a),this.msgsEl.scrollTop=9999,a>=n.length&&clearInterval(s)},20)},500)}addUserMsg(n){let i=document.createElement("div");i.className="msg-wrap msg-user";let e=document.createElement("div");e.className="msg msg-u",e.textContent=n,i.appendChild(e),this.msgsEl.appendChild(i),this.msgsEl.scrollTop=9999}addStreamBubble(){let n=document.createElement("div");n.className="msg-wrap msg-agent";let i=document.createElement("div");return i.className="msg msg-a",i.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',n.appendChild(i),this.msgsEl.appendChild(n),this.msgsEl.scrollTop=9999,i}async send(n){var o,r;if(this.isStreaming)return;let i=this.chatEl.querySelector(".chat-ta");i&&(i.value="",i.style.height="auto");let e=this.shadow.getElementById("mz-chips");e&&(e.style.display="none"),this.addUserMsg(n),this.isStreaming=!0,this.tracker.bumpActivity(),(o=this.avatarRenderer)==null||o.setTalking(!0);let a=this.addStreamBubble(),s=this.tracker.get();try{let c=await fetch(`${C}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:this.siteId,message:n,conversationId:this.conversationId,visitorId:this.visitorId,plan:this.config.plan,currentSection:s.currentSection,visitorContext:s})});if(!c.ok||!c.body){a.textContent="Error al procesar.";return}let d=c.headers.get("X-Conversation-Id");d&&(d!==this.conversationId&&(this.sessionEndSent=!1),this.conversationId=d,sessionStorage.setItem(`mz_c_${this.siteId}`,d));let l=c.body.getReader(),u=new TextDecoder,h="";for(a.textContent="";;){let{done:g,value:y}=await l.read();if(g)break;for(let T of u.decode(y).split(`
`))if(T.startsWith("data: "))try{let f=JSON.parse(T.slice(6));if(f.type==="text"&&f.content&&(h+=f.content,a.textContent=h,this.msgsEl.scrollTop=9999),f.type==="ui_component"&&f.component){let S=R(f.component,this.config.brandColor);this.msgsEl.appendChild(S),this.msgsEl.scrollTop=9999}}catch(f){}}this.updateChips(s.currentSection)}catch(c){a.textContent="Error de conexi\xF3n."}finally{this.isStreaming=!1,(r=this.avatarRenderer)==null||r.setTalking(!1)}}evaluateTriggers(){if(this.state==="chat")return;let n=this.tracker.get(),i=this.triggers.evaluate(n);if(!i)return;let e=this.triggers.getMessage(i,n);this.showMessage(e)}css(){let n=this.config.brandColor,i=this.config.widgetPosition==="bottom-left";return`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* \u2500\u2500 BUBBLE \u2500\u2500 */
      .bub-wrap { position: relative; width: 64px; height: 64px; }
      .bub {
        width: 64px; height: 64px; border-radius: 50%; background: ${n};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; z-index: 2;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 0 ${n}40;
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
      }
      .bub:hover { transform: scale(1.1); }
      .bub-ring {
        position: absolute; inset: -5px; border-radius: 50%;
        border: 2px solid ${n}; opacity: 0.35; z-index: 1; pointer-events: none;
        animation: mz-ring 3s ease-out infinite;
      }
      .bub-init { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
      .bub-badge {
        position: absolute; top: -6px; ${i?"left: -4px":"right: -4px"};
        background: #111; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 2px 7px;
        display: flex; align-items: center; gap: 4px;
        font-family: 'DM Sans', sans-serif; font-size: 9px; color: #F0EDE8;
        z-index: 3; white-space: nowrap;
      }
      .bub-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: mz-blink 2s ease infinite; }
      .bub-tip {
        position: absolute; ${i?"left: 72px":"right: 72px"};
        top: 50%; transform: translateY(-50%);
        background: #111; border: 1px solid rgba(255,255,255,0.09);
        color: #F0EDE8; font-family: 'DM Sans', sans-serif;
        font-size: 11px; padding: 6px 12px; border-radius: 10px;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      @keyframes bub-shake {
        0%,100% { transform: translateX(0) rotate(0deg); }
        20%      { transform: translateX(-4px) rotate(-3deg); }
        40%      { transform: translateX(4px) rotate(3deg); }
        60%      { transform: translateX(-3px) rotate(-2deg); }
        80%      { transform: translateX(3px) rotate(2deg); }
      }
      .bub-shake .bub { animation: bub-shake 0.6s cubic-bezier(.36,.07,.19,.97); }

      /* \u2500\u2500 SPEECH \u2500\u2500 */
      .speech {
        position: absolute;
        ${i?"left: 0":"right: 0"};
        bottom: 72px; width: 260px;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.4,.64,1);
      }
      .speech-hidden { opacity: 0; transform: translateY(8px) scale(0.95); pointer-events: none; }
      .speech-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
      .speech-text {
        background: #0E0E12; border: 1px solid rgba(255,255,255,0.1);
        border-radius: ${i?"16px 16px 16px 4px":"16px 16px 4px 16px"};
        padding: 14px 16px; font-size: 13px; color: #F0EDE8;
        line-height: 1.55; margin-bottom: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.45);
      }
      .speech-btns { display: flex; gap: 6px; }
      .speech-yes {
        flex: 1; padding: 7px 10px; background: ${n};
        border: none; border-radius: 9px; color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
        cursor: pointer; transition: opacity 0.15s;
      }
      .speech-yes:hover { opacity: 0.85; }
      .speech-no {
        width: 30px; height: 30px; background: rgba(255,255,255,0.07);
        border: none; border-radius: 9px; color: rgba(255,255,255,0.4);
        cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
      }
      .speech-no:hover { background: rgba(255,255,255,0.12); }

      /* \u2500\u2500 CHAT PANEL \u2500\u2500 */
      .chat {
        position: absolute;
        ${i?"left: 0":"right: 0"};
        bottom: 76px; width: 380px; height: 540px;
        background: #0E0E0E; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.65);
        display: flex; flex-direction: column; overflow: hidden;
        transform-origin: ${i?"bottom left":"bottom right"};
        transform: scale(0.88) translateY(8px); opacity: 0;
        transition: transform 0.35s cubic-bezier(.34,1.2,.64,1), opacity 0.3s ease;
        pointer-events: none;
      }
      .chat-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

      .chat-header {
        display: flex; align-items: center; gap: 10px;
        padding: 13px 15px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
      }
      .chat-av { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
      .chat-av-init {
        width: 38px; height: 38px; border-radius: 50%; background: ${n}; color: #fff;
        font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px;
        display: flex; align-items: center; justify-content: center;
      }
      .chat-info { flex: 1; min-width: 0; }
      .chat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #F0EDE8; }
      .chat-role { font-size: 10px; color: rgba(240,237,232,0.4); display: flex; align-items: center; gap: 3px; margin-top: 2px; }
      .chat-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
      .chat-close {
        background: none; border: none; color: rgba(240,237,232,0.35); cursor: pointer;
        padding: 5px; border-radius: 7px; display: flex; transition: color 0.15s, background 0.15s;
      }
      .chat-close:hover { color: #F0EDE8; background: rgba(255,255,255,0.06); }

      .chat-msgs {
        flex: 1; overflow-y: auto; padding: 13px;
        display: flex; flex-direction: column; gap: 8px;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent;
      }
      .msg-wrap { display: flex; }
      .msg-agent { justify-content: flex-start; }
      .msg-user  { justify-content: flex-end; }
      .msg {
        max-width: 83%; padding: 9px 13px; border-radius: 17px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.5;
        word-wrap: break-word; animation: mz-fade 0.22s ease;
      }
      .msg-a { background: #1a1a1a; color: #F0EDE8; border-bottom-left-radius: 3px; }
      .msg-u { background: ${n}; color: #fff; border-bottom-right-radius: 3px; }

      .typing { display: flex; gap: 4px; padding: 2px 0; }
      .typing span { width: 6px; height: 6px; background: ${n}; border-radius: 50%; animation: mz-bounce 1.2s ease infinite; }
      .typing span:nth-child(2) { animation-delay: 0.15s; }
      .typing span:nth-child(3) { animation-delay: 0.3s; }

      .chat-chips { padding: 0 13px 9px; display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; }
      .chip {
        background: transparent; border: 1px solid ${n}45; color: ${n};
        padding: 5px 10px; border-radius: 100px;
        font-family: 'DM Sans', sans-serif; font-size: 11px; cursor: pointer;
        transition: all 0.15s;
      }
      .chip:hover { background: ${n}12; }

      .chat-input-area {
        display: flex; align-items: flex-end; gap: 7px;
        padding: 9px 13px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
      }
      .chat-ta {
        flex: 1; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);
        color: #F0EDE8; border-radius: 12px; padding: 8px 12px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; resize: none;
        outline: none; max-height: 88px; line-height: 1.5; transition: border-color 0.15s;
      }
      .chat-ta:focus { border-color: ${n}; }
      .chat-ta::placeholder { color: rgba(240,237,232,0.22); }
      .chat-send {
        width: 35px; height: 35px; border-radius: 50%; background: ${n}; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      }
      .chat-send:hover { opacity: 0.85; transform: scale(1.06); }
      .chat-footer { text-align: center; padding: 6px; font-size: 9px; color: rgba(240,237,232,0.2); font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
      .chat-footer a { color: ${n}; text-decoration: none; }

      /* \u2500\u2500 ANIMATIONS \u2500\u2500 */
      @keyframes mz-ring  { 0%   { transform: scale(1); opacity: 0.35; } 100% { transform: scale(1.75); opacity: 0; } }
      @keyframes mz-blink { 0%,80%,100% { opacity: 1; } 40% { opacity: 0.3; } }
      @keyframes mz-bounce{ 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      @keyframes mz-fade  { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

      /* \u2500\u2500 MOBILE \u2500\u2500 */
      @media (max-width: 480px) {
        .chat { position: fixed; inset: 0; width: 100vw; height: 100dvh; border-radius: 0; bottom: auto; right: auto; left: auto; }
        .speech { width: 220px; }
      }
    `}};function K(t,n){Array.from(document.body.children).forEach(p=>{p.id!=="meetzy-fp"&&(p.style.display="none")}),document.body.style.cssText="margin:0;padding:0;overflow:hidden;";let i=document.createElement("div");i.id="meetzy-fp",i.style.cssText="position:fixed;inset:0;z-index:2147483647;",document.body.appendChild(i);let e=i.attachShadow({mode:"open"}),a=n.brandColor;e.innerHTML=`<style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .w{display:flex;width:100vw;height:100vh;background:#08080a;font-family:'DM Sans',sans-serif;color:#F0EDE8;}
    .s{width:240px;flex-shrink:0;background:#0d0d0d;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:14px;}
    .av{width:90px;height:90px;border-radius:50%;background:${a};color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:32px;display:flex;align-items:center;justify-content:center;}
    .an{font-family:'Syne',sans-serif;font-weight:800;font-size:17px;}
    .ar{font-size:11px;color:rgba(240,237,232,0.4);display:flex;align-items:center;gap:4px;}
    .ad{width:7px;height:7px;border-radius:50%;background:#22c55e;}
    .c{flex:1;display:flex;flex-direction:column;min-width:0;}
    .m{flex:1;overflow-y:auto;padding:28px 44px;display:flex;flex-direction:column;gap:12px;}
    .mw{display:flex;}.ma{justify-content:flex-start;}.mu{justify-content:flex-end;}
    .mb{max-width:72%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.6;word-wrap:break-word;}
    .mba{background:#111;border:1px solid rgba(255,255,255,0.06);border-bottom-left-radius:4px;}
    .mbu{background:${a};color:#fff;border-bottom-right-radius:4px;}
    .ia{display:flex;align-items:flex-end;gap:10px;padding:14px 44px 28px;border-top:1px solid rgba(255,255,255,0.05);}
    .it{flex:1;background:#111;border:1px solid rgba(255,255,255,0.08);color:#F0EDE8;border-radius:14px;padding:12px 16px;font-size:14px;resize:none;outline:none;max-height:110px;line-height:1.5;transition:border-color 0.15s;}
    .it:focus{border-color:${a};}
    .it::placeholder{color:rgba(240,237,232,0.2);}
    .sb{width:46px;height:46px;border-radius:50%;background:${a};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
    .typing{display:flex;gap:4px;padding:2px 0;}
    .typing span{width:8px;height:8px;background:${a};border-radius:50%;animation:b 1.2s ease infinite;}
    .typing span:nth-child(2){animation-delay:0.15s;}
    .typing span:nth-child(3){animation-delay:0.3s;}
    @keyframes b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @media(max-width:600px){.s{display:none;}.m,.ia{padding-left:16px;padding-right:16px;}}
  </style>`;let s=document.createElement("div");s.className="w",e.appendChild(s);let o=document.createElement("div");o.className="s",o.innerHTML=`<div class="av">${n.agentName.slice(0,2).toUpperCase()}</div><div class="an">${n.agentName}</div><div class="ar"><span class="ad"></span>${n.agentRole}</div>`,s.appendChild(o);let r=document.createElement("div");r.className="c";let c=document.createElement("div");c.className="m",c.id="fp-msgs",r.appendChild(c);let d=document.createElement("div");d.className="ia";let l=document.createElement("textarea");l.className="it",l.placeholder="Contame qu\xE9 necesit\xE1s\u2026",l.rows=1,l.addEventListener("input",()=>{l.style.height="auto",l.style.height=Math.min(l.scrollHeight,110)+"px"}),d.appendChild(l);let u=document.createElement("button");u.className="sb",u.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',d.appendChild(u),r.appendChild(d),s.appendChild(r);let h=(()=>{let p=localStorage.getItem("mz_uid");return p||(p=Math.random().toString(36).slice(2),localStorage.setItem("mz_uid",p)),p})(),g,y=!1,T=Date.now(),f=!1;function S(){if(f||!g)return;f=!0;let p=Math.round((Date.now()-T)/1e3),m=new URLSearchParams(location.search);fetch(`${C}/api/sessions/end`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:g,visitorId:h,siteId:t,sessionDuration:p,activeTime:p,pagesVisited:[location.pathname],scrollDepth:0,device:/Mobile/i.test(navigator.userAgent)?"mobile":"desktop",browser:navigator.userAgent.includes("Chrome")?"chrome":"other",referrer:document.referrer||null,utmSource:m.get("utm_source"),utmMedium:m.get("utm_medium"),utmCampaign:m.get("utm_campaign")}),keepalive:!0}).catch(()=>{})}window.addEventListener("beforeunload",S),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&S()});function L(p,m){let w=e.getElementById("fp-msgs"),b=document.createElement("div");b.className=`mw m${p}`;let v=document.createElement("div");return v.className=`mb mb${p}`,v.textContent=m,b.appendChild(v),w.appendChild(b),w.scrollTop=9999,v}L("a",n.welcomeMessage);async function _(p){if(y)return;l.value="",l.style.height="auto",L("u",p),y=!0;let m=e.getElementById("fp-msgs"),w=document.createElement("div");w.className="mw ma";let b=document.createElement("div");b.className="mb mba",b.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',w.appendChild(b),m.appendChild(w),m.scrollTop=9999;try{let v=await fetch(`${C}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:t,message:p,conversationId:g,visitorId:h,plan:n.plan})});if(!v.ok||!v.body){b.textContent="Error.";return}let M=v.headers.get("X-Conversation-Id");M&&(M!==g&&(f=!1),g=M);let V=v.body.getReader(),A=new TextDecoder,z="";for(b.textContent="";;){let{done:q,value:W}=await V.read();if(q)break;for(let $ of A.decode(W).split(`
`))if($.startsWith("data: "))try{let k=JSON.parse($.slice(6));k.type==="text"&&k.content&&(z+=k.content,b.textContent=z,m.scrollTop=9999)}catch(k){}}}catch(v){b.textContent="Error."}finally{y=!1}}l.addEventListener("keydown",p=>{if(p.key==="Enter"&&!p.shiftKey){p.preventDefault();let m=l.value.trim();m&&!y&&_(m)}}),u.addEventListener("click",()=>{let p=l.value.trim();p&&!y&&_(p)})}async function O(){var i,e;let t=(i=window.MEETZYCONFIG)==null?void 0:i.siteId;if(!t)return;window._mzWidgetInit=(e=window._mzWidgetInit)!=null?e:Date.now();let n;try{let a=await fetch(`${C}/api/sites/${t}/config`);if(!a.ok||(n=await a.json(),!n.isActive))return}catch(a){return}if(n.embedMode==="fullpage"){K(t,n);return}new D(t,n).init()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",O):O();})();
