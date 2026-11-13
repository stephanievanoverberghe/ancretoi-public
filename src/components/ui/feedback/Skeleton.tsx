import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/**
 * Placeholder visuel pour contenus en chargement.
 * Fournir `label` quand le skeleton represente un etat de chargement annonce aux lecteurs d'ecran.
 */
export function Skeleton({ className, label, ...props }: SkeletonProps) {
  return (
    <div
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      className={cn('animate-pulse rounded-md bg-surface-muted motion-reduce:animate-none', className)}
      {...props}
    >
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
