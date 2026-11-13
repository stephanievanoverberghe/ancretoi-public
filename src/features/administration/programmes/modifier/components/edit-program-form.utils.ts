import type { EditProgramFormShape } from './edit-program-form.types';
import { slugify } from '../../editor/program-editor.utils';

export { slugify } from '../../editor/program-editor.utils';

function normalizeUrl(url?: string) {
    if (!url) return '';
    const value = url.trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (/^(\/\/)/.test(value)) return `https:${value}`;
    if (/^(youtu\.be|((www\.)?youtube\.com)|vimeo\.com)\//i.test(value)) return `https://${value}`;
    return value;
}

export function buildEditProgramDefaultValues(initialData: EditProgramFormShape): EditProgramFormShape {
    return {
        ...initialData,
        marketing: {
            hero: {
                title: initialData.marketing?.hero?.title ?? '',
                subtitle: initialData.marketing?.hero?.subtitle ?? '',
                ctaHref: initialData.marketing?.hero?.ctaHref ?? '',
                heroImage: initialData.marketing?.hero?.heroImage ?? '',
            },
            benefits: initialData.marketing?.benefits ?? [],
            faq: initialData.marketing?.faq ?? [],
            seo: initialData.marketing?.seo ?? {},
            objective: initialData.marketing?.objective ?? '',
            durationLabel: initialData.marketing?.durationLabel ?? '',
            idealIf: initialData.marketing?.idealIf ?? '',
        },
    };
}

export function buildEditProgramPayload(values: EditProgramFormShape): EditProgramFormShape {
    const nextSlug = slugify(values.slug);
    return {
        ...values,
        slug: nextSlug,
        days: (values.days ?? []).map((day) => ({ ...day, videoUrl: normalizeUrl(day.videoUrl) })),
    };
}
