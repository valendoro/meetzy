---
name: meetzy-ui
description: >-
  Sistema visual Meetzy derivado del registro awesome-design-skills: vidrio + narrativa +
  lienzo inmersivo (Syne/DM Sans, neo‑noir). Usar en todo UI de producto y onboarding.
license: MIT
metadata:
  based_on: https://github.com/bergside/awesome-design-skills
  composite_slugs: glassmorphism, storytelling
---

# Meetzy UI — Design skill (proyecto)

## Mission

Implementar interfaces **coherentes, accesibles y listas para producción** siguiendo la metodología de [awesome-design-skills](https://github.com/bergside/awesome-design-skills): *foundations → componentes → estados → a11y → tone → anti‑patrones → QA*.  
Este skill **no** copia fuentes ni paletas genéricas de los slugs del registro; **fusiona principios** (vidrio, jerarquía, viaje por pasos) con la identidad ya definida en el código (`meetzy-onboarding-root`, `meetzy-product-ui`, tokens `--ob-*`).

## Brand

Meetzy es un agente conversacional para marcas: la UI debe transmitir **claridad técnica**, **calidez humana** y un **momento memorable** cuando el avatar “cobra vida”. Superficies oscuras, acentos violeta + ámbar de señal, sin ruido decorativo innecesario.

## Style foundations

| Área | Regla |
|------|--------|
| **Visual** | Lienzo continuo oscuro; capas translúcidas (glass); bordes luminosos sutiles; profundidad con sombra y blur, no con más contenedores. |
| **Display** | `font-family: Syne` — títulos, badges, progreso. Peso 700–800, tracking ajustado en mayúsculas cortas. |
| **Cuerpo** | `DM Sans` (variable `--font-dm-sans` / product shell) — copy largo, labels, inputs. |
| **Mono** | JetBrains Mono solo para valores técnicos (hex, IDs, snippets). |
| **Color** | Fondo `#040405` onboarding; texto `#f7f4ef`; acentos oro champagne `--ob-gold` / `--ob-champagne` (no bloques enteros); violeta solo como luz secundaria. |
| **Espaciado** | Escala 4/8/12/16/24/32; respiración generosa en onboarding fullscreen. |
| **Motion** | Reforzar jerarquía y feedback; duraciones ~200–400ms para UI; loops lentos (aurora, respiración) solo si `prefers-reduced-motion: no-preference`. |

## Component families

### Dashboard (`.meetzy-product-ui`)

- **Sidebar** (`.product-sidebar-shell`, `.product-sidebar-link`) y **tabs** (`.product-tabs-rail`): gradiente champagne–índigo en ítem activo, hover suave.
- **Tarjetas** (`.product-site-card`, `.product-stat-rail`): vidrio multicapa, sombra `--shadow-premium-card`, borde fino.
- **Empty** (`.product-empty-state`): lienzo con brillo superior violeta.
- **Usuario / plan** (`.product-user-panel`, `.product-plan-pill`): inset highlight tipo joya.

### Vidrio (`.ob-glass`)

- **Anatomía**: gradiente translúcido, `backdrop-filter: blur`, borde 1px claro, highlight interno superior.
- **Estados**: hover más brillo de borde; `focus-visible` en controles hijos, no solo en el contenedor.
- **No**: opacidad de texto &lt; 0.35 para contenido que debe leerse (usar 0.45+ o “muted” dedicado).

### Tiles seleccionables (`SelectableTile`, cards de onboarding)

- **Estados**: default, hover, `focus-visible` (anillo visible), selected (borde ámbar + sombra), disabled.
- **Teclado**: `Tab` entre opciones; `Enter`/`Space` activa.
- **Touch**: target mínimo ~44px en altura útil.

### Escenario / stage (`.ob-stage-*`)

- Aurora y rejilla son **atmosfera**; el avatar sigue siendo el foco. No competir con contraste del personaje.

### Progreso narrativo

- Un paso = un capítulo: copy corto, título de capítulo opcional (Milo), barra o rail coherente con el mismo `current/total`.

## Accessibility (WCAG 2.2 AA — criterios verificables)

- Contraste texto normal ≥ 4.5:1; grande ≥ 3:1 donde aplique.
- Todos los controles interactivos con **`:focus-visible`** claramente distinto del hover.
- **Reducir movimiento**: si `prefers-reduced-motion: reduce`, desactivar o acortar animaciones decorativas (aurora, float, breathe loops).
- Imágenes decorativas `alt=""`; ilustraciones con significado: `alt` descriptivo breve.
- Formularios: `label` asociado o `aria-label` en swatches de color.

## Writing tone (producto en español)

- **Rioplatense natural**, entusiasta, **una pregunta por turno** en onboarding.
- Microcopy de botones: verbos claros (“Siguiente”, “Generar mi agente”, “Analizar”).
- Evitar jerga interna (“schema”, “endpoint”) salvo pantallas técnicas explícitas.

## Rules: do

- Preferir **tokens CSS** (`--ob-gold`, `--stage-brand`, variables en `:root` / `.meetzy-product-ui`) sobre hex sueltos en JSX.
- Preservar **jerarquía**: un foco visual principal por viewport.
- Estados de interacción **explícitos** en código (clases `focus-visible`, `disabled`, `aria-busy` donde corresponda).

## Rules: don't

- No mezclar una tercera familia tipográfica “por defecto” (Inter/Roboto como base).
- No bloques enteros de texto puro `<div>` sin landmarks cuando armás una pantalla nueva (usar `header`, `main`, `section`, headings en orden).
- No animar solo por ornamentación si empeora lectura o VR.
- No CTAs competidoras al mismo nivel visual sin prioridad clara.

## Quality gates (review / PR)

- [ ] ¿Hay token o variable para cada color nuevo?
- [ ] ¿Focus visible en teclado en todos los interactuables nuevos?
- [ ] ¿`prefers-reduced-motion` cubierto para animaciones nuevas &gt; 0.3s o infinitas?
- [ ] ¿Contraste de texto revisado en tema oscuro?
- [ ] ¿Copy en voz Meetzy (una pregunta, claro, humano)?

## Referencia al registro

Para añadir *otros* dialectos (p. ej. brutalism, neobrutalism) usá el CLI del registro; **no sustituyas** esta identidad sin actualizar este SKILL y los tokens globales.

```bash
npx typeui.sh pull glassmorphism -p cursor
```

Pull consciente: revisá `SKILL.md` importado y **reconciliá** con `meetzy-ui` antes de mezclar patrones visuales incompatibles.
