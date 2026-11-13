import Link from 'next/link';
import { Eye, PencilLine } from 'lucide-react';

import { Button } from '@/components/ui';

import type { AdminProgramRow } from './admin-programs-grid.types';
import { formatPrice } from './admin-programs-grid.utils';
import { LevelBadge, StatusBadge } from './ProgramBadges';

export default function AdminProgramsTableView({ rows, onPreview }: { rows: AdminProgramRow[]; onPreview: (slug: string) => void }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
            <table className="min-w-[58rem] w-full text-sm">
                <thead className="bg-surface-muted/70 text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                        <th scope="col" className="px-5 py-3 font-medium">Programme</th>
                        <th scope="col" className="px-4 py-3 font-medium">Statut</th>
                        <th scope="col" className="px-4 py-3 font-medium">Format</th>
                        <th scope="col" className="px-4 py-3 font-medium">Prix</th>
                        <th scope="col" className="px-4 py-3 font-medium">Unités</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.programSlug} className="border-b border-border last:border-0 hover:bg-surface-muted/45">
                            <td className="px-5 py-4">
                                <div className="max-w-sm font-semibold text-foreground">{row.title}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">/{row.programSlug}</div>
                            </td>
                            <td className="px-4 py-4"><StatusBadge s={row.status} /></td>
                            <td className="px-4 py-4 text-muted-foreground">
                                <div className="flex items-center gap-2"><LevelBadge level={row.meta.level} /></div>
                                <div className="mt-1 text-xs">{row.meta.durationDays ? `${row.meta.durationDays} jours` : 'Durée à préciser'}</div>
                            </td>
                            <td className="px-4 py-4 font-medium text-foreground">{formatPrice(row.price)}</td>
                            <td className="px-4 py-4 text-muted-foreground">{row.stats.unitsCount}</td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/administration/programmes/${row.programSlug}/modifier`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                                        <PencilLine className="h-4 w-4" aria-hidden="true" /> Éditer
                                    </Link>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => onPreview(row.programSlug)} leftIcon={<Eye className="h-4 w-4" />}>
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
