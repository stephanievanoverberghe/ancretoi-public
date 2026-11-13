import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/server/auth/session';
import { updateAuthUserProfile } from '@/server/auth/auth.service';
import { parseJsonBody } from '@/server/shared/api/validation';

const BodySchema = z.object({
    name: z
        .string()
        .transform((value) => value.trim())
        .refine((value) => value.length > 0, 'INVALID_NAME'),
});

export async function POST(req: Request) {
    try {
        const sess = await getSession();
        if (!sess?.email) return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });

        const parsed = await parseJsonBody(req, BodySchema, {
            invalidJsonError: 'INVALID_NAME',
            validationError: 'INVALID_NAME',
            includeIssues: false,
        });
        if (!parsed.ok) return parsed.response;

        const { name } = parsed.data;

        await updateAuthUserProfile({ email: sess.email, name });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
    }
}
