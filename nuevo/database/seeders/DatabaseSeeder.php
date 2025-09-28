<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Database\Seeders\TopTechnologiesSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (!$user->username) {
            $user->username = $user->generateUsernameSuggestion();
            $user->save();
        }

        // Sembrar catálogo ampliado de tecnologías principales
        $this->call(TopTechnologiesSeeder::class);
    }
}
