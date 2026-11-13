import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const stackDirections = {
  column: 'flex-col',
  row: 'flex-row',
} as const;

const stackGaps = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const;

const stackAlignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const stackJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;

export type StackDirection = keyof typeof stackDirections;
export type StackGap = keyof typeof stackGaps;
export type StackAlign = keyof typeof stackAlignments;
export type StackJustify = keyof typeof stackJustify;
export type StackElement = 'div' | 'section' | 'article' | 'nav' | 'form';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: StackElement;
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
}

/**
 * Primitive flex pour composer des empilements sans recreer les memes wrappers.
 */
export function Stack({ as = 'div', direction = 'column', gap = 'md', align = 'stretch', justify = 'start', className, ...props }: StackProps) {
  const Component = as as ElementType;

  return (
    <Component
      className={cn('flex', stackDirections[direction], stackGaps[gap], stackAlignments[align], stackJustify[justify], className)}
      {...props}
    />
  );
}
