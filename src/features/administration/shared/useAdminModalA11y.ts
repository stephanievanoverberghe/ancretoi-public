'use client';

import { useEffect, useId, useRef } from 'react';

type UseAdminModalA11yOptions = {
    open: boolean;
    onClose: () => void;
};

const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));
}

export function useAdminModalA11y({ open, onClose }: UseAdminModalA11yOptions) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        window.setTimeout(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;

            const firstFocusable = getFocusableElements(dialog)[0];
            (firstFocusable ?? dialog).focus({ preventScroll: true });
        }, 0);

        const onKeyDown = (event: KeyboardEvent) => {
            const dialog = dialogRef.current;
            const activeDialog = document.activeElement instanceof HTMLElement ? document.activeElement.closest('[role="dialog"]') : null;

            if (dialog && activeDialog instanceof HTMLElement && activeDialog !== dialog && !dialog.contains(activeDialog)) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab') return;

            if (!dialog) return;

            const focusableElements = getFocusableElements(dialog);
            if (focusableElements.length === 0) {
                event.preventDefault();
                dialog.focus({ preventScroll: true });
                return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus({ preventScroll: true });
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus({ preventScroll: true });
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocusRef.current?.focus({ preventScroll: true });
        };
    }, [open, onClose]);

    return { dialogRef, titleId, descriptionId };
}
