import type { NewProgramFormShape } from './new-program-form.types';

export const DEFAULT: NewProgramFormShape = {
    slug: '',
    title: '',
    status: 'draft',
    level: 'Basique',
    durationDays: 7,
    estMinutesPerDay: 20,
    priceCents: 4700,
    marketing: {
        hero: { title: '' },
        benefits: [],
        faq: [],
        seo: {},
        objective: '',
        durationLabel: '',
        idealIf: '',
    },
    days: [],
};

export const TABS = ['identite', 'marketing', 'pedago', 'seo'] as const;
