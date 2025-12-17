<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterSubscriptionRequest;
use App\Mail\NewsletterConfirmMail;
use App\Models\NewsletterSubscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            // Si estaba unsubscribed lo reactivamos y reenviamos correo
            if ($existing->status === 'unsubscribed') {
                $existing->status = 'pending';
                $existing->token = Str::random(40);
                $existing->consented_at = now();
                $existing->consent_ip = $ip;
                $existing->save();
                $this->sendConfirmation($existing);
                return redirect($target)->with([
                    'newsletter.status' => 'pending',
                    'newsletter.message' => 'Te enviamos un correo para confirmar tu suscripción (reactivada). Revisa tu bandeja.' ,
                ]);
            }
            // pending o confirmed
            if ($existing->status === 'pending') {
                // re‑enviar siempre un nuevo token para seguridad
                $existing->token = Str::random(40);
                $existing->save();
                $this->sendConfirmation($existing);
                return redirect($target)->with([
                    'newsletter.status' => 'pending',
                    'newsletter.message' => 'Te reenviamos el correo de confirmación. Revisa tu bandeja (y spam).',
                ]);
            }
            return redirect($target)->with([
                'newsletter.status' => 'confirmed',
                'newsletter.message' => 'Ya habías confirmado tu suscripción. ¡Gracias!',
            ]);
        }

        $subscription = NewsletterSubscription::create([
            'email' => $email,
            'status' => 'pending',
            'token' => Str::random(40),
            'consented_at' => now(),
            'consent_ip' => $ip,
        ]);

        $this->sendConfirmation($subscription);

        return redirect($target)->with([
            'newsletter.status' => 'pending',
            'newsletter.message' => 'Hemos enviado un correo con enlace de confirmación. Revisa tu bandeja.',
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

    protected function sendConfirmation(NewsletterSubscription $subscription): void
    {
        try {
            if (!config('mail.default')) {
                return; // sin mailer configurado
            }

            $mailable = new NewsletterConfirmMail($subscription);

            // Determinar si podemos usar queue de forma segura
            $queueDriver = config('queue.default');
            $useQueue = $queueDriver !== 'sync';

            if ($useQueue) {
                // Verificar existencia de tabla jobs solo si database driver
                if ($queueDriver === 'database') {
                    try {
                        \Illuminate\Support\Facades\DB::table(config('queue.connections.database.table', 'jobs'))->limit(1)->get();
                    } catch (\Throwable $e) {
                        $useQueue = false; // tabla no existe aún
                        Log::notice('Fallback a envío sync newsletter: tabla jobs no disponible', ['error' => $e->getMessage()]);
                    }
                }
            }

            if ($useQueue) {
                Mail::to($subscription->email)->queue($mailable);
            } else {
                Mail::to($subscription->email)->send($mailable);
            }
        } catch (\Throwable $e) {
            Log::warning('No se pudo enviar correo de confirmación newsletter', [
                'id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
