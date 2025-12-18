<?php

namespace Tests\Feature;

use App\Models\User;
use App\Permissions\Permission as PermEnum;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesPermissionsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Ejecuta DatabaseSeeder (incluye RolesAndPermissionsSeeder)
    }

    public function test_member_role_assigned_by_default(): void
    {
        $user = User::factory()->create();
        $this->assertTrue($user->hasRole('member'), 'El usuario debería tener rol member por defecto');
        $this->assertTrue($user->can(PermEnum::EventsRegister->value));
        $this->assertFalse($user->can(PermEnum::UsersManage->value));
    }

    public function test_admin_has_all_permissions(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $allPerms = Permission::pluck('name');
        foreach ($allPerms as $perm) {
            $this->assertTrue($admin->can($perm), "Admin debería poder permiso {$perm}");
        }
    }

    public function test_moderator_permissions_subset(): void
    {
        $moderator = User::factory()->create();
        $moderator->assignRole('moderator');

        $this->assertTrue($moderator->can(PermEnum::SkillsModerate->value));
        $this->assertTrue($moderator->can(PermEnum::EventsPublish->value));
        $this->assertFalse($moderator->can(PermEnum::UsersManage->value));
    }

    public function test_permission_middleware_blocks_and_allows(): void
    {
        Route::middleware(['web','permission:'.PermEnum::EventsCreate->value])->get('/_perm-test', fn() => 'OK');

        $member = User::factory()->create(); // member no tiene events.create
        $this->actingAs($member);
        $this->get('/_perm-test')->assertStatus(403);

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
        $this->get('/_perm-test')->assertOk()->assertSee('OK');
    }

    public function test_assign_new_role_runtime_without_code_change(): void
    {
        // Crear nuevo permiso dinámico ajeno a la enum (simula extensión en runtime)
        Permission::firstOrCreate(['name' => 'reports.view']);
        $role = Role::firstOrCreate(['name' => 'analyst']);
        $role->syncPermissions(['reports.view']);

        $user = User::factory()->create();
        $user->assignRole('analyst');

        $this->assertTrue($user->hasRole('analyst'));
        $this->assertTrue($user->can('reports.view'));
    }
}
