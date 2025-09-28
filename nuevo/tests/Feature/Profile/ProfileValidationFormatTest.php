<?php

use App\Models\User;

it('retorna estructura de errores uniforme en 422 al actualizar perfil', function () {
    $user = User::factory()->create(['username' => 'usuario-prueba']);
    $this->actingAs($user);

    // Username inválido (mayúsculas y espacio) y bio > 280
    $payload = [
        'username' => 'Nombre Invalido',
        'bio' => str_repeat('x', 300),
    ];

    $response = $this->patchJson('/profile', $payload);
    $response->assertStatus(422)
        ->assertJsonStructure([
            'message',
            'errors' => [
                'username',
                'bio',
            ],
        ])
        ->assertJsonPath('message', 'Validation failed');
});

