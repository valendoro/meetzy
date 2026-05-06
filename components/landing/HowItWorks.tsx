import ScrollReveal from "./ScrollReveal";

const STEPS = [
  {
    n: "01",
    icon: "🔗",
    title: "Pegás tu URL",
    body: "Meetzy lee tu sitio completo. Aprende todo lo que necesita sobre tu negocio en segundos.",
    detail: "Productos, precios, horarios, servicios, tono. Cero configuración manual.",
  },
  {
    n: "02",
    icon: "🎭",
    title: "Elegís cómo se ve",
    body: "Humano, animal, objeto — lo que represente tu marca. Con tus colores y tu logo.",
    detail: "La naranja de tu frutería. La chomba con tu logo. El perro de tu veterinaria.",
  },
  {
    n: "03",
    icon: "⚡",
    title: "Una línea de código",
    body: "O cero líneas si usás Webflow, WordPress o Shopify. Listo en 10 minutos.",
    detail: "El agente empieza a observar y responder desde el primer visitante.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" data-section="how" className="py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">
            Cómo funciona
          </p>
          <h2
            className="font-syne font-black text-[#eeeae4] leading-[0.9]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            De cero a agente<br />en 10 minutos.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="card p-7 h-full relative overflow-hidden group">
                <div className="absolute top-5 right-5 font-syne font-black text-7xl text-[rgba(255,255,255,0.02)] leading-none select-none group-hover:text-[rgba(255,255,255,0.04)] transition-colors">
                  {step.n}
                </div>
                <div className="text-2xl mb-5">{step.icon}</div>
                <h3 className="font-syne font-bold text-xl text-[#eeeae4] mb-3">{step.title}</h3>
                <p className="text-sm text-[rgba(238,234,228,0.45)] leading-relaxed mb-4">{step.body}</p>
                <p className="text-xs text-[rgba(238,234,228,0.25)] leading-relaxed">{step.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-8">
          <div className="bg-[#0a0a0d] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 max-w-md mx-auto">
            <p className="text-[10px] text-[rgba(238,234,228,0.2)] uppercase tracking-widest mb-3">
              El script más simple del mundo
            </p>
            <pre className="text-[11px] text-[rgba(238,234,228,0.5)] leading-loose font-mono">
{`<script>
  window.MEETZYCONFIG = { siteId: `}<span className="text-green-400">"tu-id"</span>{` };
</script>
<script src=`}<span className="text-accent/70">"https://meetzy.ai/widget.js"</span>{` async></script>`}
            </pre>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
