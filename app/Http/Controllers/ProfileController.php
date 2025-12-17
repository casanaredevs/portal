<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use App\Models\Technology;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Mostrar perfil público por username.
     */
    public function show(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $viewer = $request->user();
        $profile = $user->toPublicProfileArray($viewer);

        // Si la petición espera JSON (API) devolver JSON, si no Inertia.
        if ($request->wantsJson()) {
            return response()->json(['data' => $profile]);
        }

        return Inertia::render('profile/show', [
            'profile' => $profile,
        ]);
    }

    /**
     * Actualizar el perfil del usuario autenticado.
     */
    public function updateProfile(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        // Sanitizar about
        if (array_key_exists('about', $data)) {
            $data['about'] = $request->sanitizeAbout($data['about']);
        }

        // Si username sigue null y no se envió, sugerir
        if (empty($data['username']) && !$user->username) {
            $data['username'] = $user->generateUsernameSuggestion();
        }

        $user->fill($data);
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado',
            'data' => $user->toPublicProfileArray($user),
        ]);
    }

    /**
     * Mostrar el formulario de edición del perfil para el usuario autenticado.
     */
    public function editProfile(Request $request)
    {
        $user = $request->user();
        $user->load(['skills.technology', 'externalProfiles']);
        $skills = $user->skills()->with('technology')->ordered()->get()->map(fn($s) => [
            'id' => $s->id,
            'technology' => [
                'id' => $s->technology->id,
                'name' => $s->technology->name,
                'slug' => $s->technology->slug,
                'icon' => $s->technology->icon,
                'category' => $s->technology->category,
            ],
            'level' => $s->level,
            'years_experience' => $s->years_experience,
            'position' => $s->position,
            'visibility' => $s->visibility,
        ])->values();
        $externalProfiles = $user->externalProfiles()->orderBy('position')->get()->map(fn($p) => [
            'id' => $p->id,
            'platform' => $p->platform,
            'handle' => $p->handle,
            'url' => $p->url,
            'label' => $p->label,
            'icon' => $p->icon,
            'is_verified' => $p->is_verified,
            'position' => $p->position,
        ])->values();
        $catalog = Technology::cached()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'slug' => $t->slug,
            'icon' => $t->icon,
            'category' => $t->category,
        ]);
        return Inertia::render('profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => $user->display_name,
                'username' => $user->username,
                'bio' => $user->bio,
                'about' => $user->about,
                'location_city' => $user->location_city,
                'location_country' => $user->location_country,
                'availability' => $user->availability,
                'privacy' => $user->privacy,
            ],
            'skills' => $skills,
            'externalProfiles' => $externalProfiles,
            'technologyCatalog' => $catalog,
        ]);
    }
}
