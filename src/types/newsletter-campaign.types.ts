export type NewsletterCampaignMode = 'test' | 'bulk';

export type NewsletterCampaignErrorCode =
    | 'audience_changed'
    | 'bad_request'
    | 'confirmation_required'
    | 'invalid_response'
    | 'missing_env'
    | 'network_error'
    | 'no_recipients'
    | 'partial_send'
    | 'send_failed'
    | 'server_error'
    | 'test_email_required'
    | 'test_required';

export type NewsletterCampaignAudience = {
    total: number;
    tag: string | null;
};

export type NewsletterCampaignTestSuccess = {
    ok: true;
    mode: 'test';
    reviewProof: string;
    audience: NewsletterCampaignAudience;
};

export type NewsletterCampaignAudienceSuccess = {
    ok: true;
    mode: 'audience';
    audience: NewsletterCampaignAudience;
};

type NewsletterCampaignBulkBase = {
    mode: 'bulk';
    total: number;
    sent: number;
    failed: number;
    tag: string | null;
};

export type NewsletterCampaignBulkSuccess = NewsletterCampaignBulkBase & {
    ok: true;
    status: 'sent';
};

export type NewsletterCampaignBulkFailure = NewsletterCampaignBulkBase & {
    ok: false;
    status: 'audience_changed' | 'failed' | 'partial';
    error: NewsletterCampaignErrorCode;
    currentTotal?: number;
};

export type NewsletterCampaignBulkResponse = NewsletterCampaignBulkSuccess | NewsletterCampaignBulkFailure;

export type NewsletterCampaignFailure = {
    ok: false;
    mode?: 'audience' | 'test';
    error: NewsletterCampaignErrorCode;
};

export type NewsletterCampaignResponse =
    | NewsletterCampaignAudienceSuccess
    | NewsletterCampaignBulkResponse
    | NewsletterCampaignFailure
    | NewsletterCampaignTestSuccess;

const errorCodes: ReadonlySet<string> = new Set([
    'audience_changed',
    'bad_request',
    'confirmation_required',
    'invalid_response',
    'missing_env',
    'network_error',
    'no_recipients',
    'partial_send',
    'send_failed',
    'server_error',
    'test_email_required',
    'test_required',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function parseAudience(value: unknown): NewsletterCampaignAudience | null {
    if (!isRecord(value) || !isNonNegativeInteger(value.total)) return null;
    if (value.tag !== null && typeof value.tag !== 'string') return null;
    return { total: value.total, tag: value.tag };
}

function isErrorCode(value: unknown): value is NewsletterCampaignErrorCode {
    return typeof value === 'string' && errorCodes.has(value);
}

function parseBulkBase(value: Record<string, unknown>): NewsletterCampaignBulkBase | null {
    if (value.mode !== 'bulk') return null;
    if (!isNonNegativeInteger(value.total)) return null;
    if (!isNonNegativeInteger(value.sent)) return null;
    if (!isNonNegativeInteger(value.failed)) return null;
    if (value.tag !== null && typeof value.tag !== 'string') return null;

    return {
        mode: 'bulk',
        total: value.total,
        sent: value.sent,
        failed: value.failed,
        tag: value.tag,
    };
}

function parseTestSuccess(value: Record<string, unknown>): NewsletterCampaignTestSuccess | null {
    if (value.mode !== 'test' || typeof value.reviewProof !== 'string' || !value.reviewProof) return null;
    const audience = parseAudience(value.audience);
    if (!audience) return null;
    return { ok: true, mode: 'test', reviewProof: value.reviewProof, audience };
}

function parseAudienceSuccess(value: Record<string, unknown>): NewsletterCampaignAudienceSuccess | null {
    if (value.mode !== 'audience') return null;
    const audience = parseAudience(value.audience);
    return audience ? { ok: true, mode: 'audience', audience } : null;
}

function parseBulkSuccess(value: Record<string, unknown>): NewsletterCampaignBulkSuccess | null {
    const bulk = parseBulkBase(value);
    if (!bulk || value.status !== 'sent') return null;
    return { ...bulk, ok: true, status: 'sent' };
}

function parseSuccess(value: Record<string, unknown>): NewsletterCampaignResponse | null {
    if (value.mode === 'test') return parseTestSuccess(value);
    if (value.mode === 'audience') return parseAudienceSuccess(value);
    return parseBulkSuccess(value);
}

function isBulkFailureStatus(value: unknown): value is NewsletterCampaignBulkFailure['status'] {
    return value === 'audience_changed' || value === 'failed' || value === 'partial';
}

function parseBulkFailure(value: Record<string, unknown>): NewsletterCampaignBulkFailure | null {
    const bulk = parseBulkBase(value);
    if (!bulk || !isBulkFailureStatus(value.status) || !isErrorCode(value.error)) return null;
    if (value.currentTotal !== undefined && !isNonNegativeInteger(value.currentTotal)) return null;

    return {
        ...bulk,
        ok: false,
        status: value.status,
        error: value.error,
        ...(value.currentTotal === undefined ? {} : { currentTotal: value.currentTotal }),
    };
}

function parseFailure(value: Record<string, unknown>): NewsletterCampaignBulkFailure | NewsletterCampaignFailure | null {
    if (value.mode === 'bulk') return parseBulkFailure(value);
    if (!isErrorCode(value.error)) return null;
    if (value.mode !== undefined && value.mode !== 'audience' && value.mode !== 'test') return null;
    return value.mode === undefined
        ? { ok: false, error: value.error }
        : { ok: false, mode: value.mode, error: value.error };
}

export function parseNewsletterCampaignResponse(value: unknown): NewsletterCampaignResponse | null {
    if (!isRecord(value) || typeof value.ok !== 'boolean') return null;
    return value.ok ? parseSuccess(value) : parseFailure(value);
}

export function isNewsletterCampaignTestSuccess(
    response: NewsletterCampaignResponse,
): response is NewsletterCampaignTestSuccess {
    return response.ok && response.mode === 'test';
}

export function isNewsletterCampaignBulkResponse(
    response: NewsletterCampaignResponse,
): response is NewsletterCampaignBulkResponse {
    return response.mode === 'bulk';
}
