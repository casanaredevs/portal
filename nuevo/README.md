# Casanare Devs Portal – Perfil y Stack Tecnológico (Módulo Base)

Este documento resume la implementación actual del módulo de Perfiles, Stacks Tecnológicos y Perfiles Externos.

## Contenido
- [Modelo de Datos](#modelo-de-datos)
- [Enums](#enums)
- [Migraciones Clave](#migraciones-clave)
- [Servicios](#servicios)
- [Comando Artisan](#comando-artisan)
- [Endpoints / Rutas](#endpoints--rutas)
- [Privacidad](#privacidad)
- [Validación y Sanitización](#validación-y-sanitización)
- [Tests](#tests)
- [Próximos Pasos Sugeridos](#próximos-pasos-sugeridos)
- [Requisitos de Entorno](#requisitos-de-entorno)

## Modelo de Datos
Tablas nuevas / extendidas:
- `users` (campos agregados): `username`, `display_name`, `bio (<=280)`, `about`, `location_city`, `location_country (ISO2)`, `availability (json)`, `privacy (json)`
- `technologies`: catálogo controlado
- `skills`: relación enriquecida usuario–tecnología (`level`, `years_experience`, `position`, `visibility`)
- `external_profiles`: perfiles/redes externas con normalización y orden.

## Enums
Ubicación: `App\Enums`
- `SkillLevel`: `learning`, `intermediate`, `advanced`
- `SkillVisibility`: `public`, `members`, `private`
- `TechnologyCategory`: `frontend`, `backend`, `devops`, `mobile`, `data`, `testing`, `cloud`
- `ExternalPlatform`: listado de plataformas soportadas

## Migraciones Clave
Archivo | Descripción
------- | -----------
`2025_09_27_100000_add_profile_fields_to_users_table` | Campos de perfil extendido
`2025_09_27_100100_create_technologies_table` | Catálogo de tecnologías
`2025_09_27_100200_create_skills_table` | Relación usuario–tecnología
`2025_09_27_100300_create_external_profiles_table` | Perfiles externos

## Servicios
- `App\Services\ExternalProfileNormalizer`: genera/normaliza URL y handle por plataforma.

## Comando Artisan
- `profiles:backfill-usernames [--dry-run]`: genera usernames faltantes. Útil antes de hacer `username` NOT NULL.

## Endpoints / Rutas
Ruta | Método | Descripción | Auth | JSON | Notas
---- | ------ | ----------- | ---- | ---- | -----
`/u/{username}` | GET | Perfil público | Opcional | Sí | Devuelve campos según privacidad
`/profile` | PATCH | Actualizar perfil | Sí | Sí | Auto-sugiere `username` si falta
`/skills` | GET | Listar skills usuario | Sí | Sí | Ordenadas por `position`
`/skills` | POST | Crear skill | Sí | Sí | Evita duplicado (constraint)
`/skills/{id}` | PATCH | Actualizar skill | Sí | Sí | Nivel, visibilidad, años
`/skills/{id}` | DELETE | Eliminar skill | Sí | Sí | —
`/skills/reorder` | POST | Reordenar skills | Sí | Sí | Requiere lista completa
`/external-profiles` | GET | Listar perfiles externos | Sí | Sí | Orden por `position`
`/external-profiles` | POST | Crear perfil externo | Sí | Sí | Normaliza URL / handle
`/external-profiles/{id}` | PATCH | Actualizar perfil externo | Sí | Sí | Re-normaliza si cambia plataforma/handle/url
`/external-profiles/{id}` | DELETE | Eliminar perfil externo | Sí | Sí | —
`/external-profiles/reorder` | POST | Reordenar perfiles externos | Sí | Sí | Lista completa

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
- Elimina bloques `<script>` y atributos inline `on*`.
- Bloquea `javascript:` URIs.
- Permite subconjunto: `p, br, ul, ol, li, strong, b, em, i, code, pre, a`.

## Tests
Categoría | Archivo | Cobertura principal
--------- | ------- | ------------------
Unidades | `tests/Unit/ProfileModelsTest.php` | Relaciones y orden
Perfil público | `tests/Feature/Profile/ProfileShowTest.php` | Show + 404
Skills CRUD | `tests/Feature/Skill/SkillCrudTest.php` | Crear, duplicado, update, delete, reorder
Profiles externos | `tests/Feature/ExternalProfile/ExternalProfileCrudTest.php` | CRUD + reorder
Privacidad / Sanitización | `tests/Feature/Profile/ProfilePrivacyAndSanitizeTest.php` | Privacidad, limpieza de HTML, auto username
Comando | `tests/Feature/Console/BackfillUsernamesTest.php` | Backfill y dry-run

(NOTA: Ejecutar tests requiere PHP >= 8.2, ver siguiente sección.)

## Próximos Pasos Sugeridos
1. Actualizar entorno a PHP 8.2+ y ejecutar:
   ```bash
   composer install
   php artisan migrate --seed
   php artisan test
   ```
2. Ejecutar `php artisan profiles:backfill-usernames` y luego crear migración para hacer `users.username` NOT NULL.
3. Añadir índice opcional `skills(technology_id)` si se implementa búsqueda inversa masiva.
4. Integrar UI (Inertia) para edición visual y reordenamiento (drag & drop).
5. Mejorar sanitización con librería (opc: `league/commonmark` + purificador) si se permitirá Markdown extendido.
6. Añadir caching de catálogo de tecnologías.
7. Endpoint de sugerencias de tecnologías (búsqueda por `name` y `synonyms`).
8. Añadir verificación de perfiles externos (futuro).

## Requisitos de Entorno
- PHP >= 8.2 (Composer fallará en 8.1.x)
- SQLite para desarrollo (archivo `database/database.sqlite` ya presente)
- Extensiones recomendadas: `mbstring`, `pdo_sqlite`, `json`

### Actualizar PHP (Windows / Chocolatey)
```powershell
choco upgrade php --version=8.2.21
php -v
```

### Opcional: Docker + Sail
```bash
php artisan sail:install
./vendor/bin/sail up -d
./vendor/bin/sail php artisan migrate --seed
./vendor/bin/sail php artisan test
```

---
**Estado actual:** Código del módulo listo; pendiente sólo ejecutar migraciones y tests una vez se actualice PHP.

