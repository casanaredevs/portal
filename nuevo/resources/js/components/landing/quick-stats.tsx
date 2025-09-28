import useCommunityMetrics, {
    type CommunityMetrics,
} from '@/hooks/use-community-metrics';
import { useEffect, useRef } from 'react';

export interface CommunityMetricsInput extends Partial<CommunityMetrics> {}

interface QuickStatsProps {
    initial?: CommunityMetrics; // métricas iniciales (Inertia prop)
    className?: string;
    autoRefreshMs?: number;
}

// Hook de animación numérica (count-up)
function useCountUp(value: number, previous: number | null, duration = 900) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const startVal = previous ?? value;
    useEffect(() => {
        if (!ref.current) return;
        if (startVal === value) {
            ref.current.textContent = formatNumber(value);
            return;
        }
        const el = ref.current;
        const start = performance.now();
        const diff = value - startVal;
        let frame: number;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (ts: number) => {
            const progress = Math.min(1, (ts - start) / duration);
            const eased = easeOutCubic(progress);
            const current = startVal + diff * eased;
            el.textContent = formatNumber(current);
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [value, startVal, duration]);
    return ref;
}

function formatNumber(n: number | string) {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (!isFinite(num)) return '0';
    // Formato compacto a partir de 1000
    if (num >= 1000) {
        return Intl.NumberFormat('es', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(Math.round(num));
    }
    return Math.round(num).toString();
}

export function QuickStats({
    initial,
    className = '',
    autoRefreshMs,
}: QuickStatsProps) {
    // Fallback estático si no se provee initial
    const staticFallback: CommunityMetrics = initial || {
        members: 128,
        events: 34,
        projects: 9,
        technologies: 56,
        updated_at: undefined,
    };

    const { metrics, previousMetrics, refreshing } = useCommunityMetrics(
        staticFallback,
        {
            intervalMs: autoRefreshMs ?? 60_000,
            enabled: true,
        },
    );

    const items: {
        key: keyof CommunityMetrics;
        label: string;
        suffix?: string;
    }[] = [
        { key: 'members', label: 'Miembros', suffix: '+' },
        { key: 'events', label: 'Eventos' },
        { key: 'projects', label: 'Proyectos' },
        { key: 'technologies', label: 'Tecnologías', suffix: '+' },
    ];

    return (
        <section
            aria-labelledby="quick-stats-heading"
            className={
                'relative mx-auto -mt-10 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
        >
            <h2 id="quick-stats-heading" className="sr-only">
                Indicadores de la comunidad
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 p-6 backdrop-blur-md sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/60">
                <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay select-none dark:opacity-[0.15]">
                    <div className="absolute top-10 -left-10 h-36 w-36 rounded-full bg-fuchsia-400 blur-2xl dark:bg-fuchsia-600" />
                    <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-amber-300 blur-2xl dark:bg-amber-500" />
                </div>
                <dl className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
                    {items.map((item) => {
                        const current = metrics[item.key] as number;
                        const prev = previousMetrics
                            ? (previousMetrics[item.key] as number)
                            : null;
                        const ref = useCountUp(current, prev);
                        return (
                            <div key={item.key} className="flex flex-col gap-1">
                                <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    {item.label}
                                </dt>
                                <dd
                                    className="text-3xl font-extrabold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-50"
                                    aria-live="off"
                                >
                                    <span ref={ref} aria-hidden="true" />
                                    {item.suffix && (
                                        <span aria-hidden="true">
                                            {item.suffix}
                                        </span>
                                    )}
                                    <span className="sr-only">
                                        {current}
                                        {item.suffix || ''}
                                    </span>
                                </dd>
                            </div>
                        );
                    })}
                </dl>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Cifras aproximadas – actualización automática.</span>
                    {refreshing && (
                        <span className="inline-flex items-center gap-1 text-fuchsia-600 dark:text-fuchsia-400">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
                            Refrescando…
                        </span>
                    )}
                    {metrics.updated_at && (
                        <time dateTime={metrics.updated_at}>
                            Última:{' '}
                            {new Date(metrics.updated_at).toLocaleTimeString(
                                'es-CO',
                                { hour: '2-digit', minute: '2-digit' },
                            )}
                        </time>
                    )}
                </div>
            </div>
        </section>
    );
}

export default QuickStats;
