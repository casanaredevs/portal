export interface PublicNavItem {
    label: string;
    href: string; // Puede ser ruta absoluta o hash interno (#seccion)
    external?: boolean; // Para enlaces externos futuros
    upcoming?: boolean; // Marca de funcionalidad futura
}

// Lista centralizada de navegación pública (Home + futuras páginas)
export const publicNavItems: PublicNavItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Miembros', href: '#miembros', upcoming: true },
    { label: 'Eventos', href: '#eventos', upcoming: true },
    { label: 'Proyectos', href: '#proyectos', upcoming: true },
    { label: 'Sobre', href: '#sobre', upcoming: true },
    { label: 'FAQ', href: '#faq', upcoming: true },
    { label: 'Contacto', href: '#contacto', upcoming: true },
];
