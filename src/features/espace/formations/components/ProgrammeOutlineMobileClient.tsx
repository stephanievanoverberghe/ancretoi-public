'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ListChecks, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

import { learnerPortalSafeAreaStyle } from '@/components/layout/app/learner-shell.constants';

type ProgrammeOutlineMobileClientProps = {
  activeLabel: string;
  children: ReactNode;
  percent: number;
  programName: string;
};

export function ProgrammeOutlineMobileClient({
  activeLabel,
  children,
  percent,
  programName,
}: ProgrammeOutlineMobileClientProps) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setOpen(false);
    };

    closeOnDesktop();
    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  function closeAfterNavigation(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('a[href]')) setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="sticky top-[4.5rem] z-30 xl:hidden">
        <DialogPrimitive.Trigger asChild>
          <button
            type="button"
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface/95 px-3 py-2 text-left shadow-soft backdrop-blur transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
              <ListChecks className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {programName} · {percent}%
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">{activeLabel}</span>
            </span>
            <span className="text-xs font-semibold text-primary">Parcours</span>
          </button>
        </DialogPrimitive.Trigger>
      </div>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/45 backdrop-blur-[2px] xl:hidden" />
        <DialogPrimitive.Content
          aria-describedby={descriptionId}
          style={learnerPortalSafeAreaStyle}
          className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] flex max-h-[85dvh] flex-col rounded-t-[2rem] border border-b-0 border-border bg-surface px-5 pb-[calc(1rem+var(--learner-safe-area-bottom))] pt-3 text-foreground shadow-elevated outline-none xl:hidden"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="font-serif text-2xl font-semibold leading-tight text-foreground">
                {programName}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                Avance une journée à la fois. Les étapes suivantes s’ouvrent après validation.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Fermer le parcours"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col" onClickCapture={closeAfterNavigation}>
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type { ProgrammeOutlineMobileClientProps };
