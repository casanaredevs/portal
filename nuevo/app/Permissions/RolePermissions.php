<?php

namespace App\Permissions;

/**
 * Mapeo fuente de verdad: roles a permisos.
 */
final class RolePermissions
{
    /** @var array<string, array<int, Permission>|'*'> */
    public const MAP = [
        'admin' => '*',
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

    /** @return list<string> */
    public static function allPermissions(): array
    {
        return array_map(fn(Permission $p) => $p->value, Permission::cases());
    }

    /** @return list<string> */
    public static function permissionsForRole(string $role): array
    {
        $def = self::MAP[$role] ?? [];
        if ($def === '*') {
            return self::allPermissions();
        }
        return array_map(fn(Permission $p) => $p->value, $def);
    }
}

