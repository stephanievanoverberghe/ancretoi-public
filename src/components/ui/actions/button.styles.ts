import { cn } from '@/lib/cn';

export const buttonVariants = {
  primary: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary-hover',
  tertiary: 'border border-border bg-surface text-foreground shadow-soft hover:bg-surface-muted',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
  danger: 'bg-danger text-danger-foreground shadow-soft hover:bg-danger/90',
} as const;

export const buttonSizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const buttonBaseClassName =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

export function getButtonClassName({ variant = 'primary', size = 'md', className }: ButtonClassNameOptions = {}) {
  return cn(buttonBaseClassName, buttonVariants[variant], buttonSizes[size], className);
}
