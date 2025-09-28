<?php

namespace App\Http\Controllers;

use App\Http\Requests\SkillStoreRequest;
use App\Http\Requests\SkillUpdateRequest;
use App\Http\Requests\SkillReorderRequest;
use App\Models\Skill;
use App\Models\Technology;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SkillController extends Controller
{
    /**
     * Listar skills del usuario autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $skills = $user->skills()->with('technology')->ordered()->get();
        return response()->json(['data' => $skills]);
    }

    private function isApi(Request $request): bool
    {
        return !$request->header('X-Inertia') && $request->expectsJson();
    }

    /**
     * Crear nueva skill.
     */
    public function store(SkillStoreRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $data['user_id'] = $user->id;
        $data['visibility'] = $data['visibility'] ?? 'public';

        // Calcular position si no se da.
        $data['position'] = $user->skills()->max('position') + 1;

        try {
            $skill = Skill::create($data);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') { // duplicate
                if ($this->isApi($request)) return response()->json(['message' => 'La tecnología ya está añadida.'], 422);
                return back()->withErrors(['technology_id' => 'La tecnología ya está añadida.']);
            }
            throw $e;
        }

        if ($this->isApi($request)) {
            $skill->load('technology');
            return response()->json(['message' => 'Skill creada', 'data' => $skill], 201);
        }
        return redirect()->route('profile.edit');
    }

    /**
     * Actualizar skill existente.
     */
    public function update(SkillUpdateRequest $request, int $id)
    {
        $user = $request->user();
        $skill = Skill::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $skill->fill($request->validated())->save();
        $skill->load('technology');
        if ($this->isApi($request)) {
            return response()->json(['message' => 'Skill actualizada', 'data' => $skill]);
        }
        return redirect()->route('profile.edit');
    }

    /**
     * Eliminar skill.
     */
    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        $skill = Skill::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $skill->delete();
        if ($this->isApi($request)) {
            return response()->json(['message' => 'Skill eliminada']);
        }
        return redirect()->route('profile.edit');
    }

    /**
     * Reordenar skills (array de IDs en orden deseado).
     */
    public function reorder(SkillReorderRequest $request)
    {
        $user = $request->user();
        $submittedIds = $request->validated()['skill_ids'];
        $idsForValidation = $submittedIds; sort($idsForValidation);
        $userSkillIds = $user->skills()->pluck('id')->all(); $sortedUser = $userSkillIds; sort($sortedUser);
        if ($idsForValidation !== $sortedUser) {
            if ($this->isApi($request)) return response()->json(['message' => 'Lista de skills inválida (faltan o sobran elementos).'], 422);
            return back()->withErrors(['skill_ids' => 'Lista de skills inválida']);
        }
        DB::transaction(function () use ($user, $submittedIds) {
            foreach ($submittedIds as $position => $id) {
                Skill::where('id', $id)->where('user_id', $user->id)->update(['position' => $position + 1]);
            }
        });
        if ($this->isApi($request)) {
            $skills = $user->skills()->with('technology')->ordered()->get();
            return response()->json(['message' => 'Reordenado correcto', 'data' => $skills]);
        }
        return redirect()->route('profile.edit');
    }
}
