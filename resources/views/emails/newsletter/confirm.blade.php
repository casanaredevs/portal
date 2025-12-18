<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirma tu suscripción</title>
    <style>
        /* Minimal, email-safe inline styles */
        .container { max-width:600px; margin:0 auto; padding:24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a; }
        .btn { display:inline-block; padding:12px 20px; background:#111827; color:#ffffff !important; text-decoration:none; border-radius:8px; font-weight:600; }
        .muted { color:#475569; font-size:14px; }
        .card { border:1px solid #e5e7eb; border-radius:12px; padding:24px; }
        a { color:#111827; }
    </style>
</head>
<body>
<div class="container">
    <div class="card">
        <h1 style="margin-top:0; margin-bottom:8px;">Confirma tu suscripción</h1>
        <p style="margin-top:0;">Hola,</p>
        <p>Recibimos una solicitud para suscribirte al boletín de {{ $appName ?? config('app.name') }} con el correo <strong>{{ $email }}</strong>.</p>
        <p>Para comenzar a recibir notificaciones sobre eventos y novedades, por favor confirma tu suscripción haciendo clic en el siguiente botón:</p>
        <p style="margin:24px 0;">
            <a href="{{ $confirmUrl }}" class="btn" target="_blank" rel="noopener">Confirmar suscripción</a>
        </p>
        <p class="muted">Si tú no realizaste esta solicitud, puedes ignorar este mensaje.</p>
        <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
        <p class="muted">¿Problemas con el botón? Copia y pega este enlace en tu navegador:<br>
            <a href="{{ $confirmUrl }}">{{ $confirmUrl }}</a>
        </p>
    </div>
    <p class="muted" style="text-align:center; margin-top:16px;">© {{ date('Y') }} {{ $appName ?? config('app.name') }}</p>
</div>
</body>
</html>

