export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getStripe } from '@/server/paiement/stripe';
import { getSession } from '@/server/auth/session';
import { normalizeProgramSlug } from '@/lib/programmes-content';
import { fulfillCheckoutSession } from '@/server/paiement/fulfillment';

export async function POST(req: Request) {
    try {
        const { session_id, program } = (await req.json().catch(() => ({}))) as { session_id?: string; program?: string };
        const bodyProgram = program ? normalizeProgramSlug(program) : '';
        if (!session_id || !bodyProgram) return NextResponse.json({ error: 'params manquants' }, { status: 400 });

        const sess = await getSession();
        if (!sess?.email) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

        const stripe = getStripe();
        if (!stripe) return NextResponse.json({ error: 'Stripe non configuré' }, { status: 501 });

        const checkout = await stripe.checkout.sessions.retrieve(session_id);
        const fulfilled = await fulfillCheckoutSession(checkout, {
            expectedProgramSlug: bodyProgram,
            expectedUserEmail: sess.email,
        });

        if (!fulfilled.ok) {
            return NextResponse.json({ error: fulfilled.message }, { status: fulfilled.status });
        }

        return NextResponse.json({
            ok: true,
            enrollmentId: fulfilled.enrollmentId,
            redirectTo: `/espace`,
        });
    } catch {
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
