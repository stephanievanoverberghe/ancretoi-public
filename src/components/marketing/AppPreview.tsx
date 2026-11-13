import { BarChart3, BookOpenCheck, CheckCircle2, Home, NotebookPen, PlayCircle, Sparkles } from 'lucide-react';

import { AnimatedBar, AnimatedNumber } from '@/components/motion';
import { cn } from '@/lib/cn';

export type AppPreviewVariant = 'dashboard' | 'day' | 'journal' | 'bilan';

/** Données réelles optionnelles pour personnaliser la variante dashboard. */
export type AppPreviewDashboardData = {
    greeting?: string;
    headline?: string;
    percent?: number;
    secondaryLabel?: string;
    secondaryValue?: string;
    secondaryHint?: string;
    ctaLabel?: string;
};

export type AppPreviewProps = {
    variant: AppPreviewVariant;
    /** Personnalise la variante dashboard (aperçu réel d'un apprenant connecté). */
    dashboardData?: AppPreviewDashboardData;
    className?: string;
};

const defaultDashboardData: Required<AppPreviewDashboardData> = {
    greeting: 'Bonjour',
    headline: 'Reprendre RESET-7 · Jour 3',
    percent: 43,
    secondaryLabel: 'Série',
    secondaryValue: '3 jours',
    secondaryHint: 'Rythme tenu',
    ctaLabel: 'Reprendre',
};

function DashboardPreview({ data }: { data?: AppPreviewDashboardData }) {
    const d = { ...defaultDashboardData, ...data };

    return (
        <div className="flex h-full gap-3 p-4">
            <div className="hidden w-24 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-surface p-2 sm:flex" aria-hidden="true">
                {[
                    { icon: Home, label: 'Accueil', active: true },
                    { icon: BookOpenCheck, label: 'Formations', active: false },
                    { icon: NotebookPen, label: 'Journal', active: false },
                    { icon: BarChart3, label: 'Bilan', active: false },
                ].map(({ icon: Icon, label, active }) => (
                    <span
                        key={label}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium',
                            active ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                        )}
                    >
                        <Icon className="h-3 w-3 shrink-0" />
                        {label}
                    </span>
                ))}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{d.greeting}</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{d.headline}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-surface p-2.5">
                        <p className="text-[10px] text-muted-foreground">Progression</p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                            <AnimatedNumber value={d.percent} suffix="%" />
                        </p>
                        <AnimatedBar percent={d.percent} className="mt-1.5" barClassName="bg-gradient-to-r from-primary to-secondary" />
                    </div>
                    <div className="rounded-xl border border-border bg-surface p-2.5">
                        <p className="text-[10px] text-muted-foreground">{d.secondaryLabel}</p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">{d.secondaryValue}</p>
                        <p className="mt-1 text-[10px] text-success">{d.secondaryHint}</p>
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 p-2.5">
                    <span className="text-xs font-medium text-foreground">Prochaine étape prête</span>
                    <span className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">{d.ctaLabel}</span>
                </div>
            </div>
        </div>
    );
}

function DayPreview() {
    return (
        <div className="flex h-full flex-col gap-3 p-4">
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-foreground/90">
                <div className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-background/90 text-primary shadow-elevated">
                        <PlayCircle className="h-6 w-6" aria-hidden="true" />
                    </span>
                </div>
                <div className="absolute inset-x-3 bottom-3">
                    <div className="h-1 overflow-hidden rounded-full bg-background/30">
                        <div className="h-full w-1/3 rounded-full bg-background/90" />
                    </div>
                </div>
            </div>
            <div className="grid gap-1.5">
                {[
                    { label: 'Vidéo du jour', done: true },
                    { label: 'Pratique guidée · 10 min', done: false },
                    { label: 'Journal du jour', done: false },
                ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-2">
                        <CheckCircle2 className={cn('h-3.5 w-3.5 shrink-0', done ? 'text-success' : 'text-border')} aria-hidden="true" />
                        <span className="truncate text-xs font-medium text-foreground">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function JournalPreview() {
    return (
        <div className="flex h-full flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">Journal · Jour 3</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ce que je ressens</p>
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                    <div className="h-1.5 w-full rounded-full bg-surface-muted" />
                    <div className="h-1.5 w-4/5 rounded-full bg-surface-muted" />
                    <div className="h-1.5 w-3/5 rounded-full bg-surface-muted" />
                </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mon intention du jour</p>
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                    <div className="h-1.5 w-full rounded-full bg-surface-muted" />
                    <div className="h-1.5 w-2/3 rounded-full bg-surface-muted" />
                </div>
            </div>
            <div className="mt-auto flex justify-end">
                <span className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground">Enregistrer</span>
            </div>
        </div>
    );
}

function BilanPreview() {
    const bars = [35, 55, 45, 70, 60, 85, 92];

    return (
        <div className="flex h-full flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">Bilan de parcours</p>
            </div>
            <div className="flex flex-1 items-end justify-between gap-1.5 rounded-xl border border-border bg-surface p-3" aria-hidden="true">
                {bars.map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-secondary/70" style={{ height: `${height}%` }} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-surface p-2.5 text-center">
                    <p className="text-sm font-semibold text-foreground">7/7</p>
                    <p className="text-[10px] text-muted-foreground">journées suivies</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-2.5 text-center">
                    <p className="text-sm font-semibold text-foreground">+ clair</p>
                    <p className="text-[10px] text-muted-foreground">prochain pas choisi</p>
                </div>
            </div>
        </div>
    );
}

const previews = {
    day: DayPreview,
    journal: JournalPreview,
    bilan: BilanPreview,
} as const;

/**
 * Aperçu stylisé de l'espace apprenant, dessiné en CSS avec les tokens du
 * thème. Illustratif par défaut ; la variante dashboard peut afficher les
 * vraies données d'un apprenant connecté via `dashboardData`.
 */
export function AppPreview({ variant, dashboardData, className }: AppPreviewProps) {
    const Preview = variant === 'dashboard' ? null : previews[variant];

    return (
        <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-elevated', className)}>
            <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-danger/50" />
                <span className="h-2 w-2 rounded-full bg-warning/50" />
                <span className="h-2 w-2 rounded-full bg-success/50" />
                <span className="ml-2 truncate rounded-md bg-surface-muted px-2 py-0.5 text-[10px] text-muted-foreground">ancre-toi.fr/espace</span>
            </div>
            <div className="grid min-h-0 flex-1">{variant === 'dashboard' ? <DashboardPreview data={dashboardData} /> : Preview ? <Preview /> : null}</div>
        </div>
    );
}
