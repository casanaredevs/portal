<?php

namespace App\Permissions;

/**
 * Enumeración de permisos del sistema.
 * Agrega nuevos casos aquí y sincroniza con: php artisan permissions:sync
 */
enum Permission: string
{
    case EventsCreate = 'events.create';
    case EventsEdit = 'events.edit';
    case EventsDelete = 'events.delete';
    case EventsPublish = 'events.publish';
    case EventsRegister = 'events.register';

    case SkillsAdd = 'skills.add';
    case SkillsModerate = 'skills.moderate';

    case TechnologiesManage = 'technologies.manage';

    case UsersManage = 'users.manage';

    case ExternalProfilesSync = 'external-profiles.sync';
}

/**
 * Mapeo de roles a permisos. Fuente única para seeder y comando de sincronización.
 */
final class RolePermissions
{
    /** @var array<string, array<int, Permission>|'*'> */
    public const MAP = [
        'admin' => '*', // acceso total a todos los permisos enumerados
        'moderator' => [
            Permission::EventsCreate,
            Permission::EventsEdit,
            Permission::EventsDelete,
            Permission::EventsPublish,
            Permission::SkillsModerate,
            Permission::ExternalProfilesSync,
        ],
        'member' => [
            Permission::EventsRegister,
            Permission::SkillsAdd,
        ],
    ];

    /**
     * Devuelve todos los permisos (strings) definidos en la enum.
     * @return list<string>
     */
    public static function allPermissions(): array
    {
        return array_map(fn(Permission $p) => $p->value, Permission::cases());
    }

    /**
     * Permisos (strings) para un rol dado (expandiendo '*').
     * @return list<string>
     */
    public static function permissionsForRole(string $role): array
    {
        $def = self::MAP[$role] ?? [];
        if ($def === '*') {
            return self::allPermissions();
        }
        return array_map(fn(Permission $p) => $p->value, $def);
    }
}

/**
 * Metadata para los permisos del sistema.
 */
final class PermissionMetadata
{
    /** @var array<string,array{label:string,category:string,description?:string}> */
    public const META = [
        Permission::EventsCreate->value => ['label' => 'Crear eventos', 'category' => 'Eventos'],
        Permission::EventsEdit->value => ['label' => 'Editar eventos', 'category' => 'Eventos'],
        Permission::EventsDelete->value => ['label' => 'Eliminar eventos', 'category' => 'Eventos'],
        Permission::EventsPublish->value => ['label' => 'Publicar eventos', 'category' => 'Eventos'],
        Permission::EventsRegister->value => ['label' => 'Registrarse a eventos', 'category' => 'Eventos'],
        Permission::SkillsAdd->value => ['label' => 'Agregar skills propias', 'category' => 'Skills'],
        Permission::SkillsModerate->value => ['label' => 'Moderar skills', 'category' => 'Skills'],
        Permission::TechnologiesManage->value => ['label' => 'Gestionar tecnologías', 'category' => 'Tecnologías'],
        Permission::UsersManage->value => ['label' => 'Gestionar usuarios y roles', 'category' => 'Usuarios'],
        Permission::ExternalProfilesSync->value => ['label' => 'Sincronizar perfiles externos', 'category' => 'Perfiles Externos'],
    ];

    /** @return array<string,array{label:string,category:string,description?:string}> */
    public static function all(): array
    {
        return self::META;
    }

    public static function label(string $permission): string
    {
        return self::META[$permission]['label'] ?? $permission;
    }

    public static function category(string $permission): string
    {
        return self::META[$permission]['category'] ?? 'General';
    }
}
