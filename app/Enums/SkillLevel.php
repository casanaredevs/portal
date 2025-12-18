<?php

namespace App\Enums;

enum SkillLevel: string
{
    case LEARNING = 'learning';
    case INTERMEDIATE = 'intermediate';
    case ADVANCED = 'advanced';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

