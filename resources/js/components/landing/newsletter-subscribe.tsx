import { useForm, usePage } from '@inertiajs/react';
import React from 'react';

interface FormData {
    email: string;
    consent: boolean;
}

interface FlashNewsletter {
    status?: string | null;
    message?: string | null;
}
interface PageProps {
    flash?: { newsletter?: FlashNewsletter };
}

export const NewsletterSubscribe: React.FC = () => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<FormData>({
            email: '',
            consent: false,
        });
    const page = usePage<PageProps>();
    const flash = page.props.flash?.newsletter;
    const [message, setMessage] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (flash) {
            setMessage(flash.message ?? null);
            setStatus(flash.status ?? null);
            if (flash.status === 'pending') {
                setData('email', '');
            }
        }
    }, [flash, setData]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/newsletter-subscriptions', { preserveScroll: true });
    }

    return (
        <section
            id="newsletter"
            aria-labelledby="newsletter-heading"
            className="relative mx-auto mt-24 max-w-3xl rounded-xl border border-neutral-200 bg-white px-6 py-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
            <div className="absolute -top-5 left-6 rounded-full bg-fuchsia-600 px-3 py-1 text-[10px] font-semibold tracking-wide text-white uppercase dark:bg-fuchsia-500">
                Beta
            </div>
            <div className="space-y-4">
                <h2
                    id="newsletter-heading"
                    className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                    Newsletter & Notificaciones
                </h2>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Recibe avisos tempranos sobre eventos, convocatorias y
                    actualizaciones de la comunidad. Próximamente activaremos
                    confirmación (double opt‑in) para mejor entregabilidad.
                </p>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="newsletter-email" className="sr-only">
                            Correo electrónico
                        </label>
                        <input
                            id="newsletter-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => {
                                setData('email', e.target.value);
                                if (errors.email) clearErrors('email');
                            }}
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-fuchsia-400 dark:focus:ring-fuchsia-500"
                            placeholder="tu@correo.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={processing || !data.consent}
                        className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium whitespace-nowrap text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                        {processing
                            ? 'Enviando…'
                            : status === 'confirmed'
                              ? 'Confirmado'
                              : 'Suscribirme'}
                    </button>
                </div>
                <div className="flex items-start gap-2">
                    <input
                        id="newsletter-consent"
                        type="checkbox"
                        checked={data.consent}
                        onChange={(e) => setData('consent', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-fuchsia-600 focus:ring-fuchsia-500 dark:border-neutral-600 dark:bg-neutral-800"
                    />
                    <label
                        htmlFor="newsletter-consent"
                        className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300"
                    >
                        Acepto recibir correos y notificaciones relacionadas con
                        eventos y la comunidad. Puedo cancelar en cualquier
                        momento.
                    </label>
                </div>
                {errors.consent && (
                    <p className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">
                        {errors.consent}
                    </p>
                )}
                {message && (
                    <div
                        className={
                            'rounded-md border px-3 py-2 text-xs font-medium ' +
                            (status === 'error'
                                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200'
                                : status === 'confirmed'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                                  : 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/40 dark:bg-fuchsia-900/30 dark:text-fuchsia-200')
                        }
                    >
                        {message}
                    </div>
                )}
            </form>
            <p className="mt-4 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Protegemos tu correo. Cuando activemos el double opt‑in deberás
                confirmar para completar la suscripción.
            </p>
        </section>
    );
};

export default NewsletterSubscribe;
