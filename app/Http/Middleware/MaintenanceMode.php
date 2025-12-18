<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        $config = Setting::get('maintenance', [
            'enabled' => false,
            'until' => null,
            'message' => null,
        ]);

        if (!is_array($config)) {
            $config = ['enabled' => false, 'until' => null, 'message' => null];
        }

        // Auto disable if expired
        if (($config['enabled'] ?? false) && !empty($config['until'])) {
            try {
                if (Carbon::parse($config['until'])->isPast()) {
                    $config['enabled'] = false;
                    $config['until'] = null;
                    Setting::put('maintenance', $config);
                }
            } catch (\Throwable $e) {
                // ignore parse errors
            }
        }

        if (($config['enabled'] ?? false) !== true) {
            return $next($request);
        }

        $user = $request->user();
        if ($user && ($user->can('maintenance.bypass') || $user->can('maintenance.manage'))) {
            return $next($request);
        }

        $routeName = optional($request->route())->getName();
        $exempt = [
            'login','login.store','password.request','password.email','password.reset','password.store'
        ];
        if ($routeName && in_array($routeName, $exempt, true)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Aplicación en mantenimiento',
                'maintenance' => $config,
            ], 503);
        }

        $untilIso = $config['until'] ?? null;
        $remainingSeconds = null;
        if ($untilIso) {
            try {
                $dt = Carbon::parse($untilIso);
                $remainingSeconds = now()->diffInSeconds($dt, false);
            } catch (\Throwable $e) {
                $remainingSeconds = null;
            }
        }

        return response()->view('maintenance', [
            'appName' => config('app.name'),
            'maintenance' => [
                'enabled' => true,
                'until' => $untilIso,
                'remainingSeconds' => $remainingSeconds,
                'message' => $config['message'] ?? null,
                'loginUrl' => route('login'),
            ],
        ], 503);
    }
}
