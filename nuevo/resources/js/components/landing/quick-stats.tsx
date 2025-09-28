export interface CommunityMetrics {
    members: number; // miembros activos / con perfil público
    events: number; // eventos históricos realizados
    projects: number; // proyectos publicados / visibles
    technologies: number; // tecnologías representadas (distintas)
}

interface QuickStatsProps {
    metrics?: Partial<CommunityMetrics>; // futuro: datos dinámicos inyectados
    loading?: boolean; // futuro: estado de carga (skeleton)
    className?: string;
}

// Valores estáticos MVP (placeholders). Futuro: reemplazar por fetch server-side (Inertia props) o API pública cacheable.
const STATIC_BASE: CommunityMetrics = {
    members: 128,
    events: 34,
    projects: 9,
    technologies: 56,
};

export function QuickStats({
    metrics,
    loading = false,
    className = '',
}: QuickStatsProps) {
    const data = { ...STATIC_BASE, ...metrics } as CommunityMetrics;

    const items: {
        key: keyof CommunityMetrics;
        label: string;
        value: number;
        suffix?: string;
    }[] = [
        { key: 'members', label: 'Miembros', value: data.members, suffix: '+' },
        { key: 'events', label: 'Eventos', value: data.events },
        { key: 'projects', label: 'Proyectos', value: data.projects },
        {
            key: 'technologies',
            label: 'Tecnologías',
            value: data.technologies,
            suffix: '+',
        },
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
                    {items.map((item) => (
                        <div key={item.key} className="flex flex-col gap-1">
                            <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                {item.label}
                            </dt>
                            <dd
                                className={
                                    'text-3xl font-extrabold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-50 ' +
                                    (loading ? 'animate-pulse' : '')
                                }
                                aria-live="polite"
                            >
                                {loading ? (
                                    <span className="inline-block h-7 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
                                ) : (
                                    <>
                                        {item.value}
                                        {item.suffix}
                                    </>
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
                <p className="mt-5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Cifras aproximadas – pronto se actualizarán en tiempo casi
                    real.
                </p>
            </div>
        </section>
    );
}

export default QuickStats;
