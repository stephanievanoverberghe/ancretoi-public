// src/app/api/settings/prefs/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/server/auth/session';
import { updateAuthUserPreferences } from '@/server/auth/auth.service';
import { parseJsonBody } from '@/server/shared/api/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
    theme: z.enum(['system', 'light', 'dark']).optional(),
    marketing: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
});

export async function POST(req: Request): Promise<Response> {
    try {
        const sess = await getSession();
        if (!sess?.email) {
            return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });
        }

        const parsed = await parseJsonBody(req, BodySchema);
        if (!parsed.ok) return parsed.response;

        const json = parsed.data;

        await updateAuthUserPreferences({
            email: sess.email,
            theme: json.theme,
            marketing: json.marketing,
            productUpdates: json.productUpdates,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('POST /api/settings/prefs failed', err);
        return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
    }
}
