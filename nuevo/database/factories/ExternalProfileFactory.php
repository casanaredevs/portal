<?php

namespace Database\Factories;

use App\Models\ExternalProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExternalProfile>
 */
class ExternalProfileFactory extends Factory
{
    protected $model = ExternalProfile::class;

    public function definition(): array
    {
        $platform = fake()->randomElement([
            'github','linkedin','twitter','devto','medium'
        ]);
        $handle = Str::lower(fake()->unique()->userName());
        $url = match($platform) {
            'github' => "https://github.com/$handle",
            'linkedin' => "https://www.linkedin.com/in/$handle",
            'twitter' => "https://twitter.com/$handle",
            'devto' => "https://dev.to/$handle",
            'medium' => "https://medium.com/@$handle",
            default => fake()->url(),
        };
        return [
            'user_id' => User::factory(),
            'platform' => $platform,
            'handle' => $handle,
            'url' => $url,
            'label' => null,
            'icon' => null,
            'position' => 0,
            'is_verified' => false,
            'verified_at' => null,
            'verification_data' => null,
        ];
    }
}
