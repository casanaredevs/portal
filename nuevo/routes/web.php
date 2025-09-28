<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ExternalProfileController;
use App\Http\Controllers\TechnologyController;
use App\Http\Controllers\PublicMetricsController;
use App\Http\Controllers\PublicEventController;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Technology;

Route::get('/', function () {
    $metrics = Cache::remember('public.metrics', 300, function () {
        return [
            'members' => User::count(),
            'technologies' => Technology::count(),
            'projects' => 0,
            'events' => 0,
            'updated_at' => now()->toIso8601String(),
        ];
    });
    $events = \App\Models\Event::upcoming()->limit(4)->get(['id','title','slug','type','start_at','capacity','seats_taken','summary']);
    $eventsPayload = $events->map(fn($e) => [
        'id' => $e->id,
        'title' => $e->title,
        'slug' => $e->slug,
        'type' => $e->type,
        'start_at' => $e->start_at->toIso8601String(),
        'capacity' => $e->capacity,
        'seats_taken' => $e->seats_taken,
        'seats_remaining' => $e->seats_remaining,
        'summary' => $e->summary,
    ]);
    return Inertia::render('welcome', [ 'metrics' => $metrics, 'upcomingEvents' => $eventsPayload ]);
})->name('home');

Route::get('/u/{username}', [ProfileController::class, 'show'])->name('profile.show');

// Búsqueda de tecnologías (pública)
Route::get('/technologies/search', [TechnologyController::class, 'search'])->name('technologies.search');
Route::get('/technologies/catalog', [TechnologyController::class, 'catalog'])->name('technologies.catalog');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Página de edición de perfil (ruta sin nombre para evitar colisión con settings/profile)
    Route::get('/profile/edit', [ProfileController::class, 'editProfile']);

    // Actualización de perfil (sin nombre para evitar colisión)
    Route::patch('/profile', [ProfileController::class, 'updateProfile']);

    // Skills
    Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');
    Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
    Route::patch('/skills/{id}', [SkillController::class, 'update'])->name('skills.update');
    Route::delete('/skills/{id}', [SkillController::class, 'destroy'])->name('skills.destroy');
    Route::post('/skills/reorder', [SkillController::class, 'reorder'])->name('skills.reorder');

    // External Profiles
    Route::get('/external-profiles', [ExternalProfileController::class, 'index'])->name('external-profiles.index');
    Route::post('/external-profiles', [ExternalProfileController::class, 'store'])->name('external-profiles.store');
    Route::patch('/external-profiles/{id}', [ExternalProfileController::class, 'update'])->name('external-profiles.update');
    Route::delete('/external-profiles/{id}', [ExternalProfileController::class, 'destroy'])->name('external-profiles.destroy');
    Route::post('/external-profiles/reorder', [ExternalProfileController::class, 'reorder'])->name('external-profiles.reorder');
});

// Rutas JSON públicas
Route::get('/public/metrics', PublicMetricsController::class)->name('public.metrics');
Route::get('/public/events/upcoming', [PublicEventController::class,'upcoming'])->name('public.events.upcoming');

// Página pública detalle de evento
Route::get('/events/{event:slug}', [PublicEventController::class,'show'])->name('events.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
