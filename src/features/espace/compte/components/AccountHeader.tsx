import { Palette, UserRound } from 'lucide-react';

import { Badge, Breadcrumbs } from '@/components/ui';
import { espaceRoutes } from '@/config/routes';
import type { AccountProfile } from '@/server/auth/account-profile';

function formatTheme(theme: string | null | undefined) {
    if (theme === 'light') return 'Clair';
    if (theme === 'dark') return 'Sombre';
    return 'Système';
}

export function AccountHeader({ user }: { user: AccountProfile }) {
    const displayName = user.name?.trim() || 'Mon compte';

    return (
        <header className="relative min-w-0 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

            <div className="relative">
                <Breadcrumbs items={[{ label: 'Espace apprenant', href: espaceRoutes.root }, { label: 'Compte' }]} />

                <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-end">
                    <div className="min-w-0">
                        <Badge variant="outline">Compte et préférences</Badge>
                        <h1 className="mt-3 break-words font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                            Un espace simple pour tes réglages
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Mets à jour ton profil, choisis ton confort de lecture et garde la main sur tes paramètres.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-muted/70 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
                                <UserRound className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant={user.role === 'admin' ? 'info' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'Apprenant'}</Badge>
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Palette className="h-3.5 w-3.5" aria-hidden="true" /> Thème {formatTheme(user.theme).toLocaleLowerCase('fr-FR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
