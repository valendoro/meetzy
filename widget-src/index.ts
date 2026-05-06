import { AvatarRenderer } from "./avatar-renderer";
import { renderUIComponent, type UIComponent } from "./ui-generator";

declare global {
  interface Window { MEETZYCONFIG?: { siteId: string } }
}
declare const __MEETZY_APP_URL__: string;
const APP_URL: string = typeof __MEETZY_APP_URL__ !== "undefined" ? __MEETZY_APP_URL__ : "https://app.meetzy.ai";

/* ══════════════════════════════════════
   TYPES
══════════════════════════════════════ */
interface SiteConfig {
  agentName: string;
  agentRole: string;
  brandColor: string;
  brandColor2: string;
  welcomeMessage: string;
  avatarType: string | null;
  avatarSubtype: string | null;
  plan: string;
  voiceEnabled: boolean;
  calBookingUrl: string | null;
  isActive: boolean;
  embedMode: string;
  agentType: string;
  proactiveEnabled: boolean;
  proactiveFrequency: string;
  exitIntentEnabled: boolean;
  widgetPosition: string;
}

interface VisitorCtx {
  timeOnSite: number;
  isReturnVisitor: boolean;
  sectionsViewed: Record<string, { time: number; revisits: number }>;
  scrollSpeed: string;
  mouseY: number;
  currentSection: string;
  lastInteraction: number;
  timeOnCurrentSection: number;
}

interface Trigger {
  id: string;
  priority: number;
  condition: (ctx: VisitorCtx) => boolean;
  messages: Record<string, string>;
}

/* ══════════════════════════════════════
   AGENT SYSTEM PROMPTS
══════════════════════════════════════ */
const AGENT_PROMPTS: Record<string, string> = {
  vendedor: "Sos un vendedor experto y entusiasta. Tu objetivo es ayudar al visitante a tomar una decisión de compra. Detectás señales de interés y actuás. Sos directo pero nunca presionás — ofrecés valor antes de pedir la venta. Usás español rioplatense. Máximo 2-3 líneas por respuesta.",
  guia: "Sos una guía amigable y paciente. Tu trabajo es acompañar al visitante y ayudarlo a entender el producto o servicio. Explicás con claridad, usás ejemplos, y nunca apurás. El visitante siempre se tiene que sentir acompañado. Usás español rioplatense. Máximo 2-3 líneas por respuesta.",
  soporte: "Sos un agente de soporte eficiente y confiable. Resolvés problemas con precisión. Cuando no sabés algo, lo decís y derivás correctamente. Nunca inventás información. Sos directo y útil. Usás español rioplatense. Máximo 2-3 líneas por respuesta.",
  recepcionista: "Sos una recepcionista cordial y organizada. Tu objetivo es entender qué necesita el visitante y derivarlo correctamente — ya sea agendando un turno, conectándolo con el área correcta, o respondiendo consultas generales. Sos el primer punto de contacto. Usás español rioplatense. Máximo 2-3 líneas por respuesta.",
};

/* ══════════════════════════════════════
   TRIGGERS
══════════════════════════════════════ */
const GLOBAL_TRIGGERS: Trigger[] = [
  {
    id: "return_visitor",
    priority: 1,
    condition: (ctx) => ctx.isReturnVisitor && ctx.timeOnSite < 20,
    messages: {
      vendedor: "¡Volviste! ¿Querés que continuemos donde quedamos?",
      guia: "¡Bienvenido de vuelta! ¿Seguís explorando o ya tenés algo en mente?",
      soporte: "Hola de nuevo. ¿Pudiste resolver lo de la última vez?",
      recepcionista: "¡Hola de nuevo! ¿En qué te puedo ayudar hoy?",
    },
  },
  {
    id: "pricing_hover",
    priority: 2,
    condition: (ctx) => (ctx.sectionsViewed["pricing"]?.time ?? 0) > 30,
    messages: {
      vendedor: "Los precios tienen sentido para tu caso. ¿Te ayudo a elegir el mejor?",
      guia: "¿Tenés dudas sobre los planes? Te los explico.",
      soporte: "¿Alguna pregunta sobre los precios o qué incluye cada plan?",
      recepcionista: "¿Querés que te contacte con alguien del equipo para hablar de precios?",
    },
  },
  {
    id: "long_idle",
    priority: 3,
    condition: (ctx) => ctx.timeOnSite > 120 && ctx.lastInteraction > 60,
    messages: {
      vendedor: "¿Encontraste lo que buscabas? Puedo ayudarte a decidir.",
      guia: "Llevás un rato explorando. ¿Te puedo orientar?",
      soporte: "¿Necesitás ayuda con algo?",
      recepcionista: "¿Puedo ayudarte a encontrar algo?",
    },
  },
  {
    id: "exit_intent",
    priority: 4,
    condition: (ctx) => ctx.mouseY < 60 && ctx.timeOnSite > 30,
    messages: {
      vendedor: "Antes de que te vayas — ¿hay algo que no encontraste?",
      guia: "¿Ya encontraste todo lo que buscabas?",
      soporte: "¿Pudiste resolver tu consulta?",
      recepcionista: "¿Te puedo ayudar con algo antes de que te vayas?",
    },
  },
  {
    id: "scroll_stop",
    priority: 5,
    condition: (ctx) => ctx.scrollSpeed === "stopped" && ctx.timeOnCurrentSection > 45,
    messages: {
      vendedor: "¿Algo de esto te interesó? Puedo contarte más.",
      guia: "¿Querés que te explique más sobre esto?",
      soporte: "¿Tenés alguna pregunta sobre esta sección?",
      recepcionista: "¿Puedo ayudarte con algo de esto?",
    },
  },
];

/* ══════════════════════════════════════
   BEHAVIOR TRACKER (lightweight, in-widget)
══════════════════════════════════════ */
class WidgetTracker {
  ctx: VisitorCtx = {
    timeOnSite: 0,
    isReturnVisitor: false,
    sectionsViewed: {},
    scrollSpeed: "normal",
    mouseY: window.innerHeight / 2,
    currentSection: "",
    lastInteraction: 0,
    timeOnCurrentSection: 0,
  };

  private startTime = Date.now();
  private lastScrollY = window.scrollY;
  private lastScrollTime = Date.now();
  private lastInteractionTime = Date.now();
  private currentSectionEntry = Date.now();
  private observer: IntersectionObserver | null = null;

  init() {
    this.ctx.isReturnVisitor = !!localStorage.getItem("mz_visited");
    localStorage.setItem("mz_visited", "true");

    setInterval(() => {
      const now = Date.now();
      this.ctx.timeOnSite = Math.round((now - this.startTime) / 1000);
      this.ctx.lastInteraction = Math.round((now - this.lastInteractionTime) / 1000);
      this.ctx.timeOnCurrentSection = Math.round((now - this.currentSectionEntry) / 1000);
    }, 1000);

    window.addEventListener("scroll", () => {
      const now = Date.now();
      const dy = Math.abs(window.scrollY - this.lastScrollY);
      const dt = Math.max(now - this.lastScrollTime, 16);
      const v = dy / dt;
      this.ctx.scrollSpeed = v > 1.5 ? "fast" : v < 0.1 ? "stopped" : "normal";
      this.lastScrollY = window.scrollY;
      this.lastScrollTime = now;
      this.lastInteractionTime = now;
    }, { passive: true });

    window.addEventListener("mousemove", (e) => {
      this.ctx.mouseY = e.clientY;
      this.lastInteractionTime = Date.now();
    }, { passive: true });

    window.addEventListener("click", () => { this.lastInteractionTime = Date.now(); }, { passive: true });

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id || (entry.target as HTMLElement).dataset["section"] || "unknown";
        if (entry.isIntersecting) {
          this.ctx.currentSection = id;
          this.currentSectionEntry = Date.now();
          if (!this.ctx.sectionsViewed[id]) this.ctx.sectionsViewed[id] = { time: 0, revisits: 0 };
          else this.ctx.sectionsViewed[id]!.revisits++;
        }
      }
    }, { threshold: 0.4 });

    document.querySelectorAll("[data-section], section[id]").forEach(el => this.observer!.observe(el));
    new MutationObserver((muts) => {
      for (const m of muts) for (const node of m.addedNodes) {
        if (node instanceof Element) {
          if (node.matches("[data-section], section[id]")) this.observer!.observe(node);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  getContext(): VisitorCtx { return { ...this.ctx }; }
}

/* ══════════════════════════════════════
   MAIN WIDGET CLASS
══════════════════════════════════════ */
class MeetzyWidget {
  private config: SiteConfig;
  private tracker: WidgetTracker;
  private shadow!: ShadowRoot;
  private state: "idle" | "message" | "chat" = "idle";
  private lastProactiveAt = 0;
  private triggeredIds = new Set<string>();
  private messageTimeout: ReturnType<typeof setTimeout> | null = null;
  private visitorId: string;
  private conversationId: string | undefined;
  private isStreaming = false;
  private avatarRenderer: AvatarRenderer | null = null;

  // DOM refs
  private bubbleEl!: HTMLElement;
  private bubbleCanvas!: HTMLCanvasElement;
  private speechEl!: HTMLElement;
  private chatEl!: HTMLElement;
  private msgsEl!: HTMLElement;

  constructor(config: SiteConfig) {
    this.config = config;
    this.tracker = new WidgetTracker();
    this.visitorId = this.getOrCreate("mz_uid");
    this.conversationId = sessionStorage.getItem(`mz_c_${config.agentType}`) ?? undefined;
  }

  private getOrCreate(key: string): string {
    let v = localStorage.getItem(key);
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(key, v); }
    return v;
  }

  init() {
    const host = document.createElement("div");
    host.id = "meetzy-widget";
    const isLeft = this.config.widgetPosition === "bottom-left";
    host.style.cssText = `position:fixed;z-index:2147483647;bottom:28px;${isLeft ? "left:28px" : "right:28px"};`;
    document.body.appendChild(host);
    this.shadow = host.attachShadow({ mode: "open" });

    this.shadow.innerHTML = `<style>${this.getStyles()}</style>`;

    this.buildBubble();
    this.buildSpeech();
    this.buildChat();

    this.tracker.init();
    if (this.config.proactiveEnabled) this.startProactiveLoop();
  }

  /* ── BUBBLE ─────────────────────────── */
  private buildBubble() {
    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";

    const ring = document.createElement("div");
    ring.className = "bubble-ring";
    wrap.appendChild(ring);

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.title = `Hablame con ${this.config.agentName}`;

    const isPro = this.config.plan === "pro" || this.config.plan === "elite";
    if (isPro && this.config.avatarType) {
      this.bubbleCanvas = document.createElement("canvas");
      this.bubbleCanvas.width = 128;
      this.bubbleCanvas.height = 128;
      this.bubbleCanvas.style.cssText = "width:56px;height:56px;border-radius:50%;";
      bubble.appendChild(this.bubbleCanvas);
      setTimeout(() => {
        this.avatarRenderer = new AvatarRenderer(this.bubbleCanvas, {
          type: this.config.avatarType!,
          subtype: this.config.avatarSubtype ?? "",
          brandColor: this.config.brandColor,
          brandColor2: this.config.brandColor2,
        });
        this.avatarRenderer.start();
      }, 50);
    } else {
      bubble.innerHTML = `<div class="bubble-initials">${this.config.agentName.slice(0, 2).toUpperCase()}</div>`;
    }

    bubble.addEventListener("click", () => this.toggleChat());

    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    bubble.addEventListener("mouseenter", () => {
      bubble.classList.add("hovering");
      hoverTimer = setTimeout(() => {
        if (this.state === "idle") this.showTooltip();
      }, 500);
    });
    bubble.addEventListener("mouseleave", () => {
      bubble.classList.remove("hovering");
      if (hoverTimer) clearTimeout(hoverTimer);
      this.hideTooltip();
    });

    wrap.appendChild(bubble);
    this.bubbleEl = wrap;
    this.shadow.appendChild(wrap);
  }

  private showTooltip() {
    let tip = this.shadow.querySelector(".bubble-tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "bubble-tooltip";
      tip.textContent = `Hablame con ${this.config.agentName}`;
      this.bubbleEl.appendChild(tip);
    }
    (tip as HTMLElement).style.opacity = "1";
  }
  private hideTooltip() {
    const tip = this.shadow.querySelector(".bubble-tooltip") as HTMLElement | null;
    if (tip) tip.style.opacity = "0";
  }

  /* ── SPEECH BUBBLE ──────────────────── */
  private buildSpeech() {
    const el = document.createElement("div");
    el.className = "speech hidden";
    this.speechEl = el;
    this.shadow.appendChild(el);
  }

  private showMessage(message: string) {
    const now = Date.now();
    const cooldown = this.config.proactiveFrequency === "conservador" ? 600000
                    : this.config.proactiveFrequency === "proactivo" ? 60000 : 180000;
    if (now - this.lastProactiveAt < cooldown) return;
    if (this.state === "chat") return;
    this.lastProactiveAt = now;
    this.state = "message";

    this.speechEl.className = "speech visible";
    this.speechEl.innerHTML = `
      <p class="speech-text">${message}</p>
      <div class="speech-actions">
        <button class="speech-btn-primary">Contame más</button>
        <button class="speech-btn-close">×</button>
      </div>
      <div class="speech-tail"></div>
    `;

    this.speechEl.querySelector(".speech-btn-primary")!.addEventListener("click", () => {
      this.closeMessage();
      this.openChat(message);
    });
    this.speechEl.querySelector(".speech-btn-close")!.addEventListener("click", () => {
      this.closeMessage();
    });

    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.closeMessage(), 8000);
  }

  private closeMessage() {
    this.speechEl.className = "speech hidden";
    if (this.state === "message") this.state = "idle";
    if (this.messageTimeout) { clearTimeout(this.messageTimeout); this.messageTimeout = null; }
  }

  /* ── CHAT PANEL ─────────────────────── */
  private buildChat() {
    const panel = document.createElement("div");
    panel.className = "chat";

    // Header
    const header = document.createElement("div");
    header.className = "chat-header";

    const av = document.createElement("div");
    av.className = "chat-avatar";
    const isPro = this.config.plan === "pro" || this.config.plan === "elite";
    if (isPro && this.config.avatarType) {
      const c = document.createElement("canvas");
      c.width = 80; c.height = 80;
      c.style.cssText = "width:38px;height:38px;border-radius:50%;";
      av.appendChild(c);
      setTimeout(() => {
        new AvatarRenderer(c, {
          type: this.config.avatarType!,
          subtype: this.config.avatarSubtype ?? "",
          brandColor: this.config.brandColor,
          brandColor2: this.config.brandColor2,
        }).start();
      }, 80);
    } else {
      av.innerHTML = `<div class="chat-av-initials">${this.config.agentName.slice(0, 2).toUpperCase()}</div>`;
    }
    header.appendChild(av);

    const info = document.createElement("div");
    info.className = "chat-info";
    info.innerHTML = `<p class="chat-name">${this.config.agentName}</p><p class="chat-role"><span class="dot-green"></span>${this.config.agentRole}</p>`;
    header.appendChild(info);

    const closeBtn = document.createElement("button");
    closeBtn.className = "chat-close-btn";
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    closeBtn.addEventListener("click", () => this.closeChat());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Messages
    const msgs = document.createElement("div");
    msgs.className = "chat-msgs";
    this.msgsEl = msgs;
    panel.appendChild(msgs);

    // Suggestions
    const suggs = document.createElement("div");
    suggs.className = "chat-suggs";
    suggs.id = "mz-suggs";
    const chips = this.getDefaultChips();
    chips.forEach(chip => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = chip;
      btn.addEventListener("click", () => {
        suggs.style.display = "none";
        this.sendMessage(chip);
      });
      suggs.appendChild(btn);
    });
    panel.appendChild(suggs);

    // Input
    const inputArea = document.createElement("div");
    inputArea.className = "chat-input-area";

    const ta = document.createElement("textarea");
    ta.className = "chat-textarea";
    ta.placeholder = `Preguntale a ${this.config.agentName}…`;
    ta.rows = 1;
    ta.addEventListener("input", () => {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 88) + "px";
    });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = ta.value.trim();
        if (v && !this.isStreaming) this.sendMessage(v);
      }
    });
    inputArea.appendChild(ta);

    const sendBtn = document.createElement("button");
    sendBtn.className = "chat-send-btn";
    sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    sendBtn.addEventListener("click", () => {
      const v = ta.value.trim();
      if (v && !this.isStreaming) this.sendMessage(v);
    });
    inputArea.appendChild(sendBtn);
    panel.appendChild(inputArea);

    if (this.config.plan !== "elite") {
      const footer = document.createElement("div");
      footer.className = "chat-footer";
      footer.innerHTML = `Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a>`;
      panel.appendChild(footer);
    }

    this.chatEl = panel;
    this.shadow.appendChild(panel);
  }

  private getDefaultChips(): string[] {
    const byType: Record<string, string[]> = {
      vendedor: ["¿Qué ofrecen?", "¿Cuáles son los precios?", "Quiero comprar"],
      guia: ["¿Qué es esto?", "¿Cómo funciona?", "Mostrámelo paso a paso"],
      soporte: ["Tengo un problema", "¿Cómo lo hago?", "No me funciona algo"],
      recepcionista: ["Quiero un turno", "Tengo una consulta", "¿Con quién hablo?"],
    };
    return byType[this.config.agentType] ?? byType["guia"]!;
  }

  private toggleChat() {
    if (this.state === "chat") {
      this.closeChat();
    } else {
      this.closeMessage();
      this.openChat();
    }
  }

  private openChat(contextMessage?: string) {
    this.state = "chat";
    this.chatEl.classList.add("open");

    if (this.msgsEl.children.length === 0) {
      const opener = contextMessage ?? this.config.welcomeMessage;
      this.addAgentMsg(opener);
    }

    setTimeout(() => {
      const ta = this.chatEl.querySelector(".chat-textarea") as HTMLTextAreaElement | null;
      ta?.focus();
    }, 350);
  }

  private closeChat() {
    this.state = "idle";
    this.chatEl.classList.remove("open");
  }

  /* ── MESSAGING ──────────────────────── */
  private addAgentMsg(text: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "msg-bubble msg-bubble-agent";
    bbl.textContent = text;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = this.msgsEl.scrollHeight;
    return bbl;
  }

  private addUserMsg(text: string) {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-user";
    const bbl = document.createElement("div");
    bbl.className = "msg-bubble msg-bubble-user";
    bbl.textContent = text;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = this.msgsEl.scrollHeight;
  }

  private addStreamBubble(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "msg-bubble msg-bubble-agent";
    bbl.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = this.msgsEl.scrollHeight;
    return bbl;
  }

  private async sendMessage(text: string) {
    if (this.isStreaming) return;
    const ta = this.chatEl.querySelector(".chat-textarea") as HTMLTextAreaElement | null;
    if (ta) { ta.value = ""; ta.style.height = "auto"; }
    const suggs = this.chatEl.querySelector("#mz-suggs") as HTMLElement | null;
    if (suggs) suggs.style.display = "none";

    this.addUserMsg(text);
    this.isStreaming = true;
    this.avatarRenderer?.setTalking(true);
    const bbl = this.addStreamBubble();

    const ctx = this.tracker.getContext();
    const agentPrompt = AGENT_PROMPTS[this.config.agentType] ?? AGENT_PROMPTS["guia"]!;
    const contextNote = `\nCONTEXTO: tiempo en sitio ${ctx.timeOnSite}s, sección actual: ${ctx.currentSection}, return visitor: ${ctx.isReturnVisitor}`;

    try {
      const res = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: (window.MEETZYCONFIG as { siteId: string }).siteId,
          message: text,
          conversationId: this.conversationId,
          visitorId: this.visitorId,
          plan: this.config.plan,
          visitorContextPrompt: agentPrompt + contextNote,
        }),
      });

      if (!res.ok || !res.body) { bbl.textContent = "Error al procesar."; return; }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) {
        this.conversationId = newConvId;
        sessionStorage.setItem(`mz_c_${this.config.agentType}`, newConvId);
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      bbl.textContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6)) as { type: string; content?: string; component?: UIComponent };
            if (chunk.type === "text" && chunk.content) {
              full += chunk.content;
              bbl.textContent = full;
              this.msgsEl.scrollTop = this.msgsEl.scrollHeight;
            }
            if (chunk.type === "ui_component" && chunk.component && (this.config.plan === "pro" || this.config.plan === "elite")) {
              const uiEl = renderUIComponent(chunk.component, this.config.brandColor);
              this.msgsEl.appendChild(uiEl);
              this.msgsEl.scrollTop = this.msgsEl.scrollHeight;
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      bbl.textContent = "Error de conexión.";
    } finally {
      this.isStreaming = false;
      this.avatarRenderer?.setTalking(false);
    }
  }

  /* ── PROACTIVE LOOP ─────────────────── */
  private startProactiveLoop() {
    setInterval(() => {
      if (this.state === "chat") return;
      const ctx = this.tracker.getContext();
      const sorted = [...GLOBAL_TRIGGERS].sort((a, b) => a.priority - b.priority);
      for (const trigger of sorted) {
        if (this.triggeredIds.has(trigger.id)) continue;
        if (!trigger.condition(ctx)) continue;
        if (this.config.exitIntentEnabled === false && trigger.id === "exit_intent") continue;
        this.triggeredIds.add(trigger.id);
        const msg = trigger.messages[this.config.agentType] ?? trigger.messages["guia"] ?? "";
        this.showMessage(msg);
        break;
      }
    }, 3000);
  }

  /* ── STYLES ─────────────────────────── */
  private getStyles(): string {
    const bc = this.config.brandColor;
    const isLeft = this.config.widgetPosition === "bottom-left";

    return `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── BUBBLE ── */
      .bubble-wrap {
        position: relative;
        width: 64px; height: 64px;
      }
      .bubble {
        width: 64px; height: 64px; border-radius: 50%;
        background: ${bc};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; z-index: 2;
        box-shadow: 0 8px 32px rgba(0,0,0,0.28);
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
      }
      .bubble:hover, .bubble.hovering { transform: scale(1.1); }
      .bubble-ring {
        position: absolute; inset: -5px; border-radius: 50%;
        border: 2px solid ${bc}; opacity: 0.35;
        animation: mz-ring 3s ease-out infinite;
        z-index: 1; pointer-events: none;
      }
      .bubble-initials {
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: 20px; color: #fff;
      }
      .bubble-tooltip {
        position: absolute;
        ${isLeft ? "left: 72px;" : "right: 72px;"}
        top: 50%; transform: translateY(-50%);
        background: #111; border: 1px solid rgba(255,255,255,0.09);
        color: #F0EDE8; font-family: 'DM Sans', sans-serif;
        font-size: 12px; padding: 6px 12px; border-radius: 10px;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 0.2s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }

      /* ── SPEECH BUBBLE ── */
      .speech {
        position: absolute;
        ${isLeft ? "left: 0;" : "right: 0;"}
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
        border-radius: ${isLeft ? "16px 16px 16px 4px" : "16px 16px 4px 16px"};
        padding: 14px 16px; font-size: 13px; color: #F0EDE8;
        line-height: 1.55; margin-bottom: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      .speech-actions { display: flex; gap: 6px; }
      .speech-btn-primary {
        flex: 1; padding: 7px 10px; background: ${bc};
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

      /* ── CHAT PANEL ── */
      .chat {
        position: absolute;
        ${isLeft ? "left: 0;" : "right: 0;"}
        bottom: 76px;
        width: 380px; height: 520px;
        background: #0e0e0e; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        display: flex; flex-direction: column; overflow: hidden;
        transform-origin: ${isLeft ? "bottom left" : "bottom right"};
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
        background: ${bc}; color: #fff;
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
      .msg-bubble-user  { background: ${bc}; color: #fff; border-bottom-right-radius: 3px; }

      .typing { display: flex; gap: 4px; padding: 2px 0; }
      .typing span { width: 6px; height: 6px; background: ${bc}; border-radius: 50%; animation: mz-bounce 1.2s ease infinite; }
      .typing span:nth-child(2) { animation-delay: 0.15s; }
      .typing span:nth-child(3) { animation-delay: 0.3s; }

      .chat-suggs { padding: 0 14px 10px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
      .chip {
        background: transparent; border: 1px solid ${bc}45; color: ${bc};
        padding: 5px 11px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
        font-size: 11px; cursor: pointer; transition: all 0.15s;
      }
      .chip:hover { background: ${bc}12; }

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
      .chat-textarea:focus { border-color: ${bc}; }
      .chat-textarea::placeholder { color: rgba(240,237,232,0.22); }
      .chat-send-btn {
        width: 36px; height: 36px; border-radius: 50%; background: ${bc}; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      }
      .chat-send-btn:hover { opacity: 0.85; transform: scale(1.06); }
      .chat-footer { text-align: center; padding: 7px; font-size: 9px; color: rgba(240,237,232,0.2); font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
      .chat-footer a { color: ${bc}; text-decoration: none; }

      /* ── ANIMATIONS ── */
      @keyframes mz-ring { 0% { transform: scale(1); opacity: 0.35; } 100% { transform: scale(1.7); opacity: 0; } }
      @keyframes mz-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      @keyframes mz-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      /* ── MOBILE ── */
      @media (max-width: 480px) {
        .chat {
          position: fixed; inset: 0; width: 100vw; height: 100dvh;
          border-radius: 0; bottom: auto; right: auto; left: auto;
          transform-origin: bottom center;
        }
        .speech { width: 220px; }
      }
    `;
  }
}

/* ══════════════════════════════════════
   FULLPAGE MODE (unchanged)
══════════════════════════════════════ */
function initFullPage(siteId: string, config: SiteConfig) {
  Array.from(document.body.children).forEach(el => {
    if ((el as HTMLElement).id !== "meetzy-fp-host")
      (el as HTMLElement).style.display = "none";
  });
  document.body.style.cssText = "margin:0;padding:0;overflow:hidden;";

  const host = document.createElement("div");
  host.id = "meetzy-fp-host";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const bc = config.brandColor;
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .fp-wrap{display:flex;width:100vw;height:100vh;background:#080808;font-family:'DM Sans',sans-serif;color:#F0EDE8;}
    .fp-sidebar{width:260px;flex-shrink:0;background:#0d0d0d;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;padding:40px 24px;gap:16px;}
    .fp-av-init{width:96px;height:96px;border-radius:50%;background:${bc};color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:34px;display:flex;align-items:center;justify-content:center;}
    .fp-name{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#F0EDE8;}
    .fp-role{font-size:12px;color:rgba(240,237,232,0.4);display:flex;align-items:center;gap:5px;margin-top:4px;}
    .fp-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;}
    .fp-powered{font-size:10px;color:rgba(240,237,232,0.18);}
    .fp-powered a{color:${bc};text-decoration:none;}
    .fp-chat{flex:1;display:flex;flex-direction:column;min-width:0;}
    .fp-msgs{flex:1;overflow-y:auto;padding:32px 48px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;}
    .fp-msg-wrap{display:flex;}.fp-agent{justify-content:flex-start;}.fp-user{justify-content:flex-end;}
    .fp-bubble{max-width:72%;padding:13px 17px;border-radius:20px;font-size:15px;line-height:1.6;word-wrap:break-word;}
    .fp-bubble-agent{background:#111;color:#F0EDE8;border:1px solid rgba(255,255,255,0.06);border-bottom-left-radius:4px;}
    .fp-bubble-user{background:${bc};color:#fff;border-bottom-right-radius:4px;}
    .fp-typing{display:flex;gap:5px;padding:3px 0;}
    .fp-typing span{width:8px;height:8px;background:${bc};border-radius:50%;animation:mz-bounce 1.2s ease infinite;}
    .fp-typing span:nth-child(2){animation-delay:0.15s;}.fp-typing span:nth-child(3){animation-delay:0.3s;}
    .fp-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 48px 16px;}
    .fp-chip{background:transparent;border:1px solid ${bc}40;color:${bc};padding:7px 16px;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.15s;}
    .fp-chip:hover{background:${bc}12;}
    .fp-input-area{display:flex;align-items:flex-end;gap:12px;padding:16px 48px 32px;border-top:1px solid rgba(255,255,255,0.05);}
    .fp-textarea{flex:1;background:#111;border:1px solid rgba(255,255,255,0.08);color:#F0EDE8;border-radius:16px;padding:13px 18px;font-family:'DM Sans',sans-serif;font-size:15px;resize:none;outline:none;max-height:120px;line-height:1.5;transition:border-color 0.15s;}
    .fp-textarea:focus{border-color:${bc};}
    .fp-textarea::placeholder{color:rgba(240,237,232,0.2);}
    .fp-send-btn{width:48px;height:48px;border-radius:50%;background:${bc};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:opacity 0.15s,transform 0.15s;}
    .fp-send-btn:hover{opacity:0.85;transform:scale(1.05);}
    @keyframes mz-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @media(max-width:640px){.fp-sidebar{display:none;}.fp-msgs,.fp-chips,.fp-input-area{padding-left:16px;padding-right:16px;}}
  `;
  shadow.appendChild(style);

  const visitorId = (() => { let v = localStorage.getItem("mz_uid"); if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem("mz_uid", v); } return v; })();
  let convId: string | undefined;
  let streaming = false;

  const wrap = document.createElement("div"); wrap.className = "fp-wrap"; shadow.appendChild(wrap);
  const sidebar = document.createElement("div"); sidebar.className = "fp-sidebar";
  sidebar.innerHTML = `<div class="fp-av-init">${config.agentName.slice(0,2).toUpperCase()}</div><div><p class="fp-name">${config.agentName}</p><p class="fp-role"><span class="fp-dot"></span>${config.agentRole}</p></div><div style="flex:1"></div><p class="fp-powered">Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a></p>`;
  wrap.appendChild(sidebar);

  const chat = document.createElement("div"); chat.className = "fp-chat";
  const msgs = document.createElement("div"); msgs.className = "fp-msgs"; msgs.id = "fp-msgs";
  chat.appendChild(msgs);

  const chips = document.createElement("div"); chips.className = "fp-chips";
  ["¿Qué ofrecen?", "¿Cuáles son los precios?", "Quiero más info"].forEach(c => {
    const btn = document.createElement("button"); btn.className = "fp-chip"; btn.textContent = c;
    btn.onclick = () => { chips.style.display = "none"; send(c); };
    chips.appendChild(btn);
  });
  chat.appendChild(chips);

  const inputArea = document.createElement("div"); inputArea.className = "fp-input-area";
  const ta = document.createElement("textarea"); ta.className = "fp-textarea"; ta.placeholder = "Contame qué necesitás…"; ta.rows = 1;
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; });
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const v = ta.value.trim(); if (v && !streaming) send(v); } });
  inputArea.appendChild(ta);
  const sendBtn = document.createElement("button"); sendBtn.className = "fp-send-btn";
  sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  sendBtn.onclick = () => { const v = ta.value.trim(); if (v && !streaming) send(v); };
  inputArea.appendChild(sendBtn);
  chat.appendChild(inputArea);
  wrap.appendChild(chat);

  // Welcome
  addMsg("agent", config.welcomeMessage);

  function addMsg(role: "agent" | "user", text: string): HTMLElement {
    const el = shadow.getElementById("fp-msgs")!;
    const wr = document.createElement("div"); wr.className = `fp-msg-wrap fp-${role}`;
    const bbl = document.createElement("div"); bbl.className = `fp-bubble fp-bubble-${role}`; bbl.textContent = text;
    wr.appendChild(bbl); el.appendChild(wr); el.scrollTop = el.scrollHeight;
    return bbl;
  }

  async function send(text: string) {
    if (streaming) return;
    ta.value = ""; ta.style.height = "auto";
    chips.style.display = "none";
    addMsg("user", text);
    streaming = true;
    const msgsEl = shadow.getElementById("fp-msgs")!;
    const wr = document.createElement("div"); wr.className = "fp-msg-wrap fp-agent";
    const bbl = document.createElement("div"); bbl.className = "fp-bubble fp-bubble-agent";
    bbl.innerHTML = `<span class="fp-typing"><span></span><span></span><span></span></span>`;
    wr.appendChild(bbl); msgsEl.appendChild(wr); msgsEl.scrollTop = msgsEl.scrollHeight;
    try {
      const res = await fetch(`${APP_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId, message: text, conversationId: convId, visitorId, plan: config.plan }) });
      if (!res.ok || !res.body) { bbl.textContent = "Error."; return; }
      const newId = res.headers.get("X-Conversation-Id"); if (newId) convId = newId;
      const reader = res.body.getReader(); const dec = new TextDecoder(); let full = ""; bbl.textContent = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try { const c = JSON.parse(line.slice(6)) as { type: string; content?: string }; if (c.type === "text" && c.content) { full += c.content; bbl.textContent = full; msgsEl.scrollTop = msgsEl.scrollHeight; } } catch { /* skip */ }
        }
      }
    } catch { bbl.textContent = "Error."; } finally { streaming = false; }
  }
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
async function init() {
  const siteId = window.MEETZYCONFIG?.siteId;
  if (!siteId) return;

  let config: SiteConfig;
  try {
    const res = await fetch(`${APP_URL}/api/sites/${siteId}/config`);
    if (!res.ok) return;
    config = (await res.json()) as SiteConfig;
    if (!config.isActive) return;
  } catch { return; }

  if (config.embedMode === "fullpage") {
    initFullPage(siteId, config);
    return;
  }

  const widget = new MeetzyWidget(config);
  widget.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
