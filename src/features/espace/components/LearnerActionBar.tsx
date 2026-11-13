import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface LearnerActionBarProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  status?: ReactNode;
  actions: ReactNode;
  sticky?: boolean;
  label?: string;
}

/** Barre d’actions tactile qui partage l’offset mobile du shell apprenant. */
export function LearnerActionBar({ leading, status, actions, sticky = true, label = 'Actions de la page', className, ...props }: LearnerActionBarProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        'z-30 rounded-3xl border border-border bg-surface/95 p-2 shadow-elevated backdrop-blur',
        sticky && 'sticky bottom-[var(--learner-action-bar-bottom)] md:bottom-4',
        className,
      )}
      {...props}
    >
      <div className="flex min-h-12 items-center justify-between gap-2">
        {leading ? <div className="flex shrink-0 items-center gap-2">{leading}</div> : <span />}
        {status ? <div className="hidden min-w-0 flex-1 justify-center sm:flex">{status}</div> : null}
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
    </div>
  );
}
