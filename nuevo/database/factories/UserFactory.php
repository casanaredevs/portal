<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $usernameBase = Str::slug(Str::lower($name));
        $username = $usernameBase . '-' . fake()->unique()->numberBetween(100, 999);
        return [
            'name' => $name,
            'display_name' => fake()->boolean(70) ? $name : null,
            'username' => $username,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'bio' => fake()->boolean(80) ? Str::limit(fake()->sentence(12), 280) : null,
            'about' => fake()->boolean(60) ? fake()->paragraphs(2, true) : null,
            'location_city' => fake()->boolean(50) ? fake()->city() : null,
            'location_country' => fake()->boolean(50) ? strtoupper(fake()->countryCode()) : null,
            'availability' => fake()->boolean(50) ? ['freelance' => fake()->boolean(), 'mentoring' => fake()->boolean()] : null,
            'privacy' => ['bio' => 'public', 'location' => 'public'],
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->afterCreating(function ($user) {
            try {
                if (Role::where('name', 'admin')->exists()) {
                    $user->assignRole('admin');
                }
            } catch (\Throwable $e) {}
        });
    }

    public function moderator(): static
    {
        return $this->afterCreating(function ($user) {
            try {
                if (Role::where('name', 'moderator')->exists()) {
                    $user->assignRole('moderator');
                }
            } catch (\Throwable $e) {}
        });
    }

    public function member(): static
    {
        return $this->afterCreating(function ($user) {
            try {
                if (Role::where('name', 'member')->exists()) {
                    // booted ya asigna member; redundante pero idempotente
                    if (!$user->hasRole('member')) {
                        $user->assignRole('member');
                    }
                }
            } catch (\Throwable $e) {}
        });
    }
}
