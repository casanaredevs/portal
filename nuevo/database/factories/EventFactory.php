<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Event> */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $title = ucfirst(fake()->words(rand(2,4), true));
        $types = ['kata','taller','meetup'];
        $start = fake()->dateTimeBetween('+1 day', '+40 days');
        $durationHours = [1,2,3,4][array_rand([1,2,3,4])];
        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(4),
            'summary' => fake()->sentence(10),
            'description' => fake()->paragraphs(3, true),
            'type' => $types[array_rand($types)],
            'start_at' => $start,
            'end_at' => (clone $start)->modify("+{$durationHours} hour"),
            'capacity' => rand(15,60),
            'seats_taken' => 0,
            'status' => 'published',
        ];
    }

    public function draft(): self
    {
        return $this->state(fn() => ['status' => 'draft']);
    }

    public function cancelled(): self
    {
        return $this->state(fn() => ['status' => 'cancelled']);
    }
}

