import Hero from '@/components/landing/hero';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const isAuthenticated = Boolean(auth?.user);

    return (
        <>
            <Head title="Inicio | Casanare Devs">
                <meta
                    name="description"
                    content="Comunidad de desarrolladores de software en Casanare: miembros, eventos, proyectos y aprendizaje colaborativo."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <header className="w-full px-6 py-4">
                    <nav className="mx-auto flex w-full max-w-7xl items-center justify-end gap-4 text-sm">
                        {isAuthenticated ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <main className="flex-1">
                    <Hero
                        isAuthenticated={isAuthenticated}
                        userName={auth?.user?.name}
                    />
                </main>
                <footer className="mt-24 border-t border-neutral-200 px-6 py-10 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p>&copy; {new Date().getFullYear()} Casanare Devs.</p>
                        <p className="text-[11px]">
                            Construyendo ecosistema tecnológico regional.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
