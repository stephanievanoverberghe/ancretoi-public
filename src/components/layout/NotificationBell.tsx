'use client';

import { Bell } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

type NotificationBellProps = {
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  className?: string;
};

export function NotificationBell({ label, emptyTitle, emptyDescription, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
      </Button>

      {open ? (
        <div
          id={panelId}
          role="status"
          className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-border bg-surface p-4 text-left shadow-elevated"
        >
          <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{emptyDescription}</p>
        </div>
      ) : null}
    </div>
  );
}
