import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { getControlClassName, isAriaInvalid } from './form.styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Champ texte de base, server-safe, compatible avec `aria-invalid` et `aria-describedby`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const isInvalid = isAriaInvalid(ariaInvalid, invalid);

  return (
    <input
      ref={ref}
      aria-invalid={isInvalid ? true : ariaInvalid}
      className={getControlClassName(`flex h-11 px-3 py-2 ${className ?? ''}`, isInvalid)}
      {...props}
    />
  );
});
