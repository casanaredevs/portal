<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()?->id;
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($userId),
            ],

            'display_name' => ['nullable', 'string', 'max:120'],

            'username' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:32',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('users', 'username')->ignore($userId),
            ],

            'bio' => ['nullable', 'string', 'max:280'],

            'about' => ['nullable', 'string'],

            'location_city' => ['nullable', 'string', 'max:120'],

            'location_country' => ['nullable', 'string', 'size:2'],

            'privacy' => ['nullable', 'array'],

            'privacy.bio' => ['sometimes', Rule::in(['public', 'members', 'private'])],

            'privacy.about' => ['sometimes', Rule::in(['public', 'members', 'private'])],

            'privacy.location' => ['sometimes', Rule::in(['public', 'members', 'private'])],
        ];
    }

    /** Sanitiza campo about similar al request de perfil público */
    public function sanitizedAbout(?string $raw): ?string
    {
        if (!$raw) return null;
        $raw = preg_replace('#<script\b[^>]*>(.*?)</script>#is', '', $raw);
        $allowed = '<p><br><ul><ol><li><strong><b><em><i><code><pre><a>'; // subset permitido
        $clean = strip_tags($raw, $allowed);
        $clean = preg_replace('#on[a-z]+\s*=#i', '', $clean);
        $clean = preg_replace('#javascript:#i', '', $clean);
        $clean = preg_replace('/\n{3,}/', "\n\n", $clean);
        return trim($clean);
    }
}
