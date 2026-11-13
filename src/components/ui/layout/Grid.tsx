import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

const gridGaps = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
} as const;

export type GridColumns = keyof typeof gridColumns;
export type GridGap = keyof typeof gridGaps;
export type GridElement = 'div' | 'section' | 'ul';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: GridElement;
  columns?: GridColumns;
  gap?: GridGap;
}

/**
 * Grille responsive simple pour cartes et listes courtes.
 */
export function Grid({ as = 'div', columns = 3, gap = 'md', className, ...props }: GridProps) {
  const Component = as as ElementType;

  return <Component className={cn('grid', gridColumns[columns], gridGaps[gap], className)} {...props} />;
}
