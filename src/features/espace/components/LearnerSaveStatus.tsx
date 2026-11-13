import { CircleAlert, CircleCheck, Cloud, CloudOff, LoaderCircle } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const saveStatusStyles = {
  idle: { label: 'Prêt', icon: Cloud, className: 'text-muted-foreground' },
  dirty: { label: 'Modifications en attente', icon: Cloud, className: 'text-warning' },
  saving: { label: 'Enregistrement…', icon: LoaderCircle, className: 'text-primary' },
  saved: { label: 'Enregistré', icon: CircleCheck, className: 'text-success' },
  error: { label: 'Échec de l’enregistrement', icon: CircleAlert, className: 'text-danger' },
  offline: { label: 'Hors connexion', icon: CloudOff, className: 'text-warning' },
} as const;

export type LearnerSaveState = keyof typeof saveStatusStyles;

export interface LearnerSaveStatusProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state?: LearnerSaveState;
  label?: ReactNode;
  detail?: ReactNode;
}

/** Statut compact et annoncé pour les sauvegardes de journal ou de leçon. */
export function LearnerSaveStatus({ state = 'idle', label, detail, className, role, ...props }: LearnerSaveStatusProps) {
  const config = saveStatusStyles[state];
  const Icon = config.icon;

  return (
    <div
      role={role ?? (state === 'error' || state === 'offline' ? 'alert' : 'status')}
      aria-live="polite"
      className={cn('inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium', config.className, className)}
      {...props}
    >
      <Icon className={cn('h-4 w-4 shrink-0', state === 'saving' && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />
      <span>{label ?? config.label}</span>
      {detail ? <span className="text-muted-foreground">· {detail}</span> : null}
    </div>
  );
}
