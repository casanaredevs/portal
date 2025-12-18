<?php

namespace App\Enums;

enum ExternalPlatform: string
{
    case GITHUB = 'github';
    case LINKEDIN = 'linkedin';
    case TWITTER = 'twitter'; // X
    case STACKOVERFLOW = 'stackoverflow';
    case YOUTUBE = 'youtube';
    case DEVTO = 'devto';
    case MEDIUM = 'medium';
    case HASHNODE = 'hashnode';
    case FACEBOOK = 'facebook';
    case INSTAGRAM = 'instagram';
    case TWITCH = 'twitch';
    case THREADS = 'threads';
    case DISCORD = 'discord';
    case MASTODON = 'mastodon';
    case GITLAB = 'gitlab';
    case BITBUCKET = 'bitbucket';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

