'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { useId } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
}

/**
 * Interrupteur accessible base sur Radix pour les reglages booleens.
 * Utiliser `label` ou un label externe afin que le controle reste nomme.
 */
export function Switch({ id, label, description, className, disabled, 'aria-describedby': ariaDescribedBy, ...props }: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-1">
        {label && (
          <label htmlFor={switchId} className={cn('text-sm font-medium leading-5 text-foreground', !disabled && 'cursor-pointer')}>
            {label}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <SwitchPrimitive.Root
        id={switchId}
        disabled={disabled}
        aria-describedby={describedBy}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full bg-input transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=checked]:bg-primary',
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-5" />
      </SwitchPrimitive.Root>
    </div>
  );
}
