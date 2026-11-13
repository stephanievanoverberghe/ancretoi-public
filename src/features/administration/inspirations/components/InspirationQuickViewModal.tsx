'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarClock, ExternalLink, Lock, PencilLine, PlayCircle, Tag } from 'lucide-react';

import { FullscreenModal } from '@/components/ui/overlays';

import { InspirationStatusBadge } from './InspirationStatusBadge';
import type { AdminInspirationRow } from './admin-inspirations.types';
import { formatInspirationRelativeDate, getInspirationVideoThumb } from './admin-inspirations.utils';

export function InspirationQuickViewModal({ open, onClose, row }: { open: boolean; onClose: () => void; row: AdminInspirationRow | null }) {
    if (!row) return null;
    const thumb = getInspirationVideoThumb(row.videoUrl);
    return (
        <FullscreenModal open={open} onClose={onClose} title={`Aperçu · ${row.title}`}>
            <div className="space-y-6">
                <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-surface-muted">
                    {thumb.src ? <Image src={thumb.src} alt={thumb.alt} fill sizes="(max-width: 768px) 100vw, 42rem" className="object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><PlayCircle className="h-11 w-11" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white"><div><p className="text-xs opacity-80">/{row.slug}</p><p className="font-display text-xl font-semibold">{row.title}</p></div><InspirationStatusBadge status={row.status} /></div>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-sm"><span className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarClock className="h-4 w-4" /> Créée</span><strong>{formatInspirationRelativeDate(row.timestamps.createdAt)}</strong></div>
                <p className="rounded-xl border border-border p-4 text-sm leading-relaxed">{row.summary || 'Aucun résumé.'}</p>
                <div className="flex flex-wrap items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />{row.tags.length ? row.tags.map((item) => <span key={item} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground">{item}</span>) : <span className="text-sm text-muted-foreground">Aucun tag</span>}</div>
                <div className="grid gap-2 sm:grid-cols-2"><Link href={`/administration/inspirations/${row.slug}/modifier`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"><PencilLine className="h-4 w-4" /> Éditer</Link>{row.status === 'published' ? <Link href={`/inspirations/${row.slug}`} target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted">Voir la page publique <ExternalLink className="h-4 w-4" /></Link> : <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Non publié</div>}</div>
            </div>
        </FullscreenModal>
    );
}
