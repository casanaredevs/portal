<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title','slug','summary','description','type','start_at','end_at','capacity','seats_taken','status'
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'capacity' => 'integer',
        'seats_taken' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Event $event) {
            if (!$event->slug) {
                $base = Str::slug($event->title);
                $slug = $base;
                $i = 1;
                while (static::where('slug',$slug)->exists()) {
                    $slug = $base.'-'.$i++;
                }
                $event->slug = $slug;
            }
        });

        $forgetCaches = function () {
            Cache::forget('public.metrics');
            Cache::forget('public.events.upcoming');
        };

        static::saved($forgetCaches);
        static::deleted($forgetCaches);
    }

    public function getSeatsRemainingAttribute(): ?int
    {
        if (is_null($this->capacity)) return null;
        return max(0, $this->capacity - $this->seats_taken);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status','published')
            ->where('start_at','>=', now())
            ->orderBy('start_at');
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }
}
