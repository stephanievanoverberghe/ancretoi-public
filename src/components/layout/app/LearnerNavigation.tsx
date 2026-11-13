'use client';

import { BookOpen, Compass, PlayCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { LearnerNavigationItem } from '@/config/navigation';
import { learnerNavigationGroups, learnerNavigationItems } from '@/config/navigation';
import { espaceRoutes, publicRoutes, reset7Routes } from '@/config/routes';
import { learnerShellContent, siteIdentity } from '@/content/layout';
import { cn } from '@/lib/cn';

import { getLearnerNavigationIcon } from './learner-navigation.icons';
import { isLearnerNavigationActive } from './learner-navigation.utils';
import { LearnerMobileNavigation } from './LearnerMobileNavigation';

export type LearnerResumeView = {
  programSlug: string;
  title: string;
  coverUrl: string | null;
  percent: number;
  currentDay: number;
  unitsDone: number;
  unitsTotal: number;
  status: 'active' | 'completed' | 'paused';
  resumeHref: string;
};

type LearnerNavigationProps = {
  hasActiveProgram?: boolean;
  isAdmin?: boolean;
  resume?: LearnerResumeView | null;
};

function NavigationLink({ item, active }: { item: LearnerNavigationItem; active: boolean }) {
  const Icon = getLearnerNavigationIcon(item.icon);

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        active ? 'bg-surface-selected text-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
          active ? 'bg-surface text-primary shadow-soft' : 'bg-transparent text-muted-foreground group-hover:bg-surface',
        )}
        aria-hidden="true"
      >
        <Icon className="h-[1.125rem] w-[1.125rem]" />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function ResumeCard({ resume }: { resume: LearnerResumeView }) {
  const isDone = resume.percent >= 100 || resume.status === 'completed';
  const label = isDone
    ? resume.programSlug === reset7Routes.programmeSlug
      ? 'Voir mon bilan'
      : 'Revoir le parcours'
    : resume.unitsDone === 0
      ? 'Commencer'
      : 'Reprendre';

  return (
    <section className="rounded-3xl border border-border bg-surface-muted p-3" aria-label="Parcours en cours">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface">
          {resume.coverUrl ? (
            <Image src={resume.coverUrl} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-primary" aria-hidden="true">
              <BookOpen className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Rituel en cours</p>
          <p className="truncate text-sm font-semibold text-foreground">{resume.title}</p>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label={`Progression de ${resume.title}`}
        aria-valuenow={resume.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${resume.percent}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {resume.unitsDone}/{resume.unitsTotal} journées
        </span>
        <span className="font-semibold tabular-nums text-foreground">{resume.percent}%</span>
      </div>

      <Link
        href={resume.resumeHref}
        className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </section>
  );
}

function DiscoverCard() {
  return (
    <section className="rounded-3xl border border-border bg-surface-muted p-4" aria-label="Découvrir les parcours">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface text-primary shadow-soft" aria-hidden="true">
        <Sparkles className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">Commence ton premier rituel</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choisis un parcours pour ouvrir ton journal et avancer à ton rythme.</p>
      <Link
        href={publicRoutes.programmes}
        className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
        Voir les programmes
      </Link>
    </section>
  );
}

export function LearnerNavigation({ hasActiveProgram = false, isAdmin = false, resume = null }: LearnerNavigationProps) {
  const pathname = usePathname();
  const itemByHref = new Map<string, LearnerNavigationItem>();
  learnerNavigationItems.forEach((item) => itemByHref.set(item.href, item));

  const groups = learnerNavigationGroups
    .map((group) => ({
      title: group.title,
      items: group.hrefs.map((href) => itemByHref.get(href)).filter((item): item is LearnerNavigationItem => Boolean(item)),
    }))
    .filter((group) => group.items.length > 0);
  const homeItem = itemByHref.get(espaceRoutes.root);

  return (
    <>
      <aside className="hidden border-r border-border bg-surface lg:block">
        <nav className="sticky top-0 flex h-dvh flex-col px-3 py-4 lg:px-4" aria-label={learnerShellContent.navigationLabel}>
          <Link
            href={espaceRoutes.root}
            className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <Image src={siteIdentity.logoSrc} alt="" width={40} height={40} className="rounded-xl bg-surface-muted p-1 shadow-soft" />
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-semibold leading-tight text-foreground">{siteIdentity.name}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{learnerShellContent.eyebrow}</span>
            </span>
          </Link>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            {hasActiveProgram ? (
              <div className="space-y-4">
                {groups.map((group) => (
                  <section key={group.title} aria-labelledby={`learner-nav-${group.title.replace(/\s+/g, '-').toLowerCase()}`}>
                    <h2 id={`learner-nav-${group.title.replace(/\s+/g, '-').toLowerCase()}`} className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.title}
                    </h2>
                    <ul className="grid gap-0.5">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <NavigationLink item={item} active={isLearnerNavigationActive(pathname, item)} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : homeItem ? (
              <ul>
                <li>
                  <NavigationLink item={homeItem} active={isLearnerNavigationActive(pathname, homeItem)} />
                </li>
              </ul>
            ) : null}
          </div>

          <div className="mt-4 shrink-0">{hasActiveProgram && resume ? <ResumeCard resume={resume} /> : <DiscoverCard />}</div>
        </nav>
      </aside>

      <LearnerMobileNavigation
        hasActiveProgram={hasActiveProgram}
        isAdmin={isAdmin}
        resumeHref={resume?.resumeHref}
      />
    </>
  );
}
