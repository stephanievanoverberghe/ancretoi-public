export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/server/paiement/stripe';
import { fulfillCheckoutSession } from '@/server/paiement/fulfillment';

export async function POST(req: Request) {
    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook Stripe non configuré' }, { status: 500 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Signature Stripe manquante' }, { status: 400 });
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
        return NextResponse.json({ error: 'Signature Stripe invalide' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const fulfilled = await fulfillCheckoutSession(session);

        if (!fulfilled.ok) {
            return NextResponse.json({ error: fulfilled.message }, { status: fulfilled.status });
        }
    }

    return NextResponse.json({ received: true });
}
