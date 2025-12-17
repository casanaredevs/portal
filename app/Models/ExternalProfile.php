<?php

namespace App\Models;

use App\Enums\ExternalPlatform;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'platform', 'handle', 'url', 'label', 'icon', 'position', 'is_verified', 'verified_at', 'verification_data'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'verification_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPlatformEnum(): ?ExternalPlatform
    {
        return ExternalPlatform::tryFrom($this->platform);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('position');
    }
}

