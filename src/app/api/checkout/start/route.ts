export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { startCheckoutResponse } from '@/server/paiement/checkout.service';

export async function POST(req: Request) {
    try {
        const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
        const result = await startCheckoutResponse(req, slug);

        return NextResponse.json(result.body, { status: result.status });
    } catch {
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
