@php($expires = now()->addDays(7)->toFormattedDateString())
<!DOCTYPE html>
<html lang="es" style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <body style="margin:0;padding:0;background:#f6f6f6;color:#111;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px 32px 8px 32px;background:#111;color:#fff;font-size:18px;font-weight:600;">
                {{ $appName }} – Confirma tu suscripción
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;font-size:14px;line-height:1.55;color:#111;">
                ¡Hola!<br><br>
                Recibimos una solicitud para suscribir <strong>{{ $email }}</strong> a las notificaciones de {{ $appName }}.
                Para completar el proceso haz clic en el botón inferior. Si no solicitaste esto, ignora este correo.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px;">
                <a href="{{ $confirmUrl }}" style="display:inline-block;background:#7e22ce;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:8px;">
                  Confirmar suscripción
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;font-size:12px;line-height:1.4;color:#444;">
                Este enlace caducará cuando confirmes o al limpiar el token (auto-limpieza programada). Si el botón no funciona copia y pega esta URL en tu navegador:<br>
                <span style="word-break:break-all;color:#2563eb;">{{ $confirmUrl }}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px;font-size:11px;line-height:1.4;color:#666;border-top:1px solid #e5e7eb;">
                Recibirás solo avisos relevantes (eventos, convocatorias, actualizaciones). Puedes cancelar en cualquier momento cuando habilitemos el enlace de baja.
                <br><br>
                &copy; {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
<?php
namespace App\Mail;

use App\Models\NewsletterSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewsletterConfirmMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public NewsletterSubscription $subscription)
    {
    }

    public function build(): self
    {
        $url = route('newsletter.confirm', $this->subscription->token);
        return $this
            ->subject('Confirma tu suscripción - '.config('app.name'))
            ->view('emails.newsletter.confirm')
            ->with([
                'confirmUrl' => $url,
                'email' => $this->subscription->email,
                'appName' => config('app.name'),
            ]);
    }
}

