import Hero from '@/components/landing/hero';
import QuickStats from '@/components/landing/quick-stats';
import PublicLayout from '@/layouts/public/public-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const isAuthenticated = Boolean(auth?.user);

    return (
        <PublicLayout>
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
            <Hero
                isAuthenticated={isAuthenticated}
                userName={auth?.user?.name}
            />
            <QuickStats />
        </PublicLayout>
    );
}
