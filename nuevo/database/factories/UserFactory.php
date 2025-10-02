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
        $name = $this->faker->name();
        $usernameBase = Str::slug(Str::lower($name));
        $username = $usernameBase . '-' . $this->faker->unique()->numberBetween(100, 999);
        return [
            'name' => $name,
            'display_name' => $this->faker->boolean(70) ? $name : null,
            'username' => $username,
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'bio' => $this->faker->boolean(80) ? Str::limit($this->faker->sentence(12), 280) : null,
            'about' => $this->faker->boolean(60) ? $this->faker->paragraphs(2, true) : null,
            'location_city' => $this->faker->boolean(50) ? $this->faker->city() : null,
            'location_country' => $this->faker->boolean(50) ? strtoupper($this->faker->countryCode()) : null,
            'availability' => $this->faker->boolean(50) ? ['freelance' => $this->faker->boolean(), 'mentoring' => $this->faker->boolean()] : null,
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
