// src/app/api/learn/state/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { upsertLearnerDayState } from '@/server/apprentissage/learning-api.service';

const Body = z.object({
    slug: z.string().trim().min(1),
    day: z.number().int().positive(),
    expectedVersion: z.string().datetime().nullable(),
    patch: z.object({
        data: z.record(z.string(), z.string()).optional(),
        practiced: z.boolean().optional(),
        completed: z.boolean().optional(),
    }),
});

export async function POST(req: Request) {
    try {
        const json: unknown = await req.json();
        const parsed = Body.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ ok: false as const, error: 'INVALID_BODY' }, { status: 400 });
        }

        const { slug, day, patch, expectedVersion } = parsed.data;
        const result = await upsertLearnerDayState({ slug, day, patch, expectedVersion });
        return result.ok
            ? NextResponse.json(result)
            : NextResponse.json(
                {
                    ok: false as const,
                    error: result.error,
                    ...('current' in result ? { current: result.current } : {}),
                },
                { status: result.status },
            );
    } catch {
        return NextResponse.json({ ok: false as const, error: 'SERVER_ERROR' }, { status: 500 });
    }
}

/** La suppression non versionnée est fermée pour ne jamais effacer un brouillon concurrent. */
export async function DELETE() {
    return NextResponse.json(
        { ok: false as const, error: 'METHOD_RETIRED' },
        { status: 405, headers: { Allow: 'POST' } },
    );
}
