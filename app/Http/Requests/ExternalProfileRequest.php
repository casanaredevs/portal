<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Enums\ExternalPlatform;

class ExternalProfileRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $platformRequirement = $this->isMethod('POST') ? 'required' : 'sometimes';
        return [
            // platform requerido solo al crear, opcional al actualizar
            'platform' => [$platformRequirement, Rule::in(ExternalPlatform::values())],
            'handle' => ['nullable','string','max:100'], // puede inferirse desde url
            'url' => ['nullable','url','max:255'],
            'label' => ['nullable','string','max:120'],
            'icon' => ['nullable','string','max:120'],
            'position' => ['sometimes','integer','min:0','max:500'],
        ];
    }
}
