<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'email','status','token','consented_at','consent_ip','confirmed_at','unsubscribed_at'
    ];

    protected $casts = [
        'consented_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    public function scopeActive($q) { return $q->where('status','confirmed'); }
}

