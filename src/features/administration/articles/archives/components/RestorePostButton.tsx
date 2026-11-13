// src/features/administration/articles/archives/components/RestorePostButton.tsx
'use client';

import { useTransition } from 'react';
import { RotateCcw } from 'lucide-react';

export default function RestorePostButton({ id, slug }: { id: string; slug: string }) {
    const [pending, start] = useTransition();

    return (
        <button
            disabled={pending}
            onClick={() =>
                start(async () => {
                    const r = await fetch('/api/admin/blog/posts/archives', {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ action: 'restore', id, slug }),
                    });
                    const data = await r.json().catch(() => ({}));
                    if (!r.ok || !data?.ok) {
                        alert(data?.error || `HTTP ${r.status}`);
                        return;
                    }
                    // Slug possiblement modifié lors de la restauration
                    location.href = `/administration/articles/${data.slug}/modifier`;
                })
            }
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
        >
            <RotateCcw className="h-4 w-4" />
            {pending ? 'Restauration…' : 'Restaurer'}
        </button>
    );
}
