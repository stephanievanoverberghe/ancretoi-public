'use client';

import { publicRoutes, routeBuilders } from '@/config/routes';
import { programmesContent } from '@/content/programmes';
import { track } from '@/lib/analytics.client';

import { ProgrammeTeaserCard } from './ProgrammeTeaserCard';

export type ProgramCardProgram = {
    slug: string;
    title: string;
    duration_days: number;
    status?: 'draft' | 'preflight' | 'published' | string;
    cover?: string | null;
    price?: { amount_cents: number | null; currency?: string } | null;
    level?: 'Basique' | 'Cible' | 'Premium' | (string & {});
};

type Props = { program: ProgramCardProgram; position?: number };

function formatPrice(program: ProgramCardProgram) {
    const amount = program.price?.amount_cents;
    if (amount == null) return null;

    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: (program.price?.currency ?? 'EUR').toUpperCase(),
        maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
    }).format(amount / 100);
}

export default function ProgramCard({ program, position = 0 }: Props) {
    const isPublished = program.status === 'published';
    const priceLabel = formatPrice(program);

    return (
        <article className="h-full">
            <ProgrammeTeaserCard
                program={{
                    slug: program.slug,
                    title: program.title,
                    statusLabel: isPublished ? programmesContent.card.publishedLabel : programmesContent.card.draftLabel,
                    href: isPublished ? routeBuilders.programme(program.slug) : publicRoutes.programmes,
                    coverSrc: program.cover || programmesContent.card.defaultImage,
                    durationLabel: `${program.duration_days} jours`,
                    description: programmesContent.card.fallbackSummary,
                    ctaLabel: isPublished ? programmesContent.card.publishedCta : programmesContent.card.draftCta,
                    isPublished,
                    levelLabel: program.level,
                    priceLabel,
                }}
                onClick={() => {
                    if (isPublished) track('program_card_click', { slug: program.slug, position });
                }}
            />
        </article>
    );
}
