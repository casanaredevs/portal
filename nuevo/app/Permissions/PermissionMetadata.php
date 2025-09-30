<?php

namespace App\Permissions;

/**
 * Metadata para los permisos del sistema.
 * Separa etiqueta, categoría y (opcional) descripción.
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

