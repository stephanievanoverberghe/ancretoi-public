import Link from 'next/link';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import DeletePostButton from './DeletePostButton';
import type { AdminPostRow } from './admin-posts-grid.types';
import { formatRelative, getCategoryName, getSeoOk } from './admin-posts-grid.utils';
import { FeatureBadge, SeoBadge, StatusBadge } from './PostBadges';

export default function AdminPostsTableView({ items, catNameBySlug, onQuick }: { items: AdminPostRow[]; catNameBySlug: Map<string, string>; onQuick: (slug: string) => void }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-soft">
            <table className="min-w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                    <tr className="border-b">
                        <th scope="col" className="px-4 py-3 font-medium">Titre</th>
                        <th scope="col" className="px-4 py-3 font-medium">Catégorie</th>
                        <th scope="col" className="px-4 py-3 font-medium">Statut</th>
                        <th scope="col" className="px-4 py-3 font-medium">Mise à jour</th>
                        <th scope="col" className="px-4 py-3 font-medium">SEO</th>
                        <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((row) => {
                        const category = getCategoryName(row, catNameBySlug) || '—';
                        const seoOk = getSeoOk(row);
                        return (
                            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                                <td className="px-4 py-3">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">{row.title || row.slug}</div>
                                        <div className="text-xs text-muted-foreground sm:hidden">/{row.slug}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{category}</td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <StatusBadge s={row.status} />
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{formatRelative(row.timestamps.updatedAt)}</td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <SeoBadge ok={seoOk} />{' '}
                                    {row.featured && (
                                        <span className="ml-1 align-middle">
                                            <FeatureBadge />
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            href={`/administration/articles/${row.slug}/modifier`}
                                            title="Éditer"
                                            aria-label="Éditer"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground motion-safe:transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            <PencilLine className="h-4 w-4" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => onQuick(row.slug)}
                                            title="Aperçu"
                                            aria-label="Aperçu"
                                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground motion-safe:transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>

                                        <div className="relative">
                                            <DeletePostButton
                                                slug={row.slug}
                                                afterDelete="refresh"
                                                label="Supprimer"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-transparent motion-safe:transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/30"
                                            />
                                            <span className="pointer-events-none absolute inset-0 grid place-items-center">
                                                <Trash2 className="h-4 w-4 text-foreground" />
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
