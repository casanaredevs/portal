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

// Las clases RolePermissions y PermissionMetadata ahora viven en archivos separados:
// app/Permissions/RolePermissions.php y app/Permissions/PermissionMetadata.php
