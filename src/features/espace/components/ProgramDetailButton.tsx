'use client';

import { useCallback, useEffect, useMemo, useState, isValidElement, cloneElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, Gauge, Lock, PlayCircle } from 'lucide-react';

import { Badge } from '@/components/ui';
import { FullscreenModal } from '@/components/ui/overlays';

type Clickable = { onClick?: React.MouseEventHandler };

type Summary = {
    ok: true;
    programSlug: string;
    title: string;
    subtitle: string | null;
    coverUrl: string | null;
    coverAlt: string | null;
    total: number;
    currentDay: number;
    done: number;
    percent: number;
    status: 'active' | 'completed' | 'paused';
    level?: string | null;
    durationDays?: number | null;
    dailyLoadLabel?: string | null;
};

type PlanOk = { ok: true; days: Array<{ index: number; title?: string | null }> };
type PlanErr = { ok: false; error: string };
type PlanResp = PlanOk | PlanErr;

const pad2 = (n: number) => String(n).padStart(2, '0');
const isSummary = (x: unknown): x is Summary => typeof x === 'object' && x !== null && (x as { ok?: boolean }).ok === true;
const isPlanOk = (x: unknown): x is PlanOk => typeof x === 'object' && x !== null && (x as { ok?: boolean }).ok === true && Array.isArray((x as { days?: unknown }).days);
const normalizeSrc = (u: string | null) => (!u ? null : u.startsWith('http') || u.startsWith('data:') || u.startsWith('/') ? u : '/' + u.replace(/^public\//, ''));
const isDataUrl = (u: string | null) => !!u && u.startsWith('data:');

export function ProgramDetailButton({
    slug,
    label = 'Détails',
    trigger,
    className,
    returnTo,
}: {
    slug: string;
    label?: string;
    trigger?: React.ReactElement<Clickable>;
    className?: string;
    /** Chemin à rejoindre à la fermeture (facultatif). Si absent : on ferme juste. */
    returnTo?: string;
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [tab, setTab] = useState<'overview' | 'plan'>('overview');
    const [planLoading, setPlanLoading] = useState(false);
    const [plan, setPlan] = useState<PlanResp | null>(null);

    const loadSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const r = await fetch(`/api/programs/${encodeURIComponent(slug)}/summary`, { cache: 'no-store' });
            const j: unknown = await r.json();
            if (!r.ok || !isSummary(j)) throw new Error((j as { error?: string })?.error || 'Impossible de charger les détails pour le moment.');
            setSummary(j);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Réseau indisponible. Réessaie dans un instant.');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    const loadPlan = useCallback(async () => {
        if (planLoading || plan) return;
        setPlanLoading(true);
        try {
            const r = await fetch(`/api/programs/${encodeURIComponent(slug)}/plan?limit=10`, { cache: 'no-store' });
            const j: unknown = await r.json();
            if (!r.ok || !isPlanOk(j)) setPlan({ ok: false, error: (j as { error?: string })?.error || 'Plan indisponible.' });
            else setPlan(j);
        } catch {
            setPlan({ ok: false, error: 'Plan indisponible.' });
        } finally {
            setPlanLoading(false);
        }
    }, [slug, plan, planLoading]);

    useEffect(() => {
        if (open && !summary && !loading && !error) void loadSummary();
    }, [open, summary, loading, error, loadSummary]);

    useEffect(() => {
        if (open && tab === 'plan') void loadPlan();
    }, [open, tab, loadPlan]);

    const cta = useMemo(() => {
        if (!summary) return null;
        const isNew = summary.done === 0;
        const href = isNew ? `/espace/formations/${summary.programSlug}` : `/espace/formations/${summary.programSlug}/jour/${pad2(summary.currentDay)}`;
        return { href, label: isNew ? 'Commencer' : 'Continuer' };
    }, [summary]);

    const normalizedCover = normalizeSrc(summary?.coverUrl ?? null);
    const isCompleted = summary?.status === 'completed';

    const openModal = () => {
        setOpen(true);
        setTab('overview');
    };

    const handleClose = () => {
        setOpen(false);
        if (returnTo) router.push(returnTo);
    };

    let triggerNode: React.ReactNode = (
        <button
            type="button"
            onClick={openModal}
            className={
                className ??
                'inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface-muted'
            }
        >
            {label}
        </button>
    );

    if (trigger && isValidElement(trigger)) {
        triggerNode = cloneElement<Clickable>(trigger, { onClick: openModal });
    }

    return (
        <>
            {triggerNode}

            <FullscreenModal
                open={open}
                onClose={handleClose}
                title={summary ? summary.title : 'Détails du programme'}
                closeOnBackdrop
                closeOnEsc
                footer={
                    summary && cta ? (
                        <div className="flex w-full flex-wrap items-center justify-end gap-2">
                            {isCompleted ? (
                                <Link
                                    href={`/espace/formations/${summary.programSlug}/jour/01`}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-muted"
                                    onClick={() => setOpen(false)}
                                >
                                    Revisiter depuis le début
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setTab('plan')}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-muted"
                                >
                                    Voir le plan
                                </button>
                            )}
                            <Link
                                href={cta.href}
                                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary-hover"
                                onClick={() => setOpen(false)}
                            >
                                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                                {cta.label}
                            </Link>
                        </div>
                    ) : null
                }
            >
                {loading && (
                    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                        Chargement des détails…
                    </p>
                )}
                {error && (
                    <div role="alert" className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
                        <p>{error}</p>
                        <Link
                            href="/aide"
                            className="mt-2 inline-flex rounded-md px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-border transition hover:bg-surface-muted"
                            onClick={() => setOpen(false)}
                        >
                            Aller à l’aide
                        </Link>
                    </div>
                )}

                {!loading && !error && summary && (
                    <div className="space-y-4">
                        {/* En-tête visuel : cover + repères + progression. */}
                        <div className="overflow-hidden rounded-2xl border border-border">
                            <div className="relative h-36 w-full bg-surface-muted sm:h-44">
                                {normalizedCover ? (
                                    <Image
                                        src={normalizedCover}
                                        alt={summary.coverAlt ?? ''}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 672px"
                                        unoptimized={isDataUrl(normalizedCover)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">Aucune image</div>
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/15 to-transparent" aria-hidden="true" />
                                <div className="absolute left-3 top-3">
                                    <Badge variant={isCompleted ? 'success' : 'info'} className="bg-surface/90 backdrop-blur">
                                        {isCompleted ? 'Terminé' : summary.status === 'paused' ? 'En pause' : 'En cours'}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                                    {summary.level && (
                                        <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur">
                                            {summary.level}
                                        </span>
                                    )}
                                    {summary.durationDays ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                                            <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                            {summary.durationDays} jours
                                        </span>
                                    ) : null}
                                    {summary.dailyLoadLabel ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                                            <Gauge className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                            {summary.dailyLoadLabel}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="p-4">
                                {summary.subtitle ? <p className="text-sm leading-relaxed text-muted-foreground">{summary.subtitle}</p> : null}
                                <div
                                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={summary.percent}
                                >
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
                                        style={{ width: `${summary.percent}%` }}
                                    />
                                </div>
                                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {summary.done}/{summary.total} journées · {summary.percent}%
                                    </span>
                                    <span className="font-medium text-foreground">{isCompleted ? 'Terminé' : `Prochain · Jour ${pad2(summary.currentDay)}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Onglets Aperçu / Plan. */}
                        <div className="flex gap-1 rounded-lg border border-border bg-background p-1 text-sm">
                            <button
                                className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 transition-colors ${tab === 'overview' ? 'bg-surface font-medium ring-1 ring-border' : 'text-muted-foreground hover:bg-surface/70 hover:text-foreground'}`}
                                onClick={() => setTab('overview')}
                                type="button"
                            >
                                Aperçu
                            </button>
                            <button
                                className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 transition-colors ${tab === 'plan' ? 'bg-surface font-medium ring-1 ring-border' : 'text-muted-foreground hover:bg-surface/70 hover:text-foreground'}`}
                                onClick={() => setTab('plan')}
                                type="button"
                            >
                                Plan
                            </button>
                        </div>

                        {tab === 'overview' && (
                            <ul className="grid gap-2 text-sm sm:grid-cols-2">
                                <li className="rounded-xl border border-border bg-background p-3">
                                    <p className="font-medium text-foreground">Tu y gagneras</p>
                                    <p className="mt-1 leading-relaxed text-muted-foreground">Clarté, calme, constance — en ritualisant de courtes pratiques quotidiennes.</p>
                                </li>
                                <li className="rounded-xl border border-border bg-background p-3">
                                    <p className="font-medium text-foreground">Méthode</p>
                                    <p className="mt-1 leading-relaxed text-muted-foreground">Une journée à la fois : vidéo ou consigne, pratique guidée et journal.</p>
                                </li>
                            </ul>
                        )}

                        {tab === 'plan' && (
                            <div className="space-y-2">
                                {planLoading && (
                                    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                                        Chargement du plan…
                                    </p>
                                )}
                                {!planLoading && plan && plan.ok && plan.days.length > 0 ? (
                                    <ol className="grid gap-2">
                                        {plan.days.map((d) => {
                                            const isDayDone = isCompleted || d.index < summary.currentDay;
                                            const isCurrent = !isCompleted && d.index === summary.currentDay;
                                            const href = `/espace/formations/${summary.programSlug}/jour/${pad2(d.index)}`;
                                            const key = `${summary.programSlug}__${pad2(d.index)}__${d.title ?? ''}`;

                                            return (
                                                <li key={key}>
                                                    <Link
                                                        href={href}
                                                        onClick={() => setOpen(false)}
                                                        className={[
                                                            'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                                                            isCurrent
                                                                ? 'border-primary/30 bg-primary/10 text-foreground'
                                                                : 'border-border text-foreground hover:bg-surface-muted',
                                                        ].join(' ')}
                                                    >
                                                        <span
                                                            className={[
                                                                'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold',
                                                                isDayDone ? 'bg-success/10 text-success' : isCurrent ? 'bg-primary/15 text-primary' : 'bg-surface-muted text-muted-foreground',
                                                            ].join(' ')}
                                                            aria-hidden="true"
                                                        >
                                                            {isDayDone ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="font-medium">Jour {pad2(d.index)}</span>
                                                            {d.title ? <span className="ml-2 text-muted-foreground">{d.title}</span> : null}
                                                            {isCurrent ? <span className="ml-2 text-xs font-semibold text-primary">En cours</span> : null}
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                ) : !planLoading && plan && !plan.ok ? (
                                    <div role="status" className="rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
                                        <p>{plan.error}</p>
                                        <Link
                                            href="/aide"
                                            className="mt-2 inline-flex rounded-md px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-border transition hover:bg-surface-muted"
                                            onClick={() => setOpen(false)}
                                        >
                                            Aller à l’aide
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </FullscreenModal>
        </>
    );
}
