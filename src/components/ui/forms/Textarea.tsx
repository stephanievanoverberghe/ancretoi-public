import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { getControlClassName, isAriaInvalid } from './form.styles';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/**
 * Zone de texte de base, server-safe, pour les champs multilignes sans logique de formulaire.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const isInvalid = isAriaInvalid(ariaInvalid, invalid);

  return (
    <textarea
      ref={ref}
      aria-invalid={isInvalid ? true : ariaInvalid}
      className={getControlClassName(`min-h-28 resize-y px-3 py-2 leading-relaxed ${className ?? ''}`, isInvalid)}
      {...props}
    />
  );
});
