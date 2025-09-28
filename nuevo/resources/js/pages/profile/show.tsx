import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';

interface Technology { id:number; name:string; slug:string; icon?:string|null; category?:string }
interface Skill { id:number; technology:Technology; level:string; years_experience:number|null; position:number }
interface ExternalProfile { id:number; platform:string; handle:string; url:string; label?:string|null; icon?:string|null; is_verified:boolean; position:number }
interface ProfileData {
  id:number; username:string; display_name?:string|null; name:string; bio?:string|null; about?:string|null;
  location_city?:string|null; location_country?:string|null; skills:Skill[]; external_profiles:ExternalProfile[];
}

export default function PublicProfileShow() {
  const { props } = usePage<PageProps & { profile: ProfileData }>();
  const profile = props.profile;
  const title = profile.display_name || profile.name || profile.username;

  return (
    <AppLayout breadcrumbs={[{ title: title, href: `/u/${profile.username}` }]}>
      <Head title={title} />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
        <header className="flex flex-col gap-2 border-b pb-4 dark:border-neutral-700">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span>@{profile.username}</span>
            {profile.location_city && <span>{profile.location_city}{profile.location_country ? `, ${profile.location_country}`:''}</span>}
          </div>
          {profile.bio && <p className="text-sm text-neutral-700 dark:text-neutral-300">{profile.bio}</p>}
        </header>

        {profile.about && (
          <section className="prose max-w-none dark:prose-invert prose-sm">
            <h2 className="mb-2 text-base font-semibold">Sobre mí</h2>
            <div dangerouslySetInnerHTML={{ __html: profile.about }} />
          </section>
        )}

        <section>
          <h2 className="mb-2 text-base font-semibold">Stack</h2>
          {profile.skills.length === 0 && (
            <p className="text-sm text-neutral-500">Sin skills públicas.</p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {profile.skills.sort((a,b)=> a.position - b.position).map(s => (
              <li key={s.id} className="rounded border border-neutral-300 bg-white p-3 text-sm dark:border-neutral-600 dark:bg-neutral-800">
                <div className="font-medium">{s.technology.name}</div>
                <div className="text-xs text-neutral-500">{s.level}</div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Perfiles externos</h2>
          {profile.external_profiles.length === 0 && <p className="text-sm text-neutral-500">No hay perfiles.</p>}
          <ul className="flex flex-wrap gap-3">
            {profile.external_profiles.sort((a,b)=> a.position - b.position).map(p => (
              <li key={p.id} className="text-sm">
                <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400">
                  <span className="font-medium">{p.platform}</span>
                  <span className="text-neutral-500">/{p.handle}</span>
                  {p.is_verified && <span className="rounded bg-green-600 px-1 text-[10px] font-semibold uppercase tracking-wide text-white">✓</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}

