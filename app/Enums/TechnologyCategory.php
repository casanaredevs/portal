<?php

namespace App\Enums;

enum TechnologyCategory: string
{
    case FRONTEND = 'frontend';
    case BACKEND = 'backend';
    case DEVOPS = 'devops';
    case MOBILE = 'mobile';
    case DATA = 'data';
    case TESTING = 'testing';
    case CLOUD = 'cloud';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

