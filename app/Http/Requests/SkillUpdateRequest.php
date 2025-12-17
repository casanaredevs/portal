<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Enums\SkillLevel;
use App\Enums\SkillVisibility;

class SkillUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'level' => ['sometimes', Rule::in(SkillLevel::values())],
            'years_experience' => ['sometimes','nullable','integer','min:0','max:60'],
            'visibility' => ['sometimes', Rule::in(SkillVisibility::values())],
        ];
    }
}
