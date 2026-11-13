import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { getButtonClassName, type ButtonSize, type ButtonVariant } from './button.styles';

export type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

/**
 * Lien Next.js presente comme un bouton.
 * `disabled` bloque le clic et retire le lien du tab order sans changer la route cible.
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  tabIndex,
  children,
  ...props
}: LinkButtonProps) {
  const linkClassName = getButtonClassName({
    variant,
    size,
    className: cn(className, disabled && 'pointer-events-none opacity-50'),
  });
  const content = (
    <>
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {rightIcon}
        </span>
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <span className={linkClassName} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link
      className={linkClassName}
      tabIndex={tabIndex}
      onClick={onClick}
      {...props}
    >
      {content}
    </Link>
  );
}
