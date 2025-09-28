<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Enums\SkillLevel;
use App\Enums\SkillVisibility;

class SkillStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'technology_id' => ['required','integer','exists:technologies,id'],
            'level' => ['required', Rule::in(SkillLevel::values())],
            'years_experience' => ['nullable','integer','min:0','max:60'],
            'visibility' => ['nullable', Rule::in(SkillVisibility::values())],
        ];
    }
}
