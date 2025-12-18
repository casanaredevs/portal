<?php

use App\Models\User;
use App\Models\ExternalProfile;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('crea un perfil externo normalizado', function () {
    $response = $this->postJson('/external-profiles', [
        'platform' => 'github',
        'handle' => 'MiHandle',
    ]);
    $response->assertStatus(201)
        ->assertJsonPath('data.platform', 'github')
        ->assertJsonPath('data.handle', 'MiHandle')
        ->assertJsonPath('data.url', 'https://github.com/MiHandle');
});

it('evita duplicar plataforma para el mismo usuario', function () {
    $this->postJson('/external-profiles', [
        'platform' => 'github',
        'handle' => 'user1',
    ])->assertStatus(201);
    $this->postJson('/external-profiles', [
        'platform' => 'github',
        'handle' => 'user2',
    ])->assertStatus(422);
});

it('actualiza y normaliza cambios de plataforma/handle/url', function () {
    $profile = ExternalProfile::create([
        'user_id' => $this->user->id,
        'platform' => 'github',
        'handle' => 'old',
        'url' => 'https://github.com/old',
        'position' => 1,
    ]);
    $this->patchJson('/external-profiles/'.$profile->id, [
        'handle' => 'newhandle'
    ])->assertOk()->assertJsonPath('data.url', 'https://github.com/newhandle');
});

it('reordena perfiles externos', function () {
    $p1 = ExternalProfile::create([
        'user_id' => $this->user->id,
        'platform' => 'github',
        'handle' => 'a',
        'url' => 'https://github.com/a',
        'position' => 1,
    ]);
    $p2 = ExternalProfile::create([
        'user_id' => $this->user->id,
        'platform' => 'linkedin',
        'handle' => 'b',
        'url' => 'https://www.linkedin.com/in/b',
        'position' => 2,
    ]);
    $this->postJson('/external-profiles/reorder', [
        'external_profile_ids' => [$p2->id, $p1->id]
    ])->assertOk();

    $positions = ExternalProfile::whereIn('id', [$p1->id, $p2->id])->orderBy('position')->pluck('id')->all();
    expect($positions)->toBe([$p2->id, $p1->id]);
});

it('rechaza reorder inválido con ids faltantes', function () {
    $p1 = ExternalProfile::create([
        'user_id' => $this->user->id,
        'platform' => 'github',
        'handle' => 'a',
        'url' => 'https://github.com/a',
        'position' => 1,
    ]);
    $this->postJson('/external-profiles/reorder', [
        'external_profile_ids' => []
    ])->assertStatus(422);
});

