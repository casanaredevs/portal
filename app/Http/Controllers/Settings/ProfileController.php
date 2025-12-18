<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Technology;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        // Carga de relaciones necesarias para el editor extendido
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

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            // Datos extendidos
            'profileUser' => [
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

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        if (array_key_exists('about', $data)) {
            $data['about'] = $request->sanitizedAbout($data['about']);
        }
        $emailChanging = isset($data['email']) && $data['email'] !== $user->email;
        $user->fill($data);
        if ($emailChanging) {
            $user->email_verified_at = null;
        }
        $user->save();
        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
