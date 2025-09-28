<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Return upcoming published events (limited) as JSON.
     */
    public function upcoming(): JsonResponse
    {
        $events = Event::upcoming()
            ->limit(8)
            ->get(['id','title','slug','type','start_at','capacity','seats_taken','summary']);

        return response()->json([
            'data' => $events->map(fn($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'slug' => $e->slug,
                'type' => $e->type,
                'start_at' => $e->start_at->toIso8601String(),
                'capacity' => $e->capacity,
                'seats_taken' => $e->seats_taken,
                'seats_remaining' => $e->seats_remaining,
                'summary' => $e->summary,
            ]),
            'updated_at' => now()->toIso8601String(),
        ])->header('Cache-Control','public, max-age=60');
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event): Response
    {
        return Inertia::render('events/show', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'type' => $event->type,
                'start_at' => $event->start_at?->toIso8601String(),
                'end_at' => $event->end_at?->toIso8601String(),
                'capacity' => $event->capacity,
                'seats_taken' => $event->seats_taken,
                'seats_remaining' => $event->seats_remaining,
                'summary' => $event->summary,
                'description' => $event->description,
                'status' => $event->status,
                'created_at' => $event->created_at?->toIso8601String(),
            ]
        ]);
    }
}
