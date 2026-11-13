// src/server/newsletter/subscription.service.ts
import 'server-only';
import crypto from 'node:crypto';
import { Resend } from 'resend';
import { NewsletterStatus } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export type SubscribeNewsletterInput = {
    email: string;
    source: string;
    origin: string;
    ip: string | null;
    userAgent: string | null;
};

export type SubscribeNewsletterResult = { ok: true } | { ok: false; error: 'email_send_failed' };

export function assertNewsletterEmailEnv() {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
        throw new Error('missing_env');
    }
}

export async function ensureNewsletterSubscriptionReady() {
    assertNewsletterEmailEnv();
    await getPrismaClient().$queryRaw`SELECT 1`;
}

export async function subscribeToNewsletter(input: SubscribeNewsletterInput): Promise<SubscribeNewsletterResult> {
    const { email, source, origin, ip, userAgent } = input;

    const confirmToken = crypto.randomBytes(32).toString('hex');
    const unsubToken = crypto.randomBytes(32).toString('hex');

    await getPrismaClient().newsletterSubscriber.upsert({
        where: { email },
        update: {
            status: NewsletterStatus.PENDING,
            source,
            confirmToken,
            unsubToken,
            consentAt: null,
            meta: {
                ip,
                userAgent,
            },
        },
        create: {
            email,
            status: NewsletterStatus.PENDING,
            source,
            confirmToken,
            unsubToken,
            tags: [],
            meta: {
                ip,
                userAgent,
            },
        },
    });

    const confirmUrl = `${origin}/api/newsletter/confirm?token=${confirmToken}`;
    const unsubUrl = `${origin}/api/newsletter/unsubscribe?token=${unsubToken}`;

    const html = renderConfirmHtml(confirmUrl, unsubUrl);

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: email,
        subject: 'Confirme ton inscription à Ancre-toi',
        html,
        headers: { 'List-Unsubscribe': `<${unsubUrl}>` },
    });

    if (error) {
        console.error('Resend error:', error);
        return { ok: false, error: 'email_send_failed' };
    }

    return { ok: true };
}

export async function confirmNewsletterSubscription(token: string) {
    const doc = await getPrismaClient().newsletterSubscriber.findUnique({
        where: { confirmToken: token },
        select: { id: true, consentAt: true },
    });
    if (!doc) return false;

    await getPrismaClient().newsletterSubscriber.update({
        where: { id: doc.id },
        data: {
            status: NewsletterStatus.CONFIRMED,
            confirmToken: null,
            confirmedAt: new Date(),
            consentAt: doc.consentAt ?? new Date(),
        },
    });

    return true;
}

export async function unsubscribeNewsletter(token: string) {
    const doc = await getPrismaClient().newsletterSubscriber.findUnique({
        where: { unsubToken: token },
        select: { id: true },
    });
    if (!doc) return false;

    await getPrismaClient().newsletterSubscriber.update({
        where: { id: doc.id },
        data: {
            status: NewsletterStatus.UNSUBSCRIBED,
            unsubscribedAt: new Date(),
        },
    });

    return true;
}

function renderConfirmHtml(confirmUrl: string, unsubUrl: string) {
    return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
    <h2 style="margin:0 0 12px">Bienvenue ✨</h2>
    <p style="margin:0 0 12px">
      Confirme ton inscription à l’inspiration <strong>Ancre-toi</strong> :
    </p>
    <p style="margin:0 0 16px">
      <a href="${confirmUrl}" style="display:inline-block;background:#6d5ba4;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">
        Confirmer mon email
      </a>
    </p>
    <p style="color:#666;font-size:12px;margin:0 0 8px">
      Si tu n’es pas à l’origine de cette demande, ignore ce message.
    </p>
    <p style="color:#666;font-size:12px;margin:0">
      Tu ne veux plus recevoir ces emails ?
      <a href="${unsubUrl}" style="color:#6d5ba4">Se désinscrire</a>.
    </p>
  </div>`;
}
