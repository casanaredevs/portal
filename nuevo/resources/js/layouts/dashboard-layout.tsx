import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

// DashboardLayout: layout reservado para el espacio autenticado.
// Usa el sidebar para navegación interna (dashboard, skills, external-profiles, settings, admin, etc.)
export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
