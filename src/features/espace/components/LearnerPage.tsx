import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const learnerPageSizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[var(--container-max)]',
  full: 'max-w-none',
} as const;

const learnerPageSpacing = {
  none: '',
  compact: 'space-y-5 sm:space-y-6',
  default: 'space-y-7 sm:space-y-9',
  relaxed: 'space-y-9 sm:space-y-12',
} as const;

type LearnerPageElement = 'div' | 'section' | 'article';
export type LearnerPageSize = keyof typeof learnerPageSizes;
export type LearnerPageSpacing = keyof typeof learnerPageSpacing;

export interface LearnerPageProps extends HTMLAttributes<HTMLElement> {
  as?: LearnerPageElement;
  size?: LearnerPageSize;
  spacing?: LearnerPageSpacing;
}

/** Cadre de page commun aux écrans du studio apprenant. */
export function LearnerPage({ as = 'div', size = 'default', spacing = 'default', className, ...props }: LearnerPageProps) {
  const Component = as as ElementType;

  return (
    <Component
      data-learner-page=""
      data-learner-page-size={size}
      className={cn('mx-auto w-full', learnerPageSizes[size], learnerPageSpacing[spacing], className)}
      {...props}
    />
  );
}
