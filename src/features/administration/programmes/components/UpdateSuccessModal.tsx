// src/features/administration/programmes/components/UpdateSuccessModal.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAdminModalA11y } from '@/features/administration/shared/useAdminModalA11y';

export default function UpdateSuccessModal() {
    const search = useSearchParams();
    const router = useRouter();

    const show = search.get('updated') === '1';
    const slug = (search.get('slug') ?? '').trim().toLowerCase();

    const [open, setOpen] = useState(show);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setOpen(show), [show]);
    useEffect(() => setMounted(true), []);

    const onClose = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('updated');
        url.searchParams.delete('slug');
        router.replace(url.pathname + (url.search || ''));
        setOpen(false);
        router.push('/administration/programmes');
    }, [router]);

    const { dialogRef, titleId, descriptionId } = useAdminModalA11y({ open: open && mounted, onClose });

    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1100]">
            <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    ref={dialogRef}
                    className="w-full max-w-md rounded-2xl bg-surface p-5 text-foreground shadow-xl ring-1 ring-border"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    tabIndex={-1}
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
                        <div>
                            <div id={titleId} className="text-lg font-semibold">
                                Modifications enregistrées
                            </div>
                            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                                Le programme <span className="font-medium">{slug || '—'}</span> a été mis à jour avec succès.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                        <button type="button" onClick={onClose} aria-label="Fermer la confirmation de mise à jour" className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
