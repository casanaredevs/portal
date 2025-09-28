import useUpcomingEvents, {
    type PublicEvent,
} from '@/hooks/use-upcoming-events';
import { Link } from '@inertiajs/react';

interface UpcomingEventsProps {
    initial?: PublicEvent[];
    limit?: number;
    className?: string;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d
        .toLocaleDateString('es-CO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
        .replace(/\./g, '');
}

function typeLabel(type: string) {
    switch (type) {
        case 'kata':
            return 'Kata';
        case 'taller':
            return 'Taller';
        case 'meetup':
            return 'Meetup';
        default:
            return type;
    }
}

export function UpcomingEvents({
    initial = [],
    limit = 4,
    className = '',
}: UpcomingEventsProps) {
    const { events, loading, refreshing, error } = useUpcomingEvents({
        initial,
        limit,
    });

    return (
        <section
            aria-labelledby="upcoming-events-heading"
            className={
                'relative mx-auto mt-16 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
            id="eventos"
        >
            <div className="flex items-end justify-between gap-4">
                <h2
                    id="upcoming-events-heading"
                    className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                    Próximos eventos
                </h2>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {refreshing && (
                        <span className="inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-fuchsia-500" />
                            Actualizando
                        </span>
                    )}
                    {error && (
                        <span className="text-red-600 dark:text-red-400">
                            Error al cargar
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {loading &&
                    events.length === 0 &&
                    Array.from({ length: limit }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="mb-3 h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="mb-2 h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="mb-4 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-8 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    ))}
                {events.slice(0, limit).map((ev) => {
                    const atCapacity =
                        ev.capacity !== null &&
                        ev.seats_remaining !== null &&
                        ev.seats_remaining <= 0;
                    const remainingPct = ev.capacity
                        ? Math.min(
                              100,
                              Math.round(
                                  ((ev.capacity - ev.seats_remaining!) /
                                      ev.capacity) *
                                      100,
                              ),
                          )
                        : null;
                    return (
                        <article
                            key={ev.id}
                            className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center rounded-full border border-fuchsia-300/60 bg-fuchsia-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-fuchsia-700 dark:border-fuchsia-600/40 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
                                    {typeLabel(ev.type)}
                                </span>
                                <time
                                    dateTime={ev.start_at}
                                    className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400"
                                >
                                    {formatDate(ev.start_at)}
                                </time>
                            </div>
                            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                                <Link
                                    href={`/events/${ev.slug}`}
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900"
                                >
                                    {ev.title}
                                </Link>
                            </h3>
                            {ev.summary && (
                                <p className="mb-4 line-clamp-3 text-xs text-neutral-600 dark:text-neutral-400">
                                    {ev.summary}
                                </p>
                            )}
                            <div className="mt-auto space-y-3">
                                {ev.capacity !== null && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                            <span>
                                                {atCapacity
                                                    ? 'Aforo completo'
                                                    : 'Aforo'}
                                            </span>
                                            <span>
                                                {ev.capacity -
                                                    (ev.seats_taken ?? 0)}
                                                /{ev.capacity}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
                                            <div
                                                className="h-full bg-fuchsia-500 transition-all dark:bg-fuchsia-400"
                                                style={{
                                                    width: `${remainingPct ?? 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/events/${ev.slug}`}
                                        className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                    >
                                        Ver detalle
                                    </Link>
                                    {!atCapacity && (
                                        <button
                                            type="button"
                                            className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                                        >
                                            Registrarme
                                        </button>
                                    )}
                                    {atCapacity && (
                                        <span className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                                            Lleno
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
                {!loading && events.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                        Aún no hay eventos programados.{' '}
                        <span className="font-medium">¿Propones uno?</span>
                    </div>
                )}
            </div>
        </section>
    );
}

export default UpcomingEvents;
