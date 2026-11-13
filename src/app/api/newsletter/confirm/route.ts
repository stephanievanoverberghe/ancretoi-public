// src/app/api/newsletter/confirm/route.ts
import { NextResponse } from 'next/server';
import { newsletterRoutes } from '@/config/routes';
import { confirmNewsletterSubscription } from '@/server/newsletter/subscription.service';
import { getAppBaseUrl } from '@/server/shared/env';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || '';
    const origin = getAppBaseUrl(req.url);

    const confirmed = await confirmNewsletterSubscription(token);
    if (!confirmed) {
        return NextResponse.redirect(`${origin}${newsletterRoutes.erreur}?code=invalid_token`);
    }

    return NextResponse.redirect(`${origin}${newsletterRoutes.confirmation}`);
}
