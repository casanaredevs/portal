<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExternalProfileRequest;
use App\Http\Requests\ExternalProfileReorderRequest;
use App\Models\ExternalProfile;
use App\Services\ExternalProfileNormalizer;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExternalProfileController extends Controller
{
    public function index(Request $request)
    {
        $profiles = $request->user()->externalProfiles()->orderBy('position')->get();
        return response()->json(['data' => $profiles]);
    }

    public function store(ExternalProfileRequest $request, ExternalProfileNormalizer $normalizer)
    {
        $user = $request->user();
        $data = $request->validated();
        $data['user_id'] = $user->id;
        $data['position'] = $data['position'] ?? ($user->externalProfiles()->max('position') + 1);
        $norm = $normalizer->normalize($data['platform'], $data['handle'] ?? null, $data['url'] ?? null);
        $data['handle'] = $norm['handle'];
        $data['url'] = $norm['url'];
        try {
            $profile = ExternalProfile::create($data);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return $request->expectsJson() ? response()->json(['message' => 'La plataforma ya está añadida.'], 422) : back()->withErrors(['platform' => 'La plataforma ya está añadida.']);
            }
            throw $e;
        }
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Perfil externo creado', 'data' => $profile], 201);
        }
        return redirect()->route('profile.edit');
    }

    public function update(ExternalProfileRequest $request, ExternalProfileNormalizer $normalizer, int $id)
    {
        $user = $request->user();
        $profile = ExternalProfile::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $data = $request->validated();
        if (isset($data['platform']) || isset($data['handle']) || isset($data['url'])) {
            $platform = $data['platform'] ?? $profile->platform;
            $handle = $data['handle'] ?? $profile->handle;
            $url = $data['url'] ?? $profile->url;
            $norm = $normalizer->normalize($platform, $handle, $url);
            $data['handle'] = $norm['handle'];
            $data['url'] = $norm['url'];
        }
        $profile->fill($data)->save();
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Perfil externo actualizado', 'data' => $profile]);
        }
        return redirect()->route('profile.edit');
    }

    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        $profile = ExternalProfile::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $profile->delete();
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Perfil externo eliminado']);
        }
        return redirect()->route('profile.edit');
    }

    public function reorder(ExternalProfileReorderRequest $request)
    {
        $user = $request->user();
        $submittedIds = $request->validated()['external_profile_ids'];
        $idsForValidation = $submittedIds;
        sort($idsForValidation);
        $userIds = $user->externalProfiles()->pluck('id')->all();
        $sortedUser = $userIds;
        sort($sortedUser);
        if ($idsForValidation !== $sortedUser) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Lista inválida (faltan o sobran elementos).'], 422);
            }
            return back()->withErrors(['external_profile_ids' => 'Lista inválida']);
        }
        DB::transaction(function () use ($user, $submittedIds) {
            foreach ($submittedIds as $position => $id) {
                ExternalProfile::where('id', $id)->where('user_id', $user->id)->update(['position' => $position + 1]);
            }
        });
        if ($request->expectsJson()) {
            $profiles = $user->externalProfiles()->orderBy('position')->get();
            return response()->json(['message' => 'Reordenado correcto', 'data' => $profiles]);
        }
        return redirect()->route('profile.edit');
    }
}
