import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const badgeVariants = {
  default: 'border-primary/20 bg-primary/10 text-primary',
  secondary: 'border-secondary/25 bg-secondary/10 text-secondary-700',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-info/25 bg-info/10 text-info',
  outline: 'border-border bg-transparent text-foreground',
} as const;

const badgeSizes = {
  sm: 'min-h-6 px-2 text-xs',
  md: 'min-h-7 px-2.5 text-sm',
} as const;

export type BadgeVariant = keyof typeof badgeVariants;
export type BadgeSize = keyof typeof badgeSizes;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/**
 * Etiquette courte pour statuts, categories ou metadonnees.
 */
export function Badge({ variant = 'default', size = 'sm', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium leading-none',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
      {...props}
    />
  );
}
