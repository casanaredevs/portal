# Permisos y Roles (Fuente Única de Verdad)

Este directorio centraliza la definición de **TODOS** los permisos y la asignación base de permisos a roles.

## Archivos clave
- `Permission.php` (enum `Permission`): lista exhaustiva de permisos disponibles en el sistema.
- `Permission.php` (clase `RolePermissions`): mapa `MAP` que asigna roles -> permisos. El valor especial `'*'` significa "todos los permisos definidos en la enum".

## Flujo para AÑADIR un nuevo permiso
1. Editar enum `Permission` y agregar un nuevo `case`, por ejemplo:
   `case ReportsExport = 'reports.export';`
2. (Opcional) Incluir el permiso en los roles relevantes dentro de `RolePermissions::MAP`. Si no lo agregas, solo lo tendrá `admin` (si usa `'*'`).
3. Ejecutar sincronización:
   ```bash
   php artisan permissions:sync
   ```
4. Usar el permiso en código (ejemplos):
   - Autorización: `$user->can(Permission::ReportsExport->value)`
   - Middleware de ruta: `->middleware('permission:'.\App\Permissions\Permission::ReportsExport->value)`
5. (Opcional) Ajustar UI (Inertia) si necesitas mostrar/ocultar elementos según ese permiso.
6. Añadir/actualizar tests de autorización si aplica.

## Flujo para AÑADIR un nuevo rol
1. Agregar entrada en `RolePermissions::MAP`, por ejemplo:
   ```php
   'analyst' => [
       Permission::ReportsExport,
       Permission::ReportsView,
   ],
   ```
2. Sincronizar:
   ```bash
   php artisan permissions:sync
   ```
3. Asignar rol a usuarios (ej.: `User::find(1)->assignRole('analyst');`).
4. Añadir tests si el rol introduce combinaciones nuevas significativas.

## Flujo para QUITAR un permiso
1. Eliminar el `case` de la enum y retirarlo de cualquier arreglo en `RolePermissions::MAP`.
2. Sincronizar con prune para eliminar huérfanos:
   ```bash
   php artisan permissions:sync --prune
   ```
3. Eliminar o actualizar referencias en código (busca por cadena del permiso anterior) y tests.

## Flujo para QUITAR un rol
1. Eliminar la clave correspondiente de `RolePermissions::MAP`.
2. Ejecutar prune:
   ```bash
   php artisan permissions:sync --prune
   ```
3. Revisar lógica / tests que asignen ese rol.

## Convenciones de nomenclatura
- Formato: `recurso.accion` (kebab-case si varias palabras), p.ej.: `events.publish`, `external-profiles.sync`.
- Mantener consistencia para facilitar búsquedas y agrupación.

## Comando de sincronización
`php artisan permissions:sync` realiza:
- Crea los permisos que faltan según la enum.
- Crea roles que falten.
- Sincroniza los permisos de cada rol con el mapa.
- NO borra nada (modo seguro).

`php artisan permissions:sync --prune` además:
- Elimina permisos presentes en BD pero NO definidos en la enum.
- Elimina roles en BD que NO están en el mapa.
- Recomendado solo si estás seguro de que no hay datos dependientes externos.

## ¿Por qué esta estrategia?
- Evita "strings mágicos" dispersos.
- Hace revisiones de cambios de seguridad triviales (diff de este archivo y de la enum).
- Permite despliegues idempotentes: correr el comando en CI/CD.

## Recomendaciones
- Después de un deployment que cambia permisos/roles, ejecutar siempre el comando de sync.
- Para auditoría, mantener un test que falle si falta un permiso crítico.
- Evitar asignar permisos directos a usuarios salvo excepciones; preferir roles.

## Tests
- `RolesPermissionsTest` valida roles base y permisos.
- `PermissionsSyncCommandTest` valida el comando y prune.

## Super Admin
- El rol `admin` usa `'*'`, no es necesario mantener manualmente la lista.

---
Para dudas o extensiones (e.g. UI de gestión), documentar aquí el nuevo flujo antes de implementarlo.

