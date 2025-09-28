import React from 'react';
import { Link } from '@inertiajs/react';

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
        <span className="h-3 w-3 rounded bg-fuchsia-500/70 text-[8px] font-bold leading-3 text-white dark:bg-fuchsia-400/70 flex items-center justify-center">
          {tech.name.charAt(0).toUpperCase()}
        </span>
      )}
      {tech.name}
    </span>
  );
}

export const FeaturedMembers: React.FC<FeaturedMembersProps> = ({ members, className = '' }) => {
  return (
    <section
      aria-labelledby="featured-members-heading"
      className={"relative mx-auto mt-16 max-w-6xl px-6 sm:px-8 md:px-12 lg:px-20 " + className}
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
          href="#"
          className="text-xs font-medium text-fuchsia-700 opacity-70 hover:opacity-100 hover:underline dark:text-fuchsia-300"
        >
          Ver todos (pronto)
        </Link>
      </div>
      {members.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Aún no hay perfiles destacados. <span className="font-medium">Crea o completa tu perfil para aparecer aquí.</span>
        </div>
      )}
      {members.length > 0 && (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {members.map((m) => (
            <li
              key={m.id}
              className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  <Link
                    href={`/u/${m.username}`}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900"
                  >
                    {m.display_name}
                  </Link>
                </h3>
                {m.is_featured && (
                  <span
                    className="inline-flex shrink-0 items-center rounded-full border border-amber-400/60 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-300"
                    title="Destacado por la comunidad"
                  >
                    ⭐
                  </span>
                )}
              </div>
              {m.bio && (
                <p className="mb-4 line-clamp-3 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
                  {m.bio}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-1.5">
                {m.technologies.slice(0, 5).map((t) => (
                  <TechChip key={t.id} tech={t} />
                ))}
                {m.technologies.length === 0 && (
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Sin tecnologías públicas</span>
                )}
              </div>
              <div className="mt-4">
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

export default FeaturedMembers;

