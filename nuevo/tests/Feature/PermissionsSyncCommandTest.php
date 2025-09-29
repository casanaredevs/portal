<?php

namespace Tests\Feature;

use App\Permissions\Permission as PermEnum;
use App\Permissions\RolePermissions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionsSyncCommandTest extends TestCase
{
    public function test_sync_creates_all_permissions_and_roles(): void
    {
        $this->artisan('permissions:sync')->assertSuccessful();

        // Validar permisos
        $enumValues = collect(PermEnum::cases())->map(fn($c) => $c->value);
        $dbValues = Permission::pluck('name');
        $this->assertEmpty($enumValues->diff($dbValues), 'Faltan permisos en BD');

        // Validar roles y asignaciones
        foreach (array_keys(RolePermissions::MAP) as $roleName) {
            $role = Role::where('name', $roleName)->first();
            $this->assertNotNull($role, "Rol {$roleName} no creado");
            $expected = RolePermissions::permissionsForRole($roleName);
            $this->assertEmpty(collect($expected)->diff($role->permissions->pluck('name')),
                "Rol {$roleName} no tiene todos los permisos esperados");
        }
    }

    public function test_sync_prune_removes_orphans(): void
    {
        // Pre: sync inicial
        $this->artisan('permissions:sync')->assertSuccessful();

        // Crear huérfanos
        Permission::create(['name' => 'obsolete.perm']);
        Role::create(['name' => 'legacy']);

        $this->assertDatabaseHas('permissions', ['name' => 'obsolete.perm']);
        $this->assertDatabaseHas('roles', ['name' => 'legacy']);

        // Ejecutar prune
        $this->artisan('permissions:sync', ['--prune' => true])->assertSuccessful();

        $this->assertDatabaseMissing('permissions', ['name' => 'obsolete.perm']);
        $this->assertDatabaseMissing('roles', ['name' => 'legacy']);
    }
}

