import InputError from '@/components/input-error';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface ExternalProfile {
    id: number;
    platform: string;
    handle: string;
    url: string;
    label?: string | null;
    icon?: string | null;
    is_verified: boolean;
    position: number;
}

interface Props {
    initialProfiles: ExternalProfile[];
}

const PLATFORMS = [
    'github',
    'linkedin',
    'twitter',
    'stackoverflow',
    'youtube',
    'devto',
    'medium',
    'hashnode',
    'facebook',
    'instagram',
    'twitch',
    'threads',
    'discord',
    'mastodon',
    'gitlab',
    'bitbucket',
];

export function ExternalProfilesEditor({ initialProfiles }: Props) {
    // Fuente de verdad: props externas; mantenemos copia local para reorder optimista.
    const page = usePage<{ externalProfiles?: ExternalProfile[] }>();
    const serverProfiles: ExternalProfile[] =
        ((page.props as any).externalProfiles as
            | ExternalProfile[]
            | undefined) || initialProfiles;
    const [profiles, setProfiles] = useState<ExternalProfile[]>(() =>
        [...serverProfiles].sort((a, b) => a.position - b.position),
    );
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ platform: 'github', handle: '' });
    const [error, setError] = useState<string | undefined>();
    const dragId = useRef<number | null>(null);
    const dirtyLabelsRef = useRef<Record<number, string>>({});
    const saveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
        {},
    );
    const DEBOUNCE = 2000; // ms

    // Sincronizar con servidor tras cada respuesta Inertia.
    useEffect(() => {
        // Sincronizar sólo perfiles no dirty (para no pisar escritura en curso)
        setProfiles((prev) => {
            const incoming = [...serverProfiles].sort(
                (a, b) => a.position - b.position,
            );
            return incoming.map((p) =>
                dirtyLabelsRef.current[p.id] !== undefined
                    ? prev.find((x) => x.id === p.id) || p
                    : p,
            );
        });
    }, [
        serverProfiles
            .map(
                (p: ExternalProfile) =>
                    p.id +
                    '-' +
                    p.position +
                    '-' +
                    p.handle +
                    '-' +
                    (p.label || ''),
            )
            .join('|'),
    ]);

    // Limpieza timers al desmontar
    useEffect(
        () => () => {
            Object.values(saveTimersRef.current).forEach(clearTimeout);
        },
        [],
    );

    const createProfile = () => {
        if (!form.handle.trim()) {
            setError('Handle requerido');
            return;
        }
        setAdding(true);
        setError(undefined);
        router.post(
            '/external-profiles',
            { platform: form.platform, handle: form.handle },
            {
                preserveScroll: true,
                only: ['externalProfiles'],
                onError: (errs) => setError(Object.values(errs)[0] as string),
                onSuccess: () => setForm((f) => ({ ...f, handle: '' })),
                onFinish: () => setAdding(false),
            },
        );
    };

    const updateProfile = (id: number, payload: Partial<ExternalProfile>) => {
        setError(undefined);
        router.patch(`/external-profiles/${id}`, payload, {
            preserveScroll: true,
            only: ['externalProfiles'],
            onError: (errs) => setError(Object.values(errs)[0] as string),
        });
    };

    const removeProfile = (id: number) => {
        setError(undefined);
        router.delete(`/external-profiles/${id}`, {
            preserveScroll: true,
            only: ['externalProfiles'],
            onError: (errs) => setError(Object.values(errs)[0] as string),
        });
    };

    const onDragStart = (id: number) => (e: React.DragEvent) => {
        dragId.current = id;
        e.dataTransfer.effectAllowed = 'move';
    };
    const onDragOver = (id: number) => (e: React.DragEvent) => {
        e.preventDefault();
        if (dragId.current === id) return;
        setProfiles((prev) => {
            const dragged = prev.find((p) => p.id === dragId.current)!;
            const others = prev.filter((p) => p.id !== dragged.id);
            const index = others.findIndex((p) => p.id === id);
            const newArr = [
                ...others.slice(0, index),
                dragged,
                ...others.slice(index),
            ];
            return newArr.map((p, i) => ({ ...p, position: i + 1 }));
        });
    };
    const onDrop = () => {
        const ordered = profiles
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((p) => p.id);
        router.post(
            '/external-profiles/reorder',
            { external_profile_ids: ordered },
            {
                preserveScroll: true,
                only: ['externalProfiles'],
                onError: (errs) => setError(Object.values(errs)[0] as string),
                onFinish: () => {
                    dragId.current = null;
                },
            },
        );
    };

    const scheduleLabelSave = (id: number) => {
        if (saveTimersRef.current[id]) clearTimeout(saveTimersRef.current[id]);
        saveTimersRef.current[id] = setTimeout(() => {
            const pending = dirtyLabelsRef.current[id];
            if (pending !== undefined) {
                delete dirtyLabelsRef.current[id];
                router.patch(
                    `/external-profiles/${id}`,
                    { label: pending },
                    {
                        preserveScroll: true,
                        only: ['externalProfiles'],
                        onError: (errs) =>
                            setError(Object.values(errs)[0] as string),
                    },
                );
            }
        }, DEBOUNCE);
    };

    const onLabelChange = (id: number, value: string) => {
        setProfiles((prev) =>
            prev.map((p) => (p.id === id ? { ...p, label: value } : p)),
        );
        dirtyLabelsRef.current[id] = value;
        scheduleLabelSave(id);
    };

    const flushLabel = (id: number) => {
        if (saveTimersRef.current[id]) {
            clearTimeout(saveTimersRef.current[id]);
            delete saveTimersRef.current[id];
        }
        if (dirtyLabelsRef.current[id] !== undefined) {
            const pending = dirtyLabelsRef.current[id];
            delete dirtyLabelsRef.current[id];
            router.patch(
                `/external-profiles/${id}`,
                { label: pending },
                {
                    preserveScroll: true,
                    only: ['externalProfiles'],
                    onError: (errs) =>
                        setError(Object.values(errs)[0] as string),
                },
            );
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
                <select
                    value={form.platform}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, platform: e.target.value }))
                    }
                    className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                >
                    {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
                <input
                    className="w-48 flex-grow rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                    placeholder="handle"
                    value={form.handle}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, handle: e.target.value }))
                    }
                />
                <button
                    type="button"
                    disabled={adding}
                    onClick={createProfile}
                    className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                >
                    {adding ? 'Agregando...' : 'Agregar'}
                </button>
            </div>
            <InputError message={error} />
            <ul className="space-y-2">
                {profiles
                    .sort((a, b) => a.position - b.position)
                    .map((p) => (
                        <li
                            key={p.id}
                            draggable
                            onDragStart={onDragStart(p.id)}
                            onDragOver={onDragOver(p.id)}
                            onDrop={onDrop}
                            className="flex flex-wrap items-center gap-3 rounded border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                        >
                            <span className="cursor-move text-neutral-400 select-none">
                                ☰
                            </span>
                            <strong>{p.platform}</strong>
                            <a
                                href={p.url}
                                target="_blank"
                                className="truncate text-blue-600 hover:underline dark:text-blue-400"
                                rel="noreferrer"
                            >
                                {p.handle}
                            </a>
                            <input
                                className="min-w-32 flex-1 rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs dark:border-neutral-600 dark:bg-neutral-700"
                                placeholder="Etiqueta (opcional)"
                                value={p.label || ''}
                                onChange={(e) =>
                                    onLabelChange(p.id, e.target.value)
                                }
                                onBlur={() => flushLabel(p.id)}
                            />
                            {p.is_verified && (
                                <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-semibold tracking-wide text-white uppercase">
                                    verificado
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => removeProfile(p.id)}
                                className="ml-auto rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
