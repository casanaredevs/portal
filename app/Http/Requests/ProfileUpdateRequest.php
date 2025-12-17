<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && $this->user()->id === auth()->id();
    }

    public function rules(): array
    {
        $userId = $this->user()->id ?? null;
        return [
            'display_name' => ['nullable','string','max:120'],
            'username' => [
                'sometimes','required','string','min:3','max:32','regex:/^[a-z0-9-]+$/',
                Rule::unique('users','username')->ignore($userId),
            ],
            'bio' => ['nullable','string','max:280'],
            'about' => ['nullable','string'],
            'location_city' => ['nullable','string','max:120'],
            'location_country' => ['nullable','string','size:2'],
            'availability' => ['nullable','array'],
            'availability.freelance' => ['sometimes','boolean'],
            'availability.mentoring' => ['sometimes','boolean'],
            'availability.hiring' => ['sometimes','boolean'],
            'privacy' => ['nullable','array'],
            'privacy.bio' => ['sometimes', Rule::in(['public','members','private'])],
            'privacy.about' => ['sometimes', Rule::in(['public','members','private'])],
            'privacy.location' => ['sometimes', Rule::in(['public','members','private'])],
        ];
    }

    public function sanitizeAbout(string $raw = null): ?string
    {
        if (!$raw) return null;
        // Eliminar por completo bloques <script> y su contenido
        $raw = preg_replace('#<script\b[^>]*>(.*?)</script>#is', '', $raw);
        // Permitir subconjunto muy limitado
        $allowed = '<p><br><ul><ol><li><strong><b><em><i><code><pre><a>';
        $clean = strip_tags($raw, $allowed);
        // Quitar atributos inline event handlers y javascript:
        $clean = preg_replace('#on[a-z]+\s*=#i', '', $clean);
        $clean = preg_replace('#javascript:#i', '', $clean);
        // Normalizar múltiples saltos <br> / espacios
        $clean = preg_replace('/\n{3,}/', "\n\n", $clean);
        return trim($clean);
    }
}
