'use client';

import { usePathname } from 'next/navigation';

import { learnerNavigationItems } from '@/config/navigation';
import { learnerShellContent } from '@/content/layout';

import { LearnerAccountMenu } from './LearnerAccountMenu';
import { isLearnerNavigationActive } from './learner-navigation.utils';

type LearnerTopbarProps = {
  isAdmin?: boolean;
  user?: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
};

export function LearnerTopbar({ isAdmin = false, user }: LearnerTopbarProps) {
  const pathname = usePathname();
  const currentLabel =
    learnerNavigationItems.find((item) => isLearnerNavigationActive(pathname, item))?.label ?? learnerShellContent.title;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/78">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-7 lg:px-10 xl:px-12">
        <div className="min-w-0">
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
            {learnerShellContent.eyebrow}
          </p>
          <p className="truncate font-serif text-lg font-semibold leading-tight text-foreground sm:mt-0.5 sm:text-xl">{currentLabel}</p>
        </div>

        <LearnerAccountMenu isAdmin={isAdmin} user={user} />
      </div>
    </header>
  );
}
