'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export interface SelectProps extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, 'children'> {
  id?: string;
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Select custom base sur Radix pour conserver clavier, focus management et portal accessibles.
 * Ce composant est client-only car Radix gere l'interaction et le portal.
 */
export function Select({
  id,
  options,
  placeholder = 'Selectionner',
  invalid = false,
  triggerClassName,
  contentClassName,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  disabled,
  ...props
}: SelectProps) {
  return (
    <SelectPrimitive.Root disabled={disabled} {...props}>
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors duration-200 data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:bg-surface-muted disabled:opacity-70',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          triggerClassName,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-[var(--z-dropdown)] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-elevated',
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-10 cursor-pointer select-none items-center rounded-sm py-2 pl-9 pr-3 text-sm text-foreground outline-none data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[highlighted]:bg-surface-muted data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex h-4 w-4 items-center justify-center text-primary">
                  <Check aria-hidden="true" className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
