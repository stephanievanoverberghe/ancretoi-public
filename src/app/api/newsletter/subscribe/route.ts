// src/app/api/newsletter/subscribe/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonBody } from '@/server/shared/api/validation';
import { ensureNewsletterSubscriptionReady, subscribeToNewsletter } from '@/server/newsletter/subscription.service';
import { getAppBaseUrl } from '@/server/shared/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_RE = /^[a-z0-9][a-z0-9_-]*$/;

const SubscribeBodySchema = z.object({
    email: z.preprocess((value) => String(value ?? '').trim().toLowerCase(), z.string().refine((email) => EMAIL_RE.test(email), 'invalid_email')),
    source: z.preprocess(
        (value) => String(value ?? 'site').trim().toLowerCase(),
        z.string().min(1).max(64).regex(SOURCE_RE, 'invalid_source'),
    ),
});

export async function POST(req: Request) {
    try {
        await ensureNewsletterSubscriptionReady();

        const parsed = await parseJsonBody(req, SubscribeBodySchema, {
            invalidJsonError: 'invalid_email',
            validationError: 'invalid_email',
            includeIssues: false,
        });
        if (!parsed.ok) return parsed.response;

        const { email, source } = parsed.data;

        const origin = getAppBaseUrl(req.url);

        const result = await subscribeToNewsletter({
            email,
            source,
            origin,
            ip: req.headers.get('x-forwarded-for') ?? null,
            userAgent: req.headers.get('user-agent') ?? null,
        });

        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === 'missing_env') {
            return NextResponse.json({ ok: false, error: 'missing_env' }, { status: 500 });
        }
        console.error('newsletter/subscribe error:', message);
        return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
    }
}
