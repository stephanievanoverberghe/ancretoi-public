import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const sectionSpacing = {
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
} as const;

export type SectionSpacing = keyof typeof sectionSpacing;
export type SectionElement = 'section' | 'div' | 'article' | 'aside';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: SectionElement;
  spacing?: SectionSpacing;
}

/**
 * Bande verticale de page avec espacements standardises.
 */
export function Section({ as = 'section', spacing = 'md', className, ...props }: SectionProps) {
  const Component = as as ElementType;

  return <Component className={cn(sectionSpacing[spacing], className)} {...props} />;
}
