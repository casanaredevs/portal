import { Link } from '@inertiajs/react';
import React, { useCallback, useState } from 'react';

interface Block {
    key: string;
    title: string;
    body: string; // ≤ ~320 chars
}

const MAX_CHARS = 320;

const baseBlocks: Block[] = [
    {
        key: 'mission',
        title: 'Misión',
        body: 'Impulsar el crecimiento del ecosistema tecnológico en Casanare conectando personas, compartiendo conocimiento práctico y generando oportunidades de colaboración que eleven el nivel profesional de la región.',
    },
    {
        key: 'vision',
        title: 'Visión',
        body: 'Ser una comunidad referente en Colombia por su cultura abierta, proyectos de impacto y talento distribuido capaz de crear soluciones tecnológicas competitivas desde y para el territorio.',
    },
    {
        key: 'goals',
        title: 'Objetivos',
        body: 'Fomentar aprendizaje continuo, mentorear nuevos talentos, visibilizar proyectos locales, articular eventos regulares y crear puentes entre desarrolladores, empresas y academia.',
    },
];

function enforceLength(text: string): string {
    if (text.length <= MAX_CHARS) return text;
    return text.slice(0, MAX_CHARS - 1).trimEnd() + '…';
}

export const MissionVisionGoals: React.FC<{
    className?: string;
    items?: Block[];
}> = ({ className = '', items }) => {
    const data = (items && items.length >= 3 ? items : baseBlocks).map((b) => ({
        ...b,
        body: enforceLength(b.body),
    }));
    const [active, setActive] = useState('mission');

    const onKeyTabs = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key))
                return;
            e.preventDefault();
            const current = data.findIndex((b) => b.key === active);
            let next = current;
            if (e.key === 'ArrowRight') next = (current + 1) % data.length;
            if (e.key === 'ArrowLeft')
                next = (current - 1 + data.length) % data.length;
            if (e.key === 'Home') next = 0;
            if (e.key === 'End') next = data.length - 1;
            setActive(data[next].key);
        },
        [active, data],
    );

    return (
        <section
            aria-labelledby="identity-heading"
            className={
                'relative mx-auto mt-16 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
            id="identidad"
        >
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2
                    id="identity-heading"
                    className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                    Nuestra identidad
                </h2>
                <Link
                    href="/about"
                    className="hidden text-xs font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-4 hover:text-fuchsia-800 md:inline-flex dark:text-fuchsia-300 dark:hover:text-fuchsia-200"
                >
                    Sobre la comunidad →
                </Link>
            </div>

            {/* Tabs móviles accesibles */}
            <div className="md:hidden">
                <div
                    role="tablist"
                    aria-label="Identidad de la comunidad"
                    className="mb-4 flex overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm dark:border-neutral-800 dark:bg-neutral-900"
                    onKeyDown={onKeyTabs}
                >
                    {data.map((b) => {
                        const selected = b.key === active;
                        const tabId = `identity-tab-${b.key}`;
                        const panelId = `identity-panel-${b.key}`;
                        return (
                            <button
                                key={b.key}
                                id={tabId}
                                role="tab"
                                aria-selected={selected}
                                aria-controls={panelId}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => setActive(b.key)}
                                className={
                                    'relative flex-1 rounded-md px-3 py-2 font-medium transition focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:outline-none ' +
                                    (selected
                                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800')
                                }
                            >
                                {b.title}
                                <span className="sr-only"> pestaña</span>
                            </button>
                        );
                    })}
                </div>
                {data.map((b) => {
                    const tabId = `identity-tab-${b.key}`;
                    const panelId = `identity-panel-${b.key}`;
                    return (
                        <div
                            key={b.key}
                            id={panelId}
                            role="tabpanel"
                            aria-labelledby={tabId}
                            hidden={b.key !== active}
                            className="rounded-xl border border-neutral-200 bg-white p-5 text-sm leading-relaxed shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <h3 className="mb-2 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                                {b.title}
                            </h3>
                            <p
                                className="text-neutral-700 dark:text-neutral-300"
                                data-length={b.body.length}
                            >
                                {b.body}
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="/about"
                                    className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-[0.6875rem] font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                                >
                                    Conoce más
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Columnas desktop */}
            <div className="hidden gap-6 md:grid md:grid-cols-3">
                {data.map((b) => (
                    <div
                        key={b.key}
                        className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-6 text-sm leading-relaxed shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <h3 className="mb-3 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {b.title}
                        </h3>
                        <p
                            className="mb-5 text-neutral-700 dark:text-neutral-300"
                            data-length={b.body.length}
                        >
                            {b.body}
                        </p>
                        <div className="mt-auto pt-2">
                            {/* Un solo CTA repetido en cada bloque para consistencia de exploración */}
                            <Link
                                href="/about"
                                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[0.6875rem] font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            >
                                Sobre la comunidad
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MissionVisionGoals;
