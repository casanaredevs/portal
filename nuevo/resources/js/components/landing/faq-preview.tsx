import { faqItems } from '@/content/faq';
import { Link } from '@inertiajs/react';
import React from 'react';

export const FaqPreview: React.FC<{ className?: string; limit?: number }> = ({
    className = '',
    limit = 6,
}) => {
    const list = faqItems.slice(0, limit);
    return (
        <section
            id="faq"
            aria-labelledby="faq-heading"
            className={
                'relative mx-auto mt-20 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
        >
            <div className="flex items-end justify-between gap-4">
                <h2
                    id="faq-heading"
                    className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                    FAQs rápidas
                </h2>
                <Link
                    href="/faq"
                    className="text-xs font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-300"
                >
                    Ver todas →
                </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {list.map((item) => (
                    <details
                        key={item.id}
                        className="group rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm open:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <summary className="cursor-pointer list-none font-semibold text-neutral-800 transition outline-none select-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-100 dark:focus-visible:ring-offset-neutral-900">
                            <span className="flex items-center justify-between gap-4">
                                {item.question}
                                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-md border border-neutral-300 text-[10px] font-medium text-neutral-500 transition group-open:rotate-45 dark:border-neutral-700 dark:text-neutral-400">
                                    +
                                </span>
                            </span>
                        </summary>
                        <div className="mt-2 pr-2 leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {item.answer}
                        </div>
                    </details>
                ))}
                {list.length === 0 && (
                    <div className="col-span-full rounded border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                        Aún no hay preguntas frecuentes cargadas.
                    </div>
                )}
            </div>
            <div className="mt-6 text-right">
                <Link
                    href="/faq"
                    className="inline-flex items-center text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                    Página completa de preguntas frecuentes →
                </Link>
            </div>
        </section>
    );
};

export default FaqPreview;
