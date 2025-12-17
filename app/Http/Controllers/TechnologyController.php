<?php

namespace App\Http\Controllers;

use App\Models\Technology;
use Illuminate\Http\Request;

class TechnologyController extends Controller
{
    public function search(Request $request)
    {
        $q = (string)$request->query('q', '');
        $limit = (int)$request->query('limit', 15);
        $results = Technology::search($q, $limit)->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'slug' => $t->slug,
            'category' => $t->category,
            'icon' => $t->icon,
        ])->values();
        return response()->json([
            'data' => $results,
        ]);
    }

    public function catalog()
    {
        $results = Technology::cached()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'slug' => $t->slug,
            'category' => $t->category,
            'icon' => $t->icon,
        ]);
        return response()->json(['data' => $results]);
    }
}

