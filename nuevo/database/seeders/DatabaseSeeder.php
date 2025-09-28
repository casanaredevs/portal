<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // Sembrar eventos de ejemplo si no existen
        if (Event::count() === 0) {
            Event::factory()->count(6)->create();
        }
    }
}
