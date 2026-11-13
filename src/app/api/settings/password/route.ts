// src/app/api/settings/password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/server/auth/session';
import { changeUserPassword } from '@/server/auth/auth.service';
import { parseJsonBody } from '@/server/shared/api/validation';

const CSRF_COOKIE = 'csrf_token';

const BodySchema = z
    .object({
        current: z.preprocess((value) => String(value || ''), z.string()),
        password: z.preprocess((value) => String(value || ''), z.string()),
    })
    .passthrough();

export async function POST(req: NextRequest) {
    const sess = await getSession();
    if (!sess?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // CSRF double-submit
    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return NextResponse.json({ error: 'CSRF invalide' }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, BodySchema, {
        invalidJsonError: 'Requête invalide',
        validationError: 'Requête invalide',
        includeIssues: false,
        includeOk: false,
    });
    if (!parsed.ok) return parsed.response;

    const current = parsed.data.current;
    const next = parsed.data.password;
    if (!current || !next) return NextResponse.json({ error: 'Champs requis' }, { status: 400 });

    const result = await changeUserPassword({
        email: sess.email,
        currentPassword: current,
        nextPassword: next,
    });

    if (!result.ok && result.error === 'current_password') {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    if (!result.ok && result.error === 'weak_password') {
        return NextResponse.json({ error: 'Mot de passe trop faible', issues: result.issues }, { status: 400 });
    }

    if (!result.ok) return NextResponse.json({ error: 'Compte invalide' }, { status: 400 });

    return NextResponse.json({ ok: true });
}
