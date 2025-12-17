import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { breadcrumbMap } from '@/lib/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

function generateBreadcrumbs(path: string, pageProps: any): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [];
    let currentPath = path.split('?')[0];
    let definition = breadcrumbMap[currentPath];

    while (definition) {
        const title =
            typeof definition.title === 'function'
                ? definition.title(pageProps)
                : definition.title;
        crumbs.unshift({ title, href: definition.href || currentPath });

        if (definition.parent) {
            currentPath = definition.parent;
            definition = breadcrumbMap[currentPath];
        } else {
            break;
        }
    }
    return crumbs;
}

export default function AppSidebarLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const breadcrumbs = generateBreadcrumbs(page.url, page.props);
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
