'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImageIcon, Lock, PencilLine } from 'lucide-react';

import { FullscreenModal } from '@/components/ui/overlays';

import DeletePostButton from './DeletePostButton';
import type { AdminPostRow } from './admin-posts-grid.types';
import { formatRelative, getSeoOk } from './admin-posts-grid.utils';
import { FeatureBadge, SeoBadge, StatusBadge } from './PostBadges';

export default function AdminPostQuickViewModal({ open, onClose, row, categoryName }: { open: boolean; onClose: () => void; row: AdminPostRow | null; categoryName: string | null }) {
    if (!row) return null;
    return (
        <FullscreenModal open={open} onClose={onClose} title={`Aperçu · ${row.title}`}>
            <div className="space-y-6">
                <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-surface-muted">
                    {row.coverPath ? <Image src={row.coverPath} alt={row.title || 'Couverture'} fill sizes="(max-width: 768px) 100vw, 42rem" className="object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white"><div><p className="text-xs opacity-80">/{row.slug}</p><p className="font-display text-xl font-semibold">{row.title}</p></div><div className="flex gap-2">{row.featured ? <FeatureBadge /> : null}<StatusBadge s={row.status} /></div></div>
                </div>
                <div className="flex flex-wrap gap-2"><SeoBadge ok={getSeoOk(row)} />{categoryName ? <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground">Catégorie · {categoryName}</span> : null}</div>
                <p className="rounded-xl border border-border bg-surface-muted/45 p-4 text-sm leading-relaxed text-foreground">{row.summary || 'Aucun résumé.'}</p>
                <div className="flex flex-wrap gap-2">{row.tags.map((item) => <span key={item} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground">#{item}</span>)}</div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground"><span>Créé · {formatRelative(row.timestamps.createdAt)}</span><span>Mis à jour · {formatRelative(row.timestamps.updatedAt)}</span><span>Publié · {row.timestamps.publishedAt ? formatRelative(row.timestamps.publishedAt) : '—'}</span></div>
                <div className="grid gap-2 sm:grid-cols-2"><Link href={`/administration/articles/${row.slug}/modifier`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"><PencilLine className="h-4 w-4" /> Éditer</Link>{row.status === 'published' ? <Link href={`/blog/${row.slug}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted">Voir la page publique <ExternalLink className="h-4 w-4" /></Link> : <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Non publié</div>}</div>
                <div className="border-t border-border pt-4 [&>button]:w-full"><DeletePostButton slug={row.slug} afterDelete="refresh" label="Archiver" /></div>
            </div>
        </FullscreenModal>
    );
}
