import { cn } from '@/lib/cn';

const controlBaseClassName =
  'w-full rounded-md border border-input bg-surface text-sm text-foreground shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70';

export function getControlClassName(className?: string, invalid = false) {
  return cn(controlBaseClassName, invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20', className);
}

export function isAriaInvalid(value: unknown, invalid = false) {
  return invalid || value === true || value === 'true';
}
