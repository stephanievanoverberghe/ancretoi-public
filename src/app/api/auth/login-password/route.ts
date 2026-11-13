import { after, NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createSessionToken, setSessionCookie } from '@/server/auth/session';
import { parseJsonBody } from '@/server/shared/api/validation';
import { authenticatePasswordUser, recordSuccessfulPasswordLogin } from '@/server/auth/auth.service';

const CSRF_COOKIE = 'csrf_token';

/**
 * Rate limit volontairement local au process.
 * À remplacer par Redis si plusieurs instances doivent partager les compteurs.
 */
const ATTEMPTS = new Map<string, { count: number; until?: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 7;

/** Identifie au mieux le client derrière les proxys Vercel/Cloudflare. */
function clientIp(req: NextRequest): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]!.trim();
    const xrip = req.headers.get('x-real-ip');
    if (xrip) return xrip.trim();
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
    return 'local';
}

function clientKey(req: NextRequest) {
    return clientIp(req);
}

/** Vérifie si le client peut tenter une connexion sans consommer d'essai. */
function rateLimit(req: NextRequest) {
    const key = clientKey(req);
    const now = Date.now();
    const rec = ATTEMPTS.get(key) ?? { count: 0 };
    if (rec.until && now < rec.until) {
        return { ok: false, retryAfter: Math.ceil((rec.until - now) / 1000) };
    }
    return { ok: true };
}

/** Enregistre un échec et verrouille temporairement après trop de tentatives. */
function recordFailure(req: NextRequest) {
    const key = clientKey(req);
    const now = Date.now();
    const rec = ATTEMPTS.get(key) ?? { count: 0 };
    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) {
        rec.until = now + WINDOW_MS;
        rec.count = 0;
    }
    ATTEMPTS.set(key, rec);
}

function recordSuccess(req: NextRequest) {
    ATTEMPTS.delete(clientKey(req));
}

/** Limite la redirection post-connexion aux chemins internes. */
function sanitizeNext(n: unknown): string {
    const raw = String(n || '');
    if (!raw.startsWith('/')) return '/espace';
    if (raw.startsWith('//')) return '/espace';
    if (raw.includes('://')) return '/espace';
    return raw;
}

const LoginBodySchema = z
    .object({
        email: z.preprocess((value) => String(value || '').toLowerCase().trim(), z.string()),
        password: z.preprocess((value) => String(value || ''), z.string()),
        next: z.unknown().optional(),
    })
    .passthrough();

/** Authentifie un utilisateur par e-mail/mot de passe et pose la session. */
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
        recordFailure(req);
        return NextResponse.json({ error: 'CSRF invalide' }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, LoginBodySchema, {
        invalidJsonError: 'Requête invalide',
        validationError: 'Requête invalide',
        includeIssues: false,
        includeOk: false,
    });
    if (!parsed.ok) {
        recordFailure(req);
        return parsed.response;
    }

    const email = parsed.data.email;
    const password = parsed.data.password;
    const next = sanitizeNext(parsed.data.next);

    if (!email || !password) {
        recordFailure(req);
        return NextResponse.json({ error: 'email et mot de passe requis' }, { status: 400 });
    }

    let auth: Awaited<ReturnType<typeof authenticatePasswordUser>>;
    try {
        auth = await authenticatePasswordUser({ email, password });
    } catch {
        return NextResponse.json(
            {
                error: 'Connexion temporairement indisponible. Réessaie dans quelques instants.',
                code: 'AUTH_UNAVAILABLE',
            },
            { status: 503 },
        );
    }
    if (!auth.ok) {
        recordFailure(req);
        if (auth.reason === 'user_not_found') {
            return NextResponse.json(
                {
                    error: 'Aucun compte n’est associé à cette adresse e-mail.',
                    code: 'USER_NOT_FOUND',
                },
                { status: 404 },
            );
        }

        if (auth.reason === 'missing_password') {
            return NextResponse.json(
                {
                    error: 'Ce compte existe, mais il utilise Google. Connecte-toi avec Google ou ajoute un mot de passe depuis ton compte.',
                    code: 'PASSWORD_NOT_AVAILABLE',
                },
                { status: 409 },
            );
        }

        return NextResponse.json({ error: 'Identifiants invalides', code: 'BAD_CREDENTIALS' }, { status: 401 });
    }

    recordSuccess(req);

    const jwt = await createSessionToken(auth.user.email);
    const res = NextResponse.json({ ok: true, redirectTo: next });
    setSessionCookie(res, jwt);

    res.cookies.set(CSRF_COOKIE, '', { path: '/', maxAge: 0, sameSite: 'lax' });

    after(async () => {
        try {
            await recordSuccessfulPasswordLogin(auth.user.email);
        } catch {
            // La connexion reste valide si la métrique d'activité ne peut pas être enregistrée.
        }
    });

    return res;
}
