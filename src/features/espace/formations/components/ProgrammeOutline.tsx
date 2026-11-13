import { CheckCircle2, ChevronRight, ListChecks, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { CourseLayoutItem } from '@/server/apprentissage/espace-pages.service';

import { ProgrammeOutlineMobileClient } from './ProgrammeOutlineMobileClient';

type ProgrammeOutlineProps = {
  items: CourseLayoutItem[];
  percent: number;
  total: number;
  doneCount: number;
  isCompleted: boolean;
  programName: string;
  primaryHref: string;
  primaryLabel: string;
};

type OutlineStepsProps = {
  items: CourseLayoutItem[];
};

function StepLink({ item }: { item: CourseLayoutItem }) {
  const isActive = item.state === 'active';
  const isDone = item.state === 'done';
  const Icon = isDone ? CheckCircle2 : isActive ? PlayCircle : Lock;
  const content = (
    <span
      className={cn(
        'flex min-h-12 items-start gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-colors',
        item.locked
          ? 'border-transparent bg-transparent text-muted-foreground opacity-60'
          : isActive
            ? 'border-primary/25 bg-primary/10 font-semibold text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border hover:bg-surface-muted hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl',
          isDone ? 'bg-success/10 text-success' : isActive ? 'bg-primary/15 text-primary' : 'bg-surface-muted text-muted-foreground',
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-snug">{item.label}</span>
        {item.locked ? (
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            Se débloque après l’étape précédente
          </span>
        ) : item.sub ? (
          <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{item.sub}</span>
        ) : null}
      </span>
      {!item.locked ? <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
    </span>
  );

  if (item.locked) {
    return (
      <div aria-disabled="true" className="cursor-not-allowed">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'step' : undefined}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {content}
    </Link>
  );
}

function OutlineSteps({ items }: OutlineStepsProps) {
  return (
    <ol className="grid gap-1">
      {items.map((item) => (
        <li key={item.key}>
          <StepLink item={item} />
        </li>
      ))}
    </ol>
  );
}

function ProgressSummary({ percent, total, doneCount, isCompleted }: Pick<ProgrammeOutlineProps, 'percent' | 'total' | 'doneCount' | 'isCompleted'>) {
  const safePercent = total === 0 ? 0 : Math.max(0, Math.min(100, Math.round(percent)));
  const progressLabel = total === 0
    ? 'Contenu en préparation'
    : isCompleted
      ? `${total} journées terminées`
      : `${doneCount}/${total} journées`;

  return (
    <div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label="Progression du programme"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${safePercent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{progressLabel}</span>
        <span className="font-semibold tabular-nums text-foreground">{safePercent}%</span>
      </div>
    </div>
  );
}

function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <PlayCircle className="h-5 w-5" aria-hidden="true" />
      {children}
    </Link>
  );
}

export function ProgrammeOutline({ items, percent, total, doneCount, isCompleted, programName, primaryHref, primaryLabel }: ProgrammeOutlineProps) {
  const activeItem = items.find((item) => item.state === 'active') ?? items.find((item) => !item.locked) ?? items[0];

  return (
    <>
      <aside className="sticky top-24 hidden self-start xl:block">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3 px-1">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Parcours guidé</p>
              <h2 className="truncate font-serif text-lg font-semibold leading-tight text-foreground">{programName}</h2>
            </div>
          </div>

          <div className="mt-4 px-1">
            <ProgressSummary percent={percent} total={total} doneCount={doneCount} isCompleted={isCompleted} />
          </div>
          <div className="mt-4">
            <PrimaryAction href={primaryHref}>{primaryLabel}</PrimaryAction>
          </div>
          <nav aria-label={`Étapes du programme ${programName}`} className="mt-4 max-h-[calc(100dvh-19rem)] overflow-y-auto border-t border-border pt-3">
            <OutlineSteps items={items} />
          </nav>
        </div>
      </aside>

      <ProgrammeOutlineMobileClient
        activeLabel={activeItem?.label ?? 'Voir le parcours'}
        percent={total === 0 ? 0 : Math.max(0, Math.min(100, Math.round(percent)))}
        programName={programName}
      >
        <div className="mt-4">
          <ProgressSummary percent={percent} total={total} doneCount={doneCount} isCompleted={isCompleted} />
        </div>
        <div className="mt-4">
          <PrimaryAction href={primaryHref}>{primaryLabel}</PrimaryAction>
        </div>
        <nav aria-label={`Étapes du programme ${programName}`} className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-border pt-3">
          <OutlineSteps items={items} />
        </nav>
      </ProgrammeOutlineMobileClient>
    </>
  );
}

export type { ProgrammeOutlineProps };
