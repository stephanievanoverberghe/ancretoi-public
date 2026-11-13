import 'server-only';

import crypto from 'node:crypto';

import { Resend } from 'resend';

import type {
    NewsletterCampaignAudience,
    NewsletterCampaignAudienceSuccess,
    NewsletterCampaignBulkFailure,
    NewsletterCampaignBulkResponse,
    NewsletterCampaignErrorCode,
    NewsletterCampaignFailure,
    NewsletterCampaignResponse,
    NewsletterCampaignTestSuccess,
} from '@/types/newsletter-campaign.types';
import { getAppBaseUrl, getNextAuthSecret } from '@/server/shared/env';

import {
    ensureNewsletterUnsubscribeToken,
    getConfirmedNewsletterRecipients,
    getConfirmedNewsletterRecipientsByIds,
} from './newsletter.service';

const BATCH_SIZE = 30;
const TOKEN_CONCURRENCY = 10;
const REVIEW_PROOF_TTL_MS = 30 * 60 * 1000;
const MAX_SUBJECT_LENGTH = 200;
const MAX_HTML_LENGTH = 200_000;
const MAX_TAG_LENGTH = 64;
const MAX_EMAIL_LENGTH = 320;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterCampaignRequest = {
    mode: string;
    subject: string;
    html: string;
    testEmail: string;
    tag: string;
    confirmation: string;
    reviewProof: string;
    requestUrl: string;
};

type NormalizedCampaign = {
    subject: string;
    html: string;
    tag: string;
};

type RecipientIdentity = {
    id: string;
    email: string;
};

type AudienceSnapshot = {
    audience: NewsletterCampaignAudience;
    hash: string;
    recipients: RecipientIdentity[];
};

type ReviewProofPayload = {
    version: 1;
    issuedAt: number;
    campaignHash: string;
    audienceHash: string;
    audienceTotal: number;
};

type EmailConfiguration = {
    apiKey: string;
    from: string;
    appUrl: string;
};

type SendableRecipient = RecipientIdentity & {
    unsubToken: string | null;
};

function hashValue(value: unknown) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function campaignHash(campaign: NormalizedCampaign) {
    return hashValue([campaign.subject, campaign.html, campaign.tag]);
}

function timingSafeEqualText(left: string, right: string) {
    const leftBuffer = Buffer.from(left, 'utf8');
    const rightBuffer = Buffer.from(right, 'utf8');
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function normalizeRecipients(recipients: RecipientIdentity[]) {
    return [...recipients].sort((left, right) => left.id.localeCompare(right.id) || left.email.localeCompare(right.email));
}

function createAudienceSnapshot(recipients: RecipientIdentity[], tag: string): AudienceSnapshot {
    const normalizedRecipients = normalizeRecipients(recipients);

    return {
        audience: { total: normalizedRecipients.length, tag: tag || null },
        hash: hashValue([tag, normalizedRecipients.map(({ id, email }) => [id, email])]),
        recipients: normalizedRecipients,
    };
}

async function loadAudienceSnapshot(tag: string) {
    const recipients = await getConfirmedNewsletterRecipients(tag || undefined);
    return createAudienceSnapshot(recipients, tag);
}

function createReviewProof(campaign: NormalizedCampaign, snapshot: AudienceSnapshot) {
    const payload: ReviewProofPayload = {
        version: 1,
        issuedAt: Date.now(),
        campaignHash: campaignHash(campaign),
        audienceHash: snapshot.hash,
        audienceTotal: snapshot.audience.total,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = crypto.createHmac('sha256', getNextAuthSecret()).update(encodedPayload).digest('base64url');
    return `${encodedPayload}.${signature}`;
}

function isReviewProofPayload(value: unknown): value is ReviewProofPayload {
    if (!isRecord(value) || value.version !== 1) return false;
    if (!isFiniteNumber(value.issuedAt)) return false;
    if (typeof value.campaignHash !== 'string') return false;
    if (typeof value.audienceHash !== 'string') return false;
    return isNonNegativeInteger(value.audienceTotal);
}

function verifyReviewProof(proof: string, campaign: NormalizedCampaign): ReviewProofPayload | null {
    const [encodedPayload, signature, ...extra] = proof.split('.');
    if (!encodedPayload || !signature || extra.length) return null;

    const expectedSignature = crypto.createHmac('sha256', getNextAuthSecret()).update(encodedPayload).digest('base64url');
    if (!timingSafeEqualText(signature, expectedSignature)) return null;

    try {
        const payload: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        if (!isReviewProofPayload(payload)) return null;
        if (payload.issuedAt > Date.now() || Date.now() - payload.issuedAt > REVIEW_PROOF_TTL_MS) return null;
        if (!timingSafeEqualText(payload.campaignHash, campaignHash(campaign))) return null;
        return payload;
    } catch {
        return null;
    }
}

export function createNewsletterRecipientIdempotencyKey(reviewProof: string, recipientId: string) {
    const digest = hashValue([reviewProof, recipientId]);
    return `ancretoi-newsletter-${digest}`;
}

function createTestDeliveryIdentity(campaign: NormalizedCampaign, testEmail: string, snapshot: AudienceSnapshot) {
    const digest = hashValue([campaignHash(campaign), testEmail, snapshot.hash]);
    return {
        idempotencyKey: `ancretoi-newsletter-test-${digest}`,
        unsubscribeToken: `test-${digest.slice(0, 48)}`,
    };
}

function normalizeCampaign(input: NewsletterCampaignRequest): NormalizedCampaign {
    return {
        subject: input.subject.trim(),
        html: input.html.trim(),
        tag: input.tag.trim(),
    };
}

function validateCampaign(campaign: NormalizedCampaign): NewsletterCampaignErrorCode | null {
    if (!campaign.subject || !campaign.html) return 'bad_request';
    if (campaign.subject.length > MAX_SUBJECT_LENGTH || campaign.html.length > MAX_HTML_LENGTH) return 'bad_request';
    if (campaign.tag.length > MAX_TAG_LENGTH) return 'bad_request';
    return null;
}

function testFailure(error: NewsletterCampaignErrorCode): NewsletterCampaignFailure {
    return { ok: false, mode: 'test', error };
}

function bulkFailure(
    error: NewsletterCampaignErrorCode,
    input: {
        total?: number;
        sent?: number;
        failed?: number;
        tag: string;
        currentTotal?: number;
    },
): NewsletterCampaignBulkFailure {
    const status = error === 'audience_changed' ? 'audience_changed' : input.sent ? 'partial' : 'failed';

    return {
        ok: false,
        mode: 'bulk',
        status,
        error,
        total: input.total ?? 0,
        sent: input.sent ?? 0,
        failed: input.failed ?? 0,
        tag: input.tag || null,
        ...(input.currentTotal === undefined ? {} : { currentTotal: input.currentTotal }),
    };
}

function renderCampaignHtml(innerHtml: string, unsubscribeUrl: string) {
    return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
    ${innerHtml}
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
    <p style="color:#666;font-size:12px">
      Tu ne veux plus recevoir ces emails ?
      <a href="${unsubscribeUrl}" style="color:#6d5ba4">Se désinscrire</a>.
    </p>
  </div>`;
}

function getEmailConfiguration(requestUrl: string): EmailConfiguration | null {
    const apiKey = process.env.RESEND_API_KEY?.trim() ?? '';
    const from = process.env.RESEND_FROM?.trim() ?? '';
    if (!apiKey || !from) return null;

    try {
        const appUrl = getAppBaseUrl(requestUrl);
        return appUrl ? { apiKey, from, appUrl } : null;
    } catch {
        return null;
    }
}

async function sendTestCampaign(
    input: NewsletterCampaignRequest,
    campaign: NormalizedCampaign,
): Promise<NewsletterCampaignTestSuccess | NewsletterCampaignFailure> {
    const testEmail = input.testEmail.trim().toLowerCase();
    if (!testEmail || testEmail.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(testEmail)) {
        return testFailure('test_email_required');
    }

    const configuration = getEmailConfiguration(input.requestUrl);
    if (!configuration) return testFailure('missing_env');

    const snapshot = await loadAudienceSnapshot(campaign.tag);
    const deliveryIdentity = createTestDeliveryIdentity(campaign, testEmail, snapshot);
    const unsubscribeUrl = `${configuration.appUrl}/api/newsletter/unsubscribe?token=${deliveryIdentity.unsubscribeToken}`;
    const resend = new Resend(configuration.apiKey);

    try {
        const result = await resend.emails.send(
            {
                from: configuration.from,
                to: testEmail,
                subject: campaign.subject,
                html: renderCampaignHtml(campaign.html, unsubscribeUrl),
                headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
            },
            { idempotencyKey: deliveryIdentity.idempotencyKey },
        );

        if (result.error) return testFailure('send_failed');
    } catch {
        return testFailure('send_failed');
    }

    return {
        ok: true,
        mode: 'test',
        reviewProof: createReviewProof(campaign, snapshot),
        audience: snapshot.audience,
    };
}

async function ensureTokensForRecipients(recipients: RecipientIdentity[]) {
    for (let index = 0; index < recipients.length; index += TOKEN_CONCURRENCY) {
        const chunk = recipients.slice(index, index + TOKEN_CONCURRENCY);
        await Promise.all(
            chunk.map((recipient) =>
                ensureNewsletterUnsubscribeToken({
                    id: recipient.id,
                    candidateToken: crypto.randomBytes(24).toString('hex'),
                }),
            ),
        );
    }
}

function sameRecipients(expected: RecipientIdentity[], current: RecipientIdentity[]) {
    const normalizedExpected = normalizeRecipients(expected);
    const normalizedCurrent = normalizeRecipients(current);
    if (normalizedExpected.length !== normalizedCurrent.length) return false;

    return normalizedExpected.every(
        (recipient, index) =>
            recipient.id === normalizedCurrent[index]?.id && recipient.email === normalizedCurrent[index]?.email,
    );
}

type ReviewedCampaignPreparation =
    | {
          ok: true;
          proof: ReviewProofPayload;
          configuration: EmailConfiguration;
          snapshot: AudienceSnapshot;
      }
    | { ok: false; response: NewsletterCampaignBulkFailure };

function snapshotMatchesProof(snapshot: AudienceSnapshot, proof: ReviewProofPayload) {
    return snapshot.hash === proof.audienceHash && snapshot.audience.total === proof.audienceTotal;
}

async function prepareReviewedCampaign(
    input: NewsletterCampaignRequest,
    campaign: NormalizedCampaign,
): Promise<ReviewedCampaignPreparation> {
    const proof = verifyReviewProof(input.reviewProof.trim(), campaign);
    if (!proof) return { ok: false, response: bulkFailure('test_required', { tag: campaign.tag }) };

    if (input.confirmation.trim() !== 'ENVOYER') {
        return {
            ok: false,
            response: bulkFailure('confirmation_required', { total: proof.audienceTotal, tag: campaign.tag }),
        };
    }

    const configuration = getEmailConfiguration(input.requestUrl);
    if (!configuration) {
        return {
            ok: false,
            response: bulkFailure('missing_env', { total: proof.audienceTotal, tag: campaign.tag }),
        };
    }

    const snapshot = await loadAudienceSnapshot(campaign.tag);
    if (!snapshotMatchesProof(snapshot, proof)) {
        return {
            ok: false,
            response: bulkFailure('audience_changed', {
                total: proof.audienceTotal,
                tag: campaign.tag,
                currentTotal: snapshot.audience.total,
            }),
        };
    }

    if (snapshot.recipients.length === 0) {
        return { ok: false, response: bulkFailure('no_recipients', { tag: campaign.tag }) };
    }

    return { ok: true, proof, configuration, snapshot };
}

type RecipientBatchPreparation =
    | { ok: true; recipients: SendableRecipient[] }
    | { ok: false; response: NewsletterCampaignBulkFailure };

async function prepareRecipientBatch(input: {
    campaign: NormalizedCampaign;
    expected: RecipientIdentity[];
    proof: ReviewProofPayload;
    sent: number;
}): Promise<RecipientBatchPreparation> {
    try {
        await ensureTokensForRecipients(input.expected);
    } catch {
        return {
            ok: false,
            response: bulkFailure('send_failed', {
                total: input.proof.audienceTotal,
                sent: input.sent,
                failed: input.proof.audienceTotal - input.sent,
                tag: input.campaign.tag,
            }),
        };
    }

    const recipients = await getConfirmedNewsletterRecipientsByIds({
        ids: input.expected.map(({ id }) => id),
        tag: input.campaign.tag || undefined,
    });
    if (sameRecipients(input.expected, recipients)) return { ok: true, recipients };

    const currentSnapshot = await loadAudienceSnapshot(input.campaign.tag);
    return {
        ok: false,
        response: bulkFailure('audience_changed', {
            total: input.proof.audienceTotal,
            sent: input.sent,
            tag: input.campaign.tag,
            currentTotal: currentSnapshot.audience.total,
        }),
    };
}

async function deliverRecipient(input: {
    campaign: NormalizedCampaign;
    configuration: EmailConfiguration;
    recipient: SendableRecipient;
    resend: Resend;
    reviewProof: string;
}) {
    if (!input.recipient.unsubToken) throw new Error('newsletter_unsubscribe_token_missing');
    const unsubscribeUrl = `${input.configuration.appUrl}/api/newsletter/unsubscribe?token=${input.recipient.unsubToken}`;
    const result = await input.resend.emails.send(
        {
            from: input.configuration.from,
            to: input.recipient.email,
            subject: input.campaign.subject,
            html: renderCampaignHtml(input.campaign.html, unsubscribeUrl),
            headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
        },
        {
            idempotencyKey: createNewsletterRecipientIdempotencyKey(input.reviewProof, input.recipient.id),
        },
    );

    if (result.error) throw new Error('send_failed');
}

async function deliverRecipientBatch(input: {
    campaign: NormalizedCampaign;
    configuration: EmailConfiguration;
    recipients: SendableRecipient[];
    resend: Resend;
    reviewProof: string;
}) {
    const results = await Promise.allSettled(
        input.recipients.map((recipient) => deliverRecipient({ ...input, recipient })),
    );

    return results.reduce(
        (totals, result) => {
            if (result.status === 'fulfilled') totals.sent += 1;
            else totals.failed += 1;
            return totals;
        },
        { sent: 0, failed: 0 },
    );
}

function deliveryResponse(input: {
    campaign: NormalizedCampaign;
    proof: ReviewProofPayload;
    sent: number;
    failed: number;
}): NewsletterCampaignBulkResponse {
    if (input.failed > 0) {
        return bulkFailure(input.sent > 0 ? 'partial_send' : 'send_failed', {
            total: input.proof.audienceTotal,
            sent: input.sent,
            failed: input.failed,
            tag: input.campaign.tag,
        });
    }

    return {
        ok: true,
        mode: 'bulk',
        status: 'sent',
        total: input.proof.audienceTotal,
        sent: input.sent,
        failed: 0,
        tag: input.campaign.tag || null,
    };
}

async function sendReviewedCampaign(
    input: NewsletterCampaignRequest,
    campaign: NormalizedCampaign,
): Promise<NewsletterCampaignBulkResponse> {
    const preparation = await prepareReviewedCampaign(input, campaign);
    if (!preparation.ok) return preparation.response;

    const { configuration, proof, snapshot } = preparation;
    const resend = new Resend(configuration.apiKey);
    let sent = 0;
    let failed = 0;

    for (let index = 0; index < snapshot.recipients.length; index += BATCH_SIZE) {
        const expected = snapshot.recipients.slice(index, index + BATCH_SIZE);
        const batch = await prepareRecipientBatch({
            campaign,
            expected,
            proof,
            sent,
        });
        if (!batch.ok) return batch.response;

        const delivered = await deliverRecipientBatch({
            campaign,
            configuration,
            recipients: batch.recipients,
            resend,
            reviewProof: input.reviewProof,
        });
        sent += delivered.sent;
        failed += delivered.failed;
    }

    return deliveryResponse({ campaign, proof, sent, failed });
}

export async function getNewsletterCampaignAudience(tagInput: string): Promise<NewsletterCampaignAudienceSuccess> {
    const tag = tagInput.trim().slice(0, MAX_TAG_LENGTH);
    const snapshot = await loadAudienceSnapshot(tag);
    return { ok: true, mode: 'audience', audience: snapshot.audience };
}

export async function executeNewsletterCampaign(
    input: NewsletterCampaignRequest,
): Promise<NewsletterCampaignResponse> {
    const campaign = normalizeCampaign(input);
    const validationError = validateCampaign(campaign);

    if (input.mode === 'test') {
        if (validationError) return testFailure(validationError);
        return sendTestCampaign(input, campaign);
    }

    if (input.mode === 'bulk') {
        if (validationError) return bulkFailure(validationError, { tag: campaign.tag });
        return sendReviewedCampaign(input, campaign);
    }

    return { ok: false, error: 'bad_request' };
}
