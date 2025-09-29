import { register } from '@/routes';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

interface Pathway {
    key: string;
    title: string;
    description: string;
    benefits?: string[];
    requirements?: string[];
    ctaLabel?: string;
    ctaHref?: string;
}

const pathways: Pathway[] = [
    {
        key: 'events',
        title: 'Participar en eventos',
        description:
            'Asiste a meetups, katas y talleres prácticos para aprender con otros y mantenerte actualizado.',
        benefits: [
            'Aprendizaje activo',
            'Networking local',
            'Exposición a casos reales',
        ],
        ctaLabel: 'Ver eventos',
        ctaHref: '/events',
    },
    {
        key: 'projects',
        title: 'Contribuir a proyectos',
        description:
            'Colabora en repositorios abiertos de la comunidad: prácticas modernas, revisiones y despliegues.',
        benefits: [
            'Experiencia colaborativa',
            'Portafolio verificable',
            'Buenas prácticas',
        ],
        ctaLabel: 'Pronto',
        ctaHref: '#proyectos',
    },
    {
        key: 'knowledge',
        title: 'Compartir conocimiento',
        description:
            'Propón una charla corta, facilita una kata o documenta aprendizajes para elevar el nivel colectivo.',
        benefits: [
            'Visibilidad profesional',
            'Soft skills',
            'Impacto regional',
        ],
        ctaLabel: 'Proponer (pronto)',
        ctaHref: '#',
    },
    {
        key: 'mentoring',
        title: 'Mentoría',
        description:
            'Guía a nuevos talentos o solicita acompañamiento estructurado para acelerar tu crecimiento técnico.',
        benefits: ['Enseñar refuerza', 'Acompañamiento', 'Red de apoyo'],
        ctaLabel: 'Pronto',
        ctaHref: '#',
    },
];

interface JoinParticipateProps {
    className?: string;
}

export const JoinParticipate: React.FC<JoinParticipateProps> = ({
    className = '',
}) => {
    const { auth } = usePage<SharedData>().props;
    const isAuth = Boolean(auth?.user);

    return (
        <section
            id="participar"
            aria-labelledby="join-heading"
            className={
                'relative mx-auto mt-20 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
        >
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-3">
                    <h2
                        id="join-heading"
                        className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                    >
                        Cómo unirte y participar
                    </h2>
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        Involúcrate de forma progresiva según tu tiempo y
                        experiencia. Todas las rutas impulsan aprendizaje,
                        colaboración y visibilidad profesional.
                    </p>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        <li>Networking real</li>
                        <li>Aprendizaje colaborativo</li>
                        <li>Portafolio con propósito</li>
                        <li>Mentoría cruzada</li>
                    </ul>
                </div>
                <div className="flex flex-wrap gap-3 pt-2 md:pt-0">
                    {!isAuth && (
                        <Link
                            href={register()}
                            className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            Registrarme
                        </Link>
                    )}
                    <Link
                        href="/events"
                        className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                    >
                        Próximos eventos
                    </Link>
                    <a
                        href="#" // TODO: reemplazar con invite Discord
                        className="inline-flex items-center rounded-md border border-fuchsia-400/60 bg-fuchsia-50 px-4 py-2 text-xs font-medium text-fuchsia-700 transition hover:bg-fuchsia-100 dark:border-fuchsia-500/40 dark:bg-fuchsia-900/40 dark:text-fuchsia-200 dark:hover:bg-fuchsia-900/60"
                    >
                        Discord (pronto)
                    </a>
                    <a
                        href="#" // TODO: Slack u otra plataforma
                        className="inline-flex items-center rounded-md border border-cyan-400/60 bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-500/40 dark:bg-cyan-900/40 dark:text-cyan-200 dark:hover:bg-cyan-900/60"
                    >
                        Slack (evaluando)
                    </a>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {pathways.map((p) => (
                    <div
                        key={p.key}
                        className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-5 text-sm shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <h3 className="mb-2 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {p.title}
                        </h3>
                        <p className="mb-4 line-clamp-4 text-neutral-700 dark:text-neutral-300">
                            {p.description}
                        </p>
                        {p.benefits && (
                            <ul className="mb-4 space-y-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                {p.benefits.map((b) => (
                                    <li
                                        key={b}
                                        className="flex items-start gap-1.5"
                                    >
                                        <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-500" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-auto pt-2">
                            <Link
                                href={p.ctaHref || '#'}
                                className={
                                    'inline-flex items-center rounded-md px-3 py-1.5 text-[11px] font-medium transition ' +
                                    (p.key === 'projects' ||
                                    p.key === 'knowledge' ||
                                    p.key === 'mentoring'
                                        ? 'cursor-not-allowed border border-neutral-300 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500'
                                        : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700')
                                }
                                aria-disabled={
                                    p.key === 'projects' ||
                                    p.key === 'knowledge' ||
                                    p.key === 'mentoring'
                                }
                            >
                                {p.ctaLabel || 'Explorar'}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 rounded-lg border border-neutral-200 bg-white p-6 text-[13px] leading-relaxed dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    Requisitos mínimos y filosofía
                </h3>
                <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                    No exigimos seniority. Valoramos disposición a aprender,
                    respeto, colaboración y cumplimiento básico en compromisos
                    asumidos. Cada aportación—pequeña o grande—ayuda a
                    fortalecer el ecosistema.
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Si recién comienzas: asiste a eventos y observa. Si ya
                    dominas un área: comparte, guía y potencia a otros. Crecemos
                    en capas generacionales.
                </p>
            </div>
        </section>
    );
};

export default JoinParticipate;
