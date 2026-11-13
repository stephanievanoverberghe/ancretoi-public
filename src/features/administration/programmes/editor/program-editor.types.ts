export type ProgramLevel = 'Basique' | 'Cible' | 'Premium';

export type ProgramDayBlock = {
    title: string;
    videoUrl: string;
    mantra?: string;
    description?: string;
    status: 'draft' | 'published';
};

export type ProgramBenefit = { icon?: string; title: string; text: string };
export type ProgramQuestionAnswer = { q: string; a: string };

export type ProgramMarketing = {
    hero: { title: string; subtitle?: string; ctaHref?: string; heroImage?: string };
    benefits: ProgramBenefit[];
    faq?: ProgramQuestionAnswer[];
    seo?: { title?: string; description?: string; image?: string };
    objective?: string;
    durationLabel?: string;
    idealIf?: string;
};

export type ProgramFormShape = {
    slug: string;
    title: string;
    status: 'draft' | 'preflight' | 'published';
    level: ProgramLevel;
    durationDays: number;
    estMinutesPerDay: number;
    priceCents?: number | null;
    marketing: ProgramMarketing;
    days: ProgramDayBlock[];
};

export type ProgramEditorTab = 'identite' | 'marketing' | 'pedago' | 'seo';
export type ProgramEditorMode = 'create' | 'edit';
