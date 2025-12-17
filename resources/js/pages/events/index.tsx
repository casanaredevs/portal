import { EventCard, type EventCardData } from '@/components/events/event-card';
import PublicLayout from '@/layouts/public/public-layout';
import type { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface EventsIndexPageProps extends SharedData {
    events: EventCardData[];
    filters: { type?: string | null; status?: string | null };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const TYPE_OPTIONS = [
    { label: 'Todos los tipos', value: '' },
    { label: 'Kata', value: 'kata' },
    { label: 'Taller', value: 'taller' },
    { label: 'Meetup', value: 'meetup' },
];

export default function EventsIndex() {
    const { events, filters, pagination } =
        usePage<EventsIndexPageProps>().props;
    const [typeFilter, setTypeFilter] = useState<string>(filters.type || '');

    useEffect(() => {
        setTypeFilter(filters.type || '');
    }, [filters.type]);

    const applyFilters = () => {
        router.get(
            '/events',
            { type: typeFilter || undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    const goToPage = (page: number) => {
        router.get(
            '/events',
            { type: typeFilter || undefined, page },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <PublicLayout>
            <Head title="Eventos | Casanare Devs" />
            <section className="mx-auto mt-10 max-w-6xl px-6 pb-24 sm:px-8 md:px-12 lg:px-20">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Eventos
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Explora los próximos espacios de aprendizaje y
                            comunidad.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{pagination.total} en total</span>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-end gap-4 rounded-lg border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
                    <div className="flex flex-col text-sm">
                        <label
                            htmlFor="type"
                            className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
                        >
                            Tipo
                        </label>
                        <select
                            id="type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="min-w-40 rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="mt-5 inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                        Aplicar filtros
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter('');
                            router.get(
                                '/events',
                                {},
                                { preserveScroll: true, preserveState: true },
                            );
                        }}
                        className="mt-5 inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        Limpiar
                    </button>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((ev) => (
                        <EventCard key={ev.id} event={ev} showRegister />
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                            No se encontraron eventos con los filtros
                            seleccionados.
                        </div>
                    )}
                </div>
                {pagination.last_page > 1 && (
                    <nav
                        className="mt-10 flex items-center justify-center gap-2 text-sm"
                        aria-label="Paginación"
                    >
                        <button
                            type="button"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                goToPage(pagination.current_page - 1)
                            }
                            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            Anterior
                        </button>
                        <span className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
                            {pagination.current_page} / {pagination.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                goToPage(pagination.current_page + 1)
                            }
                            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            Siguiente
                        </button>
                    </nav>
                )}
            </section>
        </PublicLayout>
    );
}
