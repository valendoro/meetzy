import { BehaviorTracker } from "./behavior-tracker";
import { AvatarRenderer } from "./avatar-renderer";
import { renderUIComponent, type UIComponent } from "./ui-generator";
import { VoiceHandler, playAudio } from "./voice-handler";

declare global {
  interface Window {
    MEETZYCONFIG?: { siteId: string };
  }
}

declare const __MEETZY_APP_URL__: string;
const APP_URL: string =
  typeof __MEETZY_APP_URL__ !== "undefined" ? __MEETZY_APP_URL__ : "https://app.meetzy.ai";

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
  primaryQuestion: string | null;
}

interface ParsedChunk {
  type: "text" | "ui_component" | "done";
  content?: string;
  component?: UIComponent;
  conversationId?: string;
}

type WidgetState = "observing" | "triggering" | "chatting";

function uid(): string {
  let id = localStorage.getItem("mz_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mz_uid", id);
  }
  return id;
}

async function init() {
  const siteId = window.MEETZYCONFIG?.siteId;
  if (!siteId) return;

  let config: SiteConfig;
  try {
    const res = await fetch(`${APP_URL}/api/sites/${siteId}/config`);
    if (!res.ok) return;
    config = (await res.json()) as SiteConfig;
    if (!config.isActive) return;
  } catch {
    return;
  }

  if (config.embedMode === "fullpage") {
    initFullPage(siteId, config);
    return;
  }

  initSmartWidget(siteId, config);
}

// ══════════════════════════════════════════════════════
// SMART WIDGET — 3 estados de presencia
// ══════════════════════════════════════════════════════

function initSmartWidget(siteId: string, config: SiteConfig) {
  const host = document.createElement("div");
  host.id = "meetzy-host";
  host.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:'DM Sans',sans-serif;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = getStyles(config.brandColor, config.brandColor2);
  shadow.appendChild(style);

  const visitorId = uid();
  const bc = config.brandColor;
  const isPro = config.plan === "pro" || config.plan === "elite";
  const isElite = config.plan === "elite";

  let state: WidgetState = "observing";
  let conversationId: string | undefined = sessionStorage.getItem(`mz_c_${siteId}`) ?? undefined;
  let isStreaming = false;
  let triggerSuppressedUntil = 0;
  let avatarRenderer: AvatarRenderer | null = null;

  // ── ESTADO 1: punto de luz ─────────────────────────
  const dot = document.createElement("div");
  dot.className = "mz-dot-presence";
  shadow.appendChild(dot);

  // ── ESTADO 2: trigger card ─────────────────────────
  const triggerCard = document.createElement("div");
  triggerCard.className = "mz-trigger mz-hidden";
  shadow.appendChild(triggerCard);

  // ── ESTADO 3: panel completo ───────────────────────
  const panel = document.createElement("div");
  panel.className = "mz-panel mz-hidden";
  shadow.appendChild(panel);

  // BehaviorTracker
  const tracker = new BehaviorTracker((message) => {
    if (state !== "observing") return;
    if (Date.now() < triggerSuppressedUntil) return;
    showTrigger(message);
  });
  tracker.init();

  function showTrigger(message: string) {
    state = "triggering";
    dot.classList.add("mz-hidden");

    triggerCard.innerHTML = `
      <div class="mz-trigger-inner">
        <div class="mz-trigger-avatar">${config.agentName[0]?.toUpperCase() ?? "M"}</div>
        <div class="mz-trigger-body">
          <p class="mz-trigger-text">${message}</p>
          <div class="mz-trigger-actions">
            <button class="mz-trigger-yes">Sí, contame</button>
            <button class="mz-trigger-no">Ahora no</button>
          </div>
        </div>
      </div>
    `;
    triggerCard.classList.remove("mz-hidden");
    triggerCard.classList.add("mz-visible");

    shadow.querySelector(".mz-trigger-yes")!.addEventListener("click", () => {
      openPanel(message);
    });
    shadow.querySelector(".mz-trigger-no")!.addEventListener("click", () => {
      triggerCard.classList.remove("mz-visible");
      triggerCard.classList.add("mz-hidden");
      dot.classList.remove("mz-hidden");
      state = "observing";
      triggerSuppressedUntil = Date.now() + 5 * 60 * 1000;
    });
  }

  function openPanel(contextMessage?: string) {
    state = "chatting";
    triggerCard.classList.remove("mz-visible");
    triggerCard.classList.add("mz-hidden");
    dot.classList.add("mz-hidden");
    buildPanel();
    panel.classList.remove("mz-hidden");
    panel.classList.add("mz-visible");

    // First message — contextual, not generic
    const opener = contextMessage ?? buildContextualOpener(tracker, config);
    typeMessage(opener);
  }

  function closePanel() {
    state = "observing";
    panel.classList.remove("mz-visible");
    panel.classList.add("mz-hidden");
    dot.classList.remove("mz-hidden");
    avatarRenderer?.stop();
    avatarRenderer = null;
  }

  dot.addEventListener("click", () => openPanel());

  function buildPanel() {
    panel.innerHTML = "";

    // Header
    const header = document.createElement("div");
    header.className = "mz-header";

    if (isPro && config.avatarType) {
      const canvas = document.createElement("canvas");
      canvas.width = 52; canvas.height = 52;
      canvas.className = "mz-avatar-canvas";
      header.appendChild(canvas);
      setTimeout(() => {
        avatarRenderer = new AvatarRenderer(canvas, {
          type: config.avatarType!,
          subtype: config.avatarSubtype ?? "",
          brandColor: bc,
          brandColor2: config.brandColor2,
        });
        avatarRenderer.start();
      }, 30);
    } else {
      const av = document.createElement("div");
      av.className = "mz-avatar-initials";
      av.textContent = config.agentName.slice(0, 2).toUpperCase();
      header.appendChild(av);
    }

    const info = document.createElement("div");
    info.className = "mz-header-info";
    info.innerHTML = `
      <p class="mz-agent-name">${config.agentName}</p>
      <p class="mz-agent-role"><span class="mz-online-dot"></span>${config.agentRole}</p>
    `;
    header.appendChild(info);

    const closeBtn = document.createElement("button");
    closeBtn.className = "mz-close-btn";
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    closeBtn.onclick = closePanel;
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const msgs = document.createElement("div");
    msgs.className = "mz-messages";
    msgs.id = "mz-msgs";
    panel.appendChild(msgs);

    // Input
    const inputArea = document.createElement("div");
    inputArea.className = "mz-input-area";
    const ta = document.createElement("textarea");
    ta.className = "mz-textarea";
    ta.placeholder = `Preguntale a ${config.agentName}…`;
    ta.rows = 1;
    ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 96) + "px"; });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const v = ta.value.trim(); if (v && !isStreaming) sendMessage(v); }
    });
    inputArea.appendChild(ta);

    const sendBtn = document.createElement("button");
    sendBtn.className = "mz-send-btn";
    sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    sendBtn.onclick = () => { const v = ta.value.trim(); if (v && !isStreaming) sendMessage(v); };
    inputArea.appendChild(sendBtn);
    panel.appendChild(inputArea);

    if (config.plan !== "elite") {
      const footer = document.createElement("div");
      footer.className = "mz-footer";
      footer.innerHTML = `Powered by <a href="https://meetzy.ai" target="_blank" style="color:${bc}">Meetzy</a>`;
      panel.appendChild(footer);
    }
  }

  function typeMessage(text: string) {
    const msgs = shadow.getElementById("mz-msgs");
    if (!msgs) return;
    const wrap = document.createElement("div");
    wrap.className = "mz-msg-wrap mz-msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "mz-bubble mz-bubble-agent";
    bbl.innerHTML = `<span class="mz-typing"><span></span><span></span><span></span></span>`;
    wrap.appendChild(bbl);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      bbl.textContent = "";
      let i = 0;
      const iv = setInterval(() => {
        i++;
        bbl.textContent = text.slice(0, i);
        msgs.scrollTop = msgs.scrollHeight;
        if (i >= text.length) clearInterval(iv);
      }, 20);
    }, 600);
  }

  function addUserMsg(text: string) {
    const msgs = shadow.getElementById("mz-msgs");
    if (!msgs) return;
    const wrap = document.createElement("div");
    wrap.className = "mz-msg-wrap mz-msg-user";
    const bbl = document.createElement("div");
    bbl.className = "mz-bubble mz-bubble-user";
    bbl.textContent = text;
    wrap.appendChild(bbl);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addStreamBubble(): HTMLElement {
    const msgs = shadow.getElementById("mz-msgs");
    if (!msgs) return document.createElement("div");
    const wrap = document.createElement("div");
    wrap.className = "mz-msg-wrap mz-msg-agent";
    const bbl = document.createElement("div");
    bbl.className = "mz-bubble mz-bubble-agent";
    bbl.innerHTML = `<span class="mz-typing"><span></span><span></span><span></span></span>`;
    wrap.appendChild(bbl);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return bbl;
  }

  async function sendMessage(text: string) {
    if (isStreaming) return;
    const ta = shadow.querySelector(".mz-textarea") as HTMLTextAreaElement | null;
    if (ta) { ta.value = ""; ta.style.height = "auto"; }

    addUserMsg(text);
    isStreaming = true;
    avatarRenderer?.setTalking(true);
    const bbl = addStreamBubble();

    try {
      const res = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          message: text,
          conversationId,
          visitorId,
          plan: config.plan,
          visitorContext: tracker.getContext(),
          visitorContextPrompt: tracker.getContextPrompt(),
        }),
      });

      if (!res.ok || !res.body) { bbl.textContent = "Error al procesar."; return; }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) { conversationId = newConvId; sessionStorage.setItem(`mz_c_${siteId}`, newConvId); }

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
            const chunk = JSON.parse(line.slice(6)) as ParsedChunk;
            if (chunk.type === "text" && chunk.content) {
              full += chunk.content;
              bbl.textContent = full;
              const msgs = shadow.getElementById("mz-msgs");
              if (msgs) msgs.scrollTop = msgs.scrollHeight;
            }
            if (chunk.type === "ui_component" && chunk.component && isPro) {
              const uiEl = renderUIComponent(chunk.component, bc);
              const msgs = shadow.getElementById("mz-msgs");
              if (msgs) { msgs.appendChild(uiEl); msgs.scrollTop = msgs.scrollHeight; }
            }
            if (chunk.type === "done" && full && isElite && config.voiceEnabled) {
              fetch(`${APP_URL}/api/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: full, siteId }) })
                .then(r => r.arrayBuffer())
                .then(buf => { avatarRenderer?.setTalking(true); return playAudio(buf); })
                .then(() => avatarRenderer?.setTalking(false))
                .catch(() => {});
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      bbl.textContent = "Error de conexión.";
    } finally {
      isStreaming = false;
      avatarRenderer?.setTalking(false);
    }
  }
}

// ══════════════════════════════════════════════════════
// FULL-PAGE MODE
// ══════════════════════════════════════════════════════

function initFullPage(siteId: string, config: SiteConfig) {
  Array.from(document.body.children).forEach((el) => {
    if (el.id !== "meetzy-fp-host") (el as HTMLElement).style.display = "none";
  });
  document.body.style.cssText = "margin:0;padding:0;overflow:hidden;";

  const host = document.createElement("div");
  host.id = "meetzy-fp-host";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = getFullPageStyles(config.brandColor);
  shadow.appendChild(style);

  const visitorId = uid();
  let conversationId: string | undefined;
  let isStreaming = false;
  let avatarRenderer: AvatarRenderer | null = null;
  const isPro = config.plan === "pro" || config.plan === "elite";
  const isElite = config.plan === "elite";

  const tracker = new BehaviorTracker(() => {});
  tracker.init();

  const wrap = document.createElement("div");
  wrap.className = "mz-fp-wrap";
  shadow.appendChild(wrap);

  // Sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "mz-fp-sidebar";
  sidebar.innerHTML = `
    <div class="mz-fp-avatar-wrap" id="mz-fp-av"></div>
    <div class="mz-fp-agent-info">
      <p class="mz-fp-agent-name">${config.agentName}</p>
      <p class="mz-fp-agent-role"><span class="mz-fp-dot"></span>${config.agentRole}</p>
    </div>
    <div style="flex:1"></div>
    <p class="mz-fp-powered">Powered by <a href="https://meetzy.ai" target="_blank">Meetzy</a></p>
  `;
  wrap.appendChild(sidebar);

  if (isPro && config.avatarType) {
    const canvas = document.createElement("canvas");
    canvas.width = 110; canvas.height = 110;
    canvas.style.borderRadius = "50%";
    sidebar.querySelector("#mz-fp-av")!.appendChild(canvas);
    setTimeout(() => {
      avatarRenderer = new AvatarRenderer(canvas, {
        type: config.avatarType!,
        subtype: config.avatarSubtype ?? "",
        brandColor: config.brandColor,
        brandColor2: config.brandColor2,
      });
      avatarRenderer.start();
    }, 50);
  } else {
    const av = document.createElement("div");
    av.className = "mz-fp-av-initials";
    av.textContent = config.agentName.slice(0, 2).toUpperCase();
    sidebar.querySelector("#mz-fp-av")!.appendChild(av);
  }

  // Chat area
  const chat = document.createElement("div");
  chat.className = "mz-fp-chat";

  const msgs = document.createElement("div");
  msgs.className = "mz-fp-messages";
  msgs.id = "mz-fp-msgs";
  chat.appendChild(msgs);

  // Chips
  const chips = document.createElement("div");
  chips.className = "mz-fp-chips";
  chips.id = "mz-fp-chips";
  const defaultChips = config.primaryQuestion
    ? [config.primaryQuestion, "¿Cuáles son los precios?", "¿Cómo funciona?"]
    : ["¿Qué ofrecen?", "¿Cuáles son los precios?", "¿Cómo empiezo?"];
  defaultChips.forEach((chip) => {
    const btn = document.createElement("button");
    btn.className = "mz-fp-chip";
    btn.textContent = chip;
    btn.onclick = () => { chips.style.display = "none"; sendMsg(chip); };
    chips.appendChild(btn);
  });
  chat.appendChild(chips);

  // Input
  const inputArea = document.createElement("div");
  inputArea.className = "mz-fp-input-area";
  const ta = document.createElement("textarea");
  ta.className = "mz-fp-textarea";
  ta.placeholder = `Contame qué necesitás…`;
  ta.rows = 1;
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const v = ta.value.trim(); if (v && !isStreaming) sendMsg(v); }
  });
  inputArea.appendChild(ta);
  const sendBtn = document.createElement("button");
  sendBtn.className = "mz-fp-send-btn";
  sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  sendBtn.onclick = () => { const v = ta.value.trim(); if (v && !isStreaming) sendMsg(v); };
  inputArea.appendChild(sendBtn);
  chat.appendChild(inputArea);
  wrap.appendChild(chat);

  // Welcome
  addMsg("agent", buildContextualOpener(tracker, config));

  function addMsg(role: "agent" | "user", text: string): HTMLElement {
    const el = shadow.getElementById("mz-fp-msgs")!;
    const wrap2 = document.createElement("div");
    wrap2.className = `mz-fp-msg-wrap mz-fp-${role}`;
    const bbl = document.createElement("div");
    bbl.className = `mz-fp-bubble mz-fp-bubble-${role}`;
    bbl.textContent = text;
    wrap2.appendChild(bbl);
    el.appendChild(wrap2);
    el.scrollTop = el.scrollHeight;
    return bbl;
  }

  async function sendMsg(text: string) {
    if (isStreaming) return;
    ta.value = ""; ta.style.height = "auto";
    shadow.getElementById("mz-fp-chips")?.style.setProperty("display", "none");

    addMsg("user", text);
    isStreaming = true;
    avatarRenderer?.setTalking(true);

    const msgsEl = shadow.getElementById("mz-fp-msgs")!;
    const wrap2 = document.createElement("div");
    wrap2.className = "mz-fp-msg-wrap mz-fp-agent";
    const bbl = document.createElement("div");
    bbl.className = "mz-fp-bubble mz-fp-bubble-agent";
    bbl.innerHTML = `<span class="mz-fp-typing"><span></span><span></span><span></span></span>`;
    wrap2.appendChild(bbl);
    msgsEl.appendChild(wrap2);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    try {
      const res = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, message: text, conversationId, visitorId, plan: config.plan, visitorContext: tracker.getContext(), visitorContextPrompt: tracker.getContextPrompt() }),
      });
      if (!res.ok || !res.body) { bbl.textContent = "Error."; return; }
      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) { conversationId = newConvId; }

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
            const chunk = JSON.parse(line.slice(6)) as ParsedChunk;
            if (chunk.type === "text" && chunk.content) { full += chunk.content; bbl.textContent = full; msgsEl.scrollTop = msgsEl.scrollHeight; }
            if (chunk.type === "ui_component" && chunk.component && isPro) { const uiEl = renderUIComponent(chunk.component, config.brandColor); msgsEl.appendChild(uiEl); msgsEl.scrollTop = msgsEl.scrollHeight; }
            if (chunk.type === "done" && full && isElite && config.voiceEnabled) {
              fetch(`${APP_URL}/api/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: full, siteId }) }).then(r => r.arrayBuffer()).then(buf => { avatarRenderer?.setTalking(true); return playAudio(buf); }).then(() => avatarRenderer?.setTalking(false)).catch(() => {});
            }
          } catch { /* skip */ }
        }
      }
    } catch { bbl.textContent = "Error."; }
    finally { isStreaming = false; avatarRenderer?.setTalking(false); }
  }
}

function buildContextualOpener(tracker: BehaviorTracker, config: SiteConfig): string {
  const ctx = tracker.getContext();
  if (ctx.isReturnVisitor) {
    return `Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?`;
  }
  const pricing = ctx.sectionsViewed["pricing"] ?? ctx.sectionsViewed["precios"] ?? { time: 0, revisits: 0 };
  if (pricing.time > 20) {
    return `Vi que pasaste un rato mirando los planes. ¿Querés que te ayude a entender cuál tiene más sentido para vos?`;
  }
  if (ctx.timeOnSite > 60) {
    return `Llevás un rato explorando. ¿Puedo ayudarte a encontrar algo?`;
  }
  return config.welcomeMessage;
}

// ══════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════

function getStyles(bc: string, bc2: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    /* ── Dot presence ── */
    .mz-dot-presence {
      width: 10px; height: 10px; border-radius: 50%;
      background: ${bc}; cursor: pointer;
      animation: mz-pulse-dot 2.5s ease-in-out infinite;
      box-shadow: 0 0 0 0 ${bc}60;
      transition: transform 0.2s;
    }
    .mz-dot-presence:hover { transform: scale(1.5); }

    /* ── Trigger card ── */
    .mz-trigger { position: absolute; bottom: 28px; right: 0; width: 280px; }
    .mz-trigger-inner {
      display: flex; align-items: flex-start; gap: 10px;
      background: #111; border: 1px solid rgba(255,255,255,0.09);
      border-radius: 18px; border-bottom-right-radius: 4px;
      padding: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    }
    .mz-trigger-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${bc}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne',sans-serif; font-weight: 800; font-size: 14px;
      flex-shrink: 0;
    }
    .mz-trigger-body { flex: 1; min-width: 0; }
    .mz-trigger-text { font-size: 13px; color: #F0EDE8; line-height: 1.5; margin-bottom: 10px; }
    .mz-trigger-actions { display: flex; gap: 6px; }
    .mz-trigger-yes {
      background: ${bc}; color: #fff; border: none; border-radius: 8px;
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

    /* ── Panel ── */
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
      width: 42px; height: 42px; border-radius: 50%; background: ${bc};
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
    .mz-bubble-user  { background:${bc}; color:#fff; border-bottom-right-radius:3px; }

    .mz-typing { display:flex; gap:4px; padding:2px 0; }
    .mz-typing span { width:6px; height:6px; background:${bc}; border-radius:50%; animation:mz-bounce 1.2s ease infinite; }
    .mz-typing span:nth-child(2) { animation-delay:0.15s; }
    .mz-typing span:nth-child(3) { animation-delay:0.3s; }

    .mz-input-area { display:flex; align-items:flex-end; gap:8px; padding:11px 14px; border-top:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
    .mz-textarea {
      flex:1; background:#1a1a1a; border:1px solid rgba(255,255,255,0.07);
      color:#F0EDE8; border-radius:13px; padding:9px 13px; font-size:13px; resize:none;
      font-family:'DM Sans',sans-serif; outline:none; max-height:96px; line-height:1.5;
      transition:border-color 0.15s;
    }
    .mz-textarea:focus { border-color:${bc}; }
    .mz-textarea::placeholder { color:rgba(240,237,232,0.2); }
    .mz-send-btn {
      width:36px; height:36px; border-radius:50%; background:${bc}; border:none;
      display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
      transition:opacity 0.15s, transform 0.15s;
    }
    .mz-send-btn:hover { opacity:0.85; transform:scale(1.06); }
    .mz-footer { text-align:center; padding:7px; font-size:9px; color:rgba(240,237,232,0.2); border-top:1px solid rgba(255,255,255,0.04); flex-shrink:0; }

    .mz-hidden { display:none !important; }
    .mz-visible { display:flex !important; }

    @keyframes mz-pulse-dot {
      0%,100% { box-shadow:0 0 0 0 ${bc}60; }
      50%      { box-shadow:0 0 0 6px ${bc}00; }
    }
    @keyframes mz-bounce {
      0%,80%,100% { transform:translateY(0); }
      40%          { transform:translateY(-5px); }
    }

    @media (max-width:480px) {
      .mz-panel { position:fixed; inset:0; width:100vw; height:100dvh; border-radius:0; bottom:0; right:0; }
    }
  `;
}

function getFullPageStyles(bc: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    .mz-fp-wrap { display:flex; width:100vw; height:100vh; background:#080808; font-family:'DM Sans',sans-serif; color:#F0EDE8; }

    .mz-fp-sidebar {
      width:260px; flex-shrink:0; background:#0d0d0d; border-right:1px solid rgba(255,255,255,0.05);
      display:flex; flex-direction:column; align-items:center; padding:40px 24px; gap:16px;
    }
    .mz-fp-avatar-wrap { display:flex; justify-content:center; }
    .mz-fp-av-initials {
      width:100px; height:100px; border-radius:50%; background:${bc}; color:#fff;
      font-family:'Syne',sans-serif; font-weight:800; font-size:36px;
      display:flex; align-items:center; justify-content:center;
    }
    .mz-fp-agent-info { text-align:center; }
    .mz-fp-agent-name { font-family:'Syne',sans-serif; font-weight:800; font-size:18px; color:#F0EDE8; }
    .mz-fp-agent-role { font-size:12px; color:rgba(240,237,232,0.4); display:flex; align-items:center; justify-content:center; gap:5px; margin-top:4px; }
    .mz-fp-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; display:inline-block; }
    .mz-fp-powered { font-size:10px; color:rgba(240,237,232,0.2); }
    .mz-fp-powered a { color:${bc}; text-decoration:none; }

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
    .mz-fp-bubble-user  { background:${bc}; color:#fff; border-bottom-right-radius:4px; }
    .mz-fp-typing { display:flex; gap:5px; padding:3px 0; }
    .mz-fp-typing span { width:8px; height:8px; background:${bc}; border-radius:50%; animation:mz-bounce 1.2s ease infinite; }
    .mz-fp-typing span:nth-child(2) { animation-delay:0.15s; }
    .mz-fp-typing span:nth-child(3) { animation-delay:0.3s; }

    .mz-fp-chips { display:flex; flex-wrap:wrap; gap:8px; padding:0 48px 14px; }
    .mz-fp-chip {
      background:transparent; border:1px solid ${bc}40; color:${bc}; padding:7px 16px;
      border-radius:100px; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
    }
    .mz-fp-chip:hover { background:${bc}12; }

    .mz-fp-input-area { display:flex; align-items:flex-end; gap:12px; padding:16px 48px 32px; border-top:1px solid rgba(255,255,255,0.05); }
    .mz-fp-textarea {
      flex:1; background:#111; border:1px solid rgba(255,255,255,0.07); color:#F0EDE8;
      border-radius:16px; padding:13px 18px; font-size:15px; resize:none;
      font-family:'DM Sans',sans-serif; outline:none; max-height:120px; line-height:1.5;
      transition:border-color 0.15s;
    }
    .mz-fp-textarea:focus { border-color:${bc}; }
    .mz-fp-textarea::placeholder { color:rgba(240,237,232,0.2); }
    .mz-fp-send-btn {
      width:48px; height:48px; border-radius:50%; background:${bc}; border:none;
      display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:opacity 0.15s,transform 0.15s;
    }
    .mz-fp-send-btn:hover { opacity:0.85; transform:scale(1.05); }

    @keyframes mz-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }
    @media (max-width:640px) {
      .mz-fp-sidebar { display:none; }
      .mz-fp-messages, .mz-fp-chips, .mz-fp-input-area { padding-left:16px; padding-right:16px; }
    }
  `;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
