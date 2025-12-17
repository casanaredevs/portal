<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key','value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting:".$key, 30, function() use ($key,$default) {
            $row = static::query()->where('key',$key)->first();
            if (!$row) return $default;
            $json = json_decode($row->value, true);
            return $json === null && $row->value !== 'null' ? $row->value : $json;
        });
    }

    public static function put(string $key, mixed $value): void
    {
        $encoded = is_scalar($value) || $value === null ? (string)json_encode($value) : json_encode($value);
        static::query()->updateOrCreate(['key'=>$key],[ 'value' => $encoded ]);
        Cache::forget("setting:".$key);
    }
}

