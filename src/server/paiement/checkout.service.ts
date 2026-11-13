import 'server-only';

import { routeBuilders } from '@/config/routes';
import { getSession } from '@/server/auth/session';
import { getProgramBySlug } from '@/server/programmes/programmes-index.service';
import { findActiveCheckoutEnrollment, findCheckoutUserByEmail, upsertActiveEnrollment } from './paiement.repository';
import { getStripe } from './stripe';

function getBaseUrl(req: Request) {
    const url = new URL(req.url);
    const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '') ?? 'https';
    const host = req.headers.get('x-forwarded-host') ?? url.host;
    return `${proto}://${host}`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

async function getAuthenticatedCheckoutUser() {
    const sess = await getSession();
    if (!sess?.email) return null;

    return findCheckoutUserByEmail(sess.email);
}

export async function createCheckoutResponse(req: Request, slug: string) {
    if (!slug) return { body: { error: 'slug requis' }, status: 400 };

    const user = await getAuthenticatedCheckoutUser();
    if (!user) return { body: { error: 'Non authentifiÃ©' }, status: 401 };

    const program = await getProgramBySlug(slug);
    if (!program) return { body: { error: 'Programme introuvable' }, status: 404 };

    if (user.deletedAt) return { body: { error: 'Utilisateur introuvable' }, status: 401 };

    if (program.price?.amount_cents === 0) {
        const enrollment = await upsertActiveEnrollment({ userId: user.id, programSlug: slug, startedAt: new Date() });
        return { body: { ok: true, redirectTo: `/espace/formations/${slug}/jour/1`, enrollmentId: enrollment.id } };
    }

    const stripe = getStripe();

    if (!stripe && process.env.CHECKOUT_DEV_BYPASS === 'true') {
        const enrollment = await upsertActiveEnrollment({ userId: user.id, programSlug: slug, startedAt: new Date() });
        return { body: { ok: true, redirectTo: `/espace/formations/${slug}/jour/1`, enrollmentId: enrollment.id, devBypass: true } };
    }

    if (!stripe) return { body: { error: 'Stripe non configurÃ© (STRIPE_SECRET_KEY manquante).' }, status: 501 };

    const amount = program.price?.amount_cents ?? null;
    const currency = (program.price?.currency || 'EUR').toUpperCase();
    if (!amount || amount <= 0) return { body: { error: 'Montant invalide ou manquant.' }, status: 400 };

    const base = getBaseUrl(req);
    const success = `${base}/paiement/succes?program=${slug}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${base}/paiement/annule?program=${slug}`;
    const priceId = program.price?.stripe_price_id || null;

    const session = priceId
        ? await stripe.checkout.sessions.create({
              mode: 'payment',
              line_items: [{ price: priceId, quantity: 1 }],
              success_url: success,
              cancel_url: cancel,
              customer_email: user.email,
              metadata: { program: slug, userId: user.id },
          })
        : await stripe.checkout.sessions.create({
              mode: 'payment',
              line_items: [
                  {
                      price_data: {
                          currency,
                          unit_amount: amount,
                          product_data: { name: program.title },
                      },
                      quantity: 1,
                  },
              ],
              success_url: success,
              cancel_url: cancel,
              customer_email: user.email,
              metadata: { program: slug, userId: user.id },
          });

    return { body: { url: session.url } };
}

export async function startCheckoutResponse(req: Request, slug?: string) {
    if (!slug) return { body: { error: 'slug requis' }, status: 400 };

    const user = await getAuthenticatedCheckoutUser();
    if (!user) {
        const next = `/programmes/${slug}#commencer`;
        return { body: { error: 'Non authentifié', redirectTo: routeBuilders.authModal('login', next) }, status: 401 };
    }

    const program = await getProgramBySlug(slug);
    if (!program) return { body: { error: 'Programme introuvable' }, status: 404 };

    if (user.deletedAt) return { body: { error: 'Utilisateur introuvable' }, status: 401 };

    const existing = await findActiveCheckoutEnrollment({ userId: user.id, programSlug: slug });

    if (existing) {
        const day = Math.max(1, existing.currentDay ?? 1);
        return { body: { ok: true, redirectTo: `/espace/formations/${slug}/jour/${pad2(day)}` } };
    }

    if ((program.price?.amount_cents ?? 0) === 0) {
        await upsertActiveEnrollment({ userId: user.id, programSlug: slug, startedAt: new Date() });
        return { body: { ok: true, redirectTo: `/espace` } };
    }

    const stripe = getStripe();

    if (!stripe && process.env.CHECKOUT_DEV_BYPASS === 'true') {
        await upsertActiveEnrollment({ userId: user.id, programSlug: slug, startedAt: new Date() });
        return { body: { ok: true, redirectTo: `/espace`, devBypass: true } };
    }

    if (!stripe) return { body: { error: 'Stripe non configurÃ©' }, status: 501 };

    const amount = Number(program.price?.amount_cents ?? 0);
    const currency = (program.price?.currency || 'EUR').toUpperCase();
    if (!amount || amount <= 0) return { body: { error: 'Montant invalide.' }, status: 400 };

    const priceId = program.price?.stripe_price_id || null;
    const base = getBaseUrl(req);
    const success = `${base}/paiement/succes?program=${slug}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${base}/paiement/annule?program=${slug}`;

    const session = priceId
        ? await stripe.checkout.sessions.create({
              mode: 'payment',
              line_items: [{ price: priceId, quantity: 1 }],
              success_url: success,
              cancel_url: cancel,
              customer_email: user.email,
              metadata: { program: slug, userId: user.id },
          })
        : await stripe.checkout.sessions.create({
              mode: 'payment',
              line_items: [
                  {
                      price_data: {
                          currency,
                          unit_amount: amount,
                          product_data: { name: program.title },
                      },
                      quantity: 1,
                  },
              ],
              success_url: success,
              cancel_url: cancel,
              customer_email: user.email,
              metadata: { program: slug, userId: user.id },
          });

    return { body: { url: session.url } };
}
