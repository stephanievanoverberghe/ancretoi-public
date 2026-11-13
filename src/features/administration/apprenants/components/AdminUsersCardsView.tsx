import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BookOpenCheck, Clock3, LogIn } from 'lucide-react';
import type { UiUser } from './admin-users.types';
import { formatActivity, getUserInitials } from './admin-users.utils';
import { RoleBadge, StateBadges } from './AdminUserBadges';

export default function AdminUsersCardsView({ users }: { users: UiUser[] }) {
    return (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {users.map((u) => (
                <li key={u._id} className="group rounded-2xl border border-border bg-surface p-4 shadow-soft motion-safe:transition-[border-color,box-shadow] motion-reduce:transition-none hover:border-primary/30 hover:shadow-elevated sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 text-primary">
                            {u.avatarUrl ? (
                                <Image src={u.avatarUrl} alt="" fill className="object-cover" sizes="48px" />
                            ) : (
                                <span className="grid h-full w-full place-items-center text-sm font-semibold" aria-hidden="true">
                                    {getUserInitials(u)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <RoleBadge role={u.role} />
                                <StateBadges archived={u.isArchived} suspended={u.isSuspended} />
                                {u.isSelf ? <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">Vous</span> : null}
                            </div>
                            <h3 className="mt-2 truncate text-base font-semibold text-foreground">{u.name || u.email}</h3>
                            <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-surface-muted/60 p-3 text-sm">
                        <Metric icon={<LogIn className="h-4 w-4" />} label="Connexion" value={formatActivity(u.lastLoginAtIso)} />
                        <Metric icon={<Clock3 className="h-4 w-4" />} label="Activité parcours" value={formatActivity(u.lastLearningActivityAtIso)} />
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                                {u.enrollCount} parcours · {u.completedPrograms} terminé{u.completedPrograms > 1 ? 's' : ''}
                            </span>
                            <span className="font-semibold tabular-nums text-foreground">{u.averageProgressPct}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label={`Progression moyenne de ${u.name || u.email}`} aria-valuenow={u.averageProgressPct} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full rounded-full bg-primary" style={{ width: `${u.averageProgressPct}%` }} />
                        </div>
                    </div>

                    <Link
                        href={`/administration/apprenants/${u._id}`}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground motion-safe:transition-colors motion-reduce:transition-none hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        Ouvrir le profil
                        <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden="true" />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary" aria-hidden="true">{icon}</span>
                {label}
            </span>
            <p className="mt-1 truncate font-medium text-foreground">{value}</p>
        </div>
    );
}
