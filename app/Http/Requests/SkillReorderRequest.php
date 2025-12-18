<?php

namespace App\Http\Requests;

class SkillReorderRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'skill_ids' => ['required','array','min:1'],
            'skill_ids.*' => ['integer','distinct','exists:skills,id'],
        ];
    }
}
