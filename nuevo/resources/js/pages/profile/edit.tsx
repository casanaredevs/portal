import InputError from '@/components/input-error';
import { ExternalProfilesEditor } from '@/components/profile/external-profiles-editor';
import { SkillEditor } from '@/components/profile/skill-editor';
import DashboardLayout from '@/layouts/dashboard-layout';
import { patchJson } from '@/lib/api';
import profileRoutes from '@/routes/profile';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface UserData {
    id: number;
    name: string;
    display_name?: string | null;
    username?: string | null;
    bio?: string | null;
    about?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    availability?: Record<string, boolean> | null;
    privacy?: Record<string, string> | null;
}
interface Skill {
    id: number;
    technology: any;
    level: string;
    years_experience: number | null;
    position: number;
    visibility: string;
}
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

export default function ProfileEditPage() {
    const { props } = usePage<{
        user: UserData;
        skills: Skill[];
        externalProfiles: ExternalProfile[];
    }>();
    const [form, setForm] = useState({
        display_name: props.user.display_name || '',
        username: props.user.username || '',
        bio: props.user.bio || '',
        about: props.user.about || '',
        location_city: props.user.location_city || '',
        location_country: props.user.location_country || '',
        privacy: props.user.privacy || {
            bio: 'public',
            about: 'public',
            location: 'public',
        },
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    const onChange = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

    const save = async () => {
        setSaving(true);
        setError(undefined);
        setFieldErrors({});
        try {
            const res = await patchJson<{ data: any; message: string }>(
                '/profile',
                form,
            );
            setSavedAt(new Date());
            if (!form.username && res.data?.username) {
                setForm((f) => ({ ...f, username: res.data.username }));
            }
        } catch (e: any) {
            setError(e.message || 'Error al guardar');
            if (e.errors) setFieldErrors(e.errors);
        } finally {
            setSaving(false);
        }
    };

    const privacyOption = (field: string) => (
        <select
            value={form.privacy?.[field] || 'public'}
            onChange={(e) =>
                onChange('privacy', {
                    ...(form.privacy || {}),
                    [field]: e.target.value,
                })
            }
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-800"
        >
            <option value="public">public</option>
            <option value="members">members</option>
            <option value="private">private</option>
        </select>
    );

    return (
        <DashboardLayout
            breadcrumbs={[
                { title: 'Editar Perfil', href: profileRoutes.edit().url },
            ]}
        >
            <Head title="Editar perfil" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4">
                <section className="rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                    <h1 className="mb-4 text-lg font-semibold">
                        Información básica
                    </h1>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                Display name
                            </label>
                            <input
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.display_name}
                                onChange={(e) =>
                                    onChange('display_name', e.target.value)
                                }
                            />
                            <InputError
                                message={fieldErrors.display_name?.[0]}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                Username (slug)
                            </label>
                            <input
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.username}
                                onChange={(e) =>
                                    onChange('username', e.target.value)
                                }
                            />
                            <InputError message={fieldErrors.username?.[0]} />
                        </div>
                        <div className="col-span-full flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                Bio (≤280)
                            </label>
                            <textarea
                                rows={2}
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.bio}
                                onChange={(e) =>
                                    onChange('bio', e.target.value)
                                }
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>{form.bio.length}/280</span>
                            </div>
                            <InputError message={fieldErrors.bio?.[0]} />
                        </div>
                        <div className="col-span-full flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                About (HTML / Markdown básico)
                            </label>
                            <textarea
                                rows={6}
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.about}
                                onChange={(e) =>
                                    onChange('about', e.target.value)
                                }
                            />
                            <InputError message={fieldErrors.about?.[0]} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                Ciudad
                            </label>
                            <input
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.location_city || ''}
                                onChange={(e) =>
                                    onChange('location_city', e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">
                                País (ISO2)
                            </label>
                            <input
                                maxLength={2}
                                className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm uppercase dark:border-neutral-600 dark:bg-neutral-800"
                                value={form.location_country || ''}
                                onChange={(e) =>
                                    onChange(
                                        'location_country',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                            />
                            <InputError
                                message={fieldErrors.location_country?.[0]}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            Bio privacidad {privacyOption('bio')}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            About privacidad {privacyOption('about')}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            Location privacidad {privacyOption('location')}
                        </div>
                    </div>
                    <InputError message={error} className="mt-2" />
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={save}
                            className="rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        {savedAt && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                                Guardado {savedAt.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </section>

                <section className="rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                    <h2 className="mb-4 text-lg font-semibold">Skills</h2>
                    <SkillEditor initialSkills={props.skills} />
                </section>

                <section className="rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                    <h2 className="mb-4 text-lg font-semibold">
                        Perfiles Externos
                    </h2>
                    <ExternalProfilesEditor
                        initialProfiles={props.externalProfiles}
                    />
                </section>
            </div>
        </DashboardLayout>
    );
}
