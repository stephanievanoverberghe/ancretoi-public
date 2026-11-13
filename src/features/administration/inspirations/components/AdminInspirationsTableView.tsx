import Link from 'next/link';
import { Eye, PencilLine, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui';

import { InspirationStatusBadge } from './InspirationStatusBadge';
import type { AdminInspirationRow } from './admin-inspirations.types';
import { formatInspirationRelativeDate } from './admin-inspirations.utils';

export function AdminInspirationsTableView({ rows, onPreview }: { rows: AdminInspirationRow[]; onPreview: (slug: string) => void }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
            <table className="min-w-[56rem] w-full text-sm">
                <thead className="bg-surface-muted/70 text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                        <th scope="col" className="px-5 py-3 font-medium">Inspiration</th>
                        <th scope="col" className="px-4 py-3 font-medium">Statut</th>
                        <th scope="col" className="px-4 py-3 font-medium">Tags</th>
                        <th scope="col" className="px-4 py-3 font-medium">Mise à jour</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-muted/45">
                            <td className="px-5 py-4">
                                <div className="flex items-start gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><PlayCircle className="h-5 w-5" aria-hidden="true" /></span>
                                    <div className="min-w-0">
                                        <div className="max-w-sm truncate font-semibold text-foreground">{row.title}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">/{row.slug}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4"><InspirationStatusBadge status={row.status} /></td>
                            <td className="max-w-xs px-4 py-4 text-muted-foreground">{row.tags.slice(0, 3).join(', ') || '—'}</td>
                            <td className="px-4 py-4 text-muted-foreground">{formatInspirationRelativeDate(row.timestamps.updatedAt)}</td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/administration/inspirations/${row.slug}/modifier`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                                        <PencilLine className="h-4 w-4" aria-hidden="true" /> Éditer
                                    </Link>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => onPreview(row.slug)} leftIcon={<Eye className="h-4 w-4" />}>
                                        Aperçu
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
