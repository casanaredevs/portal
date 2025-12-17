import { adminRoutes } from '@/lib/admin-routes';
import { dashboard } from '@/routes';

export type BreadcrumbResolver = (page: any) => string;

export interface BreadcrumbDefinition {
    title: string | BreadcrumbResolver;
    parent?: string;
    href?: string;
}

export const breadcrumbMap: Record<string, BreadcrumbDefinition> = {
    // Dashboard
    '/dashboard': { title: 'Dashboard' },

    // Admin
    [adminRoutes.index()]: { title: 'Administración', parent: '/dashboard' },
    [adminRoutes.events()]: { title: 'Eventos', parent: adminRoutes.index() },
    [adminRoutes.rolesPermissions()]: {
        title: 'Roles y Permisos',
        parent: adminRoutes.index(),
    },

    // Settings
    '/settings/profile': { title: 'Perfil', parent: '/dashboard' },
    '/settings/password': { title: 'Contraseña', parent: '/dashboard' },
    '/settings/appearance': { title: 'Apariencia', parent: '/dashboard' },
    '/settings/two-factor-authentication': {
        title: 'Autenticación de Dos Factores',
        parent: '/dashboard',
    },

    // User specific
    '/skills': { title: 'Mis Skills', parent: '/dashboard' },
    '/external-profiles': {
        title: 'Perfiles Externos',
        parent: '/dashboard',
    },
};

