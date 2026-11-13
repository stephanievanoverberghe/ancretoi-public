import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface FormSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

/**
 * Regroupe un ensemble de champs lies sans imposer de structure metier.
 */
export function FormSection({ title, description, className, children, ...props }: FormSectionProps) {
  return (
    <section className={cn('space-y-5', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>}
          {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
