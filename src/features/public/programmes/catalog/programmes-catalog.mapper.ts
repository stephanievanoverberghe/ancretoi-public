import { publicRoutes, routeBuilders } from '@/config/routes';
import { programmesContent } from '@/content/programmes';
import type { ProgrammesCatalogProgram, ProgrammesCatalogSource } from './programmes-catalog.types';

function formatPrice(program: { price?: { amount_cents: number | null; currency?: string } }) {
    const amount = program.price?.amount_cents;
    if (amount == null) return null;

    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: (program.price?.currency ?? 'EUR').toUpperCase(),
        maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
    }).format(amount / 100);
}

function normalizeStatus(status: string) {
    return status === 'published' ? 'published' : 'draft';
}

export function mapProgrammesCatalogPrograms({ programs, comparisonRows }: ProgrammesCatalogSource): ProgrammesCatalogProgram[] {
    const comparisonBySlug = new Map(comparisonRows.map((row) => [row.slug, row]));

    return programs.map((program) => {
        const comparison = comparisonBySlug.get(program.slug);
        const status = normalizeStatus(program.status);
        const isPublished = status === 'published';
        const title = comparison?.title || program.title;
        const durationLabel = comparison?.duree || `${program.duration_days} jours`;
        const objective = comparison?.objectif || programmesContent.card.fallbackSummary;
        const idealFor = comparison?.ideal_si || programmesContent.card.fallbackIdeal;

        return {
            ...program,
            title,
            isPublished,
            href: isPublished ? routeBuilders.programme(program.slug) : publicRoutes.programmes,
            durationLabel,
            statusLabel: isPublished ? programmesContent.card.publishedLabel : programmesContent.card.draftLabel,
            ctaLabel: isPublished ? programmesContent.card.publishedCta : programmesContent.card.draftCta,
            priceLabel: formatPrice(program),
            summary: objective,
            idealFor,
            coverSrc: program.cover || programmesContent.card.defaultImage,
        };
    });
}
