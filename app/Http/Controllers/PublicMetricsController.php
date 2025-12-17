<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Technology;
use App\Models\Event;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;

class PublicMetricsController extends Controller
{
    /**
     * Return public community metrics (cacheable).
     */
    public function __invoke(): JsonResponse
    {
        $data = Cache::remember('public.metrics', 300, function () {
            $members = User::count();
            $technologies = Technology::count();
            $projects = 0; // TODO: replace when Project model exists
            $events = Event::where('status','published')->count();
            return [
                'members' => $members,
                'technologies' => $technologies,
                'projects' => $projects,
                'events' => $events,
                'updated_at' => now()->toIso8601String(),
            ];
        });

        return response()
            ->json($data)
            ->header('Cache-Control', 'public, max-age=120, s-maxage=300');
    }
}
