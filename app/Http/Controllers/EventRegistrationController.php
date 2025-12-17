<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class EventRegistrationController extends Controller
{
    public function store(Event $event): RedirectResponse
    {
        $user = auth()->user();
        if (!$user) {
            return back()->with('error','Debes iniciar sesión.');
        }

        try {
            DB::transaction(function () use ($event, $user) {
                // Bloqueo para evitar condiciones de carrera en aforo
                $eventRow = Event::where('id', $event->id)->lockForUpdate()->first();
                if ($eventRow->status !== 'published') {
                    abort(422,'El evento no está disponible.');
                }
                $already = EventRegistration::where('event_id',$eventRow->id)->where('user_id',$user->id)->exists();
                if ($already) {
                    abort(422,'Ya estás registrado.');
                }
                if (!is_null($eventRow->capacity) && $eventRow->seats_taken >= $eventRow->capacity) {
                    abort(422,'Aforo completo.');
                }
                EventRegistration::create(['event_id'=>$eventRow->id,'user_id'=>$user->id]);
                $eventRow->increment('seats_taken');
            });
            Cache::forget('public.metrics');
            Cache::forget('public.events.upcoming');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success','Registro completado.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $user = auth()->user();
        if (!$user) {
            return back()->with('error','Debes iniciar sesión.');
        }
        try {
            DB::transaction(function () use ($event, $user) {
                $eventRow = Event::where('id',$event->id)->lockForUpdate()->first();
                $registration = EventRegistration::where('event_id',$eventRow->id)->where('user_id',$user->id)->first();
                if (!$registration) {
                    abort(422,'No estabas registrado.');
                }
                $registration->delete();
                if ($eventRow->seats_taken > 0) {
                    $eventRow->decrement('seats_taken');
                }
            });
            Cache::forget('public.metrics');
            Cache::forget('public.events.upcoming');
        } catch (\Throwable $e) {
            return back()->with('error',$e->getMessage());
        }
        return back()->with('success','Registro cancelado.');
    }
}
