import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { getButtonClassName, type ButtonSize, type ButtonVariant } from './button.styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Bouton d'action server-safe pour les surfaces UI.
 * L'etat `loading` desactive le bouton, expose `aria-busy` et garde un libelle lecteur d'ecran.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Chargement',
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}, ref) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      className={getButtonClassName({ variant, size, className })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className={cn('h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent', size === 'lg' && 'h-5 w-5')}
        />
      ) : (
        leftIcon && (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {rightIcon && !loading && (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {rightIcon}
        </span>
      )}
      {loading && <span className="sr-only">{loadingLabel}</span>}
    </button>
  );
});
