<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'username',
        'email',
        'password',
        'bio',
        'about',
        'location_city',
        'location_country',
        'availability',
        'privacy',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'availability' => 'array',
            'privacy' => 'array',
        ];
    }

    /**
     * Nombre para mostrar preferido.
     */
    public function getDisplayNameAttribute(): string
    {
        // Evitar recursion: acceder al valor bruto del atributo
        $raw = $this->attributes['display_name'] ?? null;
        return $raw ?: ($this->attributes['name'] ?? $this->name ?? '');
    }

    /** @return HasMany<Skill> */
    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    /**
     * Relación many-to-many a tecnologías a través de skills (incluye datos pivot de nivel, etc.)
     * @return BelongsToMany<Technology>
     */
    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class, 'skills')
            ->withPivot(['level', 'years_experience', 'position', 'visibility'])
            ->withTimestamps()
            ->orderBy('skills.position');
    }

    /** @return HasMany<ExternalProfile> */
    public function externalProfiles(): HasMany
    {
        return $this->hasMany(ExternalProfile::class)->orderBy('position');
    }

    /**
     * Generar un username slug si falta (no guardar automáticamente para mantener control expreso).
     */
    public function generateUsernameSuggestion(): string
    {
        $base = str($this->display_name ?: $this->name)->lower()->slug('-');
        if ($base === '') {
            $base = 'user';
        }
        $candidate = $base;
        $i = 1;
        while (static::where('username', $candidate)->where('id', '!=', $this->id)->exists()) {
            $candidate = $base.'-'.$i++;
        }
        return $candidate;
    }

    /**
     * Devuelve colección de skills públicos ordenados con tecnología cargada.
     */
    public function publicSkills()
    {
        return $this->skills()->public()->with('technology')->ordered()->get();
    }

    /**
     * Serializa datos del perfil respetando privacidad.
     * @param User|null $viewer
     */
    public function toPublicProfileArray(?User $viewer = null): array
    {
        $privacy = $this->privacy ?? [];
        $viewerIsOwner = $viewer && $viewer->id === $this->id;
        $isMember = (bool) $viewer; // simplificación: autenticado = miembro

        $visibility = function(string $key) use ($privacy, $viewerIsOwner, $isMember) {
            $level = $privacy[$key] ?? 'public';
            if ($viewerIsOwner) return true;
            return match ($level) {
                'public' => true,
                'members' => $isMember,
                'private' => false,
                default => true,
            };
        };

        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'name' => $this->name,
            'bio' => $visibility('bio') ? $this->bio : null,
            'about' => $visibility('about') ? $this->about : null,
            'location_city' => $visibility('location') ? $this->location_city : null,
            'location_country' => $visibility('location') ? $this->location_country : null,
            'skills' => $this->publicSkills()->map(fn($s) => [
                'id' => $s->id,
                'technology' => [
                    'id' => $s->technology->id,
                    'name' => $s->technology->name,
                    'slug' => $s->technology->slug,
                    'icon' => $s->technology->icon,
                    'category' => $s->technology->category,
                ],
                'level' => $s->level,
                'years_experience' => $s->years_experience,
                'position' => $s->position,
            ])->all(),
            'external_profiles' => $this->externalProfiles()->orderBy('position')->get()->map(fn($p) => [
                'id' => $p->id,
                'platform' => $p->platform,
                'handle' => $p->handle,
                'url' => $p->url,
                'label' => $p->label,
                'icon' => $p->icon,
                'is_verified' => $p->is_verified,
                'position' => $p->position,
            ])->all(),
        ];
    }
}
