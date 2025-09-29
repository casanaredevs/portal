# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres (where sensible) to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- (placeholder) Nuevas funcionalidades pendientes de documentar.

---

## [0.1.0] - 2025-09-29
### Added
- Implementación completa de sistema de Roles & Permisos usando `spatie/laravel-permission`.
  - Enum central `App\\Permissions\\Permission` como fuente única de verdad de permisos.
  - Mapa `RolePermissions::MAP` para asignación declarativa de permisos por rol (`admin`, `moderator`, `member`).
  - Seeder `RolesAndPermissionsSeeder` idempotente sincronizando roles y permisos desde enum/mapa.
  - Asignación automática de rol `member` al crear usuario (hook en `User::booted`).
  - Comando `permissions:sync` con opción `--prune` para eliminar roles/permisos huérfanos.
  - Comando `permissions:export` que genera `resources/js/lib/permissions.generated.ts` para consumo tipado en frontend.
  - Integración Inertia: se comparten `auth.roles` y `auth.permissions` a todas las vistas.
  - Helper frontend `permissions.ts` + componente `Can` y hook `usePermissions()`.
  - Scripts npm `predev`, `prebuild`, `prebuild:ssr` ejecutan exportación automática de permisos.
  - Tests: `RolesPermissionsTest` y `PermissionsSyncCommandTest` cubren asignaciones, middleware, sync y prune.
- Documentación actualizada en `README.md` (nueva sección de Roles y Permisos) y guía operativa en `app/Permissions/README.md`.

### Changed
- Ajuste de `AppServiceProvider` para exponer roles/permisos al frontend.
- Actualización de `DatabaseSeeder` para crear usuario de prueba con rol `admin` y ejecutar el seeder de roles/permisos primero.

### Notes
- Versión marcada como `0.1.0` al introducir control de autorización granular; antes se manejaba únicamente autenticación básica.
- Próximo paso recomendado: añadir Policies por modelo y pipeline CI que verifique drift (`permissions:sync --prune && permissions:export`).

[Unreleased]: ./CHANGELOG.md#unreleased
[0.1.0]: ./CHANGELOG.md#010---2025-09-29

