<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class RolesPermissionsBulkAndSearchTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function actingAsAdmin()
    {
        $admin = User::role('admin')->first();
        if (!$admin) {
            $admin = User::factory()->create();
            $admin->assignRole('admin');
        }
        return $this->actingAs($admin);
    }

    public function test_search_filters_users(): void
    {
        // Crear usuarios con patrón (asegurando unicidad por iteración)
        for ($i=0;$i<5;$i++) { User::factory()->create(['username' => 'alpha-'.$i.'-'.Str::lower(Str::random(6))]); }
        for ($i=0;$i<3;$i++) { User::factory()->create(['username' => 'beta-'.$i.'-'.Str::lower(Str::random(6))]); }

        $resp = $this->actingAsAdmin()->getJson('/dashboard/admin/roles-permissions?search=beta');
        $resp->assertOk();
        $data = $resp->json('users.data');
        $this->assertNotEmpty($data);
        $this->assertTrue(collect($data)->every(fn($u)=> str_contains($u['username'],'beta-')));
    }

    public function test_pagination_per_page_limit(): void
    {
        User::factory()->count(40)->create();
        $resp = $this->actingAsAdmin()->getJson('/dashboard/admin/roles-permissions?per_page=10');
        $resp->assertOk();
        $this->assertCount(10, $resp->json('users.data'));
        $this->assertEquals(10, $resp->json('users.per_page'));
    }

    public function test_bulk_attach_roles(): void
    {
        $users = User::factory()->count(3)->create();
        $ids = $users->pluck('id')->all();
        $this->actingAsAdmin()
            ->post(route('admin.roles-permissions.users.bulk'), [
                'user_ids' => $ids,
                'roles' => ['moderator'],
                'mode' => 'attach'
            ])->assertRedirect();

        foreach ($users as $u) {
            $this->assertTrue($u->fresh()->hasRole('moderator'));
        }
    }

    public function test_bulk_sync_block_removing_all_admins(): void
    {
        // Asegurar dos admins
        $adminA = User::role('admin')->first();
        $adminB = User::factory()->create();
        $adminB->assignRole('admin');

        // Intentar sync para ambos removiendo admin
        $this->actingAsAdmin()
            ->post(route('admin.roles-permissions.users.bulk'), [
                'user_ids' => [$adminA->id, $adminB->id],
                'roles' => ['member'],
                'mode' => 'sync'
            ])->assertSessionHasErrors('roles');

        $this->assertTrue($adminA->fresh()->hasRole('admin'));
        $this->assertTrue($adminB->fresh()->hasRole('admin'));
    }
}
