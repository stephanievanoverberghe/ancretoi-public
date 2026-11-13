import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateLearnerIntro } from '@/server/apprentissage/learning-api.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const Body = z.object({
    slug: z.string().trim().min(1),
    engaged: z.boolean(),
});

export async function POST(req: Request) {
    try {
        let jsonUnknown: unknown;
        try {
            jsonUnknown = await req.json();
        } catch {
            return NextResponse.json({ ok: false as const, error: 'INVALID_JSON' }, { status: 400 });
        }

        const parsed = Body.safeParse(jsonUnknown);
        if (!parsed.success) {
            return NextResponse.json({ ok: false as const, error: 'INVALID_BODY', issues: parsed.error.flatten() }, { status: 400 });
        }

        const result = await updateLearnerIntro(parsed.data);
        return result.ok ? NextResponse.json(result) : NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json({ ok: false as const, error: 'SERVER_ERROR' }, { status: 500 });
    }
}
