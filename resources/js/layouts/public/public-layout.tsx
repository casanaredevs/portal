import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { publicNavItems, type PublicNavItem } from '@/config/public-nav';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
}

// Determina si un item está activo basándose en la ruta y hash actual.
function isItemActive(
    item: PublicNavItem,
    currentPath: string,
    currentHash: string,
) {
    if (item.href === '/' && currentPath === '/') return true;
    if (
        item.href.startsWith('#') &&
        currentPath === '/' &&
        currentHash === item.href
    )
        return true;
    return false;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuth = Boolean(auth?.user);
    const [menuOpen, setMenuOpen] = useState(false);
    const page = usePage();
    const [hash, setHash] = useState<string>(
        typeof window !== 'undefined' ? window.location.hash : '',
    );

    useEffect(() => {
        const handler = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    // Hacer scroll suave al ancla cuando estemos en home y exista hash
    useEffect(() => {
        if (page.url === '/' && hash.startsWith('#')) {
            const el = document.getElementById(hash.substring(1));
            if (el) {
                // Usar requestAnimationFrame para asegurar que el layout se haya pintado
                requestAnimationFrame(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        }
    }, [page.url, hash]);

    return (
        <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-white dark:focus:bg-neutral-100 dark:focus:text-neutral-900"
            >
                Saltar al contenido
            </a>
            <header className="border-b border-neutral-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-900/60">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-semibold"
                    >
                        <AppLogo />
                    </Link>
                    <nav
                        aria-label="Principal"
                        className="hidden gap-1 lg:flex"
                    >
                        {publicNavItems.map((item) => {
                            const active = isItemActive(item, page.url, hash);
                            const resolvedHref = item.href.startsWith('#')
                                ? page.url === '/'
                                    ? item.href
                                    : `/${item.href}`
                                : item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={resolvedHref}
                                    aria-current={active ? 'page' : undefined}
                                    className={
                                        `group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition outline-none ` +
                                        (active
                                            ? 'text-neutral-900 dark:text-neutral-50'
                                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100') +
                                        ' focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-fuchsia-500 dark:focus-visible:ring-offset-neutral-900'
                                    }
                                >
                                    {item.label}
                                    {item.upcoming && (
                                        <Badge
                                            size="sm"
                                            variant="neutral"
                                            className="ml-1 font-medium tracking-wide"
                                        >
                                            pronto
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-2">
                        {isAuth ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border border-transparent px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            className="ml-2 inline-flex items-center justify-center rounded md:hidden"
                            aria-label="Abrir menú"
                            aria-expanded={menuOpen}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-6 w-6 stroke-neutral-700 dark:stroke-neutral-300"
                                fill="none"
                                strokeWidth={2}
                            >
                                {menuOpen ? (
                                    <path
                                        d="M6 18L18 6M6 6l12 12"
                                        strokeLinecap="round"
                                    />
                                ) : (
                                    <path
                                        d="M3 6h18M3 12h18M3 18h18"
                                        strokeLinecap="round"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Mobile menu */}
                {menuOpen && (
                    <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden dark:border-neutral-800 dark:bg-neutral-900">
                        <nav
                            className="flex flex-col gap-1"
                            aria-label="Menú móvil"
                        >
                            {publicNavItems.map((item) => {
                                const active = isItemActive(
                                    item,
                                    page.url,
                                    hash,
                                );
                                const resolvedHref = item.href.startsWith('#')
                                    ? page.url === '/'
                                        ? item.href
                                        : `/${item.href}`
                                    : item.href;
                                return (
                                    <Link
                                        key={item.label}
                                        href={resolvedHref}
                                        onClick={() => setMenuOpen(false)}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={
                                            `flex items-center gap-2 rounded px-3 py-2 text-sm transition outline-none ` +
                                            (active
                                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                                                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800') +
                                            ' focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-fuchsia-500 dark:focus-visible:ring-offset-neutral-900'
                                        }
                                    >
                                        {item.label}
                                        {item.upcoming && (
                                            <Badge
                                                size="sm"
                                                variant="neutral"
                                                className="font-medium tracking-wide"
                                            >
                                                pronto
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>
            <main id="main" className="flex-1">
                {children}
            </main>
            <footer className="mt-24 border-t border-neutral-200 px-6 py-10 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} Casanare Devs.</p>
                    <p className="text-xs">
                        Construyendo ecosistema tecnológico regional.
                    </p>
                </div>
            </footer>
        </div>
    );
}
