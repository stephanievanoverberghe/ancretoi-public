'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { useId } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'children' | 'orientation'> {
  options: RadioOption[];
  orientation?: 'vertical' | 'horizontal';
  invalid?: boolean;
}

/**
 * Groupe radio accessible base sur Radix.
 * Les options sont declarees en data pour garder une API simple dans les formulaires metier.
 */
export function RadioGroup({
  options,
  orientation = 'vertical',
  invalid = false,
  className,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  const generatedId = useId();

  return (
    <RadioGroupPrimitive.Root
      disabled={disabled}
      orientation={orientation}
      aria-invalid={invalid || undefined}
      aria-describedby={ariaDescribedBy}
      className={cn(orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'grid gap-3', className)}
      {...props}
    >
      {options.map((option) => {
        const optionId = `${generatedId}-${option.value.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

        return (
          <div key={option.value} className={cn('flex items-start gap-3', (disabled || option.disabled) && 'opacity-70')}>
            <RadioGroupPrimitive.Item
              id={optionId}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-input bg-surface transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:bg-surface-muted data-[state=checked]:border-primary',
                disabled || option.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                invalid && 'border-danger focus-visible:ring-danger/25',
              )}
            >
              <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-primary" />
            </RadioGroupPrimitive.Item>
            <div className="grid gap-1">
              <label htmlFor={optionId} className={cn('text-sm font-medium leading-5 text-foreground', !option.disabled && 'cursor-pointer')}>
                {option.label}
              </label>
              {option.description && <p className="text-sm leading-relaxed text-muted-foreground">{option.description}</p>}
            </div>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
