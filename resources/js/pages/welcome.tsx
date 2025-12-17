import FaqPreview from '@/components/landing/faq-preview';
import FeaturedMembers from '@/components/landing/featured-members';
import Hero from '@/components/landing/hero';
import JoinParticipate from '@/components/landing/join-participate';
import MissionVisionGoals from '@/components/landing/mission-vision-goals';
import NewsletterSubscribe from '@/components/landing/newsletter-subscribe';
import QuickStats from '@/components/landing/quick-stats';
import UpcomingEvents from '@/components/landing/upcoming-events';
import { type CommunityMetrics } from '@/hooks/use-community-metrics';
import PublicLayout from '@/layouts/public/public-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface WelcomePageProps extends SharedData {
    metrics?: CommunityMetrics;
    upcomingEvents?: any[];
    featuredMembers?: any[];
}

export default function Welcome() {
    const { auth, metrics, upcomingEvents, featuredMembers } =
        usePage<WelcomePageProps>().props;

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
            <MissionVisionGoals />
            <JoinParticipate />
            <FeaturedMembers members={(featuredMembers as any[]) || []} />
            <UpcomingEvents initial={(upcomingEvents as any[]) || []} />
            <FaqPreview />
            <NewsletterSubscribe />
        </PublicLayout>
    );
}
