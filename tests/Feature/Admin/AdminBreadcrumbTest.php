<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Tests\TestCase;

class AdminBreadcrumbTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_roles_permissions_page_has_expected_breadcrumbs(): void
    {
        $admin = User::role('admin')->first();
        $this->assertNotNull($admin, 'Se requiere admin seed');

        $response = $this->actingAs($admin)->getJson('/dashboard/admin/roles-permissions');
        $response->assertOk();

        $breadcrumbs = $response->json('breadcrumbs');
        $this->assertIsArray($breadcrumbs);
        $this->assertCount(3, $breadcrumbs);
        $this->assertEquals('Dashboard', $breadcrumbs[0]['title']);
        $this->assertEquals('Administración', $breadcrumbs[1]['title']);
        $this->assertEquals('Roles & Permisos', $breadcrumbs[2]['title']);
    }
}
