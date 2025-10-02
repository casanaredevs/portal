import AdminLayout from '@/layouts/admin-layout';
import { adminRoutes } from '@/lib/admin-routes';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface MaintenanceConfig {
    enabled: boolean;
    until: string | null;
    message: string | null;
}
interface PageProps {
    maintenance: MaintenanceConfig;
}

function isoLocal(date: Date) {
    // Returns YYYY-MM-DDTHH:MM for datetime-local input
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes())
    );
}

const MaintenanceAdminPage: React.FC = () => {
    const { maintenance } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, wasSuccessful } = useForm<{
        enabled: boolean;
        until: string | '';
        message: string;
    }>({
        enabled: maintenance.enabled || false,
        until: maintenance.until ? maintenance.until.slice(0, 16) : '',
        message: maintenance.message || '',
    });

    const [scheduleOption, setScheduleOption] = useState<'none' | 'custom'>(
        data.until ? 'custom' : 'none',
    );

    useEffect(() => {
        if (scheduleOption === 'none') {
            setData('until', '');
        } else if (scheduleOption === 'custom' && !data.until) {
            const d = new Date();
            d.setHours(d.getHours() + 1);
            setData('until', isoLocal(d));
        }
    }, [scheduleOption]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(adminRoutes.maintenance(), { preserveScroll: true });
    };

    const disableNow = () => {
        setData({ ...data, enabled: false, until: '', message: '' });
        post(adminRoutes.maintenance(), { preserveScroll: true });
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">
                    Modo Mantenimiento
                </h1>
                <p className="mt-1 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
                    Configura el estado de mantenimiento global. Cuando está
                    activo los visitantes (y usuarios sin permiso) verán una
                    página especial y no podrán navegar.
                </p>
            </div>

            <form
                onSubmit={submit}
                className="grid gap-6 rounded border border-neutral-200 bg-white/80 p-5 md:max-w-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
            >
                <div className="flex items-center justify-between gap-4">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200">
                        Estado
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.enabled}
                            onChange={(e) =>
                                setData('enabled', e.target.checked)
                            }
                            className="h-4 w-4"
                        />
                        <span>{data.enabled ? 'Activo' : 'Inactivo'}</span>
                    </label>
                </div>
                {errors.enabled && (
                    <p className="text-sm text-red-600">{errors.enabled}</p>
                )}

                <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                        Cuenta regresiva (opcional)
                    </legend>
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="schedule"
                                value="none"
                                checked={scheduleOption === 'none'}
                                onChange={() => setScheduleOption('none')}
                            />
                            Sin fecha límite
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="schedule"
                                value="custom"
                                checked={scheduleOption === 'custom'}
                                onChange={() => setScheduleOption('custom')}
                            />
                            Hasta fecha/hora
                        </label>
                    </div>
                    {scheduleOption === 'custom' && (
                        <div className="flex flex-col gap-1">
                            <input
                                type="datetime-local"
                                value={data.until}
                                onChange={(e) =>
                                    setData('until', e.target.value)
                                }
                                className="rounded border border-neutral-300 bg-white px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                            />
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Usa tu zona horaria local. Se guarda en formato
                                ISO.
                            </p>
                            {errors.until && (
                                <p className="text-sm text-red-600">
                                    {errors.until}
                                </p>
                            )}
                        </div>
                    )}
                </fieldset>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Mensaje para visitantes (opcional)
                    </label>
                    <textarea
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        rows={4}
                        className="resize-y rounded border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-800"
                        placeholder="Ej: Estamos desplegando una nueva versión. Volveremos pronto."
                    />
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Máx 500 caracteres</span>
                        <span>{data.message.length}/500</span>
                    </div>
                    {errors.message && (
                        <p className="text-sm text-red-600">{errors.message}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    {data.enabled && (
                        <button
                            type="button"
                            onClick={disableNow}
                            className="inline-flex items-center justify-center rounded bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
                        >
                            Desactivar ahora
                        </button>
                    )}
                    {wasSuccessful && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                            Guardado
                        </span>
                    )}
                </div>
            </form>

            <div className="max-w-2xl rounded border border-amber-300 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-100">
                <p className="font-semibold">Permisos relacionados:</p>
                <ul className="mt-1 list-disc pl-5">
                    <li>
                        <code className="font-mono">maintenance.manage</code>:
                        puede activar/desactivar y configurar
                    </li>
                    <li>
                        <code className="font-mono">maintenance.bypass</code>:
                        puede navegar normalmente durante mantenimiento
                    </li>
                </ul>
            </div>
        </div>
    );
};

(MaintenanceAdminPage as any).layout = (page: React.ReactNode) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Administración', href: adminRoutes.index() },
        { title: 'Modo Mantenimiento', href: adminRoutes.maintenance() },
    ];
    return <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;
};

export default MaintenanceAdminPage;
