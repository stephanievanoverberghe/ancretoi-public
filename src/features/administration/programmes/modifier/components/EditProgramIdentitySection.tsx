import type { UseFormRegister } from 'react-hook-form';
import type { EditProgramFormShape } from './edit-program-form.types';
import { Card, InputPill, Label, SelectPill } from '../../editor/ProgramFormUi';

const fieldIds = {
    slug: 'edit-program-slug',
    title: 'edit-program-title',
    level: 'edit-program-level',
    durationDays: 'edit-program-duration-days',
    estMinutesPerDay: 'edit-program-est-minutes-per-day',
    priceCents: 'edit-program-price-cents',
};

export default function EditProgramIdentitySection({ register, onTitleBlur }: { register: UseFormRegister<EditProgramFormShape>; onTitleBlur: () => void }) {
    return (
        <Card>
            <h2 className="font-semibold mb-3">Identité & Prix</h2>
            <div className="grid md:grid-cols-3 gap-3">
                <div>
                    <Label htmlFor={fieldIds.slug} required>Slug</Label>
                    <InputPill id={fieldIds.slug} aria-required="true" aria-readonly="true" readOnly {...register('slug', { required: true })} placeholder="reset-7" />
                    <p className="mt-1 text-xs text-muted-foreground">Le slug reste fixe après la création afin de préserver les liens et les progressions.</p>
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
