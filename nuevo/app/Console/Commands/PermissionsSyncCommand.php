<?php

namespace App\Console\Commands;

use App\Permissions\Permission as PermEnum;
use App\Permissions\RolePermissions;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSyncCommand extends Command
{
    protected $signature = 'permissions:sync {--prune : Elimina permisos y roles no definidos en la fuente de verdad}';

    protected $description = 'Sincroniza roles y permisos desde la enum Permission y el mapa RolePermissions';

    public function handle(): int
    {
        /** @var PermissionRegistrar $registrar */
        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        $this->info('Sincronizando permisos...');
        $definedPerms = collect(PermEnum::cases())->map(fn($c) => $c->value)->values();

        foreach ($definedPerms as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        $this->info('Sincronizando roles...');
        foreach (RolePermissions::MAP as $roleName => $definition) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $perms = $definition === '*' ? $definedPerms : collect($definition)->map(fn(PermEnum $e) => $e->value)->values();
            $role->syncPermissions($perms);
        }

        if ($this->option('prune')) {
            $this->warn('Pruning habilitado: eliminando elementos huérfanos');
            // Eliminar permisos no definidos
            $deletedPerms = Permission::whereNotIn('name', $definedPerms)->pluck('name');
            if ($deletedPerms->isNotEmpty()) {
                Permission::whereIn('name', $deletedPerms)->delete();
                $this->line('Permisos eliminados: '.$deletedPerms->implode(', '));
            } else {
                $this->line('No hay permisos huérfanos.');
            }
            // Eliminar roles no definidos
            $definedRoles = collect(array_keys(RolePermissions::MAP));
            $deletedRoles = Role::whereNotIn('name', $definedRoles)->pluck('name');
            if ($deletedRoles->isNotEmpty()) {
                Role::whereIn('name', $deletedRoles)->delete();
                $this->line('Roles eliminados: '.$deletedRoles->implode(', '));
            } else {
                $this->line('No hay roles huérfanos.');
            }
        }

        $registrar->forgetCachedPermissions(); // limpiar de nuevo tras cambios

        $this->info('Total permisos definidos: '.$definedPerms->count());
        $this->info('Total roles definidos: '.count(RolePermissions::MAP));

        $this->comment('Sync completado.');
        return self::SUCCESS;
    }
}

