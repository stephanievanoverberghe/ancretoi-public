'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type FullscreenModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  zIndex?: number;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  /** Affiche le bouton de fermeture dans l'en-tête (défaut : true). */
  showCloseButton?: boolean;
};

/**
 * Modale client-only avec focus trap, retour du focus, verrouillage du scroll
 * et gestion clavier fournis par Radix Dialog.
 */
export default function FullscreenModal({
  open,
  onClose,
  title,
  children,
  footer,
  zIndex,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
}: FullscreenModalProps) {
  const customLayer = zIndex === undefined ? undefined : ({ zIndex } satisfies CSSProperties);
  const hasHeader = Boolean(title) || showCloseButton;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn('fixed inset-0 bg-overlay backdrop-blur-sm', zIndex === undefined && 'z-[var(--z-overlay)]')}
          style={customLayer}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed bottom-3 left-1/2 flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-elevated outline-none',
            'sm:bottom-auto sm:top-1/2 sm:max-h-[calc(100dvh-3rem)] sm:-translate-y-1/2',
            zIndex === undefined && 'z-[var(--z-modal)]',
          )}
          style={customLayer}
          onEscapeKeyDown={(event) => {
            if (!closeOnEsc) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (!closeOnBackdrop) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!closeOnBackdrop) event.preventDefault();
          }}
        >
          {hasHeader ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5 sm:px-6">
              <DialogPrimitive.Title className={cn('min-w-0 truncate font-display text-lg font-semibold leading-tight', !title && 'sr-only')}>
                {title ?? 'Fenêtre de dialogue'}
              </DialogPrimitive.Title>
              {showCloseButton ? (
                <DialogPrimitive.Close asChild>
                  <button
                    type="button"
                    aria-label="Fermer"
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DialogPrimitive.Close>
              ) : null}
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Fenêtre de dialogue</DialogPrimitive.Title>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
          {footer ? (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface px-5 py-3.5 sm:px-6">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
