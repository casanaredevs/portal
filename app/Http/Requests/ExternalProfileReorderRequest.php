<?php

namespace App\Http\Requests;

class ExternalProfileReorderRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'external_profile_ids' => ['required','array','min:1'],
            'external_profile_ids.*' => ['integer','distinct','exists:external_profiles,id'],
        ];
    }
}
