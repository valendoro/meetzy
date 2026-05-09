/* Meetzy Widget v1.0 — https://meetzy.ai */
"use strict";(()=>{function Q(t,i=50){let n=parseInt(t.slice(1,3),16),e=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgb(${Math.min(255,n+i)},${Math.min(255,e+i)},${Math.min(255,a+i)})`}function A(t,i,n,e,a,r){let s=r.subtype==="female",o=s?"#f5c5a0":"#e8b88a",c=s?"#4a2c0a":"#2c1a0a";t.save(),t.translate(i,n+a.breathePhase*1.5*e),t.fillStyle=r.brandColor,t.beginPath(),t.roundRect(-28*e,30*e,56*e,55*e,8*e),t.fill(),t.fillStyle="rgba(255,255,255,0.8)",t.font=`bold ${13*e}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("M",i,n+55*e),t.fillStyle=r.brandColor,t.beginPath(),t.roundRect(-44*e,32*e,17*e,42*e,6*e),t.fill(),t.beginPath(),t.roundRect(27*e,32*e,17*e,42*e,6*e),t.fill(),t.fillStyle=o,t.beginPath(),t.roundRect(-8*e,8*e,16*e,22*e,4*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle=c,s?(t.beginPath(),t.ellipse(i,n-32*e,34*e,38*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.roundRect(i-33*e,n-35*e,11*e,55*e,6*e),t.fill(),t.beginPath(),t.roundRect(i+22*e,n-35*e,11*e,55*e,6*e),t.fill()):(t.beginPath(),t.ellipse(i,n-34*e,29*e,22*e,0,0,Math.PI),t.fill()),t.fillStyle=o,t.beginPath(),t.ellipse(i,n-20*e,29*e,33*e,0,0,Math.PI*2),t.fill();let d=n-26*e,l=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(i-10*e,d,8*e,8*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+10*e,d,8*e,8*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(i-10*e,d,5*e,5*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+10*e,d,5*e,5*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255,255,255,0.6)",t.beginPath(),t.ellipse(i-8*e,d-2*e,2*e,2*l*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+12*e,d-2*e,2*e,2*l*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#c0392b",t.beginPath(),t.ellipse(i,n-5*e,10*e,(3+a.mouthOpen*5)*e,0,0,Math.PI),t.fill(),t.restore(),t.restore()}function X(t,i,n,e,a,r){t.save(),t.translate(i,n+a.breathePhase*1.5*e),t.fillStyle=r.brandColor,t.beginPath(),t.roundRect(-30*e,20*e,60*e,65*e,10*e),t.fill(),t.save(),t.translate(a.headWobble*e,0),t.fillStyle="#8B5E3C",t.beginPath(),t.ellipse(i-28*e,n-18*e,13*e,20*e,-.4,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+28*e,n-18*e,13*e,20*e,.4,0,Math.PI*2),t.fill(),t.fillStyle="#c4895f",t.beginPath(),t.ellipse(i,n-15*e,33*e,30*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#e0b080",t.beginPath(),t.ellipse(i,n,16*e,13*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(i,n-4*e,6*e,5*e,0,0,Math.PI*2),t.fill();let s=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(i-14*e,n-22*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+14*e,n-22*e,8*e,8*s*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#2c1a0a",t.beginPath(),t.ellipse(i-14*e,n-22*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+14*e,n-22*e,5*e,5*s*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#6b3a1f",t.lineWidth=2*e,t.beginPath(),t.moveTo(i-8*e,n+6*e),t.quadraticCurveTo(i,n+(10+a.mouthOpen*8)*e,i+8*e,n+6*e),t.stroke(),t.restore(),t.restore()}function J(t,i,n,e,a){let r=a.isTalking?Math.abs(Math.sin(a.frame*.3))*5:0;t.save(),t.translate(i,n-r*e+a.breathePhase*1.5*e);let s=t.createRadialGradient(-14*e,n-20*e,4*e,0,n+10*e,52*e);s.addColorStop(0,"#ffa030"),s.addColorStop(1,"#e05800"),t.fillStyle=s,t.beginPath(),t.arc(0,n+10*e,52*e,0,Math.PI*2),t.fill(),t.fillStyle="#2ea032",t.beginPath(),t.ellipse(5*e,n-46*e,7*e,17*e,.5,0,Math.PI*2),t.fill(),t.strokeStyle="#4a2c0a",t.lineWidth=3*e,t.beginPath(),t.moveTo(0,n-42*e),t.quadraticCurveTo(5*e,n-56*e,0,n-62*e),t.stroke();let o=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(-16*e,n-5*e,9*e,9*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,n-5*e,9*e,9*o*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(-16*e,n-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(16*e,n-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="#c05000",t.lineWidth=3*e,t.beginPath(),t.arc(0,n+10*e,15*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="#c05000",t.beginPath(),t.ellipse(0,n+20*e,10*e,(3+a.mouthOpen*7)*e,0,0,Math.PI),t.fill()),t.restore()}function Z(t,i,n,e,a,r){t.save(),t.translate(i,n+a.breathePhase*1.5*e),t.strokeStyle=r.brandColor,t.lineWidth=7*e,t.beginPath(),t.arc(i+40*e,n+15*e,17*e,-.8,.8),t.stroke(),t.fillStyle=r.brandColor,t.beginPath(),t.moveTo(i-28*e,n-30*e),t.lineTo(i-33*e,n+48*e),t.quadraticCurveTo(i,n+60*e,i+33*e,n+48*e),t.lineTo(i+28*e,n-30*e),t.closePath(),t.fill(),t.fillStyle=Q(r.brandColor,40),t.beginPath(),t.ellipse(i,n-30*e,28*e,7*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.25)",t.lineWidth=2.5*e;let s=a.frame*2%20;for(let c=-1;c<=1;c++)t.beginPath(),t.moveTo(i+c*9*e,n-38*e-s*e),t.quadraticCurveTo(i+(c+1)*7*e,n-52*e-s*e,i+c*7*e,n-65*e-s*e),t.stroke();let o=a.blinkProgress;t.fillStyle="#fff",t.beginPath(),t.ellipse(i-10*e,n-5*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+10*e,n-5*e,8*e,8*o*e,0,0,Math.PI*2),t.fill(),t.fillStyle="#1a1a1a",t.beginPath(),t.ellipse(i-10*e,n-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(i+10*e,n-5*e,5*e,5*o*e,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(255,255,255,0.8)",t.lineWidth=2.5*e,t.beginPath(),t.arc(i,n+15*e,11*e,.2,Math.PI-.2),t.stroke(),a.mouthOpen>.1&&(t.fillStyle="rgba(0,0,0,0.35)",t.beginPath(),t.ellipse(i,n+22*e,8*e,(2+a.mouthOpen*6)*e,0,0,Math.PI),t.fill()),t.restore()}var S=class{constructor(i,n){this.raf=0;this.canvas=i,this.ctx=i.getContext("2d"),this.config=n,this.state={blinkTimer:150+Math.random()*100,blinkProgress:1,breathePhase:0,mouthOpen:0,headWobble:0,wobbleDir:1,frame:0,isTalking:!1}}setTalking(i){this.state.isTalking=i}updateConfig(i){this.config={...this.config,...i}}start(){let i=()=>{var s,o;let n=this.state,e=this.canvas.width/200,a=this.canvas.width/2,r=this.canvas.height/2;switch(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),n.frame++,n.breathePhase=Math.sin(n.frame*.02),n.blinkTimer--,n.blinkTimer<=0&&(n.blinkTimer=180+Math.random()*120),n.blinkTimer<10?n.blinkProgress=n.blinkTimer<5?n.blinkTimer/5:(10-n.blinkTimer)/5:n.blinkProgress=1,n.headWobble+=n.wobbleDir*.04,Math.abs(n.headWobble)>1.5&&(n.wobbleDir*=-1),n.isTalking?n.mouthOpen=.3+Math.sin(n.frame*.25)*.4:n.mouthOpen=Math.max(0,n.mouthOpen-.08),this.config.type){case"human":A(this.ctx,a,r,e,n,this.config);break;case"animal":X(this.ctx,a,r,e,n,this.config);break;case"object":(s=this.config.subtype)!=null&&s.includes("taza")||(o=this.config.subtype)!=null&&o.includes("cup")?Z(this.ctx,a,r,e,n,this.config):J(this.ctx,a,r,e,n);break;default:A(this.ctx,a,r,e,n,this.config)}this.raf=requestAnimationFrame(i)};this.raf=requestAnimationFrame(i)}stop(){cancelAnimationFrame(this.raf)}};function q(t,i){let n=t.data;switch(t.type){case"card":return K(n,i);case"gallery":return ee(n);case"booking":return te(n,i);case"pricing":return ie(n,i);case"contact":return ne(n,i);default:return document.createElement("div")}}function K(t,i){var s;let n=document.createElement("div");if(n.className="mz-ui-card",n.style.cssText=`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    margin: 8px 0;
    max-width: 280px;
  `,t.imageUrl){let o=document.createElement("img");o.src=t.imageUrl,o.alt=t.title,o.style.cssText="width:100%; height:140px; object-fit:cover;",n.appendChild(o)}else{let o=document.createElement("div");o.style.cssText=`width:100%; height:80px; background: linear-gradient(135deg, ${i}20, ${i}40); display:flex; align-items:center; justify-content:center;`,o.textContent="\u{1F6CD}\uFE0F",o.style.fontSize="2rem",n.appendChild(o)}let e=document.createElement("div");e.style.cssText="padding: 14px;";let a=document.createElement("p");if(a.style.cssText="color: #F0EDE8; font-weight: 700; font-size: 14px; margin: 0 0 6px;",a.textContent=t.title,e.appendChild(a),t.description){let o=document.createElement("p");o.style.cssText="color: #6b6b6b; font-size: 12px; margin: 0 0 8px; line-height: 1.5;",o.textContent=t.description,e.appendChild(o)}if(t.price){let o=document.createElement("p");o.style.cssText=`color: ${i}; font-weight: 700; font-size: 18px; margin: 0 0 10px;`,o.textContent=t.price,e.appendChild(o)}let r=document.createElement("a");return r.href=(s=t.ctaUrl)!=null?s:"#",r.target="_blank",r.style.cssText=`
    display: block; text-align: center; background: ${i};
    color: #fff; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; text-decoration: none;
    transition: opacity 0.15s;
  `,r.textContent=t.ctaText,r.onmouseenter=()=>r.style.opacity="0.85",r.onmouseleave=()=>r.style.opacity="1",e.appendChild(r),n.appendChild(e),n}function ee(t){let i=document.createElement("div");i.style.cssText="margin: 8px 0;";let n=document.createElement("div");if(n.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;",t.images.slice(0,6).forEach(e=>{var s;let a=document.createElement("div");a.style.cssText="flex-shrink:0; width:110px;";let r=document.createElement("img");r.src=e.url,r.alt=(s=e.alt)!=null?s:"",r.style.cssText="width:110px; height:80px; object-fit:cover; border-radius:10px;",a.appendChild(r),n.appendChild(a)}),t.caption){let e=document.createElement("p");e.style.cssText="color: #6b6b6b; font-size: 11px; margin: 6px 0 0;",e.textContent=t.caption,i.appendChild(e)}return i.appendChild(n),i}function te(t,i){var r;let n=document.createElement("div");n.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,n.appendChild(e);let a=document.createElement("a");return a.href=(r=t.calUrl)!=null?r:"#",a.target="_blank",a.style.cssText=`
    display: block; text-align: center; background: ${i};
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
  `,a.textContent="\u{1F4C5} Reservar reuni\xF3n",n.appendChild(a),n}function ie(t,i){let n=document.createElement("div");n.style.cssText="margin: 8px 0;";let e=document.createElement("div");return e.style.cssText="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px;",t.plans.forEach(a=>{let r=document.createElement("div");r.style.cssText=`
      flex-shrink:0; width:160px;
      background: ${a.highlighted?i+"15":"#1a1a1a"};
      border: 1px solid ${a.highlighted?i+"50":"#2a2a2a"};
      border-radius: 14px; padding: 14px;
    `;let s=document.createElement("p");s.style.cssText="color: #6b6b6b; font-size: 11px; font-weight: 700; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;",s.textContent=a.name,r.appendChild(s);let o=document.createElement("p");o.style.cssText=`color: ${a.highlighted?i:"#F0EDE8"}; font-weight: 700; font-size: 20px; margin: 0 0 10px;`,o.textContent=a.price,r.appendChild(o);let c=document.createElement("ul");if(c.style.cssText="margin:0 0 12px; padding: 0 0 0 14px;",a.features.slice(0,4).forEach(d=>{let l=document.createElement("li");l.style.cssText="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;",l.textContent=d,c.appendChild(l)}),r.appendChild(c),a.ctaUrl){let d=document.createElement("a");d.href=a.ctaUrl,d.target="_blank",d.style.cssText=`
        display:block; text-align:center; padding: 7px;
        background: ${a.highlighted?i:"transparent"};
        border: 1px solid ${a.highlighted?"transparent":"#333"};
        color: ${a.highlighted?"#fff":"#F0EDE8"};
        border-radius: 8px; font-size: 11px; font-weight:600; text-decoration:none;
      `,d.textContent="Elegir plan",r.appendChild(d)}e.appendChild(r)}),n.appendChild(e),n}function ne(t,i){let n=document.createElement("div");n.style.cssText=`
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;let e=document.createElement("p");e.style.cssText="color: #F0EDE8; font-size: 13px; margin: 0 0 12px;",e.textContent=t.message,n.appendChild(e);let a=document.createElement("form");a.style.cssText="display:flex; flex-direction:column; gap:8px;",a.addEventListener("submit",s=>s.preventDefault()),t.fields.forEach(s=>{var c,d;let o=document.createElement("input");o.type=(c=s.type)!=null?c:"text",o.placeholder=s.label,o.required=(d=s.required)!=null?d:!1,o.style.cssText=`
      background: #0e0e0e; border: 1px solid #222; color: #F0EDE8;
      border-radius: 10px; padding: 8px 12px; font-size: 12px; outline:none;
    `,o.onfocus=()=>o.style.borderColor=i,o.onblur=()=>o.style.borderColor="#222",a.appendChild(o)});let r=document.createElement("button");return r.type="submit",r.style.cssText=`
    background: ${i}; color: #fff;
    border: none; border-radius: 10px; padding: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
  `,r.textContent="Enviar",a.appendChild(r),n.appendChild(a),n}var ae=[{id:"hero_idle",section:"hero",priority:1,condition:t=>{var i,n;return t.currentSection==="hero"&&((n=(i=t.sectionsViewed.hero)==null?void 0:i.time)!=null?n:0)>=20},message:"\xBFQuer\xE9s que te cuente en 30 segundos qu\xE9 es Meetzy?"},{id:"problem_engage",section:"problem",priority:2,condition:t=>{var i,n;return t.currentSection==="problem"&&((n=(i=t.sectionsViewed.problem)==null?void 0:i.time)!=null?n:0)>=30},message:"\xBFAlguno de estos casos se parece a tu negocio?"},{id:"features_data",section:"features",priority:3,condition:t=>{var i,n;return t.currentSection==="features"&&((n=(i=t.sectionsViewed.features)==null?void 0:i.time)!=null?n:0)>=25},message:t=>`Esos datos que ves \u2014 son los tuyos reales en esta p\xE1gina. Llev\xE1s ${t.timeOnSite}s ac\xE1.`},{id:"usecases_tabs",section:"use-cases",priority:4,condition:t=>{var i,n;return t.currentSection==="use-cases"&&((n=(i=t.sectionsViewed["use-cases"])==null?void 0:i.revisits)!=null?n:0)>=2},message:"\xBFCu\xE1l es tu tipo de negocio? Te muestro c\xF3mo quedar\xEDa exactamente."},{id:"usecases_idle",section:"use-cases",priority:5,condition:t=>{var i,n,e,a;return t.currentSection==="use-cases"&&((n=(i=t.sectionsViewed["use-cases"])==null?void 0:i.time)!=null?n:0)>=35&&((a=(e=t.sectionsViewed["use-cases"])==null?void 0:e.revisits)!=null?a:0)<2},message:"\xBFEn qu\xE9 rubro est\xE1s? Te armo c\xF3mo quedar\xEDa tu agente."},{id:"avatar_explore",section:"avatar",priority:6,condition:t=>{var i,n;return t.currentSection==="avatar"&&((n=(i=t.sectionsViewed.avatar)==null?void 0:i.time)!=null?n:0)>=20},message:"\xBFCu\xE1l de estos se parece m\xE1s a lo que imagin\xE1s para tu marca?"},{id:"how_step3",section:"how",priority:7,condition:t=>{var i,n;return t.currentSection==="how"&&((n=(i=t.sectionsViewed.how)==null?void 0:i.time)!=null?n:0)>=30},message:"\xBFTen\xE9s web propia o us\xE1s Webflow, WordPress o Shopify?"},{id:"pricing_first",section:"pricing",priority:0,condition:t=>{var i,n,e,a;return t.currentSection==="pricing"&&((n=(i=t.sectionsViewed.pricing)==null?void 0:i.time)!=null?n:0)>=30&&((a=(e=t.sectionsViewed.pricing)==null?void 0:e.revisits)!=null?a:0)===0},message:"\xBFQuer\xE9s que te ayude a entender cu\xE1l plan tiene m\xE1s sentido para lo que necesit\xE1s?"},{id:"pricing_long",section:"pricing",priority:0,condition:t=>{var i,n;return t.currentSection==="pricing"&&((n=(i=t.sectionsViewed.pricing)==null?void 0:i.time)!=null?n:0)>=60},message:"Antes de que te vayas \u2014 ten\xE9s 14 d\xEDas gratis para probarlo sin tarjeta."},{id:"pricing_revisit",section:"pricing",priority:0,condition:t=>{var i,n;return t.currentSection==="pricing"&&((n=(i=t.sectionsViewed.pricing)==null?void 0:i.revisits)!=null?n:0)>=2},message:"Volviste a los precios. \xBFQu\xE9 te est\xE1 frenando?"},{id:"faq_idle",section:"faq",priority:8,condition:t=>{var i,n,e,a;return(t.currentSection==="pricing"||t.currentSection==="faq")&&((n=(i=t.sectionsViewed.pricing)==null?void 0:i.time)!=null?n:0)>=20&&((a=(e=t.sectionsViewed.faq)==null?void 0:e.time)!=null?a:0)>=20},message:"\xBFNo encontraste lo que buscabas? Preguntame directamente."},{id:"return_visitor",section:"*",priority:-1,condition:t=>t.isReturnVisitor&&t.timeOnSite<15,message:"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?"},{id:"exit_intent",section:"*",priority:1,condition:t=>t.mouseY<60&&t.timeOnSite>30&&t.currentSection==="pricing",message:"Antes de que te vayas \u2014 el plan Starter arranca en $29/mes y tiene 14 d\xEDas gratis."}],T={hero:["\xBFC\xF3mo funciona exactamente?","\xBFPara qu\xE9 tipo de negocio?","Ver los planes"],problem:["Tengo una veterinaria","Tengo un ecommerce","Tengo una consultora"],features:["\xBFEsto no es invasivo?","\xBFC\xF3mo lo instalo?","Ver demo en vivo"],"use-cases":["Mi negocio es diferente","\xBFFunciona para pymes?","\xBFCu\xE1nto cuesta?"],avatar:["\xBFPuedo poner mi logo?","\xBFQu\xE9 es el Plan Pro?","Ver todos los tipos"],how:["\xBFTengo que saber programar?","\xBFCu\xE1nto tarda?","Probarlo gratis"],pricing:["\xBFQu\xE9 incluye el Pro?","\xBFHay descuento anual?","Empezar gratis"],faq:["\xBFPuedo cancelar cuando quiero?","\xBFFunciona en mi web?","Hablar con alguien"],demo:["\xBFEsto es el producto real?","\xBFC\xF3mo lo instalo yo?","Empezar gratis"]},I=class{constructor(){this.firedIds=new Set;this.lastTriggerAt=0;this.triggerCount=0;this.MAX_TRIGGERS=3;this.MIN_FIRST_TRIGGER_DELAY=15e3;this.COOLDOWN=18e4}evaluate(i){let n=Date.now();if(n-window._mzWidgetInit<this.MIN_FIRST_TRIGGER_DELAY||n-this.lastTriggerAt<this.COOLDOWN||this.triggerCount>=this.MAX_TRIGGERS)return null;let e=[...ae].sort((a,r)=>a.priority-r.priority);for(let a of e)if(!this.firedIds.has(a.id)&&!(a.section!=="*"&&a.section!==i.currentSection)&&a.condition(i))return this.firedIds.add(a.id),this.lastTriggerAt=n,this.triggerCount++,a;return null}getMessage(i,n){return typeof i.message=="function"?i.message(n):i.message}getChips(i){var n;return(n=T[i])!=null?n:T.hero}},U;typeof window!="undefined"&&(window._mzWidgetInit=(U=window._mzWidgetInit)!=null?U:Date.now());var k="http://localhost:3000",z=class{constructor(){this.ctx={timeOnSite:0,currentSection:"",sectionsViewed:{},referrer:document.referrer,searchQuery:null,localHour:new Date().getHours(),isReturnVisitor:!!localStorage.getItem("mz_visited"),inferredIntent:"exploring",scrollDepth:0,mouseY:window.innerHeight/2};this.startTime=Date.now();this.sectionTimers={};this.activeSections=new Set;this.observer=null;this.pagesVisited=[];this.lastActivityMs=Date.now();this.activeTimeSec=0;let i=new URLSearchParams(window.location.search);this.utm={utm_source:i.get("utm_source"),utm_medium:i.get("utm_medium"),utm_campaign:i.get("utm_campaign")},this.addPagePath(window.location.pathname),this.patchHistory()}addPagePath(i){let n=i||"/";(this.pagesVisited.length===0||this.pagesVisited[this.pagesVisited.length-1]!==n)&&this.pagesVisited.push(n)}patchHistory(){let i=this,n=e=>function(...a){let r=e.apply(this,a);return i.addPagePath(window.location.pathname),r};history.pushState=n(History.prototype.pushState),history.replaceState=n(History.prototype.replaceState),window.addEventListener("popstate",()=>this.addPagePath(window.location.pathname))}bumpActivity(){this.lastActivityMs=Date.now()}idleMs(){return Date.now()-this.lastActivityMs}init(){var e;localStorage.setItem("mz_visited","true");try{let a=new URL(document.referrer);this.ctx.searchQuery=(e=a.searchParams.get("q"))!=null?e:a.searchParams.get("query")}catch(a){}let i=()=>this.bumpActivity();["keydown","mousedown","scroll","touchstart"].forEach(a=>{window.addEventListener(a,i,{passive:!0})}),setInterval(()=>{var a;this.ctx.timeOnSite=Math.round((Date.now()-this.startTime)/1e3);for(let r of this.activeSections)this.ctx.sectionsViewed[r]||(this.ctx.sectionsViewed[r]={time:0,revisits:0}),this.ctx.sectionsViewed[r].time=Math.round((Date.now()-((a=this.sectionTimers[r])!=null?a:Date.now()))/1e3);document.visibilityState==="visible"&&Date.now()-this.lastActivityMs<45e3&&(this.activeTimeSec+=2),this.updateIntent()},2e3),this.observer=new IntersectionObserver(a=>{var r,s,o;for(let c of a){let d=c.target,l=(s=(r=d.dataset.section)!=null?r:d.id)!=null?s:"";l&&(c.isIntersecting?(this.activeSections.add(l),this.sectionTimers[l]=(o=this.sectionTimers[l])!=null?o:Date.now(),this.ctx.sectionsViewed[l]?this.ctx.sectionsViewed[l].revisits++:this.ctx.sectionsViewed[l]={time:0,revisits:0},this.ctx.currentSection=l):this.activeSections.delete(l))}},{threshold:.4});let n=a=>{var r;return(r=this.observer)==null?void 0:r.observe(a)};document.querySelectorAll("[data-section]").forEach(n),new MutationObserver(a=>{for(let r of a)for(let s of r.addedNodes)s instanceof Element&&s.hasAttribute("data-section")&&n(s)}).observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("scroll",()=>{let a=document.body.scrollHeight-window.innerHeight;this.ctx.scrollDepth=a>0?Math.round(window.scrollY/a*100):0,this.bumpActivity()},{passive:!0}),window.addEventListener("mousemove",a=>{this.ctx.mouseY=a.clientY},{passive:!0})}updateIntent(){var a,r,s,o;let i=this.ctx.sectionsViewed,n=(r=(a=i.pricing)==null?void 0:a.time)!=null?r:0;((o=(s=i.pricing)==null?void 0:s.revisits)!=null?o:0)>=2||n>60?this.ctx.inferredIntent="ready_to_act":n>30?this.ctx.inferredIntent="evaluating_pricing":this.ctx.isReturnVisitor?this.ctx.inferredIntent="returning_interested":this.ctx.timeOnSite>120?this.ctx.inferredIntent="deeply_exploring":this.ctx.inferredIntent="exploring"}get(){return{...this.ctx}}destroy(){var i;(i=this.observer)==null||i.disconnect()}},_=class{constructor(i,n){this.state="idle";this.isStreaming=!1;this.avatarRenderer=null;this.msgTimeout=null;this.sessionEndSent=!1;this.siteId=i,this.config=n,this.tracker=new z,this.triggers=new I,this.visitorId=(()=>{let a=localStorage.getItem("mz_uid");return a||(a=Math.random().toString(36).slice(2)+Date.now().toString(36),localStorage.setItem("mz_uid",a)),a})();let e=sessionStorage.getItem(`mz_c_${i}`);e&&(this.conversationId=e)}init(){let i=this.config.widgetPosition==="bottom-left",n=document.createElement("div");n.id="meetzy-widget",n.style.cssText=`position:fixed;z-index:2147483647;bottom:28px;${i?"left:28px":"right:28px"};`,document.body.appendChild(n),this.shadow=n.attachShadow({mode:"open"}),this.shadow.innerHTML=`<style>${this.css()}</style>`,this.buildBubble(),this.buildSpeech(),this.buildChat(),this.tracker.init(),this.config.proactiveEnabled&&setInterval(()=>this.evaluateTriggers(),2e3),window.addEventListener("pagehide",()=>{this.flushSession()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&this.flushSession()}),window.addEventListener("beforeunload",()=>{this.flushSession()}),setInterval(()=>{this.tracker.idleMs()>=1800*1e3&&this.flushSession()},6e4)}flushSession(){var s,o;if(this.sessionEndSent)return;let i=(o=(s=this.conversationId)!=null?s:sessionStorage.getItem(`mz_c_${this.siteId}`))!=null?o:void 0;if(!i)return;this.sessionEndSent=!0;let n=this.tracker.get(),e=this.tracker.utm,a=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),r={conversationId:i,visitorId:this.visitorId,siteId:this.siteId,sessionDuration:n.timeOnSite,activeTime:this.tracker.activeTimeSec,pagesVisited:[...this.tracker.pagesVisited],sectionsViewed:n.sectionsViewed,scrollDepth:n.scrollDepth,device:a?"mobile":"desktop",browser:navigator.userAgent.includes("Chrome")?"chrome":"other",referrer:document.referrer||null,searchQuery:n.searchQuery,utmSource:e.utm_source,utmMedium:e.utm_medium,utmCampaign:e.utm_campaign};fetch(`${k}/api/sessions/end`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r),keepalive:!0}).catch(()=>{})}buildBubble(){var o;let i=document.createElement("div");i.className="bub-wrap";let n=document.createElement("div");n.className="bub-ring",i.appendChild(n);let e=document.createElement("div");e.className="bub-badge",e.innerHTML='<span class="bub-dot"></span><span>En vivo</span>',i.appendChild(e);let a=document.createElement("div");a.className="bub",a.title=`Hablame con ${this.config.agentName}`;let r=(o=this.config.avatarImageUrl)==null?void 0:o.trim();if(r){let c=document.createElement("img");c.className="mz-avatar-img",c.src=r,c.alt="",a.appendChild(c)}else if((this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType){let d=document.createElement("canvas");d.width=128,d.height=128,d.style.cssText="width:52px;height:52px;border-radius:50%;",a.appendChild(d),setTimeout(()=>{var l;this.avatarRenderer=new S(d,{type:this.config.avatarType,subtype:(l=this.config.avatarSubtype)!=null?l:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}),this.avatarRenderer.start()},50)}else a.innerHTML=`<div class="bub-init">${this.config.agentName.slice(0,2).toUpperCase()}</div>`;a.addEventListener("click",()=>this.toggleChat());let s=null;a.addEventListener("mouseenter",()=>{s=setTimeout(()=>this.showTooltip(),400)}),a.addEventListener("mouseleave",()=>{s&&clearTimeout(s),this.hideTooltip()}),i.appendChild(a),this.bubbleWrap=i,this.shadow.appendChild(i)}showTooltip(){let i=this.shadow.querySelector(".bub-tip");i||(i=document.createElement("div"),i.className="bub-tip",i.textContent=`Hablame con ${this.config.agentName}`,this.bubbleWrap.appendChild(i)),i.style.opacity="1"}hideTooltip(){let i=this.shadow.querySelector(".bub-tip");i&&(i.style.opacity="0")}buildSpeech(){let i=document.createElement("div");i.className="speech speech-hidden",this.speechEl=i,this.shadow.appendChild(i)}showMessage(i){this.state!=="chat"&&(this.state="message",this.bubbleWrap.classList.add("bub-shake"),setTimeout(()=>this.bubbleWrap.classList.remove("bub-shake"),600),this.speechEl.className="speech speech-visible",this.speechEl.innerHTML=`
      <p class="speech-text">${i}</p>
      <div class="speech-btns">
        <button class="speech-yes">Contame m\xE1s</button>
        <button class="speech-no">\u2715</button>
      </div>
    `,this.speechEl.querySelector(".speech-yes").addEventListener("click",()=>{this.closeMessage(),this.openChat(i)}),this.speechEl.querySelector(".speech-no").addEventListener("click",()=>{this.closeMessage()}),this.msgTimeout&&clearTimeout(this.msgTimeout),this.msgTimeout=setTimeout(()=>this.closeMessage(),1e4))}closeMessage(){this.speechEl.className="speech speech-hidden",this.state==="message"&&(this.state="idle"),this.msgTimeout&&(clearTimeout(this.msgTimeout),this.msgTimeout=null)}buildChat(){var w;let i=document.createElement("div");i.className="chat";let n=document.createElement("div");n.className="chat-header";let e=document.createElement("div");e.className="chat-av";let a=(w=this.config.avatarImageUrl)==null?void 0:w.trim();if(a){let h=document.createElement("img");h.className="mz-avatar-img",h.src=a,h.alt="",e.appendChild(h)}else if((this.config.plan==="pro"||this.config.plan==="elite")&&this.config.avatarType){let m=document.createElement("canvas");m.width=80,m.height=80,m.style.cssText="width:38px;height:38px;border-radius:50%;",e.appendChild(m),setTimeout(()=>{var v;new S(m,{type:this.config.avatarType,subtype:(v=this.config.avatarSubtype)!=null?v:"",brandColor:this.config.brandColor,brandColor2:this.config.brandColor2}).start()},80)}else e.innerHTML=`<div class="chat-av-init">${this.config.agentName.slice(0,2).toUpperCase()}</div>`;n.appendChild(e);let r=document.createElement("div");r.className="chat-info",r.innerHTML=`<p class="chat-name">${this.config.agentName}</p><p class="chat-role"><span class="chat-dot"></span>${this.config.agentRole}</p>`,n.appendChild(r);let s=document.createElement("button");s.className="chat-close",s.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',s.addEventListener("click",()=>this.closeChat()),n.appendChild(s),i.appendChild(n);let o=document.createElement("div");o.className="chat-msgs",this.msgsEl=o,i.appendChild(o);let c=document.createElement("div");c.className="chat-chips",c.id="mz-chips",i.appendChild(c);let d=document.createElement("div");d.className="chat-input-area";let l=document.createElement("textarea");l.className="chat-ta",l.placeholder=`Preguntale a ${this.config.agentName}\u2026`,l.rows=1,l.addEventListener("input",()=>{l.style.height="auto",l.style.height=Math.min(l.scrollHeight,88)+"px"}),l.addEventListener("keydown",h=>{if(h.key==="Enter"&&!h.shiftKey){h.preventDefault();let m=l.value.trim();m&&!this.isStreaming&&this.send(m)}}),d.appendChild(l);let f=document.createElement("button");if(f.className="chat-send",f.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',f.addEventListener("click",()=>{let h=l.value.trim();h&&!this.isStreaming&&this.send(h)}),d.appendChild(f),i.appendChild(d),this.config.plan!=="elite"){let h=document.createElement("div");h.className="chat-footer",h.innerHTML='Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a>',i.appendChild(h)}this.chatEl=i,this.shadow.appendChild(i)}updateChips(i){var a;let n=this.shadow.getElementById("mz-chips");if(!n)return;n.innerHTML="",((a=T[i])!=null?a:T.hero).forEach(r=>{let s=document.createElement("button");s.className="chip",s.textContent=r,s.addEventListener("click",()=>{n.style.display="none",this.send(r)}),n.appendChild(s)}),n.style.display="flex"}toggleChat(){this.state==="chat"?this.closeChat():(this.closeMessage(),this.openChat())}openChat(i){this.state="chat",this.chatEl.classList.add("chat-open");let n=this.tracker.get();if(this.msgsEl.children.length===0){let e=i!=null?i:this.buildContextOpener(n);this.typeMessage(e),this.updateChips(n.currentSection)}setTimeout(()=>{var e;(e=this.chatEl.querySelector(".chat-ta"))==null||e.focus()},350)}closeChat(){this.state="idle",this.chatEl.classList.remove("chat-open")}buildContextOpener(i){var e,a;if(i.isReturnVisitor)return"Bienvenido de vuelta. \xBFSegu\xEDs evaluando o ya ten\xE9s m\xE1s claro lo que necesit\xE1s?";let n=(a=(e=i.sectionsViewed.pricing)==null?void 0:e.time)!=null?a:0;return n>20?`Vi que pasaste ${n}s en los precios. \xBFQuer\xE9s que te ayude a elegir?`:i.timeOnSite>60?`Llev\xE1s ${i.timeOnSite}s explorando. \xBFPuedo ayudarte?`:this.config.welcomeMessage}typeMessage(i){let n=document.createElement("div");n.className="msg-wrap msg-agent";let e=document.createElement("div");e.className="msg msg-a",e.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',n.appendChild(e),this.msgsEl.appendChild(n),this.msgsEl.scrollTop=9999,setTimeout(()=>{e.textContent="";let a=0,r=setInterval(()=>{a++,e.textContent=i.slice(0,a),this.msgsEl.scrollTop=9999,a>=i.length&&clearInterval(r)},20)},500)}addUserMsg(i){let n=document.createElement("div");n.className="msg-wrap msg-user";let e=document.createElement("div");e.className="msg msg-u",e.textContent=i,n.appendChild(e),this.msgsEl.appendChild(n),this.msgsEl.scrollTop=9999}addStreamBubble(){let i=document.createElement("div");i.className="msg-wrap msg-agent";let n=document.createElement("div");return n.className="msg msg-a",n.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',i.appendChild(n),this.msgsEl.appendChild(i),this.msgsEl.scrollTop=9999,n}async send(i){var o,c;if(this.isStreaming)return;let n=this.chatEl.querySelector(".chat-ta");n&&(n.value="",n.style.height="auto");let e=this.shadow.getElementById("mz-chips");e&&(e.style.display="none"),this.addUserMsg(i),this.isStreaming=!0,this.tracker.bumpActivity(),(o=this.avatarRenderer)==null||o.setTalking(!0);let a=this.shadow.querySelector(".bub > img");a==null||a.classList.add("mz-talk");let r=this.addStreamBubble(),s=this.tracker.get();try{let d=await fetch(`${k}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:this.siteId,message:i,conversationId:this.conversationId,visitorId:this.visitorId,plan:this.config.plan,currentSection:s.currentSection,visitorContext:s,referrer:s.referrer||document.referrer||null,utmSource:this.tracker.utm.utm_source,utmMedium:this.tracker.utm.utm_medium,utmCampaign:this.tracker.utm.utm_campaign})});if(!d.ok||!d.body){r.textContent="Error al procesar.";return}let l=d.headers.get("X-Conversation-Id");l&&(l!==this.conversationId&&(this.sessionEndSent=!1),this.conversationId=l,sessionStorage.setItem(`mz_c_${this.siteId}`,l));let f=d.body.getReader(),w=new TextDecoder,h="";for(r.textContent="";;){let{done:m,value:v}=await f.read();if(m)break;for(let x of w.decode(v).split(`
`))if(x.startsWith("data: "))try{let g=JSON.parse(x.slice(6));if(g.type==="text"&&g.content&&(h+=g.content,r.textContent=h,this.msgsEl.scrollTop=9999),g.type==="ui_component"&&g.component){let E=q(g.component,this.config.brandColor);this.msgsEl.appendChild(E),this.msgsEl.scrollTop=9999}}catch(g){}}this.updateChips(s.currentSection)}catch(d){r.textContent="Error de conexi\xF3n."}finally{this.isStreaming=!1,(c=this.avatarRenderer)==null||c.setTalking(!1),a==null||a.classList.remove("mz-talk")}}evaluateTriggers(){if(this.state==="chat")return;let i=this.tracker.get(),n=this.triggers.evaluate(i);if(!n)return;let e=this.triggers.getMessage(n,i);this.showMessage(e)}css(){let i=this.config.brandColor,n=this.config.widgetPosition==="bottom-left";return`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      .mz-avatar-img {
        background: transparent;
        mix-blend-mode: normal;
        object-fit: contain;
      }
      @keyframes mz-breathe { 0%,100%{transform:scale(1) translateY(0)} 50%{transform:scale(1.015) translateY(-2px)} }
      @keyframes mz-talk { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(1.2deg) scale(1.02)} 75%{transform:rotate(-1.2deg) scale(1.02)} }

      /* \u2500\u2500 BUBBLE \u2500\u2500 */
      .bub-wrap { position: relative; width: 64px; height: 64px; }
      .bub {
        width: 64px; height: 64px; border-radius: 50%; background: ${i};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; z-index: 2;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 0 ${i}40;
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
      }
      .bub:hover { transform: scale(1.1); }
      .bub-ring {
        position: absolute; inset: -5px; border-radius: 50%;
        border: 2px solid ${i}; opacity: 0.35; z-index: 1; pointer-events: none;
        animation: mz-ring 3s ease-out infinite;
      }
      .bub-init { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
      .bub > img {
        width: 52px; height: 52px; border-radius: 50%; display: block;
        animation: mz-breathe 3s ease-in-out infinite;
      }
      .bub > img.mz-talk { animation: mz-talk 0.35s ease-in-out infinite; }
      .bub-badge {
        position: absolute; top: -6px; ${n?"left: -4px":"right: -4px"};
        background: #111; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 2px 7px;
        display: flex; align-items: center; gap: 4px;
        font-family: 'DM Sans', sans-serif; font-size: 9px; color: #F0EDE8;
        z-index: 3; white-space: nowrap;
      }
      .bub-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: mz-blink 2s ease infinite; }
      .bub-tip {
        position: absolute; ${n?"left: 72px":"right: 72px"};
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
        ${n?"left: 0":"right: 0"};
        bottom: 72px; width: 260px;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.4,.64,1);
      }
      .speech-hidden { opacity: 0; transform: translateY(8px) scale(0.95); pointer-events: none; }
      .speech-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
      .speech-text {
        background: #0E0E12; border: 1px solid rgba(255,255,255,0.1);
        border-radius: ${n?"16px 16px 16px 4px":"16px 16px 4px 16px"};
        padding: 14px 16px; font-size: 13px; color: #F0EDE8;
        line-height: 1.55; margin-bottom: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.45);
      }
      .speech-btns { display: flex; gap: 6px; }
      .speech-yes {
        flex: 1; padding: 7px 10px; background: ${i};
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
        ${n?"left: 0":"right: 0"};
        bottom: 76px; width: 380px; height: 540px;
        background: #0E0E0E; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.65);
        display: flex; flex-direction: column; overflow: hidden;
        transform-origin: ${n?"bottom left":"bottom right"};
        transform: scale(0.88) translateY(8px); opacity: 0;
        transition: transform 0.35s cubic-bezier(.34,1.2,.64,1), opacity 0.3s ease;
        pointer-events: none;
      }
      .chat-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

      .chat-header {
        display: flex; align-items: center; gap: 10px;
        padding: 13px 15px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
      }
      .chat-av { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: ${i}; }
      .chat-av > img { width: 100%; height: 100%; display: block; animation: mz-breathe 3s ease-in-out infinite; }
      .chat-av-init {
        width: 38px; height: 38px; border-radius: 50%; background: ${i}; color: #fff;
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
      .msg-u { background: ${i}; color: #fff; border-bottom-right-radius: 3px; }

      .typing { display: flex; gap: 4px; padding: 2px 0; }
      .typing span { width: 6px; height: 6px; background: ${i}; border-radius: 50%; animation: mz-bounce 1.2s ease infinite; }
      .typing span:nth-child(2) { animation-delay: 0.15s; }
      .typing span:nth-child(3) { animation-delay: 0.3s; }

      .chat-chips { padding: 0 13px 9px; display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; }
      .chip {
        background: transparent; border: 1px solid ${i}45; color: ${i};
        padding: 5px 10px; border-radius: 100px;
        font-family: 'DM Sans', sans-serif; font-size: 11px; cursor: pointer;
        transition: all 0.15s;
      }
      .chip:hover { background: ${i}12; }

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
      .chat-ta:focus { border-color: ${i}; }
      .chat-ta::placeholder { color: rgba(240,237,232,0.22); }
      .chat-send {
        width: 35px; height: 35px; border-radius: 50%; background: ${i}; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      }
      .chat-send:hover { opacity: 0.85; transform: scale(1.06); }
      .chat-footer { text-align: center; padding: 6px; font-size: 9px; color: rgba(240,237,232,0.2); font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
      .chat-footer a { color: ${i}; text-decoration: none; }

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
    `}};function re(t,i){var H;Array.from(document.body.children).forEach(p=>{p.id!=="meetzy-fp"&&(p.style.display="none")}),document.body.style.cssText="margin:0;padding:0;overflow:hidden;";let n=document.createElement("div");n.id="meetzy-fp",n.style.cssText="position:fixed;inset:0;z-index:2147483647;",document.body.appendChild(n);let e=n.attachShadow({mode:"open"}),a=i.brandColor;e.innerHTML=`<style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .mz-avatar-img{background:transparent;mix-blend-mode:normal;object-fit:contain;}
    .w{display:flex;width:100vw;height:100vh;background:#08080a;font-family:'DM Sans',sans-serif;color:#F0EDE8;}
    .s{width:240px;flex-shrink:0;background:#0d0d0d;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:14px;}
    .av{width:90px;height:90px;border-radius:50%;background:${a};color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:32px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
    .av img{width:100%;height:100%;display:block;}
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
  </style>`;let r=document.createElement("div");r.className="w",e.appendChild(r);let s=document.createElement("div");s.className="s";let o=document.createElement("div");o.className="av";let c=(H=i.avatarImageUrl)==null?void 0:H.trim();if(c){let p=document.createElement("img");p.className="mz-avatar-img",p.src=c,p.alt="",o.appendChild(p)}else o.textContent=i.agentName.slice(0,2).toUpperCase();s.appendChild(o);let d=document.createElement("div");d.className="an",d.textContent=i.agentName,s.appendChild(d);let l=document.createElement("div");l.className="ar",l.innerHTML=`<span class="ad"></span>${i.agentRole}`,s.appendChild(l),r.appendChild(s);let f=document.createElement("div");f.className="c";let w=document.createElement("div");w.className="m",w.id="fp-msgs",f.appendChild(w);let h=document.createElement("div");h.className="ia";let m=document.createElement("textarea");m.className="it",m.placeholder="Contame qu\xE9 necesit\xE1s\u2026",m.rows=1,m.addEventListener("input",()=>{m.style.height="auto",m.style.height=Math.min(m.scrollHeight,110)+"px"}),h.appendChild(m);let v=document.createElement("button");v.className="sb",v.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',h.appendChild(v),f.appendChild(h),r.appendChild(f);let x=(()=>{let p=localStorage.getItem("mz_uid");return p||(p=Math.random().toString(36).slice(2),localStorage.setItem("mz_uid",p)),p})(),g,E=!1,F=Date.now(),D=!1;function N(){if(D||!g)return;D=!0;let p=Math.round((Date.now()-F)/1e3),u=new URLSearchParams(location.search);fetch(`${k}/api/sessions/end`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:g,visitorId:x,siteId:t,sessionDuration:p,activeTime:p,pagesVisited:[location.pathname],scrollDepth:0,device:/Mobile/i.test(navigator.userAgent)?"mobile":"desktop",browser:navigator.userAgent.includes("Chrome")?"chrome":"other",referrer:document.referrer||null,utmSource:u.get("utm_source"),utmMedium:u.get("utm_medium"),utmCampaign:u.get("utm_campaign")}),keepalive:!0}).catch(()=>{})}window.addEventListener("beforeunload",N),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&N()});function R(p,u){let C=e.getElementById("fp-msgs"),b=document.createElement("div");b.className=`mw m${p}`;let y=document.createElement("div");return y.className=`mb mb${p}`,y.textContent=u,b.appendChild(y),C.appendChild(b),C.scrollTop=9999,y}R("a",i.welcomeMessage);async function $(p){if(E)return;m.value="",m.style.height="auto",R("u",p),E=!0;let u=e.getElementById("fp-msgs"),C=document.createElement("div");C.className="mw ma";let b=document.createElement("div");b.className="mb mba",b.innerHTML='<span class="typing"><span></span><span></span><span></span></span>',C.appendChild(b),u.appendChild(C),u.scrollTop=9999;try{let y=new URLSearchParams(location.search),P=await fetch(`${k}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:t,message:p,conversationId:g,visitorId:x,plan:i.plan,referrer:document.referrer||null,utmSource:y.get("utm_source"),utmMedium:y.get("utm_medium"),utmCampaign:y.get("utm_campaign")})});if(!P.ok||!P.body){b.textContent="Error.";return}let L=P.headers.get("X-Conversation-Id");L&&(L!==g&&(D=!1),g=L);let B=P.body.getReader(),Y=new TextDecoder,O="";for(b.textContent="";;){let{done:j,value:G}=await B.read();if(j)break;for(let V of Y.decode(G).split(`
`))if(V.startsWith("data: "))try{let M=JSON.parse(V.slice(6));M.type==="text"&&M.content&&(O+=M.content,b.textContent=O,u.scrollTop=9999)}catch(M){}}}catch(y){b.textContent="Error."}finally{E=!1}}m.addEventListener("keydown",p=>{if(p.key==="Enter"&&!p.shiftKey){p.preventDefault();let u=m.value.trim();u&&!E&&$(u)}}),v.addEventListener("click",()=>{let p=m.value.trim();p&&!E&&$(p)})}async function W(){var n,e,a;let t=(n=window.MEETZYCONFIG)==null?void 0:n.siteId;if(!t)return;window._mzWidgetInit=(e=window._mzWidgetInit)!=null?e:Date.now();let i;try{let r=await fetch(`${k}/api/sites/${t}/config`);if(!r.ok)return;let s=await r.json();if(i={...s,avatarImageUrl:(a=s.avatarImageUrl)!=null?a:null},!i.isActive)return}catch(r){return}if(i.embedMode==="fullpage"){re(t,i);return}new _(t,i).init()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",W):W();})();
