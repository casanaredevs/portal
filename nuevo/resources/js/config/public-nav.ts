export interface PublicNavItem {
    label: string;
    href: string; // Puede ser ruta absoluta o hash interno (#seccion)
    external?: boolean; // Para enlaces externos futuros
    upcoming?: boolean; // Marca de funcionalidad futura
}

// Lista centralizada de navegación pública (Home + futuras páginas)
export const publicNavItems: PublicNavItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Miembros', href: '/members' },
    { label: 'Eventos', href: '/events' },
    { label: 'Proyectos', href: '#proyectos', upcoming: true },
    { label: 'Participar', href: '#participar' },
    { label: 'Sobre', href: '/about' },
    { label: 'FAQ', href: '#faq', upcoming: true },
    { label: 'Contacto', href: '#contacto', upcoming: true },
];
