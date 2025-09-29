import PublicLayout from '@/layouts/public/public-layout';
import type { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface MemberTechnology {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
}
interface MemberItem {
    id: number;
    display_name: string;
    username: string;
    avatar_url?: string | null;
    bio?: string | null;
    is_featured: boolean;
    technologies: MemberTechnology[];
}
interface MembersPageProps extends SharedData {
    members: MemberItem[];
    filters: { q?: string | null; tech?: string | null };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    technologies: {
        id: number;
        name: string;
        slug: string;
        icon?: string | null;
    }[];
}

const MemberAvatar: React.FC<{
    url?: string | null;
    name: string;
    fullWidth?: boolean;
    featured?: boolean;
}> = ({ url, name, fullWidth = false }) => {
    const initial = (name || '?').charAt(0).toUpperCase();
    const [err, setErr] = useState(false);
    const base = fullWidth
        ? 'relative w-full aspect-square overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
        : 'relative w-16 aspect-square overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800';
    return (
        <div className={base}>
            {url && !err ? (
                <img
                    src={url}
                    alt={name}
                    loading="lazy"
                    onError={() => setErr(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                    {initial}
                </div>
            )}
            {url && err && (
                <span className="absolute inset-x-0 bottom-0 bg-red-500/80 px-1 py-0.5 text-[9px] font-medium text-white">
                    ERR
                </span>
            )}
        </div>
    );
};

const MemberCard: React.FC<{ m: MemberItem }> = ({ m }) => (
    <li className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative mb-3">
            <MemberAvatar url={m.avatar_url} name={m.display_name} fullWidth />
            {m.is_featured && (
                <span className="absolute top-1 right-1 inline-flex items-center rounded-full border border-amber-400/60 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-700 uppercase dark:border-amber-500/40 dark:bg-amber-900/60 dark:text-amber-200">
                    ★
                </span>
            )}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            <Link
                href={`/u/${m.username}`}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900"
            >
                {m.display_name}
            </Link>
        </h3>
        {m.bio && (
            <p className="mb-3 line-clamp-3 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
                {m.bio}
            </p>
        )}
        <div className="mb-4 flex flex-wrap gap-1.5">
            {m.technologies.slice(0, 6).map((t) => (
                <span
                    key={t.id}
                    className="inline-flex items-center gap-1 rounded-md border border-neutral-300/60 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                    {t.icon && (
                        <img
                            src={t.icon}
                            alt=""
                            className="h-3 w-3 object-contain opacity-80"
                            loading="lazy"
                        />
                    )}
                    {t.name}
                </span>
            ))}
            {m.technologies.length === 0 && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    Sin tecnologías públicas
                </span>
            )}
        </div>
        <div className="mt-auto pt-1">
            <Link
                href={`/u/${m.username}`}
                className="inline-flex w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
                Ver perfil
            </Link>
        </div>
    </li>
);

export default function MembersIndex() {
    const { members, filters, pagination, technologies } =
        usePage<MembersPageProps>().props;
    const [q, setQ] = useState(filters.q || '');
    const [tech, setTech] = useState(filters.tech || '');

    // Sync when server filters change (pagination / etc.)
    useEffect(() => {
        setQ(filters.q || '');
        setTech(filters.tech || '');
    }, [filters.q, filters.tech]);

    const apply = (page?: number) => {
        router.get(
            '/members',
            {
                q: q || undefined,
                tech: tech || undefined,
                page: page || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clear = () => {
        setQ('');
        setTech('');
        router.get(
            '/members',
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const goPage = (p: number) => apply(p);

    return (
        <PublicLayout>
            <Head title="Miembros | Casanare Devs" />
            <section className="mx-auto mt-10 max-w-7xl px-6 pb-24 sm:px-8 md:px-12">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Miembros
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Explora el talento de la comunidad y sus
                            tecnologías.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{pagination.total} miembros</span>
                    </div>
                </header>

                <div className="mt-6 flex flex-wrap items-end gap-4 rounded-lg border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
                    <div className="flex flex-col text-sm">
                        <label
                            htmlFor="q"
                            className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
                        >
                            Búsqueda
                        </label>
                        <input
                            id="q"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-56 rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                            placeholder="Nombre, usuario, bio..."
                        />
                    </div>
                    <div className="flex flex-col text-sm">
                        <label
                            htmlFor="tech"
                            className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
                        >
                            Tecnología
                        </label>
                        <select
                            id="tech"
                            value={tech}
                            onChange={(e) => setTech(e.target.value)}
                            className="min-w-40 rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            <option value="">Todas</option>
                            {technologies.map((t) => (
                                <option key={t.id} value={t.slug}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={() => apply()}
                        className="mt-5 inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                        Aplicar
                    </button>
                    <button
                        type="button"
                        onClick={clear}
                        className="mt-5 inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        Limpiar
                    </button>
                </div>

                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {members.map((m) => (
                        <MemberCard key={m.id} m={m} />
                    ))}
                    {members.length === 0 && (
                        <li className="col-span-full rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                            No se encontraron miembros.
                        </li>
                    )}
                </ul>

                {pagination.last_page > 1 && (
                    <nav
                        className="mt-10 flex items-center justify-center gap-2 text-sm"
                        aria-label="Paginación"
                    >
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => goPage(pagination.current_page - 1)}
                            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            Anterior
                        </button>
                        <span className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
                            {pagination.current_page} / {pagination.last_page}
                        </span>
                        <button
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() => goPage(pagination.current_page + 1)}
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
