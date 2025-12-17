// Frontend permission & role helpers
// Fuente de verdad dinámica: PERMISSIONS se genera desde la enum PHP con: php artisan permissions:export

import { usePage } from '@inertiajs/react';
// Importación generada (asegúrate de ejecutar el comando antes de compilar)
import { PermissionString } from './permissions.generated';

// Ajustar tipos extendidos opcionales si se quieren permisos ad-hoc temporalmente
export type PermissionLike = PermissionString | (string & {});

export interface AuthContextShare {
    user: null | {
        id: number;
        name: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
    };
    roles?: string[];
    permissions?: string[];
}

interface PagePropsWithAuth {
    auth?: AuthContextShare;
    [key: string]: any; // fallback
}

function getAuth(): AuthContextShare {
    const page: { props: PagePropsWithAuth } = usePage() as any;
    return page.props.auth || { user: null, roles: [], permissions: [] };
}

export function hasRole(role: string): boolean {
    const { roles } = getAuth();
    return !!roles?.includes(role);
}

export function hasAnyRole(rolesToCheck: string[]): boolean {
    const { roles } = getAuth();
    if (!roles?.length) return false;
    return rolesToCheck.some((r) => roles.includes(r));
}

export function can(permission: PermissionLike): boolean {
    const { permissions } = getAuth();
    if (!permissions) return false;
    return permissions.includes(permission as string);
}

export function anyPermission(perms: PermissionLike[]): boolean {
    const { permissions } = getAuth();
    if (!permissions?.length) return false;
    return perms.some((p) => permissions.includes(p as string));
}

export function allPermissions(perms: PermissionLike[]): boolean {
    const { permissions } = getAuth();
    if (!permissions?.length) return false;
    return perms.every((p) => permissions.includes(p as string));
}

export function usePermissions() {
    const auth = getAuth();
    return {
        user: auth.user,
        roles: auth.roles || [],
        permissions: auth.permissions || [],
        hasRole,
        hasAnyRole,
        can,
        anyPermission,
        allPermissions,
    };
}

// Componente auxiliar para mostrar condicionalmente contenido
import React from 'react';
export interface CanProps {
    permission?: PermissionLike;
    any?: PermissionLike[]; // pasa si el usuario tiene al menos uno
    all?: PermissionLike[]; // pasa si el usuario tiene todos
    role?: string; // alternativa simple
    not?: boolean; // invierte el resultado
    children: React.ReactNode | ((passed: boolean) => React.ReactNode);
    fallback?: React.ReactNode;
}

export function Can(props: CanProps) {
    const {
        permission,
        any,
        all,
        role,
        not = false,
        children,
        fallback,
    } = props;
    let passed = true;

    if (permission) passed = passed && can(permission);
    if (role) passed = passed && hasRole(role);
    if (any) passed = passed && anyPermission(any);
    if (all) passed = passed && allPermissions(all);

    if (not) passed = !passed;

    if (typeof children === 'function') {
        return (children as (ok: boolean) => React.ReactNode)(passed) as any;
    }
    if (passed) return children as any;
    return (fallback ?? null) as any;
}

// Opción: adjuntar a window para depurar (solo en dev)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    (window as any).$authCan = can;
    (window as any).$authHasRole = hasRole;
}
