<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class MaintenanceAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $config = Setting::get('maintenance', [
            'enabled' => false,
            'until' => null,
            'message' => null,
        ]);
        if (!is_array($config)) {
            $config = ['enabled' => false,'until'=>null,'message'=>null];
        }
        return Inertia::render('admin/maintenance', [
            'maintenance' => $config,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'enabled' => ['required','boolean'],
            'until' => ['nullable','string'], // ISO string
            'message' => ['nullable','string','max:500'],
        ]);

        $config = [
            'enabled' => (bool)$data['enabled'],
            'until' => null,
            'message' => $data['message'] ?? null,
        ];
        if ($config['enabled'] && !empty($data['until'])) {
            try {
                $dt = Carbon::parse($data['until']);
                if ($dt->isFuture()) {
                    $config['until'] = $dt->toIso8601String();
                }
            } catch (\Throwable $e) {
                // ignore parse errors -> queda null
            }
        }
        if (!$config['enabled']) {
            $config['until'] = null;
        }
        Setting::put('maintenance', $config);
        return back()->with('flash', ['maintenance_saved' => true]);
    }
}

