'use client';

import { Cookie as CookieIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui';
import { espaceRoutePrefix, legalRoutes } from '@/config/routes';
import {
    DEFAULT_CONSENT,
    readConsentCookieClient,
    writeConsentCookieClient,
    type Consent,
} from '@/lib/consent';
import { cn } from '@/lib/cn';

type Props = { days?: number };

export default function CookieBanner({ days = 365 }: Props) {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const analyticsAvailable = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());

    useEffect(() => {
        setVisible(!readConsentCookieClient());
    }, []);

    if (!visible) return null;

    function acceptAll() {
        const consent: Consent = {
            necessary: true,
            preferences: false,
            analytics: analyticsAvailable,
            marketing: false,
        };
        writeConsentCookieClient(consent, days);
        setVisible(false);
    }

    function rejectAll() {
        writeConsentCookieClient(DEFAULT_CONSENT, days);
        setVisible(false);
    }

    const isLearnerRoute = pathname.startsWith(espaceRoutePrefix);

    return (
        <aside
            role="region"
            aria-label="Préférences de confidentialité"
            aria-live="polite"
            className={cn(
                'pointer-events-none fixed inset-x-0 z-[60] p-3 sm:p-4',
                isLearnerRoute
                    ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-0'
                    : 'bottom-[env(safe-area-inset-bottom)]',
            )}
        >
            <div className="pointer-events-auto mx-auto max-w-3xl rounded-[1.35rem] border border-border/90 bg-surface/96 p-3 shadow-elevated backdrop-blur-xl sm:p-4">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <CookieIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">Ton choix, simplement</h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            Les cookies nécessaires font fonctionner le site. L’analyse reste désactivée sans ton accord.{' '}
                            <Link
                                href={legalRoutes.confidentialite}
                                className="rounded-sm font-medium text-foreground underline decoration-border underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                En savoir plus
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
                    <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        className="w-full rounded-full border-primary/35 px-2 text-xs text-primary"
                        onClick={acceptAll}
                        aria-label="Accepter les cookies optionnels"
                    >
                        Accepter
                    </Button>
                    <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        className="w-full rounded-full px-2 text-xs"
                        onClick={rejectAll}
                        aria-label="Refuser les cookies optionnels"
                    >
                        Refuser
                    </Button>
                    <Link
                        href={legalRoutes.cookiePreferences}
                        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-border bg-surface px-2 text-xs font-medium text-foreground shadow-soft transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={() => setVisible(false)}
                    >
                        Personnaliser
                    </Link>
                </div>
            </div>
        </aside>
    );
}
