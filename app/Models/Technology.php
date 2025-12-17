<?php

namespace App\Models;

use App\Enums\TechnologyCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Skill;
use Illuminate\Support\Facades\Cache;

class Technology extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'category', 'icon', 'synonyms', 'is_active'
    ];

    protected $casts = [
        'synonyms' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $tech) {
            if (!$tech->slug) {
                $tech->slug = Str::slug($tech->name);
            }
        });
        static::saved(fn() => static::flushCache());
        static::deleted(fn() => static::flushCache());
    }

    public static function cacheKey(): string
    {
        return 'technologies.catalog.v1';
    }

    public static function flushCache(): void
    {
        Cache::forget(static::cacheKey());
    }

    public static function cached(): \Illuminate\Support\Collection
    {
        return Cache::remember(static::cacheKey(), 3600, fn() => static::active()->orderBy('name')->get());
    }

    /**
     * Búsqueda simple por nombre o coincidencia textual en synonyms (LIKE sobre JSON)
     */
    public static function search(string $term, int $limit = 15): \Illuminate\Support\Collection
    {
        $term = trim($term);
        if ($term === '') {
            return collect();
        }
        $like = '%'.strtolower($term).'%';
        return static::active()
            ->where(function($q) use ($like) {
                $q->whereRaw('LOWER(name) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(slug) LIKE ?', [$like])
                  ->orWhere('synonyms', 'LIKE', '%"'.strtolower(str_replace('%','',$like)).'"%');
            })
            // Orden natural por id (creación) para resultados predecibles en tests (evita orden lexicográfico Tech1,Tech10,...)
            ->orderBy('id')
            ->limit($limit)
            ->get();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function skills()
    {
        return $this->hasMany(Skill::class);
    }

    public function getCategoryEnum(): ?TechnologyCategory
    {
        return TechnologyCategory::tryFrom($this->category);
    }
}
