'use client';

import { useId, useState, type PropsWithChildren } from 'react';
import { FullscreenModal } from '@/components/ui/overlays';

type Variant = 'danger' | 'warn' | 'neutral' | 'success';

type Props = {
    action: (formData: FormData) => Promise<void>; // server action
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
    buttonLabel?: string; // libellé du bouton qui ouvre la modale (par défaut = title)
    buttonClassName?: string; // classes du bouton d’ouverture
    requireText?: string; // ex: "SUPPRIMER" pour forcer une saisie
    esc?: boolean; // override esc close (default true)
    backdrop?: boolean; // override backdrop close (default true)
    compact?: boolean; // bouton d’ouverture plus compact
};

const palette: Record<Variant, { open: string; confirm: string; accent: string }> = {
    danger: { open: 'border-danger bg-danger text-danger-foreground hover:bg-danger/90', confirm: 'bg-danger text-danger-foreground hover:bg-danger/90', accent: 'text-danger' },
    warn: { open: 'bg-warning text-warning-foreground hover:bg-warning/90', confirm: 'bg-warning text-warning-foreground hover:bg-warning/90', accent: 'text-warning' },
    success: { open: 'bg-success text-success-foreground hover:bg-success/90', confirm: 'bg-success text-success-foreground hover:bg-success/90', accent: 'text-success' },
    neutral: { open: 'border border-border bg-surface text-foreground hover:bg-surface-muted', confirm: 'bg-primary text-primary-foreground hover:bg-primary-hover', accent: 'text-primary' },
};

export default function ConfirmAction({
    action,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'neutral',
    buttonLabel,
    buttonClassName,
    requireText,
    esc = true,
    backdrop = true,
    compact,
    children, // hidden inputs (id, etc.)
}: PropsWithChildren<Props>) {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const confirmationInputId = useId();
    const ui = palette[variant];
    const closeModal = () => {
        setOpen(false);
        setTyped('');
    };

    return (
        <>
            {/* Bouton d’ouverture */}
            <button
                type="button"
                onClick={() => {
                    setTyped('');
                    setOpen(true);
                }}
                className={[
                    'cursor-pointer rounded-xl font-semibold motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                    compact ? 'px-3 py-2 text-sm' : 'w-full px-4 py-2.5 text-sm',
                    ui.open,
                    buttonClassName || '',
                ].join(' ')}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                {buttonLabel || title}
            </button>

            {/* Modale plein écran */}
            <FullscreenModal open={open} onClose={closeModal} title={title} closeOnBackdrop={backdrop} closeOnEsc={esc}>
                {/* Contenu */}
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-surface-muted ${ui.accent}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-foreground">{message}</p>

                        {requireText && (
                            <div className="mt-4">
                                <label htmlFor={confirmationInputId} className="mb-1 block text-xs text-muted-foreground">
                                    Pour confirmer, tapez&nbsp;
                                    <span className="font-semibold text-foreground">{requireText}</span>
                                </label>
                                <input
                                    id={confirmationInputId}
                                    value={typed}
                                    onChange={(e) => setTyped(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                                    placeholder={requireText}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer d’actions */}
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button type="button" onClick={closeModal} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        {cancelLabel}
                    </button>

                    <form
                        action={async (fd) => {
                            if (requireText && typed !== requireText) return;
                            await action(fd);
                            closeModal();
                        }}
                    >
                        {children}
                        {requireText ? <input type="hidden" name="confirmation" value={typed} /> : null}
                        <button
                            type="submit"
                            disabled={!!requireText && typed !== requireText}
                            className={['rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30', ui.confirm, requireText && typed !== requireText ? 'opacity-60 cursor-not-allowed' : ''].join(
                                ' '
                            )}
                        >
                            {confirmLabel}
                        </button>
                    </form>
                </div>
            </FullscreenModal>
        </>
    );
}
