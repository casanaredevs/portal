<?php

use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\ExternalProfileController;
use App\Http\Controllers\MembersController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicEventController;
use App\Http\Controllers\PublicMetricsController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\TechnologyController;
use App\Http\Controllers\Admin\EventAdminController; // añadido
use App\Models\Event;
use App\Models\Technology;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $userId = auth()->id();
    $metrics = Cache::remember('public.metrics', 300, function () {
        return [
            'members' => User::count(),
            'technologies' => Technology::count(),
            'projects' => 0,
            'events' => Event::where('status','published')->count(),
            'updated_at' => now()->toIso8601String(),
        ];
    });
    $events = Event::upcoming()->limit(4)->get(['id','title','slug','type','start_at','capacity','seats_taken','summary']);
    $registeredIds = [];
    if ($userId) {
        $registeredIds = \App\Models\EventRegistration::whereIn('event_id',$events->pluck('id'))
            ->where('user_id',$userId)->pluck('event_id')->all();
    }
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
        'is_registered' => in_array($e->id,$registeredIds),
    ]);

    // Featured members (max 6)
    $featured = User::featured()
        ->with(['skills' => fn($q)=> $q->public()->with('technology')->orderBy('position')])
        ->limit(6)
        ->get();
    if ($featured->count() < 6) {
        $needed = 6 - $featured->count();
        $additional = User::whereNotIn('id', $featured->pluck('id'))
            ->withCount(['skills as public_skills_count' => fn($q)=> $q->public()])
            ->orderByDesc('public_skills_count')
            ->inRandomOrder()
            ->limit($needed)
            ->with(['skills' => fn($q)=> $q->public()->with('technology')->orderBy('position')])
            ->get();
        $featured = $featured->concat($additional);
    }
    $featuredPayload = $featured->map(fn($u) => [
        'id' => $u->id,
        'display_name' => $u->display_name,
        'username' => $u->username,
        'avatar_url' => $u->avatar_url,
        'bio' => $u->bio ? str($u->bio)->limit(100)->value() : null,
        'technologies' => $u->skills->take(5)->map(fn($s) => [
            'id' => $s->technology->id,
            'name' => $s->technology->name,
            'slug' => $s->technology->slug,
            'icon' => $s->technology->icon,
        ])->unique('id')->values()->all(),
        'is_featured' => (bool)($u->is_featured ?? false),
    ]);

    return Inertia::render('welcome', [
        'metrics' => $metrics,
        'upcomingEvents' => $eventsPayload,
        'featuredMembers' => $featuredPayload,
    ]);
})->name('home');

Route::get('/u/{username}', [ProfileController::class, 'show'])->name('profile.show');

// Búsqueda de tecnologías (pública)
Route::get('/technologies/search', [TechnologyController::class, 'search'])->name('technologies.search');
Route::get('/technologies/catalog', [TechnologyController::class, 'catalog'])->name('technologies.catalog');

// Listado público de eventos
Route::get('/events', [PublicEventController::class,'index'])->name('events.index');
// Página pública detalle de evento
Route::get('/events/{event:slug}', [PublicEventController::class,'show'])->name('events.show');

// Miembros (página pública)
Route::get('/members', [MembersController::class,'index'])->name('members.index');

// Página About (pública)
Route::get('/about', function() { return Inertia::render('about/index'); })->name('about');

// Página FAQ (pública)
Route::get('/faq', function() { return Inertia::render('faq/index'); })->name('faq');

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

    // Eventos registro (requiere auth)
    Route::post('/events/{event:slug}/register', [EventRegistrationController::class,'store'])->name('events.register');
    Route::delete('/events/{event:slug}/register', [EventRegistrationController::class,'destroy'])->name('events.unregister');
});

// Rutas JSON públicas
Route::get('/public/metrics', PublicMetricsController::class)->name('public.metrics');
Route::get('/public/events/upcoming', [PublicEventController::class,'upcoming'])->name('public.events.upcoming');

// Rutas de administración
Route::middleware(['auth','verified','permission:users.manage'])
    ->prefix('dashboard/admin')
    ->name('admin.')
    ->group(function() {
        Route::get('/', fn() => redirect()->route('admin.roles-permissions.index'))->name('index');
        Route::get('/roles-permissions', [\App\Http\Controllers\Admin\RolePermissionController::class,'index'])->name('roles-permissions.index');
        Route::post('/users/bulk/roles', [\App\Http\Controllers\Admin\RolePermissionController::class,'bulkUserRoles'])->name('roles-permissions.users.bulk');
        Route::post('/roles/{role}/permissions', [\App\Http\Controllers\Admin\RolePermissionController::class,'syncRolePermissions'])->name('roles-permissions.roles.sync');
        Route::post('/users/{user}/roles', [\App\Http\Controllers\Admin\RolePermissionController::class,'syncUserRoles'])->name('roles-permissions.users.sync');
    });

// Grupo administración de eventos (permiso granular, no requiere users.manage)
Route::middleware(['auth','verified','permission:events.create|events.edit|events.delete|events.publish'])
    ->prefix('dashboard/admin/events')
    ->name('admin.events.')
    ->group(function() {
        Route::get('/', [EventAdminController::class,'index'])->name('index');
        Route::post('/', [EventAdminController::class,'store'])->name('store');
        Route::patch('/{event}', [EventAdminController::class,'update'])->name('update');
        Route::delete('/{event}', [EventAdminController::class,'destroy'])->name('destroy');
    });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
