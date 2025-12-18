import DashboardLayout from '@/layouts/dashboard-layout';
import { type ReactNode } from 'react';
import { type BreadcrumbItem } from '@/types';

interface AdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[]; // aceptado para compatibilidad
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <DashboardLayout>
            <div className="bg-yellow-400 p-2 text-center text-sm text-black">
                Estás en modo Administrador
            </div>
            {children}
        </DashboardLayout>
    );
}
