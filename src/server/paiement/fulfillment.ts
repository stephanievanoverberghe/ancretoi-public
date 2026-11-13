import 'server-only';

import type Stripe from 'stripe';
import { normalizeProgramSlug } from '@/lib/programmes-content';
import { findFulfillmentUserById, recordPaidPurchaseAndEnrollment } from './paiement.repository';

type CheckoutFulfillmentOptions = {
    expectedProgramSlug?: string;
    expectedUserEmail?: string;
};

type CheckoutFulfillmentSuccess = {
    ok: true;
    enrollmentId: string;
    programSlug: string;
    userId: string;
    stripeSessionId: string;
    amountTotal: number | null;
    currency: string | null;
};

type CheckoutFulfillmentFailure = {
    ok: false;
    status: number;
    error: 'PAYMENT_NOT_CONFIRMED' | 'MISSING_METADATA' | 'PROGRAM_MISMATCH' | 'USER_NOT_FOUND' | 'USER_MISMATCH' | 'SERVER_ERROR';
    message: string;
};

export type CheckoutFulfillmentResult = CheckoutFulfillmentSuccess | CheckoutFulfillmentFailure;

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function isPaidCheckoutSession(session: Stripe.Checkout.Session) {
    return session.payment_status === 'paid';
}

function readCheckoutMetadata(session: Stripe.Checkout.Session) {
    const programSlug = normalizeProgramSlug(String(session.metadata?.program ?? ''));
    const userId = String(session.metadata?.userId ?? '').trim();

    if (!programSlug || !userId) return null;

    return {
        programSlug,
        userId,
        stripeSessionId: session.id,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
    };
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session, options: CheckoutFulfillmentOptions = {}): Promise<CheckoutFulfillmentResult> {
    if (!isPaidCheckoutSession(session)) {
        return {
            ok: false,
            status: 402,
            error: 'PAYMENT_NOT_CONFIRMED',
            message: 'Paiement non confirmé',
        };
    }

    const metadata = readCheckoutMetadata(session);
    if (!metadata) {
        return {
            ok: false,
            status: 400,
            error: 'MISSING_METADATA',
            message: 'Métadonnées manquantes',
        };
    }

    const expectedProgramSlug = options.expectedProgramSlug ? normalizeProgramSlug(options.expectedProgramSlug) : '';
    if (expectedProgramSlug && metadata.programSlug !== expectedProgramSlug) {
        return {
            ok: false,
            status: 400,
            error: 'PROGRAM_MISMATCH',
            message: 'Programme inattendu',
        };
    }

    const user = await findFulfillmentUserById(metadata.userId);
    if (!user) {
        return {
            ok: false,
            status: 401,
            error: 'USER_NOT_FOUND',
            message: 'Utilisateur introuvable',
        };
    }

    if (options.expectedUserEmail && normalizeEmail(user.email) !== normalizeEmail(options.expectedUserEmail)) {
        return {
            ok: false,
            status: 403,
            error: 'USER_MISMATCH',
            message: 'Session non liée à cet utilisateur',
        };
    }

    const enrollment = await recordPaidPurchaseAndEnrollment({
        userId: user.id,
        programSlug: metadata.programSlug,
        stripeSessionId: metadata.stripeSessionId,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amountCents: metadata.amountTotal,
        currency: metadata.currency,
        metadata: session.metadata ?? {},
    });

    return {
        ok: true,
        enrollmentId: enrollment.id,
        programSlug: metadata.programSlug,
        userId: user.id,
        stripeSessionId: metadata.stripeSessionId,
        amountTotal: metadata.amountTotal,
        currency: metadata.currency,
    };
}
