<?php

use App\Models\User;
use App\Models\Technology;
use App\Models\Skill;
use App\Models\ExternalProfile;
use Illuminate\Support\Str;

it('user has skills and technologies relationship working with ordering', function () {
    $user = User::factory()->create();
    $techA = Technology::factory()->create(['name' => 'Alpha']);
    $techB = Technology::factory()->create(['name' => 'Beta']);
    $techC = Technology::factory()->create(['name' => 'Gamma']);

    Skill::create([
        'user_id' => $user->id,
        'technology_id' => $techB->id,
        'level' => 'intermediate',
        'years_experience' => 2,
        'position' => 2,
        'visibility' => 'public',
    ]);
    Skill::create([
        'user_id' => $user->id,
        'technology_id' => $techA->id,
        'level' => 'advanced',
        'years_experience' => 5,
        'position' => 1,
        'visibility' => 'public',
    ]);
    Skill::create([
        'user_id' => $user->id,
        'technology_id' => $techC->id,
        'level' => 'learning',
        'years_experience' => 0,
        'position' => 3,
        'visibility' => 'public',
    ]);

    $techNamesOrdered = $user->technologies->pluck('name')->all();
    expect($techNamesOrdered)->toBe(['Alpha', 'Beta', 'Gamma']);
});

it('username suggestion is unique', function () {
    $user1 = User::factory()->create(['display_name' => 'John Doe', 'username' => null]);
    $user1->username = $user1->generateUsernameSuggestion();
    $user1->save();

    $user2 = User::factory()->create(['display_name' => 'John Doe', 'username' => null]);
    $suggested = $user2->generateUsernameSuggestion();

    expect($suggested)->not()->toBe($user1->username);
});

it('external profiles relation orders by position', function () {
    $user = User::factory()->create();

    ExternalProfile::create([
        'user_id' => $user->id,
        'platform' => 'github',
        'handle' => 'zuser',
        'url' => 'https://github.com/zuser',
        'position' => 2,
    ]);
    ExternalProfile::create([
        'user_id' => $user->id,
        'platform' => 'linkedin',
        'handle' => 'auser',
        'url' => 'https://www.linkedin.com/in/auser',
        'position' => 1,
    ]);

    $platforms = $user->externalProfiles->pluck('platform')->all();
    expect($platforms)->toBe(['linkedin', 'github']);
});

it('seeder loads base technologies', function () {
    $this->artisan('db:seed');
    $names = Technology::pluck('name');
    expect($names)->toContain('Laravel', 'React', 'Docker');
});

