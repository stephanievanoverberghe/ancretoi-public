export type Price = {
    amount_cents: number | null;
    currency: 'EUR' | 'USD' | (string & {});
    tax_included: boolean;
    compare_at_cents: number | null;
    stripe_price_id: string | null;
};

export type FaqItem = { q: string; a: string };

export type ProgramDetailFaqSection = {
    eyebrow: string;
    title: string;
    description: string;
};

export type ProgramDetailFinalCta = {
    eyebrow: string;
    title: string;
    description: string;
    purchase_label: string;
    free_label: string;
    unavailable_label: string;
    secondary_label: string;
    aside_title: string;
    aside_items: string[];
};

export type ProgramDetailOverviewCardKind = 'fit' | 'goals' | 'includes' | (string & {});

export type ProgramDetailOverviewCard = {
    kind: ProgramDetailOverviewCardKind;
    title: string;
    description: string;
    items: string[];
};

export type ProgramDetailOverview = {
    eyebrow: string;
    title: string;
    description: string;
    who_title: string;
    cards: ProgramDetailOverviewCard[];
    note: {
        title: string;
        description: string;
        cta_label: string;
    };
};

export type ProgramDetailInsideItemKind = 'steps' | 'practice' | 'journal' | 'resources' | 'access' | 'review' | 'direction' | 'integration' | (string & {});

export type ProgramDetailInsideItem = {
    kind: ProgramDetailInsideItemKind;
    title: string;
    description: string;
};

export type ProgramDetailInside = {
    eyebrow: string;
    title: string;
    description: string;
    items: ProgramDetailInsideItem[];
};

export type ProgramDetailPathSummaryKind = 'duration' | 'load' | 'rhythm' | (string & {});

export type ProgramDetailPathSummaryItem = {
    kind: ProgramDetailPathSummaryKind;
    label: string;
    value: string;
};

export type ProgramDetailPathStep = {
    label: string;
    title: string;
    description: string;
    focus?: string;
};

export type ProgramDetailPath = {
    eyebrow: string;
    title: string;
    description: string;
    summary: ProgramDetailPathSummaryItem[];
    steps: ProgramDetailPathStep[];
};

export type ProgramDetailOutcomesItem = {
    title: string;
    description: string;
};

export type ProgramDetailOutcomesSection = {
    eyebrow: string;
    title: string;
    description: string;
    items: ProgramDetailOutcomesItem[];
    note: string;
};

export type ProgramDetail = {
    who: string;
    goals: string[];
    includes: string[];
    prerequisites: string[];
    outcomes: string[];
    faq: FaqItem[];
    faq_section: ProgramDetailFaqSection;
    final_cta: ProgramDetailFinalCta;
    overview: ProgramDetailOverview;
    inside: ProgramDetailInside;
    path: ProgramDetailPath;
    outcomes_section: ProgramDetailOutcomesSection;
};

export type Program = {
    slug: string;
    title: string;
    tagline: string;
    duration_days: number;
    level: 'Basique' | 'Cible' | 'Premium' | (string & {});
    status: 'published' | 'draft' | 'archived' | (string & {});
    cover: string;
    price: Price;
    card_highlights: string[];
    detail: ProgramDetail;
};

export type InsideItem = { icon: string; label: string };

export type CompareRow = {
    slug: string;
    title: string;
    objectif: string;
    duree: string;
    charge: string;
    niveau: 'Basique' | 'Cible' | 'Premium' | (string & {});
    ideal_si: string;
    cta: string;
    status: 'draft' | 'preflight' | 'published';
};
