import { EventCard, type EventCardData } from '@/components/events/event-card';
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
                <div className="flex items-center gap-4">
                    <Link
                        href="/events"
                        className="text-xs font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-300"
                    >
                        Ver todos →
                    </Link>
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
                {events.slice(0, limit).map((ev) => (
                    <EventCard
                        key={ev.id}
                        event={ev as EventCardData}
                        compact
                        showRegister
                    />
                ))}
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
