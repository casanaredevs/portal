import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// DashboardLayout: layout reservado para el espacio autenticado.
// Usa el sidebar para navegación interna (dashboard, skills, external-profiles, settings, admin, etc.)
export default function DashboardLayout({
    children,
    breadcrumbs,
}: DashboardLayoutProps) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </AppSidebarLayout>
    );
}
