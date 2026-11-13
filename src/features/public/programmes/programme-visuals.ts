export type ProgrammeVisualIdentity = {
    index: string;
    labelClassName: string;
    washClassName: string;
    lineClassName: string;
    borderClassName: string;
    iconClassName: string;
};

const programmeVisuals = {
    'reset-7': {
        index: '01',
        labelClassName: 'border-secondary/25 bg-secondary/10 text-secondary',
        washClassName: 'from-secondary/24 via-secondary/8 to-transparent',
        lineClassName: 'bg-secondary',
        borderClassName: 'border-secondary',
        iconClassName: 'bg-secondary/12 text-secondary ring-secondary/20',
    },
    'boussole-10': {
        index: '02',
        labelClassName: 'border-primary/25 bg-primary/10 text-primary',
        washClassName: 'from-primary/24 via-primary/8 to-transparent',
        lineClassName: 'bg-primary',
        borderClassName: 'border-primary',
        iconClassName: 'bg-primary/12 text-primary ring-primary/20',
    },
    'ancrage-30': {
        index: '03',
        labelClassName: 'border-success/25 bg-success/10 text-success',
        washClassName: 'from-success/24 via-success/8 to-transparent',
        lineClassName: 'bg-success',
        borderClassName: 'border-success',
        iconClassName: 'bg-success/12 text-success ring-success/20',
    },
    'alchimie-90': {
        index: '04',
        labelClassName: 'border-accent/30 bg-accent/12 text-accent',
        washClassName: 'from-accent/24 via-accent/8 to-transparent',
        lineClassName: 'bg-accent',
        borderClassName: 'border-accent',
        iconClassName: 'bg-accent/12 text-accent ring-accent/20',
    },
} satisfies Record<string, ProgrammeVisualIdentity>;

const fallbackVisual: ProgrammeVisualIdentity = {
    index: 'AT',
    labelClassName: 'border-primary/25 bg-primary/10 text-primary',
    washClassName: 'from-primary/20 via-primary/5 to-transparent',
    lineClassName: 'bg-primary',
    borderClassName: 'border-primary',
    iconClassName: 'bg-primary/10 text-primary ring-primary/20',
};

export function getProgrammeVisualIdentity(slug?: string | null): ProgrammeVisualIdentity {
    if (!slug) return fallbackVisual;
    return programmeVisuals[slug as keyof typeof programmeVisuals] ?? fallbackVisual;
}
