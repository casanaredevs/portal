<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventStoreRequest;
use App\Http\Requests\EventUpdateRequest;
use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAnyEventPermission($request);
        $query = Event::query();

        if ($search = trim((string)$request->query('search'))) {
            $query->where(function(Builder $q) use ($search) {
                $q->where('title','like',"%$search%")
                  ->orWhere('summary','like',"%$search%")
                  ->orWhere('type','like',"%$search%")
                  ->orWhere('status','like',"%$search%" );
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status',$status);
        }
        if ($type = $request->query('type')) {
            $query->where('type',$type);
        }
        if (($when = $request->query('when')) && in_array($when,['upcoming','past'])) {
            if ($when === 'upcoming') $query->where('start_at','>=', now());
            else $query->where('start_at','<', now());
        }

        $query->orderByDesc('start_at');
        $perPage = (int)($request->query('per_page') ?? 15); if ($perPage < 5) $perPage = 5; if ($perPage > 100) $perPage = 100;
        $events = $query->paginate($perPage)->withQueryString();

        $can = [
            'create' => $request->user()->can('events.create'),
            'edit' => $request->user()->can('events.edit'),
            'delete' => $request->user()->can('events.delete'),
            'publish' => $request->user()->can('events.publish'),
        ];

        $payload = collect($events->items())->map(fn(Event $e) => [
            'id' => $e->id,
            'title' => $e->title,
            'slug' => $e->slug,
            'summary' => $e->summary,
            'type' => $e->type,
            'start_at' => $e->start_at?->toIso8601String(),
            'end_at' => $e->end_at?->toIso8601String(),
            'capacity' => $e->capacity,
            'seats_taken' => $e->seats_taken,
            'seats_remaining' => $e->seats_remaining,
            'status' => $e->status,
            'created_at' => $e->created_at?->toIso8601String(),
        ]);

        return Inertia::render('admin/events', [
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
                'when' => $when,
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
            'events' => $payload,
            'can' => $can,
        ]);
    }

    public function store(EventStoreRequest $request)
    {
        $data = $request->validated();
        // Forzar status permitido
        if (!isset($data['status'])) $data['status'] = 'draft';
        if ($data['status'] !== 'draft' && !$request->user()->can('events.publish')) {
            $data['status'] = 'draft';
        }
        $event = Event::create($data);
        return redirect()->route('admin.events.index')->with('flash', ['message' => 'Evento creado']);
    }

    public function update(EventUpdateRequest $request, Event $event)
    {
        $data = $request->validated();
        if (array_key_exists('status',$data)) {
            if (!$request->user()->can('events.publish')) {
                unset($data['status']);
            }
        }
        if (array_key_exists('capacity',$data) && $data['capacity'] !== null) {
            if ($data['capacity'] < $event->seats_taken) {
                return redirect()->back()->withErrors(['capacity' => 'La capacidad no puede ser menor a los cupos ya registrados ('.$event->seats_taken.').']);
            }
        }
        $event->fill($data)->save();
        return redirect()->back()->with('flash',['message' => 'Evento actualizado']);
    }

    public function destroy(Request $request, Event $event)
    {
        if (!$request->user()->can('events.delete')) {
            abort(403);
        }
        $event->delete();
        return redirect()->back()->with('flash',['message' => 'Evento eliminado']);
    }

    private function authorizeAnyEventPermission(Request $request): void
    {
        $user = $request->user();
        if (!$user) abort(401);
        if (!($user->can('events.create') || $user->can('events.edit') || $user->can('events.delete') || $user->can('events.publish'))) {
            abort(403);
        }
    }
}
