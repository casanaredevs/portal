<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission as EloquentPermission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use App\Permissions\Permission as PermEnum;
use App\Permissions\RolePermissions;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Crear / asegurar todos los permisos definidos en la enum
        foreach (PermEnum::cases() as $case) {
            EloquentPermission::firstOrCreate(['name' => $case->value]);
        }

        // Sincronizar roles según mapa
        foreach (RolePermissions::MAP as $roleName => $definition) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            if ($definition === '*') {
                $role->syncPermissions(RolePermissions::allPermissions());
            } else {
                $role->syncPermissions(array_map(fn(PermEnum $p) => $p->value, $definition));
            }
        }

        // (Opcional) No se eliminan permisos huérfanos aquí; el comando permissions:sync --prune lo gestionará.
    }
}
