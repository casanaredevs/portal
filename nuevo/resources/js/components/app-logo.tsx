import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    type Phase = 'logo' | 'icon-file' | 'icon-component' | 'text';
    const [phase, setPhase] = useState<Phase>('logo');

    const brandName = 'Casanare Devs';

    if (phase === 'logo') {
        return (
            <div className="flex items-center">
                <img
                    src="/logo.svg"
                    alt={brandName}
                    className="h-8 w-auto max-w-full object-contain"
                    onError={() => setPhase('icon-file')}
                />
                <span className="sr-only">{brandName}</span>
            </div>
        );
    }

    if (phase === 'icon-file') {
        return (
            <div className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <img
                        src="/icon.svg"
                        alt="" /* decorative, brand name is visible text */
                        className="size-7 object-contain"
                        onError={() =>
                            setPhase(
                                typeof AppLogoIcon === 'function'
                                    ? 'icon-component'
                                    : 'text',
                            )
                        }
                    />
                </div>
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {brandName}
                    </span>
                </div>
            </div>
        );
    }

    if (phase === 'icon-component' && typeof AppLogoIcon === 'function') {
        return (
            <div className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {brandName}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <span className="text-sm leading-tight font-semibold">{brandName}</span>
    );
}
