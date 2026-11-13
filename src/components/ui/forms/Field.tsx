import type { HTMLAttributes, LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

/**
 * Structure un champ sans imposer de librairie de formulaire.
 * L'association label/description/erreur reste explicite via `id`, `htmlFor` et `aria-describedby`.
 */
export function Field({ className, disabled = false, ...props }: FieldProps) {
  return <div data-disabled={disabled || undefined} className={cn('grid gap-2 data-[disabled=true]:opacity-70', className)} {...props} />;
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FieldLabel({ className, required = false, children, ...props }: FieldLabelProps) {
  return (
    <label className={cn('text-sm font-medium leading-none text-foreground', className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-danger">
          *
        </span>
      )}
    </label>
  );
}

export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />;
}

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p role="alert" className={cn('text-sm font-medium leading-relaxed text-danger', className)} {...props} />;
}
