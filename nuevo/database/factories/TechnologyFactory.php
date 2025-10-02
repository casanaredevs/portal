<?php

namespace Database\Factories;

use App\Models\Technology;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Technology>
 */
class TechnologyFactory extends Factory
{
    protected $model = Technology::class;

    public function definition(): array
    {
        $name = ucfirst($this->faker->unique()->word());
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'category' => $this->faker->randomElement([
                'frontend','backend','devops','mobile','data','testing','cloud'
            ]),
            'icon' => null,
            'synonyms' => [],
            'is_active' => true,
        ];
    }
}
