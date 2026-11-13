import 'server-only';

import compareProgramsContent from '@/data/programs/compare.json';
import programsIndexContent from '@/data/programs/index.json';
import { ProgramStatus as PrismaProgramStatus, type Program as PrismaProgram } from '@/generated/prisma/client';

import type { CompareRow, Price, Program, ProgramCardSummary, ProgramDetail, ProgramLevel, PublicProgramStatus } from './programmes.types';

export const PUBLIC_PROGRAM_STATUS: PublicProgramStatus = 'published';

type JsonRecord = Record<string, unknown>;
type StaticProgram = (typeof programsIndexContent.programs)[number];
type StaticCompareRow = (typeof compareProgramsContent.rows)[number];

function asRecord(value: unknown): JsonRecord | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as JsonRecord;
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function trimToValue(value: unknown): string | null {
    const text = typeof value === 'string' ? value.trim() : '';
    return text ? text : null;
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map(trimToValue).filter((item): item is string => Boolean(item));
}

function preferStringArray(primary: unknown, fallback: unknown) {
    const primaryItems = asStringArray(primary);
    return primaryItems.length ? primaryItems : asStringArray(fallback);
}

function mapFaqItems(value: unknown): ProgramDetail['faq'] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
        const itemRecord = asRecord(item);
        const question = trimToValue(itemRecord?.q) ?? trimToValue(itemRecord?.question);
        const answer = trimToValue(itemRecord?.a) ?? trimToValue(itemRecord?.answer);

        return question && answer ? [{ q: question, a: answer }] : [];
    });
}

function mapPrismaLevel(level: PrismaProgram['level']): Program['level'] {
    switch (level) {
        case 'CIBLE':
            return 'Cible';
        case 'PREMIUM':
            return 'Premium';
        case 'BASIQUE':
        default:
            return 'Basique';
    }
}

function mapPrismaStatus(status: PrismaProgramStatus): 'draft' | 'preflight' | 'published' {
    switch (status) {
        case PrismaProgramStatus.PREFLIGHT:
            return 'preflight';
        case PrismaProgramStatus.PUBLISHED:
            return 'published';
        case PrismaProgramStatus.ARCHIVED:
        case PrismaProgramStatus.DRAFT:
        default:
            return 'draft';
    }
}

function mapPrice(price: unknown): Price {
    const priceRecord = asRecord(price);

    return {
        amount_cents: asNumber(priceRecord?.amountCents) ?? asNumber(priceRecord?.amount_cents) ?? null,
        currency: trimToValue(priceRecord?.currency) ?? 'EUR',
        tax_included: asBoolean(priceRecord?.taxIncluded) ?? asBoolean(priceRecord?.tax_included) ?? true,
        compare_at_cents: asNumber(priceRecord?.compareAtCents) ?? asNumber(priceRecord?.compare_at_cents) ?? null,
        stripe_price_id: trimToValue(priceRecord?.stripePriceId) ?? trimToValue(priceRecord?.stripe_price_id),
    };
}

function preferPrice(primary: unknown, fallback: unknown): Price {
    const primaryPrice = mapPrice(primary);
    if (primaryPrice.amount_cents !== null || primaryPrice.stripe_price_id) return primaryPrice;
    return mapPrice(fallback);
}

function minutesToLabel(minutes?: number | null) {
    if (!minutes) return '—';
    if (minutes <= 20) return '10–20 min/j';
    if (minutes <= 40) return '20–40 min/j';
    return '40–60 min/j';
}

function getStaticProgram(slug: string): StaticProgram | null {
    return programsIndexContent.programs.find((program) => program.slug === slug) ?? null;
}

function getStaticCompare(slug: string): StaticCompareRow | null {
    return compareProgramsContent.rows.find((row) => row.slug === slug) ?? null;
}

function getCompare(program: PrismaProgram): JsonRecord | null {
    const marketing = asRecord(program.marketing);
    return asRecord(marketing?.compare) ?? null;
}

function emptyOverview(): ProgramDetail['overview'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
        who_title: '',
        cards: [],
        note: {
            title: '',
            description: '',
            cta_label: '',
        },
    };
}

function emptyInside(): ProgramDetail['inside'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
        items: [],
    };
}

function emptyPath(): ProgramDetail['path'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
        summary: [],
        steps: [],
    };
}

function emptyOutcomesSection(): ProgramDetail['outcomes_section'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
        items: [],
        note: '',
    };
}

function emptyFaqSection(): ProgramDetail['faq_section'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
    };
}

function emptyFinalCta(): ProgramDetail['final_cta'] {
    return {
        eyebrow: '',
        title: '',
        description: '',
        purchase_label: '',
        free_label: '',
        unavailable_label: '',
        secondary_label: '',
        aside_title: '',
        aside_items: [],
    };
}

function mapOverview(value: unknown): ProgramDetail['overview'] | null {
    const overview = asRecord(value);
    if (!overview) return null;

    const cards = Array.isArray(overview.cards)
        ? overview.cards.flatMap((card) => {
              const cardRecord = asRecord(card);
              const title = trimToValue(cardRecord?.title);
              const description = trimToValue(cardRecord?.description);

              return title && description
                  ? [
                        {
                            kind: trimToValue(cardRecord?.kind) ?? 'fit',
                            title,
                            description,
                            items: asStringArray(cardRecord?.items),
                        },
                    ]
                  : [];
          })
        : [];
    const note = asRecord(overview.note);

    return {
        eyebrow: trimToValue(overview.eyebrow) ?? '',
        title: trimToValue(overview.title) ?? '',
        description: trimToValue(overview.description) ?? '',
        who_title: trimToValue(overview.who_title) ?? trimToValue(overview.whoTitle) ?? '',
        cards,
        note: {
            title: trimToValue(note?.title) ?? '',
            description: trimToValue(note?.description) ?? '',
            cta_label: trimToValue(note?.cta_label) ?? trimToValue(note?.ctaLabel) ?? '',
        },
    };
}

function mapInside(value: unknown): ProgramDetail['inside'] | null {
    const inside = asRecord(value);
    if (!inside) return null;

    const items = Array.isArray(inside.items)
        ? inside.items.flatMap((item) => {
              const itemRecord = asRecord(item);
              const title = trimToValue(itemRecord?.title);
              const description = trimToValue(itemRecord?.description);

              return title && description
                  ? [
                        {
                            kind: trimToValue(itemRecord?.kind) ?? 'steps',
                            title,
                            description,
                        },
                    ]
                  : [];
          })
        : [];

    return {
        eyebrow: trimToValue(inside.eyebrow) ?? '',
        title: trimToValue(inside.title) ?? '',
        description: trimToValue(inside.description) ?? '',
        items,
    };
}

function mapPath(value: unknown): ProgramDetail['path'] | null {
    const path = asRecord(value);
    if (!path) return null;

    const summary = Array.isArray(path.summary)
        ? path.summary.flatMap((item) => {
              const itemRecord = asRecord(item);
              const label = trimToValue(itemRecord?.label);
              const value = trimToValue(itemRecord?.value);

              return label && value
                  ? [
                        {
                            kind: trimToValue(itemRecord?.kind) ?? 'duration',
                            label,
                            value,
                        },
                    ]
                  : [];
          })
        : [];

    const steps = Array.isArray(path.steps)
        ? path.steps.flatMap((step) => {
              const stepRecord = asRecord(step);
              const label = trimToValue(stepRecord?.label);
              const title = trimToValue(stepRecord?.title);
              const description = trimToValue(stepRecord?.description);

              return label && title && description
                  ? [
                        {
                            label,
                            title,
                            description,
                            focus: trimToValue(stepRecord?.focus) ?? undefined,
                        },
                    ]
                  : [];
          })
        : [];

    return {
        eyebrow: trimToValue(path.eyebrow) ?? '',
        title: trimToValue(path.title) ?? '',
        description: trimToValue(path.description) ?? '',
        summary,
        steps,
    };
}

function mapOutcomesSection(value: unknown): ProgramDetail['outcomes_section'] | null {
    const section = asRecord(value);
    if (!section) return null;

    const items = Array.isArray(section.items)
        ? section.items.flatMap((item) => {
              const itemRecord = asRecord(item);
              const title = trimToValue(itemRecord?.title);
              const description = trimToValue(itemRecord?.description);

              return title && description ? [{ title, description }] : [];
          })
        : [];

    return {
        eyebrow: trimToValue(section.eyebrow) ?? '',
        title: trimToValue(section.title) ?? '',
        description: trimToValue(section.description) ?? '',
        items,
        note: trimToValue(section.note) ?? '',
    };
}

function mapFaqSection(value: unknown): ProgramDetail['faq_section'] | null {
    const section = asRecord(value);
    if (!section) return null;

    return {
        eyebrow: trimToValue(section.eyebrow) ?? '',
        title: trimToValue(section.title) ?? '',
        description: trimToValue(section.description) ?? '',
    };
}

function mapFinalCta(value: unknown): ProgramDetail['final_cta'] | null {
    const section = asRecord(value);
    if (!section) return null;

    return {
        eyebrow: trimToValue(section.eyebrow) ?? '',
        title: trimToValue(section.title) ?? '',
        description: trimToValue(section.description) ?? '',
        purchase_label: trimToValue(section.purchase_label) ?? trimToValue(section.purchaseLabel) ?? '',
        free_label: trimToValue(section.free_label) ?? trimToValue(section.freeLabel) ?? '',
        unavailable_label: trimToValue(section.unavailable_label) ?? trimToValue(section.unavailableLabel) ?? '',
        secondary_label: trimToValue(section.secondary_label) ?? trimToValue(section.secondaryLabel) ?? '',
        aside_title: trimToValue(section.aside_title) ?? trimToValue(section.asideTitle) ?? '',
        aside_items: asStringArray(section.aside_items ?? section.asideItems),
    };
}

function mapProgramDetail(program: PrismaProgram): ProgramDetail {
    const marketing = asRecord(program.marketing);
    const detail = asRecord(marketing?.detail);
    const staticDetail = asRecord(getStaticProgram(program.slug)?.detail);
    const detailFaq = mapFaqItems(detail?.faq);
    const programFaq = mapFaqItems(program.faq);
    const staticFaq = mapFaqItems(staticDetail?.faq);

    return {
        who: trimToValue(detail?.who) ?? trimToValue(staticDetail?.who) ?? '',
        goals: preferStringArray(detail?.goals, staticDetail?.goals),
        includes: preferStringArray(detail?.includes, staticDetail?.includes),
        prerequisites: preferStringArray(detail?.prerequisites, staticDetail?.prerequisites),
        outcomes: preferStringArray(detail?.outcomes, staticDetail?.outcomes),
        faq: detailFaq.length ? detailFaq : programFaq.length ? programFaq : staticFaq,
        faq_section: mapFaqSection(detail?.faq_section) ?? mapFaqSection(staticDetail?.faq_section) ?? emptyFaqSection(),
        final_cta: mapFinalCta(detail?.final_cta) ?? mapFinalCta(staticDetail?.final_cta) ?? emptyFinalCta(),
        overview: mapOverview(detail?.overview) ?? mapOverview(staticDetail?.overview) ?? emptyOverview(),
        inside: mapInside(detail?.inside) ?? mapInside(staticDetail?.inside) ?? emptyInside(),
        path: mapPath(detail?.path) ?? mapPath(staticDetail?.path) ?? emptyPath(),
        outcomes_section: mapOutcomesSection(detail?.outcomes_section) ?? mapOutcomesSection(staticDetail?.outcomes_section) ?? emptyOutcomesSection(),
    };
}

export function mapProgramToProgram(program: PrismaProgram): Program {
    const staticProgram = getStaticProgram(program.slug);
    const hero = asRecord(program.hero);
    const card = asRecord(program.card);
    const meta = asRecord(program.meta);
    const heroImage = asRecord(hero?.heroImage);
    const cardImage = asRecord(card?.image);

    return {
        slug: program.slug,
        title: trimToValue(hero?.title) ?? trimToValue(program.title) ?? staticProgram?.title ?? program.slug,
        tagline: trimToValue(card?.tagline) ?? trimToValue(card?.summary) ?? trimToValue(program.description) ?? staticProgram?.tagline ?? '',
        duration_days: asNumber(meta?.durationDays) ?? program.durationDays ?? staticProgram?.duration_days ?? 0,
        level: mapPrismaLevel(program.level),
        status: PUBLIC_PROGRAM_STATUS,
        cover: trimToValue(cardImage?.url) ?? trimToValue(program.coverUrl) ?? trimToValue(heroImage?.url) ?? staticProgram?.cover ?? '',
        price: preferPrice(program.price, staticProgram?.price),
        card_highlights: preferStringArray(program.highlights, staticProgram?.card_highlights),
        detail: mapProgramDetail(program),
    };
}

export function mapProgramCardSummary(program: PrismaProgram, options?: { preferCardImage?: boolean; includeLevel?: boolean }): ProgramCardSummary {
    const staticProgram = getStaticProgram(program.slug);
    const hero = asRecord(program.hero);
    const card = asRecord(program.card);
    const heroImage = asRecord(hero?.heroImage);
    const cardImage = asRecord(card?.image);
    const cover = options?.preferCardImage
        ? trimToValue(cardImage?.url) ?? trimToValue(heroImage?.url) ?? trimToValue(program.coverUrl) ?? staticProgram?.cover
        : trimToValue(heroImage?.url) ?? trimToValue(cardImage?.url) ?? trimToValue(program.coverUrl) ?? staticProgram?.cover;
    const price = preferPrice(program.price, staticProgram?.price);

    return {
        slug: program.slug,
        title: trimToValue(hero?.title) ?? trimToValue(program.title) ?? staticProgram?.title ?? 'Sans titre',
        duration_days: program.durationDays || staticProgram?.duration_days || 0,
        status: mapPrismaStatus(program.status),
        cover: cover ?? null,
        price: {
            amount_cents: price.amount_cents,
            currency: price.currency,
        },
        ...(options?.includeLevel ? { level: mapPrismaLevel(program.level) as ProgramLevel } : {}),
    };
}

export function sortProgramCardsByDuration(a: ProgramCardSummary, b: ProgramCardSummary) {
    return (a.duration_days || 0) - (b.duration_days || 0);
}

export function mapCompareRow(program: PrismaProgram): CompareRow {
    const staticCompare = getStaticCompare(program.slug);
    const staticProgram = getStaticProgram(program.slug);
    const hero = asRecord(program.hero);
    const card = asRecord(program.card);
    const compare = getCompare(program);
    const title = trimToValue(hero?.title) ?? trimToValue(program.title) ?? staticProgram?.title ?? program.slug.toUpperCase();
    const duree = staticCompare?.duree ?? (program.durationDays ? `${program.durationDays} jours` : '—');

    return {
        slug: program.slug,
        title,
        objectif: trimToValue(compare?.objectif) ?? staticCompare?.objectif ?? trimToValue(card?.tagline) ?? trimToValue(card?.summary) ?? `Parcours ${duree}`,
        duree,
        charge: trimToValue(compare?.charge) ?? staticCompare?.charge ?? minutesToLabel(program.estMinutesPerDay),
        niveau: mapPrismaLevel(program.level),
        ideal_si: trimToValue(compare?.idealSi) ?? staticCompare?.ideal_si ?? trimToValue(card?.summary) ?? trimToValue(card?.tagline) ?? '',
        cta: trimToValue(compare?.ctaLabel) ?? staticCompare?.cta ?? `Voir ${title.toUpperCase()}`,
        status: mapPrismaStatus(program.status),
    };
}

export function mapProgramChargeLabel(program: PrismaProgram): string | null {
    const staticCompare = getStaticCompare(program.slug);
    return trimToValue(getCompare(program)?.charge) ?? staticCompare?.charge ?? minutesToLabel(program.estMinutesPerDay);
}
