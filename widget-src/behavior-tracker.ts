export interface VisitorContext {
  timeOnSite: number;
  currentPage: string;
  pagesVisited: string[];
  sectionsViewed: Record<string, { time: number; revisits: number }>;
  hoveredElements: string[];
  scrollDepth: Record<string, number>;
  referrer: string;
  searchQuery: string;
  localHour: number;
  isReturnVisitor: boolean;
  device: "mobile" | "desktop";
  scrollSpeed: "fast" | "normal" | "slow";
  inferredIntent: string;
}

type TriggerKey = string;

export class BehaviorTracker {
  private ctx: VisitorContext;
  private startTime = Date.now();
  private sectionTimers: Record<string, number> = {};
  private activeSections: Set<string> = new Set();
  private triggered: Set<TriggerKey> = new Set();
  private sectionObserver: IntersectionObserver | null = null;
  private onTrigger: (message: string) => void;
  private intentTimer: ReturnType<typeof setInterval> | null = null;

  constructor(onTrigger: (message: string) => void) {
    this.onTrigger = onTrigger;
    this.ctx = {
      timeOnSite: 0,
      currentPage: window.location.pathname,
      pagesVisited: [window.location.pathname],
      sectionsViewed: {},
      hoveredElements: [],
      scrollDepth: {},
      referrer: document.referrer,
      searchQuery: this.extractSearchQuery(),
      localHour: new Date().getHours(),
      isReturnVisitor: !!localStorage.getItem("mz_visited"),
      device: window.innerWidth < 768 ? "mobile" : "desktop",
      scrollSpeed: "normal",
      inferredIntent: "exploring",
    };
  }

  private extractSearchQuery(): string {
    try {
      const ref = new URL(document.referrer);
      return ref.searchParams.get("q") ?? ref.searchParams.get("query") ?? "";
    } catch {
      return "";
    }
  }

  init() {
    localStorage.setItem("mz_visited", "true");
    this.trackTime();
    this.trackSections();
    this.trackHover();
    this.trackScroll();
    this.inferIntentLoop();
    this.triggerLoop();

    // Expose to landing page scripts
    (window as Window & { __mzSections?: Record<string, number>; __mzIntent?: string }).__mzSections = {};
  }

  private trackTime() {
    setInterval(() => {
      this.ctx.timeOnSite = Math.round((Date.now() - this.startTime) / 1000);
      for (const id of this.activeSections) {
        if (!this.ctx.sectionsViewed[id]) {
          this.ctx.sectionsViewed[id] = { time: 0, revisits: 0 };
        }
        this.ctx.sectionsViewed[id]!.time += 2;
      }
      // Sync to window for landing demo
      const w = window as Window & { __mzSections?: Record<string, number>; __mzIntent?: string };
      if (w.__mzSections !== undefined) {
        for (const [k, v] of Object.entries(this.ctx.sectionsViewed)) {
          w.__mzSections[k] = v.time;
        }
      }
      if (w.__mzIntent !== undefined) {
        w.__mzIntent = this.ctx.inferredIntent;
      }
    }, 2000);
  }

  private trackSections() {
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id =
            el.id ||
            el.dataset["section"] ||
            el.className.split(" ")[0] ||
            `section-${Math.random().toString(36).slice(2, 6)}`;

          if (!el.id) el.id = `mz-s-${id}`;

          if (entry.isIntersecting) {
            this.activeSections.add(id);
            if (!this.ctx.sectionsViewed[id]) {
              this.ctx.sectionsViewed[id] = { time: 0, revisits: 0 };
            } else {
              this.ctx.sectionsViewed[id]!.revisits++;
            }
          } else {
            this.activeSections.delete(id);
          }
        }
      },
      { threshold: 0.4 }
    );

    const trackEl = (el: Element) => {
      if (this.sectionObserver) this.sectionObserver.observe(el);
    };

    document.querySelectorAll("section, [data-section], main > div").forEach(trackEl);
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const node of m.addedNodes) {
          if (node instanceof Element) {
            if (node.matches("section, [data-section]")) trackEl(node);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  private trackHover() {
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    document.addEventListener("mousemove", (e) => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        const id = el.id || el.className.split(" ")[0] || el.tagName.toLowerCase();
        if (id && !this.ctx.hoveredElements.includes(id)) {
          this.ctx.hoveredElements.push(id);
          if (this.ctx.hoveredElements.length > 20) this.ctx.hoveredElements.shift();
        }
      }, 3000);
    }, { passive: true });
  }

  private lastScrollY = 0;
  private lastScrollTime = Date.now();

  private trackScroll() {
    window.addEventListener("scroll", () => {
      const now = Date.now();
      const delta = Math.abs(window.scrollY - this.lastScrollY);
      const elapsed = now - this.lastScrollTime;
      const speed = delta / Math.max(elapsed, 1);

      this.ctx.scrollSpeed = speed > 2 ? "fast" : speed < 0.5 ? "slow" : "normal";
      this.ctx.scrollDepth[this.ctx.currentPage] = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      this.lastScrollY = window.scrollY;
      this.lastScrollTime = now;
    }, { passive: true });
  }

  private inferIntentLoop() {
    this.intentTimer = setInterval(() => {
      const { sectionsViewed, isReturnVisitor, timeOnSite, pagesVisited } = this.ctx;
      const pricing = sectionsViewed["pricing"] ?? sectionsViewed["precios"] ?? { time: 0, revisits: 0 };
      const pricingVisits = pagesVisited.filter((p) => p.includes("pric")).length;

      if (pricingVisits >= 3 || pricing.revisits >= 3) {
        this.ctx.inferredIntent = "ready_to_act";
      } else if (pricing.revisits >= 2) {
        this.ctx.inferredIntent = "comparing_plans";
      } else if (pricing.time > 45) {
        this.ctx.inferredIntent = "evaluating_pricing";
      } else if (isReturnVisitor) {
        this.ctx.inferredIntent = "returning_interested";
      } else if (timeOnSite > 120) {
        this.ctx.inferredIntent = "deeply_exploring";
      } else {
        this.ctx.inferredIntent = "exploring";
      }
    }, 2000);
  }

  private triggerLoop() {
    setInterval(() => {
      const msg = this.checkTriggers();
      if (msg) this.onTrigger(msg);
    }, 3000);
  }

  checkTriggers(): string | null {
    const { sectionsViewed, inferredIntent, isReturnVisitor, timeOnSite } = this.ctx;
    const pricing = sectionsViewed["pricing"] ?? sectionsViewed["precios"] ?? { time: 0, revisits: 0 };

    if (isReturnVisitor && timeOnSite > 8 && !this.triggered.has("return")) {
      this.triggered.add("return");
      return "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?";
    }
    if (pricing.time > 45 && !this.triggered.has("pricing")) {
      this.triggered.add("pricing");
      return "Vi que estuviste un rato mirando los planes. ¿Querés que te ayude a entender cuál tiene más sentido para vos?";
    }
    if (pricing.revisits >= 2 && !this.triggered.has("pricing_revisit")) {
      this.triggered.add("pricing_revisit");
      return "Volviste a los precios. ¿Hay algo que no quedó claro?";
    }
    if (inferredIntent === "ready_to_act" && !this.triggered.has("ready")) {
      this.triggered.add("ready");
      return "Llevás un rato evaluando. ¿Querés que te cuente cómo sería para tu negocio específico?";
    }
    if (timeOnSite > 180 && !this.triggered.has("long_session")) {
      this.triggered.add("long_session");
      return "Llevás un rato explorando. ¿Encontraste lo que buscabas?";
    }
    return null;
  }

  getContext(): VisitorContext {
    return { ...this.ctx };
  }

  getContextPrompt(): string {
    const c = this.ctx;
    return `
CONTEXTO DEL VISITANTE EN TIEMPO REAL:
- Tiempo en el sitio: ${c.timeOnSite} segundos
- Página actual: ${c.currentPage}
- Páginas visitadas: ${c.pagesVisited.join(" → ")}
- Secciones y tiempo: ${JSON.stringify(c.sectionsViewed)}
- Elementos donde se detuvo: ${c.hoveredElements.slice(-8).join(", ")}
- Vino de: ${c.referrer || "directo"}
- Buscó: ${c.searchQuery || "no disponible"}
- Hora local: ${c.localHour}hs
- Visita anterior: ${c.isReturnVisitor ? "sí" : "no"}
- Velocidad de scroll: ${c.scrollSpeed}
- Intención inferida: ${c.inferredIntent}

INSTRUCCIÓN CRÍTICA: Usá este contexto para responder con precisión quirúrgica.
No preguntes lo que ya sabés. No expliques desde cero si ya exploró.
Si la intención es evaluating_pricing, hablá de pricing.
Si la intención es comparing_plans, ayudalo a decidir entre planes.
Si son más de las 22hs o menos de las 7hs, sé muy conciso.
Si es return visitor, asumí que ya conoce el producto básico.
Si el scroll speed fue lento, la persona está leyendo con atención.`.trim();
  }

  destroy() {
    if (this.sectionObserver) this.sectionObserver.disconnect();
    if (this.intentTimer) clearInterval(this.intentTimer);
  }
}
