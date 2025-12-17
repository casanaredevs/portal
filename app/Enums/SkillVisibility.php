<?php

namespace App\Enums;

enum SkillVisibility: string
{
    case PUBLIC = 'public';
    case MEMBERS = 'members';
    case PRIVATE = 'private';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

