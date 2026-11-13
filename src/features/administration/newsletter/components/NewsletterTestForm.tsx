'use client';

import { CheckCircle2, Eye, MailCheck } from 'lucide-react';

import { Button, Field, FieldDescription, FieldLabel, Input, Textarea } from '@/components/ui';

import type { NewsletterComposerController } from './useNewsletterComposer';

export function NewsletterTestForm({ controller }: { controller: NewsletterComposerController }) {
    const { fields, test, feedback } = controller.state;
    const testIsSending = test.status === 'sending';

    return (
        <form onSubmit={controller.sendTest} className="grid gap-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
                <div className="grid gap-4">
                    <Field>
                        <FieldLabel htmlFor="newsletter-subject" required>Sujet</FieldLabel>
                        <Input
                            id="newsletter-subject"
                            name="subject"
                            required
                            maxLength={200}
                            value={fields.subject}
                            onChange={(event) => controller.setField('subject', event.target.value)}
                            placeholder="Inspiration de la semaine ✨"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="newsletter-html" required>Contenu HTML</FieldLabel>
                        <Textarea
                            id="newsletter-html"
                            name="html"
                            required
                            rows={14}
                            value={fields.html}
                            onChange={(event) => controller.setField('html', event.target.value)}
                            placeholder="<h2>Bonjour</h2><p>Contenu...</p>"
                            className="font-mono"
                        />
                    </Field>
                </div>

                <aside className="rounded-2xl border border-border bg-surface-muted/50 p-4 sm:p-5" aria-labelledby="newsletter-safety-title">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Sécurité d’envoi</p>
                    <h3 id="newsletter-safety-title" className="mt-1 text-lg font-semibold text-foreground">Tester avant de diffuser</h3>
                    <p className="mt-2 text-sm text-muted-foreground">L’envoi global reste verrouillé tant que cette version du contenu et de l’audience n’a pas été testée.</p>
                    <div className="mt-5 grid gap-4">
                        <Field>
                            <FieldLabel htmlFor="newsletter-test-email" required>Email test</FieldLabel>
                            <Input
                                id="newsletter-test-email"
                                name="testEmail"
                                type="email"
                                required
                                maxLength={320}
                                value={fields.testEmail}
                                onChange={(event) => controller.setField('testEmail', event.target.value)}
                                placeholder="moi@example.com"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="newsletter-tag">Tag destinataire</FieldLabel>
                            <Input
                                id="newsletter-tag"
                                name="tag"
                                maxLength={64}
                                value={fields.tag}
                                onChange={(event) => controller.setField('tag', event.target.value)}
                                placeholder="Ex. vip"
                            />
                            <FieldDescription>Laissez vide pour cibler tous les contacts confirmés.</FieldDescription>
                        </Field>
                    </div>
                    <Button
                        type="submit"
                        className="mt-5 w-full"
                        loading={testIsSending}
                        loadingLabel="Envoi du test"
                        leftIcon={<MailCheck className="h-4 w-4" />}
                    >
                        Envoyer un test
                    </Button>
                </aside>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0" aria-live="polite">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {controller.testMatchesContent ? (
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        ) : (
                            <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
                        )}
                        {controller.testMatchesContent ? 'Version testée, prête pour la revue' : 'La revue se débloque après un test réussi'}
                    </p>
                    {feedback ? <p className={`mt-1 text-sm ${test.status === 'error' ? 'text-danger' : 'text-muted-foreground'}`}>{feedback}</p> : null}
                    {test.status === 'success' && !controller.testMatchesContent ? (
                        <p className="mt-1 text-xs text-warning">Le contenu ou le ciblage a changé : un nouveau test est requis.</p>
                    ) : null}
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    disabled={!controller.testMatchesContent}
                    onClick={controller.openReview}
                    leftIcon={<Eye className="h-4 w-4" />}
                >
                    Préparer l’envoi global
                </Button>
            </div>
        </form>
    );
}
