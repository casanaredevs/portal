import Hero from '@/components/landing/hero';
import QuickStats from '@/components/landing/quick-stats';
import { type CommunityMetrics } from '@/hooks/use-community-metrics';
import PublicLayout from '@/layouts/public/public-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface WelcomePageProps extends SharedData {
    metrics?: CommunityMetrics;
}

export default function Welcome() {
    const { auth, metrics } = usePage<WelcomePageProps>().props;

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
            <QuickStats initial={metrics as any} />
        </PublicLayout>
    );
}
