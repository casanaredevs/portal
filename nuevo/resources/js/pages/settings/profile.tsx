import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { ExternalProfilesEditor } from '@/components/profile/external-profiles-editor';
import { SkillEditor } from '@/components/profile/skill-editor';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

interface PrivacySettings {
    bio: string;
    about: string;
    location: string;
}

interface ProfileFormData {
    name: string;
    email: string;
    display_name: string;
    username: string;
    bio: string;
    about: string;
    location_city: string;
    location_country: string;
    avatar_url?: string; // agregado para formulario de avatar
    privacy: PrivacySettings;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, profileUser, skills, externalProfiles } = usePage<
        SharedData & {
            profileUser: any;
            skills: any[];
            externalProfiles: any[];
        }
    >().props;

    const form = useForm<ProfileFormData>({
        name: auth.user.name || '',
        email: auth.user.email || '',
        display_name: profileUser?.display_name || '',
        username: profileUser?.username || '',
        bio: profileUser?.bio || '',
        about: profileUser?.about || '',
        location_city: profileUser?.location_city || '',
        location_country: profileUser?.location_country || '',
        avatar_url: profileUser?.avatar_url || '',
        privacy: (profileUser?.privacy as PrivacySettings) || {
            bio: 'public',
            about: 'public',
            location: 'public',
        },
    });

    const privacySelect = (field: keyof PrivacySettings) => (
        <select
            value={form.data.privacy[field] || 'public'}
            onChange={(e) =>
                form.setData('privacy', {
                    ...form.data.privacy,
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <div className="space-y-10">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.patch(ProfileController.update.url(), {
                                preserveScroll: true,
                            });
                        }}
                        className="space-y-8"
                    >
                        {/* Contenido del formulario (reemplazo del componente <Form>) */}
                        <div className="space-y-6">
                            <HeadingSmall
                                title="Profile information"
                                description="Update all your profile data"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={form.errors.name}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={form.errors.email}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="display_name">
                                        Display name
                                    </Label>
                                    <Input
                                        id="display_name"
                                        name="display_name"
                                        value={form.data.display_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'display_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={
                                            form.errors.display_name as any
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="username">
                                        Username (slug)
                                    </Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={form.data.username}
                                        onChange={(e) =>
                                            form.setData(
                                                'username',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={form.errors.username as any}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="avatar_url">
                                        Avatar URL
                                    </Label>
                                    <Input
                                        id="avatar_url"
                                        name="avatar_url"
                                        value={
                                            (form.data as any).avatar_url || ''
                                        }
                                        onChange={(e) =>
                                            form.setData(
                                                'avatar_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://..."
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={
                                            (form.errors as any).avatar_url
                                        }
                                    />
                                </div>
                                <div className="col-span-full flex flex-col gap-1">
                                    <Label htmlFor="bio">Bio (≤280)</Label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={2}
                                        value={form.data.bio}
                                        onChange={(e) =>
                                            form.setData('bio', e.target.value)
                                        }
                                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                    />
                                    <div className="text-right text-xs text-neutral-500">
                                        {form.data.bio.length}/280
                                    </div>
                                    <InputError message={form.errors.bio} />
                                </div>
                                <div className="col-span-full flex flex-col gap-1">
                                    <Label htmlFor="about">About</Label>
                                    <textarea
                                        id="about"
                                        name="about"
                                        rows={6}
                                        value={form.data.about}
                                        onChange={(e) =>
                                            form.setData(
                                                'about',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                                    />
                                    <InputError message={form.errors.about} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="location_city">City</Label>
                                    <Input
                                        id="location_city"
                                        name="location_city"
                                        value={form.data.location_city}
                                        onChange={(e) =>
                                            form.setData(
                                                'location_city',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="location_country">
                                        Country (ISO2)
                                    </Label>
                                    <Input
                                        id="location_country"
                                        name="location_country"
                                        maxLength={2}
                                        value={form.data.location_country}
                                        onChange={(e) =>
                                            form.setData(
                                                'location_country',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.location_country}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    Bio {privacySelect('bio')}
                                </div>
                                <div className="flex items-center gap-2">
                                    About {privacySelect('about')}
                                </div>
                                <div className="flex items-center gap-2">
                                    Location {privacySelect('location')}
                                </div>
                            </div>
                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <p className="text-xs text-muted-foreground">
                                        Your email is unverified.
                                    </p>
                                )}
                            <div className="flex items-center gap-4">
                                <Button disabled={form.processing}>
                                    {form.processing ? 'Saving...' : 'Save all'}
                                </Button>
                                <Transition
                                    show={form.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        Saved
                                    </p>
                                </Transition>
                            </div>
                        </div>

                        <div className="space-y-4 rounded border border-neutral-300 p-4 dark:border-neutral-700">
                            <h2 className="text-base font-semibold">Skills</h2>
                            <SkillEditor initialSkills={skills || []} />
                        </div>
                        <div className="space-y-4 rounded border border-neutral-300 p-4 dark:border-neutral-700">
                            <h2 className="text-base font-semibold">
                                External profiles
                            </h2>
                            <ExternalProfilesEditor
                                initialProfiles={externalProfiles || []}
                            />
                        </div>
                        <DeleteUser />
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
