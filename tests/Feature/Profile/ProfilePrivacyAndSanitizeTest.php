<?php

use App\Models\User;
use App\Models\Technology;
use App\Models\Skill;

it('respeta configuracion de privacidad para visitante anonimo', function () {
    $user = User::factory()->create([
        'username' => 'priv-user',
        'bio' => 'BIOVISIBLE',
        'about' => 'ABOUTVISIBLE',
        'location_city' => 'Bogotá',
        'location_country' => 'CO',
        'privacy' => [
            'bio' => 'public',
            'about' => 'members',
            'location' => 'private',
        ],
    ]);
    $tech = Technology::factory()->create(['name' => 'NodeJS']);
    Skill::factory()->create([
        'user_id' => $user->id,
        'technology_id' => $tech->id,
        'level' => 'intermediate',
        'position' => 1,
        'visibility' => 'public',
    ]);

    $resp = $this->getJson('/u/priv-user');
    $resp->assertStatus(200)
        ->assertJsonPath('data.bio', 'BIOVISIBLE')
        ->assertJsonPath('data.about', null) // about solo miembros
        ->assertJsonPath('data.location_city', null); // location privado
});

it('muestra campos members para usuario autenticado distinto', function () {
    $viewer = User::factory()->create();
    $user = User::factory()->create([
        'username' => 'member-user',
        'about' => 'ABOUTMEMBERS',
        'privacy' => [ 'about' => 'members' ],
    ]);
    $this->actingAs($viewer);
    $this->getJson('/u/member-user')
        ->assertStatus(200)
        ->assertJsonPath('data.about', 'ABOUTMEMBERS');
});

it('el owner ve todos los campos privados', function () {
    $user = User::factory()->create([
        'username' => 'owner-user',
        'about' => 'ABOUTOWNER',
        'location_city' => 'Lima',
        'privacy' => [ 'about' => 'private', 'location' => 'private' ],
    ]);
    $this->actingAs($user);
    $this->getJson('/u/owner-user')
        ->assertStatus(200)
        ->assertJsonPath('data.about', 'ABOUTOWNER')
        ->assertJsonPath('data.location_city', 'Lima');
});

it('sanitiza contenido peligroso en about al actualizar', function () {
    $user = User::factory()->create(['username' => 'sanitize-user']);
    $this->actingAs($user);
    $payload = [
        'about' => '<script>alert(1)</script><p onclick="evil()">Hola <strong>Mundo</strong></p><a href="javascript:alert(2)">link</a>'
    ];
    $this->patchJson('/profile', $payload)->assertStatus(200);
    $resp = $this->getJson('/u/sanitize-user');
    $resp->assertStatus(200);
    $about = $resp->json('data.about');
    expect($about)->not()->toContain('<script>');
    expect($about)->not()->toContain('onclick');
    expect($about)->not()->toContain('javascript:');
    expect($about)->toContain('<p');
    expect($about)->toContain('<strong>');
});

it('auto-sugiere username si falta en update', function () {
    $user = User::factory()->create(['username' => null]);
    $this->actingAs($user);
    $this->patchJson('/profile', [ 'display_name' => 'Nuevo Nombre' ])
        ->assertStatus(200)
        ->assertJsonPath('data.username', fn($val) => !empty($val));
});

it('rechaza username duplicado', function () {
    $existing = User::factory()->create(['username' => 'duplicado']);
    $user = User::factory()->create(['username' => 'otro']);
    $this->actingAs($user);
    $this->patchJson('/profile', [ 'username' => 'duplicado' ])
        ->assertStatus(422);
});

