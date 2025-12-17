<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AdminEventsTest extends TestCase
{
    use RefreshDatabase;

    private function createUserWithPerms(array $perms): User
    {
        $user = User::factory()->create();
        foreach ($perms as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            $user->givePermissionTo($perm);
        }
        return $user;
    }

    public function test_index_requires_any_event_permission(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/dashboard/admin/events')
            ->assertStatus(403);

        $user2 = $this->createUserWithPerms(['events.create']);
        $response = $this->actingAs($user2)->get('/dashboard/admin/events');
        $response->assertStatus(200);
        // No SSR del contenido React, validamos componente Inertia entregado
        $response->assertSee('"component":"admin\/events"');
    }

    public function test_create_event_as_draft_when_user_cannot_publish(): void
    {
        $user = $this->createUserWithPerms(['events.create']);
        $payload = [
            'title' => 'Evento de Prueba',
            'summary' => 'Resumen',
            'description' => 'Descripción',
            'type' => 'kata',
            'start_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'end_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'capacity' => 50,
            'status' => 'published', // debería forzarse a draft
        ];
        $this->actingAs($user)->post('/dashboard/admin/events', $payload)
            ->assertRedirect('/dashboard/admin/events');
        $this->assertDatabaseHas('events', [
            'title' => 'Evento de Prueba',
            'status' => 'draft',
        ]);
    }

    public function test_create_event_published_with_publish_permission(): void
    {
        $user = $this->createUserWithPerms(['events.create','events.publish']);
        $payload = [
            'title' => 'Evento Publicado',
            'type' => 'taller',
            'start_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'capacity' => 20,
            'status' => 'published',
        ];
        $this->actingAs($user)->post('/dashboard/admin/events', $payload)
            ->assertRedirect('/dashboard/admin/events');
        $this->assertDatabaseHas('events', [
            'title' => 'Evento Publicado',
            'status' => 'published',
        ]);
    }

    public function test_update_event_capacity_validation_against_seats_taken(): void
    {
        $user = $this->createUserWithPerms(['events.edit']);
        $event = Event::factory()->create(['capacity' => 30, 'seats_taken' => 10]);
        // Intentar reducir capacidad a menos que seats_taken
        $this->actingAs($user)->patch('/dashboard/admin/events/'.$event->id, ['capacity' => 5])
            ->assertSessionHasErrors(['capacity']);
        $this->assertDatabaseHas('events', [ 'id' => $event->id, 'capacity' => 30 ]);
    }

    public function test_update_event_publish_requires_permission(): void
    {
        $user = $this->createUserWithPerms(['events.edit']);
        $event = Event::factory()->draft()->create(['status' => 'draft']);
        $this->actingAs($user)->patch('/dashboard/admin/events/'.$event->id, ['status' => 'published'])
            ->assertRedirect();
        $this->assertDatabaseHas('events', ['id' => $event->id, 'status' => 'draft']);

        $publisher = $this->createUserWithPerms(['events.edit','events.publish']);
        $this->actingAs($publisher)->patch('/dashboard/admin/events/'.$event->id, ['status' => 'published'])
            ->assertRedirect();
        $this->assertDatabaseHas('events', ['id' => $event->id, 'status' => 'published']);
    }

    public function test_delete_event_requires_permission(): void
    {
        $event = Event::factory()->create();
        $noPerm = $this->createUserWithPerms(['events.edit']);
        $this->actingAs($noPerm)->delete('/dashboard/admin/events/'.$event->id)
            ->assertStatus(403);
        $this->assertDatabaseHas('events', ['id' => $event->id]);

        $deleter = $this->createUserWithPerms(['events.delete']);
        $this->actingAs($deleter)->delete('/dashboard/admin/events/'.$event->id)
            ->assertRedirect();
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }
}
