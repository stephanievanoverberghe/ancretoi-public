'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { BookOpen, Ellipsis, ExternalLink, PlayCircle, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { LearnerNavigationItem } from '@/config/navigation';
import { learnerMobilePrimaryHrefs, learnerMoreHrefs, learnerNavigationItems } from '@/config/navigation';
import { administrationRoutes, espaceRoutes, publicRoutes } from '@/config/routes';
import { learnerShellContent } from '@/content/layout';
import { cn } from '@/lib/cn';

import { getLearnerNavigationIcon } from './learner-navigation.icons';
import { isLearnerNavigationActive } from './learner-navigation.utils';
import { learnerPortalSafeAreaStyle } from './learner-shell.constants';

type LearnerMobileNavigationProps = {
  hasActiveProgram?: boolean;
  isAdmin?: boolean;
  resumeHref?: string;
};

function isLearnerNavigationItem(item: LearnerNavigationItem | undefined): item is LearnerNavigationItem {
  return Boolean(item);
}

const tabClassName =
  'flex h-[var(--learner-mobile-nav-height)] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30';

export function LearnerMobileNavigation({ hasActiveProgram = false, isAdmin = false, resumeHref }: LearnerMobileNavigationProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMoreOpen(false);
    };

    closeOnDesktop();
    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);
  const itemByHref = new Map<string, LearnerNavigationItem>(learnerNavigationItems.map((item) => [item.href, item]));
  const primaryItems = learnerMobilePrimaryHrefs.map((href) => itemByHref.get(href)).filter(isLearnerNavigationItem);
  const moreItems = learnerMoreHrefs
    .map((href) => itemByHref.get(href))
    .filter(isLearnerNavigationItem)
    .filter((item) => hasActiveProgram || item.href === espaceRoutes.compte || item.href === publicRoutes.aide);
  const moreActive = moreItems.some((item) => isLearnerNavigationActive(pathname, item));

  return (
    <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
      <nav
        className="fixed inset-x-3 z-50 rounded-3xl border border-border bg-surface/95 p-1 shadow-elevated backdrop-blur lg:hidden"
        aria-label={learnerShellContent.navigationLabel}
        style={{ bottom: 'var(--learner-mobile-nav-bottom)' }}
      >
        <ul className="grid grid-cols-4">
          {primaryItems.map((item) => {
            const Icon = getLearnerNavigationIcon(item.icon);
            const isLockedJournal = !hasActiveProgram && item.href === espaceRoutes.journal;
            const href = !hasActiveProgram && item.href === espaceRoutes.formations ? publicRoutes.programmes : item.href;
            const active = !isLockedJournal && isLearnerNavigationActive(pathname, item);
            const classes = cn(
              tabClassName,
              active ? 'bg-surface-selected text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
              isLockedJournal && 'cursor-not-allowed opacity-45',
            );

            return (
              <li key={item.href} className="min-w-0">
                {isLockedJournal ? (
                  <>
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-describedby="learner-mobile-journal-lock-reason"
                      className={cn(classes, 'w-full')}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="max-w-full truncate">{item.label}</span>
                    </button>
                    <span id="learner-mobile-journal-lock-reason" className="sr-only">
                      Le journal s’ouvre avec un programme actif.
                    </span>
                  </>
                ) : (
                  <Link href={href} aria-current={active ? 'page' : undefined} className={classes}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="max-w-full truncate">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}

          <li className="min-w-0">
            <DialogPrimitive.Trigger asChild>
              <button
                type="button"
                aria-current={moreActive ? 'page' : undefined}
                className={cn(
                  tabClassName,
                  moreActive || moreOpen ? 'bg-surface-selected text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )}
              >
                <Ellipsis className="h-5 w-5" aria-hidden="true" />
                <span>{learnerShellContent.mobileMoreLabel}</span>
              </button>
            </DialogPrimitive.Trigger>
          </li>
        </ul>
      </nav>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/45 backdrop-blur-[2px] lg:hidden" />
        <DialogPrimitive.Content
          aria-describedby="learner-more-description"
          style={learnerPortalSafeAreaStyle}
          className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] max-h-[min(78dvh,42rem)] overflow-y-auto rounded-t-[2rem] border border-b-0 border-border bg-surface px-4 pb-[calc(1rem+var(--learner-safe-area-bottom))] pt-3 text-foreground shadow-elevated outline-none lg:hidden"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="font-serif text-2xl font-semibold leading-tight text-foreground">
                {learnerShellContent.mobileMoreTitle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description id="learner-more-description" className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {learnerShellContent.mobileMoreDescription}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label={learnerShellContent.closeLabel}
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {hasActiveProgram ? (
            <DialogPrimitive.Close asChild>
              <Link
                href={resumeHref ?? espaceRoutes.formations}
                className="mt-5 flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/15" aria-hidden="true">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                  {learnerShellContent.primaryActionLabel}
                </span>
              </Link>
            </DialogPrimitive.Close>
          ) : (
            <DialogPrimitive.Close asChild>
              <Link
                href={publicRoutes.programmes}
                className="mt-5 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" />
                {learnerShellContent.startProgramLabel}
              </Link>
            </DialogPrimitive.Close>
          )}

          <nav className="mt-4 grid grid-cols-2 gap-2" aria-label="Accès secondaires">
            {moreItems.map((item) => {
              const Icon = getLearnerNavigationIcon(item.icon);
              const active = isLearnerNavigationActive(pathname, item);

              return (
                <DialogPrimitive.Close asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-20 cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                      active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-surface-muted text-foreground hover:bg-surface-raised',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </DialogPrimitive.Close>
              );
            })}
          </nav>

          <div className="mt-4 grid gap-1 border-t border-border pt-3">
            <DialogPrimitive.Close asChild>
              <Link
                href={publicRoutes.home}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
                {learnerShellContent.publicSiteLabel}
              </Link>
            </DialogPrimitive.Close>
            {isAdmin ? (
              <DialogPrimitive.Close asChild>
                <Link
                  href={administrationRoutes.root}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  {learnerShellContent.adminAccessLabel}
                </Link>
              </DialogPrimitive.Close>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
