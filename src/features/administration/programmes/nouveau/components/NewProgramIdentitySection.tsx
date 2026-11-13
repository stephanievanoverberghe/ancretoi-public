import type { UseFormRegister } from 'react-hook-form';
import type { NewProgramFormShape } from './new-program-form.types';
import { Card, InputPill, Label, SelectPill } from '../../editor/ProgramFormUi';

const fieldIds = {
    slug: 'new-program-slug',
    title: 'new-program-title',
    level: 'new-program-level',
    durationDays: 'new-program-duration-days',
    estMinutesPerDay: 'new-program-est-minutes-per-day',
    priceCents: 'new-program-price-cents',
};

export default function NewProgramIdentitySection({ register, onTitleBlur }: { register: UseFormRegister<NewProgramFormShape>; onTitleBlur: () => void }) {
    return (
        <Card>
            <h2 className="font-semibold mb-3">Identité & Prix</h2>
            <div className="grid md:grid-cols-3 gap-3">
                <div>
                    <Label htmlFor={fieldIds.slug} required>Slug</Label>
                    <InputPill id={fieldIds.slug} aria-required="true" {...register('slug', { required: true })} placeholder="reset-7" />
                </div>
                <div>
                    <Label htmlFor={fieldIds.title} required>Titre</Label>
                    <InputPill id={fieldIds.title} aria-required="true" {...register('title', { required: true })} onBlur={onTitleBlur} placeholder="RESET-7" />
                </div>
                <div>
                    <Label htmlFor={fieldIds.level}>Niveau</Label>
                    <SelectPill id={fieldIds.level} {...register('level')}>
                        <option>Basique</option>
                        <option>Cible</option>
                        <option>Premium</option>
                    </SelectPill>
                </div>
                <div>
                    <Label htmlFor={fieldIds.durationDays}>Jours</Label>
                    <InputPill id={fieldIds.durationDays} type="number" min={1} max={365} {...register('durationDays', { valueAsNumber: true })} />
                </div>
                <div>
                    <Label htmlFor={fieldIds.estMinutesPerDay}>Minutes / jour</Label>
                    <InputPill id={fieldIds.estMinutesPerDay} type="number" min={1} max={180} {...register('estMinutesPerDay', { valueAsNumber: true })} />
                </div>
                <div>
                    <Label htmlFor={fieldIds.priceCents}>Prix TTC (cents)</Label>
                    <InputPill id={fieldIds.priceCents} type="number" {...register('priceCents', { valueAsNumber: true })} placeholder="4700" />
                </div>
            </div>
        </Card>
    );
}
