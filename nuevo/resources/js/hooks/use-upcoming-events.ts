import { useEffect, useRef, useState } from 'react';

export interface PublicEvent {
  id: number;
  title: string;
  slug: string;
  type: string; // kata | taller | meetup | ...
  start_at: string; // ISO
  capacity: number | null;
  seats_taken: number;
  seats_remaining: number | null;
  summary?: string | null;
}

interface UseUpcomingEventsOptions {
  initial?: PublicEvent[];
  limit?: number;
  refreshMs?: number;
  enabled?: boolean;
}

interface UseUpcomingEventsResult {
  events: PublicEvent[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated?: string;
}

export function useUpcomingEvents({ initial = [], limit = 4, refreshMs = 120_000, enabled = true }: UseUpcomingEventsOptions): UseUpcomingEventsResult {
  const [events, setEvents] = useState<PublicEvent[]>(initial.slice(0, limit));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastUpdatedRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const fetchEvents = async (background = true) => {
    if (!enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    background ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch('/public/events/upcoming');
      if (!res.ok) throw new Error('Failed to load events');
      const json = await res.json();
      lastUpdatedRef.current = json.updated_at;
      setEvents(json.data.slice(0, limit));
      setError(null);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { fetchEvents(true); }, []); // initial revalidate

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => fetchEvents(true), refreshMs);
    return () => clearInterval(id);
  }, [enabled, refreshMs]);

  useEffect(() => {
    const onFocus = () => fetchEvents(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return {
    events,
    loading,
    refreshing,
    error,
    refresh: () => fetchEvents(false),
    lastUpdated: lastUpdatedRef.current,
  };
}

export default useUpcomingEvents;

