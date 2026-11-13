'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = { dateISO: string; active: boolean };
type LoadState = 'loading' | 'ready' | 'error';

function isRow(value: unknown): value is Row {
    if (!value || typeof value !== 'object') return false;

    const row = value as Partial<Row>;
    return typeof row.dateISO === 'string' && typeof row.active === 'boolean';
}

export function StreakHeatmapClient({
    days = 30,
    size = 12,
}: {
    days?: number;
    size?: number;
}) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loadState, setLoadState] = useState<LoadState>('loading');

    useEffect(() => {
        let cancelled = false;

        async function loadActivity() {
            try {
                const response = await fetch('/api/me/streak', { cache: 'no-store' });
                const payload: unknown = await response.json();

                if (!response.ok || !payload || typeof payload !== 'object') {
                    throw new Error('Réponse indisponible');
                }

                const payloadRows = (payload as { rows?: unknown }).rows;
                if (!Array.isArray(payloadRows)) throw new Error('Format invalide');
                if (cancelled) return;

                setRows(payloadRows.filter(isRow));
                setLoadState('ready');
            } catch {
                if (cancelled) return;
                setRows([]);
                setLoadState('error');
            }
        }

        void loadActivity();

        return () => {
            cancelled = true;
        };
    }, []);

    const recent = useMemo(() => rows.slice(-days), [rows, days]);

    if (loadState === 'loading') {
        return <p role="status" className="text-sm text-muted-foreground">Chargement de l’activité…</p>;
    }

    if (loadState === 'error') {
        return (
            <p role="status" className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
                L’activité n’est pas disponible pour le moment.
            </p>
        );
    }

    if (recent.length === 0) {
        return <p className="text-sm text-muted-foreground">Aucune activité enregistrée pour le moment.</p>;
    }

    return (
        <div
            className="flex flex-wrap gap-1"
            aria-label={`Activité réelle des ${Math.min(days, recent.length)} derniers jours`}
        >
            {recent.map((row) => (
                <span
                    key={row.dateISO}
                    title={`${row.dateISO} — ${row.active ? 'actif' : 'inactif'}`}
                    className={[
                        'rounded-[3px] ring-1 ring-border',
                        row.active ? 'bg-primary' : 'bg-surface-muted',
                    ].join(' ')}
                    style={{ width: size, height: size }}
                    aria-label={`${row.dateISO} ${row.active ? 'actif' : 'inactif'}`}
                    role="img"
                />
            ))}
        </div>
    );
}
