import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, CircleAlert, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const learnerStateStyles = {
  empty: { icon: Info, surface: 'border-border bg-surface', iconClass: 'bg-primary/10 text-primary' },
  loading: { icon: LoaderCircle, surface: 'border-border bg-surface', iconClass: 'bg-primary/10 text-primary' },
  info: { icon: Info, surface: 'border-info/25 bg-info/10', iconClass: 'bg-surface text-info' },
  success: { icon: CheckCircle2, surface: 'border-success/25 bg-success/10', iconClass: 'bg-surface text-success' },
  warning: { icon: TriangleAlert, surface: 'border-warning/30 bg-warning/10', iconClass: 'bg-surface text-warning' },
  error: { icon: CircleAlert, surface: 'border-danger/30 bg-danger/10', iconClass: 'bg-surface text-danger' },
} as const;

export type LearnerStateKind = keyof typeof learnerStateStyles;

export interface LearnerStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  kind?: LearnerStateKind;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
}

/** État loading, vide, succès ou erreur commun aux pages apprenant. */
export function LearnerState({ kind = 'empty', title, description, actions, icon, className, role, ...props }: LearnerStateProps) {
  const style = learnerStateStyles[kind];
  const Icon = icon ?? style.icon;
  const resolvedRole = role ?? (kind === 'error' || kind === 'warning' ? 'alert' : 'status');

  return (
    <div role={resolvedRole} className={cn('rounded-3xl border p-6 text-center sm:p-8', style.surface, className)} {...props}>
      <span className={cn('mx-auto grid h-12 w-12 place-items-center rounded-2xl shadow-soft', style.iconClass)} aria-hidden="true">
        <Icon className={cn('h-6 w-6', kind === 'loading' && 'animate-spin motion-reduce:animate-none')} />
      </span>
      <h2 className="mt-4 font-serif text-xl font-semibold leading-tight text-foreground sm:text-2xl">{title}</h2>
      {description ? <div className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{description}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
