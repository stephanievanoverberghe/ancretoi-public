import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const learnerHeroTones = {
  neutral: 'border-border bg-surface',
  primary: 'border-primary/20 bg-gradient-to-br from-primary/12 via-surface to-secondary/8',
  success: 'border-success/20 bg-gradient-to-br from-success/10 via-surface to-primary/6',
} as const;

export type LearnerHeroTone = keyof typeof learnerHeroTones;

export interface LearnerHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: LearnerHeroTone;
}

/** Surface d’ouverture pour mettre en avant le prochain geste utile. */
export function LearnerHero({ title, description, eyebrow, icon: Icon, actions, aside, tone = 'primary', className, ...props }: LearnerHeroProps) {
  return (
    <section className={cn('relative overflow-hidden rounded-3xl border p-6 shadow-soft sm:p-8 lg:p-10', learnerHeroTones[tone], className)} {...props}>
      <div className={cn('grid gap-6', Boolean(aside) && '2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-center')}>
        <div className="min-w-0">
          {Icon ? (
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-surface text-primary shadow-soft" aria-hidden="true">
              <Icon className="h-6 w-6" />
            </span>
          ) : null}
          {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div> : null}
          <h1 className="mt-1 max-w-3xl font-serif text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl">{title}</h1>
          {description ? <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </section>
  );
}
