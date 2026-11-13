'use client';

import { useEffect, useState } from 'react';

import { CheckoutButton } from '@/features/paiement/components';
import { cn } from '@/lib/cn';

type ProgrammeDetailStickyBarProps = {
    title: string;
    priceLabel: string | null;
    slug: string;
    isFree: boolean;
    checkoutLabel?: string;
};

const SCROLL_THRESHOLD = 560;

/**
 * Barre d'achat qui apparaît en bas d'écran une fois le hero dépassé.
 * Le scroll du site vit sur document.body (layout flex plein écran).
 */
export function ProgrammeDetailStickyBar({ title, priceLabel, slug, isFree, checkoutLabel }: ProgrammeDetailStickyBarProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            setVisible(scrollTop > SCROLL_THRESHOLD);
        };

        onScroll();
        document.body.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            document.body.removeEventListener('scroll', onScroll);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <div
            className={cn(
                'fixed inset-x-0 bottom-0 z-[var(--z-header)] border-t border-border bg-background/92 shadow-elevated backdrop-blur transition-all duration-300',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
            )}
            aria-hidden={!visible}
        >
            <div className="mx-auto flex max-w-[var(--container-wide)] items-center justify-between gap-4 px-[var(--gutter-page)] py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                    {priceLabel ? (
                        <p className="truncate text-sm text-muted-foreground">
                            {priceLabel}
                            <span className="hidden sm:inline"> · accès personnel</span>
                        </p>
                    ) : null}
                </div>
                <CheckoutButton slug={slug} isFree={isFree} size="md" label={checkoutLabel} className="shrink-0 rounded-xl px-5" />
            </div>
        </div>
    );
}
