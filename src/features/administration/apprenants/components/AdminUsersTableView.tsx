import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { UiUser } from './admin-users.types';
import { RoleBadge, StateBadges } from './AdminUserBadges';
import { formatActivity, getUserInitials } from './admin-users.utils';

export default function AdminUsersTableView({ users }: { users: UiUser[] }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
            <table className="w-full min-w-[72rem] text-sm">
                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                        <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                        <th scope="col" className="px-4 py-3 font-medium">État</th>
                        <th scope="col" className="px-4 py-3 font-medium">Dernière connexion</th>
                        <th scope="col" className="px-4 py-3 font-medium">Activité pédagogique</th>
                        <th scope="col" className="px-4 py-3 font-medium">Progression</th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                            <td className="px-4 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 text-primary">
                                        {user.avatarUrl ? (
                                            <Image src={user.avatarUrl} alt="" fill className="object-cover" sizes="40px" />
                                        ) : (
                                            <span className="grid h-full w-full place-items-center text-xs font-semibold" aria-hidden="true">
                                                {getUserInitials(user)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="max-w-52 truncate font-medium text-foreground">{user.name || user.email}</span>
                                            {user.isSelf ? <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Vous</span> : null}
                                        </div>
                                        <p className="max-w-64 truncate text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <RoleBadge role={user.role} />
                                    <StateBadges archived={user.isArchived} suspended={user.isSuspended} />
                                    {!user.isArchived && !user.isSuspended ? <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-xs text-success">Actif</span> : null}
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatActivity(user.lastLoginAtIso)}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatActivity(user.lastLearningActivityAtIso)}</td>
                            <td className="px-4 py-3">
                                <div className="flex min-w-44 items-center gap-3">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label={`Progression moyenne de ${user.name || user.email}`} aria-valuenow={user.averageProgressPct} aria-valuemin={0} aria-valuemax={100}>
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${user.averageProgressPct}%` }} />
                                    </div>
                                    <span className="w-10 text-right font-medium tabular-nums text-foreground">{user.averageProgressPct}%</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">{user.enrollCount} parcours</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link
                                    href={`/administration/apprenants/${user._id}`}
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium motion-safe:transition-colors motion-reduce:transition-none hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                >
                                    Ouvrir
                                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
