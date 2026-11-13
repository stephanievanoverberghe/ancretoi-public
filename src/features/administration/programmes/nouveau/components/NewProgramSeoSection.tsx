import type { UseFormRegister } from 'react-hook-form';
import type { NewProgramFormShape } from './new-program-form.types';
import { Card, InputPill, Label } from '../../editor/ProgramFormUi';

const fieldIds = {
    title: 'new-program-seo-title',
    description: 'new-program-seo-description',
    image: 'new-program-seo-image',
};

export default function NewProgramSeoSection({ register }: { register: UseFormRegister<NewProgramFormShape> }) {
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
