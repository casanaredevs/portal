import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export interface EventCardData {
  id: number;
  title: string;
  slug: string;
  type: string;
  start_at: string;
  capacity: number | null;
  seats_taken: number;
  seats_remaining: number | null;
  summary?: string | null;
  is_registered?: boolean;
}

interface EventCardProps {
  event: EventCardData;
  showSummary?: boolean;
  compact?: boolean;
  showRegister?: boolean; // habilita botones de registro
  className?: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(/\./g,'');
}

function typeLabel(type: string) {
  switch (type) {
    case 'kata': return 'Kata';
    case 'taller': return 'Taller';
    case 'meetup': return 'Meetup';
    default: return type;
  }
}

export const EventCard: React.FC<EventCardProps> = ({ event, showSummary = true, compact = false, showRegister = false, className = '' }) => {
  const { auth } = usePage().props as any;
  const [localRegistered, setLocalRegistered] = useState<boolean | undefined>(event.is_registered);
  const [busy, setBusy] = useState(false);
  const atCapacity = event.capacity !== null && (event.seats_remaining ?? 0) <= 0 && !localRegistered;
  const progressPct = event.capacity ? Math.min(100, Math.round(((event.capacity - (event.seats_remaining ?? 0)) / event.capacity) * 100)) : null;

  const handleRegister = () => {
    if (!auth?.user) {
      router.visit('/login');
      return;
    }
    setBusy(true);
    router.post(`/events/${event.slug}/register`, {}, {
      preserveScroll: true,
      onFinish: () => setBusy(false),
      onSuccess: () => setLocalRegistered(true),
    });
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
    <article className={"group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 " + className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full border border-fuchsia-300/60 bg-fuchsia-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-fuchsia-700 dark:border-fuchsia-600/40 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
          {typeLabel(event.type)}
        </span>
        <time dateTime={event.start_at} className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {formatDate(event.start_at)}
        </time>
      </div>
      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        <Link href={`/events/${event.slug}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900">
          {event.title}
        </Link>
      </h3>
      {showSummary && event.summary && (
        <p className={"mb-4 text-xs text-neutral-600 dark:text-neutral-400 " + (compact ? 'line-clamp-2' : 'line-clamp-3')}>
          {event.summary}
        </p>) }
      <div className="mt-auto space-y-3">
        {event.capacity !== null && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>{atCapacity ? 'Aforo completo' : 'Aforo'}</span>
              <span>{event.capacity - (event.seats_taken ?? 0)}/{event.capacity}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full bg-fuchsia-500 transition-all dark:bg-fuchsia-400" style={{width: `${progressPct ?? 0}%`}} />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Link href={`/events/${event.slug}`} className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
            Ver detalle
          </Link>
          {showRegister && !atCapacity && auth?.user && !localRegistered && (
            <button type="button" disabled={busy} onClick={handleRegister}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white">
              {busy ? '...' : 'Registrarme'}
            </button>
          )}
          {showRegister && auth?.user && localRegistered && (
            <button type="button" disabled={busy} onClick={handleUnregister}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
              {busy ? '...' : 'Cancelar'}
            </button>
          )}
          {showRegister && !auth?.user && (
            <button type="button" onClick={()=> router.visit('/login')}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white">
              Inicia sesión
            </button>
          )}
          {showRegister && atCapacity && !localRegistered && (
            <span className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
              Lleno
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;

