import AppLayout from '@/layouts/app-layout';
import { adminRoutes } from '@/lib/admin-routes';
import type { BreadcrumbItem } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';

interface EventRow {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    type: string;
    start_at: string | null;
    end_at: string | null;
    capacity: number | null;
    seats_taken: number;
    seats_remaining: number | null;
    status: string;
    created_at: string | null;
}
interface PageProps {
    events: EventRow[];
    filters: {
        search?: string;
        status?: string;
        type?: string;
        when?: string;
        per_page: number;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    can: { create: boolean; edit: boolean; delete: boolean; publish: boolean };
}

const TYPE_OPTIONS = ['', 'kata', 'taller', 'meetup'];
const STATUS_OPTIONS = ['', 'draft', 'published', 'cancelled'];
const WHEN_OPTIONS = ['', 'upcoming', 'past'];

function formatDate(value?: string | null) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

const AdminEventsPage: React.FC = () => {
    const { events, filters, pagination, can } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');
    const [when, setWhen] = useState(filters.when || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 15);

    // Debounce search
    useEffect(() => {
        const id = setTimeout(() => {
            applyFilters(false);
        }, 450);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = (pushState = true) => {
        router.get(
            adminRoutes.events(),
            {
                search: search || undefined,
                status: status || undefined,
                type: type || undefined,
                when: when || undefined,
                per_page: perPage !== 15 ? perPage : undefined,
            },
            { preserveScroll: true, preserveState: true, replace: !pushState },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setType('');
        setWhen('');
        setPerPage(15);
        router.get(
            adminRoutes.events(),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const goPage = (page: number) => {
        router.get(
            adminRoutes.events(),
            {
                search: search || undefined,
                status: status || undefined,
                type: type || undefined,
                when: when || undefined,
                per_page: perPage,
                page,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    // Create form
    const { data, setData, post, processing, reset, errors } = useForm<{
        title: string;
        summary: string;
        description: string;
        type: string;
        start_at: string;
        end_at: string;
        capacity: number | '';
        status: string;
    }>({
        title: '',
        summary: '',
        description: '',
        type: 'kata',
        start_at: '',
        end_at: '',
        capacity: '',
        status: 'draft',
    });
    const [showCreate, setShowCreate] = useState(false);
    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(adminRoutes.events(), {
            onSuccess: () => {
                reset();
                setShowCreate(false);
            },
            preserveScroll: true,
        });
    };

    // Editing inline
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBuffer, setEditBuffer] = useState<
        Record<number, Partial<EventRow & { description?: string }>>
    >({});
    const startEdit = (ev: EventRow) => {
        setEditingId(ev.id);
        setEditBuffer((b) => ({ ...b, [ev.id]: { ...ev } }));
    };
    const cancelEdit = () => {
        if (editingId !== null) {
            setEditBuffer((b) => {
                const c = { ...b };
                delete c[editingId];
                return c;
            });
        }
        setEditingId(null);
    };
    const updateField = (id: number, field: string, value: any) => {
        setEditBuffer((b) => ({ ...b, [id]: { ...b[id], [field]: value } }));
    };
    const saveEdit = (id: number) => {
        const payload = editBuffer[id];
        if (!payload) return;
        router.patch(`${adminRoutes.events()}/${id}`, payload, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };
    const deleteEvent = (id: number) => {
        if (!confirm('¿Eliminar evento? Esta acción no se puede deshacer.'))
            return;
        router.delete(`${adminRoutes.events()}/${id}`, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Administración', href: adminRoutes.index() },
        { title: 'Eventos', href: adminRoutes.events() },
    ];

    const legend = useMemo(
        () => (
            <div className="flex flex-wrap gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>Total: {pagination.total}</span>
                {search && <span>Búsqueda: "{search}"</span>}
            </div>
        ),
        [pagination.total, search],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Eventos
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Gestiona los eventos: crear, editar, publicar o
                            eliminar.
                        </p>
                    </div>
                    {legend}
                </div>

                <div className="flex flex-wrap gap-4 rounded border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <div className="flex flex-col text-xs">
                        <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Buscar
                        </label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Título o resumen"
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                    </div>
                    <div className="flex flex-col text-xs">
                        <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Estado
                        </label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilters();
                            }}
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s || 'Todos'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col text-xs">
                        <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Tipo
                        </label>
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                applyFilters();
                            }}
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {TYPE_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s || 'Todos'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col text-xs">
                        <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Cuándo
                        </label>
                        <select
                            value={when}
                            onChange={(e) => {
                                setWhen(e.target.value);
                                applyFilters();
                            }}
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {WHEN_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s || 'Todos'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col text-xs">
                        <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Por página
                        </label>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                applyFilters();
                            }}
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {[10, 15, 25, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => applyFilters()}
                            className="rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={clearFilters}
                            className="rounded border border-neutral-300 px-4 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            Limpiar
                        </button>
                    </div>
                    {can.create && (
                        <div className="ml-auto flex items-end">
                            <button
                                onClick={() => setShowCreate((s) => !s)}
                                className="rounded border border-neutral-300 bg-white px-4 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            >
                                {showCreate ? 'Cerrar' : 'Nuevo'}
                            </button>
                        </div>
                    )}
                </div>

                {showCreate && can.create && (
                    <form
                        onSubmit={submitCreate}
                        className="space-y-4 rounded border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60"
                    >
                        <h2 className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200">
                            Crear evento
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col text-sm">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Título
                                </label>
                                <input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col text-sm">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Tipo
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', e.target.value)
                                    }
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    {TYPE_OPTIONS.filter(Boolean).map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col text-sm">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Inicio
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.start_at}
                                    onChange={(e) =>
                                        setData('start_at', e.target.value)
                                    }
                                    required
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.start_at && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.start_at}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col text-sm">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Fin
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.end_at}
                                    onChange={(e) =>
                                        setData('end_at', e.target.value)
                                    }
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.end_at && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.end_at}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col text-sm md:col-span-2">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Resumen
                                </label>
                                <input
                                    value={data.summary}
                                    onChange={(e) =>
                                        setData('summary', e.target.value)
                                    }
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.summary && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.summary}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col text-sm md:col-span-2">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Descripción
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={4}
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col text-sm">
                                <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    Capacidad
                                </label>
                                <input
                                    type="number"
                                    value={data.capacity}
                                    onChange={(e) =>
                                        setData(
                                            'capacity',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : '',
                                        )
                                    }
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                {errors.capacity && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.capacity}
                                    </p>
                                )}
                            </div>
                            {can.publish && (
                                <div className="flex flex-col text-sm">
                                    <label className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                        Estado
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value)
                                        }
                                        className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        {STATUS_OPTIONS.filter(Boolean).map(
                                            (s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                disabled={processing}
                                className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                            >
                                Crear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setShowCreate(false);
                                }}
                                className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-neutral-100/70 text-xs tracking-wide text-neutral-600 uppercase dark:bg-neutral-800/60 dark:text-neutral-400">
                            <tr>
                                <th className="px-3 py-2">Título</th>
                                <th className="px-3 py-2">Tipo</th>
                                <th className="px-3 py-2">Inicio</th>
                                <th className="px-3 py-2">Capacidad</th>
                                <th className="px-3 py-2">Ocupadas</th>
                                <th className="px-3 py-2">Estado</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((ev) => {
                                const editing = editingId === ev.id;
                                const buf = editBuffer[ev.id] || {};
                                return (
                                    <React.Fragment key={ev.id}>
                                        <tr className="border-t border-neutral-200 align-top hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
                                            <td className="px-3 py-2 font-medium text-neutral-800 dark:text-neutral-100">
                                                {editing ? (
                                                    <input
                                                        value={
                                                            (buf.title as string) ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                ev.id,
                                                                'title',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                                                    />
                                                ) : (
                                                    <div>
                                                        <div>{ev.title}</div>
                                                        <div className="mt-0.5 line-clamp-2 text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                                                            {ev.summary}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {editing ? (
                                                    <select
                                                        value={
                                                            (buf.type as string) ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                ev.id,
                                                                'type',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                                                    >
                                                        {TYPE_OPTIONS.filter(
                                                            Boolean,
                                                        ).map((t) => (
                                                            <option
                                                                key={t}
                                                                value={t}
                                                            >
                                                                {t}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    ev.type
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                {editing ? (
                                                    <input
                                                        type="datetime-local"
                                                        value={
                                                            (
                                                                buf.start_at as string
                                                            )?.slice(0, 16) ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                ev.id,
                                                                'start_at',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                                                    />
                                                ) : (
                                                    formatDate(ev.start_at)
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        value={
                                                            (buf.capacity as number) ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                ev.id,
                                                                'capacity',
                                                                e.target.value
                                                                    ? Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : null,
                                                            )
                                                        }
                                                        className="w-20 rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                                                    />
                                                ) : (
                                                    (ev.capacity ?? '—')
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs">
                                                {ev.seats_taken}
                                                {ev.capacity ? (
                                                    <span className="text-[10px] text-neutral-500">
                                                        /{ev.capacity}
                                                    </span>
                                                ) : (
                                                    ''
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                {editing && can.publish ? (
                                                    <select
                                                        value={
                                                            (buf.status as string) ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                ev.id,
                                                                'status',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs capitalize dark:border-neutral-700 dark:bg-neutral-800"
                                                    >
                                                        {STATUS_OPTIONS.filter(
                                                            Boolean,
                                                        ).map((s) => (
                                                            <option
                                                                key={s}
                                                                value={s}
                                                            >
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] font-medium capitalize dark:bg-neutral-700">
                                                        {ev.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs">
                                                {!editing && can.edit && (
                                                    <button
                                                        onClick={() =>
                                                            startEdit(ev)
                                                        }
                                                        className="mr-2 rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {editing && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                saveEdit(ev.id)
                                                            }
                                                            className="mr-2 rounded bg-neutral-900 px-2 py-1 font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="mr-2 rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                )}
                                                {can.delete && !editing && (
                                                    <button
                                                        onClick={() =>
                                                            deleteEvent(ev.id)
                                                        }
                                                        className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {editing && (
                                            <tr className="border-t border-neutral-200 dark:border-neutral-800">
                                                <td
                                                    colSpan={7}
                                                    className="bg-neutral-50 p-3 dark:bg-neutral-800/40"
                                                >
                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        <div className="flex flex-col text-xs md:col-span-2">
                                                            <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                                                Descripción
                                                            </label>
                                                            <textarea
                                                                value={
                                                                    (buf.description as string) ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateField(
                                                                        ev.id,
                                                                        'description',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                rows={4}
                                                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col text-xs">
                                                            <label className="mb-1 font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                                                Fin
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                value={
                                                                    (
                                                                        buf.end_at as string
                                                                    )?.slice(
                                                                        0,
                                                                        16,
                                                                    ) || ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateField(
                                                                        ev.id,
                                                                        'end_at',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {events.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400"
                                    >
                                        No hay eventos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => goPage(pagination.current_page - 1)}
                            className="rounded border border-neutral-300 px-3 py-1 disabled:opacity-50 dark:border-neutral-700"
                        >
                            Anterior
                        </button>
                        <span>
                            {pagination.current_page} / {pagination.last_page}
                        </span>
                        <button
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() => goPage(pagination.current_page + 1)}
                            className="rounded border border-neutral-300 px-3 py-1 disabled:opacity-50 dark:border-neutral-700"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default AdminEventsPage;
