import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface MaintenancePayload {
    enabled: boolean;
    until: string | null;
    remainingSeconds: number | null;
    message: string | null;
    loginUrl: string;
}

interface PageProps {
    maintenance: MaintenancePayload;
    name: string;
    [key: string]: any; // allow additional shared inertia props
}

function formatRemaining(total: number) {
    if (total < 0) return 'Reanudando...';
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const parts: string[] = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    if (m || h || d) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

const MaintenancePage: React.FC = () => {
    const { maintenance, name } = usePage<PageProps>().props;
    const [remaining, setRemaining] = useState<number | null>(
        maintenance.remainingSeconds,
    );

    useEffect(() => {
        if (remaining === null) return;
        const id = setInterval(() => {
            setRemaining((r) => (r === null ? r : r - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [remaining]);

    return (
        <div className="min-h-screen w-full bg-neutral-50 px-4 py-16 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
            <div className="mx-auto max-w-xl space-y-8 rounded-lg border border-neutral-200/70 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {name}
                    </h1>
                    <h2 className="text-xl font-semibold tracking-tight text-amber-600 dark:text-amber-400">
                        Modo Mantenimiento Activo
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Estamos realizando tareas de mejora. Vuelve pronto.
                    </p>
                </div>
                {maintenance.message && (
                    <div className="rounded bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 ring-1 ring-amber-400/40 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-500/40">
                        {maintenance.message}
                    </div>
                )}
                {remaining !== null && (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Reanudación estimada en
                        </span>
                        <div className="rounded bg-neutral-900 px-4 py-2 font-mono text-lg font-semibold text-neutral-50 shadow dark:bg-neutral-800">
                            {formatRemaining(Math.max(0, remaining ?? 0))}
                        </div>
                    </div>
                )}
                <div className="pt-4 text-center">
                    <Link
                        href={maintenance.loginUrl}
                        className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-neutral-900"
                    >
                        Iniciar sesión
                    </Link>
                </div>
                <div className="pt-6 text-center text-xs text-neutral-400">
                    &copy; {new Date().getFullYear()} {name}
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
