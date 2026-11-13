import type { UseFormRegister } from 'react-hook-form';
import type { EditProgramFormShape } from './edit-program-form.types';
import { Card, InputPill, Label } from '../../editor/ProgramFormUi';

const fieldIds = {
    title: 'edit-program-seo-title',
    description: 'edit-program-seo-description',
    image: 'edit-program-seo-image',
};

export default function EditProgramSeoSection({ register }: { register: UseFormRegister<EditProgramFormShape> }) {
    return (
        <Card>
            <h2 className="font-semibold mb-3">SEO (facultatif)</h2>
            <div className="grid md:grid-cols-3 gap-3">
                <div>
                    <Label htmlFor={fieldIds.title}>SEO • Title</Label>
                    <InputPill id={fieldIds.title} {...register('marketing.seo.title')} />
                </div>
                <div>
                    <Label htmlFor={fieldIds.description}>SEO • Description</Label>
                    <InputPill id={fieldIds.description} {...register('marketing.seo.description')} />
                </div>
                <div>
                    <Label htmlFor={fieldIds.image}>SEO • Image</Label>
                    <InputPill id={fieldIds.image} {...register('marketing.seo.image')} />
                </div>
            </div>
        </Card>
    );
}
