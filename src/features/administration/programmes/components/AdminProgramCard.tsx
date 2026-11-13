import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock3, Eye, Layers3, PencilLine } from 'lucide-react';

import DeleteProgramButton from './DeleteProgramButton';
import type { AdminProgramRow } from './admin-programs-grid.types';
import { formatPrice } from './admin-programs-grid.utils';
import { LevelBadge, StatusBadge } from './ProgramBadges';

export default function AdminProgramCard({ row, onPreview }: { row: AdminProgramRow; onPreview: (slug: string) => void }) {
    const missing = [!row.coverUrl && 'couverture', row.price.amountCents == null && 'prix', !row.meta.durationDays && 'durée', !row.stats.unitsCount && 'contenu'].filter(Boolean) as string[];

    return (
        <li className="group flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border border-border/80 bg-surface shadow-soft motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-elevated">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                {row.coverUrl ? (
                    <Image src={row.coverUrl} alt={row.coverAlt ?? ''} fill sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 30vw" className="object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]" />
                ) : (
                    <>
                        <Image src="/images/administration/programmes-studio.webp" alt="" fill sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 30vw" className="object-cover opacity-65 saturate-75" />
                        <div className="absolute inset-0 grid place-items-center bg-background/25 text-sm font-medium text-foreground backdrop-blur-[1px]">Couverture à ajouter</div>
                    </>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent opacity-90" />
                <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1"><StatusBadge s={row.status} /><LevelBadge level={row.meta.level} /></div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Programme · {row.programSlug}</div>
                <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">{row.title}</h3>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-surface-muted px-3 py-2"><span className="block text-xs text-muted-foreground">Prix</span><strong className="font-semibold text-foreground">{formatPrice(row.price)}</strong></div>
                    <div className="rounded-xl bg-surface-muted px-3 py-2"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Durée</span><strong className="font-semibold text-foreground">{row.meta.durationDays ? `${row.meta.durationDays} j` : '—'}</strong></div>
                    <div className="rounded-xl bg-surface-muted px-3 py-2"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Layers3 className="h-3.5 w-3.5" aria-hidden="true" /> Unités</span><strong className="font-semibold text-foreground">{row.stats.unitsCount}</strong></div>
                </div>
                {missing.length ? (
                    <p className="mt-3 inline-flex items-start gap-2 text-xs font-medium text-foreground">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                        <span>À compléter : {missing.join(', ')}</span>
                    </p>
                ) : (
                    <p className="mt-3 text-xs font-medium text-success">Prêt pour la diffusion</p>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <Link href={`/administration/programmes/${row.programSlug}/modifier`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground motion-safe:transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        <PencilLine className="h-4 w-4" aria-hidden="true" /> Éditer <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <button type="button" onClick={() => onPreview(row.programSlug)} className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground motion-safe:transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><Eye className="h-4 w-4" aria-hidden="true" /> Aperçu</button>
                    <div className="col-span-2 [&>button]:w-full"><DeleteProgramButton slug={row.programSlug} afterDelete="redirect" /></div>
                </div>
            </div>
        </li>
    );
}
