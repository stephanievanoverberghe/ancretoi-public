import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, PencilLine, Tag as TagIcon } from 'lucide-react';

import DeleteCategoryButton from './DeleteCategoryButton';
import type { AdminCategoryRow } from './admin-categories.types';
import { formatCategoryRelativeDate } from './admin-categories.utils';

export function AdminCategoryCard({ row }: { row: AdminCategoryRow }) {
    return (
        <li className="group flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border border-border/80 bg-surface p-4 shadow-soft motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-elevated">
            <div className="flex items-start gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-muted">
                    {row.imagePath ? <Image src={row.imagePath} alt={row.imageAlt || ''} fill className="object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.035]" sizes="96px" /> : <div className="grid h-full place-items-center text-white" style={{ background: row.color ? `linear-gradient(135deg, ${row.color}, color-mix(in srgb, ${row.color} 55%, black))` : 'linear-gradient(135deg, var(--primary), var(--secondary))' }}><TagIcon className="h-7 w-7" aria-hidden="true" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">/{row.slug}</p><h3 className="mt-1 truncate font-display text-xl font-semibold text-foreground">{row.name}</h3></div>{row.color ? <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: row.color }} title={row.color} /> : null}</div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{row.description || 'Aucune description.'}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl bg-surface-muted py-3 text-center text-xs"><div><strong className="block text-base text-foreground">{row.usage.posts}</strong><span className="text-muted-foreground">articles</span></div><div><strong className="block text-sm text-foreground">{formatCategoryRelativeDate(row.timestamps.createdAt)}</strong><span className="text-muted-foreground">créée</span></div><div><strong className="block text-sm text-foreground">{formatCategoryRelativeDate(row.timestamps.updatedAt)}</strong><span className="text-muted-foreground">mise à jour</span></div></div>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-4"><Link href={`/administration/categories/${row.slug}/modifier`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><PencilLine className="h-4 w-4" /> Éditer <ArrowUpRight className="h-3.5 w-3.5" /></Link><DeleteCategoryButton slug={row.slug} afterDelete="redirect" redirectTo="/administration/categories" className="w-full justify-center" /></div>
        </li>
    );
}
