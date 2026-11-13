import { Search } from 'lucide-react';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { getControlClassName, isAriaInvalid } from './form.styles';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, invalid = false, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const isInvalid = isAriaInvalid(ariaInvalid, invalid);

  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={ref}
        type="search"
        aria-invalid={isInvalid ? true : ariaInvalid}
        className={cn(getControlClassName('h-11 px-3 py-2 pl-10', isInvalid), className)}
        {...props}
      />
    </div>
  );
});
