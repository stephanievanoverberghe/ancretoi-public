'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock3, ExternalLink, Layers3, Lock, PencilLine, Tag } from 'lucide-react';

import { FullscreenModal } from '@/components/ui/overlays';

import DeleteProgramButton from './DeleteProgramButton';
import type { AdminProgramRow } from './admin-programs-grid.types';
import { formatPrice } from './admin-programs-grid.utils';
import { LevelBadge, StatusBadge } from './ProgramBadges';

export default function AdminProgramQuickViewModal({ open, onClose, row }: { open: boolean; onClose: () => void; row: AdminProgramRow | null }) {
    if (!row) return null;
    const missing = [!row.coverUrl && 'couverture', row.price.amountCents == null && 'prix', !row.meta.durationDays && 'durée', !row.meta.estMinutesPerDay && 'charge quotidienne', !row.stats.unitsCount && 'contenu'].filter(Boolean) as string[];

    return (
        <FullscreenModal open={open} onClose={onClose} title={`Aperçu · ${row.title}`}>
            <div className="space-y-6">
                <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-surface-muted">
                    {row.coverUrl ? <Image src={row.coverUrl} alt={row.coverAlt ?? ''} fill sizes="(max-width: 768px) 100vw, 42rem" className="object-cover" /> : <div className="grid h-full place-items-center text-sm text-muted-foreground">Couverture à ajouter</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white"><div><p className="text-xs opacity-80">/{row.programSlug}</p><p className="font-display text-xl font-semibold">{row.title}</p></div><div className="flex gap-2"><StatusBadge s={row.status} /><LevelBadge level={row.meta.level} /></div></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-surface-muted p-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-4 w-4" /> Jours</span><strong>{row.meta.durationDays ?? '—'}</strong></div>
                    <div className="rounded-xl bg-surface-muted p-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-4 w-4" /> Min/jour</span><strong>{row.meta.estMinutesPerDay ?? '—'}</strong></div>
                    <div className="rounded-xl bg-surface-muted p-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Layers3 className="h-4 w-4" /> Unités</span><strong>{row.stats.unitsCount}</strong></div>
                    <div className="rounded-xl bg-surface-muted p-3"><span className="text-xs text-muted-foreground">Prix</span><strong className="block">{formatPrice(row.price)}</strong></div>
                </div>
                <div className="flex flex-wrap gap-2">{row.meta.tags.length ? row.meta.tags.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" />{item}</span>) : <span className="text-sm text-muted-foreground">Aucun tag</span>}</div>
                {missing.length ? <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground"><strong>À compléter :</strong> {missing.join(', ')}.</div> : null}
                <div className="grid gap-2 sm:grid-cols-2">
                    <Link href={`/administration/programmes/${row.programSlug}/modifier`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"><PencilLine className="h-4 w-4" /> Éditer</Link>
                    {row.status === 'published' ? <Link href={`/programmes/${row.programSlug}`} target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted">Voir la page publique <ExternalLink className="h-4 w-4" /></Link> : <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Non publié</div>}
                </div>
                <div className="border-t border-border pt-4 [&>button]:w-full"><DeleteProgramButton slug={row.programSlug} afterDelete="redirect" /></div>
            </div>
        </FullscreenModal>
    );
}
