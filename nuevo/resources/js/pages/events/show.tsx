import PublicLayout from '@/layouts/public/public-layout';
import type { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface EventDetail {
    id: number;
    title: string;
    slug: string;
    type: string;
    start_at: string | null;
    end_at: string | null;
    capacity: number | null;
    seats_taken: number;
    seats_remaining: number | null;
    summary?: string | null;
    description?: string | null;
    status: string;
    created_at?: string | null;
    is_registered?: boolean;
}

interface PageProps extends SharedData {
    event: EventDetail;
    flash?: { success?: string; error?: string };
}

function formatDateRange(startIso: string | null, endIso: string | null) {
    if (!startIso) return 'Sin fecha';
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;
    const base = start.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    if (!end) return base;
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
        return `${base} - ${end.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${base} → ${end.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

function typeLabel(t: string) {
    switch (t) {
        case 'kata':
            return 'Kata';
        case 'taller':
            return 'Taller';
        case 'meetup':
            return 'Meetup';
        default:
            return t;
    }
}

function buildJsonLd(event: EventDetail) {
    const descriptionSource = event.summary || event.description || '';
    const plain = descriptionSource
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const data: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        startDate: event.start_at || undefined,
        endDate: event.end_at || undefined,
        description: plain,
        location: {
            '@type': 'Place',
            name: 'Casanare Devs',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Yopal',
                addressRegion: 'Casanare',
                addressCountry: 'CO',
            },
        },
        organizer: {
            '@type': 'Organization',
            name: 'Casanare Devs',
        },
    };
    if (event.capacity !== null) {
        data.maximumAttendeeCapacity = event.capacity;
        data.remainingAttendeeCapacity = event.seats_remaining;
    }
    return JSON.stringify(data, null, 2);
}

export default function EventShow() {
    const { event, flash, auth } = usePage<PageProps & { auth: any }>().props;
    const [busy, setBusy] = useState(false);
    const [localRegistered, setLocalRegistered] = useState<boolean | undefined>(
        event.is_registered,
    );

    const atCapacity =
        event.capacity !== null &&
        (event.seats_remaining ?? 0) <= 0 &&
        !localRegistered;
    const progressPct = event.capacity
        ? Math.min(
              100,
              Math.round(
                  ((event.capacity - (event.seats_remaining ?? 0)) /
                      event.capacity) *
                      100,
              ),
          )
        : null;

    const jsonLd = useMemo(() => buildJsonLd(event), [event]);

    const handleRegister = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        setBusy(true);
        router.post(
            `/events/${event.slug}/register`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setLocalRegistered(true),
            },
        );
    };

    const handleUnregister = () => {
        setBusy(true);
        router.delete(`/events/${event.slug}/register`, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
            onSuccess: () => setLocalRegistered(false),
        });
    };

    return (
        <PublicLayout>
            <Head title={`${event.title} | Evento`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd }}
                />
            </Head>
            <section className="mx-auto mt-10 max-w-4xl px-6 pb-24 sm:px-8">
                <Link
                    href="/events"
                    className="mb-6 inline-flex items-center text-sm text-fuchsia-600 hover:underline dark:text-fuchsia-400"
                >
                    ← Volver a eventos
                </Link>
                {(flash?.success || flash?.error) && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`mb-4 rounded-md border px-4 py-2 text-sm ${flash.success ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300' : 'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300'}`}
                    >
                        {flash.success || flash.error}
                    </div>
                )}
                <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 backdrop-blur-sm sm:p-10 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-fuchsia-300/60 bg-fuchsia-50 px-3 py-1 text-xs font-semibold tracking-wide text-fuchsia-700 dark:border-fuchsia-600/40 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
                            {typeLabel(event.type)}
                        </span>
                        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            {event.status === 'published'
                                ? 'Publicado'
                                : event.status}
                        </span>
                        {localRegistered && (
                            <span className="inline-flex items-center rounded-full border border-green-400/50 bg-green-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-green-700 dark:border-green-600/40 dark:bg-green-900/30 dark:text-green-300">
                                Registrado
                            </span>
                        )}
                    </div>
                    <h1 className="mb-4 text-3xl leading-tight font-bold tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-neutral-50">
                        {event.title}
                    </h1>
                    {event.summary && (
                        <p className="mb-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
                            {event.summary}
                        </p>
                    )}
                    <div className="mb-8 flex flex-wrap gap-8 text-sm text-neutral-600 dark:text-neutral-300">
                        <div>
                            <span className="block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                Fecha
                            </span>
                            <span>
                                {formatDateRange(event.start_at, event.end_at)}
                            </span>
                        </div>
                        {event.capacity !== null && (
                            <div>
                                <span className="block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Aforo
                                </span>
                                <span>
                                    {event.capacity - (event.seats_taken ?? 0)}/
                                    {event.capacity}
                                </span>
                            </div>
                        )}
                    </div>
                    {event.capacity !== null && (
                        <div className="mb-8">
                            <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                <span>
                                    {atCapacity && !localRegistered
                                        ? 'Aforo completo'
                                        : 'Progreso de registro'}
                                </span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
                                <div
                                    className="h-full bg-fuchsia-500 transition-all dark:bg-fuchsia-400"
                                    style={{ width: `${progressPct ?? 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-sm dark:text-neutral-300">
                        {event.description ? (
                            <article
                                dangerouslySetInnerHTML={{
                                    __html: event.description.replace(
                                        /\n/g,
                                        '<br/>',
                                    ),
                                }}
                            />
                        ) : (
                            <p>Pronto más detalles de este evento.</p>
                        )}
                    </div>
                    <div className="mt-10 flex flex-wrap gap-4">
                        {!localRegistered &&
                            !atCapacity &&
                            event.status === 'published' && (
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={handleRegister}
                                    className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                                >
                                    {busy ? '...' : 'Registrarme'}
                                </button>
                            )}
                        {localRegistered && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handleUnregister}
                                className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            >
                                {busy ? '...' : 'Cancelar registro'}
                            </button>
                        )}
                        {atCapacity && !localRegistered && (
                            <span className="inline-flex items-center rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                Aforo lleno
                            </span>
                        )}
                        {!localRegistered &&
                            auth?.user == null &&
                            !atCapacity && (
                                <button
                                    type="button"
                                    onClick={() => router.visit('/login')}
                                    className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                                >
                                    Inicia sesión
                                </button>
                            )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
