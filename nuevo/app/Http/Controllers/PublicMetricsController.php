<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Technology;
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
            // Placeholder counts (projects & events pending future models)
            $members = User::count();
            $technologies = Technology::count();
            $projects = 0; // TODO: replace when Project model exists
            $events = 0;   // TODO: replace when Event model exists

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

