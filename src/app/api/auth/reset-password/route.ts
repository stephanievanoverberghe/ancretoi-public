import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { resetPasswordWithToken } from '@/server/auth/auth.service';
import { parseJsonBody } from '@/server/shared/api/validation';

const CSRF_COOKIE = 'csrf_token';

const ResetPasswordBodySchema = z
    .object({
        token: z.preprocess((value) => String(value || ''), z.string()),
        password: z.preprocess((value) => String(value || ''), z.string()),
    })
    .passthrough();

export async function POST(req: NextRequest) {
    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return NextResponse.json({ error: 'CSRF invalide' }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, ResetPasswordBodySchema, {
        invalidJsonError: 'Requête invalide',
        validationError: 'Requête invalide',
        includeIssues: false,
        includeOk: false,
    });
    if (!parsed.ok) return parsed.response;

    const token = parsed.data.token;
    const password = parsed.data.password;

    if (!token || !password) return NextResponse.json({ error: 'Champs requis' }, { status: 400 });

    let result: Awaited<ReturnType<typeof resetPasswordWithToken>>;
    try {
        result = await resetPasswordWithToken({ token, password });
    } catch {
        return NextResponse.json(
            {
                error: 'Réinitialisation temporairement indisponible. Réessaie dans quelques instants.',
                code: 'AUTH_UNAVAILABLE',
            },
            { status: 503 },
        );
    }

    if (!result.ok && result.error === 'weak_password') {
        return NextResponse.json(
            { error: 'Mot de passe trop faible (12+ avec Aa0!, pas de suites/répétitions/nom/email).', issues: result.issues, code: 'WEAK_PASSWORD' },
            { status: 400 }
        );
    }

    if (!result.ok) {
        return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}
