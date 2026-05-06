export interface AvatarConfig {
  type: string;
  subtype: string;
  brandColor: string;
  brandColor2: string;
  logoUrl?: string;
}

interface DrawState {
  blinkTimer: number;
  blinkProgress: number;
  breathePhase: number;
  mouthOpen: number;
  headWobble: number;
  wobbleDir: number;
  frame: number;
  isTalking: boolean;
}

function darken(hex: string, amt = 30): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})`;
}

function lighten(hex: string, amt = 50): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
}

function drawHuman(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, st: DrawState, cfg: AvatarConfig) {
  const isFemale = cfg.subtype === "female";
  const skin = isFemale ? "#f5c5a0" : "#e8b88a";
  const hair = isFemale ? "#4a2c0a" : "#2c1a0a";

  ctx.save();
  ctx.translate(cx, cy + st.breathePhase * 1.5 * s);

  type Ctx2D = CanvasRenderingContext2D & { roundRect(x:number,y:number,w:number,h:number,r:number):void };

  // Body
  (ctx as Ctx2D).fillStyle = cfg.brandColor;
  ctx.beginPath();
  (ctx as Ctx2D).roundRect(-28*s, 30*s, 56*s, 55*s, 8*s);
  ctx.fill();

  // Logo initial
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `bold ${13*s}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", cx, cy + 55*s);

  // Arms
  ctx.fillStyle = cfg.brandColor;
  ctx.beginPath();
  (ctx as Ctx2D).roundRect(-44*s, 32*s, 17*s, 42*s, 6*s);
  ctx.fill();
  ctx.beginPath();
  (ctx as Ctx2D).roundRect(27*s, 32*s, 17*s, 42*s, 6*s);
  ctx.fill();

  // Neck
  ctx.fillStyle = skin;
  ctx.beginPath();
  (ctx as Ctx2D).roundRect(-8*s, 8*s, 16*s, 22*s, 4*s);
  ctx.fill();

  ctx.save();
  ctx.translate(st.headWobble * s, 0);

  // Hair
  ctx.fillStyle = hair;
  if (isFemale) {
    ctx.beginPath();
    ctx.ellipse(cx, cy - 32*s, 34*s, 38*s, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect(cx - 33*s, cy - 35*s, 11*s, 55*s, 6*s);
    ctx.fill();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect(cx + 22*s, cy - 35*s, 11*s, 55*s, 6*s);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy - 34*s, 29*s, 22*s, 0, 0, Math.PI);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20*s, 29*s, 33*s, 0, 0, Math.PI*2);
  ctx.fill();

  const eyeY = cy - 26*s;
  const bs = st.blinkProgress;

  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(cx - 10*s, eyeY, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 10*s, eyeY, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#2c1a0a";
  ctx.beginPath(); ctx.ellipse(cx - 10*s, eyeY, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 10*s, eyeY, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.ellipse(cx - 8*s, eyeY - 2*s, 2*s, 2*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 12*s, eyeY - 2*s, 2*s, 2*bs*s, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5*s, 10*s, (3 + st.mouthOpen * 5)*s, 0, 0, Math.PI);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawDog(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, st: DrawState, cfg: AvatarConfig) {
  ctx.save();
  ctx.translate(cx, cy + st.breathePhase * 1.5 * s);

  type Ctx2D = CanvasRenderingContext2D & { roundRect(x:number,y:number,w:number,h:number,r:number):void };
  ctx.fillStyle = cfg.brandColor;
  ctx.beginPath();
  (ctx as Ctx2D).roundRect(-30*s, 20*s, 60*s, 65*s, 10*s);
  ctx.fill();

  ctx.save();
  ctx.translate(st.headWobble * s, 0);

  ctx.fillStyle = "#8B5E3C";
  ctx.beginPath(); ctx.ellipse(cx - 28*s, cy - 18*s, 13*s, 20*s, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 28*s, cy - 18*s, 13*s, 20*s, 0.4, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = "#c4895f";
  ctx.beginPath(); ctx.ellipse(cx, cy - 15*s, 33*s, 30*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#e0b080";
  ctx.beginPath(); ctx.ellipse(cx, cy, 16*s, 13*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.ellipse(cx, cy - 4*s, 6*s, 5*s, 0, 0, Math.PI*2); ctx.fill();

  const bs = st.blinkProgress;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(cx - 14*s, cy - 22*s, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 14*s, cy - 22*s, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#2c1a0a";
  ctx.beginPath(); ctx.ellipse(cx - 14*s, cy - 22*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 14*s, cy - 22*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = "#6b3a1f"; ctx.lineWidth = 2*s;
  ctx.beginPath();
  ctx.moveTo(cx - 8*s, cy + 6*s);
  ctx.quadraticCurveTo(cx, cy + (10 + st.mouthOpen * 8)*s, cx + 8*s, cy + 6*s);
  ctx.stroke();

  ctx.restore(); ctx.restore();
}

function drawOrange(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, st: DrawState) {
  const bounce = st.isTalking ? Math.abs(Math.sin(st.frame * 0.3)) * 5 : 0;
  ctx.save();
  ctx.translate(cx, cy - bounce * s + st.breathePhase * 1.5 * s);

  const g = ctx.createRadialGradient(-14*s, cy - 20*s, 4*s, 0, cy + 10*s, 52*s);
  g.addColorStop(0, "#ffa030"); g.addColorStop(1, "#e05800");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, cy + 10*s, 52*s, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = "#2ea032";
  ctx.beginPath(); ctx.ellipse(5*s, cy - 46*s, 7*s, 17*s, 0.5, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#4a2c0a"; ctx.lineWidth = 3*s;
  ctx.beginPath(); ctx.moveTo(0, cy - 42*s); ctx.quadraticCurveTo(5*s, cy - 56*s, 0, cy - 62*s); ctx.stroke();

  const bs = st.blinkProgress;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(-16*s, cy - 5*s, 9*s, 9*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16*s, cy - 5*s, 9*s, 9*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.ellipse(-16*s, cy - 5*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16*s, cy - 5*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = "#c05000"; ctx.lineWidth = 3*s;
  ctx.beginPath(); ctx.arc(0, cy + 10*s, 15*s, 0.2, Math.PI - 0.2); ctx.stroke();

  if (st.mouthOpen > 0.1) {
    ctx.fillStyle = "#c05000";
    ctx.beginPath(); ctx.ellipse(0, cy + 20*s, 10*s, (3 + st.mouthOpen * 7)*s, 0, 0, Math.PI); ctx.fill();
  }
  ctx.restore();
}

function drawCup(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, st: DrawState, cfg: AvatarConfig) {
  ctx.save();
  ctx.translate(cx, cy + st.breathePhase * 1.5 * s);

  ctx.strokeStyle = cfg.brandColor; ctx.lineWidth = 7*s;
  ctx.beginPath(); ctx.arc(cx + 40*s, cy + 15*s, 17*s, -0.8, 0.8); ctx.stroke();

  ctx.fillStyle = cfg.brandColor;
  ctx.beginPath();
  ctx.moveTo(cx - 28*s, cy - 30*s);
  ctx.lineTo(cx - 33*s, cy + 48*s);
  ctx.quadraticCurveTo(cx, cy + 60*s, cx + 33*s, cy + 48*s);
  ctx.lineTo(cx + 28*s, cy - 30*s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lighten(cfg.brandColor, 40);
  ctx.beginPath(); ctx.ellipse(cx, cy - 30*s, 28*s, 7*s, 0, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2.5*s;
  const so = (st.frame * 2) % 20;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i*9*s, cy - 38*s - so*s);
    ctx.quadraticCurveTo(cx + (i+1)*7*s, cy - 52*s - so*s, cx + i*7*s, cy - 65*s - so*s);
    ctx.stroke();
  }

  const bs = st.blinkProgress;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(cx - 10*s, cy - 5*s, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 10*s, cy - 5*s, 8*s, 8*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.ellipse(cx - 10*s, cy - 5*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 10*s, cy - 5*s, 5*s, 5*bs*s, 0, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2.5*s;
  ctx.beginPath(); ctx.arc(cx, cy + 15*s, 11*s, 0.2, Math.PI - 0.2); ctx.stroke();
  if (st.mouthOpen > 0.1) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(cx, cy + 22*s, 8*s, (2 + st.mouthOpen * 6)*s, 0, 0, Math.PI); ctx.fill();
  }
  ctx.restore();
}

export class AvatarRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: DrawState;
  private config: AvatarConfig;
  private raf = 0;

  constructor(canvas: HTMLCanvasElement, config: AvatarConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = config;
    this.state = {
      blinkTimer: 150 + Math.random() * 100,
      blinkProgress: 1,
      breathePhase: 0,
      mouthOpen: 0,
      headWobble: 0,
      wobbleDir: 1,
      frame: 0,
      isTalking: false,
    };
  }

  setTalking(val: boolean) { this.state.isTalking = val; }
  updateConfig(cfg: Partial<AvatarConfig>) { this.config = { ...this.config, ...cfg }; }

  start() {
    const loop = () => {
      const st = this.state;
      const s = this.canvas.width / 200;
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      st.frame++;
      st.breathePhase = Math.sin(st.frame * 0.02);
      st.blinkTimer--;
      if (st.blinkTimer <= 0) st.blinkTimer = 180 + Math.random() * 120;
      if (st.blinkTimer < 10) {
        st.blinkProgress = st.blinkTimer < 5 ? st.blinkTimer / 5 : (10 - st.blinkTimer) / 5;
      } else {
        st.blinkProgress = 1;
      }
      st.headWobble += st.wobbleDir * 0.04;
      if (Math.abs(st.headWobble) > 1.5) st.wobbleDir *= -1;
      if (st.isTalking) {
        st.mouthOpen = 0.3 + Math.sin(st.frame * 0.25) * 0.4;
      } else {
        st.mouthOpen = Math.max(0, st.mouthOpen - 0.08);
      }

      switch (this.config.type) {
        case "human": drawHuman(this.ctx, cx, cy, s, st, this.config); break;
        case "animal": drawDog(this.ctx, cx, cy, s, st, this.config); break;
        case "object":
          if (this.config.subtype?.includes("taza") || this.config.subtype?.includes("cup")) {
            drawCup(this.ctx, cx, cy, s, st, this.config);
          } else {
            drawOrange(this.ctx, cx, cy, s, st);
          }
          break;
        default: drawHuman(this.ctx, cx, cy, s, st, this.config);
      }

      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() { cancelAnimationFrame(this.raf); }
}
