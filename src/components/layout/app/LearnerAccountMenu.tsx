'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ExternalLink, LifeBuoy, ShieldCheck, UserCircle, X } from 'lucide-react';
import Link from 'next/link';

import { administrationRoutes, espaceRoutes, publicRoutes } from '@/config/routes';
import { learnerShellContent } from '@/content/layout';

import { AccountAvatar } from '../AccountAvatar';
import { SessionLogoutButton } from '../SessionLogoutButton';
import { learnerPortalSafeAreaStyle } from './learner-shell.constants';

type LearnerAccountMenuProps = {
  isAdmin?: boolean;
  user?: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
};

const accountLinkClassName =
  'flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

export function LearnerAccountMenu({ isAdmin = false, user }: LearnerAccountMenuProps) {
  const identity = user?.displayName ?? user?.email ?? learnerShellContent.accountTitle;

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={learnerShellContent.accountLabel}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-surface shadow-soft transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <AccountAvatar displayName={user?.displayName} email={user?.email} avatarUrl={user?.avatarUrl} />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-describedby="learner-account-description"
          style={learnerPortalSafeAreaStyle}
          className="fixed inset-x-3 bottom-3 z-[var(--z-modal)] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-border bg-surface p-4 pb-[calc(1rem+var(--learner-safe-area-bottom))] text-foreground shadow-elevated outline-none sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-80 sm:p-4"
        >
          <div className="flex items-start justify-between gap-3 px-1 pb-3">
            <div>
              <DialogPrimitive.Title className="font-serif text-xl font-semibold leading-tight text-foreground">
                {learnerShellContent.accountTitle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description id="learner-account-description" className="mt-1 text-sm text-muted-foreground">
                {learnerShellContent.accountDescription}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label={learnerShellContent.closeLabel}
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
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

          <nav className="mt-3 grid gap-1" aria-label={learnerShellContent.accountTitle}>
            <DialogPrimitive.Close asChild>
              <Link href={espaceRoutes.compte} className={accountLinkClassName}>
                <UserCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                Mon compte
              </Link>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close asChild>
              <Link href={publicRoutes.aide} className={accountLinkClassName}>
                <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
                Aide
              </Link>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close asChild>
              <Link href={publicRoutes.home} className={accountLinkClassName}>
                <ExternalLink className="h-5 w-5 text-primary" aria-hidden="true" />
                {learnerShellContent.publicSiteLabel}
              </Link>
            </DialogPrimitive.Close>
            {isAdmin ? (
              <DialogPrimitive.Close asChild>
                <Link href={administrationRoutes.root} className={accountLinkClassName}>
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  {learnerShellContent.adminAccessLabel}
                </Link>
              </DialogPrimitive.Close>
            ) : null}
          </nav>

          <div className="mt-3 border-t border-border pt-3">
            <SessionLogoutButton variant="menu" className="min-h-12 rounded-2xl px-3" />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
