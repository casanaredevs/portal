<?php

namespace Database\Factories;

use App\Models\Skill;
use App\Models\User;
use App\Models\Technology;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    protected $model = Skill::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'technology_id' => Technology::factory(),
            'level' => fake()->randomElement(['learning','intermediate','advanced']),
            'years_experience' => fake()->numberBetween(0, 15),
            'position' => 0,
            'visibility' => 'public',
        ];
    }

    public function position(int $position): self
    {
        return $this->state(fn() => ['position' => $position]);
    }
}

