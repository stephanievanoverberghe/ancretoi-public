import { NextResponse, NextRequest } from 'next/server';
import { sendPasswordResetEmail } from '@/server/email/mailer';
import { requestPasswordReset } from '@/server/auth/auth.service';
import { getAppBaseUrl } from '@/server/shared/env';

const CSRF_COOKIE = 'csrf_token';

// Rate limit local au process. Redis sera nécessaire si plusieurs instances partagent les compteurs.
const ATTEMPTS = new Map<string, { count: number; until?: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

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

type Body = { email?: string };

export async function POST(req: NextRequest) {
    const rl = rateLimit(req);
    if (!rl.ok) {
        return NextResponse.json(
            { ok: true }, // pas de fuite d’info
            { status: 200, headers: { 'Retry-After': String(rl.retryAfter) } }
        );
    }

    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        fail(req);
        return NextResponse.json({ ok: true }, { status: 200 }); // Toujours 200
    }

    let body: Body | null = null;
    try {
        body = (await req.json()) as Body;
    } catch {
        /* noop */
    }

    const normalized = String(body?.email || '')
        .toLowerCase()
        .trim();
    if (!normalized) return NextResponse.json({ ok: true });

    const baseUrl = getAppBaseUrl(req.url);
    let reset: Awaited<ReturnType<typeof requestPasswordReset>>;
    try {
        reset = await requestPasswordReset({ email: normalized, baseUrl });
    } catch {
        return NextResponse.json({ ok: true });
    }

    if (!reset) {
        success(req);
        return NextResponse.json({ ok: true });
    }

    try {
        await sendPasswordResetEmail(normalized, reset.resetUrl);
    } catch {
        /* ignorer en dev */
    }

    success(req);

    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json({ ok: true, ...(isProd ? {} : { devResetUrl: reset.resetUrl }) });
}
