export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createCheckoutResponse } from '@/server/paiement/checkout.service';

export async function POST(req: Request) {
    const { slug } = await req.json().catch(() => ({}));
    const result = await createCheckoutResponse(req, slug);

    return NextResponse.json(result.body, { status: result.status });
}
