# Casanare Devs Portal – Perfil y Stack Tecnológico (Módulo Base)

Este documento resume la implementación actual del módulo de Perfiles, Stacks Tecnológicos, Perfiles Externos y el sistema de Roles & Permisos.

## Contenido
- [Modelo de Datos](#modelo-de-datos)
- [Enums](#enums)
- [Migraciones Clave](#migraciones-clave)
- [Servicios](#servicios)
- [Roles y Permisos](#roles-y-permisos)
- [Comandos Artisan](#comandos-artisan)
- [Endpoints / Rutas](#endpoints--rutas)
- [Privacidad](#privacidad)
- [Validación y Sanitización](#validación-y-sanitización)
- [Integración Frontend (Autorización)](#integración-frontend-autorización)
- [Tests](#tests)
- [Próximos Pasos Sugeridos](#próximos-pasos-sugeridos)
- [Requisitos de Entorno](#requisitos-de-entorno)

## Modelo de Datos
Tablas nuevas / extendidas:
- `users` (campos agregados): `username`, `display_name`, `bio (<=280)`, `about`, `location_city`, `location_country (ISO2)`, `availability (json)`, `privacy (json)`
- `technologies`: catálogo controlado
- `skills`: relación enriquecida usuario–tecnología (`level`, `years_experience`, `position`, `visibility`)
- `external_profiles`: perfiles/redes externas con normalización y orden.
- (Roles & Permisos) Tablas del paquete `spatie/laravel-permission`: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`.

## Enums
Ubicación: `App\Enums`
- `SkillLevel`: `learning`, `intermediate`, `advanced`
- `SkillVisibility`: `public`, `members`, `private`
- `TechnologyCategory`: `frontend`, `backend`, `devops`, `mobile`, `data`, `testing`, `cloud`
- `ExternalPlatform`: listado de plataformas soportadas

Ubicación: `App\Permissions`
- `Permission` (enum central de permisos del sistema)
- `RolePermissions` (mapa rol => permisos / `'*'` para todos)

## Migraciones Clave
Archivo | Descripción
------- | -----------
`2025_09_27_100000_add_profile_fields_to_users_table` | Campos de perfil extendido
`2025_09_27_100100_create_technologies_table` | Catálogo de tecnologías
`2025_09_27_100200_create_skills_table` | Relación usuario–tecnología
`2025_09_27_100300_create_external_profiles_table` | Perfiles externos
`2025_09_29_202905_create_permission_tables` | Tablas base de roles y permisos (Spatie)

## Servicios
- `App\Services\ExternalProfileNormalizer`: genera/normaliza URL y handle por plataforma.

## Roles y Permisos
Implementado con `spatie/laravel-permission` + capa de fuente única de verdad:
- Enum `App\Permissions\Permission`: define TODOS los permisos disponibles.
- Clase `App\Permissions\RolePermissions::MAP`: asigna permisos a roles. El rol `admin` usa `'*'` (todos los permisos enumerados).
- Seeder `RolesAndPermissionsSeeder` sincroniza roles y permisos desde la enum/mapa.
- Modelo `User` usa el trait `HasRoles` y asigna automáticamente rol `member` al crearse (si existe).
- Comandos para sincronizar y exportar (ver sección de Comandos).
- Tests cubren asignaciones y middleware.

Permisos actuales (descripción breve):
- `events.*`: crear / editar / eliminar / publicar / registrar.
- `skills.add`, `skills.moderate`.
- `technologies.manage`.
- `users.manage` (solo admin).
- `external-profiles.sync`.

Flujo para añadir un permiso nuevo:
1. Agregar `case` en enum `Permission` (PHP).
2. (Opcional) Añadirlo al rol deseado en `RolePermissions::MAP` (si no, solo admin lo hereda si usa `'*'`).
3. Ejecutar:
   ```bash
   php artisan permissions:sync
   php artisan permissions:export
   ```
4. Usar en backend: `can(Permission::NuevoPermiso->value)` o middleware `permission:nuevo.permiso`.
5. Usar en frontend: `PERMISSIONS.NUEVO_PERMISO` (tras export). 

Eliminar un permiso:
1. Quitar el `case` y retirarlo de `RolePermissions::MAP`.
2. Ejecutar prune:
   ```bash
   php artisan permissions:sync --prune
   php artisan permissions:export
   ```
3. Remover checks del código / UI.

Añadir un rol:
1. Agregar entrada en `RolePermissions::MAP`.
2. `php artisan permissions:sync && php artisan permissions:export`.
3. Asignar a usuarios (`$user->assignRole('nuevo_rol')`).

Eliminar un rol: quitarlo del mapa y ejecutar `permissions:sync --prune`.

## Comandos Artisan
Comando | Descripción | Notas
--------|-------------|------
`profiles:backfill-usernames [--dry-run]` | Genera usernames faltantes | Prev. a NOT NULL
`permissions:sync [--prune]` | Sincroniza enum y mapa con BD | `--prune` elimina huérfanos
`permissions:export [--path=...]` | Genera `permissions.generated.ts` para frontend | Se ejecuta en pre-scripts npm

Recomendado ejecutar `permissions:sync && permissions:export` tras cualquier cambio en permisos/roles antes de build / deploy.

## Endpoints / Rutas
Ruta | Método | Descripción | Auth | JSON | Notas
---- | ------ | ----------- | ---- | ---- | -----
`/u/{username}` | GET | Perfil público | Opcional | Sí | Según privacidad
`/profile` | PATCH | Actualizar perfil | Sí | Sí | Auto-sugiere username
`/skills` | GET | Listar skills usuario | Sí | Sí | Orden por `position`
`/skills` | POST | Crear skill | Sí | Sí | Evita duplicado
`/skills/{id}` | PATCH | Actualizar skill | Sí | Sí | Nivel/visibilidad/años
`/skills/{id}` | DELETE | Eliminar skill | Sí | Sí | —
`/skills/reorder` | POST | Reordenar skills | Sí | Sí | Lista completa
`/external-profiles` | GET | Listar perfiles externos | Sí | Sí | Orden por `position`
`/external-profiles` | POST | Crear perfil externo | Sí | Sí | Normaliza
`/external-profiles/{id}` | PATCH | Actualizar perfil externo | Sí | Sí | Re-normaliza
`/external-profiles/{id}` | DELETE | Eliminar perfil externo | Sí | Sí | —
`/external-profiles/reorder` | POST | Reordenar perfiles externos | Sí | Sí | Lista completa

(Próximo) Se recomienda agrupar rutas de administración bajo middleware `role:admin|moderator` o permisos específicos.

## Privacidad
Campo JSON `privacy` en `users` con claves: `bio`, `about`, `location`.
Valores: `public` | `members` | `private`.
Filtrado aplicado en `User::toPublicProfileArray($viewer)`.

## Validación y Sanitización
FormRequests:
- `ProfileUpdateRequest`: valida username slug, bio <= 280, country ISO2, estructura availability, privacidad.
- `SkillStoreRequest` / `SkillUpdateRequest` / `SkillReorderRequest`
- `ExternalProfileRequest` / `ExternalProfileReorderRequest`

Sanitización `about`:
- Elimina `<script>` y atributos `on*`.
- Bloquea `javascript:` URIs.
- Permite: `p, br, ul, ol, li, strong, b, em, i, code, pre, a`.

## Integración Frontend (Autorización)
- Compartido por Inertia (en `AppServiceProvider`): `auth.user`, `auth.roles`, `auth.permissions`.
- Archivo generado: `resources/js/lib/permissions.generated.ts` (contiene `PERMISSIONS`, `PermissionString`).
- Helper: `resources/js/lib/permissions.ts` expone `can()`, `hasRole()`, `anyPermission()`, `allPermissions()`, componente `Can` y hook `usePermissions()`.
- Scripts npm `predev`, `prebuild`, `prebuild:ssr` ejecutan `php artisan permissions:export` automáticamente.

Uso ejemplo (frontend):
```tsx
import { PERMISSIONS } from '@/lib/permissions.generated';
import { can, Can } from '@/lib/permissions';

if (can(PERMISSIONS.USERS_MANAGE)) {
  // mostrar botón admin
}

<Can permission={PERMISSIONS.EVENTS_PUBLISH}>
  <PublishButton />
</Can>
```

## Tests
Categoría | Archivo | Cobertura principal
--------- | ------- | ------------------
Unidades | `tests/Unit/ProfileModelsTest.php` | Relaciones y orden
Perfil público | `tests/Feature/Profile/ProfileShowTest.php` | Show + 404
Skills CRUD | `tests/Feature/Skill/SkillCrudTest.php` | Crear, duplicado, update, delete, reorder
Profiles externos | `tests/Feature/ExternalProfile/ExternalProfileCrudTest.php` | CRUD + reorder
Privacidad / Sanitización | `tests/Feature/Profile/ProfilePrivacyAndSanitizeTest.php` | Privacidad, limpieza de HTML, auto username
Comando perfiles | `tests/Feature/Console/BackfillUsernamesTest.php` | Backfill y dry-run
Roles / Permisos | `tests/Feature/RolesPermissionsTest.php` | Asignaciones, middleware, dinámico
Sync / Export | `tests/Feature/PermissionsSyncCommandTest.php` | Comando sync y prune

## Próximos Pasos Sugeridos
1. Añadir Policies para modelos (`Event`, `Skill`, etc.) delegando a permisos (ej. `events.edit`).
2. Proteger rutas sensibles con middleware `permission:` o `role_or_permission`.
3. Panel administrativo para gestión visual de usuarios y roles (futuro).
4. Endpoints públicos cacheados para catálogo de tecnologías (`technologies` caching layer).
5. Markdown enriquecido con librería especializada (si se amplía `about`).
6. Endpoint de sugerencias de tecnologías (búsqueda por `name` / sinónimos).
7. Verificación y badges para perfiles externos.
8. Auditoría de cambios (event log) para acciones sensibles.
9. Pipeline CI: ejecutar `permissions:sync --prune && permissions:export` y fallar si hay drift.

## Requisitos de Entorno
- PHP >= 8.2 (Composer fallará en 8.1.x)
- SQLite para desarrollo (archivo `database/database.sqlite` ya presente)
- Extensiones recomendadas: `mbstring`, `pdo_sqlite`, `json`

### Actualizar PHP (Windows / Chocolatey)
```powershell
choco upgrade php --version=8.2.21
php -v
```

### Flujo de Arranque (desarrollo)
```bash
composer install
php artisan migrate --seed
php artisan permissions:sync
php artisan permissions:export
npm install
npm run dev
```
(El pre-script export generará el archivo de permisos si se omite manualmente.)

### Opcional: Docker + Sail
```bash
php artisan sail:install
./vendor/bin/sail up -d
./vendor/bin/sail php artisan migrate --seed
./vendor/bin/sail php artisan permissions:sync --prune
./vendor/bin/sail php artisan permissions:export
./vendor/bin/sail php artisan test
```

---
**Estado actual:** Módulo de perfiles + roles & permisos integrados; lista la base para añadir Policies y UI de administración.
