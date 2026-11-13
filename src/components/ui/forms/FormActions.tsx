import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type FormActionsAlignment = 'start' | 'end' | 'between';

const alignmentClassNames = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
} as const;

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  align?: FormActionsAlignment;
}

export function FormActions({ align = 'end', className, ...props }: FormActionsProps) {
  return <div className={cn('flex flex-col-reverse gap-3 sm:flex-row sm:items-center', alignmentClassNames[align], className)} {...props} />;
}
