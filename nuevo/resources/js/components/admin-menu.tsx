import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { adminRoutes } from '@/lib/admin-routes';
import { usePermissions } from '@/lib/permissions';
import { KeyRound, Shield } from 'lucide-react';
import React from 'react';

interface AdminLink {
    title: string;
    href: string;
    perm?: string; // single required perm
    anyPerms?: string[]; // mostrar si tiene cualquiera
    icon?: any;
}

const ADMIN_LINKS: AdminLink[] = [
    {
        title: 'Roles y Permisos',
        href: adminRoutes.rolesPermissions(),
        perm: 'users.manage',
        icon: KeyRound,
    },
    {
        title: 'Eventos',
        href: adminRoutes.events(),
        anyPerms: [
            'events.create',
            'events.edit',
            'events.delete',
            'events.publish',
        ],
        icon: Shield,
    },
];

export interface AdminMenuProps {
    variant?: 'icon-dropdown' | 'list';
    className?: string;
    heading?: string; // only for list variant
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
    variant = 'icon-dropdown',
    className,
    heading = 'Administración',
}) => {
    const { can } = usePermissions();
    const items = ADMIN_LINKS.filter((l) => {
        if (l.perm) return can(l.perm);
        if (l.anyPerms) return l.anyPerms.some((p) => can(p));
        return false;
    });
    if (items.length === 0) return null;

    if (variant === 'list') {
        return (
            <div className={className}>
                <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                    {heading}
                </div>
                <div className="flex flex-col space-y-3">
                    {items.map((item) => (
                        <a
                            key={item.title}
                            href={item.href}
                            className="flex items-center space-x-2 font-medium"
                        >
                            {item.icon && (
                                <Icon
                                    iconNode={item.icon}
                                    className="h-5 w-5"
                                />
                            )}
                            <span>{item.title}</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    // icon-dropdown variant
    return (
        <TooltipProvider delayDuration={0}>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`group ml-1 h-9 w-9 cursor-pointer ${className || ''}`.trim()}
                            >
                                <Shield className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{heading}</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                        {heading}
                    </div>
                    {items.map((item) => (
                        <a
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            {item.icon && (
                                <Icon
                                    iconNode={item.icon}
                                    className="h-4 w-4"
                                />
                            )}
                            <span>{item.title}</span>
                        </a>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    );
};
