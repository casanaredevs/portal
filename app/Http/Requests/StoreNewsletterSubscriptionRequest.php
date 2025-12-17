<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsletterSubscriptionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required','email:rfc','max:255'],
            'consent' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Formato de correo inválido.',
            'consent.accepted' => 'Debes aceptar recibir notificaciones.',
        ];
    }
}
