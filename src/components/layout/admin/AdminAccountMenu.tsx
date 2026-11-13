'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { BookOpen, ExternalLink, UserCircle, X } from 'lucide-react';
import Link from 'next/link';

import { espaceRoutes, publicRoutes } from '@/config/routes';

import { AccountAvatar } from '../AccountAvatar';
import { SessionLogoutButton } from '../SessionLogoutButton';

type AdminAccountMenuProps = {
    hasActiveProgram: boolean;
    user?: {
        email?: string | null;
        displayName?: string | null;
        avatarUrl?: string | null;
    };
};

const menuLinkClassName =
    'flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

export function AdminAccountMenu({ hasActiveProgram, user }: AdminAccountMenuProps) {
    const identity = user?.displayName ?? user?.email ?? 'Compte administrateur';

    return (
        <DialogPrimitive.Root>
            <DialogPrimitive.Trigger asChild>
                <button type="button" aria-label="Ouvrir le menu du compte" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface shadow-soft motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                    <AccountAvatar displayName={user?.displayName} email={user?.email} avatarUrl={user?.avatarUrl} />
                </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/40 backdrop-blur-[2px]" />
                <DialogPrimitive.Content className="fixed inset-x-3 bottom-3 z-[var(--z-modal)] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[2rem] border border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-foreground shadow-elevated outline-none sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-80 sm:p-4">
                    <div className="flex items-start justify-between gap-3 px-1 pb-3">
                        <div>
                            <DialogPrimitive.Title className="font-serif text-xl font-semibold leading-tight text-foreground">Mon espace</DialogPrimitive.Title>
                            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">Compte et changement de zone</DialogPrimitive.Description>
                        </div>
                        <DialogPrimitive.Close asChild>
                            <button type="button" aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </DialogPrimitive.Close>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted p-3">
                        <AccountAvatar displayName={user?.displayName} email={user?.email} avatarUrl={user?.avatarUrl} size="md" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{identity}</p>
                            {user?.displayName && user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
                        </div>
                    </div>

                    <nav className="mt-3 grid gap-1" aria-label="Compte et zones">
                        <DialogPrimitive.Close asChild>
                            <Link href={espaceRoutes.compte} className={menuLinkClassName}>
                                <UserCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                                Mon compte
                            </Link>
                        </DialogPrimitive.Close>
                        {hasActiveProgram ? (
                            <DialogPrimitive.Close asChild>
                                <Link href={espaceRoutes.root} className={menuLinkClassName}>
                                    <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                                    Espace apprenant
                                </Link>
                            </DialogPrimitive.Close>
                        ) : null}
                        <DialogPrimitive.Close asChild>
                            <Link href={publicRoutes.home} className={menuLinkClassName}>
                                <ExternalLink className="h-5 w-5 text-primary" aria-hidden="true" />
                                Voir le site
                            </Link>
                        </DialogPrimitive.Close>
                    </nav>

                    <div className="mt-3 border-t border-border pt-3">
                        <SessionLogoutButton variant="menu" className="min-h-12 rounded-2xl px-3" />
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
