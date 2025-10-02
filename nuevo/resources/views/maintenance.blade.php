<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{ $appName }} - Modo Mantenimiento</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        html, body { overflow-x:hidden; }
        html,body { height:100%; margin:0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; }
        body { display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f1f5f9; box-sizing:border-box; padding:1.25rem; }
        .card { max-width:560px; width:100%; background:#1e293b; padding:2.25rem 2rem; border-radius:1rem; box-shadow:0 10px 25px -5px rgba(0,0,0,.4); box-sizing:border-box; }
        h1 { margin:0 0 .5rem; font-size:1.5rem; line-height:1.2; }
        h2 { margin:.25rem 0 1rem; font-size:1.125rem; color:#fbbf24; }
        p { line-height:1.5; }
        .badge { display:inline-block; background:#fbbf24; color:#1e293b; font-weight:600; font-size:.625rem; padding:.35rem .55rem; border-radius:.35rem; letter-spacing:.05em; text-transform:uppercase; }
        .countdown { font-family:monospace; font-size:1.15rem; font-weight:600; background:#0f172a; padding:.5rem .75rem; border-radius:.5rem; display:inline-block; margin-top:.5rem; }
        a.btn { display:inline-flex; align-items:center; gap:.5rem; background:#2563eb; text-decoration:none; color:#fff; font-weight:600; padding:.75rem 1.1rem; border-radius:.55rem; margin-top:1.25rem; font-size:.9rem; box-shadow:0 2px 6px -1px rgba(0,0,0,.4); width:100%; max-width:100%; white-space:normal; word-break:break-word; }
        a.btn:hover { background:#1d4ed8; }
        footer { margin-top:2rem; font-size:.65rem; letter-spacing:.05em; text-transform:uppercase; opacity:.5; }
        .msg { background:#334155; padding:1rem .9rem; border-left:4px solid #fbbf24; margin:.75rem 0 1.25rem; border-radius:.35rem; font-size:.9rem; }
        /* Responsive para móviles */
        @media (max-width: 520px) {
            body { padding:0.85rem; }
            .card { padding:1.6rem 1.15rem 1.9rem; border-radius:0.85rem; }
            h1 { font-size:1.35rem; }
            h2 { font-size:1rem; margin-top:0.5rem; }
            .badge { font-size:0.55rem; padding:.3rem .5rem; }
            .msg { font-size:0.9rem; padding:0.85rem 0.75rem; }
            .countdown { font-size:1rem; padding:.45rem .65rem; }
            a.btn { width:100%; font-size:0.9rem; padding:.85rem 1rem; }
            .card > div[style*='display:flex'][style*='flex-wrap:wrap'] { flex-direction:column; align-items:flex-start; gap:.75rem; }
        }
        /* Prefiere reducción de movimiento */
        @media (prefers-reduced-motion: reduce) {
            .countdown { transition:none; }
        }
        .header-row {display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.85rem;margin-bottom:.75rem;}
        .header-row .badge {margin-left:0;}
        .maintenance-logo {height:auto;max-height:60px;width:auto;max-width:240px;display:block;object-fit:contain;}
        @media (max-width:520px){
            .maintenance-logo {max-height:48px;max-width:180px;}
            .header-row {gap:.65rem;}
        }
        /* Prefer-wrap fallback if inline style still present */
        .header-row img {max-width:100%;height:auto;}
    </style>
</head>
<body>
    <div class="card">
        @php($hasLogo = file_exists(public_path('logo.svg')))
        <div class="header-row">
            @if($hasLogo)
                <img class="maintenance-logo" src="{{ asset('logo.svg') }}" alt="Logo {{ $appName }}" />
            @else
                <h1 style="margin:0;font-size:1.35rem;">{{ $appName }}</h1>
            @endif
            <span class="badge">Modo Mantenimiento</span>
        </div>
        <p>Estamos realizando tareas de actualización y mejoras. Gracias por tu paciencia.</p>
        @if(($maintenance['message'] ?? null))
            <div class="msg">{{ $maintenance['message'] }}</div>
        @endif
        @if(($maintenance['remainingSeconds'] ?? null) !== null && ($maintenance['remainingSeconds'] ?? 0) > 0)
            <div>
                <div style="font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;opacity:.6;margin-bottom:.25rem;">Tiempo restante estimado</div>
                <div id="countdown" class="countdown">...</div>
            </div>
        @endif
        <a class="btn" href="{{ $maintenance['loginUrl'] }}">Iniciar sesión</a>
        <footer>&copy; {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.</footer>
    </div>
    @if(($maintenance['remainingSeconds'] ?? null) !== null)
    <script>
        (function(){
            let remaining = Math.floor({{ (int)($maintenance['remainingSeconds'] ?? 0) }});
            const el = document.getElementById('countdown');
            function fmt(sec){
                if(sec < 0) return 'Reiniciando...';
                const d = Math.floor(sec/86400); sec%=86400;
                const h = Math.floor(sec/3600); sec%=3600;
                const m = Math.floor(sec/60); sec%=60;
                const parts=[]; if(d) parts.push(d+'d'); if(h||d) parts.push(h+'h'); if(m||h||d) parts.push(m+'m'); parts.push(sec+'s'); return parts.join(' ');
            }
            function tick(){ if(el) el.textContent = fmt(remaining); remaining--; setTimeout(tick,1000); }
            tick();
        })();
    </script>
    @endif
</body>
</html>
