<?php

namespace App\Services;

use App\Enums\ExternalPlatform;

class ExternalProfileNormalizer
{
    /**
     * Normaliza handle y URL finales a partir de plataforma y entrada (handle o url).
     * @return array{handle:string,url:string}
     */
    public function normalize(string $platform, ?string $handle, ?string $url): array
    {
        $platform = strtolower($platform);
        // Si viene URL pero no handle, intentar extraer handle.
        if ($url && !$handle) {
            $parsed = parse_url($url);
            if (!empty($parsed['path'])) {
                $segments = array_values(array_filter(explode('/', $parsed['path'])));
                if (count($segments)) {
                    $handle = $segments[count($segments)-1];
                }
            }
        }
        if (!$handle) {
            // Si aún sin handle usar parte de la url host si existe.
            if ($url) {
                $parsed = parse_url($url);
                $handle = $parsed['host'] ?? 'unknown';
            } else {
                $handle = 'unknown';
            }
        }
        $handle = trim($handle, '/');

        $base = match($platform) {
            ExternalPlatform::GITHUB->value => 'https://github.com/',
            ExternalPlatform::LINKEDIN->value => 'https://www.linkedin.com/in/',
            ExternalPlatform::TWITTER->value => 'https://twitter.com/',
            ExternalPlatform::STACKOVERFLOW->value => 'https://stackoverflow.com/users/',
            ExternalPlatform::YOUTUBE->value => 'https://www.youtube.com/@',
            ExternalPlatform::DEVTO->value => 'https://dev.to/',
            ExternalPlatform::MEDIUM->value => 'https://medium.com/@',
            ExternalPlatform::HASHNODE->value => 'https://hashnode.com/@',
            ExternalPlatform::FACEBOOK->value => 'https://www.facebook.com/',
            ExternalPlatform::INSTAGRAM->value => 'https://www.instagram.com/',
            ExternalPlatform::TWITCH->value => 'https://www.twitch.tv/',
            ExternalPlatform::THREADS->value => 'https://www.threads.net/@',
            ExternalPlatform::DISCORD->value => 'https://discord.com/users/',
            ExternalPlatform::MASTODON->value => '', // Mastodon es federado; conservar url si se proporciona.
            ExternalPlatform::GITLAB->value => 'https://gitlab.com/',
            ExternalPlatform::BITBUCKET->value => 'https://bitbucket.org/',
            default => '',
        };

        if ($platform === ExternalPlatform::MASTODON->value) {
            // En Mastodon preferimos URL completa si fue dada.
            $finalUrl = $url ?: $handle;
        } elseif ($base) {
            $finalUrl = $base . $handle;
        } else {
            $finalUrl = $url ?: $handle;
        }

        // Normalización final: asegurar https
        if (!str_starts_with($finalUrl, 'http://') && !str_starts_with($finalUrl, 'https://')) {
            $finalUrl = 'https://' . ltrim($finalUrl, '/');
        }
        $finalUrl = preg_replace('#^http://#','https://',$finalUrl); // forzar https

        return [
            'handle' => $handle,
            'url' => $finalUrl,
        ];
    }
}

