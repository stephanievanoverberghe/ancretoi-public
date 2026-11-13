// src/features/administration/inspirations/archives/components/RestoreInspirationButton.tsx
'use client';

import { useTransition } from 'react';
import { RotateCcw } from 'lucide-react';

export default function RestoreInspirationButton({ slug }: { slug: string }) {
    const [pending, start] = useTransition();

    return (
        <button
            disabled={pending}
            onClick={() =>
                start(async () => {
                    const r = await fetch(`/api/admin/inspirations?slug=${encodeURIComponent(slug)}&action=restore`, { method: 'PATCH' });
                    const data = await r.json();
                    if (!r.ok || !data?.ok) {
                        alert(data?.error || `HTTP ${r.status}`);
                        return;
                    }
                    // redirection vers le slug restauré (potentiellement modifié)
                    location.href = `/administration/inspirations/${data.slug}/modifier`;
                })
            }
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
        >
            <RotateCcw className="h-4 w-4" />
            {pending ? 'Restauration…' : 'Restaurer'}
        </button>
    );
}
