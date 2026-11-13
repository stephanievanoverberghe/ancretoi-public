import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Eye, PencilLine, PlayCircle } from 'lucide-react';

import DeleteInspirationButton from './DeleteInspirationButton';
import { InspirationStatusBadge } from './InspirationStatusBadge';
import type { AdminInspirationRow } from './admin-inspirations.types';
import { formatInspirationRelativeDate, getInspirationVideoThumb } from './admin-inspirations.utils';

type AdminInspirationCardProps = {
    row: AdminInspirationRow;
    selectedTag: string;
    onTagToggle: (tag: string) => void;
    onPreview: (slug: string) => void;
};

export function AdminInspirationCard({ row, selectedTag, onTagToggle, onPreview }: AdminInspirationCardProps) {
    const thumb = getInspirationVideoThumb(row.videoUrl);

    return (
        <li className="group flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border border-border/80 bg-surface shadow-soft motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-elevated">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                {thumb.src ? (
                    <Image src={thumb.src} alt="" fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 320px" className="object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]" />
                ) : (
                    <>
                        <Image src="/images/administration/inspirations-studio.webp" alt="" fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 320px" className="object-cover opacity-60 saturate-75" />
                        <div className="absolute inset-0 grid place-items-center bg-background/20 text-foreground backdrop-blur-[1px]">
                            <PlayCircle className="h-10 w-10" aria-hidden="true" />
                        </div>
                    </>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-90 motion-safe:transition group-hover:opacity-100" />
                <div className="absolute right-2 top-2">
                    <InspirationStatusBadge status={row.status} />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Inspiration · /{row.slug}</div>
                <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">{row.title}</h3>

                {row.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.summary}</p>}

                {row.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {row.tags.slice(0, 4).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onTagToggle(tag)}
                                className={[
                                    'cursor-pointer rounded-full border px-2 py-1 text-xs motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                    selectedTag === tag ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface-muted text-muted-foreground hover:text-foreground',
                                ].join(' ')}
                                title={`Filtrer par: ${tag}`}
                            >
                                {tag}
                            </button>
                        ))}
                        {row.tags.length > 4 && <span className="text-xs text-muted-foreground">+{row.tags.length - 4}</span>}
                    </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                    maj {formatInspirationRelativeDate(row.timestamps.updatedAt)} • créé {formatInspirationRelativeDate(row.timestamps.createdAt)}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <Link
                        href={`/administration/inspirations/${row.slug}/modifier`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground motion-safe:transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        <PencilLine className="h-4 w-4" /> Éditer <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => onPreview(row.slug)}
                        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground motion-safe:transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        <Eye className="h-4 w-4" /> Aperçu
                    </button>

                    <div className="col-span-2 [&>button]:w-full">
                        <DeleteInspirationButton slug={row.slug} />
                    </div>
                </div>
            </div>
        </li>
    );
}
