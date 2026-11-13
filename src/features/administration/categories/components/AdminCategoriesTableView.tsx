import Image from 'next/image';
import Link from 'next/link';
import { PencilLine, Tag as TagIcon } from 'lucide-react';

import DeleteCategoryButton from './DeleteCategoryButton';
import type { AdminCategoryRow } from './admin-categories.types';
import { formatCategoryRelativeDate } from './admin-categories.utils';

type AdminCategoriesTableViewProps = {
    rows: AdminCategoryRow[];
};

export function AdminCategoriesTableView({ rows }: AdminCategoriesTableViewProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-soft">
            <table className="min-w-full table-fixed text-sm">
                <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[18%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[8%]" />
                </colgroup>

                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                    <tr className="border-b">
                        <th scope="col" className="px-4 py-3 font-medium">Catégorie</th>
                        <th scope="col" className="px-4 py-3 font-medium">Articles</th>
                        <th scope="col" className="px-4 py-3 font-medium">Créée</th>
                        <th scope="col" className="px-4 py-3 font-medium">Mise à jour</th>
                        <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                                        {row.imagePath ? (
                                            <Image src={row.imagePath} alt={row.imageAlt || row.name} fill className="object-cover" sizes="64px" />
                                        ) : (
                                            <div
                                                className="grid h-full w-full place-items-center text-xs text-white"
                                                style={{
                                                    background: row.color
                                                        ? `linear-gradient(135deg, ${row.color} 0%, rgba(0,0,0,0.35) 100%)`
                                                        : 'linear-gradient(135deg, #c7d2fe 0%, #fbcfe8 100%)',
                                                }}
                                                title={row.name}
                                            >
                                                <TagIcon className="h-4 w-4 opacity-90" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium">{row.name}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm">{row.usage.posts}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{formatCategoryRelativeDate(row.timestamps.createdAt)}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{formatCategoryRelativeDate(row.timestamps.updatedAt)}</td>

                            <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/administration/categories/${row.slug}/modifier`}
                                        className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-1 text-sm motion-safe:transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        title="Éditer"
                                    >
                                        <PencilLine className="h-3.5 w-3.5" />
                                        <span className="hidden 2xl:inline">Éditer</span>
                                    </Link>
                                    <DeleteCategoryButton slug={row.slug} afterDelete="redirect" redirectTo="/administration/categories" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
