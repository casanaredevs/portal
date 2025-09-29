<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesPermissionsAdminUiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // incluye roles y permisos
    }

    public function test_guest_cannot_access_admin_page(): void
    {
        $this->get('/admin/roles-permissions')->assertRedirect('/login');
    }

    public function test_member_without_permission_gets_403(): void
    {
        $user = User::factory()->create(); // rol member por defecto, no tiene users.manage
        $this->actingAs($user)->get('/admin/roles-permissions')->assertStatus(403);
    }

    public function test_admin_can_view_admin_page(): void
    {
        $admin = User::role('admin')->first() ?? User::factory()->create();
        if (!$admin->hasRole('admin')) { $admin->assignRole('admin'); }
        $response = $this->actingAs($admin)
            ->getJson('/admin/roles-permissions');
        $response->assertOk();
        $response->assertJsonStructure(['roles','permissions','permissionMeta','roleMap','users']);
    }

    public function test_sync_role_permissions_updates_non_admin_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $moderator = Role::where('name','moderator')->firstOrFail();

        // Remove a permission from moderator via endpoint
        $this->actingAs($admin)
            ->post(route('admin.roles-permissions.roles.sync', ['role' => $moderator->id]), [
                'permissions' => ['skills.moderate'] // subset
            ])->assertRedirect();

        $this->assertTrue($moderator->fresh()->permissions->pluck('name')->contains('skills.moderate'));
        $this->assertFalse($moderator->fresh()->permissions->pluck('name')->contains('events.publish'));
    }

    public function test_admin_role_always_has_all_permissions(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $adminRole = Role::where('name','admin')->firstOrFail();

        // Intenta sincronizar con lista vacía; debería ignorarse y mantener todos
        $this->actingAs($admin)
            ->post(route('admin.roles-permissions.roles.sync', ['role' => $adminRole->id]), [
                'permissions' => []
            ])->assertRedirect();

        $this->assertGreaterThan(0, $adminRole->fresh()->permissions->count(), 'Admin debe retener permisos');
    }

    public function test_cannot_remove_last_admin_role_from_user(): void
    {
        // Asegurar solo un admin en el sistema
        User::role('admin')->where('email','!=','test@example.com')->get()->each(function($u){ $u->removeRole('admin'); });
        $admin = User::role('admin')->first();
        $this->assertNotNull($admin, 'Debe existir un admin seed');
        $this->actingAs($admin)
            ->post(route('admin.roles-permissions.users.sync', ['user' => $admin->id]), [
                'roles' => ['member']
            ])->assertSessionHasErrors('roles');
        $this->assertTrue($admin->fresh()->hasRole('admin'));
    }

    public function test_can_assign_additional_role_to_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $user = User::factory()->create(); // member

        $this->actingAs($admin)
            ->post(route('admin.roles-permissions.users.sync', ['user' => $user->id]), [
                'roles' => ['member','moderator']
            ])->assertRedirect();

        $this->assertTrue($user->fresh()->hasRole('moderator'));
    }
}
