import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

/**
 * Slider natif pour les echelles simples, notamment les scores 0-10.
 * Le composant reste server-safe et ne gere pas lui-meme le libelle du champ.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { className, invalid = false, 'aria-invalid': ariaInvalid, min = 0, max = 10, step = 1, ...props },
  ref,
) {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === 'true';

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      aria-invalid={isInvalid ? true : ariaInvalid}
      className={cn(
        'h-6 w-full cursor-pointer appearance-none rounded-full bg-surface-muted accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60',
        isInvalid && 'accent-danger focus-visible:ring-danger/25',
        className,
      )}
      {...props}
    />
  );
});
