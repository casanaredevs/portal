import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { adminPath, adminRoutes } from '@/lib/admin-routes';
import type { PermissionString } from '@/lib/permissions.generated';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface RolePayload {
    id: number;
    name: string;
    permissions: string[];
    is_admin_star: boolean;
}
interface PermPayload {
    name: PermissionString;
    label: string;
    category: string;
}
interface UserPayload {
    id: number;
    name: string;
    username: string;
    roles: string[];
}

interface PageProps {
    roles: RolePayload[];
    permissions: PermPayload[];
    permissionMeta: Record<
        string,
        { label: string; category: string; description?: string }
    >;
    roleMap: Record<string, any>;
    users: {
        data: UserPayload[];
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        links: Array<{ url?: string; label: string; active: boolean }>;
    };
    filters: { search: string; per_page: number };
    admins_count: number;
}

// Utilidades locales
const cx = (...cls: (string | false | undefined)[]) =>
    cls.filter(Boolean).join(' ');

// Eliminamos CategoryBlock anterior y lo reemplazamos por uno colapsable
interface CollapsibleCategoryProps {
    category: string;
    perms: PermPayload[];
    role: RolePayload;
    isAdmin: boolean;
    onToggle: (perm: string) => void;
    permFilter: string;
    original: Set<string>;
}

const CollapsibleCategory: React.FC<CollapsibleCategoryProps> = ({
    category,
    perms,
    role,
    isAdmin,
    onToggle,
    permFilter,
    original,
}) => {
    const [open, setOpen] = useState(true);
    const visiblePerms = perms.filter((p) => {
        if (!permFilter) return true;
        const hay = permFilter.toLowerCase();
        return (
            p.label.toLowerCase().includes(hay) ||
            p.name.toLowerCase().includes(hay)
        );
    });
    if (!visiblePerms.length) return null;
    return (
        <div className="rounded border bg-neutral-50/40 dark:bg-neutral-900/40">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-300"
            >
                <span className="uppercase">{category}</span>
                <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    {open ? '−' : '+'}
                </span>
            </button>
            {open && (
                <div className="grid gap-2 border-t px-3 py-3 sm:grid-cols-2 md:grid-cols-3">
                    {visiblePerms.map((p) => {
                        const checked = role.permissions.includes(p.name);
                        const was = original.has(p.name);
                        const added = checked && !was;
                        const removed = !checked && was;
                        return (
                            <label
                                key={p.name}
                                className={cx(
                                    'group flex items-start gap-2 rounded p-1 text-xs transition',
                                    !isAdmin &&
                                        'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80',
                                    isAdmin && 'opacity-70',
                                    added &&
                                        'bg-green-50 ring-1 ring-green-500/70 dark:bg-green-900/30',
                                    removed &&
                                        'bg-red-50/60 line-through ring-1 ring-red-500/60 dark:bg-red-900/20',
                                )}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-0.5"
                                    disabled={isAdmin}
                                    checked={checked}
                                    onChange={() =>
                                        !isAdmin && onToggle(p.name)
                                    }
                                />
                                <span className="leading-tight">
                                    <span className="block font-medium text-neutral-800 dark:text-neutral-200">
                                        {p.label}
                                    </span>
                                    <span className="block font-mono text-[10px] text-neutral-500">
                                        {p.name}
                                    </span>
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Reemplazo completo del componente para soportar nuevas props y funciones
const RolesPermissionsPage: React.FC<PageProps> = (props) => {
    // Tabs: 'roles' | 'users'
    const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

    // Selected role
    const [selectedRole, setSelectedRole] = useState<RolePayload | null>(
        props.roles[0] ?? null,
    );

    // Separate searches
    const [userSearch, setUserSearch] = useState(props.filters?.search || '');
    const [permFilter, setPermFilter] = useState('');
    const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch);
    useEffect(() => {
        const id = setTimeout(() => setDebouncedUserSearch(userSearch), 350);
        return () => clearTimeout(id);
    }, [userSearch]);
    useEffect(() => {
        router.get(
            adminRoutes.rolesPermissions(),
            { search: debouncedUserSearch, per_page: perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, [debouncedUserSearch /* perPage below */]);

    // Pagination per page
    const [perPage, setPerPage] = useState<number>(
        props.filters?.per_page || 25,
    );
    useEffect(() => {
        router.get(
            adminRoutes.rolesPermissions(),
            { search: debouncedUserSearch, per_page: perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, [perPage]);

    // Original permissions snapshot per role (ref so does not trigger re-renders)
    const originalRolePermsRef = React.useRef<Record<number, Set<string>>>({});
    useEffect(() => {
        const map: Record<number, Set<string>> = {};
        props.roles.forEach((r) => {
            map[r.id] = new Set(r.permissions);
        });
        originalRolePermsRef.current = map;
    }, [props.roles]);

    // Build categories
    const permsByCategory = useMemo(() => {
        const map: Record<string, PermPayload[]> = {};
        props.permissions.forEach((p) => {
            (map[p.category] ||= []).push(p);
        });
        Object.values(map).forEach((arr) =>
            arr.sort((a, b) => a.label.localeCompare(b.label)),
        );
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    }, [props.permissions]);

    // Toggle permission in current selected role state
    const togglePermission = (perm: string) => {
        if (!selectedRole) return;
        if (selectedRole.is_admin_star) return;
        const has = selectedRole.permissions.includes(perm);
        setSelectedRole((r) =>
            r
                ? {
                      ...r,
                      permissions: has
                          ? r.permissions.filter((p) => p !== perm)
                          : [...r.permissions, perm],
                  }
                : r,
        );
    };

    // Diff detection for Save button & legend
    const original = selectedRole
        ? originalRolePermsRef.current[selectedRole.id] || new Set()
        : new Set<string>();
    const addedCount = selectedRole
        ? selectedRole.permissions.filter((p) => !original.has(p)).length
        : 0;
    const removedCount = selectedRole
        ? Array.from(original).filter(
              (p) => !selectedRole.permissions.includes(p),
          ).length
        : 0;
    const hasChanges = addedCount + removedCount > 0;

    // Save role with inline feedback
    const [savingRole, setSavingRole] = useState(false);
    const [roleJustSaved, setRoleJustSaved] = useState(false);
    const saveRole = () => {
        if (!selectedRole || selectedRole.is_admin_star || !hasChanges) return;
        setSavingRole(true);
        router.post(
            `${adminPath('roles')}/${selectedRole.id}/permissions`,
            { permissions: selectedRole.permissions },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh original snapshot for that role
                    originalRolePermsRef.current[selectedRole.id] = new Set(
                        selectedRole.permissions,
                    );
                    setRoleJustSaved(true);
                    setTimeout(() => setRoleJustSaved(false), 1800);
                },
                onFinish: () => setSavingRole(false),
            },
        );
    };

    // User roles editing
    const [selectedUser, setSelectedUser] = useState<UserPayload | null>(
        props.users.data[0] ?? null,
    );
    const { data, setData, post } = useForm<{ roles: string[] }>({ roles: [] });
    useEffect(() => {
        if (selectedUser) setData('roles', selectedUser.roles);
    }, [selectedUser]);
    const lastAdmin = props.admins_count === 1;
    const selectedUserIsSoleAdmin = !!(
        lastAdmin && selectedUser?.roles.includes('admin')
    );
    const removingAdminWouldBreak =
        selectedUserIsSoleAdmin && !data.roles.includes('admin');
    const toggleUserRole = (role: string) => {
        if (
            role === 'admin' &&
            selectedUserIsSoleAdmin &&
            data.roles.includes('admin')
        )
            return;
        const has = data.roles.includes(role);
        setData(
            'roles',
            has ? data.roles.filter((r) => r !== role) : [...data.roles, role],
        );
    };

    const [savingUserRoles, setSavingUserRoles] = useState(false);
    const [userRolesJustSaved, setUserRolesJustSaved] = useState(false);
    const saveUserRoles = () => {
        if (!selectedUser || removingAdminWouldBreak) return;
        setSavingUserRoles(true);
        post(`${adminPath('users')}/${selectedUser.id}/roles`, {
            preserveScroll: true,
            onSuccess: () => {
                setUserRolesJustSaved(true);
                setTimeout(() => setUserRolesJustSaved(false), 1800);
            },
            onFinish: () => setSavingUserRoles(false),
        });
    };

    // Bulk actions
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const allIdsCurrentPage = props.users.data.map((u) => u.id);
    const toggleSelectAllPage = () => {
        const allSelected = allIdsCurrentPage.every((id) =>
            selectedIds.includes(id),
        );
        setSelectedIds(
            allSelected
                ? selectedIds.filter((id) => !allIdsCurrentPage.includes(id))
                : Array.from(new Set([...selectedIds, ...allIdsCurrentPage])),
        );
    };
    const toggleSelectUser = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    const [bulkRoles, setBulkRoles] = useState<string[]>([]);
    const [bulkMode, setBulkMode] = useState<'attach' | 'sync'>('attach');
    const bulkDisabled = selectedIds.length === 0 || bulkRoles.length === 0;
    const submitBulk = () => {
        if (bulkDisabled) return;
        router.post(
            adminPath('users/bulk/roles'),
            { user_ids: selectedIds, roles: bulkRoles, mode: bulkMode },
            { preserveScroll: true, onSuccess: () => setBulkRoles([]) },
        );
    };

    // Pagination helpers
    const pagination = props.users;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Administración', href: adminPath() },
        { title: 'Roles & Permisos', href: adminRoutes.rolesPermissions() },
    ];

    // UI RENDER HELPERS
    const RoleLegend = hasChanges ? (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-3 text-[10px] text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-green-500/30 ring-1 ring-green-500/60" />{' '}
                    Añadido
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-red-500/30 ring-1 ring-red-500/60" />{' '}
                    Eliminado
                </span>
            </div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Permisos actuales:{' '}
                <span className="font-medium">
                    {selectedRole?.permissions.length ?? 0}
                </span>
                {hasChanges && (
                    <>
                        {' '}
                        (
                        {addedCount > 0 && (
                            <span className="text-green-600 dark:text-green-400">
                                +{addedCount}
                            </span>
                        )}
                        {removedCount > 0 && (
                            <>
                                {addedCount > 0 && ' / '}
                                <span className="text-red-600 dark:text-red-400">
                                    -{removedCount}
                                </span>
                            </>
                        )}
                        )
                    </>
                )}
                {selectedRole &&
                    !selectedRole.is_admin_star &&
                    addedCount + removedCount === 0 &&
                    ' (sin cambios)'}
            </div>
        </div>
    ) : (
        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Permisos actuales:{' '}
            <span className="font-medium">
                {selectedRole?.permissions.length ?? 0}
            </span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-5 p-4 md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Administración de Roles & Permisos
                    </h1>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Admins actuales: {props.admins_count}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={cx(
                            'border-b-2 px-3 py-2 text-sm font-medium',
                            activeTab === 'roles'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                        )}
                    >
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cx(
                            'border-b-2 px-3 py-2 text-sm font-medium',
                            activeTab === 'users'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                        )}
                    >
                        Usuarios
                    </button>
                </div>

                {activeTab === 'roles' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {props.roles.map((r) => {
                                const active = selectedRole?.id === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRole(r)}
                                        className={cx(
                                            'rounded-md border px-3 py-1.5 text-xs font-medium transition',
                                            active
                                                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                                : 'border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                                        )}
                                    >
                                        {r.name}
                                        {r.is_admin_star && ' *'}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedRole && (
                            <div className="flex flex-col gap-4 rounded border bg-white/70 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-semibold">
                                            Permisos del rol:{' '}
                                            <span className="font-bold">
                                                {selectedRole.name}
                                            </span>
                                        </h2>
                                        {selectedRole.is_admin_star && (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                                Rol admin: solo lectura (ya
                                                posee todos los permisos).
                                            </p>
                                        )}
                                        {RoleLegend}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {roleJustSaved && (
                                            <span className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-[11px] font-medium text-white">
                                                <Check className="h-3 w-3" />{' '}
                                                Guardado
                                            </span>
                                        )}
                                        <button
                                            disabled={
                                                selectedRole.is_admin_star ||
                                                !hasChanges ||
                                                savingRole
                                            }
                                            onClick={saveRole}
                                            className={cx(
                                                'inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium',
                                                selectedRole.is_admin_star ||
                                                    !hasChanges
                                                    ? 'cursor-not-allowed bg-neutral-300 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                                    : 'bg-blue-600 text-white hover:bg-blue-500',
                                                savingRole && 'opacity-80',
                                            )}
                                        >
                                            {savingRole && (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            )}{' '}
                                            Guardar
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                    <input
                                        type="text"
                                        value={permFilter}
                                        onChange={(e) =>
                                            setPermFilter(e.target.value)
                                        }
                                        placeholder="Filtrar permisos..."
                                        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {permFilter && (
                                        <button
                                            onClick={() => setPermFilter('')}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                <div className="flex max-h-[560px] flex-col gap-4 overflow-auto pr-1">
                                    {permsByCategory.map(([cat, perms]) => (
                                        <CollapsibleCategory
                                            key={cat}
                                            category={cat}
                                            perms={perms}
                                            role={selectedRole}
                                            isAdmin={
                                                !!selectedRole.is_admin_star
                                            }
                                            onToggle={togglePermission}
                                            permFilter={permFilter}
                                            original={original}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-end gap-4 rounded border bg-white/70 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                            <div className="flex flex-col">
                                <label className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                                    Buscar usuarios
                                </label>
                                <input
                                    value={userSearch}
                                    onChange={(e) =>
                                        setUserSearch(e.target.value)
                                    }
                                    placeholder="nombre, usuario o email"
                                    className="w-64 rounded border border-neutral-300 bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                                    Por página
                                </label>
                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        setPerPage(parseInt(e.target.value))
                                    }
                                    className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    {[10, 25, 50, 100].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                <span>Seleccionados: {selectedIds.length}</span>
                                <span className="flex flex-wrap gap-1">
                                    {Object.keys(props.roleMap).map((rn) => {
                                        const active = bulkRoles.includes(rn);
                                        return (
                                            <button
                                                key={rn}
                                                type="button"
                                                onClick={() =>
                                                    setBulkRoles((ar) =>
                                                        active
                                                            ? ar.filter(
                                                                  (x) =>
                                                                      x !== rn,
                                                              )
                                                            : [...ar, rn],
                                                    )
                                                }
                                                className={cx(
                                                    'rounded border px-2 py-0.5',
                                                    active
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600',
                                                )}
                                            >
                                                {rn}
                                            </button>
                                        );
                                    })}
                                </span>
                            </div>
                            <div className="ml-auto flex items-center gap-2 rounded border bg-neutral-100 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
                                <span className="font-medium">Modo</span>
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    setBulkMode('attach')
                                                }
                                                className={cx(
                                                    'rounded px-2 py-0.5',
                                                    bulkMode === 'attach'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
                                                )}
                                            >
                                                Adjuntar
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            className="max-w-xs text-xs"
                                            side="bottom"
                                        >
                                            <p>
                                                <strong>Adjuntar</strong>:
                                                agrega los roles elegidos a cada
                                                usuario sin quitar los que ya
                                                tiene.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    setBulkMode('sync')
                                                }
                                                className={cx(
                                                    'rounded px-2 py-0.5',
                                                    bulkMode === 'sync'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
                                                )}
                                            >
                                                Sincronizar
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            className="max-w-xs text-xs"
                                            side="bottom"
                                        >
                                            <p>
                                                <strong>Sincronizar</strong>:
                                                reemplaza todos los roles de
                                                cada usuario por el conjunto
                                                seleccionado (protege el último
                                                admin).
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div>
                                <button
                                    onClick={submitBulk}
                                    disabled={bulkDisabled}
                                    className={cx(
                                        'rounded px-3 py-1.5 text-xs font-medium',
                                        bulkDisabled
                                            ? 'cursor-not-allowed bg-neutral-300 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                            : 'bg-blue-600 text-white hover:bg-blue-500',
                                    )}
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded border bg-white/70 dark:border-neutral-700 dark:bg-neutral-900/60">
                            <div className="max-h-[440px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                        <tr>
                                            <th className="w-6 p-2 text-left">
                                                <input
                                                    type="checkbox"
                                                    onChange={
                                                        toggleSelectAllPage
                                                    }
                                                    checked={
                                                        allIdsCurrentPage.every(
                                                            (id) =>
                                                                selectedIds.includes(
                                                                    id,
                                                                ),
                                                        ) &&
                                                        allIdsCurrentPage.length >
                                                            0
                                                    }
                                                />
                                            </th>
                                            <th className="p-2 text-left">
                                                ID
                                            </th>
                                            <th className="p-2 text-left">
                                                Nombre
                                            </th>
                                            <th className="p-2 text-left">
                                                Usuario
                                            </th>
                                            <th className="p-2 text-left">
                                                Roles
                                            </th>
                                            <th className="p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.users.data.map((u) => {
                                            const rowSelected =
                                                selectedIds.includes(u.id);
                                            const active =
                                                selectedUser?.id === u.id;
                                            return (
                                                <tr
                                                    key={u.id}
                                                    className={cx(
                                                        'transition',
                                                        active
                                                            ? 'bg-blue-50 dark:bg-blue-900/30'
                                                            : rowSelected
                                                              ? 'bg-neutral-100 dark:bg-neutral-800/60'
                                                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40',
                                                    )}
                                                >
                                                    <td className="p-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                rowSelected
                                                            }
                                                            onChange={() =>
                                                                toggleSelectUser(
                                                                    u.id,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        {u.id}
                                                    </td>
                                                    <td className="p-2">
                                                        {u.name}
                                                    </td>
                                                    <td className="p-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                                        {u.username}
                                                    </td>
                                                    <td className="p-2">
                                                        <span className="truncate text-xs">
                                                            {u.roles.join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedUser(
                                                                    u,
                                                                )
                                                            }
                                                            className="text-xs font-medium text-blue-600 hover:underline"
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-neutral-500 dark:border-neutral-700">
                                <span>
                                    Página {pagination.current_page} de{' '}
                                    {pagination.last_page} (Total{' '}
                                    {pagination.total})
                                </span>
                                <div className="ml-auto flex gap-1">
                                    {pagination.links
                                        .filter((l) => l.url)
                                        .map((l, i) => (
                                            <button
                                                key={i}
                                                disabled={l.active}
                                                onClick={() =>
                                                    router.get(
                                                        l.url!,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                        },
                                                    )
                                                }
                                                className={cx(
                                                    'rounded border px-2 py-1',
                                                    l.active
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600',
                                                )}
                                            >
                                                {l.label
                                                    .replace('&laquo;', '«')
                                                    .replace('&raquo;', '»')}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {selectedUser && (
                            <div className="rounded border bg-white/70 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                        Roles del usuario:{' '}
                                        <span className="font-bold">
                                            {selectedUser.username}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {userRolesJustSaved && (
                                            <span className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-[11px] font-medium text-white">
                                                <Check className="h-3 w-3" />{' '}
                                                Guardado
                                            </span>
                                        )}
                                        <button
                                            onClick={saveUserRoles}
                                            disabled={
                                                removingAdminWouldBreak ||
                                                savingUserRoles
                                            }
                                            className={cx(
                                                'rounded px-3 py-1.5 text-xs font-medium',
                                                removingAdminWouldBreak
                                                    ? 'cursor-not-allowed bg-neutral-300 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                                    : 'bg-blue-600 text-white hover:bg-blue-500',
                                                savingUserRoles && 'opacity-80',
                                            )}
                                        >
                                            {savingUserRoles && (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            )}{' '}
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                                {removingAdminWouldBreak && (
                                    <p className="mb-2 text-[11px] text-amber-600 dark:text-amber-400">
                                        No puedes remover el rol admin: sería el
                                        último administrador.
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(props.roleMap).map(
                                        (roleName) => {
                                            const checked =
                                                data.roles.includes(roleName);
                                            const disabled =
                                                roleName === 'admin' &&
                                                selectedUserIsSoleAdmin &&
                                                checked;
                                            return (
                                                <label
                                                    key={roleName}
                                                    className={cx(
                                                        'flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs font-medium',
                                                        disabled
                                                            ? 'opacity-60'
                                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60',
                                                        checked
                                                            ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30'
                                                            : 'border-neutral-300 dark:border-neutral-600',
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={disabled}
                                                        onChange={() =>
                                                            toggleUserRole(
                                                                roleName,
                                                            )
                                                        }
                                                    />
                                                    {roleName}
                                                    {roleName === 'admin' &&
                                                        ' *'}
                                                </label>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default RolesPermissionsPage;
