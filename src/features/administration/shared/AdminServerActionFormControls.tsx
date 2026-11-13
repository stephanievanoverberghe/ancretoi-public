'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFormStatus } from 'react-dom';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/cn';
import { AdminSaveStatus, type AdminSaveState } from './AdminSaveStatus';

function snapshotForm(form: HTMLFormElement): string {
    const values: string[] = [];

    for (const [name, value] of new FormData(form).entries()) {
        const serializedValue = typeof value === 'string' ? value : `${value.name}:${value.size}:${value.lastModified}`;
        values.push(`${name}\u0000${serializedValue}`);
    }

    return values.join('\u0001');
}

function isSameDocumentAnchor(anchor: HTMLAnchorElement): boolean {
    try {
        const target = new URL(anchor.href, window.location.href);
        return target.origin === window.location.origin && target.pathname === window.location.pathname && target.search === window.location.search && Boolean(target.hash);
    } catch {
        return false;
    }
}

type BrowserNavigation = {
    currentEntry?: { index?: number };
};

function getCurrentHistoryIndex(): number | null {
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
    const index = navigation?.currentEntry?.index;
    return typeof index === 'number' ? index : null;
}

type AdminServerActionStatusProps = {
    className?: string;
    confirmMessage?: string;
};

export function AdminServerActionStatus({
    className,
    confirmMessage = 'Des modifications ne sont pas enregistrées. Veux-tu vraiment quitter cette page ?',
}: AdminServerActionStatusProps) {
    const { pending } = useFormStatus();
    const markerRef = useRef<HTMLSpanElement>(null);
    const baselineRef = useRef('');
    const submittedRef = useRef(false);
    const guardedHistoryIndexRef = useRef<number | null>(null);
    const restoringHistoryRef = useRef(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        const form = markerRef.current?.closest('form');
        if (!form) return;

        baselineRef.current = snapshotForm(form);

        const updateDirtyState = () => setDirty(snapshotForm(form) !== baselineRef.current);
        let resetFrame: number | null = null;
        const handleReset = () => {
            if (resetFrame !== null) window.cancelAnimationFrame(resetFrame);
            resetFrame = window.requestAnimationFrame(updateDirtyState);
        };

        form.addEventListener('input', updateDirtyState);
        form.addEventListener('change', updateDirtyState);
        form.addEventListener('reset', handleReset);

        return () => {
            if (resetFrame !== null) window.cancelAnimationFrame(resetFrame);
            form.removeEventListener('input', updateDirtyState);
            form.removeEventListener('change', updateDirtyState);
            form.removeEventListener('reset', handleReset);
        };
    }, []);

    useEffect(() => {
        if (pending) {
            submittedRef.current = true;
            return;
        }

        if (!submittedRef.current) return;

        const form = markerRef.current?.closest('form');
        if (form) baselineRef.current = snapshotForm(form);
        submittedRef.current = false;
        setDirty(false);
    }, [pending]);

    useEffect(() => {
        if (!dirty || pending) return;

        guardedHistoryIndexRef.current = getCurrentHistoryIndex();

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        const handleLinkClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const target = event.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest<HTMLAnchorElement>('a[href]');
            if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download') || isSameDocumentAnchor(anchor)) return;
            if (window.confirm(confirmMessage)) return;

            event.preventDefault();
            event.stopPropagation();
        };

        const handlePopState = (event: PopStateEvent) => {
            if (restoringHistoryRef.current) {
                restoringHistoryRef.current = false;
                guardedHistoryIndexRef.current = getCurrentHistoryIndex();
                event.stopImmediatePropagation();
                return;
            }

            const destinationIndex = getCurrentHistoryIndex();
            if (window.confirm(confirmMessage)) {
                guardedHistoryIndexRef.current = destinationIndex;
                return;
            }

            event.stopImmediatePropagation();
            const guardedIndex = guardedHistoryIndexRef.current;
            const restoreDelta = guardedIndex !== null && destinationIndex !== null
                ? guardedIndex - destinationIndex
                : 1;

            if (restoreDelta === 0) return;
            restoringHistoryRef.current = true;
            window.history.go(restoreDelta);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState, { capture: true });
        document.addEventListener('click', handleLinkClick, true);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState, { capture: true });
            document.removeEventListener('click', handleLinkClick, true);
        };
    }, [confirmMessage, dirty, pending]);

    const state: AdminSaveState = pending ? 'saving' : dirty ? 'dirty' : 'clean';

    return (
        <span ref={markerRef} className="shrink-0">
            <AdminSaveStatus state={state} className={className} />
        </span>
    );
}

type AdminServerSubmitButtonProps = {
    idleLabel: string;
    pendingLabel?: string;
    className?: string;
};

export function AdminServerSubmitButton({ idleLabel, pendingLabel = 'Enregistrement…', className }: AdminServerSubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70',
                className,
            )}
        >
            {pending && <LoaderCircle className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {pending ? pendingLabel : idleLabel}
        </button>
    );
}

export function useAdminFormFieldValues(
    fieldNames: readonly string[],
    initialValues: Readonly<Record<string, string>>,
): {
    markerRef: RefObject<HTMLDivElement | null>;
    values: Readonly<Record<string, string>>;
} {
    const markerRef = useRef<HTMLDivElement>(null);
    const initialRef = useRef<Record<string, string>>({ ...initialValues });
    const namesRef = useRef<string[]>([...fieldNames]);
    const [values, setValues] = useState<Record<string, string>>({ ...initialValues });
    initialRef.current = { ...initialValues };
    namesRef.current = [...fieldNames];

    useEffect(() => {
        const form = markerRef.current?.closest('form');
        if (!form) return;

        const readValues = () => {
            const nextValues: Record<string, string> = { ...initialRef.current };

            for (const name of namesRef.current) {
                const control = form.elements.namedItem(name);
                if (control instanceof RadioNodeList) nextValues[name] = control.value;
                else if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
                    nextValues[name] = control.value;
                }
            }

            setValues(nextValues);
        };

        readValues();
        form.addEventListener('input', readValues);
        form.addEventListener('change', readValues);
        let resetFrame: number | null = null;
        const handleReset = () => {
            if (resetFrame !== null) window.cancelAnimationFrame(resetFrame);
            resetFrame = window.requestAnimationFrame(readValues);
        };

        form.addEventListener('reset', handleReset);

        return () => {
            if (resetFrame !== null) window.cancelAnimationFrame(resetFrame);
            form.removeEventListener('input', readValues);
            form.removeEventListener('change', readValues);
            form.removeEventListener('reset', handleReset);
        };
    }, []);

    return { markerRef, values };
}
