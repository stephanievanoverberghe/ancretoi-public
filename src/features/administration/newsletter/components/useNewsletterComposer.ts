'use client';

import { useMemo, useReducer } from 'react';

import {
    isNewsletterCampaignBulkResponse,
    isNewsletterCampaignTestSuccess,
    parseNewsletterCampaignResponse,
    type NewsletterCampaignAudience,
    type NewsletterCampaignBulkResponse,
    type NewsletterCampaignErrorCode,
    type NewsletterCampaignTestSuccess,
} from '@/types/newsletter-campaign.types';

export type NewsletterComposerFields = {
    subject: string;
    html: string;
    testEmail: string;
    tag: string;
};

type TestState =
    | { status: 'idle' }
    | { status: 'sending' }
    | { status: 'error'; message: string }
    | { status: 'success'; response: NewsletterCampaignTestSuccess; fingerprint: string };

export type NewsletterReviewState =
    | { status: 'closed' }
    | { status: 'open'; audience: NewsletterCampaignAudience; confirmation: string }
    | { status: 'sending'; audience: NewsletterCampaignAudience; confirmation: string }
    | { status: 'done'; audience: NewsletterCampaignAudience; result: NewsletterCampaignBulkResponse };

type ComposerState = {
    fields: NewsletterComposerFields;
    test: TestState;
    review: NewsletterReviewState;
    feedback: string;
};

type ComposerAction =
    | { type: 'field_changed'; name: keyof NewsletterComposerFields; value: string }
    | { type: 'test_started' }
    | { type: 'test_failed'; message: string }
    | { type: 'test_succeeded'; response: NewsletterCampaignTestSuccess; fingerprint: string; message: string }
    | { type: 'review_opened'; audience: NewsletterCampaignAudience }
    | { type: 'review_closed' }
    | { type: 'confirmation_changed'; value: string }
    | { type: 'bulk_started' }
    | { type: 'bulk_failed'; message: string }
    | { type: 'bulk_finished'; result: NewsletterCampaignBulkResponse };

type TestAction = Extract<
    ComposerAction,
    { type: 'field_changed' | 'test_failed' | 'test_started' | 'test_succeeded' }
>;
type ReviewAction = Exclude<ComposerAction, TestAction>;
type ReviewActionByType<Type extends ReviewAction['type']> = Extract<ReviewAction, { type: Type }>;

const initialState: ComposerState = {
    fields: { subject: '', html: '', testEmail: '', tag: '' },
    test: { status: 'idle' },
    review: { status: 'closed' },
    feedback: '',
};

function reduceTestState(state: ComposerState, action: TestAction): ComposerState {
    switch (action.type) {
        case 'field_changed':
            return {
                ...state,
                fields: { ...state.fields, [action.name]: action.value },
                review: { status: 'closed' },
            };
        case 'test_started':
            return { ...state, test: { status: 'sending' }, review: { status: 'closed' }, feedback: '' };
        case 'test_failed':
            return { ...state, test: { status: 'error', message: action.message }, feedback: action.message };
        case 'test_succeeded':
            return {
                ...state,
                test: { status: 'success', response: action.response, fingerprint: action.fingerprint },
                feedback: action.message,
            };
    }

    return state;
}

function closeReviewState(state: ComposerState): ComposerState {
    if (state.review.status === 'sending') return state;
    const completed = state.review.status === 'done';
    return {
        ...state,
        review: { status: 'closed' },
        test: completed ? { status: 'idle' } : state.test,
        feedback: completed ? '' : state.feedback,
    };
}

function changeConfirmation(
    state: ComposerState,
    action: ReviewActionByType<'confirmation_changed'>,
): ComposerState {
    if (state.review.status !== 'open') return state;
    return { ...state, review: { ...state.review, confirmation: action.value } };
}

function startBulkSend(state: ComposerState): ComposerState {
    if (state.review.status !== 'open') return state;
    return { ...state, review: { ...state.review, status: 'sending' }, feedback: '' };
}

function failBulkSend(state: ComposerState, action: ReviewActionByType<'bulk_failed'>): ComposerState {
    if (state.review.status !== 'sending') return { ...state, feedback: action.message };
    return {
        ...state,
        review: {
            status: 'open',
            audience: state.review.audience,
            confirmation: state.review.confirmation,
        },
        feedback: action.message,
    };
}

function finishBulkSend(state: ComposerState, action: ReviewActionByType<'bulk_finished'>): ComposerState {
    if (state.review.status !== 'sending') return state;
    const audienceChanged = action.result.status === 'audience_changed';
    return {
        ...state,
        review: { status: 'done', audience: state.review.audience, result: action.result },
        test: audienceChanged ? { status: 'idle' } : state.test,
        feedback: action.result.ok ? '' : formatNewsletterCampaignError(action.result.error),
    };
}

function reduceReviewState(state: ComposerState, action: ReviewAction): ComposerState {
    switch (action.type) {
        case 'review_opened':
            return { ...state, review: { status: 'open', audience: action.audience, confirmation: '' } };
        case 'review_closed':
            return closeReviewState(state);
        case 'confirmation_changed':
            return changeConfirmation(state, action);
        case 'bulk_started':
            return startBulkSend(state);
        case 'bulk_failed':
            return failBulkSend(state, action);
        case 'bulk_finished':
            return finishBulkSend(state, action);
    }

    return state;
}

function reducer(state: ComposerState, action: ComposerAction): ComposerState {
    if (
        action.type === 'field_changed' ||
        action.type === 'test_started' ||
        action.type === 'test_failed' ||
        action.type === 'test_succeeded'
    ) {
        return reduceTestState(state, action);
    }

    return reduceReviewState(state, action);
}

function fingerprint(fields: NewsletterComposerFields) {
    return JSON.stringify([fields.subject.trim(), fields.html.trim(), fields.tag.trim()]);
}

async function readCampaignResponse(response: Response) {
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        return null;
    }
    return parseNewsletterCampaignResponse(payload);
}

function campaignFormData(fields: NewsletterComposerFields, mode: 'bulk' | 'test') {
    const body = new FormData();
    body.set('mode', mode);
    body.set('subject', fields.subject);
    body.set('html', fields.html);
    body.set('tag', fields.tag);
    return body;
}

export function useNewsletterComposer() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const currentFingerprint = useMemo(() => fingerprint(state.fields), [state.fields]);
    const testMatchesContent =
        state.test.status === 'success' && state.test.fingerprint === currentFingerprint;

    function setField(name: keyof NewsletterComposerFields, value: string) {
        dispatch({ type: 'field_changed', name, value });
    }

    async function sendTest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const testedFields = state.fields;
        const testedFingerprint = fingerprint(testedFields);
        dispatch({ type: 'test_started' });

        const body = campaignFormData(testedFields, 'test');
        body.set('testEmail', testedFields.testEmail);

        try {
            const response = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                body,
                headers: { accept: 'application/json', 'x-requested-with': 'fetch' },
            });
            const result = await readCampaignResponse(response);

            if (!result || !response.ok || !isNewsletterCampaignTestSuccess(result)) {
                const error = result && !result.ok ? result.error : 'invalid_response';
                dispatch({ type: 'test_failed', message: formatNewsletterCampaignError(error) });
                return;
            }

            dispatch({
                type: 'test_succeeded',
                response: result,
                fingerprint: testedFingerprint,
                message: `Email test envoyé à ${testedFields.testEmail.trim()}.`,
            });
        } catch {
            dispatch({ type: 'test_failed', message: formatNewsletterCampaignError('network_error') });
        }
    }

    function openReview() {
        if (!testMatchesContent || state.test.status !== 'success') return;
        dispatch({ type: 'review_opened', audience: state.test.response.audience });
    }

    function closeReview() {
        dispatch({ type: 'review_closed' });
    }

    function setConfirmation(value: string) {
        dispatch({ type: 'confirmation_changed', value });
    }

    async function sendBulk() {
        if (
            state.review.status !== 'open' ||
            state.review.confirmation !== 'ENVOYER' ||
            state.review.audience.total === 0 ||
            state.test.status !== 'success'
        ) {
            return;
        }

        const body = campaignFormData(state.fields, 'bulk');
        body.set('confirmation', state.review.confirmation);
        body.set('reviewProof', state.test.response.reviewProof);
        dispatch({ type: 'bulk_started' });

        try {
            const response = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                body,
                headers: { accept: 'application/json', 'x-requested-with': 'fetch' },
            });
            const result = await readCampaignResponse(response);

            if (!result || !isNewsletterCampaignBulkResponse(result)) {
                const error = result && !result.ok ? result.error : 'invalid_response';
                dispatch({ type: 'bulk_failed', message: formatNewsletterCampaignError(error) });
                return;
            }

            dispatch({ type: 'bulk_finished', result });
        } catch {
            dispatch({ type: 'bulk_failed', message: formatNewsletterCampaignError('network_error') });
        }
    }

    return {
        state,
        testMatchesContent,
        setField,
        sendTest,
        openReview,
        closeReview,
        setConfirmation,
        sendBulk,
    };
}

export type NewsletterComposerController = ReturnType<typeof useNewsletterComposer>;

export function formatNewsletterCampaignError(error: NewsletterCampaignErrorCode) {
    return {
        audience_changed: 'L’audience a changé depuis le test. Relancez un test avant toute diffusion.',
        bad_request: 'Complétez le sujet, le contenu et les champs requis.',
        confirmation_required: 'La confirmation ENVOYER est requise.',
        invalid_response: 'La réponse du serveur est invalide. Aucun nouvel envoi ne sera tenté.',
        missing_env: 'La configuration d’envoi est indisponible.',
        network_error: 'Le réseau est indisponible. Vérifiez la connexion puis réessayez.',
        no_recipients: 'Aucun contact confirmé ne correspond à cette audience.',
        partial_send: 'Certains emails n’ont pas pu être remis.',
        send_failed: 'Le fournisseur email a refusé l’envoi.',
        server_error: 'Le service newsletter est temporairement indisponible.',
        test_email_required: 'Une adresse de test valide est obligatoire.',
        test_required: 'Cette version doit être testée à nouveau avant l’envoi global.',
    }[error];
}
