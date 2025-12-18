<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Technology;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MembersController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string)$request->query('q','')) ?: null;
        $tech = trim((string)$request->query('tech','')) ?: null;
        $perPage = 18;

        $query = User::query()
            ->with(['skills' => fn($s)=> $s->public()->with('technology')->orderBy('position')])
            ->withCount(['skills as public_skills_count' => fn($s)=> $s->public()]);

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('display_name','like',"%$q%")
                    ->orWhere('username','like',"%$q%")
                    ->orWhere('bio','like',"%$q%")
                    ->orWhere('about','like',"%$q%");
            });
        }

        if ($tech) {
            $query->whereHas('skills.technology', function($t) use ($tech) {
                $t->where('slug',$tech)->orWhere('name','like',"%$tech%");
            });
        }

        $query->orderByDesc('is_featured')->orderByDesc('public_skills_count')->orderBy('id');

        $paginator = $query->paginate($perPage)->withQueryString();

        $members = collect($paginator->items())->map(function(User $u) {
            return [
                'id' => $u->id,
                'display_name' => $u->display_name,
                'username' => $u->username,
                'avatar_url' => $u->avatar_url,
                'bio' => $u->bio ? str($u->bio)->limit(140)->value() : null,
                'is_featured' => (bool)($u->is_featured ?? false),
                'technologies' => $u->skills->take(6)->map(fn($s) => [
                    'id' => $s->technology->id,
                    'name' => $s->technology->name,
                    'slug' => $s->technology->slug,
                    'icon' => $s->technology->icon,
                ])->unique('id')->values()->all(),
            ];
        });

        // Catálogo rápido de tecnologías para filtro (limitado)
        $techCatalog = Technology::orderBy('name')->limit(150)->get(['id','name','slug','icon'])
            ->map(fn($t)=> [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'icon' => $t->icon,
            ]);

        return Inertia::render('members/index', [
            'filters' => [ 'q' => $q, 'tech' => $tech ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'members' => $members,
            'technologies' => $techCatalog,
        ]);
    }
}

