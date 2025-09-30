import type { PermissionString } from '@/lib/permissions.generated';
import { Head, router, useForm } from '@inertiajs/react';
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

const CategoryBlock: React.FC<{
    category: string;
    perms: PermPayload[];
    role?: RolePayload;
    onToggle?: (perm: string) => void;
}> = ({ category, perms, role, onToggle }) => {
    return (
        <div className="space-y-2 rounded border p-3">
            <h4 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">
                {category}
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {perms.map((p) => {
                    const checked = !!role?.permissions.includes(p.name);
                    return (
                        <label
                            key={p.name}
                            className="flex items-start gap-2 text-sm"
                        >
                            <input
                                type="checkbox"
                                disabled={role?.is_admin_star}
                                checked={checked}
                                onChange={() => onToggle && onToggle(p.name)}
                            />
                            <span>
                                <span className="font-medium">{p.label}</span>
                                <span className="block font-mono text-[11px] text-gray-500">
                                    {p.name}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

// Reemplazo completo del componente para soportar nuevas props y funciones
const RolesPermissionsPage: React.FC<PageProps> = (props) => {
    const [selectedRole, setSelectedRole] = useState<RolePayload | null>(
        props.roles[0] ?? null,
    );

    // --- Búsqueda y paginación ---
    const [search, setSearch] = useState(props.filters?.search || '');
    const [perPage, setPerPage] = useState<number>(
        props.filters?.per_page || 25,
    );
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(id);
    }, [search]);
    useEffect(() => {
        // Navegar cuando cambien filtros (debounced)
        router.get(
            '/admin/roles-permissions',
            { search: debouncedSearch, per_page: perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, [debouncedSearch, perPage]);

    // --- Permisos agrupados ---
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

    const togglePermission = (perm: string) => {
        if (!selectedRole) return;
        if (selectedRole.is_admin_star) return; // no toggle for admin
        const has = selectedRole.permissions.includes(perm);
        const updated = {
            ...selectedRole,
            permissions: has
                ? selectedRole.permissions.filter((p) => p !== perm)
                : [...selectedRole.permissions, perm],
        };
        setSelectedRole(updated);
    };

    const saveRole = () => {
        if (!selectedRole) return;
        router.post(
            `/admin/roles/${selectedRole.id}/permissions`,
            { permissions: selectedRole.permissions },
            { preserveScroll: true },
        );
    };

    // --- Usuarios y roles individuales ---
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
        ) {
            // intentar remover único admin: bloquear front
            return;
        }
        const has = data.roles.includes(role);
        setData(
            'roles',
            has ? data.roles.filter((r) => r !== role) : [...data.roles, role],
        );
    };

    const saveUserRoles = () => {
        if (!selectedUser) return;
        if (removingAdminWouldBreak) return; // front guard
        post(`/admin/users/${selectedUser.id}/roles`, { preserveScroll: true });
    };

    // --- Selección masiva ---
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
    const toggleSelectUser = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const [bulkRoles, setBulkRoles] = useState<string[]>([]);
    const [bulkMode, setBulkMode] = useState<'attach' | 'sync'>('attach');
    const bulkAppliesToAllAdmins = () => {
        // If sync mode and not including admin, and every current admin is in selection
        if (bulkMode !== 'sync' || bulkRoles.includes('admin')) return false;
        // We don't know full admin set on other pages; rely on server protection. Front partial detection only.
        return false;
    };
    const bulkDisabled = selectedIds.length === 0 || bulkRoles.length === 0;
    const submitBulk = () => {
        if (bulkDisabled) return;
        router.post(
            '/admin/users/bulk/roles',
            {
                user_ids: selectedIds,
                roles: bulkRoles,
                mode: bulkMode,
            },
            {
                preserveScroll: true,
                onSuccess() {
                    setBulkRoles([]);
                },
            },
        );
    };

    // --- Paginación UI helper ---
    const pagination = props.users;

    return (
        <div className="space-y-8 p-6">
            <Head title="Roles & Permisos" />
            <h1 className="text-2xl font-bold">
                Administración de Roles & Permisos
            </h1>

            {/* Wrapper <Can> removed: route already protected by permission middleware */}
            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600">
                        Buscar usuarios
                    </label>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="nombre, usuario o email"
                        className="rounded border px-2 py-1 text-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600">
                        Por página
                    </label>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(parseInt(e.target.value))}
                        className="rounded border px-2 py-1 text-sm"
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto text-xs text-gray-500">
                    Admins actuales: {props.admins_count}
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
                {/* Columna Roles */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Roles</h2>
                    <div className="flex flex-wrap gap-2">
                        {props.roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedRole(r)}
                                className={`rounded border px-3 py-1 text-sm ${selectedRole?.id === r.id ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                            >
                                {r.name}
                                {r.is_admin_star && ' *'}
                            </button>
                        ))}
                    </div>
                    {selectedRole && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-medium">
                                    Permisos del rol:{' '}
                                    <span className="font-semibold">
                                        {selectedRole.name}
                                    </span>
                                </h3>
                                <button
                                    disabled={selectedRole.is_admin_star}
                                    onClick={saveRole}
                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                            {selectedRole.is_admin_star && (
                                <p className="text-xs text-amber-600">
                                    Este rol hereda automáticamente todos los
                                    permisos. (Los checkboxes están
                                    deshabilitados)
                                </p>
                            )}
                            <div className="max-h-[520px] space-y-5 overflow-auto pr-2">
                                {permsByCategory.map(([cat, perms]) => (
                                    <div
                                        key={cat}
                                        className="space-y-2 rounded border p-3"
                                    >
                                        <h4 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">
                                            {cat}
                                        </h4>
                                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                            {perms.map((p) => {
                                                const checked =
                                                    selectedRole.permissions.includes(
                                                        p.name,
                                                    );
                                                return (
                                                    <label
                                                        key={p.name}
                                                        className="flex items-start gap-2 text-sm"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            disabled={
                                                                selectedRole.is_admin_star
                                                            }
                                                            checked={checked}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    p.name,
                                                                )
                                                            }
                                                        />
                                                        <span>
                                                            <span className="font-medium">
                                                                {p.label}
                                                            </span>
                                                            <span className="block font-mono text-[11px] text-gray-500">
                                                                {p.name}
                                                            </span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Usuarios */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Usuarios</h2>

                    {/* Acciones masivas */}
                    <div className="space-y-3 rounded border bg-gray-50 p-3">
                        <h3 className="text-sm font-medium">Acción masiva</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span>Modo:</span>
                                <label className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="bulk-mode"
                                        value="attach"
                                        checked={bulkMode === 'attach'}
                                        onChange={() => setBulkMode('attach')}
                                    />{' '}
                                    Adjuntar
                                </label>
                                <label className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="bulk-mode"
                                        value="sync"
                                        checked={bulkMode === 'sync'}
                                        onChange={() => setBulkMode('sync')}
                                    />{' '}
                                    Sincronizar
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(props.roleMap).map((roleName) => {
                                    const active = bulkRoles.includes(roleName);
                                    return (
                                        <button
                                            type="button"
                                            key={roleName}
                                            onClick={() =>
                                                setBulkRoles(
                                                    active
                                                        ? bulkRoles.filter(
                                                              (r) =>
                                                                  r !==
                                                                  roleName,
                                                          )
                                                        : [
                                                              ...bulkRoles,
                                                              roleName,
                                                          ],
                                                )
                                            }
                                            className={`rounded border px-2 py-1 text-xs ${active ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            {roleName}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={submitBulk}
                                disabled={bulkDisabled}
                                className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                            >
                                Aplicar a seleccionados ({selectedIds.length})
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            Adjuntar: agrega roles sin remover existentes.
                            Sincronizar: reemplaza roles por la lista elegida
                            (con protección admin).
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="w-6 p-2 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAllPage}
                                            checked={
                                                allIdsCurrentPage.every((id) =>
                                                    selectedIds.includes(id),
                                                ) &&
                                                allIdsCurrentPage.length > 0
                                            }
                                        />
                                    </th>
                                    <th className="p-2 text-left">ID</th>
                                    <th className="p-2 text-left">Nombre</th>
                                    <th className="p-2 text-left">Usuario</th>
                                    <th className="p-2 text-left">Roles</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.users.data.map((u) => {
                                    const rowSelected = selectedIds.includes(
                                        u.id,
                                    );
                                    return (
                                        <tr
                                            key={u.id}
                                            className={
                                                selectedUser?.id === u.id
                                                    ? 'bg-blue-50'
                                                    : rowSelected
                                                      ? 'bg-blue-100/40'
                                                      : ''
                                            }
                                        >
                                            <td className="p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={rowSelected}
                                                    onChange={() =>
                                                        toggleSelectUser(u.id)
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">{u.id}</td>
                                            <td className="p-2">{u.name}</td>
                                            <td className="p-2">
                                                {u.username}
                                            </td>
                                            <td className="p-2">
                                                {u.roles.join(', ')}
                                            </td>
                                            <td className="p-2 text-right">
                                                <button
                                                    onClick={() =>
                                                        setSelectedUser(u)
                                                    }
                                                    className="text-xs text-blue-600 hover:underline"
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

                    {/* Paginación */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span>
                            Página {pagination.current_page} de{' '}
                            {pagination.last_page} (Total {pagination.total})
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
                                        className={`rounded border px-2 py-1 ${l.active ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        {l.label
                                            .replace('&laquo;', '«')
                                            .replace('&raquo;', '»')}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="space-y-3 rounded border p-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-medium">
                                    Roles del usuario:{' '}
                                    <span className="font-semibold">
                                        {selectedUser.username}
                                    </span>
                                </h3>
                                <button
                                    onClick={saveUserRoles}
                                    disabled={removingAdminWouldBreak}
                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                            {removingAdminWouldBreak && (
                                <p className="text-xs text-amber-600">
                                    No puedes remover el rol admin: sería el
                                    último administrador.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(props.roleMap).map((roleName) => {
                                    const checked =
                                        data.roles.includes(roleName);
                                    const disabled =
                                        roleName === 'admin' &&
                                        selectedUserIsSoleAdmin &&
                                        checked;
                                    return (
                                        <label
                                            key={roleName}
                                            className={`flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-sm select-none ${disabled ? 'opacity-60' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={() =>
                                                    toggleUserRole(roleName)
                                                }
                                            />
                                            <span>
                                                {roleName}
                                                {roleName === 'admin' && ' *'}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RolesPermissionsPage;
