import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

export interface FeaturedTechnology {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
}

export interface FeaturedMember {
    id: number;
    display_name: string;
    username: string;
    bio?: string | null;
    technologies: FeaturedTechnology[];
    is_featured: boolean;
    avatar_url?: string | null;
}

interface FeaturedMembersProps {
    members: FeaturedMember[];
    className?: string;
}

function TechChip({ tech }: { tech: FeaturedTechnology }) {
    return (
        <span
            title={tech.name}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300/60 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
            {tech.icon ? (
                <img
                    src={tech.icon}
                    alt=""
                    className="h-3 w-3 object-contain opacity-80"
                    loading="lazy"
                />
            ) : (
                <span className="flex h-3 w-3 items-center justify-center rounded bg-fuchsia-500/70 text-[8px] leading-3 font-bold text-white dark:bg-fuchsia-400/70">
                    {tech.name.charAt(0).toUpperCase()}
                </span>
            )}
            {tech.name}
        </span>
    );
}

export const FeaturedMembers: React.FC<FeaturedMembersProps> = ({
    members,
    className = '',
}) => {
    return (
        <section
            aria-labelledby="featured-members-heading"
            className={
                'relative mx-auto mt-16 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 ' +
                className
            }
            id="miembros"
        >
            <div className="flex items-end justify-between gap-4">
                <h2
                    id="featured-members-heading"
                    className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                    Miembros destacados
                </h2>
                <Link
                    href="/members"
                    className="text-xs font-medium text-fuchsia-700 opacity-70 hover:underline hover:opacity-100 dark:text-fuchsia-300"
                >
                    Ver todos →
                </Link>
            </div>
            {members.length === 0 && (
                <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    Aún no hay perfiles destacados.{' '}
                    <span className="font-medium">
                        Crea o completa tu perfil para aparecer aquí.
                    </span>
                </div>
            )}
            {members.length > 0 && (
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {members.map((m) => (
                        <li
                            key={m.id}
                            className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="relative mb-3">
                                <AvatarSquare
                                    url={m.avatar_url}
                                    name={m.display_name}
                                    fullWidth
                                />
                                {m.is_featured && (
                                    <span
                                        className="absolute top-1 right-1 inline-flex items-center rounded-full border border-amber-400/60 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-700 uppercase shadow dark:border-amber-500/40 dark:bg-amber-900/60 dark:text-amber-200"
                                        title="Destacado por la comunidad"
                                    >
                                        ⭐
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
                                {m.technologies.slice(0, 5).map((t) => (
                                    <TechChip key={t.id} tech={t} />
                                ))}
                                {m.technologies.length === 0 && (
                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                        Sin tecnologías públicas
                                    </span>
                                )}
                            </div>
                            <div className="mt-auto">
                                <Link
                                    href={`/u/${m.username}`}
                                    className="inline-flex w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                >
                                    Ver perfil
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

interface AvatarSquareProps {
    url?: string | null;
    name: string;
    fullWidth?: boolean;
}
const AvatarSquare: React.FC<AvatarSquareProps> = ({
    url,
    name,
    fullWidth = false,
}) => {
    const [errored, setErrored] = useState(false);
    const initial = (name || '?').trim().charAt(0).toUpperCase();
    const baseClasses = fullWidth
        ? 'relative w-full aspect-square overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
        : 'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800';
    return (
        <div className={baseClasses}>
            {url && !errored ? (
                <img
                    src={url}
                    alt={name}
                    loading="lazy"
                    onError={() => setErrored(true)}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-neutral-600 dark:text-neutral-300">
                    {initial}
                </div>
            )}
            {url && errored && (
                <span className="absolute inset-x-0 bottom-0 bg-red-500/80 px-1 py-0.5 text-[9px] font-medium tracking-wide text-white">
                    ERR
                </span>
            )}
        </div>
    );
};

export default FeaturedMembers;
