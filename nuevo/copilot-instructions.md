# Instrucciones para Agentes AI

Este documento ofrece un panorama técnico y convenciones del proyecto para que cualquier agente (o desarrollador asistido por AI) realice cambios consistentes, seguros y mínimos. Escritas en español (con algunos términos técnicos en inglés tal como aparecen en el código).

---
## 1. Resumen Tecnológico

Backend:
- Laravel 12 (PHP ^8.2)
- Inertia.js (paquete `inertiajs/inertia-laravel` ^2.0)
- Fortify para autenticación avanzada y 2FA (`laravel/fortify`)
- Wayfinder (`laravel/wayfinder`) para generación tipada de ayudas de rutas/acciones en el frontend
- Base de datos SQLite (archivo `database/database.sqlite` en desarrollo). Revisa siempre el archivo .env (si existe) para conocer la configuración del motor en uso.

Frontend:
- React 19 + TypeScript (estricto, `strict: true`)
- Inertia React (`@inertiajs/react`)
- Vite 7 (SSR opcional configurado: entrada `resources/js/ssr.tsx`)
- Tailwind CSS 4 + plugins (`@tailwindcss/vite`, `tailwindcss-animate`)
- Radix UI + Headless UI para componentes accesibles
- Alias TS: `@/*` → `resources/js/*`

Herramientas de Calidad:
- ESLint 9 + `@eslint/js`, plugins React & React Hooks
- Prettier + plugins (organize imports, tailwindcss)
- Laravel Pint (estilo PHP)
- Pest para tests (unit & feature)

Ejecución combinada:
- Script Composer `dev` usa `concurrently` para: `php artisan serve`, cola (`queue:listen`), y `npm run dev` (Vite)
- Script Composer `dev:ssr` agrega servidor SSR (`php artisan inertia:start-ssr`) y logs (`pail`)

---
## 2. Estructura Relevante

```
app/
  Http/Controllers/...         Controladores Laravel (REST + Inertia)
  Http/Requests/...            FormRequest para validaciones
  Models/User.php              Modelo usuario base
resources/js/
  app.tsx                      Boot Inertia + theme init
  ssr.tsx                      Entrada SSR (si se usa)
  pages/                       Páginas Inertia (nombre = ruta lógica)
  layouts/                     Layouts (AppLayout, SettingsLayout, etc.)
  components/                  UI reutilizable y utilidades
  actions/                     Código generado de rutas/acciones tipadas (Wayfinder)
  routes/                      Helpers adicionales de rutas (e.g. verificación email)
  wayfinder/                   Infraestructura generada para tipado de rutas
routes/*.php                   Definición de rutas Laravel (web, auth, settings)
tests/                         Tests Pest (Feature y Unit)
```

Convención de páginas Inertia: la ruta `/settings/profile` renderiza `resources/js/pages/settings/profile.tsx` (minúsculas, jerarquía por carpetas).

---
## 3. Patrón Inertia + Wayfinder

### 3.1. Rutas Backend
- Definidas en `routes/web.php`, `routes/settings.php`, `routes/auth.php`.
- Middleware de autenticación aplicado en grupos.
- Render Inertia: `Inertia::render('settings/profile')` → busca `pages/settings/profile.tsx`.

### 3.2. Helpers Generados (Frontend)
Ejemplo: `resources/js/actions/App/Http/Controllers/Settings/ProfileController.ts` contiene:
- `edit`, `update`, `destroy` con métodos `.url()`, `.form()`, variantes por método HTTP
- Formularios con override de `_method` cuando no es POST puro (`PATCH`, `DELETE` => se simulan vía POST + query/hidden `_method`)

Uso en página:
```tsx
<Form {...ProfileController.update.form()}>
  ...
</Form>
```
(No reinventar manualmente action/method; reutilizar helpers generados.)

### 3.3. Formularios
- `<Form>` viene de `@inertiajs/react`.
- Configuración típica: `preserveScroll`, `data-test` para selectores de test.
- Estados: `processing`, `recentlySuccessful`, `errors` entregados como render-prop.

### 3.4. Head / Títulos
Cada página define `<Head title="..." />`. El título final se compone en `app.tsx`: `"{title} - {APP_NAME}"`.

### 3.5. Theme / Apariencia
`initializeTheme()` se invoca después de `createInertiaApp()` en `app.tsx`. Mantener este orden al modificar el entrypoint.

---
## 4. Validación y Seguridad
- Siempre crear un `FormRequest` (en `app/Http/Requests/...`) para validaciones no triviales.
- Patrón de actualización de perfil: `fill($request->validated())` y comprobación `isDirty('email')` para invalidar verificación.
- Al borrar cuentas: invalidar sesión, regenerar token CSRF, logout antes de `delete()`.
- Para contraseñas: usar reglas `'current_password'` en validaciones destructivas.
- No exponer campos no validados vía `fill()`.

---
## 5. Estilo y Calidad de Código
PHP:
- Ejecutar (o simular) Pint: `vendor/bin/pint` antes de cambios grandes.
JS/TS:
- Lint: `npm run lint` (aplica `--fix`)
- Formato: `npm run format` / verificación `npm run format:check`
- Tipos: `npm run types`

Principio para agentes AI: producir diffs mínimos y consistentes (no reordenar imports si no es necesario, pero Prettier podría hacerlo igual).

---
## 6. Tests
Framework: Pest.
- Ubicar tests de endpoints / páginas en `tests/Feature`.
- Tests unitarios pequeños en `tests/Unit`.
- Comando: `php artisan test` o script composer `composer test` (limpia config antes de correr).  
- Para nuevas rutas autenticadas: usar factories (`UserFactory`) y helpers de login.

Agregar atributos `data-test="..."` en componentes interactivos críticos si se requieren futuros tests.

---
## 7. Tailwind & UI
- Tailwind 4; usar clases utilitarias + primitivas Radix/Headless UI encapsuladas.
- `components/ui/*` contiene wrappers (Button, Input, etc.). Reutilizar en lugar de recrear.
- Orden de clases: Prettier plugin tailwindcss normaliza (evitar reorganizar manualmente).

---
## 8. SSR (Opcional)
- Configurado `ssr: 'resources/js/ssr.tsx'` en `vite.config.ts`.
- Para habilitar durante desarrollo: script `composer run dev:ssr`.
- Si introduces código que depende de `window`, encapsúlalo en chequeos para evitar errores SSR.

---
## 9. Alias y Resolución de Módulos
- TypeScript con `moduleResolution: bundler`.
- Alias `@/` → `resources/js/` (usar para paths internos, evita rutas relativas profundas).
- No modificar `tsconfig.json` sin necesidad; si agregas alias, actualiza también herramientas que lo necesiten (ESLint si procede).

---
## 10. Flujo para Agregar una Nueva Sección (Ejemplo: "Teams")
1. Crear migraciones/modelos si se requiere persistencia.
2. Crear controlador en `app/Http/Controllers/...` con métodos Inertia.
3. Definir rutas en archivo de rutas (p.ej. `routes/web.php` o nuevo). Seguir convención nombres `->name('teams.index')` etc.
4. Crear `FormRequest` para acciones `store/update`.
5. Crear páginas en `resources/js/pages/teams/...`.
6. Generar/Actualizar helpers en `resources/js/actions/...` (Wayfinder):
   - Si Wayfinder se integra automáticamente (ver plugin), asegurarse de correr el proceso que genere código (si requiere script, documentar; hoy se observa ya presente en repo). Mantener estructura y comentarios.
7. Usar `<Form {...TeamsController.store.form()}>` en lugar de codificar action/method manual.
8. Agregar tests Feature (crear, listar, etc.).
9. Ejecutar lint, types, tests antes de finalizar.

---
## 11. Actualización de Dependencias
Composer:
- Respetar versiones con caret. Para bump mayor: evaluar breaking changes de Laravel 12.x.
Node:
- React 19 ya activo; evitar dependencias que no soporten 19.
- Tailwind 4: confirmar compatibilidad de plugins antes de añadir.

Regla: no actualizar en el mismo commit en que introduces features (salvo si la feature depende del update). Hacer commits separados.

---
## 12. Buenas Prácticas para Agentes AI
Do:
- Mantener diffs pequeños y contextuales.
- Añadir tests cuando cambies lógica de negocio o rutas.
- Usar helpers de acciones generadas (`Controller.method.form()`).
- Validar con `composer test` y `npm run types`.
- Seguir patrón de títulos con `<Head>`.
- Añadir `data-test` a botones form críticos.

Don't:
- Reescribir masivamente archivos no relacionados.
- Duplicar lógica de validación en controladores (usar FormRequest).
- Hardcodear URLs cuando existen helpers generados.
- Eliminar comentarios @see/@route generados (se usan como metadata).

---
## 13. Comandos Útiles (Windows cmd)
Instalación inicial:
```
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
```
Desarrollo (frontend + backend + cola):
```
composer run dev
```
SSR (si se necesita):
```
composer run dev:ssr
```
Tests:
```
composer test
```
Lint / formato / tipos:
```
npm run lint
npm run format:check
npm run types
```

---
## 14. Consideraciones de Rendimiento
- Evitar N+1: usar `with()` en consultas si se añaden listados grandes.
- Form submissions: confiar en Inertia para navegación sin recarga completa.
- No introducir librerías pesadas sin justificación (bundle Vite + React 19 ya optimizado).

---
## 15. Accesibilidad
- Reutilizar componentes Radix/Headless UI para focus management.
- Mantener `aria-*` si aplicable; no eliminar props de accesibilidad.

---
## 16. Errores Comunes a Evitar
- Olvidar invalidar email verificado si se cambia el correo.
- Cambiar orden de inicialización de `initializeTheme()`.
- Crear rutas sin nombre (dificulta wrappers y tests).
- Formularios sin usar `Controller.method.form()` (pierdes consistencia y overrides `_method`).

---
## 17. Introducción de Nuevas Variables de Entorno
- Backend: agregar a `.env` y consumir vía `config/*.php`, luego `php artisan config:clear`.
- Frontend: prefijo `VITE_` (ej: `VITE_API_BASE=`) y luego usar `import.meta.env.VITE_API_BASE`.

---
## 18. Flujo de Revisión Final para un Cambio
Checklist antes de abrir PR / finalizar commit:
1. Código PHP formateado (Pint) y sin errores.
2. Lint JS/TS sin errores (`npm run lint`).
3. Tipado correcto (`npm run types`).
4. Tests todos verdes (`composer test`).
5. No hay imports rotos (alias `@/` funcional).
6. Nuevos formularios usan helpers generados.
7. Documentaste cambios relevantes en este archivo si afectan convenciones.

---
## 19. Extensiones Futuras (Ideas)
- Agregar capa de policies/authorization explícita para secciones nuevas.
- Implementar componentes de tabla virtualizada si aparecen listados grandes.
- Añadir pruebas de snapshot ligeras para componentes UI críticos.

---
## 20. Resumen Rápido (TL;DR)
Usa Inertia + helpers generados de Wayfinder, mantén validaciones en FormRequest, conserva títulos `<Head>`, ejecuta lint/types/tests, no hardcodees URLs y procura diffs mínimos.

---
Documento mantenible: actualiza este archivo cuando cambien convenciones clave.

