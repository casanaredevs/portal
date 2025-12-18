# Guía Rápida de Estilo (ADMIN-STYLE)

Esta guía resume los criterios de tipografía, espaciado y uso de tamaños relativos para mantener consistencia y accesibilidad en el portal de administración / UI interna.

## 1. Principios Generales
- Usar unidades relativas (rem, em) y utilidades Tailwind estándar (p-4, text-sm, rounded-md, etc.).
- Evitar `px` arbitrarios en clases utilitarias. Si se requiere un ajuste fino excepcional, documentarlo con comentario `/* reason */`.
- Preferir escalas definidas antes que valores ad‑hoc: tipografía, espaciado, radios, sombras.
- Mantener contraste suficiente (WCAG AA) y foco visible (`focus-visible:*`, `ring-*`).
- Reutilizar componentes (Button, Input, Toggle, Select, Sidebar, etc.) en lugar de recrear variantes locales.

## 2. Escala Tipográfica
| Uso / Token        | Clase Tailwind (base 16px) | Notas |
|--------------------|----------------------------|-------|
| Display / Hero     | `text-4xl sm:text-5xl`     | Títulos principales (landing / hero). |
| Title / H1         | `text-3xl`                 | Para páginas raíz del módulo. |
| H2 Sección         | `text-xl` o `text-2xl`     | Elegir según jerarquía visual. |
| H3 / Bloques       | `text-base` / `text-lg`    | Sub-secciones. |
| Body principal     | `text-base` (1rem)         | Texto de lectura normal. |
| Body secundaria    | `text-sm` (0.875rem)       | Descripciones, meta secundaria. |
| Meta / Soporte     | `text-xs` (0.75rem)        | Etiquetas, counters livianos. |
| Micro (raro)       | `text-micro` (0.625rem)    | Sólo chips / badges densos. Prohibido usar `text-[0.625rem]` directo. |

Reglas:
- Unificar tamaños pequeños previos (9px, 10px, 11px) en `text-xs` (0.75rem) o `text-micro` según legibilidad.
- No introducir nuevos tamaños arbitrarios sin revisar impacto en legibilidad (menor a 0.625rem se evita).
- `text-[0.625rem]` queda expresamente prohibido: usar siempre `text-micro`.

## 3. Espaciado
Usar la escala Tailwind estándar (0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16...). Ejemplos:
- Secciones principales: `py-16`, `py-24` en landing / hero.
- Bloques internos: `p-4`, `p-5`, `p-6` según densidad.
- Gaps en grids / flex: `gap-4`, `gap-6` (reducir a `gap-2` en chips o grupos densos).

Evitar `mt-[13px]` → normalizar (p.ej. `mt-3` o `mt-4`).

## 4. Border Radius
- Usar utilidades estándar: `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`.
- Tokens internos en `app.css` pueden usar `px` para cálculos de variables (aceptable). No aplicar arbitrarios en componentes.
- Chips / Badges: `rounded-full` o `rounded-md` según forma.

## 5. Focus, Accesibilidad y Estados
- Anillos de foco: usar `focus-visible:ring-2 focus-visible:ring-<color>` (ya estandarizado reemplazando `ring-[3px]`).
- En modo error: añadir `aria-invalid` + clases condicionales (`aria-invalid:border-destructive`).
- Evitar remover outline sin proporcionar anillo alternativo.

## 6. Colores y Contraste
- Preferir variables de tema / tokens (`bg-neutral-900`, `text-neutral-50`, `dark:*`).
- Para estados: success, warning, danger → seguir esquema existente (`bg-green-600`, `text-fuchsia-700`, etc.).
- No introducir colores hex directos si hay equivalente semántico.

## 7. Componentes Comunes (Patrones)
| Componente | Padding / Size | Tipografía | Notas |
|------------|----------------|-----------|-------|
| Button (default) | `h-9 px-4` | `text-sm font-medium` | Usa variantes (default, outline, ghost...). |
| Input / Select    | `h-9 px-3 py-2` | `text-sm` | Anillo de foco consistente. |
| Badge (small)     | `px-2 py-0.5` | `text-micro uppercase tracking-wide` | Sólo micro contexto. |
| Card / Panel      | `p-4` / `p-5` / `p-6` | Heading `text-base` / `text-lg` | Elevación suave (`shadow-sm`). |
| Sidebar Items     | `p-2 h-8` | `text-sm` | Colapsables: icon-only mantiene altura. |

## 8. Micro Tipografía (Uso Estricto)
`text-micro` reservado para:
- Etiquetas muy compactas dentro de chips / badges
- Badges de estado en listados (si el espacio es crítico)
No usar para texto interactivo o enlaces. Evitarlo si `text-xs` mantiene la densidad sin perder legibilidad.

Motivación: eliminado el uso directo de `text-[0.625rem]` para impedir proliferación de arbitrarios y centralizar line-height (en `app.css`).

## 9. Conversión Rápida (px → rem @16px)
| px | rem | Adoptar |
|----|-----|---------|
| 9  | 0.5625 | Normalizar a 0.625 (`text-micro`) o 0.75 (`text-xs`) |
| 10 | 0.625  | `text-micro` o subir a `text-xs` si la densidad no es crítica |
| 11 | 0.6875 | Redondear a `text-xs` (0.75) |
| 12 | 0.75   | `text-xs` |

## 10. Cuándo se Permite un Arbitrario
Permitido sólo si:
1. Es un gradiente / clip-path complejo o una expresión CSS que no tiene equivalente utilitario.
2. Es parte de un cálculo de token (`calc(var(--radius) - 2px)` en capa de diseño, no en marcado del componente).
3. Se añade una clase rara en un PR pequeño y va acompañada de justificación en el diff.

En estos casos, documentar brevemente en el PR con: `<!-- justificación: ... -->`.

## 11. Ejemplos Antes / Después
```diff
- <span class="text-[11px] font-medium">Etiqueta</span>
+ <span class="text-xs font-medium">Etiqueta</span>

- <div class="focus-visible:ring-[3px] ...">...
+ <div class="focus-visible:ring-2 ...">...

- <span class="text-[10px] uppercase tracking-wide">meta</span>
+ <span class="text-micro uppercase tracking-wide">meta</span> (si realmente se necesita micro) o mejor subir a text-xs.

- <span class="text-[0.625rem]">X</span>
+ <span class="text-micro">X</span>
```

## 12. Proceso para Revisar PRs
Checklist mínimo en cada PR de UI:
- [ ] ¿Algún `text-[0.625rem]`? (rechazar; reemplazar por `text-micro`)
- [ ] ¿Algún otro `text-[...rem|px]` no documentado? (cuestionar)
- [ ] ¿Se mantienen focus states visibles?
- [ ] ¿Se usan variantes de componentes existentes?
- [ ] ¿Contraste verificado (al menos manualmente) si se introducen nuevos fondos / textos?

Tip: búsqueda rápida local: `grep -R "text-\[0.625rem\]" resources/js` debe devolver 0 resultados.

## 13. Próximos Ajustes Recomendados (Opcional)
- (Hecho) Crear utilidad personalizada `text-micro` y eliminar uso directo de `text-[0.625rem]`.
- Centralizar tokens tipográficos (crear archivo `tokens.css` o config extend si se amplía la escala).
- Auditoría de contraste automatizada (storybook + axe) futura.

## 14. Resumen
La meta: eliminar deuda visual y garantizar escalabilidad. Usa la escala, reutiliza componentes y justifica las excepciones. Esta guía debe mantenerse viva conforme evolucione la UI.

---
Última actualización: 2025-10-01
