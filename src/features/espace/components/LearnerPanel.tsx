import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const learnerPanelVariants = {
  default: 'border-border bg-surface shadow-soft',
  muted: 'border-border bg-surface-muted shadow-none',
  raised: 'border-border bg-surface-raised shadow-elevated',
  inset: 'border-border bg-surface-inset shadow-none',
} as const;

const learnerPanelPaddings = {
  none: '',
  sm: 'p-5 sm:p-6',
  md: 'p-6 sm:p-7 lg:p-8',
  lg: 'p-6 sm:p-8 lg:p-10',
} as const;

type LearnerPanelElement = 'div' | 'section' | 'article' | 'aside';
export type LearnerPanelVariant = keyof typeof learnerPanelVariants;
export type LearnerPanelPadding = keyof typeof learnerPanelPaddings;

export interface LearnerPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: LearnerPanelElement;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: LearnerPanelVariant;
  padding?: LearnerPanelPadding;
}

/** Surface métier calme, prévue pour les blocs principaux du studio. */
export function LearnerPanel({ as = 'section', title, description, action, variant = 'default', padding = 'md', className, children, ...props }: LearnerPanelProps) {
  const Component = as as ElementType;

  return (
    <Component className={cn('rounded-3xl border text-foreground', learnerPanelVariants[variant], learnerPanelPaddings[padding], className)} {...props}>
      {title || description || action ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? <h2 className="font-serif text-xl font-semibold leading-tight text-foreground sm:text-2xl">{title}</h2> : null}
            {description ? <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </Component>
  );
}
