import type { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { routeBuilders } from '@/config/routes';
import type { ProgramFormShape } from './program-editor.types';
import { Button, Card, Help, InputPill, Label, TextareaSoft } from './ProgramFormUi';

type ProgramMarketingSectionProps = {
    idPrefix: string;
    register: UseFormRegister<ProgramFormShape>;
    benefits: UseFieldArrayReturn<ProgramFormShape, 'marketing.benefits', 'id'>;
    faq: UseFieldArrayReturn<ProgramFormShape, 'marketing.faq', 'id'>;
};

const reset7CtaPlaceholder = `${routeBuilders.programme('reset-7')}#commencer`;

export default function ProgramMarketingSection({ idPrefix, register, benefits, faq }: ProgramMarketingSectionProps) {
    const fieldIds = {
        heroTitle: `${idPrefix}-hero-title`,
        heroCtaHref: `${idPrefix}-hero-cta-href`,
        heroSubtitle: `${idPrefix}-hero-subtitle`,
        heroImage: `${idPrefix}-hero-image`,
        objective: `${idPrefix}-objective`,
        durationLabel: `${idPrefix}-duration-label`,
        durationLabelHelp: `${idPrefix}-duration-label-help`,
        idealIf: `${idPrefix}-ideal-if`,
    };

    return (
        <Card>
            <h2 className="font-semibold mb-3">Marketing</h2>

            <div className="grid md:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor={fieldIds.heroTitle} required>Hero • Titre</Label>
                    <InputPill id={fieldIds.heroTitle} aria-required="true" {...register('marketing.hero.title', { required: true })} placeholder="7 jours pour..." />
                </div>
                <div>
                    <Label htmlFor={fieldIds.heroCtaHref}>Hero • CTA href</Label>
                    <InputPill id={fieldIds.heroCtaHref} {...register('marketing.hero.ctaHref')} placeholder={reset7CtaPlaceholder} />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor={fieldIds.heroSubtitle}>Hero • Sous-titre</Label>
                    <TextareaSoft id={fieldIds.heroSubtitle} {...register('marketing.hero.subtitle')} placeholder="L’accroche qui donne envie." />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor={fieldIds.heroImage}>Hero • Image URL</Label>
                    <InputPill id={fieldIds.heroImage} {...register('marketing.hero.heroImage')} placeholder="/images/hero.jpg" />
                </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <Label htmlFor={fieldIds.objective}>Objectif du programme</Label>
                    <TextareaSoft id={fieldIds.objective} {...register('marketing.objective')} placeholder="Ex. Retrouver clarté, énergie et limites saines en 7 jours…" />
                </div>
                <div>
                    <Label htmlFor={fieldIds.durationLabel}>Durée (libellé affiché)</Label>
                    <InputPill id={fieldIds.durationLabel} aria-describedby={fieldIds.durationLabelHelp} {...register('marketing.durationLabel')} placeholder="7 jours • 20–30 min/j" />
                    <Help id={fieldIds.durationLabelHelp}>Laisse vide pour déduire depuis “Jours” + “Minutes/jour”.</Help>
                </div>
                <div>
                    <Label htmlFor={fieldIds.idealIf}>Idéal si…</Label>
                    <TextareaSoft id={fieldIds.idealIf} {...register('marketing.idealIf')} placeholder="Tu te sens épuisée, tu n’arrives plus à dire non, tu veux reprendre souffle…" />
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">Bénéfices (max 3)</div>
                    {benefits.fields.length < 3 && (
                        <Button type="button" variant="secondary" onClick={() => benefits.append({ title: '', text: '' })}>
                            + Ajouter
                        </Button>
                    )}
                </div>
                {benefits.fields.length === 0 && <div className="mt-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Ajoute 1 à 3 bénéfices clés.</div>}
                <ul className="mt-2 space-y-2">
                    {benefits.fields.map((field, index) => (
                        <li key={field.id} className="grid md:grid-cols-3 gap-2 border rounded-xl p-3">
                            <InputPill aria-label={`Icône du bénéfice ${index + 1}`} placeholder="✨" {...register(`marketing.benefits.${index}.icon`)} />
                            <InputPill aria-label={`Titre du bénéfice ${index + 1}`} aria-required="true" placeholder="Titre" {...register(`marketing.benefits.${index}.title`, { required: true })} />
                            <InputPill aria-label={`Texte du bénéfice ${index + 1}`} aria-required="true" placeholder="Texte" {...register(`marketing.benefits.${index}.text`, { required: true })} />
                            <div className="md:col-span-3 flex justify-end">
                                <Button type="button" variant="ghost" aria-label={`Supprimer le bénéfice ${index + 1}`} onClick={() => benefits.remove(index)}>
                                    Supprimer
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">FAQ (optionnelle)</div>
                    <Button type="button" variant="secondary" onClick={() => faq.append({ q: '', a: '' })}>
                        + Ajouter
                    </Button>
                </div>
                {faq.fields.length === 0 && <div className="mt-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Ajoute des réponses aux objections si besoin.</div>}
                <ul className="mt-2 space-y-2">
                    {faq.fields.map((field, index) => (
                        <li key={field.id} className="grid md:grid-cols-2 gap-2 border rounded-xl p-3">
                            <InputPill aria-label={`Question FAQ ${index + 1}`} aria-required="true" placeholder="Question" {...register(`marketing.faq.${index}.q`, { required: true })} />
                            <InputPill aria-label={`Réponse FAQ ${index + 1}`} aria-required="true" placeholder="Réponse" {...register(`marketing.faq.${index}.a`, { required: true })} />
                            <div className="md:col-span-2 flex justify-end">
                                <Button type="button" variant="ghost" aria-label={`Supprimer la FAQ ${index + 1}`} onClick={() => faq.remove(index)}>
                                    Supprimer
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
}
