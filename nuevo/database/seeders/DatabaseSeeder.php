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
        // Sembrar roles y permisos primero
        $this->call(RolesAndPermissionsSeeder::class);

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

        // Asegurar que usuario test sea admin para entorno local.
        if (!$user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // Sembrar catálogo ampliado de tecnologías principales
        $this->call(TopTechnologiesSeeder::class);

        // Evitar factories (faker) en producción si faker no está instalado (--no-dev)
        if (!app()->environment('production')) {
            // Sembrar eventos de ejemplo si no existen
            if (Event::count() === 0) {
                Event::factory()->count(6)->create();
            }

            // Marcar algunos usuarios como destacados si no hay ninguno
            if (User::where('is_featured', true)->count() === 0) {
                User::query()->inRandomOrder()->limit(5)->update(['is_featured' => true]);
            }
        }
    }
}
