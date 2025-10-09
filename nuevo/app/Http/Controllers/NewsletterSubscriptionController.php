<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterSubscriptionRequest;
use App\Models\NewsletterSubscription;
use Illuminate\Support\Str;

class NewsletterSubscriptionController extends Controller
{
    public function store(StoreNewsletterSubscriptionRequest $request)
    {
        $email = strtolower($request->input('email'));
        $ip = $request->ip();
        $target = route('home') . '#newsletter'; // redirigir siempre a la landing

        $existing = NewsletterSubscription::where('email', $email)->first();
        if ($existing) {
            if ($existing->status === 'unsubscribed') {
                $existing->status = 'pending';
                $existing->token = Str::random(40);
                $existing->consented_at = now();
                $existing->consent_ip = $ip;
                $existing->save();
                return redirect($target)->with([
                    'newsletter.status' => 'pending',
                    'newsletter.message' => 'Suscripción reactivada. Revisa tu correo cuando activemos la confirmación.',
                ]);
            }
            return redirect($target)->with([
                'newsletter.status' => $existing->status,
                'newsletter.message' => 'Si el correo es válido ya está registrado o en proceso.',
            ]);
        }

        NewsletterSubscription::create([
            'email' => $email,
            'status' => 'pending',
            'token' => Str::random(40),
            'consented_at' => now(),
            'consent_ip' => $ip,
        ]);

        return redirect($target)->with([
            'newsletter.status' => 'pending',
            'newsletter.message' => 'Hemos recibido tu solicitud. Pronto activaremos confirmación para validar tu correo.',
        ]);
    }

    public function confirm(string $token)
    {
        $sub = NewsletterSubscription::where('token', $token)->first();
        $homeTarget = route('home') . '#newsletter';
        if (!$sub) {
            return redirect($homeTarget)->with([
                'newsletter.status' => 'error',
                'newsletter.message' => 'Token inválido o expirado.',
            ]);
        }
        $sub->status = 'confirmed';
        $sub->confirmed_at = now();
        $sub->token = null;
        $sub->save();

        return redirect($homeTarget)->with([
            'newsletter.status' => 'confirmed',
            'newsletter.message' => '¡Suscripción confirmada! Gracias por unirte.',
        ]);
    }
}
