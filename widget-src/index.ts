import { AvatarRenderer } from "./avatar-renderer";
import { renderUIComponent, type UIComponent } from "./ui-generator";
import { TriggerEngine, type VisitorContext, SECTION_CHIPS } from "./trigger-engine";

declare global {
  interface Window { MEETZYCONFIG?: { siteId: string } }
}
declare const __MEETZY_APP_URL__: string;
const APP_URL: string = typeof __MEETZY_APP_URL__ !== "undefined" ? __MEETZY_APP_URL__ : "https://app.meetzy.ai";

/* ══════════════════════════════════════
   CONFIG TYPES
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

type WidgetState = "idle" | "message" | "chat";

/* ══════════════════════════════════════
   BEHAVIOR TRACKER
══════════════════════════════════════ */
class BehaviorTracker {
  ctx: VisitorContext = {
    timeOnSite: 0,
    currentSection: "",
    sectionsViewed: {},
    referrer: document.referrer,
    searchQuery: null,
    localHour: new Date().getHours(),
    isReturnVisitor: !!localStorage.getItem("mz_visited"),
    inferredIntent: "exploring",
    scrollDepth: 0,
    mouseY: window.innerHeight / 2,
  };

  private startTime = Date.now();
  private sectionTimers: Record<string, number> = {};
  private activeSections = new Set<string>();
  private observer: IntersectionObserver | null = null;
  readonly pagesVisited: string[] = [];
  private lastActivityMs = Date.now();
  activeTimeSec = 0;
  readonly utm: { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null };

  constructor() {
    const sp = new URLSearchParams(window.location.search);
    this.utm = {
      utm_source: sp.get("utm_source"),
      utm_medium: sp.get("utm_medium"),
      utm_campaign: sp.get("utm_campaign"),
    };
    this.addPagePath(window.location.pathname);
    this.patchHistory();
  }

  private addPagePath(path: string) {
    const p = path || "/";
    if (this.pagesVisited.length === 0 || this.pagesVisited[this.pagesVisited.length - 1] !== p) {
      this.pagesVisited.push(p);
    }
  }

  private patchHistory() {
    const tracker = this;
    const wrap = (fn: History["pushState"]) =>
      function (this: History, ...args: Parameters<History["pushState"]>) {
        const ret = fn.apply(this, args);
        tracker.addPagePath(window.location.pathname);
        return ret;
      };
    history.pushState = wrap(History.prototype.pushState);
    history.replaceState = wrap(History.prototype.replaceState);
    window.addEventListener("popstate", () => this.addPagePath(window.location.pathname));
  }

  bumpActivity() {
    this.lastActivityMs = Date.now();
  }

  idleMs(): number {
    return Date.now() - this.lastActivityMs;
  }

  init() {
    localStorage.setItem("mz_visited", "true");

    try {
      const url = new URL(document.referrer);
      this.ctx.searchQuery = url.searchParams.get("q") ?? url.searchParams.get("query");
    } catch { /* no referrer */ }

    const onAct = () => this.bumpActivity();
    ["keydown", "mousedown", "scroll", "touchstart"].forEach((ev) => {
      window.addEventListener(ev, onAct, { passive: true });
    });

    // Time tracker
    setInterval(() => {
      this.ctx.timeOnSite = Math.round((Date.now() - this.startTime) / 1000);
      for (const id of this.activeSections) {
        if (!this.ctx.sectionsViewed[id]) this.ctx.sectionsViewed[id] = { time: 0, revisits: 0 };
        this.ctx.sectionsViewed[id]!.time = Math.round((Date.now() - (this.sectionTimers[id] ?? Date.now())) / 1000);
      }
      if (document.visibilityState === "visible" && Date.now() - this.lastActivityMs < 45_000) {
        this.activeTimeSec += 2;
      }
      this.updateIntent();
    }, 2000);

    // IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const id = el.dataset["section"] ?? el.id ?? "";
        if (!id) continue;
        if (entry.isIntersecting) {
          this.activeSections.add(id);
          this.sectionTimers[id] = this.sectionTimers[id] ?? Date.now();
          if (!this.ctx.sectionsViewed[id]) {
            this.ctx.sectionsViewed[id] = { time: 0, revisits: 0 };
          } else {
            this.ctx.sectionsViewed[id]!.revisits++;
          }
          // Most visible section = current
          this.ctx.currentSection = id;
        } else {
          this.activeSections.delete(id);
        }
      }
    }, { threshold: 0.4 });

    const observe = (el: Element) => this.observer?.observe(el);
    document.querySelectorAll("[data-section]").forEach(observe);
    new MutationObserver((muts) => {
      for (const m of muts) for (const node of m.addedNodes) {
        if (node instanceof Element && node.hasAttribute("data-section")) observe(node);
      }
    }).observe(document.body, { childList: true, subtree: true });

    // Scroll depth
    window.addEventListener("scroll", () => {
      const max = document.body.scrollHeight - window.innerHeight;
      this.ctx.scrollDepth = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      this.bumpActivity();
    }, { passive: true });

    // Mouse Y for exit intent
    window.addEventListener("mousemove", (e) => {
      this.ctx.mouseY = e.clientY;
    }, { passive: true });
  }

  private updateIntent() {
    const p = this.ctx.sectionsViewed;
    const pricingTime = p["pricing"]?.time ?? 0;
    const pricingRevisits = p["pricing"]?.revisits ?? 0;
    if (pricingRevisits >= 2 || pricingTime > 60) this.ctx.inferredIntent = "ready_to_act";
    else if (pricingTime > 30) this.ctx.inferredIntent = "evaluating_pricing";
    else if (this.ctx.isReturnVisitor) this.ctx.inferredIntent = "returning_interested";
    else if (this.ctx.timeOnSite > 120) this.ctx.inferredIntent = "deeply_exploring";
    else this.ctx.inferredIntent = "exploring";
  }

  get(): VisitorContext { return { ...this.ctx }; }
  destroy() { this.observer?.disconnect(); }
}

/* ══════════════════════════════════════
   MEETZY WIDGET
══════════════════════════════════════ */
class MeetzyWidget {
  private config: SiteConfig;
  private siteId: string;
  private tracker: BehaviorTracker;
  private triggers: TriggerEngine;
  private shadow!: ShadowRoot;
  private state: WidgetState = "idle";
  private visitorId: string;
  private conversationId: string | undefined;
  private isStreaming = false;
  private avatarRenderer: AvatarRenderer | null = null;
  private msgTimeout: ReturnType<typeof setTimeout> | null = null;
  private sessionEndSent = false;

  // DOM refs
  private bubbleWrap!: HTMLElement;
  private speechEl!: HTMLElement;
  private chatEl!: HTMLElement;
  private msgsEl!: HTMLElement;

  constructor(siteId: string, config: SiteConfig) {
    this.siteId = siteId;
    this.config = config;
    this.tracker = new BehaviorTracker();
    this.triggers = new TriggerEngine();
    this.visitorId = (() => {
      let v = localStorage.getItem("mz_uid");
      if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("mz_uid", v); }
      return v;
    })();
    const storedC = sessionStorage.getItem(`mz_c_${siteId}`);
    if (storedC) this.conversationId = storedC;
  }

  init() {
    const isLeft = this.config.widgetPosition === "bottom-left";
    const host = document.createElement("div");
    host.id = "meetzy-widget";
    host.style.cssText = `position:fixed;z-index:2147483647;bottom:28px;${isLeft ? "left:28px" : "right:28px"};`;
    document.body.appendChild(host);
    this.shadow = host.attachShadow({ mode: "open" });
    this.shadow.innerHTML = `<style>${this.css()}</style>`;

    this.buildBubble();
    this.buildSpeech();
    this.buildChat();

    this.tracker.init();

    if (this.config.proactiveEnabled) {
      setInterval(() => this.evaluateTriggers(), 2000);
    }

    window.addEventListener("pagehide", () => {
      this.flushSession();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flushSession();
    });
    window.addEventListener("beforeunload", () => {
      this.flushSession();
    });
    setInterval(() => {
      if (this.tracker.idleMs() >= 30 * 60 * 1000) this.flushSession();
    }, 60_000);
  }

  private flushSession() {
    if (this.sessionEndSent) return;
    const cid = this.conversationId ?? sessionStorage.getItem(`mz_c_${this.siteId}`) ?? undefined;
    if (!cid) return;
    this.sessionEndSent = true;
    const ctx = this.tracker.get();
    const u = this.tracker.utm;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const payload = {
      conversationId: cid,
      visitorId: this.visitorId,
      siteId: this.siteId,
      sessionDuration: ctx.timeOnSite,
      activeTime: this.tracker.activeTimeSec,
      pagesVisited: [...this.tracker.pagesVisited],
      sectionsViewed: ctx.sectionsViewed,
      scrollDepth: ctx.scrollDepth,
      device: mobile ? "mobile" : "desktop",
      browser: navigator.userAgent.includes("Chrome") ? "chrome" : "other",
      referrer: document.referrer || null,
      searchQuery: ctx.searchQuery,
      utmSource: u.utm_source,
      utmMedium: u.utm_medium,
      utmCampaign: u.utm_campaign,
    };
    void fetch(`${APP_URL}/api/sessions/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  /* ── BUBBLE ──────────────────────────── */
  private buildBubble() {
    const wrap = document.createElement("div");
    wrap.className = "bub-wrap";

    // Pulse ring
    const ring = document.createElement("div");
    ring.className = "bub-ring";
    wrap.appendChild(ring);

    // Live badge
    const badge = document.createElement("div");
    badge.className = "bub-badge";
    badge.innerHTML = `<span class="bub-dot"></span><span>En vivo</span>`;
    wrap.appendChild(badge);

    // Bubble itself
    const bub = document.createElement("div");
    bub.className = "bub";
    bub.title = `Hablame con ${this.config.agentName}`;

    const isPro = this.config.plan === "pro" || this.config.plan === "elite";
    if (isPro && this.config.avatarType) {
      const canvas = document.createElement("canvas");
      canvas.width = 128; canvas.height = 128;
      canvas.style.cssText = "width:52px;height:52px;border-radius:50%;";
      bub.appendChild(canvas);
      setTimeout(() => {
        this.avatarRenderer = new AvatarRenderer(canvas, {
          type: this.config.avatarType!,
          subtype: this.config.avatarSubtype ?? "",
          brandColor: this.config.brandColor,
          brandColor2: this.config.brandColor2,
        });
        this.avatarRenderer.start();
      }, 50);
    } else {
      bub.innerHTML = `<div class="bub-init">${this.config.agentName.slice(0, 2).toUpperCase()}</div>`;
    }

    bub.addEventListener("click", () => this.toggleChat());

    // Tooltip on hover
    let tipTimer: ReturnType<typeof setTimeout> | null = null;
    bub.addEventListener("mouseenter", () => {
      tipTimer = setTimeout(() => this.showTooltip(), 400);
    });
    bub.addEventListener("mouseleave", () => {
      if (tipTimer) clearTimeout(tipTimer);
      this.hideTooltip();
    });

    wrap.appendChild(bub);
    this.bubbleWrap = wrap;
    this.shadow.appendChild(wrap);
  }

  private showTooltip() {
    let tip = this.shadow.querySelector(".bub-tip") as HTMLElement | null;
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "bub-tip";
      tip.textContent = `Hablame con ${this.config.agentName}`;
      this.bubbleWrap.appendChild(tip);
    }
    tip.style.opacity = "1";
  }
  private hideTooltip() {
    const tip = this.shadow.querySelector(".bub-tip") as HTMLElement | null;
    if (tip) tip.style.opacity = "0";
  }

  /* ── SPEECH BUBBLE ───────────────────── */
  private buildSpeech() {
    const el = document.createElement("div");
    el.className = "speech speech-hidden";
    this.speechEl = el;
    this.shadow.appendChild(el);
  }

  private showMessage(message: string) {
    if (this.state === "chat") return;
    this.state = "message";

    this.bubbleWrap.classList.add("bub-shake");
    setTimeout(() => this.bubbleWrap.classList.remove("bub-shake"), 600);

    this.speechEl.className = "speech speech-visible";
    this.speechEl.innerHTML = `
      <p class="speech-text">${message}</p>
      <div class="speech-btns">
        <button class="speech-yes">Contame más</button>
        <button class="speech-no">✕</button>
      </div>
    `;

    this.speechEl.querySelector(".speech-yes")!.addEventListener("click", () => {
      this.closeMessage();
      this.openChat(message);
    });
    this.speechEl.querySelector(".speech-no")!.addEventListener("click", () => {
      this.closeMessage();
    });

    if (this.msgTimeout) clearTimeout(this.msgTimeout);
    this.msgTimeout = setTimeout(() => this.closeMessage(), 10000);
  }

  private closeMessage() {
    this.speechEl.className = "speech speech-hidden";
    if (this.state === "message") this.state = "idle";
    if (this.msgTimeout) { clearTimeout(this.msgTimeout); this.msgTimeout = null; }
  }

  /* ── CHAT PANEL ──────────────────────── */
  private buildChat() {
    const panel = document.createElement("div");
    panel.className = "chat";

    // Header
    const header = document.createElement("div");
    header.className = "chat-header";

    const av = document.createElement("div");
    av.className = "chat-av";
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
      av.innerHTML = `<div class="chat-av-init">${this.config.agentName.slice(0, 2).toUpperCase()}</div>`;
    }
    header.appendChild(av);

    const info = document.createElement("div");
    info.className = "chat-info";
    info.innerHTML = `<p class="chat-name">${this.config.agentName}</p><p class="chat-role"><span class="chat-dot"></span>${this.config.agentRole}</p>`;
    header.appendChild(info);

    const closeBtn = document.createElement("button");
    closeBtn.className = "chat-close";
    closeBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    closeBtn.addEventListener("click", () => this.closeChat());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Messages
    const msgs = document.createElement("div");
    msgs.className = "chat-msgs";
    this.msgsEl = msgs;
    panel.appendChild(msgs);

    // Chips
    const chips = document.createElement("div");
    chips.className = "chat-chips";
    chips.id = "mz-chips";
    panel.appendChild(chips);

    // Input
    const inputArea = document.createElement("div");
    inputArea.className = "chat-input-area";

    const ta = document.createElement("textarea");
    ta.className = "chat-ta";
    ta.placeholder = `Preguntale a ${this.config.agentName}…`;
    ta.rows = 1;
    ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 88) + "px"; });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = ta.value.trim();
        if (v && !this.isStreaming) this.send(v);
      }
    });
    inputArea.appendChild(ta);

    const sendBtn = document.createElement("button");
    sendBtn.className = "chat-send";
    sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    sendBtn.addEventListener("click", () => {
      const v = ta.value.trim();
      if (v && !this.isStreaming) this.send(v);
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

  private updateChips(section: string) {
    const chips = this.shadow.getElementById("mz-chips");
    if (!chips) return;
    chips.innerHTML = "";
    const items = SECTION_CHIPS[section] ?? SECTION_CHIPS["hero"]!;
    items.forEach((chip) => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = chip;
      btn.addEventListener("click", () => {
        chips.style.display = "none";
        this.send(chip);
      });
      chips.appendChild(btn);
    });
    chips.style.display = "flex";
  }

  /* ── OPEN / CLOSE ────────────────────── */
  private toggleChat() {
    if (this.state === "chat") this.closeChat();
    else { this.closeMessage(); this.openChat(); }
  }

  private openChat(contextMessage?: string) {
    this.state = "chat";
    this.chatEl.classList.add("chat-open");

    const ctx = this.tracker.get();
    if (this.msgsEl.children.length === 0) {
      const opener = contextMessage ?? this.buildContextOpener(ctx);
      this.typeMessage(opener);
      this.updateChips(ctx.currentSection);
    }

    setTimeout(() => {
      (this.chatEl.querySelector(".chat-ta") as HTMLTextAreaElement | null)?.focus();
    }, 350);
  }

  private closeChat() {
    this.state = "idle";
    this.chatEl.classList.remove("chat-open");
  }

  private buildContextOpener(ctx: VisitorContext): string {
    if (ctx.isReturnVisitor) return "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?";
    const pt = ctx.sectionsViewed["pricing"]?.time ?? 0;
    if (pt > 20) return `Vi que pasaste ${pt}s en los precios. ¿Querés que te ayude a elegir?`;
    if (ctx.timeOnSite > 60) return `Llevás ${ctx.timeOnSite}s explorando. ¿Puedo ayudarte?`;
    return this.config.welcomeMessage;
  }

  /* ── MESSAGES ────────────────────────── */
  private typeMessage(text: string) {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "msg msg-a";
    bbl.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = 9999;

    setTimeout(() => {
      bbl.textContent = "";
      let i = 0;
      const iv = setInterval(() => {
        i++;
        bbl.textContent = text.slice(0, i);
        this.msgsEl.scrollTop = 9999;
        if (i >= text.length) clearInterval(iv);
      }, 20);
    }, 500);
  }

  private addUserMsg(text: string) {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-user";
    const bbl = document.createElement("div");
    bbl.className = "msg msg-u";
    bbl.textContent = text;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = 9999;
  }

  private addStreamBubble(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "msg msg-a";
    bbl.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    wrap.appendChild(bbl);
    this.msgsEl.appendChild(wrap);
    this.msgsEl.scrollTop = 9999;
    return bbl;
  }

  /* ── SEND ────────────────────────────── */
  private async send(text: string) {
    if (this.isStreaming) return;

    const ta = this.chatEl.querySelector(".chat-ta") as HTMLTextAreaElement | null;
    if (ta) { ta.value = ""; ta.style.height = "auto"; }
    const chips = this.shadow.getElementById("mz-chips");
    if (chips) chips.style.display = "none";

    this.addUserMsg(text);
    this.isStreaming = true;
    this.tracker.bumpActivity();
    this.avatarRenderer?.setTalking(true);
    const bbl = this.addStreamBubble();

    const ctx = this.tracker.get();

    try {
      const res = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: this.siteId,
          message: text,
          conversationId: this.conversationId,
          visitorId: this.visitorId,
          plan: this.config.plan,
          currentSection: ctx.currentSection,
          visitorContext: ctx,
        }),
      });

      if (!res.ok || !res.body) { bbl.textContent = "Error al procesar."; return; }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) {
        if (newConvId !== this.conversationId) this.sessionEndSent = false;
        this.conversationId = newConvId;
        sessionStorage.setItem(`mz_c_${this.siteId}`, newConvId);
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
              this.msgsEl.scrollTop = 9999;
            }
            if (chunk.type === "ui_component" && chunk.component) {
              const uiEl = renderUIComponent(chunk.component, this.config.brandColor);
              this.msgsEl.appendChild(uiEl);
              this.msgsEl.scrollTop = 9999;
            }
          } catch { /* skip */ }
        }
      }

      // Show contextual chips after response
      this.updateChips(ctx.currentSection);

    } catch {
      bbl.textContent = "Error de conexión.";
    } finally {
      this.isStreaming = false;
      this.avatarRenderer?.setTalking(false);
    }
  }

  /* ── PROACTIVE TRIGGERS ──────────────── */
  private evaluateTriggers() {
    if (this.state === "chat") return;
    const ctx = this.tracker.get();
    const trigger = this.triggers.evaluate(ctx);
    if (!trigger) return;
    const msg = this.triggers.getMessage(trigger, ctx);
    this.showMessage(msg);
  }

  /* ── CSS ─────────────────────────────── */
  private css(): string {
    const bc = this.config.brandColor;
    const isLeft = this.config.widgetPosition === "bottom-left";

    return `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── BUBBLE ── */
      .bub-wrap { position: relative; width: 64px; height: 64px; }
      .bub {
        width: 64px; height: 64px; border-radius: 50%; background: ${bc};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; z-index: 2;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 0 ${bc}40;
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
      }
      .bub:hover { transform: scale(1.1); }
      .bub-ring {
        position: absolute; inset: -5px; border-radius: 50%;
        border: 2px solid ${bc}; opacity: 0.35; z-index: 1; pointer-events: none;
        animation: mz-ring 3s ease-out infinite;
      }
      .bub-init { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
      .bub-badge {
        position: absolute; top: -6px; ${isLeft ? "left: -4px" : "right: -4px"};
        background: #111; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 2px 7px;
        display: flex; align-items: center; gap: 4px;
        font-family: 'DM Sans', sans-serif; font-size: 9px; color: #F0EDE8;
        z-index: 3; white-space: nowrap;
      }
      .bub-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: mz-blink 2s ease infinite; }
      .bub-tip {
        position: absolute; ${isLeft ? "left: 72px" : "right: 72px"};
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

      /* ── SPEECH ── */
      .speech {
        position: absolute;
        ${isLeft ? "left: 0" : "right: 0"};
        bottom: 72px; width: 260px;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.4,.64,1);
      }
      .speech-hidden { opacity: 0; transform: translateY(8px) scale(0.95); pointer-events: none; }
      .speech-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
      .speech-text {
        background: #0E0E12; border: 1px solid rgba(255,255,255,0.1);
        border-radius: ${isLeft ? "16px 16px 16px 4px" : "16px 16px 4px 16px"};
        padding: 14px 16px; font-size: 13px; color: #F0EDE8;
        line-height: 1.55; margin-bottom: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.45);
      }
      .speech-btns { display: flex; gap: 6px; }
      .speech-yes {
        flex: 1; padding: 7px 10px; background: ${bc};
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

      /* ── CHAT PANEL ── */
      .chat {
        position: absolute;
        ${isLeft ? "left: 0" : "right: 0"};
        bottom: 76px; width: 380px; height: 540px;
        background: #0E0E0E; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.65);
        display: flex; flex-direction: column; overflow: hidden;
        transform-origin: ${isLeft ? "bottom left" : "bottom right"};
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
        width: 38px; height: 38px; border-radius: 50%; background: ${bc}; color: #fff;
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
      .msg-u { background: ${bc}; color: #fff; border-bottom-right-radius: 3px; }

      .typing { display: flex; gap: 4px; padding: 2px 0; }
      .typing span { width: 6px; height: 6px; background: ${bc}; border-radius: 50%; animation: mz-bounce 1.2s ease infinite; }
      .typing span:nth-child(2) { animation-delay: 0.15s; }
      .typing span:nth-child(3) { animation-delay: 0.3s; }

      .chat-chips { padding: 0 13px 9px; display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; }
      .chip {
        background: transparent; border: 1px solid ${bc}45; color: ${bc};
        padding: 5px 10px; border-radius: 100px;
        font-family: 'DM Sans', sans-serif; font-size: 11px; cursor: pointer;
        transition: all 0.15s;
      }
      .chip:hover { background: ${bc}12; }

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
      .chat-ta:focus { border-color: ${bc}; }
      .chat-ta::placeholder { color: rgba(240,237,232,0.22); }
      .chat-send {
        width: 35px; height: 35px; border-radius: 50%; background: ${bc}; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      }
      .chat-send:hover { opacity: 0.85; transform: scale(1.06); }
      .chat-footer { text-align: center; padding: 6px; font-size: 9px; color: rgba(240,237,232,0.2); font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
      .chat-footer a { color: ${bc}; text-decoration: none; }

      /* ── ANIMATIONS ── */
      @keyframes mz-ring  { 0%   { transform: scale(1); opacity: 0.35; } 100% { transform: scale(1.75); opacity: 0; } }
      @keyframes mz-blink { 0%,80%,100% { opacity: 1; } 40% { opacity: 0.3; } }
      @keyframes mz-bounce{ 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      @keyframes mz-fade  { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

      /* ── MOBILE ── */
      @media (max-width: 480px) {
        .chat { position: fixed; inset: 0; width: 100vw; height: 100dvh; border-radius: 0; bottom: auto; right: auto; left: auto; }
        .speech { width: 220px; }
      }
    `;
  }
}

/* ══════════════════════════════════════
   FULLPAGE (unchanged, compact)
══════════════════════════════════════ */
function initFullPage(siteId: string, config: SiteConfig) {
  Array.from(document.body.children).forEach(el => {
    if ((el as HTMLElement).id !== "meetzy-fp") (el as HTMLElement).style.display = "none";
  });
  document.body.style.cssText = "margin:0;padding:0;overflow:hidden;";
  const host = document.createElement("div"); host.id = "meetzy-fp";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  const bc = config.brandColor;
  shadow.innerHTML = `<style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .w{display:flex;width:100vw;height:100vh;background:#08080a;font-family:'DM Sans',sans-serif;color:#F0EDE8;}
    .s{width:240px;flex-shrink:0;background:#0d0d0d;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:14px;}
    .av{width:90px;height:90px;border-radius:50%;background:${bc};color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:32px;display:flex;align-items:center;justify-content:center;}
    .an{font-family:'Syne',sans-serif;font-weight:800;font-size:17px;}
    .ar{font-size:11px;color:rgba(240,237,232,0.4);display:flex;align-items:center;gap:4px;}
    .ad{width:7px;height:7px;border-radius:50%;background:#22c55e;}
    .c{flex:1;display:flex;flex-direction:column;min-width:0;}
    .m{flex:1;overflow-y:auto;padding:28px 44px;display:flex;flex-direction:column;gap:12px;}
    .mw{display:flex;}.ma{justify-content:flex-start;}.mu{justify-content:flex-end;}
    .mb{max-width:72%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.6;word-wrap:break-word;}
    .mba{background:#111;border:1px solid rgba(255,255,255,0.06);border-bottom-left-radius:4px;}
    .mbu{background:${bc};color:#fff;border-bottom-right-radius:4px;}
    .ia{display:flex;align-items:flex-end;gap:10px;padding:14px 44px 28px;border-top:1px solid rgba(255,255,255,0.05);}
    .it{flex:1;background:#111;border:1px solid rgba(255,255,255,0.08);color:#F0EDE8;border-radius:14px;padding:12px 16px;font-size:14px;resize:none;outline:none;max-height:110px;line-height:1.5;transition:border-color 0.15s;}
    .it:focus{border-color:${bc};}
    .it::placeholder{color:rgba(240,237,232,0.2);}
    .sb{width:46px;height:46px;border-radius:50%;background:${bc};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
    .typing{display:flex;gap:4px;padding:2px 0;}
    .typing span{width:8px;height:8px;background:${bc};border-radius:50%;animation:b 1.2s ease infinite;}
    .typing span:nth-child(2){animation-delay:0.15s;}
    .typing span:nth-child(3){animation-delay:0.3s;}
    @keyframes b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @media(max-width:600px){.s{display:none;}.m,.ia{padding-left:16px;padding-right:16px;}}
  </style>`;
  const wrap = document.createElement("div"); wrap.className = "w"; shadow.appendChild(wrap);
  const sb = document.createElement("div"); sb.className = "s";
  sb.innerHTML = `<div class="av">${config.agentName.slice(0,2).toUpperCase()}</div><div class="an">${config.agentName}</div><div class="ar"><span class="ad"></span>${config.agentRole}</div>`;
  wrap.appendChild(sb);
  const chat = document.createElement("div"); chat.className = "c";
  const msgs = document.createElement("div"); msgs.className = "m"; msgs.id = "fp-msgs";
  chat.appendChild(msgs);
  const ia = document.createElement("div"); ia.className = "ia";
  const ta = document.createElement("textarea"); ta.className = "it"; ta.placeholder = "Contame qué necesitás…"; ta.rows = 1;
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 110) + "px"; });
  ia.appendChild(ta);
  const sendB = document.createElement("button"); sendB.className = "sb";
  sendB.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  ia.appendChild(sendB); chat.appendChild(ia); wrap.appendChild(chat);
  const vid = (() => { let v = localStorage.getItem("mz_uid"); if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem("mz_uid", v); } return v; })();
  let cid: string | undefined;
  let streaming = false;
  const fpStart = Date.now();
  let fpSessionSent = false;
  function flushFpSession() {
    if (fpSessionSent || !cid) return;
    fpSessionSent = true;
    const dur = Math.round((Date.now() - fpStart) / 1000);
    const sp = new URLSearchParams(location.search);
    void fetch(`${APP_URL}/api/sessions/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: cid,
        visitorId: vid,
        siteId,
        sessionDuration: dur,
        activeTime: dur,
        pagesVisited: [location.pathname],
        scrollDepth: 0,
        device: /Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        browser: navigator.userAgent.includes("Chrome") ? "chrome" : "other",
        referrer: document.referrer || null,
        utmSource: sp.get("utm_source"),
        utmMedium: sp.get("utm_medium"),
        utmCampaign: sp.get("utm_campaign"),
      }),
      keepalive: true,
    }).catch(() => {});
  }
  window.addEventListener("beforeunload", flushFpSession);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushFpSession();
  });
  function addMsg(r: "a"|"u", t: string): HTMLElement {
    const el = shadow.getElementById("fp-msgs")!;
    const wr = document.createElement("div"); wr.className = `mw m${r}`;
    const bbl = document.createElement("div"); bbl.className = `mb mb${r}`; bbl.textContent = t;
    wr.appendChild(bbl); el.appendChild(wr); el.scrollTop = 9999; return bbl;
  }
  addMsg("a", config.welcomeMessage);
  async function send(text: string) {
    if (streaming) return; ta.value = ""; ta.style.height = "auto";
    addMsg("u", text); streaming = true;
    const msgsEl = shadow.getElementById("fp-msgs")!;
    const wr = document.createElement("div"); wr.className = "mw ma";
    const bbl = document.createElement("div"); bbl.className = "mb mba";
    bbl.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    wr.appendChild(bbl); msgsEl.appendChild(wr); msgsEl.scrollTop = 9999;
    try {
      const r = await fetch(`${APP_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId, message: text, conversationId: cid, visitorId: vid, plan: config.plan }) });
      if (!r.ok || !r.body) { bbl.textContent = "Error."; return; }
      const nc = r.headers.get("X-Conversation-Id");
      if (nc) {
        if (nc !== cid) fpSessionSent = false;
        cid = nc;
      }
      const reader = r.body.getReader(); const dec = new TextDecoder(); let full = ""; bbl.textContent = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try { const c = JSON.parse(line.slice(6)) as { type: string; content?: string }; if (c.type === "text" && c.content) { full += c.content; bbl.textContent = full; msgsEl.scrollTop = 9999; } } catch { /**/ }
        }
      }
    } catch { bbl.textContent = "Error."; } finally { streaming = false; }
  }
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const v = ta.value.trim(); if (v && !streaming) send(v); } });
  sendB.addEventListener("click", () => { const v = ta.value.trim(); if (v && !streaming) send(v); });
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
async function init() {
  const siteId = window.MEETZYCONFIG?.siteId;
  if (!siteId) return;
  window._mzWidgetInit = window._mzWidgetInit ?? Date.now();

  let config: SiteConfig;
  try {
    const res = await fetch(`${APP_URL}/api/sites/${siteId}/config`);
    if (!res.ok) return;
    config = (await res.json()) as SiteConfig;
    if (!config.isActive) return;
  } catch { return; }

  if (config.embedMode === "fullpage") { initFullPage(siteId, config); return; }

  new MeetzyWidget(siteId, config).init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
