import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

interface Block {
  key: string;
  title: string;
  body: string; // ≤ ~300 chars
}

const blocks: Block[] = [
  {
    key: 'mission',
    title: 'Misión',
    body:
      'Impulsar el crecimiento del ecosistema tecnológico en Casanare conectando personas, compartiendo conocimiento práctico y generando oportunidades de colaboración que eleven el nivel profesional de la región.',
  },
  {
    key: 'vision',
    title: 'Visión',
    body:
      'Ser una comunidad referente en Colombia por su cultura abierta, proyectos de impacto y talento distribuido capaz de crear soluciones tecnológicas competitivas desde y para el territorio.',
  },
  {
    key: 'goals',
    title: 'Objetivos',
    body:
      'Fomentar aprendizaje continuo, mentorear nuevos talentos, visibilizar proyectos locales, articular eventos regulares y crear puentes entre desarrolladores, empresas y academia.',
  },
];

export const MissionVisionGoals: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [active, setActive] = useState('mission');

  return (
    <section
      aria-labelledby="identity-heading"
      className={
        'relative mx-auto mt-16 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
        className
      }
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
          className="hidden text-xs font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-4 hover:text-fuchsia-800 dark:text-fuchsia-300 dark:hover:text-fuchsia-200 md:inline-flex"
        >
          Sobre la comunidad →
        </Link>
      </div>

      {/* Tabs móviles */}
      <div className="md:hidden">
        <div
          role="tablist"
          aria-label="Identidad de la comunidad"
          className="mb-4 flex overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          {blocks.map((b) => {
            const selected = b.key === active;
            return (
              <button
                key={b.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(b.key)}
                className={
                  'relative flex-1 rounded-md px-3 py-2 font-medium transition ' +
                  (selected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800')
                }
              >
                {b.title}
              </button>
            );
          })}
        </div>
        {blocks.map((b) => (
          <div
            key={b.key}
            role="tabpanel"
            hidden={b.key !== active}
            className="rounded-xl border border-neutral-200 bg-white p-5 text-sm leading-relaxed shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mb-2 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {b.title}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">{b.body}</p>
            <div className="mt-4">
              <Link
                href="/about"
                className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Conoce más
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Columnas desktop */}
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        {blocks.map((b) => (
          <div
            key={b.key}
            className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-6 text-sm leading-relaxed shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mb-3 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {b.title}
            </h3>
            <p className="mb-5 text-neutral-700 dark:text-neutral-300">{b.body}</p>
            <div className="mt-auto pt-2">
              <Link
                href="/about"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
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

