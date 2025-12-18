<?php

use App\Models\User;
use App\Models\Technology;
use App\Models\Skill;

it('muestra perfil público por username', function () {
    $user = User::factory()->create(['username' => 'juan-test']);
    $tech = Technology::factory()->create(['name' => 'VueJS']);
    Skill::factory()->create([
        'user_id' => $user->id,
        'technology_id' => $tech->id,
        'level' => 'intermediate',
        'position' => 1,
    ]);

    $response = $this->get('/u/juan-test');
    $response->assertStatus(200);
});

it('retorna 404 para username inexistente', function () {
    $this->get('/u/no-existe-xyz')->assertStatus(404);
});

