<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ExternalProfileController;
use App\Http\Controllers\TechnologyController;

Route::get('/', function () {
    return Inertia::render('welcome');
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

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
