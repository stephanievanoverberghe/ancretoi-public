import Image from 'next/image';
import type { EnrollmentRowClient, UserStats } from './user-tabs.types';
import { Card, SectionTitle } from './UserTabsPrimitives';

type Props = {
    idBase: string;
    enrolls: EnrollmentRowClient[];
    stats: UserStats;
    hidden: boolean;
};

const statusChips = (stats: UserStats) => [
    { k: 'active', label: 'Actifs', val: stats.status.active, tone: 'bg-success/10 text-success ring-success/25' },
    { k: 'completed', label: 'Terminés', val: stats.status.completed, tone: 'bg-gold-100 text-gold-800 ring-gold-300' },
    { k: 'paused', label: 'En pause', val: stats.status.paused, tone: 'bg-surface-muted text-muted-foreground ring-border' },
    { k: 'canceled', label: 'Annulés', val: stats.status.canceled, tone: 'bg-danger/10 text-danger ring-danger/25' },
];

export default function UserEnrollmentsPanel({ idBase, enrolls, stats, hidden }: Props) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-inscriptions`} aria-labelledby={`${idBase}-tab-inscriptions`} tabIndex={0} hidden={hidden}>
            <SectionTitle kicker="Parcours" title="Inscriptions & progression" hint="État des programmes suivis par l’utilisateur." />
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{enrolls.length} cours</div>
                <div className="hidden md:flex flex-wrap gap-2">
                    {statusChips(stats).map((c) => (
                        <span key={c.k} className={`rounded-full px-2 py-0.5 text-xs ring-1 ${c.tone}`}>
                            {c.label}: {c.val}
                        </span>
                    ))}
                </div>
            </div>

            {enrolls.length === 0 ? (
                <Card>
                    <div className="text-sm text-muted-foreground">Aucune inscription.</div>
                </Card>
            ) : (
                <>
                    <div className="grid gap-3 md:hidden">
                        {enrolls.map((enrollment) => (
                            <article key={enrollment._id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
                                        {enrollment.coverUrl ? (
                                            <Image src={enrollment.coverUrl} alt="" fill sizes="44px" className="object-cover" unoptimized />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">—</div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-medium text-foreground">{enrollment.programTitle}</h3>
                                        <p className="text-xs text-muted-foreground">{formatEnrollmentStatus(enrollment.status)} · jour {enrollment.currentDay ?? '—'}</p>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-foreground">{enrollment.progressPct}%</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label={`Progression ${enrollment.programTitle}`} aria-valuenow={enrollment.progressPct} aria-valuemin={0} aria-valuemax={100}>
                                    <div className="h-full bg-primary" style={{ width: `${enrollment.progressPct}%` }} />
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">{enrollment.unitsDone} unité{enrollment.unitsDone > 1 ? 's' : ''} sur {enrollment.unitsCount}</p>
                            </article>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <Card bleed>
                            <div className="overflow-x-auto px-5">
                                <table className="min-w-full text-sm">
                            <thead className="text-left text-xs text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-3 font-medium">Programme</th>
                                    <th className="py-2 pr-3 font-medium">Niveau</th>
                                    <th className="py-2 pr-3 font-medium">Statut</th>
                                    <th className="py-2 pr-3 font-medium">Progression</th>
                                    <th className="py-2 pr-3 font-medium">Jour</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolls.map((e) => (
                                    <tr key={e._id} className="border-b last:border-0">
                                        <td className="py-3 pr-3 max-w-[360px]">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                                                    {e.coverUrl ? (
                                                        <Image src={e.coverUrl} alt={e.programTitle} fill sizes="32px" className="object-cover" unoptimized />
                                                    ) : (
                                                        <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">—</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">{e.programTitle}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{e.programSlug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-3 whitespace-nowrap">{e.level ?? '—'}</td>
                                        <td className="whitespace-nowrap py-3 pr-3">{formatEnrollmentStatus(e.status)}</td>
                                        <td className="py-3 pr-3 w-56">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-40 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={e.progressPct} aria-valuemin={0} aria-valuemax={100}>
                                                    <div className="h-full bg-primary" style={{ width: `${e.progressPct}%` }} />
                                                </div>
                                                <div className="hidden md:block tabular-nums text-xs text-muted-foreground">
                                                    {e.unitsDone}/{e.unitsCount} • {e.progressPct}%
                                                </div>
                                                <span className="sr-only">
                                                    Progression {e.unitsDone} sur {e.unitsCount} soit {e.progressPct} pourcents
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-3 whitespace-nowrap">{typeof e.currentDay === 'number' ? e.currentDay : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function formatEnrollmentStatus(status: EnrollmentRowClient['status']) {
    return {
        active: 'Actif',
        completed: 'Terminé',
        paused: 'En pause',
        canceled: 'Annulé',
    }[status];
}
