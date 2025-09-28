import { useEffect, useRef, useState } from 'react';

export interface CommunityMetrics {
    members: number;
    events: number;
    projects: number;
    technologies: number;
    updated_at?: string;
}

interface UseCommunityMetricsOptions {
    intervalMs?: number; // auto refresh interval
    enabled?: boolean;
}

interface UseCommunityMetricsResult {
    metrics: CommunityMetrics;
    previousMetrics: CommunityMetrics | null;
    loading: boolean;
    refreshing: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    lastUpdated: string | undefined;
}

const DEFAULT_INTERVAL = 60_000; // 60s

export function useCommunityMetrics(
    initial: CommunityMetrics,
    opts: UseCommunityMetricsOptions = {},
): UseCommunityMetricsResult {
    const { intervalMs = DEFAULT_INTERVAL, enabled = true } = opts;
    const [metrics, setMetrics] = useState<CommunityMetrics>(initial);
    const [previous, setPrevious] = useState<CommunityMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const firstRef = useRef(true);

    const fetchMetrics = async (background = true) => {
        if (!enabled) return;
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        if (!background) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await fetch('/public/metrics', {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });
            if (!res.ok) throw new Error('Failed to fetch metrics');
            const data = await res.json();
            // Actualiza solo si cambió algo
            const changed = [
                'members',
                'events',
                'projects',
                'technologies',
            ].some((k) => (data as any)[k] !== (metrics as any)[k]);
            if (changed) {
                setPrevious(metrics);
                setMetrics(data);
            }
            setError(null);
        } catch (e: any) {
            if (e.name !== 'AbortError') setError(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // SWR: revalidar al montar (background)
        fetchMetrics(true);
        // auto refresco
        if (!enabled) return;
        const id = setInterval(() => fetchMetrics(true), intervalMs);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, intervalMs]);

    // Revalidar al volver a tener foco (UX común en SWR)
    useEffect(() => {
        const onFocus = () => fetchMetrics(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        metrics,
        previousMetrics: previous,
        loading,
        refreshing,
        error,
        refresh: () => fetchMetrics(false),
        lastUpdated: metrics.updated_at,
    };
}

export default useCommunityMetrics;
