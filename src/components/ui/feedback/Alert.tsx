import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const alertVariants = {
  info: 'border-info/25 bg-info/10 text-foreground',
  success: 'border-success/25 bg-success/10 text-foreground',
  warning: 'border-warning/30 bg-warning/10 text-foreground',
  danger: 'border-danger/30 bg-danger/10 text-foreground',
} as const;

const alertIconVariants = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
} as const;

export type AlertVariant = keyof typeof alertVariants;

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
}

/**
 * Message d'etat accessible.
 * Les variantes `warning` et `danger` utilisent `role="alert"` par defaut.
 */
export function Alert({ variant = 'info', title, icon, children, className, role, ...props }: AlertProps) {
  const alertRole = role ?? (variant === 'danger' || variant === 'warning' ? 'alert' : 'status');
  const hasTitle = title !== null && title !== undefined && title !== false;
  const hasChildren = children !== null && children !== undefined && children !== false;

  return (
    <div role={alertRole} className={cn('rounded-lg border p-4 text-sm leading-relaxed', alertVariants[variant], className)} {...props}>
      <div className="flex gap-3">
        {icon && (
          <span aria-hidden="true" className={cn('mt-0.5 inline-flex shrink-0', alertIconVariants[variant])}>
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {hasTitle && <div className="font-semibold leading-snug text-foreground">{title}</div>}
          {hasChildren && <div className={cn(hasTitle && 'mt-1', 'text-muted-foreground')}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
