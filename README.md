# MEETZY

**Tu web. Tu agente. Tu marca.**

El primer agente AI que toma la identidad visual de tu negocio. No un chatbot genérico — el alma de tu marca, viva en tu web.

## Stack técnico

- **Next.js 14** App Router + TypeScript estricto
- **Tailwind CSS** + diseño custom dark premium
- **PostgreSQL** + Prisma ORM v7
- **Upstash Redis** (rate limiting + cache)
- **OpenAI GPT-4o** (agente + scraping + generación UI dinámica)
- **ElevenLabs API** (text-to-speech Plan Elite)
- **Simli.ai API** (avatar lip sync Plan Elite)
- **NextAuth.js v5** (Google OAuth + magic link email)
- **Stripe** (billing + webhooks)
- **Cheerio** (scraping)
- **esbuild** (bundle del widget <30kb)
- **Railway** (deploy target)

## Setup local

### 1. Clonar y dependencias

```bash
git clone <repo>
cd meetzy
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Completá todas las variables en `.env` (ver sección de variables).

### 3. Base de datos

Con PostgreSQL corriendo localmente o en Railway:

```bash
npx prisma db push
npm run db:seed   # opcional: datos de ejemplo
```

### 4. Build del widget

```bash
npm run build:widget
```

Genera `public/widget.js` (~27kb minificado).

### 5. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/meetzy

# Upstash Redis (https://upstash.com)
REDIS_URL=https://xxx.upstash.io
REDIS_TOKEN=your_token

# OpenAI
OPENAI_API_KEY=sk-...

# ElevenLabs (Plan Elite)
ELEVENLABS_API_KEY=...

# Simli.ai (Plan Elite)
SIMLI_API_KEY=...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe (https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ELITE_PRICE_ID=price_...

# Resend (email magic link)
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=https://app.meetzy.ai
```

---

## Deploy en Railway

### 1. Crear proyecto en Railway

```bash
railway login
railway init
railway add --database postgresql
```

### 2. Variables de entorno en Railway

Copiar todas las variables del `.env.example` al panel de Railway.

### 3. Build command

```bash
npm run build
```

El `package.json` ya incluye `build:widget` antes del `next build`.

### 4. Start command

```bash
npm start
```

### 5. Stripe webhook

En [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks), agregar endpoint:

```
https://app.meetzy.ai/api/webhooks/stripe
```

Eventos a escuchar:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Arquitectura

```
/app
  /api
    /auth/[...nextauth]   → NextAuth handlers
    /chat                 → Chat streaming + function calling
    /scrape               → Scraping + GPT system prompt
    /sites                → CRUD de sitios
    /sites/[siteId]/config  → Config pública (para widget)
    /sites/[siteId]/analytics → Métricas + top preguntas
    /stripe/checkout      → Crear sesión de pago
    /webhooks/stripe      → Webhook billing

  /dashboard              → Panel principal
    /new                  → Onboarding wizard
    /[siteId]             → Detalle + script install
    /[siteId]/conversations → Transcripts
    /[siteId]/avatar      → Configurador de avatar
    /[siteId]/settings    → Configuración del agente

  /auth/signin            → Login (Google + magic link)
  /pricing                → Página de planes
  /                       → Landing page

/components
  /avatar/AvatarCanvas   → Motor de avatar Canvas 2D
  /dashboard/*            → Componentes del panel
  /landing/*              → Secciones de la landing

/lib
  prisma.ts               → Cliente de base de datos
  openai.ts               → Cliente + tools de función
  redis.ts                → Rate limiting
  auth.ts                 → NextAuth config
  stripe.ts               → Cliente Stripe + planes
  scraper.ts              → Cheerio + GPT scraping
  elevenlabs.ts           → Text-to-speech
  simli.ts                → Lip sync

/widget-src
  index.ts                → Widget principal (Shadow DOM)
  avatar-renderer.ts      → AvatarRenderer para el widget
  ui-generator.ts         → Render de UI dinámica
  voice-handler.ts        → Web Speech API + audio

/public
  widget.js               → Widget bundleado (esbuild)
```

---

## Instalación del widget

```html
<script>
  window.MEETZYCONFIG = { siteId: "TU_SITE_ID" };
</script>
<script src="https://app.meetzy.ai/widget.js" async></script>
```

Compatible con: HTML, Webflow, WordPress, Shopify, cualquier web.

---

## Planes

| Feature | Starter $29 | Pro $79 | Elite $199 |
|---------|-------------|---------|------------|
| Chat texto | ✓ | ✓ | ✓ |
| Scraping automático | ✓ | ✓ | ✓ |
| Avatar 2D animado | ✗ | ✓ | ✓ |
| UI dinámica | ✗ | ✓ | ✓ |
| Voz (ElevenLabs) | ✗ | ✗ | ✓ |
| Lip sync (Simli) | ✗ | ✗ | ✓ |
| Booking Cal.com | ✗ | ✗ | ✓ |
| White-label | ✗ | ✗ | ✓ |
| Sitios | 1 | 3 | ∞ |
| Conversaciones/mes | 500 | 2.000 | ∞ |

---

## Licencia

Propietario. © 2024 Meetzy.
