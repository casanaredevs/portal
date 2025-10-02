<?php

use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function() {
    // Asegura permisos y roles sincronizados antes de cada prueba
    $this->artisan('permissions:sync')->assertSuccessful();
});

test('guest sees maintenance page with 503 when enabled', function() {
    Setting::put('maintenance', [
        'enabled' => true,
        'until' => Carbon::now()->addHour()->toIso8601String(),
        'message' => 'Mantenimiento programado',
    ]);

    $resp = $this->get(route('home'));
    $resp->assertStatus(503);
    $resp->assertSee('Modo Mantenimiento');
    $resp->assertSee('Iniciar sesión');
});

test('guest normal navigation when maintenance disabled', function() {
    Setting::put('maintenance', [
        'enabled' => false,
        'until' => null,
        'message' => null,
    ]);
    $this->get(route('home'))->assertOk();
});

test('user with bypass permission can navigate during maintenance', function() {
    Setting::put('maintenance', [
        'enabled' => true,
        'until' => Carbon::now()->addHour()->toIso8601String(),
        'message' => null,
    ]);
    $user = User::factory()->create();
    $user->assignRole('moderator'); // moderator tiene maintenance.bypass
    $this->actingAs($user);
    $this->get(route('home'))->assertOk();
});

test('user with manage permission can navigate during maintenance', function() {
    Setting::put('maintenance', [
        'enabled' => true,
        'until' => Carbon::now()->addHour()->toIso8601String(),
        'message' => null,
    ]);
    $admin = User::factory()->create();
    $admin->assignRole('admin'); // admin tiene todos los permisos
    $this->actingAs($admin);
    $this->get(route('home'))->assertOk();
});

test('maintenance auto-disables when until is past', function() {
    Setting::put('maintenance', [
        'enabled' => true,
        'until' => Carbon::now()->subMinutes(2)->toIso8601String(),
        'message' => null,
    ]);
    $this->get(route('home'))->assertOk();
    $cfg = Setting::get('maintenance');
    expect($cfg['enabled'])->toBeFalse();
});

