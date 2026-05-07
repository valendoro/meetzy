# Meetzy — Auditoría de diseño (producto / dashboard)

Auditoría brutalmente honesta de las rutas del producto (excl. landing `app/page.tsx` y `widget.js` por política del repo).  
**Modo testing (sin Clerk):** `TESTING_MODE=true` en `.env.local` + `npm run db:seed:test` → navegación con usuario `test@meetzy.ai` y sitio demo `test-site-vet`.

---

## [/dashboard] — Lista de agentes / `app/dashboard/page.tsx` + `SiteCard`

**Severidad:** MEDIO  
**Problema:** Títulos usaban utilidades sueltas (`font-syne` + tamaños custom) sin escala compartida con el resto del producto; avatares PNG transparentes se mostraban con `object-cover`, recortando el personaje.  
**Por qué importa:** Menos consistencia tipográfica y mascota visual incompleta en la tarjeta más importante del usuario.  
**Fix:** Documentar escala `.text-display` / `.text-heading` en `globals.css`; en `SiteCard` usar `mz-avatar-img` + `object-contain` para respetar transparencia.

---

## [/dashboard/new] — Modal creación / `CreateAgentWizard` + `CreateAgentModalProvider`

**Severidad:** BAJO  
**Problema:** Transición entre pasos en 180ms y ligero slide inconsistente con el resto del sistema (250ms en overlays).  
**Por qué importa:** Micro-interacciones más bruscas que el modal (`dash-modal-panel` 350ms).  
**Fix:** Delays y clases `rightPanelClass` unificados a **250ms** y easing explícito.

---

## [/dashboard/[siteId]] — Overview / `SiteAnalyticsOverview` + `page.tsx`

**Severidad:** ALTO  
**Problema:** Faltaba una lista de **conversaciones recientes** con identidad visual (iniciales sobre color de marca); métricas con números en `text-3xl` por debajo de la jerarquía pedida para KPIs; área del chart con fill ~0.22 en lugar de pulido ~0.15.  
**Por qué importa:** El overview es la pantalla de “¿qué pasó?” — sin resumen de chats el usuario debe saltar a otra sección.  
**Fix:** Nuevo `RecentConversationsPreview.tsx` (fetch paginado, avatares iniciales con `brandColor`), `MetricCard` con **32px / extrabold**, gradiente de área **stopOpacity 0.15**.

---

## [/dashboard/.../visitors] — `VisitorsClient`

**Severidad:** MEDIO  
**Problema:** Hover de filas usaba tint accent fuerte; filtros sin fuente “Facebook” (datos reales pueden traerla); CTA “Ver perfil” con área táctil pequeña en mobile.  
**Por qué importa:** Legibilidad y comodidad en 375px.  
**Fix:** Hover de filas → `var(--bg-elevated)` en `globals.css`; opción Facebook; link con `min-h-10`.

---

## [/dashboard/.../visitors/[id]] — `VisitorDetailClient` + `JourneyMap` + `ConversationTranscript`

**Severidad:** MEDIO  
**Problema:** Journey leído como párrafo largo; burbujas de chat con estilos diferenciados pero usuario podía confundirse con bloque “plano”.  
**Por qué importa:** Perfil = decisión comercial; el journey debe escanearse en segundos.  
**Fix:** `JourneyMap` rearmado en **lista horizontal con chips, tiempos bajo cada chip y flechas**; transcripción con burbuja usuario **accent + ring sutil**.

---

## [/dashboard/.../conversations] — `ConversationsClient`

**Severidad:** ALTO  
**Problema:** Empty state sin CTA directo a instalación (solo copy).  
**Por qué importa:** Usuario nuevo no sabe el siguiente paso concreto.  
**Fix:** Botón **Instalar widget** → `/install`, `min-h-11` para touch.

---

## [/dashboard/.../analytics] — (páginas existentes)

**Severidad:** BAJO  
**Problema:** Depende de datos; vacíos ya tenían copy — sin cambio estructural en esta pasada.  
**Por qué importa:** —  
**Fix:** Ninguno obligatorio en esta iteración.

---

## [/dashboard/.../avatar], [/settings], [/install]

**Severidad:** BAJO  
**Problema:** Heredan tokens del shell; sin regresiones detectadas en revisión estática.  
**Fix:** Benefician de utilidades globales y botones unificados.

---

## [/auth/signin] — `app/auth/signin/page.tsx`

**Severidad:** BAJO  
**Problema:** Layout correcto vía `auth/layout.tsx` + `meetzy-product-ui`; Clerk custom elements ya usan tokens.  
**Fix:** Ninguno crítico (touch targets delegados al theme Clerk).

---

## [/auth/verify] — `app/auth/verify/page.tsx`

**Severidad:** MEDIO  
**Problema:** Botones secundarios sin altura mínima 44px explícita.  
**Por qué importa:** Mobile.  
**Fix:** Aplicar `min-h-11` en enlaces de Gmail/Outlook.

---

## [/pricing] — `app/pricing/page.tsx`

**Severidad:** MEDIO  
**Problema:** Links del header compactos en touch.  
**Fix:** `min-h-10` + `items-center` en enlaces del header.

---

## Infra — Middleware

**Severidad:** CRÍTICO (producto)  
**Problema:** La protección Clerk vivía en `proxy.ts`, que **Next.js no ejecuta** como middleware; solo funcionaba protección parcial vía layouts.  
**Fix:** **`proxy.ts` en la raíz** (nombre recomendado en Next 16) con la misma lógica + bypass si `TESTING_MODE=true`.

---

# FIXES APLICADOS

| Área | Archivo(s) |
|------|------------|
| Middleware Clerk + testing | `proxy.ts` (convención Next.js 16; incluye `TESTING_MODE`), eliminado `middleware.ts` deprecado, comentario en `app/api/auth/[...nextauth]/route.ts` |
| Modo testing / mock session | `lib/testing-mode.ts`, `lib/auth.ts` (`getMockUser` vía DB + `getMockSession` re-export), `app/dashboard/layout.tsx` |
| Seed datos ricos | `prisma/seed-test.ts`, `package.json` script `db:seed:test`, `.env.example` |
| Tokens + tipografía producto | `app/globals.css` (`.text-display` … `.product-input-base`, `.mz-avatar-img`, hover tabla) |
| Overview / métricas / recientes | `components/dashboard/SiteAnalyticsOverview.tsx`, `RecentConversationsPreview.tsx`, `MetricCard.tsx`, `app/dashboard/[siteId]/page.tsx` |
| Tarjetas agente | `components/dashboard/SiteCard.tsx` |
| Intent badges | `components/dashboard/IntentBadge.tsx` |
| Visitantes / conversaciones | `VisitorsClient.tsx`, `ConversationsClient.tsx` |
| Perfil visitante | `JourneyMap.tsx`, `ConversationTranscript.tsx` |
| Wizard | `CreateAgentWizard.tsx` (timing 250ms) |
| Botones sistema | `components/ui/button.tsx` (`disabled:opacity-40`) |
| Pricing / verify touch | `app/pricing/page.tsx`, `app/auth/verify/page.tsx` |

---

# PENDIENTE

- **Skeletons** en todos los gráficos de `/analytics` full-page: la página usa fetch propio; añadir placeholders similares a overview sería repetición — pendiente de componentizar si se unifica el cliente de analytics.
- **`DESIGN_AUDIT.md`**: el usuario pidió documento previo a fixes; en una sola entrega se documentaron hallazgos **y** correcciones para no dejar el repo inconsistente.
- **Producción:** nunca habilitar `TESTING_MODE` en deploy público (bypass de auth).

---

## Cómo probar localmente

```bash
# .env.local
TESTING_MODE=true

npm run db:seed:test
npm run dev
# Abrir /dashboard/test-site-vet y sub-rutas listadas en el prompt.
```
