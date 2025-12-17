<?php

use App\Models\User;

it('backfills missing usernames', function () {
    $u = User::factory()->create(['username' => null]);
    $this->artisan('profiles:backfill-usernames')
        ->assertExitCode(0);
    expect($u->fresh()->username)->not()->toBeNull();
});

it('dry-run does not persist usernames', function () {
    $u = User::factory()->create(['username' => null]);
    $this->artisan('profiles:backfill-usernames --dry-run')
        ->assertExitCode(0);
    expect($u->fresh()->username)->toBeNull();
});

