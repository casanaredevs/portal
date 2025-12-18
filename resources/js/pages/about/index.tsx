import MissionVisionGoals from '@/components/landing/mission-vision-goals';
import PublicLayout from '@/layouts/public/public-layout';
import { Head, Link } from '@inertiajs/react';

export default function AboutPage() {
    return (
        <PublicLayout>
            <Head title="Sobre la comunidad | Casanare Devs">
                <meta
                    name="description"
                    content="Sobre Casanare Devs: misión, visión, objetivos y cómo impulsamos el ecosistema tecnológico regional."
                />
            </Head>
            <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 sm:px-8 md:px-12 lg:px-0">
                <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                    Sobre la comunidad
                </h1>
                <p className="mb-5 text-neutral-700 dark:text-neutral-300">
                    Casanare Devs es una iniciativa abierta para articular a
                    desarrolladores, estudiantes, profesionales y entusiastas de
                    la tecnología en la región. Creemos en el aprendizaje
                    colaborativo, la construcción de proyectos reales y la
                    generación de oportunidades que fortalezcan el talento
                    local.
                </p>
                <p className="mb-10 text-neutral-700 dark:text-neutral-300">
                    Operamos bajo principios de apertura, respeto,
                    experimentación continua y foco en impacto. Nuestra
                    comunidad evoluciona con las contribuciones de sus miembros:
                    eventos, mentorías, documentación, repositorios y
                    acompañamiento a nuevos talentos.
                </p>
                <MissionVisionGoals className="mt-4" />
            </section>
            <section className="mx-auto max-w-4xl px-6 pb-24 sm:px-8 md:px-12 lg:px-0">
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    ¿Cómo contribuimos?
                </h2>
                <ul className="mb-8 list-disc pl-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <li>Organizando katas, talleres y meetups regulares.</li>
                    <li>
                        Promoviendo proyectos open source con sello regional.
                    </li>
                    <li>Articulando mentorías y acompañamiento inicial.</li>
                    <li>
                        Visibilizando perfiles y trayectorias profesionales.
                    </li>
                    <li>
                        Conectando con empresas, academia y otras comunidades.
                    </li>
                </ul>
                <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-2 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Próximos pasos
                    </h3>
                    <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                        Estamos trabajando en el directorio de proyectos, canal
                        de propuestas de charlas y módulo de newsletter. Si
                        deseas involucrarte en la fase temprana, escríbenos o
                        participa en los próximos encuentros.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/events"
                            className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            Ver eventos
                        </Link>
                        <Link
                            href="/members"
                            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                        >
                            Miembros
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-md border border-fuchsia-500/40 bg-fuchsia-50 px-4 py-2 text-xs font-medium text-fuchsia-700 transition hover:bg-fuchsia-100 dark:border-fuchsia-500/40 dark:bg-fuchsia-900/40 dark:text-fuchsia-200 dark:hover:bg-fuchsia-900/60"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
