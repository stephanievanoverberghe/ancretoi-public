import { NextResponse } from 'next/server';
import { newsletterRoutes } from '@/config/routes';
import { unsubscribeNewsletter } from '@/server/newsletter/subscription.service';
import { getAppBaseUrl } from '@/server/shared/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || '';
    const origin = getAppBaseUrl(req.url);

    const unsubscribed = await unsubscribeNewsletter(token);
    if (!unsubscribed) {
        return NextResponse.redirect(`${origin}${newsletterRoutes.erreur}?code=invalid_unsub`);
    }

    return NextResponse.redirect(`${origin}${newsletterRoutes.desinscription}`);
}
