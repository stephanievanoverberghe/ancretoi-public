'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { useId } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
}

/**
 * Checkbox accessible basee sur Radix.
 * Elle compose label, description et erreur sans imposer de librairie de formulaire.
 */
export function Checkbox({ id, label, description, error, invalid = false, className, disabled, 'aria-describedby': ariaDescribedBy, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const isInvalid = invalid || Boolean(error);

  return (
    <div className={cn('grid gap-1.5', disabled && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          id={checkboxId}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-input bg-surface text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:bg-surface-muted data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            isInvalid && 'border-danger focus-visible:ring-danger/25',
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            <Check aria-hidden="true" className="h-4 w-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label htmlFor={checkboxId} className={cn('text-sm font-medium leading-5 text-foreground', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
            {label}
          </label>
        )}
      </div>
      {description && (
        <p id={descriptionId} className="pl-8 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="pl-8 text-sm font-medium leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
