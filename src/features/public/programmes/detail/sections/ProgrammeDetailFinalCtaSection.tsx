import { ArrowRight, LifeBuoy, LockKeyhole, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { CtaBand } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { legalRoutes, publicRoutes } from '@/config/routes';
import { programmesContent } from '@/content/programmes';
import { CheckoutButton } from '@/features/paiement/components';
import type { Program } from '@/types/programmes.types';

type ProgrammeDetailFinalCtaSectionProps = {
    program: Program;
};

export function ProgrammeDetailFinalCtaSection({ program }: ProgrammeDetailFinalCtaSectionProps) {
    const isAvailable = program.price?.amount_cents != null;
    const isFree = program.price?.amount_cents === 0;
    const finalCta = program.detail.final_cta;

    return (
        <CtaBand
            eyebrow={finalCta.eyebrow}
            title={finalCta.title}
            description={finalCta.description}
            primaryActionSlot={
                isAvailable ? (
                    <CheckoutButton
                        slug={program.slug}
                        isFree={isFree}
                        size="lg"
                        label={isFree ? finalCta.free_label : finalCta.purchase_label}
                        className="w-full rounded-xl px-6 sm:w-fit"
                    />
                ) : (
                    <LinkButton href={publicRoutes.contact} size="lg" className="w-full sm:w-fit">
                        {finalCta.unavailable_label}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </LinkButton>
                )
            }
            secondaryAction={{
                label: finalCta.secondary_label,
                href: publicRoutes.programmes,
                variant: 'tertiary',
                icon: <ArrowRight className="h-4 w-4" aria-hidden="true" />,
            }}
            asideTitle={finalCta.aside_title}
            asideItems={finalCta.aside_items}
            footnote={
                isAvailable ? (
                    <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="inline-flex items-center gap-2">
                            <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
                            {programmesContent.detailReassurance.payment}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                            {programmesContent.detailReassurance.access}
                        </span>
                        <Link href={legalRoutes.retractation} className="inline-flex items-center gap-2 underline underline-offset-2 transition hover:text-foreground">
                            <LifeBuoy className="h-4 w-4 text-primary" aria-hidden="true" />
                            {programmesContent.detailReassurance.withdrawal}
                        </Link>
                    </span>
                ) : undefined
            }
        />
    );
}
