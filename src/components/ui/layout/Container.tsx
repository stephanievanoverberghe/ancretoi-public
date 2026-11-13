import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const containerSizes = {
  sm: 'max-w-[var(--container-narrow)]',
  md: 'max-w-[var(--container-page)]',
  lg: 'max-w-[var(--container-wide)]',
  xl: 'max-w-[var(--container-max)]',
  full: 'max-w-none',
} as const;

export type ContainerSize = keyof typeof containerSizes;
export type ContainerElement = 'div' | 'main' | 'section' | 'article' | 'header' | 'footer';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ContainerElement;
  size?: ContainerSize;
}

/**
 * Conteneur responsive principal base sur les gutters et largeurs de tokens.
 */
export function Container({ as = 'div', size = 'md', className, ...props }: ContainerProps) {
  const Component = as as ElementType;

  return <Component className={cn('mx-auto w-full px-[var(--gutter-page)]', containerSizes[size], className)} {...props} />;
}
