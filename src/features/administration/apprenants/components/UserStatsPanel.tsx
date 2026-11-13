import Image from 'next/image';
import type { EnrollmentRowClient, UserStats } from './user-tabs.types';
import { Bar, Donut } from './UserTabsCharts';
import { Card, SectionTitle } from './UserTabsPrimitives';
import { round1, toDate } from './user-tabs.utils';

type Props = {
    idBase: string;
    enrolls: EnrollmentRowClient[];
    stats: UserStats;
    hidden: boolean;
};

export default function UserStatsPanel({ idBase, enrolls, stats, hidden }: Props) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-stats`} aria-labelledby={`${idBase}-tab-stats`} tabIndex={0} hidden={hidden}>
            <SectionTitle kicker="Analyse" title="Statistiques visuelles" hint="Lecture rapide via donuts et barres." />

            <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                    <Donut value={stats.avgPercent} label="Progression moyenne" sub={`${stats.avgPercent}% sur l’ensemble`} />
                </Card>

                <Card>
                    <div className="text-sm">
                        <div className="mb-3 font-medium">Activité observée</div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div>
                                <div className="text-[11px] text-muted-foreground">Rythme moyen</div>
                                <div className="text-lg font-semibold">{round1(stats.dailyPace)} u/j</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-muted-foreground">Jours pratiqués</div>
                                <div className="text-lg font-semibold">{stats.practicedDays}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-muted-foreground">Premier démarrage</div>
                                <div className="text-sm font-semibold">{toDate(stats.firstStartAt)}</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 mt-3">
                <Card>
                    <div className="mb-3 font-medium">Répartition des statuts</div>
                    <div className="space-y-3">
                        <Bar label="Actifs" value={stats.status.active} max={Math.max(1, stats.enrollCount)} tone="from-success to-success/60" />
                        <Bar label="Terminés" value={stats.status.completed} max={Math.max(1, stats.enrollCount)} tone="from-gold-600 to-gold-400" />
                        <Bar label="En pause" value={stats.status.paused} max={Math.max(1, stats.enrollCount)} tone="from-muted-foreground to-muted-foreground/60" />
                        <Bar label="Annulés" value={stats.status.canceled} max={Math.max(1, stats.enrollCount)} tone="from-danger to-danger/60" />
                    </div>
                </Card>

                {enrolls.length > 0 && (
                    <Card>
                        <h4 className="font-medium mb-2">Top programmes (avancement)</h4>
                        <ul className="space-y-2">
                            {enrolls
                                .slice()
                                .sort((a, b) => b.progressPct - a.progressPct)
                                .slice(0, 5)
                                .map((e) => (
                                    <li key={e._id} className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-border bg-surface-muted">
                                            {e.coverUrl ? (
                                                <Image src={e.coverUrl} alt={e.programTitle} fill sizes="32px" className="object-cover" unoptimized />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">—</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">{e.programTitle}</div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-1">
                                                <div className="h-full bg-primary" style={{ width: `${e.progressPct}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-xs tabular-nums text-muted-foreground w-14 text-right">{e.progressPct}%</div>
                                    </li>
                                ))}
                        </ul>
                    </Card>
                )}
            </div>
        </div>
    );
}
