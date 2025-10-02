import DashboardLayout from '@/layouts/dashboard-layout';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
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
