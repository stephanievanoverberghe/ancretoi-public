import 'server-only';

import { z } from 'zod';
import { ProgramLevel, ProgramStatus, UnitStatus, UnitType } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

const zUrl = z.string().url();

const zBenefit = z.object({
    icon: z.string().optional(),
    title: z.string().min(1),
    text: z.string().min(1),
});

const zDay = z.object({
    title: z.string().min(1),
    videoUrl: zUrl,
    mantra: z.string().max(120).optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
});

const zPayload = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    status: z.enum(['draft', 'preflight', 'published']).default('draft'),
    level: z.enum(['Basique', 'Cible', 'Premium']).default('Basique'),
    durationDays: z.coerce.number().int().min(1).max(365).default(7),
    estMinutesPerDay: z.coerce.number().int().min(1).max(180).default(20),
    priceCents: z.number().int().nullable().optional(),
    marketing: z.object({
        hero: z.object({
            title: z.string().min(1),
            subtitle: z.string().optional(),
            ctaHref: z.string().optional(),
            heroImage: z.string().optional(),
        }),
        objective: z.string().optional(),
        durationLabel: z.string().optional(),
        idealIf: z.string().optional(),
        benefits: z.array(zBenefit).max(3).default([]),
        faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional(),
        seo: z.object({ title: z.string().optional(), description: z.string().optional(), image: z.string().optional() }).partial().optional(),
    }),
    days: z.array(zDay).min(1),
});

export type AdminProgramPayload = z.infer<typeof zPayload>;

export function parseAdminProgramPayload(raw: unknown) {
    return zPayload.parse(raw);
}

export function slugifyAdminProgram(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toProgramStatus(status: AdminProgramPayload['status']) {
    if (status === 'published') return ProgramStatus.PUBLISHED;
    if (status === 'preflight') return ProgramStatus.PREFLIGHT;
    return ProgramStatus.DRAFT;
}

function toProgramLevel(level: AdminProgramPayload['level']) {
    if (level === 'Cible') return ProgramLevel.CIBLE;
    if (level === 'Premium') return ProgramLevel.PREMIUM;
    return ProgramLevel.BASIQUE;
}

function toUnitStatus(status: z.infer<typeof zDay>['status'], programStatus: AdminProgramPayload['status']) {
    return status === 'published' || (!status && programStatus === 'published') ? UnitStatus.PUBLISHED : UnitStatus.DRAFT;
}

function extractAssetId(url?: string) {
    if (!url) return '';
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('youtube.com')) return parsedUrl.searchParams.get('v') ?? '';
        if (parsedUrl.hostname === 'youtu.be') return parsedUrl.pathname.slice(1);
        if (parsedUrl.hostname.includes('vimeo.com')) return parsedUrl.pathname.split('/').filter(Boolean).pop() ?? '';
        return '';
    } catch {
        return '';
    }
}

function buildProgramJson(body: AdminProgramPayload) {
    const hero = body.marketing.hero;
    const heroImgObj = hero.heroImage && hero.heroImage.trim() ? { url: hero.heroImage.trim(), alt: '' } : null;
    const durationBadge = body.marketing.durationLabel?.trim() || `${body.durationDays} jours â€¢ ${body.estMinutesPerDay} min/j`;
    const idealIfHighlight = body.marketing.idealIf?.trim() ? [{ icon: 'âœ…', title: 'IdÃ©al siâ€¦', text: body.marketing.idealIf.trim() }] : [];

    return {
        hero: {
            eyebrow: '',
            title: hero.title || body.title,
            subtitle: hero.subtitle || '',
            ctaLabel: hero.ctaHref ? 'Commencer' : '',
            ctaHref: hero.ctaHref || '',
            heroImage: heroImgObj,
        },
        card: {
            image: heroImgObj,
            tagline: body.marketing.durationLabel || durationBadge,
            summary: body.marketing.objective || '',
            accentColor: '',
            badges: [durationBadge, body.level],
        },
        meta: {
            durationDays: body.durationDays,
            estMinutesPerDay: body.estMinutesPerDay,
            level: body.level,
            category: 'wellbeing',
            tags: [],
            language: 'fr',
        },
        highlights: [...idealIfHighlight, ...body.marketing.benefits.map((benefit) => ({ icon: benefit.icon || '', title: benefit.title, text: benefit.text }))],
        curriculum: body.days.map((day) => ({ label: day.title, summary: '' })),
        faq: body.marketing.faq || [],
        seo: body.marketing.seo || {},
        price: {
            amountCents: body.priceCents ?? null,
            currency: 'EUR',
            taxIncluded: true,
            compareAtCents: null,
            stripePriceId: null,
        },
    };
}

export async function upsertAdminProgram(input: { body: AdminProgramPayload; expectedSlug?: string; includeUnitContent: boolean }) {
    const programSlug = slugifyAdminProgram(input.body.slug);
    if (input.expectedSlug && slugifyAdminProgram(input.expectedSlug) !== programSlug) {
        return { ok: false as const, error: 'slug_mismatch' as const, status: 400 };
    }

    const programJson = buildProgramJson(input.body);

    await getPrismaClient().$transaction(async (tx) => {
        await tx.program.upsert({
            where: { slug: programSlug },
            create: {
                slug: programSlug,
                title: input.body.title,
                status: toProgramStatus(input.body.status),
                level: toProgramLevel(input.body.level),
                durationDays: input.body.durationDays,
                estMinutesPerDay: input.body.estMinutesPerDay,
                unitsCount: input.body.days.length,
                category: 'wellbeing',
                tags: [],
                language: 'fr',
                hero: programJson.hero,
                card: programJson.card,
                meta: programJson.meta,
                highlights: programJson.highlights,
                curriculum: programJson.curriculum,
                faq: programJson.faq,
                seo: programJson.seo,
                price: programJson.price,
            },
            update: {
                title: input.body.title,
                status: toProgramStatus(input.body.status),
                level: toProgramLevel(input.body.level),
                durationDays: input.body.durationDays,
                estMinutesPerDay: input.body.estMinutesPerDay,
                unitsCount: input.body.days.length,
                hero: programJson.hero,
                card: programJson.card,
                meta: programJson.meta,
                highlights: programJson.highlights,
                curriculum: programJson.curriculum,
                faq: programJson.faq,
                seo: programJson.seo,
                price: programJson.price,
                deletedAt: null,
            },
        });

        await tx.unit.deleteMany({ where: { programSlug } });
        await tx.unit.createMany({
            data: input.body.days.map((day, index) => ({
                programSlug,
                unitType: UnitType.DAY,
                unitIndex: index + 1,
                title: day.title,
                durationMin: input.includeUnitContent ? input.body.estMinutesPerDay ?? 25 : input.body.estMinutesPerDay,
                mantra: day.mantra ?? '',
                videoUrl: day.videoUrl,
                ...(input.includeUnitContent
                    ? {
                          content: { videoAssetId: extractAssetId(day.videoUrl), audioAssetId: '', safetyNote: '' },
                          contentParagraphs: day.description ? [day.description] : [],
                          journalSchema: { sliders: [], questions: [], checks: [] },
                      }
                    : {
                          contentParagraphs: day.description ? [day.description] : [],
                      }),
                status: toUnitStatus(day.status, input.body.status),
            })),
        });
    });

    return { ok: true as const, programSlug, units: input.body.days.length };
}

export async function updateAdminProgram(input: { body: AdminProgramPayload; currentSlug: string; includeUnitContent: boolean }) {
    const currentSlug = slugifyAdminProgram(input.currentSlug);
    const submittedSlug = slugifyAdminProgram(input.body.slug);

    if (!currentSlug || submittedSlug !== currentSlug) {
        return { ok: false as const, error: 'slug_immutable' as const, status: 400 };
    }

    const prisma = getPrismaClient();
    const programJson = buildProgramJson(input.body);

    const updated = await prisma.$transaction(async (tx) => {
        const existing = await tx.program.findUnique({
            where: { slug: currentSlug },
            select: { id: true },
        });
        if (!existing) return false;

        await tx.program.update({
            where: { slug: currentSlug },
            data: {
                title: input.body.title,
                status: toProgramStatus(input.body.status),
                level: toProgramLevel(input.body.level),
                durationDays: input.body.durationDays,
                estMinutesPerDay: input.body.estMinutesPerDay,
                unitsCount: input.body.days.length,
                hero: programJson.hero,
                card: programJson.card,
                meta: programJson.meta,
                highlights: programJson.highlights,
                curriculum: programJson.curriculum,
                faq: programJson.faq,
                seo: programJson.seo,
                price: programJson.price,
                deletedAt: null,
            },
        });

        await tx.unit.deleteMany({ where: { programSlug: currentSlug } });
        await tx.unit.createMany({
            data: input.body.days.map((day, index) => ({
                programSlug: currentSlug,
                unitType: UnitType.DAY,
                unitIndex: index + 1,
                title: day.title,
                durationMin: input.body.estMinutesPerDay,
                mantra: day.mantra ?? '',
                videoUrl: day.videoUrl,
                ...(input.includeUnitContent
                    ? {
                          content: { videoAssetId: extractAssetId(day.videoUrl), audioAssetId: '', safetyNote: '' },
                          contentParagraphs: day.description ? [day.description] : [],
                          journalSchema: { sliders: [], questions: [], checks: [] },
                      }
                    : {
                          contentParagraphs: day.description ? [day.description] : [],
                      }),
                status: toUnitStatus(day.status, input.body.status),
            })),
        });

        return true;
    });

    if (!updated) {
        return { ok: false as const, error: 'program_not_found' as const, status: 404 };
    }

    return { ok: true as const, programSlug: currentSlug, units: input.body.days.length };
}

export async function deleteAdminProgramBySlug(input: { slug: string; dryRun: boolean }) {
    const programSlug = slugifyAdminProgram(input.slug);
    const prisma = getPrismaClient();

    const [program, unitCount, statesCount] = await Promise.all([
        prisma.program.findUnique({ where: { slug: programSlug }, select: { id: true } }),
        prisma.unit.count({ where: { programSlug } }),
        prisma.dayState.count({ where: { programSlug } }),
    ]);
    const programPageCount = program ? 1 : 0;

    if (input.dryRun) {
        return { ok: true as const, deleted: { programPage: programPageCount, units: unitCount, states: statesCount } };
    }

    await prisma.$transaction(async (tx) => {
        await tx.dayState.deleteMany({ where: { programSlug } });
        await tx.baselineScore.deleteMany({ where: { enrollment: { programSlug } } });
        await tx.unit.deleteMany({ where: { programSlug } });
        await tx.enrollment.deleteMany({ where: { programSlug } });
        await tx.purchase.updateMany({ where: { programSlug }, data: { programSlug: null } });
        await tx.product.updateMany({ where: { programSlug }, data: { programSlug: null } });
        await tx.videoAsset.updateMany({ where: { programSlug }, data: { programSlug: null } });
        await tx.program.deleteMany({ where: { slug: programSlug } });
    });

    return { ok: true as const, deleted: { programPage: programPageCount, units: unitCount, states: statesCount } };
}
