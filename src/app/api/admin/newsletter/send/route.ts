import { NextResponse } from 'next/server';

import {
    executeNewsletterCampaign,
    getNewsletterCampaignAudience,
} from '@/server/administration/newsletter-campaign.service';
import { requireAdmin } from '@/server/auth/authz';
import type { NewsletterCampaignResponse } from '@/types/newsletter-campaign.types';

export const runtime = 'nodejs';

function wantsJSON(req: Request) {
    const accept = req.headers.get('accept') || '';
    const requestedWith = (req.headers.get('x-requested-with') || '').toLowerCase();
    return accept.includes('application/json') || requestedWith === 'fetch' || requestedWith === 'xmlhttprequest';
}

function responseStatus(result: NewsletterCampaignResponse) {
    if (result.ok) return 200;
    if (result.mode === 'bulk' && result.status === 'partial') return 207;
    if (result.error === 'audience_changed') return 409;
    if (result.error === 'missing_env' || result.error === 'server_error') return 500;
    if (result.error === 'send_failed' || result.error === 'partial_send') return 502;
    return 400;
}

function redirectUrl(result: NewsletterCampaignResponse) {
    if (result.ok && result.mode === 'test') return '/administration/newsletter?test=1';
    if (result.ok && result.mode === 'bulk') return `/administration/newsletter?sent=${result.sent}`;
    if (!result.ok && result.mode === 'bulk' && result.status === 'partial') {
        return `/administration/newsletter?partial=1&sent=${result.sent}&failed=${result.failed}`;
    }
    return `/administration/newsletter?err=${encodeURIComponent(result.ok ? 'bad_request' : result.error)}`;
}

function jsonOrRedirect(req: Request, result: NewsletterCampaignResponse) {
    const status = responseStatus(result);
    return wantsJSON(req)
        ? NextResponse.json(result, { status })
        : NextResponse.redirect(redirectUrl(result), { status: 303 });
}

function formString(form: FormData, name: string) {
    const value = form.get(name);
    return typeof value === 'string' ? value : '';
}

export async function GET(req: Request) {
    await requireAdmin();

    try {
        const tag = new URL(req.url).searchParams.get('tag') ?? '';
        return NextResponse.json(await getNewsletterCampaignAudience(tag));
    } catch {
        return NextResponse.json(
            { ok: false, mode: 'audience', error: 'server_error' } satisfies NewsletterCampaignResponse,
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    await requireAdmin();

    try {
        const form = await req.formData();
        const result = await executeNewsletterCampaign({
            mode: formString(form, 'mode') || 'test',
            subject: formString(form, 'subject'),
            html: formString(form, 'html'),
            testEmail: formString(form, 'testEmail'),
            tag: formString(form, 'tag'),
            confirmation: formString(form, 'confirmation'),
            reviewProof: formString(form, 'reviewProof'),
            requestUrl: req.url,
        });

        return jsonOrRedirect(req, result);
    } catch {
        return jsonOrRedirect(req, { ok: false, error: 'server_error' });
    }
}
