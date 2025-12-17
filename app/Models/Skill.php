<?php

namespace App\Models;

use App\Enums\SkillLevel;
use App\Enums\SkillVisibility;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'technology_id', 'level', 'years_experience', 'position', 'visibility'
    ];

    /**
     * Get the user that owns the skill.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the technology that is associated with the skill.
     */
    public function technology()
    {
        return $this->belongsTo(Technology::class);
    }

    /**
     * Scope a query to only include skills ordered by position.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('position');
    }

    /**
     * Scope a query to only include public skills.
     */
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Get the skill level enum value.
     */
    public function getLevelEnum(): ?SkillLevel
    {
        return SkillLevel::tryFrom($this->level);
    }

    /**
     * Get the skill visibility enum value.
     */
    public function getVisibilityEnum(): ?SkillVisibility
    {
        return SkillVisibility::tryFrom($this->visibility);
    }
}
