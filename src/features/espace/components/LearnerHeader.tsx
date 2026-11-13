import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LearnerHeaderElement = 'h1' | 'h2';

export interface LearnerHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  as?: LearnerHeaderElement;
}

/** En-tête tactile de page ou de grande section apprenant. */
export function LearnerHeader({ title, eyebrow, description, meta, actions, as = 'h1', className, ...props }: LearnerHeaderProps) {
  const Heading = as as ElementType;

  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)} {...props}>
      <div className="min-w-0 max-w-4xl">
        {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div> : null}
        <Heading className={cn('font-serif font-semibold leading-[1.12] text-foreground', as === 'h1' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl')}>
          {title}
        </Heading>
        {description ? <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</div> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
