'use client';

import { AlertTriangle, CheckCircle2, Send, X } from 'lucide-react';

import { Button, Field, FieldDescription, FieldLabel, Input } from '@/components/ui';
import type { NewsletterCampaignBulkResponse } from '@/types/newsletter-campaign.types';

import { useAdminModalA11y } from '../../shared';
import type { NewsletterComposerController, NewsletterReviewState } from './useNewsletterComposer';

type OpenReviewState = Exclude<NewsletterReviewState, { status: 'closed' }>;

type ReviewDialogModel = {
    audience: OpenReviewState['audience'];
    confirmation: string;
    result: NewsletterCampaignBulkResponse | null;
    sending: boolean;
};

export function NewsletterReviewDialog({ controller }: { controller: NewsletterComposerController }) {
    const review = controller.state.review;
    const open = review.status !== 'closed';
    const { dialogRef, titleId, descriptionId } = useAdminModalA11y({ open, onClose: controller.closeReview });

    if (review.status === 'closed') return null;
    const model = getReviewDialogModel(review);

    return (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4" onClick={controller.closeReview}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                tabIndex={-1}
                className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-elevated outline-none sm:rounded-3xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Dernière vérification</p>
                        <h2 id={titleId} className="mt-1 font-serif text-2xl font-semibold text-foreground">Revue de l’envoi global</h2>
                        <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">Le total affiché est celui du snapshot signé lors du test.</p>
                    </div>
                    <button
                        type="button"
                        onClick={controller.closeReview}
                        disabled={model.sending}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
                        aria-label="Annuler et fermer la revue"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>

                <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <section className="min-h-[22rem] border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-6" aria-labelledby="newsletter-preview-title">
                        <h3 id="newsletter-preview-title" className="mb-3 text-sm font-semibold text-foreground">Aperçu sandboxé</h3>
                        <iframe
                            title="Aperçu du contenu de la newsletter"
                            sandbox=""
                            srcDoc={buildPreviewDocument(controller.state.fields.html)}
                            className="h-[26rem] w-full rounded-2xl border border-border bg-surface"
                        />
                    </section>

                    <aside className="space-y-5 p-4 sm:p-6">
                        <ReviewSummary subject={controller.state.fields.subject} audience={model.audience} />
                        <ReviewStatus controller={controller} model={model} />
                        <ReviewActions controller={controller} model={model} />
                    </aside>
                </div>
            </div>
        </div>
    );
}

function getReviewDialogModel(review: OpenReviewState): ReviewDialogModel {
    if (review.status === 'done') {
        return { audience: review.audience, confirmation: '', result: review.result, sending: false };
    }

    return {
        audience: review.audience,
        confirmation: review.confirmation,
        result: null,
        sending: review.status === 'sending',
    };
}

function ReviewSummary({
    subject,
    audience,
}: {
    subject: string;
    audience: ReviewDialogModel['audience'];
}) {
    const contactLabel = countLabel(audience.total, 'contact');
    const confirmedLabel = pluralWord(audience.total, 'confirmé');

    return (
        <dl className="grid gap-4 text-sm">
            <div>
                <dt className="text-xs text-muted-foreground">Sujet</dt>
                <dd className="mt-1 break-words font-medium text-foreground">{subject}</dd>
            </div>
            <div>
                <dt className="text-xs text-muted-foreground">Audience liée à la preuve</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{audience.total}</dd>
                <dd className="text-xs text-muted-foreground">
                    {contactLabel} {confirmedLabel}{audience.tag ? ` · tag ${audience.tag}` : ''}
                </dd>
            </div>
        </dl>
    );
}

function ReviewStatus({
    controller,
    model,
}: {
    controller: NewsletterComposerController;
    model: ReviewDialogModel;
}) {
    if (model.result) {
        return <DeliveryResult result={model.result} fallbackMessage={controller.state.feedback} />;
    }

    return (
        <Field>
            <FieldLabel htmlFor="newsletter-confirmation" required>Confirmation</FieldLabel>
            <Input
                id="newsletter-confirmation"
                value={model.confirmation}
                onChange={(event) => controller.setConfirmation(event.target.value)}
                placeholder="ENVOYER"
                autoComplete="off"
                disabled={model.sending}
            />
            <FieldDescription>Saisissez exactement <strong>ENVOYER</strong>.</FieldDescription>
        </Field>
    );
}

function ReviewActions({
    controller,
    model,
}: {
    controller: NewsletterComposerController;
    model: ReviewDialogModel;
}) {
    const closeLabel = model.result ? 'Fermer' : 'Annuler';
    return (
        <div className="grid gap-2">
            {!model.result ? (
                <Button
                    type="button"
                    variant="danger"
                    disabled={model.confirmation !== 'ENVOYER' || model.audience.total === 0}
                    loading={model.sending}
                    loadingLabel="Envoi global en cours"
                    onClick={controller.sendBulk}
                    leftIcon={<Send className="h-4 w-4" />}
                >
                    Envoyer à {countLabel(model.audience.total, 'contact')}
                </Button>
            ) : null}
            <Button type="button" variant="tertiary" disabled={model.sending} onClick={controller.closeReview}>
                {closeLabel}
            </Button>
        </div>
    );
}

const deliveryPresentations: Record<NewsletterCampaignBulkResponse['status'], { title: string; tone: string }> = {
    sent: { title: 'Envoi terminé', tone: 'border-success/25 bg-success/10' },
    partial: { title: 'Envoi partiel', tone: 'border-warning/30 bg-warning/10' },
    audience_changed: { title: 'Audience modifiée', tone: 'border-warning/30 bg-warning/10' },
    failed: { title: 'Envoi échoué', tone: 'border-danger/30 bg-danger/10' },
};

function DeliveryResult({ result, fallbackMessage }: { result: NewsletterCampaignBulkResponse; fallbackMessage: string }) {
    const presentation = deliveryPresentations[result.status];

    return (
        <div className={`rounded-2xl border p-4 ${presentation.tone}`} role="status" aria-live="polite">
            <div className="flex items-start gap-2">
                <DeliveryIcon status={result.status} />
                <div>
                    <p className="font-semibold text-foreground">{presentation.title}</p>
                    <DeliveryMetrics result={result} />
                    {result.status !== 'sent' && fallbackMessage ? <p className="mt-1 text-sm text-foreground">{fallbackMessage}</p> : null}
                </div>
            </div>
        </div>
    );
}

function DeliveryIcon({ status }: { status: NewsletterCampaignBulkResponse['status'] }) {
    if (status === 'sent') {
        return <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />;
    }

    const tone = status === 'failed' ? 'text-danger' : 'text-warning';
    return <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />;
}

function DeliveryMetrics({ result }: { result: NewsletterCampaignBulkResponse }) {
    if (result.status === 'audience_changed') {
        const alreadySent = result.sent > 0
            ? ` ${countLabel(result.sent, 'envoi')} déjà ${pluralWord(result.sent, 'traité')}.`
            : '';
        return (
            <p className="mt-1 text-sm text-muted-foreground">
                Snapshot testé : {result.total} · audience actuelle : {result.currentTotal ?? 'inconnue'}.
                {alreadySent}
            </p>
        );
    }

    return (
        <p className="mt-1 text-sm text-muted-foreground">
            {countLabel(result.sent, 'envoyé')} · {countLabel(result.failed, 'échec')} sur {result.total}.
        </p>
    );
}

function countLabel(count: number, singular: string) {
    return `${count} ${pluralWord(count, singular)}`;
}

function pluralWord(count: number, singular: string) {
    return `${singular}${count > 1 ? 's' : ''}`;
}

function buildPreviewDocument(content: string) {
    const csp = "default-src 'none'; img-src https: data:; style-src 'unsafe-inline'";
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${content}</body></html>`;
}
