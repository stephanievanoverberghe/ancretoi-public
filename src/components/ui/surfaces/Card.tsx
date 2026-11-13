import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const cardVariants = {
  default: 'border-border bg-surface shadow-soft',
  muted: 'border-border bg-surface-muted shadow-none',
  raised: 'border-border bg-surface-raised shadow-elevated',
  inset: 'border-border bg-surface-inset shadow-none',
  ghost: 'border-transparent bg-transparent shadow-none',
} as const;

const cardPaddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const;

const cardTitleSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
} as const;

export type CardVariant = keyof typeof cardVariants;
export type CardPadding = keyof typeof cardPaddings;
export type CardTitleSize = keyof typeof cardTitleSizes;
export type CardTitleElement = 'h2' | 'h3' | 'h4';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/**
 * Surface composable neutre pour regrouper du contenu sans logique metier.
 */
export function Card({ variant = 'default', className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border text-foreground', cardVariants[variant], className)} {...props} />;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

function hasBasePaddingOverride(className?: string) {
  return className?.split(/\s+/).some((token) => /^!?p-(?:.+)$/.test(token)) ?? false;
}

function getPaddingClassName(padding: CardPadding | undefined, className?: string) {
  if (padding) return cardPaddings[padding];
  return hasBasePaddingOverride(className) ? cardPaddings.none : cardPaddings.md;
}

export function CardHeader({ padding, className, ...props }: CardSectionProps) {
  return <div className={cn('space-y-1.5', getPaddingClassName(padding, className), className)} {...props} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: CardTitleElement;
  size?: CardTitleSize;
}

export function CardTitle({ as = 'h3', size = 'md', className, ...props }: CardTitleProps) {
  const Component = as as ElementType;

  return <Component className={cn('font-semibold leading-tight text-foreground', cardTitleSizes[size], className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />;
}

export function CardContent({ padding, className, ...props }: CardSectionProps) {
  return <div className={cn(getPaddingClassName(padding, className), className)} {...props} />;
}

export function CardFooter({ padding, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border sm:flex-row sm:items-center sm:justify-end',
        getPaddingClassName(padding, className),
        className,
      )}
      {...props}
    />
  );
}
