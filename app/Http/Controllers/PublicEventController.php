<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Return upcoming published events (limited) as JSON.
     */
    public function upcoming(): JsonResponse
    {
        $cacheKey = 'public.events.upcoming';
        $userId = auth()->id();
        // Para incluir estado de registro por usuario autenticado, no cacheamos el is_registered por usuario; generamos después.
        $events = Cache::remember($cacheKey, 60, function () {
            return Event::upcoming()->limit(8)->get(['id','title','slug','type','start_at','capacity','seats_taken','summary']);
        });
        $registeredIds = [];
        if ($userId) {
            $registeredIds = EventRegistration::where('user_id',$userId)->whereIn('event_id',$events->pluck('id'))
                ->pluck('event_id')->all();
        }
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
                'is_registered' => in_array($e->id,$registeredIds),
            ]),
            'updated_at' => now()->toIso8601String(),
        ])->header('Cache-Control','public, max-age=60');
    }

    public function index(Request $request)
    {
        $userId = auth()->id();
        $query = Event::query()->where('status','published');
        // Próximos por defecto
        $query->where('start_at','>=', now());
        if ($type = $request->query('type')) {
            $query->where('type',$type);
        }
        if ($status = $request->query('status')) {
            $query->where('status',$status);
        }
        $events = $query->orderBy('start_at')->paginate(12)->withQueryString();
        $registeredIds = [];
        if ($userId) {
            $registeredIds = EventRegistration::where('user_id',$userId)->whereIn('event_id', collect($events->items())->pluck('id'))
                ->pluck('event_id')->all();
        }
        $payload = collect($events->items())->map(fn($e) => [
            'id' => $e->id,
            'title' => $e->title,
            'slug' => $e->slug,
            'type' => $e->type,
            'start_at' => $e->start_at->toIso8601String(),
            'capacity' => $e->capacity,
            'seats_taken' => $e->seats_taken,
            'seats_remaining' => $e->seats_remaining,
            'summary' => $e->summary,
            'is_registered' => in_array($e->id,$registeredIds),
        ]);

        return Inertia::render('events/index', [
            'filters' => [
                'type' => $type,
                'status' => $status,
            ],
            'pagination' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
            'events' => $payload,
        ]);
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event): Response
    {
        $user = auth()->user();
        $isRegistered = false;
        if ($user) {
            $isRegistered = $event->registrations()->where('user_id',$user->id)->exists();
        }
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
                'is_registered' => $isRegistered,
            ]
        ]);
    }
}
