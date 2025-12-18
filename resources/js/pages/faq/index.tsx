import { faqItems } from '@/content/faq';
import PublicLayout from '@/layouts/public/public-layout';
import { Head, Link } from '@inertiajs/react';

export default function FaqPage() {
    return (
        <PublicLayout>
            <Head title="Preguntas frecuentes | Casanare Devs">
                <meta
                    name="description"
                    content="Preguntas frecuentes sobre la comunidad Casanare Devs: costos, requisitos, modalidad, eventos, charlas y mentoría."
                />
            </Head>
            <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 sm:px-8 md:px-12 lg:px-0">
                <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                    Preguntas frecuentes
                </h1>
                <p className="mb-10 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    Aquí reunimos respuestas rápidas. La comunidad evoluciona;
                    si falta algo o tienes una propuesta, contáctanos en el
                    próximo evento o canal oficial.
                </p>
                <div className="space-y-4">
                    {faqItems.map((item) => (
                        <details
                            key={item.id}
                            className="group rounded-lg border border-neutral-200 bg-white p-5 text-sm shadow-sm open:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <summary className="cursor-pointer list-none font-semibold text-neutral-900 transition outline-none select-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-50 dark:focus-visible:ring-offset-neutral-900">
                                <span className="flex items-center justify-between gap-4">
                                    {item.question}
                                    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 text-xs font-medium text-neutral-500 transition group-open:rotate-45 dark:border-neutral-700 dark:text-neutral-400">
                                        +
                                    </span>
                                </span>
                            </summary>
                            <div className="mt-3 leading-relaxed text-neutral-700 dark:text-neutral-300">
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
                <div className="mt-14 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h2 className="mb-3 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                        ¿No ves tu pregunta?
                    </h2>
                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                        Estamos preparando un formulario de contacto. Mientras
                        tanto, puedes unirte a un evento y plantearla
                        directamente o proponer nuevas secciones.
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <Link
                            href="/events"
                            className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            Ver próximos eventos
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                            Inicio
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
