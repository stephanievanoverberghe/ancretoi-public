import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createSessionToken, setSessionCookie } from '@/server/auth/session';
import bcrypt from 'bcryptjs';
import { isPasswordAcceptable } from '@/lib/password';
import { parseJsonBody } from '@/server/shared/api/validation';
import { registerPasswordUser } from '@/server/auth/auth.service';
import { espaceRoutes } from '@/config/routes';

const CSRF_COOKIE = 'csrf_token';

// Rate limit local au process. Redis sera nécessaire si plusieurs instances partagent les compteurs.
const ATTEMPTS = new Map<string, { count: number; until?: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 7;

function clientIp(req: NextRequest): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]!.trim();
    const xrip = req.headers.get('x-real-ip');
    if (xrip) return xrip.trim();
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
    return 'local';
}
function key(req: NextRequest) {
    return clientIp(req);
}
function rateLimit(req: NextRequest) {
    const k = key(req);
    const now = Date.now();
    const rec = ATTEMPTS.get(k) ?? { count: 0 };
    if (rec.until && now < rec.until) return { ok: false, retryAfter: Math.ceil((rec.until - now) / 1000) };
    return { ok: true };
}
function fail(req: NextRequest) {
    const k = key(req);
    const now = Date.now();
    const rec = ATTEMPTS.get(k) ?? { count: 0 };
    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) {
        rec.until = now + WINDOW_MS;
        rec.count = 0;
    }
    ATTEMPTS.set(k, rec);
}
function success(req: NextRequest) {
    ATTEMPTS.delete(key(req));
}

const RegisterBodySchema = z
    .object({
        email: z.preprocess((value) => String(value || '').toLowerCase().trim(), z.string()),
        name: z.preprocess((value) => String(value || '').trim() || null, z.string().nullable()),
        password: z.preprocess((value) => String(value || ''), z.string()),
        next: z.unknown().optional(),
    })
    .passthrough();

export async function POST(req: NextRequest) {
    const rl = rateLimit(req);
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Trop de tentatives. Réessaie plus tard.', code: 'RATE_LIMITED', retryAfter: rl.retryAfter },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        );
    }

    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        fail(req);
        return NextResponse.json({ error: 'CSRF invalide' }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, RegisterBodySchema, {
        invalidJsonError: 'Requête invalide',
        validationError: 'Requête invalide',
        includeIssues: false,
        includeOk: false,
    });
    if (!parsed.ok) {
        fail(req);
        return parsed.response;
    }

    const email = parsed.data.email;
    const name = parsed.data.name;
    const password = parsed.data.password;
    const next = espaceRoutes.root;

    if (!email || !password) {
        fail(req);
        return NextResponse.json({ error: 'email et mot de passe requis' }, { status: 400 });
    }

    const pwCheck = isPasswordAcceptable(password, email, name || undefined);
    if (!pwCheck.ok) {
        fail(req);
        return NextResponse.json(
            {
                error: 'Mot de passe trop faible. Exige au minimum 12 caractères, avec minuscules, MAJUSCULES, chiffres et symboles, sans suites ni répétitions, ni votre nom/email.',
                issues: pwCheck.issues,
                code: 'WEAK_PASSWORD',
            },
            { status: 400 }
        );
    }

    let result: Awaited<ReturnType<typeof registerPasswordUser>>;
    try {
        const passwordHash = await bcrypt.hash(password, 12);
        result = await registerPasswordUser({ email, name, passwordHash });
    } catch {
        return NextResponse.json(
            {
                error: 'Inscription temporairement indisponible. Réessaie dans quelques instants.',
                code: 'AUTH_UNAVAILABLE',
            },
            { status: 503 },
        );
    }

    if (result.status === 'email_in_use') {
        fail(req);
        return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail. Connecte-toi pour continuer.', code: 'EMAIL_IN_USE' }, { status: 409 });
    }

    success(req);

    const jwt = await createSessionToken(email);
    const res = NextResponse.json({ ok: true, redirectTo: next });
    setSessionCookie(res, jwt);
    res.cookies.set(CSRF_COOKIE, '', { path: '/', maxAge: 0, sameSite: 'lax' });
    return res;
}
