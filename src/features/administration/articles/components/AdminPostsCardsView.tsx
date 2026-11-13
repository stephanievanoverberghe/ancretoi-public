import Image from 'next/image';
import Link from 'next/link';
import { Eye, ImageIcon, Lock, PencilLine } from 'lucide-react';
import DeletePostButton from './DeletePostButton';
import type { AdminPostRow } from './admin-posts-grid.types';
import { formatRelative, getCategoryName, getSeoOk } from './admin-posts-grid.utils';
import { FeatureBadge, SeoBadge, StatusBadge } from './PostBadges';

export default function AdminPostsCardsView({ items, catNameBySlug, onQuick }: { items: AdminPostRow[]; catNameBySlug: Map<string, string>; onQuick: (slug: string) => void }) {
    return (
        <ul className="grid grid-cols-1 gap-5 @min-[40rem]/admin-collection:grid-cols-2 @min-[72rem]/admin-collection:grid-cols-3">
            {items.map((row) => {
                const category = getCategoryName(row, catNameBySlug);
                const seoOk = getSeoOk(row);
                return (
                    <li key={row.id} className="group flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border border-border/80 bg-surface shadow-soft motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-elevated">
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                            {row.coverPath ? (
                                <Image
                                    src={row.coverPath}
                                    alt={row.coverAlt || ''}
                                    fill
                                    className="object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]"
                                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                                />
                            ) : (
                                <>
                                    <Image src="/images/administration/editorial-studio.webp" alt="" fill className="object-cover opacity-60 saturate-75" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                                    <div className="absolute inset-0 grid place-items-center bg-background/20 text-foreground backdrop-blur-[1px]">
                                        <ImageIcon className="h-10 w-10" aria-hidden="true" />
                                    </div>
                                </>
                            )}
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                                {row.featured && <FeatureBadge />}
                                <StatusBadge s={row.status} />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                            <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Article · /{row.slug}</div>
                            <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">{row.title}</h3>
                            {row.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.summary}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {category && <span className="rounded-full border border-border bg-surface-muted px-2 py-1 text-xs">Catégorie : {category}</span>}
                                <SeoBadge ok={seoOk} />
                            </div>

                            {row.tags?.length ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {row.tags.map((tag) => (
                                        <span
                                            key={`${row.id}-${tag}`}
                                            className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-1 text-xs text-muted-foreground"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}

                            <div className="mt-2 text-xs text-muted-foreground">
                                maj {formatRelative(row.timestamps.updatedAt)} • créé {formatRelative(row.timestamps.createdAt)}
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                                <Link
                                    href={`/administration/articles/${row.slug}/modifier`}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground motion-safe:transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                >
                                    <PencilLine className="h-4 w-4" /> Éditer
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => onQuick(row.slug)}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground motion-safe:transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                >
                                    <Eye className="h-4 w-4" /> Aperçu
                                </button>

                                <DeletePostButton slug={row.slug} className="col-span-2 w-full justify-center" afterDelete="refresh" label="Supprimer" />

                                {row.status === 'draft' && (
                                    <div className="col-span-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
                                        <Lock className="h-4 w-4" /> Non publié
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
