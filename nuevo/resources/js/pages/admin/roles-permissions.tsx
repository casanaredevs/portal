import { Can, usePermissions } from '@/lib/permissions';
import type { PermissionString } from '@/lib/permissions.generated';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

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
    users: UserPayload[];
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

const RolesPermissionsPage: React.FC<PageProps> = (props) => {
    const { can } = usePermissions();
    const [selectedRole, setSelectedRole] = useState<RolePayload | null>(
        props.roles[0] ?? null,
    );
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
            route('admin.roles-permissions.roles.sync', {
                role: selectedRole.id,
            }),
            { permissions: selectedRole.permissions },
            { preserveScroll: true },
        );
    };

    const { data, setData, post } = useForm<{ roles: string[] }>({ roles: [] });
    const [selectedUser, setSelectedUser] = useState<UserPayload | null>(
        props.users[0] ?? null,
    );

    React.useEffect(() => {
        if (selectedUser) setData('roles', selectedUser.roles);
    }, [selectedUser]);

    const toggleUserRole = (role: string) => {
        if (!selectedUser) return;
        const has = data.roles.includes(role);
        setData(
            'roles',
            has ? data.roles.filter((r) => r !== role) : [...data.roles, role],
        );
    };

    const saveUserRoles = () => {
        if (!selectedUser) return;
        post(
            route('admin.roles-permissions.users.sync', {
                user: selectedUser.id,
            }),
            { preserveScroll: true },
        );
    };

    return (
        <div className="space-y-8 p-6">
            <Head title="Roles & Permisos" />
            <h1 className="text-2xl font-bold">
                Administración de Roles & Permisos
            </h1>

            <Can permission="users.manage">
                <div className="grid gap-8 lg:grid-cols-2">
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
                                        Este rol recibe todos los permisos
                                        automáticamente.
                                    </p>
                                )}
                                <div className="max-h-[520px] space-y-5 overflow-auto pr-2">
                                    {permsByCategory.map(([cat, perms]) => (
                                        <CategoryBlock
                                            key={cat}
                                            category={cat}
                                            perms={perms}
                                            role={selectedRole}
                                            onToggle={togglePermission}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Usuarios (top 25)
                        </h2>
                        <div className="overflow-x-auto rounded border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">
                                            Nombre
                                        </th>
                                        <th className="p-2 text-left">
                                            Usuario
                                        </th>
                                        <th className="p-2 text-left">Roles</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.users.map((u) => (
                                        <tr
                                            key={u.id}
                                            className={
                                                selectedUser?.id === u.id
                                                    ? 'bg-blue-50'
                                                    : ''
                                            }
                                        >
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {selectedUser && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-medium">
                                        Roles del usuario:{' '}
                                        <span className="font-semibold">
                                            {selectedUser.username}
                                        </span>
                                    </h3>
                                    <button
                                        onClick={saveUserRoles}
                                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                                    >
                                        Guardar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {Object.keys(props.roleMap).map(
                                        (roleName) => {
                                            const checked =
                                                data.roles.includes(roleName);
                                            return (
                                                <label
                                                    key={roleName}
                                                    className="flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-sm select-none"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            toggleUserRole(
                                                                roleName,
                                                            )
                                                        }
                                                    />
                                                    <span>{roleName}</span>
                                                </label>
                                            );
                                        },
                                    )}
                                </div>
                                {selectedUser.roles.includes('admin') &&
                                    !data.roles.includes('admin') && (
                                        <p className="text-xs text-amber-600">
                                            Advertencia: Intentas remover el rol
                                            admin; se validará que no sea el
                                            último administrador.
                                        </p>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </Can>
        </div>
    );
};

export default RolesPermissionsPage;
