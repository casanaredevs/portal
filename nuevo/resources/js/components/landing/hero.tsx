import { register } from '@/routes';
import { Link } from '@inertiajs/react';

interface HeroProps {
    isAuthenticated: boolean;
    userName?: string;
}

// Hero (versión estática MVP). Futuro: inyectar métricas (miembros, eventos, proyectos) vía props.
export function Hero({ isAuthenticated, userName }: HeroProps) {
    return (
        <section
            className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 px-6 py-24 sm:px-8 md:px-12 lg:px-20 dark:from-neutral-950 dark:to-neutral-900"
            aria-labelledby="hero-heading"
        >
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] select-none dark:opacity-[0.12]">
                <div className="absolute top-1/4 -left-24 h-72 w-72 rounded-full bg-fuchsia-400 blur-3xl dark:bg-fuchsia-600" />
                <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-amber-300 blur-3xl dark:bg-amber-500" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300 blur-3xl dark:bg-cyan-600" />
            </div>
            <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-10 lg:flex-row lg:items-center">
                <div className="w-full max-w-2xl space-y-6">
                    <h1
                        id="hero-heading"
                        className="text-4xl font-extrabold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-neutral-50"
                    >
                        Comunidad de Desarrolladores de Software en Casanare
                    </h1>
                    <p className="text-lg leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                        Conectamos talento local, impulsamos aprendizaje
                        colaborativo y damos visibilidad a proyectos, eventos y
                        perfiles tecnológicos de la región. Aprende, comparte y
                        construye impacto.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Link
                            href="#miembros"
                            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            Explorar miembros
                        </Link>
                        <Link
                            href="#eventos"
                            className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            Ver eventos
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                href={register()}
                                className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-4 hover:text-fuchsia-800 dark:text-fuchsia-300 dark:hover:text-fuchsia-200"
                            >
                                Únete a la comunidad →
                            </Link>
                        )}
                        {isAuthenticated && (
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                Bienvenido{userName ? `, ${userName}` : ''}.
                                ¡Construyamos algo! 🚀
                            </span>
                        )}
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {/* Placeholders estáticos (futuro: reemplazar por datos reales) */}
                        <li>+120 miembros</li>
                        <li>Eventos mensuales</li>
                        <li>Proyectos open source</li>
                        <li>Mentorías y katas</li>
                    </ul>
                </div>
                <div className="relative mx-auto w-full max-w-lg flex-1 lg:mx-0">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-200 bg-white/60 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/50">
                        {/* Placeholder visual (futuro: ilustración / collage dinámico) */}
                        <div className="absolute inset-0 grid place-items-center p-8 text-center">
                            <div className="space-y-4">
                                <p className="text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Construimos comunidad
                                </p>
                                <p className="mx-auto max-w-xs text-sm text-balance text-neutral-600 dark:text-neutral-300">
                                    Espacio para aprender practicando: katas,
                                    charlas, talleres y proyectos colaborativos
                                    con tecnologías modernas.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700/50">
                                        JavaScript
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700/50">
                                        PHP
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700/50">
                                        Python
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700/50">
                                        Cloud
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700/50">
                                        DevOps
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.35),transparent_60%)]" />
                    </div>
                    <p className="mt-3 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
                        Próximamente: contenido dinámico desde la base de datos.
                    </p>
                </div>
            </div>
            <div className="mt-20 flex flex-wrap items-center gap-6 text-xs text-neutral-400 dark:text-neutral-500">
                <span className="font-medium">Sin costo</span>
                <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="font-medium">Abierta & inclusiva</span>
                <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="font-medium">Orientada a impacto</span>
            </div>
        </section>
    );
}

export default Hero;
